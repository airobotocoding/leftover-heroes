document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tracker-form');
    const itemInput = document.getElementById('food-item');
    const gramsInput = document.getElementById('food-grams');
    const reasonSelect = document.getElementById('waste-reason');
    
    const itemError = document.getElementById('item-error');
    const gramsError = document.getElementById('grams-error');
    const successMsg = document.getElementById('tracker-success');
    
    const totalGramsDisplay = document.getElementById('total-grams-display');
    const logEntriesContainer = document.getElementById('log-entries');
    const emptyState = document.getElementById('empty-state');
    const noMatchState = document.getElementById('no-match-state');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const filterButtonsGroup = document.getElementById('filter-buttons-group');
    const chartEmptyState = document.getElementById('chart-empty-state');
    const chartContainerElem = document.querySelector('.tracker-chart-container');

    let logEntries = JSON.parse(localStorage.getItem('leftover_waste_logs')) || [];
    let currentFilter = 'All';
    let trackerChart = null;

    const REASON_COLORS = {
        'Cooked too much': '#22C55E',
        'Went bad': '#F97316',
        'Forgot about it': '#3B82F6',
        "Didn't like it": '#A855F7'
    };

    function getReasonIcon(reason) {
        switch(reason) {
            case 'Cooked too much': return 'utensils';
            case 'Went bad': return 'alert-triangle';
            case 'Forgot about it': return 'clock';
            case "Didn't like it": return 'frown';
            default: return 'info';
        }
    }

    function initChart() {
        const ctx = document.getElementById('trackerDoughnutChart').getContext('2d');
        trackerChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cooked too much', 'Went bad', 'Forgot about it', "Didn't like it"],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        REASON_COLORS['Cooked too much'],
                        REASON_COLORS['Went bad'],
                        REASON_COLORS['Forgot about it'],
                        REASON_COLORS["Didn't like it"]
                    ],
                    borderWidth: 2,
                    borderColor: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: { family: 'Inter', size: 11 },
                            color: document.body.classList.contains('dark-mode') ? '#cbd5e1' : '#4b5563'
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    function updateChartData() {
        if (!trackerChart) return;

        const totals = {
            'Cooked too much': 0,
            'Went bad': 0,
            'Forgot about it': 0,
            "Didn't like it": 0
        };

        logEntries.forEach(entry => {
            if (totals.hasOwnProperty(entry.reason)) {
                totals[entry.reason] += Number(entry.grams);
            }
        });

        trackerChart.data.datasets[0].data = [
            totals['Cooked too much'],
            totals['Went bad'],
            totals['Forgot about it'],
            totals["Didn't like it"]
        ];

        // Update border colors based on current theme mode
        trackerChart.data.datasets[0].borderColor = document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff';
        trackerChart.options.plugins.legend.labels.color = document.body.classList.contains('dark-mode') ? '#cbd5e1' : '#4b5563';
        
        trackerChart.update();

        if (logEntries.length === 0) {
            chartEmptyState.style.display = 'flex';
            chartContainerElem.style.display = 'none';
        } else {
            chartEmptyState.style.display = 'none';
            chartContainerElem.style.display = 'block';
        }
    }

    function renderLogs() {
        logEntriesContainer.innerHTML = '';
        
        if (logEntries.length === 0) {
            emptyState.style.display = 'block';
            noMatchState.style.display = 'none';
            clearAllBtn.style.display = 'none';
            filterButtonsGroup.style.display = 'none';
            totalGramsDisplay.textContent = '0 g';
            updateChartData();
            return;
        }

        emptyState.style.display = 'none';
        clearAllBtn.style.display = 'inline-block';
        filterButtonsGroup.style.display = 'flex';

        let totalGrams = 0;
        logEntries.forEach(entry => {
            totalGrams += Number(entry.grams);
        });
        totalGramsDisplay.textContent = `${totalGrams.toLocaleString()} g`;

        // Filter entries
        const filteredEntries = logEntries.filter(entry => {
            if (currentFilter === 'All') return true;
            return entry.reason === currentFilter;
        });

        if (filteredEntries.length === 0) {
            noMatchState.style.display = 'block';
        } else {
            noMatchState.style.display = 'none';
            filteredEntries.forEach((entry) => {
                // Find actual index in original logEntries array for deletion
                const originalIndex = logEntries.findIndex(e => e === entry);

                const card = document.createElement('div');
                card.className = 'log-card fade-in appear';
                
                const iconName = getReasonIcon(entry.reason);

                card.innerHTML = `
                    <div class="log-card-left">
                        <div class="log-icon"><i data-lucide="${iconName}"></i></div>
                        <div class="log-details">
                            <h4>${escapeHTML(entry.item)}</h4>
                            <span class="log-meta">${escapeHTML(entry.reason)} &bull; ${entry.date || 'Today'}</span>
                        </div>
                    </div>
                    <div class="log-card-right">
                        <span class="log-grams">${entry.grams} g</span>
                        <button class="btn-delete" data-index="${originalIndex}" aria-label="Delete entry">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                `;
                logEntriesContainer.appendChild(card);
            });
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Attach delete listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                logEntries.splice(idx, 1);
                saveAndRender();
            });
        });

        updateChartData();
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function saveAndRender() {
        localStorage.setItem('leftover_waste_logs', JSON.stringify(logEntries));
        renderLogs();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const itemName = itemInput.value.trim();
        const gramsVal = gramsInput.value.trim();
        const reasonVal = reasonSelect.value;

        let isValid = true;
        itemError.textContent = '';
        gramsError.textContent = '';
        successMsg.textContent = '';

        if (!itemName) {
            itemError.textContent = 'Please enter a food item name.';
            isValid = false;
        } else if (itemName.length > 40) {
            itemError.textContent = 'Food item name cannot exceed 40 characters.';
            isValid = false;
        }

        const gramsNum = Number(gramsVal);
        if (!gramsVal || isNaN(gramsNum) || !Number.isInteger(gramsNum) || gramsNum < 1 || gramsNum > 5000) {
            gramsError.textContent = 'Please enter a whole number between 1 and 5000 grams.';
            isValid = false;
        }

        if (!isValid) return;

        const newEntry = {
            item: itemName,
            grams: gramsNum,
            reason: reasonVal,
            date: new Date().toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })
        };

        logEntries.unshift(newEntry);
        saveAndRender();

        form.reset();
        successMsg.textContent = '✨ Entry added successfully! Thank you for tracking your food waste.';
        setTimeout(() => {
            successMsg.textContent = '';
        }, 4000);
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all logged food waste entries?')) {
            logEntries = [];
            currentFilter = 'All';
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const allBtn = document.querySelector('.filter-btn[data-filter="All"]');
            if (allBtn) allBtn.classList.add('active');
            saveAndRender();
        }
    });

    // Filter Buttons Logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.getAttribute('data-filter');
            renderLogs();
        });
    });

    // Listen for dark mode theme toggle changes to update chart legend colors & borders
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            setTimeout(updateChartData, 50);
        });
    }

    // Initialize Chart & Render logs
    initChart();
    renderLogs();
});
