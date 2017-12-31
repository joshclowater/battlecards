const _ = require('lodash');
const uuid = require('uuid/v4');

exports.createDeck = function createDeck() {
  return [
    {
      id: uuid(),
      name: 'The little cornpop that could',
      type: 'monster',
      attributes: {
        attack: 800,
        defense: 800,
      },
    }, {
      id: uuid(),
      name: 'Tree',
      type: 'monster',
      attributes: {
        attack: 0,
        defense: 1300,
      },
    }, {
      id: uuid(),
      name: 'Pikachu',
      type: 'monster',
      attributes: {
        attack: 1250,
        defense: 750,
      },
    }, {
      id: uuid(),
      name: 'I.T.',
      type: 'monster',
      attributes: {
        attack: 300,
        defense: 500,
      },
    }, {
      id: uuid(),
      name: 'Fly #1',
      type: 'monster',
      attributes: {
        attack: 600,
        defense: 100,
      },
    }, {
      id: uuid(),
      name: 'Mike Holmes',
      type: 'monster',
      attributes: {
        attack: 1300,
        defense: 1000,
      },
    }, {
      id: uuid(),
      name: 'Generic Warrior',
      type: 'monster',
      attributes: {
        attack: 1400,
        defense: 1400,
      },
    }, {
      id: uuid(),
      name: 'Cactuar',
      type: 'monster',
      attributes: {
        attack: 1100,
        defense: 1200,
      },
    }, {
      id: uuid(),
      name: 'Salad Fingers Card',
      type: 'monster',
      attributes: {
        attack: 1111,
        defense: 666,
      },
    }, {
      id: uuid(),
      name: 'Blob',
      type: 'monster',
      attributes: {
        attack: 1200,
        defense: 1000,
      },
    }, {
      id: uuid(),
      name: 'Giant Douche',
      type: 'monster',
      attributes: {
        attack: 750,
        defense: 1000,
      },
    }, {
      id: uuid(),
      name: 'Turd Monster',
      type: 'monster',
      attributes: {
        attack: 1150,
        defense: 600,
      },
    }, {
      id: uuid(),
      name: 'Triconderoga',
      type: 'monster',
      attributes: {
        attack: 333,
        defense: 333,
      },
    }, {
      id: uuid(),
      name: 'James Bond',
      type: 'monster',
      attributes: {
        attack: 1300,
        defense: 550,
      },
    }, {
      id: uuid(),
      name: 'Shield warrior',
      type: 'monster',
      attributes: {
        attack: 100,
        defense: 1400,
      },
    }, {
      id: uuid(),
      name: 'Mario',
      type: 'monster',
      attributes: {
        attack: 1200,
        defense: 1200,
      },
    }, {
      id: uuid(),
      name: 'Toadman',
      type: 'monster',
      attributes: {
        attack: 700,
        defense: 1300,
      },
    }, {
      id: uuid(),
      name: 'Metabee',
      type: 'monster',
      attributes: {
        attack: 1250,
        defense: 1150,
      },
    }, {
      id: uuid(),
      name: 'Doodle buddy',
      type: 'monster',
      attributes: {
        attack: 900,
        defense: 800,
      },
    }, {
      id: uuid(),
      name: 'Jackie Chan',
      type: 'monster',
      attributes: {
        attack: 1350,
        defense: 1300,
      },
    },
  ];
};

exports.drawFrom = function drawFrom(deck) {
  const drawIndex = Math.floor(Math.random() * deck.length);
  const cardDrawn = _.cloneDeep(deck[drawIndex]);
  deck.splice(drawIndex, 1);
  return cardDrawn;
};
