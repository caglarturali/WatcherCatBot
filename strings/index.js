/**
 * Translated strings.
 */

// Message code constants for messages.
exports.MESSAGE = 'MESSAGE';
exports.START_TYPING = 'START_TYPING';
exports.NO_RESULT = 'NO_RESULT';
exports.POPULARITY = 'POPULARITY';
exports.POPULARITY_SHORT = 'POPULARITY_SHORT';
exports.HITS = 'HITS';
exports.HITS_SHORT = 'HITS_SHORT';
exports.MONTHS12 = 'MONTHS12';
exports.MONTHS6 = 'MONTHS6';
exports.MONTHS3 = 'MONTHS3';
exports.WEEKS4 = 'WEEKS4';
exports.WEEKS1 = 'WEEKS1';
exports.MORE = 'MORE';

/**
 * Returns translated text based on user language.
 * @param {object} chatObj Chat object that contains the language code of the user.
 * @param {string} msgCode Message code constant.
 */
exports.t = (chatObj, msgCode) => {
  const langCode = chatObj.from.language_code;

  if (strings.hasOwnProperty(langCode)) {
    return strings[langCode][msgCode];
  }
  // Fallback to en.
  return strings['en'][msgCode];
};

const strings = {
  tr: {
    MESSAGE:
      'Mesajınızı aldım ama ben bir satır içi botum. ' +
      'Yani, herhangi bir sohbette ismimi yazarsanız ' +
      'sizin için birşeyler yapmaya çalışırım.',
    START_TYPING: 'Dağıtımın adını yazmaya başlayın...',
    NO_RESULT: 'Aradığınız dağıtımı bulamadım!',
    POPULARITY: 'Rağbet oranı',
    POPULARITY_SHORT: 'Sıra',
    HITS: 'Günlük ziyaret',
    HITS_SHORT: 'Hit',
    MONTHS12: '12 ay',
    MONTHS6: '6 ay',
    MONTHS3: '3 ay',
    WEEKS4: '4 ha',
    WEEKS1: '1 ha',
    MORE: 'Dağıtımın DistroWatch sayfasını aç.'
  },
  en: {
    MESSAGE:
      "I have received your message, but I'm an inline bot. " +
      'So, you better start typing by my name in any chat and ' +
      'I will try to respond with a reasonable reply.',
    START_TYPING: 'Start typing the distro name...',
    NO_RESULT: "I can't find the distro you're looking for!",
    POPULARITY: 'Popularity',
    POPULARITY_SHORT: 'Rank',
    HITS: 'Hits per day',
    HITS_SHORT: 'Hits',
    MONTHS12: '12 mo',
    MONTHS6: '6 mo',
    MONTHS3: '3 mo',
    WEEKS4: '4 we',
    WEEKS1: '1 we',
    MORE: 'View on DistroWatch.'
  }
};
