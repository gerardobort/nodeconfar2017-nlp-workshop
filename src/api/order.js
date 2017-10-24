const Router = require('express').Router;
const corenlp = require('corenlp');
const CoreNLP = corenlp.default;
const Properties = corenlp.Properties;
const Pipeline = corenlp.Pipeline;
const ConnectorServer = corenlp.ConnectorServer;
const model = require('./order-model');

const connector = new ConnectorServer({ dsn: 'http://localhost:9000' });

module.exports = new Router();

module.exports.post('/api/order', function (req, res) {
  if (!req.query.text) {
    res.status(400).send({ error: 'Bad Request', message: 'text query param is missing' });
    return;
  }

  const props = new Properties({ annotators: model.getAnnotators() });
  const pipeline = new Pipeline(props, 'Spanish', connector);

  const text = model.prepareText(unescape(req.query.text));
  const expression = new CoreNLP.simple.Expression(text, model.getSemgrexExpression())
  console.log(`---\n${model.getSemgrexExpression()}\n---`);
  pipeline.annotateSemgrex(expression, true)
    .then(expression => {
      res.send(model.transformExpression(expression));
    })
    .catch(err => {
      console.log('err', err);
    });
});
