/**
 * Downloads and saves distro logos as jpg.
 */

const fs = require('fs');
const path = require('path');
const request = require('request-promise');
const sharp = require('sharp');
const distros = require('../data/distros.json');

/**
 * Downloads the image from given url and converts it to jpg.
 * @param {string} url_name Url of the logo
 * @returns {Promise<object>} Promise containing converted image url_name and buffer.
 */
const downloadAndConvertImage = url_name => {
  return new Promise((resolve, reject) => {
    const logoUrl = `https://distrowatch.com/images/yvzhuwbpy/${url_name}.png`;

    request(logoUrl, { encoding: null })
      .then(imgBuffer => {
        sharp(imgBuffer)
          .flatten({
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .jpeg({ quality: 85 })
          .toBuffer()
          .then(buffer =>
            resolve({
              url_name,
              buffer
            })
          )
          .catch(err => reject(`Error while processing the image: ${err}`));
      })
      .catch(err => reject(`Error while requesting the image: ${err}`));
  });
};

const imgPromises = [];

// Build promises array.
distros.forEach(distroData => {
  imgPromises.push(downloadAndConvertImage(distroData.url_name));
});

// Start saving to files.
Promise.all(imgPromises)
  .then(results => {
    results.forEach(result => {
      fs.writeFileSync(
        path.join(__dirname, '..', 'public', 'logos', `${result.url_name}.jpg`),
        result.buffer
      );
    });
  })
  .catch(err => {
    console.log(err);
  });
