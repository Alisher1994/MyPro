// ===== ANALYSIS TAB LOGIC =====

let analysisData = {
    budget: 0,
    income: 0,
    expense: 0,
    balance: 0,
    overrun: 0,
    resources: {}
};
// Collapsed state for sections: true = collapsed
analysisData.collapsedSections = {
    cards: true,
    progress: true,
    resources: true
};

// Icons for resource types in Analysis (black stroke)
const ANALYSIS_RESOURCE_ICONS = {
    'Материал': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-box-icon lucide-box"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    'Доставка': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus-icon lucide-bus"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>`,
    'Инструменты': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-drill-icon lucide-drill"><path d="M10 18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1z"/><path d="M13 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1l-.81 3.242a1 1 0 0 1-.97.758H8"/><path d="M14 4h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3"/><path d="M18 6h4"/><path d="m5 10-2 8"/><path d="m7 18 2-8"/></svg>`,
    'Оборудование': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cable-icon lucide-cable"><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z"/><path d="M17 21v-2"/><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10"/><path d="M21 21v-2"/><path d="M3 5V3"/><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z"/><path d="M7 5V3"/></svg>`,
    'Питание': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils-icon lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
    'Коммуналка': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame-kindling-icon lucide-flame-kindling"><path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C8 4.5 11 2 12 2Z"/><path d="m5 22 14-4"/><path d="m5 18 14 4"/></svg>`,
    'Документация': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
    'Расходные материалы': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paint-roller-icon lucide-paint-roller"><rect width="16" height="6" x="2" y="2" rx="2"/><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect width="4" height="6" x="8" y="16" rx="1"/></svg>`,
    'Трудоресурсы': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hard-hat-icon lucide-hard-hat"><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M14 6a6 6 0 0 1 6 6v3"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><rect x="2" y="15" width="20" height="4" rx="1"/></svg>`,
    'Мебель': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-armchair-icon lucide-armchair"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>`
    ,
    'Техника': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tractor-icon lucide-tractor"><path d="m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20"/><path d="M16 18h-5"/><path d="M18 5a1 1 0 0 0-1 1v5.573"/><path d="M3 4h8.129a1 1 0 0 1 .99.863L13 11.246"/><path d="M4 11V4"/><path d="M7 15h.01"/><path d="M8 10.1V4"/><circle cx="18" cy="18" r="2"/><circle cx="7" cy="15" r="5"/></svg>`
};

// Загрузка данных для анализа
async function loadAnalysis(objectId) {
    if (!objectId) return;
    analysisData.objectId = objectId;

    try {
        // Загружаем все данные параллельно
        const [budgetRes, incomeRes, expenseRes] = await Promise.all([
            fetch(`/objects/${objectId}/budget/tree/`),
            fetch(`/objects/${objectId}/incomes/`),
            fetch(`/objects/${objectId}/expenses/tree`)
        ]);

        if (!budgetRes.ok || !incomeRes.ok || !expenseRes.ok) {
            throw new Error('Failed to load data');
        }

        const budgetData = await budgetRes.json();
        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();

        // Рассчитываем показатели
        calculateAnalysis(budgetData, incomeData, expenseData);
        // Загрузим сохранённые фото для этого объекта
        await loadAnalysisPhotos(objectId);
        renderAnalysis();
    } catch (err) {
        console.error('Error loading analysis:', err);
        document.getElementById('analysis-container').innerHTML =
            '<p style="padding:20px;text-align:center;color:#999;">Ошибка загрузки данных</p>';
    }
}

// Расчет всех показателей
function calculateAnalysis(budgetData, incomeData, expenseData) {
    // Бюджет
    analysisData.budget = calculateTotalBudget(budgetData);

    // Приход
    analysisData.income = incomeData.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Расход
    analysisData.expense = calculateTotalExpense(expenseData);

    // Остаток (приход - расход)
    analysisData.balance = analysisData.income - analysisData.expense;

    // Перерасход (бюджет - расходы)
    analysisData.overrun = analysisData.budget - analysisData.expense;

    // По типам ресурсов
    analysisData.resources = calculateResourcesByType(budgetData, expenseData);
}

