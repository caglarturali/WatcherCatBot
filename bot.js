require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const distrosData = require('./data/distros.json');
const scrape = require('./utils/scrape');
const respond = require('./utils/respond');
const strings = require('./strings');

const TOKEN = process.env.TELEGRAM_TOKEN;
const URL = process.env.APP_URL;

const app = express();
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${URL}/bot${TOKEN}`);

// Parse the updates to JSON.
app.use(bodyParser.json());

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Redirect all other requests to homepage of the bot.
app.get('/*', (req, res) => {
  res.redirect('https://t.me/WatcherCatBot');
});

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
    // Look for matches in both friendly name and url name.
    const currentDistroName = distroData.distro_name.toLowerCase();
    const currentDistroUrlName = distroData.url_name.toLowerCase();
    const queryDistro = query.query.toLowerCase();

    return (
      currentDistroName.indexOf(queryDistro) >= 0 ||
      currentDistroUrlName.indexOf(queryDistro) >= 0
    );
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

module.exports = app;
