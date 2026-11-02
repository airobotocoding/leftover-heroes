document.addEventListener('DOMContentLoaded', () => {
    // Setup Audio SFX Volumes
    const sfxClick = document.getElementById('sfx-click');
    const sfxChime = document.getElementById('sfx-chime');
    if (sfxClick) sfxClick.volume = 0.5;
    if (sfxChime) sfxChime.volume = 0.5;

    function playClickSfx() {
        if (sfxClick) {
            sfxClick.currentTime = 0;
            sfxClick.play().catch(() => {});
        }
    }

    function playChimeSfx() {
        if (sfxChime) {
            sfxChime.currentTime = 0;
            sfxChime.play().catch(() => {});
        }
    }

    // Hero Video Controls & Reduced Motion Handling
    const heroVideo = document.getElementById('hero-bg-video');
    const videoToggleBtn = document.getElementById('hero-video-toggle');
    const videoToggleIcon = document.getElementById('video-toggle-icon');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function handleReducedMotion() {
        if (prefersReducedMotion.matches && heroVideo) {
            heroVideo.pause();
            if (videoToggleIcon) videoToggleIcon.setAttribute('data-lucide', 'play');
        }
    }
    handleReducedMotion();
    prefersReducedMotion.addEventListener('change', handleReducedMotion);

    if (videoToggleBtn && heroVideo) {
        videoToggleBtn.addEventListener('click', () => {
            if (heroVideo.paused) {
                heroVideo.play();
                videoToggleIcon.setAttribute('data-lucide', 'pause');
                videoToggleBtn.setAttribute('aria-label', 'Pause background video');
            } else {
                heroVideo.pause();
                videoToggleIcon.setAttribute('data-lucide', 'play');
                videoToggleBtn.setAttribute('aria-label', 'Play background video');
            }
            if (window.lucide) {
                lucide.createIcons();
            }
        });
    }

    // Voice-over & Transcript Toggle Logic
    const welcomeAudio = document.getElementById('welcome-audio');
    const voiceoverPlayBtn = document.getElementById('voiceover-play-btn');
    const voiceoverIcon = document.getElementById('voiceover-icon');
    const transcriptToggleBtn = document.getElementById('transcript-toggle-btn');
    const transcriptPanel = document.getElementById('transcript-panel');
    const transcriptChevron = document.getElementById('transcript-chevron');

    if (voiceoverPlayBtn && welcomeAudio) {
        voiceoverPlayBtn.addEventListener('click', () => {
            if (welcomeAudio.paused) {
                welcomeAudio.play();
                voiceoverIcon.setAttribute('data-lucide', 'pause');
                voiceoverPlayBtn.innerHTML = '';
                voiceoverPlayBtn.appendChild(voiceoverIcon);
                voiceoverPlayBtn.append(' Pause welcome audio');
            } else {
                welcomeAudio.pause();
                voiceoverIcon.setAttribute('data-lucide', 'play');
                voiceoverPlayBtn.innerHTML = '';
                voiceoverPlayBtn.appendChild(voiceoverIcon);
                voiceoverPlayBtn.append(' Listen to our welcome');
            }
            if (window.lucide) {
                lucide.createIcons();
            }
        });

        welcomeAudio.addEventListener('ended', () => {
            voiceoverIcon.setAttribute('data-lucide', 'play');
            voiceoverPlayBtn.innerHTML = '';
            voiceoverPlayBtn.appendChild(voiceoverIcon);
            voiceoverPlayBtn.append(' Listen to our welcome');
            if (window.lucide) {
                lucide.createIcons();
            }
        });
    }

    if (transcriptToggleBtn && transcriptPanel) {
        transcriptToggleBtn.addEventListener('click', () => {
            const isOpen = transcriptPanel.classList.toggle('open');
            transcriptToggleBtn.setAttribute('aria-expanded', isOpen);
            if (transcriptChevron) {
                transcriptChevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    // Hero canvas particle background simulation
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.parentElement.offsetWidth;
        let height = canvas.height = canvas.parentElement.offsetHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
        });

        const particles = Array.from({ length: 20 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? '#22C55E' : '#F97316',
            speedY: Math.random() * 0.4 + 0.1,
            speedX: (Math.random() - 0.5) * 0.3
        }));

        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.y -= p.speedY;
                p.x += p.speedX;
                if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.2;
                ctx.fill();
            });
            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    // Calculator & Chart.js (Safely guarded against offline CDN failures)
    const wasteInput = document.getElementById('waste-input');
    const resAnnual = document.getElementById('res-annual');
    const resCo2 = document.getElementById('res-co2');
    const resMeals = document.getElementById('res-meals');

    let wasteChartInstance = null;
    const ctxChart = document.getElementById('wasteChart');
    if (ctxChart) {
        if (typeof Chart !== 'undefined') {
            wasteChartInstance = new Chart(ctxChart.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Household', 'Food Services', 'Retail', 'Manufacturing'],
                    datasets: [{
                        label: 'Singapore Food Waste Distribution (%)',
                        data: [38, 34, 15, 13],
                        backgroundColor: ['#22C55E', '#F97316', '#3b82f6', '#14532D'],
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        } else {
            console.warn('Chart.js is not loaded. Skipping chart initialization.');
        }
    }

    function updateCalculator(val) {
        const annual = (val * 52).toFixed(1);
        const co2 = (annual * 2.5).toFixed(1);
        const meals = Math.round(annual * 3);
        if (resAnnual) resAnnual.textContent = `${annual} kg`;
        if (resCo2) resCo2.textContent = `${co2} kg`;
        if (resMeals) resMeals.textContent = `${meals} meals`;
    }

    if (wasteInput) {
        wasteInput.addEventListener('input', (e) => {
            updateCalculator(e.target.value);
        });
        updateCalculator(wasteInput.value);
    }

    // Leftover Idea Generator Logic
    const ingredientCards = document.querySelectorAll('.ingredient-card');
    ingredientCards.forEach(card => {
        function toggleSelection() {
            const isSelected = card.classList.toggle('selected');
            card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        }

        card.addEventListener('click', toggleSelection);
        
        card.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                toggleSelection();
            }
        });
    });

    const generateBtn = document.getElementById('generate-recipe-btn');
    const recipeOutput = document.getElementById('recipe-output');
    const recipeTitle = document.getElementById('recipe-title');
    const recipeDesc = document.getElementById('recipe-desc');

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            playClickSfx();
            const selected = document.querySelectorAll('.ingredient-card.selected');
            const names = Array.from(selected).map(c => c.dataset.ingredient);
            
            recipeOutput.style.display = 'block';

            if (names.length === 0) {
                recipeTitle.textContent = "Select Food Items";
                recipeDesc.textContent = "Please pick at least one ingredient from your fridge to generate a recipe idea!";
            } else if (names.includes('rice') && names.includes('eggs') && names.length === 2) {
                recipeTitle.textContent = "Singaporean Golden Fried Rice";
                recipeDesc.textContent = "Sauté leftover rice with minced garlic, scramble 2 eggs directly into the wok, and season with light soy sauce and sesame oil.";
            } else if (names.length === 1 && names[0] === 'rice') {
                recipeTitle.textContent = "Crispy Garlic Rice Porridge (Congee)";
                recipeDesc.textContent = "Simmer cooked leftover rice in vegetable or chicken broth with sliced ginger for 15 minutes. Top with crispy fried garlic and spring onions.";
            } else if (names.length === 1 && names[0] === 'bread') {
                recipeTitle.textContent = "Crispy Garlic Bread Croutons";
                recipeDesc.textContent = "Dice stale bread into cubes, toss with olive oil, minced garlic, and dried herbs. Bake at 180°C for 10 minutes until golden and crunchy.";
            } else if (names.length === 1 && names[0] === 'veggies') {
                recipeTitle.textContent = "Savory Veggie Broth & Stew Base";
                recipeDesc.textContent = "Simmer limp vegetables with pepper, garlic, and herbs for 20 minutes to create a rich broth, or stir-fry briskly with oyster sauce.";
            } else if (names.length === 1 && names[0] === 'eggs') {
                recipeTitle.textContent = "Classic Fluffy Omelette with Herbs";
                recipeDesc.textContent = "Whisk eggs with pepper and soy sauce. Cook over low heat in butter or oil, folding with fresh herbs or cheese for a quick meal.";
            } else if (names.length === 1 && names[0] === 'chicken') {
                recipeTitle.textContent = "Shredded Chicken Salad with Sesame Dressing";
                recipeDesc.textContent = "Shred leftover cooked chicken and toss with toasted sesame oil, soy sauce, cucumbers, and cilantro for a refreshing protein salad.";
            } else {
                recipeTitle.textContent = "Zero-Waste Leftover Fusion Stir-Fry";
                recipeDesc.textContent = "Chop up your selected leftovers, sauté on high heat with ginger, garlic, and soy sauce. Serve hot over noodles, bread, or rice!";
            }
        });
    }

    // Quiz Logic
    const quizQuestions = [
        {
            question: "Which sector in Singapore generates the largest share of food waste?",
            options: ["Domestic / Households", "Food & Beverage Outlets", "Supermarkets / Retail", "Food Manufacturing"],
            answer: 0,
            feedback: "Correct! Households account for the largest single share of Singapore's food waste."
        },
        {
            question: "What is the primary disposal method for unrecyclable food waste in Singapore?",
            options: ["Landfill burial", "Waste-to-energy incineration", "Ocean dumping", "Composting"],
            answer: 1,
            feedback: "Correct! Most unrecyclable waste goes to waste-to-energy incineration plants."
        }
    ];
    let currentQuestion = 0;
    const qTitle = document.getElementById('quiz-question-title');
    const qOptions = document.getElementById('quiz-options-area');
    const qFeedback = document.getElementById('quiz-feedback');

    function loadQuizQuestion() {
        if (!qTitle) return;
        const q = quizQuestions[currentQuestion];
        qTitle.textContent = q.question;
        qOptions.innerHTML = '';
        if (qFeedback) qFeedback.textContent = '';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                playClickSfx();
                const allBtns = qOptions.querySelectorAll('button');
                allBtns.forEach(b => b.disabled = true);

                if (idx === q.answer) {
                    btn.classList.add('correct');
                    if (qFeedback) {
                        qFeedback.textContent = q.feedback;
                        qFeedback.className = 'quiz-feedback correct-text';
                    }
                    playChimeSfx();
                    if (typeof confetti === 'function') {
                        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                    }
                } else {
                    btn.classList.add('incorrect');
                    allBtns[q.answer].classList.add('correct');
                    if (qFeedback) {
                        qFeedback.textContent = "Not quite! " + q.feedback;
                        qFeedback.className = 'quiz-feedback incorrect-text';
                    }
                }

                setTimeout(() => {
                    currentQuestion = (currentQuestion + 1) % quizQuestions.length;
                    loadQuizQuestion();
                }, 3500);
            });
            qOptions.appendChild(btn);
        });
    }
    loadQuizQuestion();

    // Pledge & Counter Logic
    const pledgeForm = document.getElementById('pledge-form');
    const pledgeNameInput = document.getElementById('pledge-name');
    const heroPledgeCount = document.getElementById('hero-pledge-count');
    const pledgeCountDisplay = document.getElementById('pledge-count-display');
    const impactPledges = document.getElementById('impact-pledges');
    const pledgeBarFill = document.getElementById('pledge-bar-fill');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    let totalPledges = parseInt(localStorage.getItem('leftoverHeroesPledges') || '0');

    function updatePledgeDisplay() {
        if (heroPledgeCount) heroPledgeCount.textContent = totalPledges;
        if (pledgeCountDisplay) pledgeCountDisplay.textContent = totalPledges;
        if (impactPledges) impactPledges.textContent = totalPledges;
        if (pledgeBarFill) {
            const percentage = Math.min((totalPledges / 100) * 100, 100);
            pledgeBarFill.style.width = `${percentage}%`;
        }
    }
    updatePledgeDisplay();

    if (pledgeForm) {
        pledgeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = pledgeNameInput ? pledgeNameInput.value.trim() : '';
            if (!name) return;

            playChimeSfx();
            totalPledges++;
            localStorage.setItem('leftoverHeroesPledges', totalPledges);
            updatePledgeDisplay();

            if (pledgeNameInput) pledgeNameInput.value = '';
            if (modalOverlay) modalOverlay.classList.add('active');

            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        });
    }

    if (modalCloseBtn && modalOverlay) {
        modalCloseBtn.addEventListener('click', () => {
            playClickSfx();
            modalOverlay.classList.remove('active');
        });
    }
});