// Расчет общей суммы бюджета
function calculateTotalBudget(budgetData) {
    return budgetData.reduce((sum, stage) => {
        return sum + (stage.work_types || []).reduce((wtSum, wt) => {
            return wtSum + (wt.resources || []).reduce((resSum, res) => {
                return resSum + ((res.quantity || 0) * (res.price || 0));
            }, 0);
        }, 0);
    }, 0);
}

// Расчет общей суммы расходов
function calculateTotalExpense(expenseData) {
    return expenseData.reduce((sum, stage) => {
        return sum + (stage.work_types || []).reduce((wtSum, wt) => {
            return wtSum + (wt.resources || []).reduce((resSum, res) => {
                if (!res.expenses) return resSum;
                return resSum + res.expenses.reduce((expSum, exp) => {
                    return expSum + ((exp.actual_quantity || 0) * (exp.actual_price || 0));
                }, 0);
            }, 0);
        }, 0);
    }, 0);
}

// Расчет по типам ресурсов
function calculateResourcesByType(budgetData, expenseData) {
    const resources = {};

    // Типы ресурсов из константы
    const resourceTypes = [
        'Трудоресурсы', 'Материал', 'Доставка', 'Оборудование',
        'Мебель', 'Инструменты', 'Коммуналка', 'Документация',
        'Расходные материалы', 'Питание', 'Техника'
    ];

    // Инициализируем все типы
    resourceTypes.forEach(type => {
        resources[type] = { plan: 0, fact: 0 };
    });

    // Считаем план из бюджета
    budgetData.forEach(stage => {
        (stage.work_types || []).forEach(wt => {
            (wt.resources || []).forEach(res => {
                const type = res.resource_type || 'Материал';
                if (resources[type]) {
                    resources[type].plan += (res.quantity || 0) * (res.price || 0);
                }
            });
        });
    });

    // Считаем факт из расходов
    expenseData.forEach(stage => {
        (stage.work_types || []).forEach(wt => {
            (wt.resources || []).forEach(res => {
                const type = res.resource_type || 'Материал';
                if (resources[type] && res.expenses) {
                    res.expenses.forEach(exp => {
                        resources[type].fact += (exp.actual_quantity || 0) * (exp.actual_price || 0);
                    });
                }
            });
        });
    });

    return resources;
}

