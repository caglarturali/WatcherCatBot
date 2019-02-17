const path = require('path');
const fs = require('fs-extra');
const uuid = require('uuid/v4');
const scrape = require('./scrape');
const strings = require('../strings');

/**
 * Responds with a static message of type article.
 * @param {object} bot Telegram bot instance.
 * @param {object} query Query object.
 * @param {string} title Title to display.
 * @param {msgCode} msgCode Message code constant.
 */
const sendStaticResponse = (bot, query, title, msgCode) => {
  bot.answerInlineQuery(query.id, [
    {
      type: 'article',
      id: uuid(),
      title: title,
      description: strings.t(query, msgCode),
      input_message_content: {
        message_text: strings.t(query, msgCode),
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      }
    }
  ]);
};

/**
 * Returns formatted response to inline queries.
 * @param {object} bot Telegram bot instance.
 * @param {object} query Query object.
 * @param {Array<object>} results Array of popularity objects.
 */
const formatAndSendQueryResults = (bot, query, results) => {
  // Sort by last 6 months' popularity data.
  results.sort((a, b) => {
    return a.popularity['6months'].rank - b.popularity['6months'].rank;
  });

  bot.answerInlineQuery(
    query.id,
    results.map(
      distroData => {
        const resultId = uuid();

        return {
          type: 'article',
          id: resultId,
          title: distroData.distro.distro_name,
          url: scrape.getDistroUrl(distroData.distro.url_name),
          hide_url: true,
          description: buildDescription(query, distroData.popularity),
          thumb_url: scrape.getLogoUrl(distroData.distro.url_name),
          input_message_content: {
            message_text: buildMessageText(query, distroData),
            parse_mode: 'Markdown',
            disable_web_page_preview: true
          }
        };
      },
      { cache_time: 0 }
    )
  );
};

/**
 * Builds short description based on popularity data.
 * @param {object} query Query object.
 * @param {object} popularity An object containing popularity data.
 * @returns {string} Short description.
 */
const buildDescription = (query, popularity) => {
  let str = '';
  str += strings.t(query, strings.POPULARITY) + ': ';
  str += popularity['6months'].rank + '\n';
  str += strings.t(query, strings.HITS) + ': ';
  str += popularity['6months'].hits + '\n';
  return str;
};

/**
 * Returns Markdown formatted message text.
 * @param {object} query Query object.
 * @param {object} distroData Distro's popularity data.
 * @returns {string} Formatted message text.
 */
const buildMessageText = (query, distroData) => {
  let str = '';
  str += `*${distroData.distro.distro_name}*\n\n`;

  const scopes = ['MONTHS12', 'MONTHS6', 'MONTHS3', 'WEEKS4', 'WEEKS1'];
  const dataKeys = ['12months', '6months', '3months', '4weeks', '1week'];

  // Build content.
  for (let i = 0; i < scopes.length; i++) {
    str += `_${strings.t(query, strings[scopes[i]])}:_\n`;
    str += `${strings.t(query, strings.POPULARITY)}: `;
    str += `*${distroData.popularity[dataKeys[i]].rank}* - `;
    str += `${strings.t(query, strings.HITS)}: `;
    str += `*${distroData.popularity[dataKeys[i]].hits}* \n\n`;
  }

  str += `[${strings.t(query, strings.MORE)}](${scrape.getDistroUrl(
    distroData.distro.url_name
  )})\n`;
  str += 'Powered by [Deepin Turkey](https://t.me/deepintr).';
  return str;
};

module.exports = {
  sendStaticResponse,
  formatAndSendQueryResults
};
