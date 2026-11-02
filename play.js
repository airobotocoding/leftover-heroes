document.addEventListener('DOMContentLoaded', () => {
    const foodItems = [
        { name: "Leftover Rice", emoji: "🍚", correctBin: "eat-soon", tip: "Cooked rice should be eaten within 1-2 days when refrigerated properly." },
        { name: "Bruised Banana", emoji: "🍌", correctBin: "eat-soon", tip: "Slightly overripe bananas are fantastic for baking banana bread or smoothies!" },
        { name: "Stale Bread", emoji: "🍞", correctBin: "freeze-it", tip: "Sliced bread freezes remarkably well and can be toasted straight from the freezer." },
        { name: "Fish Bones", emoji: "🐟", correctBin: "compost", tip: "Inedible animal bones and scraps belong in the compost or waste bin." },
        { name: "Apple Core", emoji: "🍎", correctBin: "compost", tip: "Fruit cores decompose naturally and nourish nutrient-rich compost." },
        { name: "Leftover Soup", emoji: "🥣", correctBin: "eat-soon", tip: "Consume refrigerated leftover soups within 3 days or freeze them for later." },
        { name: "Berries Approaching Softness", emoji: "🍓", correctBin: "freeze-it", tip: "Freeze soft berries immediately to use later in morning oatmeal or smoothies." },
        { name: "Vegetable Peelings", emoji: "🥕", correctBin: "compost", tip: "Carrot and potato peelings are rich organic material ideal for composting." },
        { name: "Cooked Chicken Breast", emoji: "🍗", correctBin: "eat-soon", tip: "Sliced cooked chicken makes a wonderful sandwich filling within 2 days." },
        { name: "Wilted Spinach", emoji: "🥬", correctBin: "freeze-it", tip: "Wilted greens can be frozen or blended straight into green soups and smoothies." }
    ];

    let currentRound = 1;
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('leftover_game_best_score')) || 0;
    let shuffledItems = [];
    let currentItem = null;
    let isTransitioning = false;

    const scoreDisplay = document.getElementById('score-display');
    const roundDisplay = document.getElementById('round-display');
    const bestScoreDisplay = document.getElementById('best-score-display');
    const progressFill = document.getElementById('progress-fill');
    
    const foodCard = document.getElementById('food-card');
    const cardEmoji = document.getElementById('card-emoji');
    const cardName = document.getElementById('card-name');
    const feedbackBanner = document.getElementById('feedback-banner');
    const feedbackText = document.getElementById('feedback-text');

    const gameArena = document.getElementById('game-arena');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreValue = document.getElementById('final-score-value');
    const gameOverSummary = document.getElementById('game-over-summary');
    const btnRestart = document.getElementById('btn-restart');
    const binCards = document.querySelectorAll('.bin-card');

    bestScoreDisplay.textContent = bestScore;

    function startGame() {
        currentRound = 1;
        score = 0;
        shuffledItems = [...foodItems].sort(() => Math.random() - 0.5).slice(0, 10);
        gameOverScreen.style.display = 'none';
        gameArena.style.display = 'flex';
        updateHUD();
        loadNextCard();
    }

    function updateHUD() {
        scoreDisplay.textContent = score;
        roundDisplay.textContent = `${Math.min(currentRound, 10)} / 10`;
        progressFill.style.width = `${(Math.min(currentRound, 10) / 10) * 100}%`;
    }

    function loadNextCard() {
        if (currentRound > 10) {
            endGame();
            return;
        }
        isTransitioning = false;
        currentItem = shuffledItems[currentRound - 1];
        cardEmoji.textContent = currentItem.emoji;
        cardName.textContent = currentItem.name;
        foodCard.focus();
        feedbackBanner.className = 'feedback-banner';
        feedbackText.textContent = "Sort the item into the correct category!";
    }

    function handleBinSelection(selectedBin) {
        if (isTransitioning) return;
        isTransitioning = true;

        const isCorrect = selectedBin === currentItem.correctBin;
        const binNames = {
            'eat-soon': 'Eat Soon',
            'freeze-it': 'Freeze It',
            'compost': 'Compost'
        };

        if (isCorrect) {
            score += 10;
            scoreDisplay.textContent = score;
            feedbackBanner.className = 'feedback-banner correct';
            feedbackText.textContent = `Correct! +10 pts. ${currentItem.tip}`;
        } else {
            feedbackBanner.className = 'feedback-banner incorrect';
            feedbackText.textContent = `Incorrect! This belongs in "${binNames[currentItem.correctBin]}". ${currentItem.tip}`;
        }

        currentRound++;
        
        setTimeout(() => {
            if (currentRound > 10) {
                endGame();
            } else {
                updateHUD();
                loadNextCard();
            }
        }, 2200);
    }

    // Drag and Drop support
    foodCard.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', currentItem.correctBin);
    });

    binCards.forEach(bin => {
        bin.addEventListener('dragover', (e) => {
            e.preventDefault();
            bin.classList.add('drag-over');
        });

        bin.addEventListener('dragleave', () => {
            bin.classList.remove('drag-over');
        });

        bin.addEventListener('drop', (e) => {
            e.preventDefault();
            bin.classList.remove('drag-over');
            const targetBin = bin.getAttribute('data-bin');
            handleBinSelection(targetBin);
        });

        bin.addEventListener('click', () => {
            const targetBin = bin.getAttribute('data-bin');
            handleBinSelection(targetBin);
        });

        bin.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const targetBin = bin.getAttribute('data-bin');
                handleBinSelection(targetBin);
            }
        });
    });

    // Keyboard controls: [1], [2], [3]
    document.addEventListener('keydown', (e) => {
        if (gameArena.style.display === 'none') return;
        if (e.key === '1') {
            handleBinSelection('eat-soon');
        } else if (e.key === '2') {
            handleBinSelection('freeze-it');
        } else if (e.key === '3') {
            handleBinSelection('compost');
        }
    });

    function endGame() {
        gameArena.style.display = 'none';
        gameOverScreen.style.display = 'flex';
        finalScoreValue.textContent = score;
        gameOverSummary.textContent = `You finished all 10 rounds with a score of ${score} points!`;

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('leftover_game_best_score', bestScore);
            bestScoreDisplay.textContent = bestScore;
            gameOverSummary.textContent = `🎉 New Best Score! You scored ${score} points!`;
            
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            }
        }
    }

    btnRestart.addEventListener('click', startGame);

    startGame();
});
