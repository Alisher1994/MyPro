
// --- Приход: таблица, модалка, логика через API ---
let incomeRows = [];
let editingIncomeId = null;
let selectedId = null;

// --- Simple password gate ---
function showPasswordGate() {
    // create overlay
    let overlay = document.createElement('div');
    overlay.id = 'pw-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = '#000';
    overlay.style.zIndex = '99999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = '#fff';
    overlay.style.fontSize = '18px';
    overlay.style.flexDirection = 'column';
    overlay.innerHTML = '<div style="text-align:center;max-width:90%;">Доступ ограничен. Введите пароль чтобы продолжить.</div>';
    document.body.appendChild(overlay);

    // allow overlay to render before prompting
    setTimeout(() => {
        const correct = '9503';
        while (true) {
            const val = prompt('Введите пароль:');
            // if user cancelled, keep asking
            if (val === null) continue;
            if (val === correct) {
                // remember success for this session
                try { sessionStorage.setItem('pw_ok', '1'); } catch (e) { /* ignore */ }
                // remove overlay and exit
                const el = document.getElementById('pw-overlay');
                if (el) el.parentNode.removeChild(el);
                break;
            } else {
                alert('Неправильный пароль');
            }
        }
    }, 0);
}

// Invoke password gate on load unless already accepted in this session
try {
    if (!sessionStorage.getItem('pw_ok')) {
        window.addEventListener('load', () => {
            showPasswordGate();
        });
    }
} catch (e) {
    // sessionStorage may be unavailable in some contexts; fallback to showing gate
    window.addEventListener('load', () => showPasswordGate());
}

// --- Helper: Format Number (1 000 000) ---
function formatNumber(num) {
    if (num === null || num === undefined) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// --- Helper: Parse Number (remove spaces) ---
function parseNumber(str) {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/\s/g, '')) || 0;
}

// --- Input Formatting for Amount ---
const amountInput = document.getElementById('income-amount');
if (amountInput) {
    amountInput.addEventListener('input', function (e) {
        // Remove non-digits
        let val = e.target.value.replace(/\D/g, '');
        // Format
        e.target.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    });
}

async function loadIncomes() {
    if (!selectedId) return;
    try {
        const res = await fetch(`/objects/${selectedId}/incomes/`);
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
        incomeRows = await res.json();
        renderIncomeTable();
    } catch (err) {
        console.error("Failed to load incomes:", err);
        alert("Не удалось загрузить данные: " + err.message);
    }
}

