require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const distrosData = require('./data/distros.json');
const scrape = require('./utils/scrape');
const respond = require('./utils/respond');

const token = process.env.TELEGRAM_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message.
bot.on('message', msg => {
  const chatId = msg.chat.id;

  // Send a message to the chat acknowledging receipt of their message
  bot.sendMessage(
    chatId,
    "I have received your message, but I'm an inline bot. " +
      'So, you better start typing by my name in any chat and ' +
      'I will try to respond with a reasonable reply.'
  );
});

let pendingQueries = [];

bot.on('inline_query', query => {
  console.log(query);

  if (query.query === '') {
    return respond.sendStaticResponse(bot, query);
  }

  let matches = distrosData.filter(distroData => {
    return distroData.distro_name
      .toLowerCase()
      .includes(query.query.toLowerCase());
  });

  if (matches.length > 10) {
    matches.length = 10;
  }

  pendingQueries = [];
  if (matches.length > 0) {
    matches.forEach(match => {
      pendingQueries.push(scrape.getDistroPopularity(match));
    });

    Promise.all(pendingQueries)
      .then(results => respond.formatAndSendQueryResults(bot, query, results))
      .catch(e => {
        console.log(e.message);
        respond.sendStaticResponse(bot, query);
      });
  } else {
    respond.sendStaticResponse(bot, query);
  }
});

bot.on('polling_error', error => {
  console.log('Polling error:', error.code);
});
