var _ = require('lodash');

var deck = exports.deck = [
  {
    name: 'The little cornpop that could',
    type: 'monster',
    attributes: {
      attack: 800,
      defense: 800,
    }
  }, {
    name: 'Tree',
    type: 'monster',
    attributes: {
      attack: 0,
      defense: 1300,
    }
  }, {
    name: 'Pikachu',
    type: 'monster',
    attributes: {
      attack: 1250,
      defense: 750,
    }
  }, {
    name: 'I.T.',
    type: 'monster',
    attributes: {
      attack: 300,
      defense: 500,
    }
  }, {
    name: 'Fly #1',
    type: 'monster',
    attributes: {
      attack: 600,
      defense: 100,
    }
  }, {
    name: 'Mike Holmes',
    type: 'monster',
    attributes: {
      attack: 1300,
      defense: 1000,
    }
  }, {
    name: 'Generic Warrior',
    type: 'monster',
    attributes: {
      attack: 1400,
      defense: 1400,
    }
  }, {
    name: 'Cactuar',
    type: 'monster',
    attributes: {
      attack: 1100,
      defense: 1200,
    }
  }, {
    name: 'Salad Fingers Card',
    type: 'monster',
    attributes: {
      attack: 1111,
      defense: 666,
    }
  }, {
    name: 'Blob',
    type: 'monster',
    attributes: {
      attack: 1200,
      defense: 1000,
    }
  }, {
    name: 'Giant Douche',
    type: 'monster',
    attributes: {
      attack: 750,
      defense: 1000,
    }
  }, {
    name: 'Turd Monster',
    type: 'monster',
    attributes: {
      attack: 1150,
      defense: 600,
    }
  }, {
    name: 'Triconderoga',
    type: 'monster',
    attributes: {
      attack: 333,
      defense: 333,
    }
  }, {
    name: 'James Bond',
    type: 'monster',
    attributes: {
      attack: 1300,
      defense: 550,
    }
  }, {
    name: 'Shield warrior',
    type: 'monster',
    attributes: {
      attack: 100,
      defense: 1400,
    }
  }, {
    name: 'Mario',
    type: 'monster',
    attributes: {
      attack: 1200,
      defense: 1200,
    }
  }, {
    name: 'Toadman',
    type: 'monster',
    attributes: {
      attack: 700,
      defense: 1300,
    }
  }, {
    name: 'Metabee',
    type: 'monster',
    attributes: {
      attack: 1250,
      defense: 1150,
    }
  }, {
    name: 'Doodle buddy',
    type: 'monster',
    attributes: {
      attack: 900,
      defense: 800,
    }
  }, {
    name: 'Jackie Chan',
    type: 'monster',
    attributes: {
      attack: 1350,
      defense: 1300,
    }
  }
];

var drawFrom = exports.drawFrom = function(deck) {
  var drawIndex = Math.floor(Math.random() * deck.length);
  var cardDrawn = _.cloneDeep(deck[drawIndex]);
  deck.splice(drawIndex, 1);
  return cardDrawn;
};