// Рендеринг анализа
function renderAnalysis() {
    const container = document.getElementById('analysis-container');
    if (!container) return;

    // Ensure analysisPhotos array exists (4 slots)
    if (!analysisData.analysisPhotos) analysisData.analysisPhotos = [null, null, null, null];

    container.innerHTML = `
        <!-- Данные объекта -->
        <div class="analysis-object-section">
            <h2 class="analysis-section-title">Данные объекта</h2>
            <div class="analysis-object-header">
                <div class="object-name-wrap"><span id="object-name" class="object-name editable">Объект</span></div>
                <div class="object-quick-params">
                    <label>Общая площадь (м²)<br><input type="number" id="obj-area" min="0" step="0.01" value="0" oninput="onObjectFieldChange()"></label>
                    <label>Дата начала<br><input type="date" id="obj-start-date" onchange="onObjectFieldChange()"></label>
                    <label>Дата окончания<br><input type="date" id="obj-end-date" onchange="onObjectFieldChange()"></label>
                </div>
            </div>

            <div class="analysis-object-photos">
                ${renderImageUploadGrid()}
            </div>

            <div class="analysis-object-params">
                <div class="object-param-row prices-row">
                            <div class="price-m2-section" style="width:100%">
                                <div class="analysis-progress-item">
                                    <div class="analysis-progress-header">
                                        <span class="analysis-progress-label">Цена / м² (план)</span>
                                        <span class="analysis-progress-value" id="price-plan-value">0 сум</span>
                                    </div>
                                    <div class="analysis-progress-bar-container">
                                        <div class="analysis-progress-bar neutral" id="price-plan-bar" style="width:0%"> </div>
                                    </div>
                                </div>

                                <div class="analysis-progress-item">
                                    <div class="analysis-progress-header">
                                        <span class="analysis-progress-label">Цена / м² (факт)</span>
                                        <span class="analysis-progress-value" id="price-fact-value">0 сум</span>
                                    </div>
                                    <div class="analysis-progress-bar-container">
                                        <div class="analysis-progress-bar" id="price-fact-bar" style="width:0%"> </div>
                                    </div>
                                </div>
                            </div>
                </div>
            </div>
        </div>

        <!-- Финансовые карточки (collapsible) -->
        <div class="analysis-collapsible ${analysisData.collapsedSections.cards ? 'collapsed' : ''}" data-section="cards">
            <div class="analysis-collapsible-header" onclick="toggleAnalysisSection('cards')">
                <span class="analysis-section-title">Аналитика по финансам</span>
                <button class="collapser">${analysisData.collapsedSections.cards ? '+' : '−'}</button>
            </div>
            <div class="analysis-collapsible-body">
                <div class="analysis-cards-grid single-row">
                    <div class="analysis-card">
                        <div class="analysis-card-title"><span class="card-icon">${svgIcon('income')}</span>Приход</div>
                        <div class="analysis-card-value positive">${formatNum(analysisData.income)} сум</div>
                    </div>
                    <div class="analysis-card">
                        <div class="analysis-card-title"><span class="card-icon">${svgIcon('expense')}</span>Расход</div>
                        <div class="analysis-card-value negative">${formatNum(analysisData.expense)} сум</div>
                    </div>
                    <div class="analysis-card">
                        <div class="analysis-card-title"><span class="card-icon">${svgIcon('balance')}</span>Остаток</div>
                        <div class="analysis-card-value ${analysisData.balance >= 0 ? 'positive' : 'negative'}">${formatNum(analysisData.balance)} сум</div>
                    </div>
                    <div class="analysis-card">
                        <div class="analysis-card-title"><span class="card-icon">${svgIcon('overrun')}</span>Перерасход</div>
                        <div class="analysis-card-value ${analysisData.overrun >= 0 ? 'positive' : 'negative'}">${formatNum(analysisData.overrun)} сум</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Прогресс-бары (collapsible) -->
        <div class="analysis-collapsible ${analysisData.collapsedSections.progress ? 'collapsed' : ''}" data-section="progress">
            <div class="analysis-collapsible-header" onclick="toggleAnalysisSection('progress')">
                <span class="analysis-section-title">Аналитика по финансам (прогресс-бары)</span>
                <button class="collapser">${analysisData.collapsedSections.progress ? '+' : '−'}</button>
            </div>
            <div class="analysis-collapsible-body">
                ${renderProgressBars()}
            </div>
        </div>

        <!-- По типам ресурсов (collapsible) -->
        <div class="analysis-collapsible ${analysisData.collapsedSections.resources ? 'collapsed' : ''}" data-section="resources">
            <div class="analysis-collapsible-header" onclick="toggleAnalysisSection('resources')">
                <span class="analysis-section-title">Аналитика по типам ресурсов</span>
                <button class="collapser">${analysisData.collapsedSections.resources ? '+' : '−'}</button>
            </div>
            <div class="analysis-collapsible-body">
                <div class="analysis-resources-section">
                    <div class="analysis-resources-grid">
                        ${renderResourceColumns()}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Populate area-derived values if inputs already exist and attach inline editing
    setTimeout(async () => {
        const areaInput = document.getElementById('obj-area');
        if (areaInput) areaInput.value = analysisData.area || 0;
        const start = document.getElementById('obj-start-date');
        if (start && analysisData.startDate) start.value = analysisData.startDate;
        const end = document.getElementById('obj-end-date');
        if (end && analysisData.endDate) end.value = analysisData.endDate;

        // Load object metadata (name etc.) from server if available
        if (analysisData.objectId) {
            try {
                const res = await fetch(`/objects/${analysisData.objectId}`);
                if (res.ok) {
                    const obj = await res.json();
                    const nameEl = document.getElementById('object-name');
                    if (nameEl) nameEl.textContent = obj.name || 'Объект';
                    if (areaInput && (obj.area !== undefined && obj.area !== null)) {
                        areaInput.value = obj.area;
                        analysisData.area = parseFloat(obj.area) || 0;
                    }
                    if (start && obj.start_date) {
                        start.value = obj.start_date;
                        analysisData.startDate = obj.start_date;
                    }
                    if (end && obj.end_date) {
                        end.value = obj.end_date;
                        analysisData.endDate = obj.end_date;
                    }
                    // attach inline edit behaviour for object name (reuse makeEditable from budget.js if present)
                    const nameElem = document.getElementById('object-name');
                    if (nameElem) {
                        if (typeof makeEditable === 'function') {
                            makeEditable(nameElem, async (newValue) => {
                                // save to server
                                await fetch(`/objects/${analysisData.objectId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newValue }) });
                                // update sidebar item text if selected
                                const sel = document.querySelector('#object-list li.selected');
                                if (sel) sel.textContent = newValue;
                            });
                        } else {
                            // fallback simple inline edit
                            nameElem.onclick = () => {
                                const cur = nameElem.textContent;
                                const input = document.createElement('input');
                                input.type = 'text'; input.value = cur; input.className = 'inline-edit-input';
                                input.onblur = async () => {
                                    const nv = input.value.trim() || cur;
                                    await fetch(`/objects/${analysisData.objectId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nv }) });
                                    nameElem.textContent = nv;
                                    const sel = document.querySelector('#object-list li.selected'); if (sel) sel.textContent = nv;
                                };
                                input.onkeydown = (e) => { if (e.key === 'Enter') input.blur(); else if (e.key === 'Escape') { nameElem.textContent = cur; } };
                                nameElem.textContent = ''; nameElem.appendChild(input); input.focus(); input.select();
                            };
                        }
                    }
                    // ensure price bars reflect loaded area immediately
                    updatePricePerM2();
                }
            } catch (err) {
                console.warn('Could not fetch object metadata', err);
            }
        }

        updatePricePerM2();
    }, 0);
}

// Helper: load analysis photos from server
async function loadAnalysisPhotos(objectId) {
    try {
        const res = await fetch(`/objects/${objectId}/analysis_photos/`);
        if (!res.ok) throw new Error('Failed to load photos');
        const list = await res.json();
        // Build fixed-size array of 4 slots
        analysisData.analysisPhotos = [null, null, null, null];
        for (let i = 0; i < Math.min(list.length, 4); i++) {
            analysisData.analysisPhotos[i] = { id: list[i].id, url: list[i].url };
        }
    } catch (err) {
        console.warn('Could not load analysis photos:', err);
        analysisData.analysisPhotos = [null, null, null, null];
    }
}

// Helper: render 4 image upload slots using analysisData.analysisPhotos
function renderImageUploadGrid() {
    if (!analysisData.analysisPhotos) analysisData.analysisPhotos = [null, null, null, null];
    return analysisData.analysisPhotos.map((item, idx) => {
        const src = item ? item.url : null;
        return `
            <div class="photo-slot">
                <div class="photo-preview" id="photo-preview-${idx}" data-idx="${idx}" onclick="onPreviewClick(event, ${idx})">
                    ${src ? `<img src="${src}" alt="photo-${idx}">` : `<div class="photo-placeholder">+</div>`}
                    ${src ? `<div class="photo-overlay"><button class="overlay-btn view" onclick="viewImageFromSlot(event, ${idx})" title="Просмотр">👁</button><button class="overlay-btn del" onclick="removeImageFromSlot(event, ${idx})" title="Удалить">✕</button></div>` : ''}
                </div>
                <input type="file" accept="image/*" id="photo-input-${idx}" style="display:none;" onchange="onImageSelected(event, ${idx})">
            </div>
        `;
    }).join('');
}

// Image handlers
function onImageSelected(event, idx) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    // If we have objectId, upload to server; otherwise fallback to data URL
    const objectId = analysisData.objectId;
    if (objectId) {
        const fd = new FormData();
        fd.append('photo', file, file.name);
        fetch(`/objects/${objectId}/analysis_photos/`, { method: 'POST', body: fd })
            .then(res => res.json())
            .then(data => {
                if (data && data.url) {
                    // store as object with id
                    analysisData.analysisPhotos[idx] = { id: data.id, url: data.url };
                    renderAnalysis();
                }
            })
            .catch(err => {
                console.error('Upload failed', err);
                // fallback to local data URL
                const reader = new FileReader();
                reader.onload = function (e) {
                    analysisData.analysisPhotos[idx] = { id: null, url: e.target.result };
                    renderAnalysis();
                };
                reader.readAsDataURL(file);
            });
    } else {
        const reader = new FileReader();
        reader.onload = function (e) {
            analysisData.analysisPhotos[idx] = { id: null, url: e.target.result };
            renderAnalysis();
        };
        reader.readAsDataURL(file);
    }
}

function removeImageFromSlot(event, idx) {
    event.stopPropagation();
    const item = analysisData.analysisPhotos[idx];
    if (!item) return;
    if (item.id) {
        // delete on server
        fetch(`/objects/${analysisData.objectId}/analysis_photos/${item.id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    analysisData.analysisPhotos[idx] = null;
                    renderAnalysis();
                } else {
                    alert('Не удалось удалить фото на сервере');
                }
            }).catch(err => { console.error(err); alert('Ошибка удаления'); });
    } else {
        analysisData.analysisPhotos[idx] = null;
        renderAnalysis();
    }
}

