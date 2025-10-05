// Configuración de la API
const API_BASE_URL = 'http://localhost:3001';

const state = {
    currentTab: 'catalog',
    editingTool: null,
    tools: []
};

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeForms();
    loadTools();
});

function initializeNavigation() {
    const tabButtons = document.querySelectorAll('.nav-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.id.replace('tab-', '');
            switchTab(tabId);
        });
    });
}

function switchTab(tabName) {
    // Actualizar estado
    state.currentTab = tabName;
    
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Mostrar/ocultar secciones
    document.querySelectorAll('.tab-content').forEach(section => section.classList.remove('active'));
    document.getElementById(`${tabName}-section`).classList.add('active');
    
    // Cargar datos si es necesario
    if (tabName === 'catalog') {
        loadTools();
    }
}

function initializeForms() {
    // Formulario de herramientas
    const toolForm = document.getElementById('form-add-tool');
    const toolResetBtn = document.getElementById('form-reset');
    
    toolForm.addEventListener('submit', handleToolSubmit);
    toolResetBtn.addEventListener('click', resetToolForm);
}

async function loadTools() {
    try {
        const response = await fetch(`${API_BASE_URL}/tools`);
        if (!response.ok) throw new Error('Error al cargar herramientas');
        
        state.tools = await response.json();
        renderTools();
    } catch (error) {
        console.error('Error loading tools:', error);
        state.tools = [];
        renderTools();
    }
}

async function handleToolSubmit(e) {
    e.preventDefault();
    
    const toolData = {
        name: document.getElementById('tool-name').value,
        brand: document.getElementById('tool-brand').value,
        price: parseFloat(document.getElementById('tool-price').value),
        category: document.getElementById('tool-category').value,
        model: document.getElementById('tool-model').value,
        description: document.getElementById('tool-description').value
    };
    
    try {
        const toolId = document.getElementById('tool-id').value;
        
        if (toolId) {
            // Actualizar herramienta existente
            await updateTool(toolId, toolData);
            showNotification('Herramienta actualizada exitosamente', 'success');
        } else {
            // Crear nueva herramienta
            await createTool(toolData);
            showNotification('Herramienta creada exitosamente', 'success');
        }
        
        resetToolForm();
        await loadTools();
    } catch (error) {
        console.error('Error saving tool:', error);
        showNotification('Error al guardar la herramienta', 'error');
    }
}

async function createTool(toolData) {
    const response = await fetch(`${API_BASE_URL}/tools`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(toolData)
    });
    
    if (!response.ok) throw new Error('Error al crear herramienta');
    return await response.json();
}

async function updateTool(id, toolData) {
    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(toolData)
    });
    
    if (!response.ok) throw new Error('Error al actualizar herramienta');
    return await response.json();
}

async function deleteTool(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta herramienta?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar herramienta');
        
        showNotification('Herramienta eliminada exitosamente', 'success');
        await loadTools();
    } catch (error) {
        console.error('Error deleting tool:', error);
        showNotification('Error al eliminar la herramienta', 'error');
    }
}

function editTool(id) {
    const tool = state.tools.find(t => t.id == id);
    if (!tool) return;
    
    // Llenar el formulario con los datos de la herramienta
    document.getElementById('tool-id').value = tool.id;
    document.getElementById('tool-name').value = tool.name;
    document.getElementById('tool-brand').value = tool.brand;
    document.getElementById('tool-price').value = tool.price;
    document.getElementById('tool-category').value = tool.category;
    document.getElementById('tool-model').value = tool.model || '';
    document.getElementById('tool-description').value = tool.description || '';
    
    if (state.currentTab !== 'catalog') {
        switchTab('catalog');
    }
    
    document.getElementById('form-add-tool').scrollIntoView({ behavior: 'smooth' });
}

function resetToolForm() {
    document.getElementById('form-add-tool').reset();
    document.getElementById('tool-id').value = '';
    state.editingTool = null;
}

function renderTools() {
    const container = document.getElementById('tools-list');
    
    if (state.tools.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #6b7280;">
                <i class="fas fa-tools" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No hay herramientas registradas. ¡Agrega la primera herramienta!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.tools.map(tool => `
        <div class="tool-card">
            <div class="card-header">
                <div>
                    <div class="card-title">${tool.name}</div>
                    <div class="card-subtitle">${tool.brand} ${tool.model || ''}</div>
                </div>
                <div class="card-price">$${tool.price.toFixed(2)}</div>
            </div>
            
            <div class="card-category category-${tool.category}">${getCategoryName(tool.category)}</div>
            
            ${tool.description ? `<div class="card-description">${tool.description}</div>` : ''}
            
            <div class="card-actions">
                <button class="btn btn-edit" onclick="editTool('${tool.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-delete" onclick="deleteTool('${tool.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryName(category) {
    const categories = {
        'medicion': 'Medición',
        'soldadura': 'Soldadura',
        'corte': 'Corte y Pelado',
        'manuales': 'Herramientas Manuales',
        'fuentes': 'Fuentes de Alimentación',
        'osciloscopio': 'Osciloscopios'
    };
    return categories[category] || category;
}

function showNotification(message, type = 'info') {

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontSize: '0.9rem',
        zIndex: '1000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s ease'
    });
    
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[type] || icons.info;
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

window.editTool = editTool;
window.deleteTool = deleteTool;
window.switchTab = switchTab;
