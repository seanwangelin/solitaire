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

const createCardElement = (card) => { 
    let element = document.createElement('div');
    element.className = 'card';

    let icon;
    if (card.suit === 'Hearts')
        icon = '&hearts;';
    else if (card.suit === 'Spades')
        icon = '&spades;';
    else if (card.suit === 'Diamonds')
        icon = '&diams;';
    else
        icon = '&clubs;';

    element.innerHTML = card.value + '<br/>' + icon;

    return element;
}

const renderDeck = () => {
    const gameContainer = document.getElementById('gameContainer');

    gameContainer ? gameContainer.innerHTML = '' : console.error("HTML element with ID 'gameContainer' not found.");
    for (const card of deck) {
        const cardElement = createCardElement(card);
        gameContainer.appendChild(cardElement);
    }
}

createDeck();
renderDeck();