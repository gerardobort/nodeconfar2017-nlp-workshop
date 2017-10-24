const express = require('express');
const path = require('path');
const Router = express.Router;
module.exports = new Router();

module.exports.use('/d3', express.static(path.join(__dirname, '../node_modules/d3/build')));
module.exports.use('/d3-selection-multi', express.static(path.join(__dirname, '../node_modules/d3-selection-multi/build')));