function renderIncomeTable() {
    const tbody = document.getElementById('income-tbody');
    tbody.innerHTML = '';
    let total = 0;
    incomeRows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        // Safe fallback for image
        const photoHtml = row.photo
            ? `<img src="${row.photo}?t=${Date.now()}" class="income-photo-thumb income-photo-view" data-idx="${idx}" alt="Фото">`
            : '<span style="color:#ccc;font-size:0.8em;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera-off-icon lucide-camera-off"><path d="M14.564 14.558a3 3 0 1 1-4.122-4.121"/><path d="m2 2 20 20"/><path d="M20 20H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 .819-.175"/><path d="M9.695 4.024A2 2 0 0 1 10.004 4h3.993a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v7.344"/></svg></span>';

        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${row.date}</td>
            <td>${photoHtml}</td>
            <td>${formatNumber(row.amount)}</td>
            <td>${row.sender || row.from || ''}</td>
            <td>${row.receiver || row.to || ''}</td>
            <td>${row.comment || ''}</td>
            <td>
                <button class="icon-btn income-edit" title="Изменить" data-idx="${idx}">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 13.5V16h2.5l7.1-7.1-2.5-2.5L4 13.5z" stroke="#0057d8" stroke-width="1.5"/><path d="M13.5 6.5l2 2" stroke="#0057d8" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <button class="icon-btn income-delete" title="Удалить" data-idx="${idx}">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="5" y="8" width="10" height="7" rx="2" stroke="#d80027" stroke-width="1.5"/><path d="M8 10v3M12 10v3" stroke="#d80027" stroke-width="1.5" stroke-linecap="round"/><rect x="8" y="4" width="4" height="2" rx="1" fill="#d80027"/></svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        total += Number(row.amount) || 0;
    });
    document.getElementById('income-total').textContent = formatNumber(total);

    // Кнопки удалить
    tbody.querySelectorAll('.income-delete').forEach(btn => {
        btn.onclick = async function () {
            const idx = Number(btn.dataset.idx);
            const row = incomeRows[idx];
            if (confirm('Удалить эту строку?')) {
                try {
                    const res = await fetch(`/objects/${selectedId}/incomes/${row.id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Delete failed');
                    await loadIncomes();
                } catch (e) {
                    alert("Ошибка удаления: " + e.message);
                }
            }
        };
    });
    // Кнопки редактировать
    tbody.querySelectorAll('.income-edit').forEach(btn => {
        btn.onclick = function () {
            const idx = Number(btn.dataset.idx);
            const row = incomeRows[idx];
            document.getElementById('income-date').value = row.date;
            document.getElementById('income-amount').value = formatNumber(row.amount);
            document.getElementById('income-from').value = row.sender || row.from || '';
            document.getElementById('income-to').value = row.receiver || row.to || '';
            document.getElementById('income-comment').value = row.comment;
            document.getElementById('income-edit-index').value = idx;
            document.getElementById('income-modal').dataset.photo = row.photo || '';
            editingIncomeId = row.id;
            document.getElementById('income-modal').style.display = 'flex';
        };
    });
    // Просмотр фото
    tbody.querySelectorAll('.income-photo-view').forEach(img => {
        img.onclick = function () {
            const idx = Number(img.dataset.idx);
            const row = incomeRows[idx];
            if (row.photo) {
                const modal = document.getElementById('photo-modal');
                const modalImg = document.getElementById('photo-modal-img');
                modalImg.src = row.photo;
                modal.style.display = 'flex';
            }
        };
    });
}

document.getElementById('add-income').onclick = function () {
    document.getElementById('income-modal').style.display = 'flex';
    document.getElementById('income-form').reset();
    document.getElementById('income-photo').value = '';
    document.getElementById('income-modal').dataset.photo = '';
    document.getElementById('income-edit-index').value = '';
    document.getElementById('income-date').value = new Date().toISOString().slice(0, 10);
    editingIncomeId = null;
};

// Закрытие модалок (универсальное)
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.onclick = function () {
        btn.closest('.modal').style.display = 'none';
        // Очистка src для фото-модалки
        if (btn.id === 'photo-modal-close') {
            document.getElementById('photo-modal-img').src = '';
        }
    };
});

// Закрытие по клику на фон
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
        if (event.target.id === 'photo-modal') {
            document.getElementById('photo-modal-img').src = '';
        }
    }
};

document.getElementById('income-photo').onchange = function (e) {
    // Предпросмотр не нужен, фото отправляется на сервер
};

document.getElementById('income-form').onsubmit = async function (e) {
    e.preventDefault();
    const date = document.getElementById('income-date').value;
    const amountStr = document.getElementById('income-amount').value;
    const amount = parseNumber(amountStr);
    const sender = document.getElementById('income-from').value;
    const receiver = document.getElementById('income-to').value;
    const comment = document.getElementById('income-comment').value;
    const photoInput = document.getElementById('income-photo');
    // Валидация обязательных полей
    if (!date || isNaN(amount) || amount <= 0) {
        alert('Заполните дату и сумму (число > 0)');
        return false;
    }
    const formData = new FormData();
    formData.append('date', date);
    formData.append('amount', amount);
    formData.append('sender', sender);
    formData.append('receiver', receiver);
    formData.append('comment', comment);
    if (photoInput.files[0]) {
        formData.append('photo', photoInput.files[0]);
    }
    let response;
    try {
        if (editingIncomeId) {
            response = await fetch(`/objects/${selectedId}/incomes/${editingIncomeId}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            response = await fetch(`/objects/${selectedId}/incomes/`, {
                method: 'POST',
                body: formData
            });
        }
        if (!response.ok) {
            const err = await response.text();
            alert('Ошибка: ' + err);
            return false;
        }
    } catch (err) {
        alert('Ошибка сети: ' + err);
        return false;
    }
    document.getElementById('income-modal').style.display = 'none';
    await loadIncomes();
    return false;
};

async function fetchObjects() {
    const res = await fetch('/objects/');
    return res.json();
}

function setActiveTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-content').forEach(div => {
        div.style.display = div.id === 'tab-' + tab ? '' : 'none';
    });
    // Save active tab
    localStorage.setItem('activeTab', tab);

    // Если выбрана вкладка "приход" — обновить данные
    if (tab === 'income') {
        loadIncomes();
    }

    // Если выбрана вкладка "бюджет" — обновить данные
    if (tab === 'budget' && selectedId && window.loadBudget) {
        window.loadBudget(selectedId);
    }

    // Если выбрана вкладка "расход" — обновить данные
    if (tab === 'expense' && selectedId && window.loadExpenses) {
        window.loadExpenses(selectedId);
    }

    // Если выбрана вкладка "анализ" — обновить данные
    if (tab === 'analysis' && selectedId && window.loadAnalysis) {
        window.loadAnalysis(selectedId);
    }
}

