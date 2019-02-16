const request = require('request-promise');
const cheerio = require('cheerio');

/**
 * Returns distro-specific DistroWatch page.
 * @param {string} distro The url-friendly name of the distro.
 */
const getDistroUrl = distro =>
  `https://distrowatch.com/table.php?distribution=${distro}`;

/**
 * Returns the url of the logo of given distro.
 * @param {string} distro The url-friendly name of the distro.
 */
const getLogoUrl = distro =>
  `https://distrowatch.com/images/yvzhuwbpy/${distro}.png`;

/**
 * Returns popularity info of the given distro.
 * @param {object} distroObj The distro object that contains distro_name and url_name fields.
 * @returns {Promise<Object>} Popularity info of the given distro.
 */
const getDistroPopularity = distroObj => {
  return new Promise((resolve, reject) => {
    // Request-promise options.
    const options = {
      uri: getDistroUrl(distroObj.url_name),
      transform: function(body) {
        return cheerio.load(body);
      }
    };

    const keys = {
      '12months': '12 months:',
      '6months': '6 months:',
      '3months': '3 months:',
      '4weeks': '4 weeks:',
      '1week': '1 week:'
    };

    request(options)
      .then($ => {
        // Get distro data.
        return $('.TablesTitle')
          .parent()
          .children();
      })
      .then(data => {
        let dataStr = data.text();
        dataStr = dataStr.substring(
          dataStr.lastIndexOf('Popularity'),
          dataStr.lastIndexOf('Average')
        );
        dataStr = dataStr.substring(dataStr.indexOf(keys['12months']));
        const result = {
          distro: {
            ...distroObj
          },
          popularity: {
            '12months': getDataBetween(
              dataStr,
              keys['12months'],
              keys['6months']
            ),
            '6months': getDataBetween(
              dataStr,
              keys['6months'],
              keys['3months']
            ),
            '3months': getDataBetween(dataStr, keys['3months'], keys['4weeks']),
            '4weeks': getDataBetween(dataStr, keys['4weeks'], keys['1week']),
            '1week': getDataBetween(dataStr, keys['1week'])
          }
        };
        resolve(result);
      })
      .catch(err => {
        reject(new Error(err));
      });

    const getDataBetween = (rawData, startFrom, endWith) => {
      let resultStr;
      let resultObj = {};
      if (endWith) {
        resultStr = rawData.substring(
          rawData.indexOf(startFrom) + startFrom.length,
          rawData.indexOf(endWith)
        );
      } else {
        resultStr = rawData.substring(
          rawData.indexOf(startFrom) + startFrom.length
        );
      }
      resultStr = resultStr.substring(0, resultStr.lastIndexOf(')') + 1).trim();
      let resultArr = resultStr.split(' ');
      resultObj = {
        rank: resultArr[0].trim(),
        hits: resultArr[1].substring(
          resultArr[1].indexOf('(') + 1,
          resultArr[1].indexOf(')')
        )
      };
      return resultObj;
    };
  });
};

module.exports = {
  getDistroUrl,
  getLogoUrl,
  getDistroPopularity
};
