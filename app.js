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
let drawnCards = [];

let tableauPiles = [
    [],                    // Column 1 (tableau-pile1)
    [],                    // Column 2 (tableau-pile2)
    [],                    // Column 3 (tableau-pile3)
    [],                    // Column 4 (tableau-pile4)
    [],                    // Column 5 (tableau-pile5)
    [],                    // Column 6 (tableau-pile6)
    []                     // Column 7 (tableau-pile7)
];

// Function to create a standard deck of 52 playing cards
const createDeck = () => {
    deck = [];
    for (const value of cardValues) {
        for (const suit of suits) {
            let weight = parseInt(value);
            if (value === "J" || value === "Q" || value === "K") weight = 10;
            if (value === "A") weight = 11;
            if (suit === "Hearts" || suit === "Diamonds") color = "red";
            if (suit === "Clubs" || suit === "Spades") color = "black";

            let card = { value: value, suit: suit, weight: weight, faceUp: false, color: color };
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
let draggedCardData = {}; // To store the necessary data about the card and its origin
let draggedCards = []; // To store the dragged card and all cards on top of it

// Function to run when dragging starts
const handleDragStart = (e) => {
    draggedCardElement = e.currentTarget;
    const sourceContainer = draggedCardElement.parentNode;
    const allCards = Array.from(sourceContainer.querySelectorAll('.card'));
    
    // Find the index of the dragged card
    const draggedIndex = allCards.indexOf(draggedCardElement);
    
    // Get the dragged card and all cards on top of it
    draggedCards = allCards.slice(draggedIndex);

    // Store data about the dragged card element
    // e.dataTransfer.setData is required for the drop to work in some browsers
    // We'll use a simple text/plain for a placeholder, but the real data is in draggedCardData
    e.dataTransfer.setData('text/plain', 'card');

    // Find the actual card object in your game state (This logic is complex and dependent on your data structure)
    // For now, we'll store basic DOM info. A full implementation would need to look up the card in the `deck` or `drawnCards` arrays.
    draggedCardData = {
        value: draggedCardElement.dataset.value,
        suit: draggedCardElement.dataset.suit,
        // Calculate color based on suit
        // The parent is important to know where the card is coming *from*
        sourceContainerId: sourceContainer.id,
        sourceContainerClass: sourceContainer.className,
        sourceContainer: sourceContainer, // Store reference to source pile
    };

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
    console.log(`dragged card data: ${JSON.stringify(draggedCardData)}`);

    let dropTarget = e.currentTarget;
    const topCard = dropTarget.querySelector('.card:last-child');
    const topCardValue = topCard ? topCard.dataset.value : null;
    const topCardSuit = topCard ? topCard.dataset.suit : null;
    const topCardColor = topCard ? topCard.dataset.color : null;

    console.log(`Top card on drop target: ${topCardValue} of ${topCardSuit}`);

    if (draggedCardData.color === "black" && topCardColor === "black") {
        console.log('invalid move');
    } else {
        console.log('valid move');
    }
    e.preventDefault();


    // Here is where you would add logic to check if the move is *valid*
    // For example, is the dragged card one value less and opposite color?
    // You could visually highlight the drop target here.
};

// Function to run when the card is dropped
const handleDrop = (e) => {
    e.preventDefault();

    let dropTarget = e.currentTarget;

    if (dropTarget.classList.contains('card')) {
        dropTarget = dropTarget.parentNode; // Drop onto the pile containing the card
    }

    // Check for a valid drop (simplified check for demonstration)
    if (dropTarget.classList.contains('cardPile') || dropTarget.classList.contains('foundationPile')) {
        // --- GAME LOGIC

        // Assuming the move is legal:

        // 2. Move all dragged cards to the target pile
        draggedCards.forEach(card => {
            dropTarget.appendChild(card);
            card.classList.remove('dragging');
            card.classList.remove('bottomStockCard');
        });
        
        // Update the depth for all cards in the target pile to ensure proper stacking
        const cards = dropTarget.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.setProperty("--card-depth", index + 1);
            // Use much higher z-index values to override stacking context
            card.style.zIndex = 10000 + index;
        });
        
        // Explicitly set the last dragged card to have the highest z-index
        const lastDraggedCard = draggedCards[draggedCards.length - 1];
        lastDraggedCard.style.zIndex = 10000 + cards.length;
        console.log(`Card z-index set to: ${lastDraggedCard.style.zIndex}`);

        // 3. Update the game data (Move the card object from one array to another, e.g., from a column array to a new column array)
        // This is the most complex part of a real Solitaire game and requires a proper data structure (like an array of arrays for the 7 columns).

        // Also update z-indexes in the source pile
        if (draggedCardData.sourceContainer && draggedCardData.sourceContainer !== dropTarget) {
            const sourceCards = draggedCardData.sourceContainer.querySelectorAll('.card');
            sourceCards.forEach((card, index) => {
                card.style.setProperty("--card-depth", index + 1);
                card.style.zIndex = 10000 + index;
            });
        }

        if (draggedCardData.sourceContainerId === "drawContainer") {
            drawnCards.pop();
            renderDrawPile();
        }

        console.log(`Card ${draggedCardData.value} of ${draggedCardData.suit} dropped onto: ${dropTarget.id || dropTarget.className}`);

        // *** IMPORTANT ***: You would need to add logic here to "flip" the card underneath 
        // in the source column if the dragged card was the last face-up card.
    } else {
        // Drop was on an invalid target, revert visual state
        draggedCardElement.classList.remove('dragging');
    }

    draggedCardElement = null;
    draggedCardData = {};
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

                // Add card object to the tableauPiles array (use i-1 for 0-based indexing)
                tableauPiles[i - 1].push(card);

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