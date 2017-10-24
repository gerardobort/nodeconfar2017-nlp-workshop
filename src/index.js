const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

const publicRouter = require('./public');
const apiImageRouter = require('./api/image');
const apiSentenceRouter = require('./api/sentence');
const apiOrderRouter = require('./api/order');

app.use(express.static(path.join(__dirname, 'public')));
app.use(publicRouter);
app.use(apiImageRouter);
app.use(apiSentenceRouter);
app.use(apiOrderRouter);

app.listen(PORT, function () {
  console.log(`Sample app listening on port ${PORT}!`);
});
