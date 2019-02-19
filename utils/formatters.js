const strings = require('../strings');

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
  const CONTENT_WIDTH = 23;
  const CELL_WIDTH = 7;
  const OUTER_DIVIDER = '+-----------------------+';
  const INNER_DIVIDER = '\n+-------+-------+-------+\n';

  const paddedString = (str, pre, post) => {
    let prePad = '',
      postPad = '';
    for (let i = 0; i < pre; i++) prePad += ' ';
    for (let i = 0; i < post; i++) postPad += ' ';
    return `${prePad}${str}${postPad}`;
  };

  const centeredText = str => {
    const strLength = str.length;
    const padLeft = Math.floor((CONTENT_WIDTH - strLength) / 2);
    const padRight = CONTENT_WIDTH - strLength - padLeft;
    return `|${paddedString(str, padLeft, padRight)}|`;
  };

  const buildCell = (str = null, isLast = false) => {
    let result = !str ? '|' : `| ${str}`;
    while (result.length <= CELL_WIDTH) result += ' ';
    if (isLast) return result + '|';
    return result;
  };

  // Title bar.
  let output =
    OUTER_DIVIDER +
    '\n' +
    centeredText(distroData.distro.distro_name) +
    INNER_DIVIDER;

  // Section headings.
  output +=
    buildCell() +
    buildCell(strings.t(query, strings.POPULARITY_SHORT)) +
    buildCell(strings.t(query, strings.HITS_SHORT), true) +
    INNER_DIVIDER;

  // Build content.
  const scopes = ['MONTHS12', 'MONTHS6', 'MONTHS3', 'WEEKS4', 'WEEKS1'];
  const dataKeys = ['12months', '6months', '3months', '4weeks', '1week'];

  for (let i = 0; i < scopes.length; i++) {
    output +=
      buildCell(strings.t(query, strings[scopes[i]])) +
      buildCell(distroData.popularity[dataKeys[i]].rank) +
      buildCell(distroData.popularity[dataKeys[i]].hits, true) +
      INNER_DIVIDER;
  }

  // Last line.
  const infoLineStr = 't.me/deepintr';
  output += centeredText(infoLineStr) + '\n' + OUTER_DIVIDER;

  return '```' + output + '```';
};

module.exports = {
  buildDescription,
  buildMessageText
};
