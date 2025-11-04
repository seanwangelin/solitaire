const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];

const createDeck = () => {
    deck = [];
    for (const value of cardValues) {
        for (const suit of suits) {
            let weight = parseInt(value);
            if (value === 'J' || value === 'Q' || value === 'K') weight = 10;
            if (value === 'A') weight = 11;

            let card = { value: value, suit: suit, weight: weight };
            deck.push(card);
            console.log(`Here is the deck: ${card.value} of ${card.suit} with weight ${card.weight}`);
        }
    }
}

createDeck();