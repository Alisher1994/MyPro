
import os

file_path = r'c:\Users\LOQ\Documents\GitHub\MyBuildingPro\frontend\app.js'

new_content_part = r"""// Генерация HTML для скачивания/печати прихода
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
        if (row.operation_type !== 'return') {
            total += Number(row.amount) || 0;
        }
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

// Print Button Logic
document.addEventListener('DOMContentLoaded', () => {
    const printBtn = document.getElementById('print-income');
    if (printBtn) {
        printBtn.onclick = () => {
            downloadIncome();
        };
    }
    // Кнопка "Печать" для анализа — вызывает уже существующий экспортный метод
    const printAnalysisBtn = document.getElementById('print-analysis');
    if (printAnalysisBtn) {
        printAnalysisBtn.onclick = () => {
            if (window.exportAnalysisReport) {
                window.exportAnalysisReport();
            } else {
                alert('Экспорт анализа недоступен');
            }
        };
    }
});

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


// ========================================
// ENHANCED INCOME MODAL JAVASCRIPT
// Add this to the end of app.js
// ========================================

// Photo preview functionality
document.getElementById('income-photo-upload-btn')?.addEventListener('click', () => {
    document.getElementById('income-photo').click();
});

document.getElementById('income-photo')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('income-photo-img').src = event.target.result;
            document.querySelector('.photo-upload-btn').style.display = 'none';
            document.querySelector('.photo-preview-container').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('income-photo-delete-btn')?.addEventListener('click', () => {
    document.getElementById('income-photo').value = '';
    document.getElementById('income-photo-img').src = '';
    document.querySelector('.photo-upload-btn').style.display = 'flex';
    document.querySelector('.photo-preview-container').style.display = 'none';
});

// Operation type change handler - mark return operations and show object selector
document.getElementById('income-operation-type')?.addEventListener('change', (e) => {
    const form = document.getElementById('income-form');
    const amountInput = document.getElementById('income-amount');
    const sourceObjectRow = document.getElementById('source-object-row');

    if (e.target.value === 'return') {
        form.classList.add('operation-type-return');
        amountInput.style.color = '#D13438'; // Office red
        if (sourceObjectRow) sourceObjectRow.style.display = 'none';
    } else if (e.target.value === 'debt') {
        form.classList.remove('operation-type-return');
        amountInput.style.color = '';
        if (sourceObjectRow) {
            sourceObjectRow.style.display = 'flex';
            // Populate objects list
            populateSourceObjects();
        }
    } else {
        form.classList.remove('operation-type-return');
        amountInput.style.color = '';
        if (sourceObjectRow) sourceObjectRow.style.display = 'none';
    }
});

// Populate source objects dropdown
async function populateSourceObjects() {
    const select = document.getElementById('income-source-object');
    const currentObjectId = selectedId;

    try {
        const response = await fetch('/objects/');
        const objects = await response.json();

        // Clear existing options except first
        select.innerHTML = '<option value="">Выберите объект</option>';

        // Add all objects except current one
        objects.forEach(obj => {
            if (obj.id !== currentObjectId) {
                const option = document.createElement('option');
                option.value = obj.id;
                option.textContent = obj.name;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading objects:', error);
    }
}

// Reset photo preview when modal closes
document.getElementById('income-modal-close')?.addEventListener('click', () => {
    document.getElementById('income-photo').value = '';
    document.getElementById('income-photo-img').src = '';
    document.querySelector('.photo-upload-btn').style.display = 'flex';
    document.querySelector('.photo-preview-container').style.display = 'none';
    document.getElementById('income-form').classList.remove('operation-type-return');

    const sourceObjectRow = document.getElementById('source-object-row');
    const sourceObjectSelect = document.getElementById('income-source-object');
    if (sourceObjectRow) sourceObjectRow.style.display = 'none';
    if (sourceObjectSelect) sourceObjectSelect.value = '';
});
"""

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Keep lines 0 to 480 (first 481 lines)
    # Line 481 in 1-based index is index 480
    # But we want to keep UP TO the line before "function downloadIncome()"
    # In step 742, "function downloadIncome()" is NOT shown, but line 481 is "// Генерация HTML для скачивания/печати прихода"
    # So we want to keep lines 0 to 480 (exclusive? no, inclusive of 480?)
    # lines[480] is the 481st line.
    
    # Let's find the index of the line starting with "// Генерация HTML для скачивания/печати прихода"
    start_index = -1
    for i, line in enumerate(lines):
        if "// Генерация HTML для скачивания/печати прихода" in line:
            start_index = i
            break
            
    if start_index != -1:
        kept_lines = lines[:start_index]
        final_content = "".join(kept_lines) + "\n" + new_content_part
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(final_content)
        print("Successfully updated app.js")
    else:
        print("Could not find start line")

except Exception as e:
    print(f"Error: {e}")
