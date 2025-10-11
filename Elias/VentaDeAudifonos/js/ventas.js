const VENTAS_URL = 'https://172.23.243.26:3000/ventas';
const PRODUCTOS_URL = 'https://172.23.243.26:3000/productos';

let productos = [];

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadProductos();
    loadVentas();
    setTodayDate();
    updateStats(); // Cargar estadísticas al inicio
});

// Establecer fecha de hoy por defecto
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = today;
}

// Función para actualizar las estadísticas
async function updateStats() {
    try {
        const response = await fetch(VENTAS_URL);
        const data = await response.json();
        const ventas = data.ventas;
        
        // Calcular total de ventas en dinero
        let totalAmount = 0;
        ventas.forEach(venta => {
            totalAmount += parseFloat(venta.total);
        });
        
        // Actualizar displays
        document.getElementById('totalVentasAmount').textContent = '$' + totalAmount.toFixed(2);
        document.getElementById('totalVentasCount').textContent = ventas.length;
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
    }
}

// Cargar productos para los selectores
async function loadProductos() {
    try {
        const response = await fetch(PRODUCTOS_URL);
        const data = await response.json();  
        const productos = data.productos;    
        
        const select = document.getElementById('productoId');
        const editSelect = document.getElementById('editProductoId');
        
        select.innerHTML = '<option value="">Seleccione un producto</option>';
        editSelect.innerHTML = '<option value="">Seleccione un producto</option>';
        
        productos.forEach(producto => {
            const optionHTML = `
                <option value="${producto.id}" 
                        data-precio="${producto.precio}" 
                        data-nombre="${producto.nombre}">
                    ${producto.nombre} - ${producto.marca} ($${parseFloat(producto.precio).toFixed(2)})
                </option>
            `;
            select.innerHTML += optionHTML;
            editSelect.innerHTML += optionHTML;
        });

    } catch (error) {
        alert('Error al cargar productos: ' + error.message);
    }
}

// Calcular total al cambiar producto o cantidad
document.getElementById('productoId').addEventListener('change', calcularTotal);
document.getElementById('cantidad').addEventListener('input', calcularTotal);
document.getElementById('editProductoId').addEventListener('change', calcularTotalEdit);
document.getElementById('editCantidad').addEventListener('input', calcularTotalEdit);

function calcularTotal() {
    const select = document.getElementById('productoId');
    const cantidad = document.getElementById('cantidad').value || '0';
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.precio) {
        const precio = parseFloat(selectedOption.dataset.precio);
        const total = precio * parseFloat(cantidad);
        document.getElementById('totalDisplay').textContent = '$' + total.toFixed(2);
    }
}

function calcularTotalEdit() {
    const select = document.getElementById('editProductoId');
    const cantidad = document.getElementById('editCantidad').value || '0';
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.precio) {
        const precio = parseFloat(selectedOption.dataset.precio);
        const total = precio * parseFloat(cantidad);
        document.getElementById('editTotalDisplay').textContent = '$' + total.toFixed(2);
    }
}

// Registrar venta
document.getElementById('ventaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const select = document.getElementById('productoId');
    const selectedOption = select.options[select.selectedIndex];
    const cantidad = document.getElementById('cantidad').value;
    const precio = selectedOption.dataset.precio;
    const total = (parseFloat(precio) * parseFloat(cantidad)).toFixed(2);
    
    const venta = {
        productoId: select.value,
        nombreProducto: selectedOption.dataset.nombre,
        cantidad: cantidad,
        total: total,
        cliente: document.getElementById('cliente').value,
        fecha: document.getElementById('fecha').value
    };

    try {
        const response = await fetch(VENTAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(venta)
        });

        if (response.ok) {
            alert('Venta registrada exitosamente');
            document.getElementById('ventaForm').reset();
            setTodayDate();
            document.getElementById('totalDisplay').textContent = '$0.00';
            loadVentas();
            updateStats(); // Actualizar estadísticas después de registrar venta
        }
    } catch (error) {
        alert('Error al registrar venta: ' + error.message);
    }
});

// Cargar y mostrar ventas
async function loadVentas() {
    try {
        const response = await fetch(VENTAS_URL);
        const data = await response.json();  
        const ventas = data.ventas;          
        
        const tbody = document.getElementById('ventasList');
        tbody.innerHTML = '';

        ventas.forEach(venta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${venta.id}</td>
                <td>${venta.nombreProducto}</td>
                <td>${venta.cantidad}</td>
                <td>${venta.cliente}</td>
                <td>${venta.fecha}</td>
                <td>$${parseFloat(venta.total).toFixed(2)}</td>
                <td class="actions">
                    <button class="btn btn-warning" onclick="editVenta('${venta.id}')">Editar</button>
                    <button class="btn btn-danger" onclick="deleteVenta('${venta.id}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        updateStats(); // Actualizar estadísticas después de cargar ventas
    } catch (error) {
        alert('Error al cargar ventas: ' + error.message);
    }
}

// Editar venta
async function editVenta(id) {
    try {
        const response = await fetch(`${VENTAS_URL}/${id}`);
        const venta = await response.json();

        document.getElementById('editId').value = venta.id;
        document.getElementById('editProductoId').value = venta.productoId;
        document.getElementById('editCantidad').value = venta.cantidad;
        document.getElementById('editCliente').value = venta.cliente;
        document.getElementById('editFecha').value = venta.fecha;
        
        calcularTotalEdit();

        document.getElementById('editSection').style.display = 'block';
        document.getElementById('editSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('Error al cargar venta: ' + error.message);
    }
}

// Guardar cambios de edición
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const select = document.getElementById('editProductoId');
    const selectedOption = select.options[select.selectedIndex];
    const cantidad = document.getElementById('editCantidad').value;
    const precio = selectedOption.dataset.precio;
    const total = (parseFloat(precio) * parseFloat(cantidad)).toFixed(2);
    
    const venta = {
        productoId: select.value,
        nombreProducto: selectedOption.dataset.nombre,
        cantidad: cantidad,
        total: total,
        cliente: document.getElementById('editCliente').value,
        fecha: document.getElementById('editFecha').value
    };

    try {
        const response = await fetch(`${VENTAS_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(venta)
        });

        if (response.ok) {
            alert('Venta actualizada exitosamente');
            cancelEdit();
            loadVentas();
            updateStats(); // Actualizar estadísticas después de editar
        }
    } catch (error) {
        alert('Error al actualizar venta: ' + error.message);
    }
});

// Cancelar edición
function cancelEdit() {
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('editForm').reset();
    document.getElementById('editTotalDisplay').textContent = '$0.00';
}

// Eliminar venta
async function deleteVenta(id) {
    if (confirm('¿Estás seguro de eliminar esta venta?')) {
        try {
            const response = await fetch(`${VENTAS_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Venta eliminada exitosamente');
                loadVentas();
                updateStats(); // Actualizar estadísticas después de eliminar
            }
        } catch (error) {
            alert('Error al eliminar venta: ' + error.message);
        }
    }
}