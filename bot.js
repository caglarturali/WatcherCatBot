require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const uuid = require('uuid/v4');
const distrosData = require('./data/distros.json');
const utils = require('./utils');

const token = process.env.TELEGRAM_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
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
    return;
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
      pendingQueries.push(utils.getDistroPopularity(match));
    });

    Promise.all(pendingQueries).then(values => {
      bot.answerInlineQuery(
        query.id,
        values.map(distroData => ({
          type: 'article',
          id: uuid(),
          title: distroData.distro.distro_name,
          url: utils.getDistroUrl(distroData.distro.url_name),
          hide_url: true,
          description: distroData.popularity['6months'].rank,
          thumb_url: utils.getLogoUrl(distroData.distro.url_name),
          input_message_content: {
            message_text: JSON.stringify(distroData.popularity),
            parse_mode: 'Markdown',
            disable_web_page_preview: false
          }
        })),
        { cache_time: 30 }
      );
    });
  } else {
    bot.sendMessage(query.id, [
      {
        type: 'article',
        id: uuid(),
        thumb_url: '',
        title: ':(',
        input_message_content: {
          message_text: "I can't find the distro you're looking for",
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        }
      }
    ]);
  }
});

bot.on('polling_error', error => {
  console.log('Polling error:', error.code);
});
