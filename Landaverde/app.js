const API = 'http://localhost:3001'; // json-server

// UI elements
const tabCatalog = document.getElementById('tab-catalog');
const tabOrders = document.getElementById('tab-orders');
const catalogSection = document.getElementById('catalog-section');
const ordersSection = document.getElementById('orders-section');

tabCatalog.onclick = () => showTab('catalog');
tabOrders.onclick = () => showTab('orders');

function showTab(t){
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  if(t === 'catalog') catalogSection.classList.add('active');
  else ordersSection.classList.add('active');
}

/* ---------- Phones CRUD ---------- */
const phonesList = document.getElementById('phones-list');
const formPhone = document.getElementById('form-add-phone');
const phoneIdInput = document.getElementById('phone-id');

async function fetchPhones(){
  const res = await fetch(`${API}/smartphones`);
  return res.json();
}

function renderPhones(phones){
  phonesList.innerHTML = '';
  phones.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div>
        <strong>${p.brand} ${p.model}</strong>
        <div class="meta"><small>$${p.price} • ${p.specs?.ram || ''} • ${p.specs?.storage || ''}</small></div>
      </div>
      <div>
        <button class="btn edit" data-id="${p.id}">Editar</button>
        <button class="btn delete" data-id="${p.id}">Borrar</button>
        <a class="btn details" href="detalles.html?id=${p.id}">Detalles</a>
      </div>
    `;
    phonesList.appendChild(div);
  });

  // attach events
  phonesList.querySelectorAll('.edit').forEach(b => b.onclick = () => loadPhoneToForm(b.dataset.id));
  phonesList.querySelectorAll('.delete').forEach(b => b.onclick = () => deletePhone(b.dataset.id));
}

async function loadPhoneToForm(id){
  const res = await fetch(`${API}/smartphones/${id}`);
  const p = await res.json();
  phoneIdInput.value = p.id;
  document.getElementById('brand').value = p.brand;
  document.getElementById('model').value = p.model;
  document.getElementById('price').value = p.price;
  document.getElementById('ram').value = p.specs?.ram || '';
  document.getElementById('storage').value = p.specs?.storage || '';
  document.getElementById('battery').value = p.specs?.battery || '';
}

async function deletePhone(id){
  if(!confirm('¿Borrar smartphone?')) return;
  await fetch(`${API}/smartphones/${id}`, { method: 'DELETE' });
  await reloadAll();
}

formPhone.onsubmit = async (e) => {
  e.preventDefault();
  const id = phoneIdInput.value;
  const payload = {
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    price: Number(document.getElementById('price').value),
    specs: {
      ram: document.getElementById('ram').value,
      storage: document.getElementById('storage').value,
      battery: document.getElementById('battery').value
    }
  };

  if(id){
    // actualizar
    await fetch(`${API}/smartphones/${id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
  } else {
    // insertar
    await fetch(`${API}/smartphones`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
  }
  formPhone.reset();
  phoneIdInput.value = '';
  await reloadAll();
};

document.getElementById('form-reset').onclick = () => {
  formPhone.reset();
  phoneIdInput.value = '';
}

/* ---------- Orders CRUD (mantenimiento 2) ---------- */
const ordersList = document.getElementById('orders-list');
const orderSmartphoneSelect = document.getElementById('order-smartphone');
const formOrder = document.getElementById('form-add-order');

async function fetchOrders(){ const r = await fetch(`${API}/orders`); return r.json(); }

async function renderOrders(){
  const orders = await fetchOrders();
  ordersList.innerHTML = '';
  for(const o of orders){
    // fetch smartphone small info
    const spRes = await fetch(`${API}/smartphones/${o.smartphoneId}`);
    const sp = spRes.ok ? await spRes.json() : { brand:'-', model:'-' };

    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div>
        <strong>${o.customer}</strong>
        <div class="meta"><small>${sp.brand} ${sp.model} • Cant: ${o.quantity} • Estado: ${o.status}</small></div>
      </div>
      <div>
        <button class="btn edit" data-id="${o.id}">Cambiar estado</button>
        <button class="btn delete" data-id="${o.id}">Cancelar</button>
      </div>
    `;
    ordersList.appendChild(div);
  }
  ordersList.querySelectorAll('.edit').forEach(b => b.onclick = () => toggleOrderStatus(b.dataset.id));
  ordersList.querySelectorAll('.delete').forEach(b => b.onclick = () => deleteOrder(b.dataset.id));
}

async function toggleOrderStatus(id){
  const res = await fetch(`${API}/orders/${id}`);
  const o = await res.json();
  const newStatus = o.status === 'pending' ? 'shipped' : (o.status === 'shipped' ? 'delivered' : 'pending');
  await fetch(`${API}/orders/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ status: newStatus })
  });
  reloadAll();
}

async function deleteOrder(id){
  if(!confirm('¿Cancelar pedido?')) return;
  await fetch(`${API}/orders/${id}`, { method: 'DELETE' });
  reloadAll();
}

formOrder.onsubmit = async (e) => {
  e.preventDefault();
  const payload = {
    smartphoneId: Number(orderSmartphoneSelect.value),
    customer: document.getElementById('customer').value,
    quantity: Number(document.getElementById('quantity').value),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await fetch(`${API}/orders`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  formOrder.reset();
  reloadAll();
}

/* ---------- Utilities ---------- */
async function populatePhoneOptions(){
  const phones = await fetchPhones();
  orderSmartphoneSelect.innerHTML = '';
  phones.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.brand} ${p.model} - $${p.price}`;
    orderSmartphoneSelect.appendChild(opt);
  });
}

async function reloadAll(){
  const phones = await fetchPhones();
  renderPhones(phones);
  await populatePhoneOptions();
  await renderOrders();
}

// init
reloadAll();
