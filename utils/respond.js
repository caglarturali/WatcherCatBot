const uuid = require('uuid/v4');
const scrape = require('./scrape');
const formatters = require('./formatters');
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

  // Remove elements that do not contain popularity object.
  results = results.filter(distroData => distroData.popularity !== null);

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
          description: formatters.buildDescription(
            query,
            distroData.popularity
          ),
          thumb_url: scrape.getLogoUrl(distroData.distro.url_name),
          input_message_content: {
            message_text: formatters.buildMessageText(query, distroData),
            parse_mode: 'Markdown',
            disable_web_page_preview: true
          }
        };
      },
      { cache_time: 60 }
    )
  );
};

module.exports = {
  sendStaticResponse,
  formatAndSendQueryResults
};
