function getOrderJson(text) {
  const req = new XMLHttpRequest();
  req.open('POST', '/api/order?text=' + encodeURIComponent(text || '.'));
  req.send();
  return new Promise((resolve, reject) => {
    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        if (req.status === 200) { 
          resolve(JSON.parse(req.responseText));
        } else {
          reject(req.status);
        } 
      }
    }
  });
}

function initialize() {
  const textarea = document.getElementById('input-order');
  textarea.value = localStorage.getItem('text');
  textarea.focus();
  bindWebSpeechHandlers();
  processOrder(textarea.value);
}

function processOrder(text) {
  const canvas = document.getElementById('canvas');
  const debug = document.getElementById('debug');
  localStorage.setItem('text', text);

  getOrderJson(text)
    .then(data => {
      let html = (data.orders || []).map(order => {
        const defaultMeal = 'hamburguesa';
        const imageUrl = (token, isMeal) =>
          isMeal && !token.pos.match(/^n/) ? `/api/image/${defaultMeal}` : `/api/image/${token.lemma}`;
        const orderClass = `${order.order.token.ner || ORDER}${order.order.negate ? '_NO' : ''} ${order.order.token.lemma}`;
        const thingClass = `${order.thing.token.ner || 'MEAL'} ${order.thing.token.lemma}`;
        const replaceByClass = `${order.replace_by ? 'REPLACE_BY.' + order.replace_by.token.lemma : ''}`;
        const sides = order.extra_things.filter(extra_thing => extra_thing.token.ner === 'MEAL');
        const ingredients = order.extra_things.filter(extra_thing => extra_thing.token.ner === 'INGREDIENT');
        const condiments = order.extra_things.filter(extra_thing => extra_thing.token.ner === 'CONDIMENT');
        const drinks = order.extra_things.filter(extra_thing => extra_thing.token.ner === 'DRINK');
        const desserts = order.extra_things.filter(extra_thing => extra_thing.token.ner === 'DESSERT');

        return `
          <div class="order ${orderClass}">
            <div class="thing ${thingClass}"
              style="background-image:url(${imageUrl(order.thing.token, true)})"
              data-quantity="${order.thing.quantity ? order.thing.quantity.token.lemma : '1'}"
              data-size="${order.thing.size ? order.thing.size.token.lemma : ''}"
            ></div>
            <h1>Pedido de ${order.who ? order.who.token.word : '??'}</h1>
            <div class="extra-things ingredients"><h2>Ingredientes</h2> ${ingredients.map(thing => `
              <div class="extra-thing ${thing.addrem ? thing.addrem.token.ner : ''} ${thing.token.ner}"
                style="background-image:url(${imageUrl(thing.token)})"
                data-quantity="${thing.quantity ? thing.quantity.token.lemma : '1'}"
                data-size="${thing.size ? thing.size.token.lemma : ''}"
              ></div>`).join('')}
            </div>
            <div class="extra-things sides"><h2>Acompañamiento</h2> ${sides.map(thing => `
              <div class="extra-thing ${thing.addrem ? thing.addrem.token.ner : ''} ${thing.token.ner}"
                style="background-image:url(${imageUrl(thing.token)})"
                data-quantity="${thing.quantity ? thing.quantity.token.lemma : '1'}"
                data-size="${thing.size ? thing.size.token.lemma : ''}"
              ></div>`).join('')}
            </div>
            <div class="extra-things condiments"><h2>Condimentos</h2> ${condiments.map(thing => `
              <div class="extra-thing ${thing.addrem ? thing.addrem.token.ner : ''} ${thing.token.ner}"
                style="background-image:url(${imageUrl(thing.token)})"
                data-quantity="${thing.quantity ? thing.quantity.token.lemma : '1'}"
                data-size="${thing.size ? thing.size.token.lemma : ''}"
              ></div>`).join('')}
            </div>
            <div class="extra-things drinks"><h2>Bebida</h2> ${drinks.map(thing => `
              <div class="extra-thing ${thing.addrem ? thing.addrem.token.ner : ''} ${thing.token.ner}"
                style="background-image:url(${imageUrl(thing.token)})"
                data-quantity="${thing.quantity ? thing.quantity.token.lemma : '1'}"
                data-size="${thing.size ? thing.size.token.lemma : ''}"
              ></div>`).join('')}
            </div>
            <div class="extra-things desserts"><h2>Postre</h2> ${desserts.map(thing => `
              <div class="extra-thing ${thing.addrem ? thing.addrem.token.ner : ''} ${thing.token.ner}"
                style="background-image:url(${imageUrl(thing.token)})"
                data-quantity="${thing.quantity ? thing.quantity.token.lemma : '1'}"
                data-size="${thing.size ? thing.size.token.lemma : ''}"
              ></div>`).join('')}
            </div>
          </div>
        `;
      }).join('\n\n');
      canvas.innerHTML = html;
      debug.innerHTML = JSON.stringify(data, null, '  ');
    });
}

function bindWebSpeechHandlers() {
  try {
    var recognition = new webkitSpeechRecognition();
  } catch (e) {
    var recognition = Object;
  }

  const textarea = document.getElementById('input-order');
  const startButton = document.getElementById('startRecognition');
  const stopButton = document.getElementById('stopRecognition');

  recognition.lang = "es_AR";
  recognition.continuous = true;
  recognition.interimResults = true;

  stopButton.disabled = 'disabled';

  recognition.onresult = function (event) {
    let txtRec = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      txtRec += event.results[i][0].transcript;
    }
    textarea.value = txtRec;
    processOrder(txtRec);
  };

  startButton.onclick = () => {
    textarea.focus();
    recognition.start();
    startButton.disabled = 'disabled';
    stopButton.disabled = '';
  };

  stopButton.onclick = () => {
    recognition.stop();
    startButton.disabled = '';
    stopButton.disabled = 'disabled';
  };
}
