const Router = require('express').Router;
const corenlp = require('corenlp');
const CoreNLP = corenlp.default;
const Properties = corenlp.Properties;
const Pipeline = corenlp.Pipeline;
const ConnectorServer = corenlp.ConnectorServer;

const connector = new ConnectorServer({ dsn: 'http://localhost:9000' });

module.exports = new Router();

module.exports.get('/api/sentence', function (req, res) {
  if (!req.query.text) {
    res.status(400).send({ error: 'Bad Request', message: 'text query param is missing' });
    return;
  }

  const props = new Properties({ annotators: 'tokenize,ssplit,pos,lemma,ner,parse,depparse' });
  const pipeline = new Pipeline(props, 'Spanish', connector);

  const sent = new CoreNLP.simple.Sentence(unescape(req.query.text));
  pipeline.annotate(sent)
    .then(sent => {
      res.send({
        sentence: Object.assign({ parseTree: CoreNLP.util.Tree.fromSentence(sent) }, sent.toJSON() ),
      });
    })
    .catch(err => {
      console.log('err', err);
    });
});