// Вкладки переключение (инициализация сразу после определения)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => setActiveTab(btn.dataset.tab);
    });
});

async function renderList() {
    const list = document.getElementById('object-list');
    list.innerHTML = '';
    const objects = await fetchObjects();
    objects.forEach((obj, index) => {
        const li = document.createElement('li');
        // Icon SVG
        const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-plus-icon lucide-house-plus" style="margin-right: 8px; color: #555;"><path d="M12.35 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v2.35"/><path d="M14.8 12.4A1 1 0 0 0 14 12h-4a1 1 0 0 0-1 1v8"/><path d="M15 18h6"/><path d="M18 15v6"/></svg>`;
        li.innerHTML = `${icon} <span>${index + 1}. ${obj.name}</span>`;
        li.dataset.id = obj.id; // Store ID for restoration
        li.onclick = () => {
            selectObject(obj.id, li);
            // Close sidebar on mobile selection
            if (window.innerWidth <= 700) {
                sidebar.classList.remove('open');
                sidebarToggle.style.display = 'block';
            }
        };
        if (obj.id === selectedId) li.classList.add('selected');
        list.appendChild(li);
    });

    // Restore state after list render
    restoreState();
}

function showTabs(show) {
    const row = document.getElementById('tabs-actions-row');
    const tabs = document.getElementById('tabs');
    const actions = document.getElementById('object-actions');
    const isMobile = window.innerWidth <= 700;

    if (show) {
        row.style.display = 'flex';
        tabs.style.display = 'flex';
        actions.style.display = 'flex';
    } else {
        tabs.style.display = 'none';
        actions.style.display = 'none';
        // On mobile, keep the row visible so the sidebar toggle button is accessible
        if (isMobile) {
            row.style.display = 'flex';
        } else {
            row.style.display = 'none';
        }
    }
    document.querySelectorAll('.tab-content').forEach(div => div.style.display = 'none');
}

window.addEventListener('resize', () => {
    if (!selectedId) {
        showTabs(false);
    }
});

function selectObject(id, li) {
    selectedId = id;
    // Save selected object
    localStorage.setItem('selectedId', id);

    document.querySelectorAll('#object-list li').forEach(el => el.classList.remove('selected'));
    if (li) li.classList.add('selected');

    showTabs(true);

    // Restore tab or default to 'income'
    const savedTab = localStorage.getItem('activeTab') || 'income';
    setActiveTab(savedTab);

    loadIncomes().then(() => {
        // Restore scroll position after data load
        const scrollY = localStorage.getItem('scrollY');
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY));
        }
    });
}

function clearSelection() {
    selectedId = null;
    localStorage.removeItem('selectedId');
    showTabs(false);
    document.querySelectorAll('#object-list li').forEach(el => el.classList.remove('selected'));
}

// --- State Restoration ---
function restoreState() {
    const savedId = localStorage.getItem('selectedId');
    if (savedId) {
        const id = parseInt(savedId);
        // Find list item
        const li = document.querySelector(`#object-list li[data-id="${id}"]`);
        if (li) {
            selectObject(id, li);
        }
    }
}

// Save scroll position on unload
window.addEventListener('beforeunload', () => {
    localStorage.setItem('scrollY', window.scrollY);
});

