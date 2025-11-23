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

// Operation type change handler - mark return operations
document.getElementById('income-operation-type')?.addEventListener('change', (e) => {
    const form = document.getElementById('income-form');
    const amountInput = document.getElementById('income-amount');
    
    if (e.target.value === 'return') {
        form.classList.add('operation-type-return');
        amountInput.style.color = '#D13438'; // Office red
    } else {
        form.classList.remove('operation-type-return');
        amountInput.style.color = '';
    }
});

// Reset photo preview when modal closes
document.getElementById('income-modal-close')?.addEventListener('click', () => {
    document.getElementById('income-photo').value = '';
    document.getElementById('income-photo-img').src = '';
    document.querySelector('.photo-upload-btn').style.display = 'flex';
    document.querySelector('.photo-preview-container').style.display = 'none';
    document.getElementById('income-form').classList.remove('operation-type-return');
});