function viewImageFromSlot(event, idx) {
    event.stopPropagation();
    const item = analysisData.analysisPhotos[idx];
    if (!item || !item.url) return;
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('photo-modal-img');
    modalImg.src = item.url;
    modal.style.display = 'flex';
}

function onPreviewClick(event, idx) {
    // Clicking the preview opens file picker for that slot
    const input = document.getElementById(`photo-input-${idx}`);
    if (input) input.click();
}

function onObjectFieldChange() {
    const area = parseFloat(document.getElementById('obj-area').value || 0);
    const start = document.getElementById('obj-start-date').value;
    const end = document.getElementById('obj-end-date').value;
    analysisData.area = area;
    analysisData.startDate = start;
    analysisData.endDate = end;
    updatePricePerM2();

    // Persist these fields to server (partial update)
    if (analysisData.objectId) {
        fetch(`/objects/${analysisData.objectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: start || null, endDate: end || null, area: area })
        }).then(res => {
            if (!res.ok) console.warn('Failed to save object fields');
        }).catch(err => console.error('Save object fields error', err));
    }
}

function updatePricePerM2() {
    const area = parseFloat(analysisData.area || 0) || 0;
    const planBar = document.getElementById('price-plan-bar');
    const factBar = document.getElementById('price-fact-bar');
    const planValueEl = document.getElementById('price-plan-value');
    const factValueEl = document.getElementById('price-fact-value');
    const planPrice = area > 0 ? analysisData.budget / area : 0;
    const factPrice = area > 0 ? analysisData.expense / area : 0;

    // Normalize widths relative to the larger value (or 1 to avoid division by zero)
    const maxVal = Math.max(planPrice, factPrice, 1);
    const planPct = maxVal > 0 ? (planPrice / maxVal) * 100 : 0;
    const factPct = maxVal > 0 ? (factPrice / maxVal) * 100 : 0;

    // Set widths and labels
    if (planBar) {
        planBar.style.width = planPct + '%';
        planBar.className = 'analysis-progress-bar neutral';
        planBar.innerText = planPct > 10 ? formatNum(planPrice) + ' сум' : '';
    }
    if (factBar) {
        factBar.style.width = factPct + '%';
        // Choose class depending on whether fact > plan
        const factClass = factPrice > planPrice ? 'negative' : 'positive';
        factBar.className = 'analysis-progress-bar ' + factClass;
        factBar.innerText = factPct > 10 ? formatNum(factPrice) + ' сум' : '';
    }
    if (planValueEl) planValueEl.innerText = formatNum(planPrice) + ' сум';
    if (factValueEl) factValueEl.innerText = formatNum(factPrice) + ' сум';
}

// Custom SVG icons for financial cards
function svgIcon(name) {
    switch (name) {
        case 'income':
            return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>`;
        case 'expense':
            return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`;
        case 'balance':
            return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`;
        case 'overrun':
            return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>`;
        default:
            return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#000" stroke-width="1.5"/></svg>`;
    }
}

// Export current analysis as a complete HTML report in new tab with all styles and images
function exportAnalysisReport() {
    // Client-side export: open HTML in new window and print (no server call)
    const content = document.getElementById('analysis-container');
    if (!content) {
        alert('Нет данных для экспорта');
        return;
    }

    // Clone the content to manipulate it without affecting the original
    const clonedContent = content.cloneNode(true);

    // Remove interactive elements (buttons, inputs for editing)
    const interactiveElements = clonedContent.querySelectorAll('.photo-overlay, input[type="file"], .collapser');
    interactiveElements.forEach(el => el.remove());

    // Expand all collapsed sections
    const collapsedSections = clonedContent.querySelectorAll('.analysis-collapsible');
    collapsedSections.forEach(section => {
        section.classList.remove('collapsed');
    });

    // Remove collapse headers (make them static titles)
    const collapseHeaders = clonedContent.querySelectorAll('.analysis-collapsible-header');
    collapseHeaders.forEach(header => {
        header.style.cursor = 'default';
        header.onclick = null;
    });

    // Make inputs read-only and style them as text
    const inputs = clonedContent.querySelectorAll('input[type="number"], input[type="date"]');
    inputs.forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value || '—';
        span.style.cssText = 'font-weight: 600; color: #333;';
        input.parentNode.replaceChild(span, input);
    });

    // Object name (if selected in sidebar)
    const objectName = document.querySelector('#object-list li.selected')?.textContent.trim() || 'Объект';
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    // Comprehensive CSS styles for print
    const styles = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif;
            padding: 30px;
            background: #fff;
            color: #222;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #0067c0;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #0067c0;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 14px;
            color: #666;
        }
        
        /* Analysis Container */
        #analysis-container {
            padding: 0;
        }
        
        /* Object Section */
        .analysis-object-section {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .analysis-section-title {
            font-size: 20px;
            font-weight: 700;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .analysis-object-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .object-name {
            font-size: 22px;
            font-weight: 700;
            color: #222;
        }
        
        .object-quick-params {
            display: flex;
            gap: 20px;
            align-items: center;
        }
        
        .object-quick-params label {
            font-size: 13px;
            color: #444;
            font-weight: 600;
        }
        
        /* Photos */
        .analysis-object-photos {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .photo-slot {
            flex: 1 1 calc(25% - 15px);
            min-width: 150px;
        }
        
        .photo-preview {
            width: 100%;
            height: 180px;
            position: relative;
            background: #fafafa;
            border: 1px solid #ddd;
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .photo-preview img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .photo-placeholder {
            font-size: 28px;
            color: #ccc;
        }
        
        /* Progress bars for price per m2 */
        .analysis-object-params {
            margin-top: 20px;
        }
        
        .object-param-row {
            margin-bottom: 15px;
        }
        
        .price-m2-section {
            width: 100%;
        }
        
        .analysis-progress-item {
            margin-bottom: 20px;
        }
        
        .analysis-progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .analysis-progress-label {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }
        
        .analysis-progress-value {
            font-size: 14px;
            font-weight: 700;
            color: #666;
        }
        
        .analysis-progress-bar-container {
            width: 100%;
            height: 32px;
            background: #f0f0f0;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
        }
        
        .analysis-progress-bar {
            height: 100%;
            border-radius: 16px;
            transition: none;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 12px;
            color: #fff;
            font-size: 12px;
            font-weight: 600;
        }
        
        .analysis-progress-bar.neutral {
            background: linear-gradient(90deg, #0067c0 0%, #2196F3 100%);
        }
        
        .analysis-progress-bar.positive {
            background: linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%);
        }
        
        .analysis-progress-bar.negative {
            background: linear-gradient(90deg, #d32f2f 0%, #f44336 100%);
        }
        
        .analysis-progress-bar.balance {
            background: linear-gradient(90deg, #FF9800 0%, #FFB74D 100%);
        }
        
        .analysis-progress-bar.overrun {
            background: linear-gradient(90deg, #8E24AA 0%, #F06292 100%);
        }
        
        /* Collapsible sections */
        .analysis-collapsible {
            margin-bottom: 25px;
            border-radius: 8px;
            overflow: visible;
            page-break-inside: avoid;
        }
        
        .analysis-collapsible-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            background: transparent;
            cursor: default;
        }
        
        .analysis-collapsible-body {
            padding: 10px 0;
        }
        
        /* Financial Cards */
        .analysis-cards-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .analysis-card {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .analysis-card-title {
            font-size: 13px;
            font-weight: 600;
            color: #666;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
        }
        
        .card-icon {
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
        }
        
        .card-icon svg {
            width: 20px;
            height: 20px;
        }
        
        .analysis-card-value {
            font-size: 28px;
            font-weight: 700;
            color: #333;
        }
        
        .analysis-card-value.positive {
            color: #4CAF50;
        }
        
        .analysis-card-value.negative {
            color: #d32f2f;
        }
        
        /* Resources Grid */
        .analysis-resources-section {
            margin-bottom: 30px;
        }
        
        .analysis-resources-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        
        .analysis-resource-column {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            page-break-inside: avoid;
        }
        
        .analysis-resource-title {
            font-size: 15px;
            font-weight: 700;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
            padding-bottom: 12px;
            border-bottom: 2px solid #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .analysis-resource-title svg {
            width: 20px;
            height: 20px;
            margin-right: 8px;
        }
        
        .analysis-resource-chart {
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            height: 200px;
            margin-bottom: 20px;
            padding: 0 10px;
            position: relative;
        }
        
        .analysis-resource-bar-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            max-width: 80px;
        }
        
        .analysis-resource-bar-label {
            font-size: 12px;
            font-weight: 600;
            color: #666;
            margin-bottom: 8px;
            order: 1;
        }
        
        .analysis-resource-bar-wrapper {
            width: 100%;
            height: 150px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            position: relative;
            margin-bottom: 8px;
            order: 3;
        }
        
        .analysis-resource-bar {
            width: 35px;
            border-radius: 4px 4px 0 0;
            position: relative;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 4px;
            font-size: 10px;
            font-weight: 600;
            color: transparent;
        }
        
        .analysis-resource-bar.plan {
            background: linear-gradient(180deg, #2196F3 0%, #1976D2 100%);
        }
        
        .analysis-resource-bar.fact {
            background: linear-gradient(180deg, #f44336 0%, #d32f2f 100%);
        }
        
        .analysis-resource-bar-value {
            font-size: 12px;
            font-weight: 600;
            color: #000;
            text-align: center;
            margin-bottom: 8px;
            order: 2;
        }
        
        .analysis-resource-diff {
            margin-top: 16px;
            padding: 10px 12px;
            background: #f5f5f5;
            border-radius: 6px;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
        }
        
        .analysis-resource-diff.positive {
            background: #e8f5e9;
            color: #4CAF50;
        }
        
        .analysis-resource-diff.negative {
            background: #ffebee;
            color: #d32f2f;
        }
        
        /* Print styles */
        @media print {
            body {
                padding: 15px;
            }
            .header {
                margin-bottom: 20px;
                padding-bottom: 15px;
            }
            .analysis-collapsible,
            .analysis-card,
            .analysis-resource-column,
            .analysis-object-section {
                page-break-inside: avoid;
            }
            .analysis-resources-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        @page {
            margin: 1.5cm;
        }
    `;

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Анализ - ${objectName}</title>
    <style>${styles}</style>
</head>
<body>
    <img class="pdf-logo" src="/frontend/assets/design_key.png" alt="logo" style="position:fixed;top:10px;right:10px;width:64px;height:auto;opacity:0.95;z-index:9999;">
    <div class="header">
        <h1>Анализ объекта: ${objectName}</h1>
        <p>Дата формирования отчета: ${dateStr} в ${timeStr}</p>
    </div>
    <div class="analysis-wrap">
        ${clonedContent.innerHTML}
    </div>
    <script>
        // Auto-print when page loads
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(html);
        win.document.close();
    } else {
        alert('Не удалось открыть новое окно. Проверьте настройки блокировки всплывающих окон.');
    }
}

// Expose handlers to global scope for inline handlers
window.onImageSelected = onImageSelected;
window.removeImageFromSlot = removeImageFromSlot;
window.viewImageFromSlot = viewImageFromSlot;
window.onPreviewClick = onPreviewClick;
window.onObjectFieldChange = onObjectFieldChange;
window.exportAnalysisReport = exportAnalysisReport;
// Toggle collapsible analysis sections
function toggleAnalysisSection(name) {
    if (!analysisData.collapsedSections) analysisData.collapsedSections = { cards: true, progress: true, resources: true };
    analysisData.collapsedSections[name] = !analysisData.collapsedSections[name];
    // Re-render so header buttons and bodies update
    renderAnalysis();
}
window.toggleAnalysisSection = toggleAnalysisSection;


// Рендеринг прогресс-баров
function renderProgressBars() {
    const maxValue = Math.max(
        analysisData.budget,
        analysisData.income,
        analysisData.expense,
        Math.abs(analysisData.balance),
        Math.abs(analysisData.overrun)
    );

    const items = [
        { label: 'Бюджет', value: analysisData.budget, class: 'neutral' },
        { label: 'Приход', value: analysisData.income, class: 'positive' },
        { label: 'Расход', value: analysisData.expense, class: 'negative' },
        // 'Остаток' will use orange (balance) regardless of sign as requested
        { label: 'Остаток', value: analysisData.balance, class: 'balance' },
        // 'Перерасход' uses purple/pink gradient
        { label: 'Перерасход', value: analysisData.overrun, class: 'overrun' }
    ];

    return items.map(item => {
        const percentage = maxValue > 0 ? Math.abs((item.value / maxValue) * 100) : 0;
        return `
            <div class="analysis-progress-item">
                <div class="analysis-progress-header">
                    <span class="analysis-progress-label">${item.label}</span>
                    <span class="analysis-progress-value">${formatNum(item.value)} сум</span>
                </div>
                <div class="analysis-progress-bar-container">
                    <div class="analysis-progress-bar ${item.class}" style="width: ${percentage}%">
                        ${percentage > 10 ? formatNum(item.value) + ' сум' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Рендеринг колонок по типам ресурсов
function renderResourceColumns() {
    // Показываем все типы ресурсов в определенном порядке
    const resourceOrder = [
        'Трудоресурсы', 'Материал', 'Доставка', 'Оборудование', 'Техника',
        'Мебель', 'Инструменты', 'Коммуналка', 'Документация',
        'Расходные материалы', 'Питание'
    ];

    return resourceOrder.map(type => {
        const data = analysisData.resources[type] || { plan: 0, fact: 0 };
        const diff = data.fact - data.plan;
        const diffClass = diff >= 0 ? 'negative' : 'positive';
        const diffLabel = diff >= 0 ? 'Перерасход' : 'Экономия';
        const diffSign = diff >= 0 ? '-' : '+';

        // Находим максимальное значение для масштабирования столбцов
        const maxValue = Math.max(data.plan, data.fact, 1);
        const planHeight = (data.plan / maxValue) * 100;
        const factHeight = (data.fact / maxValue) * 100;

        return `
            <div class="analysis-resource-column">
                <div class="analysis-resource-title">${ANALYSIS_RESOURCE_ICONS[type] || svgIcon('resource')}${type}</div>
                    <div class="analysis-resource-chart">
                        <div class="analysis-resource-bar-container">
                            <div class="analysis-resource-bar-label">План</div>
                            <div class="analysis-resource-bar-wrapper">
                                <div class="analysis-resource-bar plan" style="height: ${planHeight}%">
                                    ${planHeight > 15 ? formatNum(data.plan) : ''}
                                </div>
                            </div>
                            <div class="analysis-resource-bar-value">${formatNum(data.plan)}</div>
                        </div>
                        <div class="analysis-resource-bar-container">
                            <div class="analysis-resource-bar-label">Факт</div>
                            <div class="analysis-resource-bar-wrapper">
                                <div class="analysis-resource-bar fact" style="height: ${factHeight}%">
                                    ${factHeight > 15 ? formatNum(data.fact) : ''}
                                </div>
                            </div>
                            <div class="analysis-resource-bar-value">${formatNum(data.fact)}</div>
                        </div>
                    </div>
                    <div class="analysis-resource-diff ${diffClass}">
                        ${diffSign}${formatNum(Math.abs(diff))}
                    </div>
                </div>
            `;
    }).join('');
}

// Форматирование чисел
function formatNum(num) {
    if (num === null || num === undefined || num === '') return '0';
    return parseFloat(num).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Экспорт функции для использования в app.js
window.loadAnalysis = loadAnalysis;

