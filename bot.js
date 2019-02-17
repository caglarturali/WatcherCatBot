require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const distrosData = require('./data/distros.json');
const scrape = require('./utils/scrape');
const respond = require('./utils/respond');
const strings = require('./strings');

const token = process.env.TELEGRAM_TOKEN;

// Create a bot that uses 'polling' to fetch new updates.
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message.
bot.on('message', msg => {
  const chatId = msg.chat.id;

  // Send a generic message to the chat acknowledging receipt of their message.
  bot.sendMessage(chatId, strings.t(msg, strings.MESSAGE));
});

let pendingQueries = [];

bot.on('inline_query', query => {
  // Prompt user to start typing.
  if (query.query === '') {
    return respond.sendStaticResponse(
      bot,
      query,
      '(^-^)',
      strings.START_TYPING
    );
  }

  // Find matching distros.
  let matches = distrosData.filter(distroData => {
    return distroData.distro_name
      .toLowerCase()
      .includes(query.query.toLowerCase());
  });
  if (matches.length > 10) {
    matches.length = 10;
  }

  // Add maches to pending promises array and start fetching.
  pendingQueries = [];
  if (matches.length > 0) {
    matches.forEach(match => {
      pendingQueries.push(scrape.getDistroPopularity(match));
    });

    Promise.all(pendingQueries)
      .then(results => respond.formatAndSendQueryResults(bot, query, results))
      .catch(e => {
        console.log(e.message);
        respond.sendStaticResponse(bot, query, '(-.-)', strings.NO_RESULT);
      });
  } else {
    respond.sendStaticResponse(bot, query, '(-.-)', strings.NO_RESULT);
  }
});

bot.on('polling_error', error => {
  console.log('Polling error:', error.code);
});
