// ========================================
// SOURCE OBJECT SELECTOR
// Add this to app.js after the operation type handler
// ========================================

// Show/hide source object selector based on operation type
document.getElementById('income-operation-type')?.addEventListener('change', (e) => {
    const form = document.getElementById('income-form');
    const amountInput = document.getElementById('income-amount');
    const sourceObjectRow = document.getElementById('source-object-row');

    if (e.target.value === 'return') {
        form.classList.add('operation-type-return');
        amountInput.style.color = '#D13438'; // Office red
        sourceObjectRow.style.display = 'none';
    } else if (e.target.value === 'debt') {
        form.classList.remove('operation-type-return');
        amountInput.style.color = '';
        sourceObjectRow.style.display = 'flex';
        // Populate objects list
        populateSourceObjects();
    } else {
        form.classList.remove('operation-type-return');
        amountInput.style.color = '';
        sourceObjectRow.style.display = 'none';
    }
});

// Populate source objects dropdown
async function populateSourceObjects() {
    const select = document.getElementById('income-source-object');
    const currentObjectId = window.currentObjectId;

    try {
        const response = await fetch(`${API_URL}/objects`);
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

// Update the modal close handler to hide source object row
const originalCloseHandler = document.getElementById('income-modal-close');
originalCloseHandler?.addEventListener('click', () => {
    document.getElementById('source-object-row').style.display = 'none';
    document.getElementById('income-source-object').value = '';
});
