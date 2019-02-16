const fs = require('fs');
const path = require('path');
const request = require('request-promise');
const cheerio = require('cheerio');

const options = {
  uri: 'https://distrowatch.com',
  transform: function(body) {
    return cheerio.load(body);
  }
};

// Load homepage of DistroWatch.
request(options)
  .then($ => {
    const distros = [];

    // Get related form field.
    const availableDistros = $('form')
      .eq(1)
      .children('select[name="distribution"]')
      .children();

    // Build distros array.
    availableDistros.each((index, item) => {
      const parsedItem = $(item);
      if (parsedItem.text() === 'Select Distribution') {
        return;
      }
      distros.push({
        distro_name: parsedItem.text(),
        url_name: parsedItem.val()
      });
    });

    return distros;
  })
  .then(distros => {
    // Write distros data into json file.
    const fileToCreate = 'distros.json';
    const stream = fs.createWriteStream(
      path.join(__dirname, '..', 'data', fileToCreate)
    );
    stream.once('open', () => {
      stream.end(JSON.stringify(distros));
    });
  })
  .catch(err => {
    console.log('error:', err);
  });
