const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const cardNumberValues = [
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
let drawnCards = [];

// Function to create a standard deck of 52 playing cards
const createDeck = () => {
    deck = [];
    for (const value of cardNumberValues) {
        for (const suit of suits) {
            let weight = parseInt(value);
            if (value === "J" || value === "Q" || value === "K") weight = 10;
            if (value === "A") weight = 11;
            let color = "";
            if (suit === "Hearts" || suit === "Diamonds") color = "red";
            if (suit === "Clubs" || suit === "Spades") color = "black";

            let card = {
                value: value,
                suit: suit,
                weight: weight,
                faceUp: false,
                color: color,
                pile: null  // Track which pile: 'tableau-1' through 'tableau-7', 'foundation-hearts', 'stock', 'draw', etc.
            };
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
        element.draggable = true;
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
    }

    let icon;

    if (card.suit === "Hearts" || card.suit === "Diamonds") element.classList.add("redCard");

    if (card.suit === "Hearts") icon = "&hearts;";
    else if (card.suit === "Spades") icon = "&spades;";
    else if (card.suit === "Diamonds") icon = "&diams;";
    else icon = "&clubs;";

    element.innerHTML = card.value + "<br/>" + icon;
    element.dataset.value = card.value;
    element.dataset.suit = card.suit;

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

let draggedCardElement = null;
let draggedCard = null;  // Store the actual card object from deck
let draggedCards = []; // To store the dragged card and all cards on top of it

// Function to run when dragging starts
const handleDragStart = (e) => {
    draggedCardElement = e.currentTarget;
    const sourceContainer = draggedCardElement.parentNode;
    const allCards = Array.from(sourceContainer.querySelectorAll('.card'));

    // Find the index of the dragged card
    const draggedIndex = allCards.indexOf(draggedCardElement);

    // Get the dragged card elements and all cards on top of it
    draggedCards = allCards.slice(draggedIndex);

    // Find the actual card object in deck by matching value and suit
    const cardValue = draggedCardElement.dataset.value;
    const cardSuit = draggedCardElement.dataset.suit;
    draggedCard = deck.find(c => c.value === cardValue && c.suit === cardSuit && c.pile === sourceContainer.id);

    // e.dataTransfer.setData is required for the drop to work in some browsers
    e.dataTransfer.setData('text/plain', 'card');

    // Create a custom drag image that includes all dragged cards
    if (draggedCards.length > 1) {
        // Create a container for the drag image
        const dragImage = document.createElement('div');
        dragImage.style.position = 'absolute';
        dragImage.style.left = '-9999px';
        dragImage.style.top = '-9999px';
        dragImage.style.width = '70px';
        dragImage.style.pointerEvents = 'none';

        // Clone all dragged cards and add them to the drag image
        draggedCards.forEach((card, index) => {
            const clonedCard = card.cloneNode(true);
            clonedCard.style.position = 'absolute';
            clonedCard.style.left = '0';
            clonedCard.style.top = `${index * 25}px`; // Match the 25px offset from CSS
            clonedCard.style.zIndex = index;
            clonedCard.style.opacity = '0.8'; // Set solid opacity
            clonedCard.classList.remove('dragging'); // Remove dragging class to avoid style conflicts
            dragImage.appendChild(clonedCard);
        });

        document.body.appendChild(dragImage);

        // Set the custom drag image
        e.dataTransfer.setDragImage(dragImage, 0, 0);

        // Remove the drag image element after drag starts
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    } else {
        // For single card, use default browser drag image
        e.dataTransfer.setDragImage(draggedCardElement, 0, 0);
    }

    setTimeout(() => {
        // Apply dragging class to all cards being dragged
        draggedCards.forEach(card => {
            card.classList.add('dragging');
        });
    }, 0);
};

// Function to allow dropping (prevents default to enable drop)
const handleDragOver = (e) => {
    if (!draggedCard) return;  // No card being dragged

    let dropTarget = e.currentTarget;

    // Get the top card element from the target pile
    const topCardElement = dropTarget.querySelector('.card:last-child');

    // Find the top card object in the deck
    const topCard = topCardElement ? deck.find(c =>
        c.value === topCardElement.dataset.value &&
        c.suit === topCardElement.dataset.suit &&
        c.pile === dropTarget.id
    ) : null;

    // Cards must have opposite colors
    if (topCard && draggedCard.color === topCard.color) {
        console.log(`Invalid move: ${draggedCard.color} card on ${topCard.color} card`);
        return;
    }

    // Cards must be in descending order
    if (topCard && draggedCard.weight !== topCard.weight - 1) {

        // Special case: Ace allowed on 2
        if (draggedCard.value === "A" && topCard.value === "2") {
            console.log(`Valid move: ${draggedCard.value} can be placed on ${topCard.value}`);
        } else {
        console.log(`Invalid move: ${draggedCard.value} cannot be placed on ${topCard.value}`);
        return;
        }
    }

    // If pile is empty, only Kings can start
    if (!topCard && draggedCard.value !== "K") {
        console.log(`Invalid move: only King can be placed on empty pile`);
        return;
    }

    console.log(`Valid move: ${draggedCard.value} of ${draggedCard.suit} can move`);
    e.preventDefault();  // Only allow drop if validation passes
};

// Function to run when the card is dropped
const handleDrop = (e) => {
    e.preventDefault();

    let dropTarget = e.currentTarget;

    if (dropTarget.classList.contains('card')) {
        dropTarget = dropTarget.parentNode; // Drop onto the pile containing the card
    }

    // Check for a valid drop
    if (dropTarget.classList.contains('cardPile') || dropTarget.classList.contains('foundationPile')) {
        // Move all dragged card elements to the target pile in the DOM
        draggedCards.forEach(card => {
            dropTarget.appendChild(card);
            card.classList.remove('dragging');
            card.classList.remove('bottomStockCard');
        });

        // Update z-index for all cards in the target pile
        const cards = dropTarget.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.setProperty("--card-depth", index + 1);
            card.style.zIndex = 10000 + index;
        });

        // Update the deck: change the pile property for all dragged cards
        draggedCards.forEach(cardElement => {
            const cardObj = deck.find(c =>
                c.value === cardElement.dataset.value &&
                c.suit === cardElement.dataset.suit
            );
            if (cardObj) {
                cardObj.pile = dropTarget.id;  // Update pile in the deck
            }
        });

        console.log(`Card(s) moved to: ${dropTarget.id}`);

    } else {
        // Drop was on an invalid target, revert visual state
        draggedCardElement.classList.remove('dragging');
    }

    draggedCardElement = null;
    draggedCard = null;
    draggedCards = [];
};

// Function to clean up the dragging state
const handleDragEnd = (e) => {
    draggedCards.forEach(card => {
        card.classList.remove('dragging');
    });
};

// Function to render the deck on the webpage
const app = () => {
    // const gameContainer = document.getElementById("gameContainer");
    const tableauPilesContainer = document.getElementById("tableauPiles");
    const stockContainer = document.getElementById("stockContainer");
    const drawContainer = document.getElementById("drawContainer");
    const resetDeckBtn = document.getElementById("resetDeckBtn");

    const dealEndIndex = 28;
    let cardIndex = 0;

    shuffle();

    const initialDeal = () => {
        //deal cards to the 7 piles
        for (let i = 1; i <= 7; i++) {
            const pileElement = document.createElement("div");
            pileElement.className = "cardPile";
            pileElement.id = `tableauPile${i}`;
            pileElement.addEventListener('dragover', handleDragOver);
            pileElement.addEventListener('drop', handleDrop);
            tableauPilesContainer.appendChild(pileElement);

            for (let j = 1; j <= i; j++) {
                if (cardIndex >= deck.length) break;

                const card = deck[cardIndex];

                if (j === i) {
                    card.faceUp = true;
                } else {
                    card.faceUp = false;
                }

                // Set the pile property in the card object
                card.pile = `tableauPile${i}`;

                const cardElement = createCardElement(card);

                // To allow for CSS stacking/overlapping, we'll set a custom property
                // on the element to indicate its depth in the pile (optional, but good practice).
                cardElement.style.setProperty("--card-depth", j);
                cardElement.style.zIndex = 10000 + j;

                pileElement.appendChild(cardElement);
                cardIndex++;
            }
        }

        // Create the stock pile with remaining cards
        if (cardIndex < deck.length) {
            const stockCard = deck[cardIndex];
            stockCard.faceUp = false;
            stockCard.pile = 'stockContainer';  // Set pile property
            const stockCardElement = createCardElement(stockCard);
            stockContainer.removeEventListener('click', drawCards);

            // (2) Add the listener to the specific card element
            stockCardElement.addEventListener('click', drawCards);

            stockCardElement.classList.add("stockCard"); // Use classList.add, not setting .className
            stockContainer.innerHTML = ''; // Clear container before appending new card
            stockContainer.appendChild(stockCardElement);

            console.log("Creating stock pile");
        } else {
            stockContainer.innerHTML = '<div class="emptyStock"></div>';
            console.log("No cards left for stock pile");
        }
    };

    const updateStockPileVisual = () => {
        stockContainer.innerHTML = '';

        if (cardIndex < deck.length) {
            const stockCard = deck[cardIndex];
            stockCard.faceUp = false;
            const stockCardElement = createCardElement(stockCard);

            // Re-attach the listener to the new card
            stockCardElement.addEventListener('click', drawCards);

            stockCardElement.classList.add("stockCard");
            stockContainer.appendChild(stockCardElement);
        } else {
            // Render the empty pile placeholder
            stockContainer.innerHTML = '<div class="emptyStock"></div>';
        }
    };

    // Helper function used to reset the stock pile when all cards have been drawn
    const resetStockPile = () => {
        drawnCards.reverse();

        for (const card of drawnCards) {
            card.faceUp = false;
        }

        deck.splice(dealEndIndex, deck.length - dealEndIndex, ...drawnCards);
        drawnCards = [];
        cardIndex = dealEndIndex;
        renderDrawPile();
        updateStockPileVisual();

        console.log("Stockpile reset: Waste pile moved back to stock and reversed.");
    }
    const renderDrawPile = () => {
        const drawContainer = document.getElementById("drawContainer");
        drawContainer.innerHTML = '';

        // Get the last 3 cards from the waste pile
        const visibleCards = drawnCards.slice(Math.max(drawnCards.length - 3, 0));

        visibleCards.forEach((card, index) => {
            // Only the very last card in the pile is face up
            if (index === visibleCards.length - 1) {
                card.faceUp = true;
            } else {
                card.faceUp = false;
            }

            const cardElement = createCardElement(card);
            cardElement.classList.add('bottomStockCard');
            cardElement.style.setProperty("--card-depth", index + 1);
            cardElement.style.zIndex = 10000 + index;
            drawContainer.appendChild(cardElement);
        });
    }

    const drawCards = () => {
        let remainingCards = deck.length - cardIndex;
        let cardsToDraw = Math.min(3, remainingCards);
        console.log('initial cards to draw: ' + cardsToDraw);

        // if (cardsToDraw === 0) {
        //     if (drawnCards.length > 0) {
        //         resetStockPile();
        //     } else {
        //         console.log("No cards left to draw from stock pile");
        //     }
        //     return;
        // }

        // drawContainer.innerHTML = '';

        // For loop used to draw cards from stock pile. Adds card to drawnCards array and creates card element for each drawn card.
        for (let i = 0; i < cardsToDraw; i++) {
            const card = deck.splice(cardIndex, 1)[0];
            drawnCards.push(card);
            console.log(drawnCards)

            // Set faceUp property: only the last drawn card is face up
            if (i === cardsToDraw - 1) {
                card.faceUp = true;
            } else {
                card.faceUp = false;
            }


            const cardElement = createCardElement(card);
            cardElement.classList.add('bottomStockCard');
            cardElement.style.setProperty("--card-depth", i + 1);
            cardElement.style.zIndex = 10000 + i;
            drawContainer.appendChild(cardElement);
            console.log(card);
        }

        // cardIndex += cardsToDraw;

        renderDrawPile();
        updateStockPileVisual();

        if (remainingCards <= 3) {
            resetDeckBtn.textContent = 'Reset Deck';
            resetDeckBtn.style.display = 'inline-block'; // Show the button

            resetDeckBtn.onclick = () => {
                resetStockPile();
                resetDeckBtn.style.display = 'none'; // Hide the button after resetting
            };

            // document.getElementById("resetDeckBtn").appendChild(resetDeckBtn);
        }

        console.log("Drawing cards from stock pile");
        console.log(`Cards drawn: ${cardsToDraw}`);
        console.log(`Deck count: ${remainingCards}`);
    }

    stockContainer.addEventListener('click', drawCards);

    initialDeal();
    console.log(deck);
};

createDeck();
shuffle();
app();
console.log(tableauPiles[6]);