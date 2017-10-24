const Router = require('express').Router;
const natural = require('natural');
const removeDiacritics = require('diacritics').remove;
const fs = require('fs');
const imageDir = __dirname + '/../public/assets/model/';

module.exports = new Router();


const stemWord = word => natural.PorterStemmerEs.stem(removeDiacritics(word));

const stemImageMap = {};
const imageFiles = fs.readdirSync(imageDir);
imageFiles.forEach(file => {
  if (!fs.statSync(imageDir + file).isDirectory()) {
    const name = file.replace(/\.[a-z]{2,4}$/i, '');
    const key = stemWord(name);
    stemImageMap[ key ] = file;
  }
});

module.exports.get('/api/image/:keyword', function (req, res) {
  const stem = natural.PorterStemmerEs.stem(unescape(req.params.keyword));
  imageFile = stemImageMap[stem];
  if (imageFile) {
    res.redirect(`/assets/model/${imageFile}`);
  } else {
    res.redirect('https://visionpubli.com/wp-content/uploads/2016/10/no-image.gif');
  }
});
