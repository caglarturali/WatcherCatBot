const uuid = require('uuid/v4');
const scrape = require('./scrape');

/**
 * Responds with a static message of type article.
 * @param {object} bot Telegram bot instance.
 * @param {*} query Query object.
 */
const sendStaticResponse = (bot, query) => {
  bot.answerInlineQuery(query.id, [
    {
      type: 'article',
      id: uuid(),
      title: ':(',
      description: "I can't find the distro you're looking for!",
      input_message_content: {
        message_text: "I can't find the distro you're looking for!",
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
 * @param {Array<InlineQueryResult>} results Array of InlineQueryResults.
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
          description:
            distroData.popularity['6months'].rank +
            '\n' +
            distroData.popularity['6months'].hits,
          thumb_url: scrape.getLogoUrl(distroData.distro.url_name),
          input_message_content: {
            message_text: JSON.stringify(distroData.popularity),
            parse_mode: 'Markdown',
            disable_web_page_preview: false
          }
        };
      },
      { cache_time: 30 }
    )
  );
};

module.exports = {
  sendStaticResponse,
  formatAndSendQueryResults
};
