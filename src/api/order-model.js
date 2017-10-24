const _ = require('lodash');

module.exports = {
  prepareText(text) {
    return text.replace(/\.?$/, '.'); // force final punctuation
  },

  getAnnotators() {
    return 'tokenize,ssplit,pos,lemma,regexner,ner,depparse';
  },

  getSemgrexExpression() {
    const order = '{ner:ORDER}=order';
    const thing = '{}=thing';
    const quantity = '{pos:/^(dn|pn|pi|di|z)0*/}=quantity';
    const size = '{ner:SIZE}=size';
    const negate = '{}=negate';
    const who = '{pos:/^(pp|np|da|nc).*/}=who';
    const addrem = '{ner:/ORDER_(ADD|REMOVE)/}=addrem';
    const extra_thing = '{ner:/(INGREDIENT|CONDIMENT|DRINK|DESSERT|MEAL)/}=extra_thing';
    const replace_by = '{ner:/(INGREDIENT|CONDIMENT|DRINK|DESSERT|MEAL)/}=replace_by';
    const thing_to = '{ner:/(MEAL|DESSERT|DRINK)/}=thing_to';
    const mutate = '{ner:ORDER_MUTATE}=mutate';

    return `
      {ner:/^ORDER.*/} [
        == (${order}
          >dobj (${thing} ?>/(nummod|nmod|det)/ ${quantity} ?>/(appos|amod)/ ${size})
          ?>neg ${negate}
          ?>nsubj ${who}
          [
            ?@{}
            | >>/(nmod|conj.*)/ (${extra_thing}
                ?>case ${addrem}
                ?</(nummod|nmod|det)/ ${quantity}
                ?>/(appos|amod)/ ${size}
                ?>neg ${negate})
          ])

        | == (${addrem}
          >dobj (${extra_thing}
            ?</(nummod|nmod|det)/ ${quantity}
            ?>/(appos|amod)/ ${size}
            ?>nmod ${replace_by})
          ?>nsubj ${who}
          ?>neg ${negate}
          ?>/(iobj|nmod)/ ${thing_to})

        | == (${mutate}
          >dobj ${thing}
          ?>neg ${negate}
          ?>nsubj ${who})
      ]
    `.replace(/[\r\n\t ]+/g, ' ').trim();
  },

  transformExpression(expression) {
    // creates a unique id for the current match
    const matchGroupIdentity = match => [ match.begin, match.end ].join(',');
    // 1st case match
    const isMatchOrder = match => !!match.group('order');
    // 2nd case match
    const isMatchAddrem = match => !!match.group('addrem');
    // 3rd case match
    const isMatchMutate = match => !!match.group('mutate');

    const orders = [];
    const mutations = [];
    let lastOrder; // hydrated match

    const sentences = expression.sentences()
      .map(sentence => 
        sentence.matches().map(match => {
          if (isMatchOrder(match)) {
            if (lastOrder
                && matchGroupIdentity(match.group('order')) === matchGroupIdentity(lastOrder.order)
                && matchGroupIdentity(match.group('thing')) === matchGroupIdentity(lastOrder.thing)
            ) { // matches have cardinality N
              if (match.group('extra_thing')) {
                const extra_thing = Object.assign({}, match.group('extra_thing'), {
                  addrem: match.group('addrem'),
                });
                lastOrder.extra_things.push(extra_thing);
              }
              // there might be many references to the same "thing" for an order on the different matches
              lastOrder.thing_references.push(match.group('thing'));
            } else {
              lastOrder = {
                order: match.group('order'),
                thing: Object.assign({}, match.group('thing'), {
                  quantity: match.group('quantity'),
                  size: match.group('size'),
                  negate: match.group('negate'),
                }),
                thing_references: [ match.group('thing') ],
                who: match.group('who'),
                extra_things: match.group('extra_thing') ? [ match.group('extra_thing') ] : [],
              };
              orders.push(lastOrder);
            }
          } else if (isMatchAddrem(match)) {
            const extra_thing = Object.assign({}, match.group('extra_thing'), {
              addrem: match.group('addrem'),
              thing_to: match.group('thing_to'),
              replace_by: match.group('replace_by'),
              quantity: match.group('quantity'),
              size: match.group('size'),
              negate: match.group('negate'),
            });
            if (!lastOrder) {
              lastOrder = {
                order: match.group('addrem'),
                thing: match.group('thing_to') || match.group('extra_thing'),
                extra_things: [],
              };
              orders.push(lastOrder);
            }
            lastOrder.extra_things.push(extra_thing);

            if (match.group('thing_to')) { // if thing_to was not added, then add it to extra_things
              const extra_thing = Object.assign({}, match.group('thing_to'));
              lastOrder.extra_things.push(extra_thing);
            }
            if (match.group('replace_by')) { // if replace_by was not added, then add it to extra_things
              const extra_thing = Object.assign({}, match.group('replace_by'));
              lastOrder.extra_things.push(extra_thing);
            }
          } else if (isMatchMutate(match)) { // match has cardinality 1
            const mutation = {
              mutate: match.group('mutate'),
              thing: Object.assign({}, match.group('thing'), {
                negate: match.group('negate'),
              }),
              who: match.group('who'),
              extra_things: [],
            };
            mutations.push(mutation);
          }
          return match;
        })
      );

    return ({
      ordersCount: orders.length,
      orders,
      mutations,
      sentences,
    });
  },
};