document.getElementById('add-object').onclick = async () => {
    const name = prompt('Введите имя объекта:');
    if (!name) return;
    await fetch('/objects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    renderList();
};

document.getElementById('rename-btn').onclick = async () => {
    if (!selectedId) return;
    const name = prompt('Новое имя объекта:');
    if (!name) return;
    await fetch(`/objects/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    renderList();
};

document.getElementById('delete-btn').onclick = async () => {
    if (!selectedId) return;
    if (!confirm('Удалить объект?')) return;
    await fetch(`/objects/${selectedId}`, { method: 'DELETE' });
    clearSelection();
    renderList();
};

// Mobile Sidebar Toggle
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebar-close');

if (sidebarToggle) {
    sidebarToggle.onclick = function () {
        sidebar.classList.add('open');
        sidebarToggle.style.display = 'none';
    };
}
if (sidebarClose) {
    sidebarClose.onclick = function () {
        sidebar.classList.remove('open');
        // Show toggle button again if on mobile
        if (window.innerWidth <= 700) {
            sidebarToggle.style.display = 'block';
        }
    };
}

// Генерация HTML для скачивания/печати прихода
function downloadIncome() {
    if (!selectedId || !incomeRows || incomeRows.length === 0) {
        alert('Нет данных для скачивания');
        return;
    }

    // Получаем название объекта
    const objectName = document.querySelector('#object-list li.selected')?.textContent.trim() || 'Объект';

    // Форматируем дату
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Генерируем HTML таблицы
    let tableHTML = '';
    let total = 0;

    incomeRows.forEach((row, idx) => {
        const photoHtml = row.photo
            ? `<img src="${row.photo}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 3px;" alt="Фото">`
            : '<span style="color: #ccc; font-size: 10px;">—</span>';

        tableHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${row.date}</td>
                <td>${photoHtml}</td>
                <td class="text-right">${formatNumber(row.amount)}</td>
                <td>${row.sender || row.from || ''}</td>
                <td>${row.receiver || row.to || ''}</td>
                <td>${row.comment || ''}</td>
            </tr>
        `;
        total += Number(row.amount) || 0;
    });

    // Полный HTML документ
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Приход - ${objectName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #333;
        }
        .header p {
            font-size: 14px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 12px;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .text-right {
            text-align: right;
        }
        .total-row {
            background-color: #f0f7ff;
            font-size: 16px;
            font-weight: bold;
        }
        .total-row td {
            padding: 12px 8px;
            border: 2px solid #0067c0;
        }
        @media print {
            body {
                padding: 10px;
            }
            .header {
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <img class="pdf-logo" src="/frontend/assets/design_key.png" alt="logo" style="position:fixed;top:10px;right:10px;width:64px;height:auto;opacity:0.95;z-index:9999;">
    <div class="header">
        <h1>${objectName}</h1>
        <p>Дата формирования: ${dateStr}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th style="width: 30px;">№</th>
                <th style="width: 100px;">Дата</th>
                <th style="width: 60px;">Фото</th>
                <th style="width: 120px;">Сумма</th>
                <th style="width: 150px;">Кто передал</th>
                <th style="width: 150px;">Кто получил</th>
                <th>Комментарии</th>
            </tr>
        </thead>
        <tbody>
            ${tableHTML}
            <tr class="total-row">
                <td colspan="3">ИТОГО:</td>
                <td class="text-right">${formatNumber(total)}</td>
                <td colspan="3"></td>
            </tr>
        </tbody>
    </table>
</body>
</html>
    `;

    // Открываем в новом окне
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();

    // Автоматически открываем диалог печати
    printWindow.onload = function () {
        printWindow.print();
    };
}

// Download Button Logic
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-income');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            downloadIncome();
        };
    }
    // Кнопка "Скачать" для анализа — вызывает уже существующий экспортный метод
    const downloadAnalysisBtn = document.getElementById('download-analysis');
    if (downloadAnalysisBtn) {
        downloadAnalysisBtn.onclick = () => {
            if (window.exportAnalysisReport) {
                window.exportAnalysisReport();
            } else {
                alert('Экспорт анализа недоступен');
            }
        };
    }
});

// При старте скрываем вкладки и кнопки
// clearSelection(); // Don't clear on start, let restoreState handle it
renderList();

// Try to show sidebar logo if file exists at frontend/assets/design_key.png
try {
    const logoEl = document.getElementById('sidebar-logo');
    if (logoEl) {
        const img = new Image();
        img.onload = () => {
            logoEl.src = img.src;
            logoEl.style.display = 'inline-block';
        };
        img.onerror = () => {
            // keep hidden if not found
        };
        img.src = 'assets/design_key.png';
    }
} catch (e) { /* ignore */ }
