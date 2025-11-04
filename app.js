const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const cardValues = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
];

let deck = [];

// Function to create a standard deck of 52 playing cards
const createDeck = () => {
    deck = [];
    for (const value of cardValues) {
        for (const suit of suits) {
            let weight = parseInt(value);
            if (value === "J" || value === "Q" || value === "K") weight = 10;
            if (value === "A") weight = 11;

            let card = { value: value, suit: suit, weight: weight, faceUp: false };
            deck.push(card);
        }
    }
};

// Function to create a card element for rendering
const createCardElement = (card) => {
    let element = document.createElement("div");
    element.className = "card";

    if (!card.faceUp) {
        element.classList.add("faceDown");
        return element;
    } else {
        element.classList.add("faceUp");
    }

    let icon;
    if (card.suit === "Hearts") icon = "&hearts;";
    else if (card.suit === "Spades") icon = "&spades;";
    else if (card.suit === "Diamonds") icon = "&diams;";
    else icon = "&clubs;";

    element.innerHTML = card.value + "<br/>" + icon;

    return element;
};

// shuffles up the deck
//SRC: https://www.thatsoftwaredude.com/content/6417/how-to-code-blackjack-using-javascript
const shuffle = () => {
    for (let i = 0; i < 1000; i++) {
        let card1 = Math.floor(Math.random() * deck.length);
        let card2 = Math.floor(Math.random() * deck.length);
        let tmp = deck[card1];
        deck[card1] = deck[card2];
        deck[card2] = tmp;
    }
};

// Function to render the deck on the webpage
const app = () => {
    const gameContainer = document.getElementById("gameContainer");
    const stockContainer = document.getElementById("stockContainer");

    shuffle();
    let cardIndex = 0;

    const initialDeal = () => {
        for (let i = 1; i <= 7; i++) {
            const pileElement = document.createElement("div");
            pileElement.className = "cardPile";
            gameContainer.appendChild(pileElement);

            for (let j = 1; j <= i; j++) {
                if (cardIndex >= deck.length) break;

                const card = deck[cardIndex];

                if (j === i) {
                    card.faceUp = true;
                } else {
                    card.faceUp = false;
                }

                const cardElement = createCardElement(card);

                // To allow for CSS stacking/overlapping, we'll set a custom property
                // on the element to indicate its depth in the pile (optional, but good practice).
                cardElement.style.setProperty("--card-depth", j);

                pileElement.appendChild(cardElement);
                cardIndex++;
            }
        }

        if (cardIndex < deck.length) {
            const stockCard = deck[cardIndex];
            stockCard.faceUp = false;
            const stockCardElement = createCardElement(stockCard);
            stockCard.className = "stockCard";
            stockContainer.appendChild(stockCardElement);

            console.log("Creating stock pile");
        } else {
            stockContainer.innerHTML = '<div class="emptyStock"></div>';
            console.log("No cards left for stock pile");
        }
    };

    console.log(deck);
    console.log(`Deck count: ${deck.length - cardIndex}`);

    initialDeal();
};

//     gameContainer ? gameContainer.innerHTML = '' : console.error("HTML element with ID 'gameContainer' not found.");
//     for (const card of deck) {
//         const cardElement = createCardElement(card);
//         gameContainer.appendChild(cardElement);
//     }
// }

createDeck();
shuffle();
app();
