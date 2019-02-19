/**
 * Web scraping related utility methods.
 */

const request = require('request-promise');
const cheerio = require('cheerio');

/**
 * Returns distro-specific DistroWatch page.
 * @param {string} distro The url-friendly name of the distro.
 */
const getDistroUrl = distro => {
  return `https://distrowatch.com/table.php?distribution=${distro}`;
};

/**
 * Returns the url of the logo of given distro from public dir.
 * Append timestamp to get around unwanted cache!
 * @param {string} distro The url-friendly name of the distro.
 */
const getLogoUrl = distro => {
  const timestamp = new Date().getTime().toString();
  return `${process.env.APP_URL}/public/logos/${distro}.jpg?t=${timestamp}`;
};

/**
 * Returns popularity info of the given distro.
 * @param {object} distroObj The distro object that contains distro_name and url_name fields.
 * @returns {Promise<Object>} Popularity info of the given distro.
 */
const getDistroPopularity = distroObj => {
  console.log(`Scraping DW for ${distroObj.url_name}`);
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
        // Extract necessary info.
        let dataStr = data.text();

        let endingDelimeter = '';
        if (dataStr.indexOf('Average') !== -1) {
          endingDelimeter = 'Average';
        } else {
          endingDelimeter = 'Visitor';
        }

        dataStr = dataStr.substring(
          dataStr.lastIndexOf('Popularity'),
          dataStr.lastIndexOf(endingDelimeter)
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
        console.log(
          `Error while fetching details about ${distroObj.url_name}: ${err}`
        );
        // Resolve with null popularity object instead of rejecting!
        resolve({
          distro: {
            ...distroObj
          },
          popularity: null
        });
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
