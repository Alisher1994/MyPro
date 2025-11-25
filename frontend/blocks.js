// ============================
// BLOCKS MANAGEMENT MODULE
// ============================

const BlocksModule = (function() {
    let currentObjectId = null;
    let blocks = [];

    // Initialize module
    function init() {
        setupEventListeners();
        console.log('Blocks module initialized');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Add block button
        const addBlockBtn = document.getElementById('add-block');
        if (addBlockBtn) {
            addBlockBtn.addEventListener('click', () => openBlockModal());
        }

        // Block modal close
        const closeBtn = document.getElementById('block-modal-close');
        const cancelBtn = document.getElementById('block-cancel');
        if (closeBtn) closeBtn.addEventListener('click', closeBlockModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeBlockModal);

        // Block form submit
        const form = document.getElementById('block-form');
        if (form) {
            form.addEventListener('submit', handleBlockSubmit);
        }

        // Color picker - update hex display
        const colorPicker = document.getElementById('block-color');
        const colorHex = document.getElementById('block-color-hex');
        if (colorPicker && colorHex) {
            colorPicker.addEventListener('input', (e) => {
                colorHex.textContent = e.target.value.toUpperCase();
            });
        }
    }

    // Set current object
    function setCurrentObject(objectId) {
        currentObjectId = objectId;
        if (objectId) {
            loadBlocks();
        }
    }

    // Load blocks for current object
    async function loadBlocks() {
        if (!currentObjectId) {
            console.warn('No object selected');
            return;
        }

        try {
            const response = await fetch(`/objects/${currentObjectId}/blocks/`);
            if (!response.ok) throw new Error('Failed to load blocks');
            
            blocks = await response.json();
            renderBlocksTable();
        } catch (error) {
            console.error('Error loading blocks:', error);
            showNotification('Ошибка загрузки блоков', 'error');
        }
    }

    // Render blocks table
    function renderBlocksTable() {
        const tbody = document.getElementById('blocks-tbody');
        if (!tbody) return;

        if (blocks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#999;">Нет блоков. Добавьте первый блок.</td></tr>';
            return;
        }

        tbody.innerHTML = blocks.map((block, index) => {
            const statusBadge = getStatusBadge(block.status);
            return `
                <tr data-block-id="${block.id}">
                    <td>${index + 1}</td>
                    <td><strong>${escapeHtml(block.name)}</strong></td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 24px; height: 24px; background: ${block.color}; border: 1px solid #ddd; border-radius: 4px;"></div>
                            <span style="font-family: monospace; font-size: 12px; color: #666;">${block.color}</span>
                        </div>
                    </td>
                    <td>${block.order_index}</td>
                    <td>
                        <button class="btn-icon" onclick="BlocksModule.editBlock(${block.id})" title="Редактировать">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="BlocksModule.deleteBlock(${block.id}, '${escapeHtml(block.name)}')" title="Удалить">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Get status badge HTML
    function getStatusBadge(status) {
        const badges = {
            'active': '<span class="badge badge-success">Активный</span>',
            'paused': '<span class="badge badge-warning">Приостановлен</span>',
            'inactive': '<span class="badge badge-secondary">Неактивный</span>'
        };
        return badges[status] || '<span class="badge badge-secondary">Неизвестно</span>';
    }

    // Open block modal
    function openBlockModal(blockId = null) {
        const modal = document.getElementById('block-modal');
        const title = document.getElementById('block-modal-title');
        const form = document.getElementById('block-form');
        
        if (!modal || !form) return;

        // Reset form
        form.reset();
        document.getElementById('block-id').value = '';
        document.getElementById('block-color').value = '#3B82F6';
        document.getElementById('block-color-hex').textContent = '#3B82F6';
        document.getElementById('block-order').value = '0';

        if (blockId) {
            // Edit mode
            const block = blocks.find(b => b.id === blockId);
            if (block) {
                title.textContent = 'Редактировать блок';
                document.getElementById('block-id').value = block.id;
                document.getElementById('block-name').value = block.name;
                document.getElementById('block-status').value = block.status;
                document.getElementById('block-color').value = block.color;
                document.getElementById('block-color-hex').textContent = block.color.toUpperCase();
                document.getElementById('block-order').value = block.order_index;
            }
        } else {
            // Add mode
            title.textContent = 'Добавить блок';
        }

        modal.style.display = 'flex';
    }

    // Close block modal
    function closeBlockModal() {
        const modal = document.getElementById('block-modal');
        if (modal) modal.style.display = 'none';
    }

    // Handle block form submit
    async function handleBlockSubmit(e) {
        e.preventDefault();

        if (!currentObjectId) {
            showNotification('Объект не выбран', 'error');
            return;
        }

        const blockId = document.getElementById('block-id').value;
        const data = {
            name: document.getElementById('block-name').value.trim(),
            status: document.getElementById('block-status').value,
            color: document.getElementById('block-color').value,
            order_index: parseInt(document.getElementById('block-order').value) || 0
        };

        try {
            let response;
            if (blockId) {
                // Update
                response = await fetch(`/blocks/${blockId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                // Create
                response = await fetch(`/objects/${currentObjectId}/blocks/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to save block');
            }

            showNotification(blockId ? 'Блок обновлен' : 'Блок создан', 'success');
            closeBlockModal();
            await loadBlocks();
        } catch (error) {
            console.error('Error saving block:', error);
            showNotification(error.message || 'Ошибка сохранения блока', 'error');
        }
    }

    // Edit block
    function editBlock(blockId) {
        openBlockModal(blockId);
    }

    // Delete block
    async function deleteBlock(blockId, blockName) {
        if (!confirm(`Удалить блок "${blockName}"?\n\nВнимание: удаление возможно только если на этот блок нет ссылок из смет или приходов.`)) {
            return;
        }

        try {
            const response = await fetch(`/blocks/${blockId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to delete block');
            }

            showNotification('Блок удален', 'success');
            await loadBlocks();
        } catch (error) {
            console.error('Error deleting block:', error);
            showNotification(error.message || 'Ошибка удаления блока', 'error');
        }
    }

    // Utility: escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility: show notification
    function showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // Public API
    return {
        init,
        setCurrentObject,
        loadBlocks,
        editBlock,
        deleteBlock,
        getBlocks: () => blocks
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BlocksModule.init());
} else {
    BlocksModule.init();
}
