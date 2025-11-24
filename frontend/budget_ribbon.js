// ===== BUDGET RIBBON LOGIC =====

let currentBudgetCategory = 'smr'; // Default category

// Initialize ribbon when budget tab is shown
function initializeBudgetRibbon() {
    const ribbon = document.getElementById('budget-ribbon');
    const ribbonBtns = document.querySelectorAll('.ribbon-btn');

    if (!ribbon || ribbonBtns.length === 0) return;

    // Add click handlers to ribbon buttons
    ribbonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            switchBudgetCategory(category);
        });
    });

    // Show ribbon when budget tab is active
    showBudgetRibbon();
}

// Show/hide ribbon based on active tab
function showBudgetRibbon() {
    const ribbon = document.getElementById('budget-ribbon');
    if (!ribbon) return;

    ribbon.classList.add('active');
}

function hideBudgetRibbon() {
    const ribbon = document.getElementById('budget-ribbon');
    if (!ribbon) return;

    ribbon.classList.remove('active');
}

// Switch between budget categories
function switchBudgetCategory(category) {
    currentBudgetCategory = category;

    // Update active button
    document.querySelectorAll('.ribbon-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    // Render appropriate content
    const container = document.getElementById('budget-container');
    if (!container) return;

    switch (category) {
        case 'smr':
            renderBudget(); // Existing function
            break;
        case 'investments':
            renderInvestments();
            break;
        case 'management':
            renderManagement();
            break;
    }
}

// Render Investments category (placeholder for now)
function renderInvestments() {
    const container = document.getElementById('budget-container');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#217C3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <h2 style="color: #217C3E; margin-bottom: 12px;">Инвестиции</h2>
            <p style="color: #605E5C; font-size: 16px; max-width: 600px; margin: 0 auto;">
                Здесь будет учет инвестиционных затрат:<br>
                • Покупка земли<br>
                • ПИР (Проектирование)<br>
                • ИРД (Разрешения и документы)<br>
                • Техприсоединение<br>
                • Маркетинг и реклама<br>
                • Страхование и резервный фонд
            </p>
            <p style="color: #A19F9D; margin-top: 24px; font-size: 14px;">
                Функционал в разработке...
            </p>
        </div>
    `;
}

// Render Management category (placeholder for now)
function renderManagement() {
    const container = document.getElementById('budget-container');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#217C3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h2 style="color: #217C3E; margin-bottom: 12px;">Управление</h2>
            <p style="color: #605E5C; font-size: 16px; max-width: 600px; margin: 0 auto;">
                Здесь будет учет накладных расходов:<br>
                • ФОТ ИТР (Прораб, Технадзор, Геодезист)<br>
                • Содержание стройплощадки (Охрана, Вагончики)<br>
                • Административные расходы (Офис, Связь)<br>
                • Коммунальные платежи<br>
                • Транспортные расходы
            </p>
            <p style="color: #A19F9D; margin-top: 24px; font-size: 14px;">
                Функционал в разработке...
            </p>
        </div>
    `;
}

// Hook into tab switching to show/hide ribbon
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for app.js to set up tabs
    setTimeout(() => {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                if (tab === 'budget') {
                    initializeBudgetRibbon();
                    showBudgetRibbon();
                } else {
                    hideBudgetRibbon();
                }
            });
        });
    }, 100);
});
