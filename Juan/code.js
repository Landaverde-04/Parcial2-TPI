document.addEventListener('DOMContentLoaded', function() {
  let data = { categorias: [], tallas: [], camisetas: [], comentarios: [] };
  let firstCommentName = null;

  const API_BASE = 'http://172.23.162.164:3000';

  // Fetch categorías, tallas y camisetas (si uno falla devolvemos array vacío para no romper todo)
  const fetchCategorias = fetch(`${API_BASE}/categorias`).then(r => r.ok ? r.json() : []).catch(() => []);
  const fetchTallas = fetch(`${API_BASE}/tallas`).then(r => r.ok ? r.json() : []).catch(() => []);
  const fetchCamisetas = fetch(`${API_BASE}/camisetas`).then(r => r.ok ? r.json() : []).catch(() => []);

  Promise.all([fetchCategorias, fetchTallas, fetchCamisetas])
    .then(([categorias, tallas, camisetas]) => {
      data.categorias = Array.isArray(categorias) ? categorias : [];
      data.tallas = Array.isArray(tallas) ? tallas : [];
      data.camisetas = Array.isArray(camisetas) ? camisetas : [];

      // Render productos si existe el grid
      const grid = document.getElementById('productos-grid');
      if (grid) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category') ? parseInt(urlParams.get('category')) : null;
        const productos = categoryId
          ? data.camisetas.filter(p => p.categoriaId === categoryId)
          : data.camisetas;
        renderProducts(productos);
      }
    })
    .catch(err => {
      console.error('Error fetching productos:', err);
      // Intentamos renderizar 
      renderProducts(data.camisetas || []);
    });

  // Cargar comentarios desde JSON Server
  function loadComments() {
    fetch(`${API_BASE}/comentario`)
      .then(r => {
        if (!r.ok) throw new Error('Respuesta no OK');
        return r.json();
      })
      .then(jsonData => {
        data.comentarios = Array.isArray(jsonData) ? jsonData : [];
        renderComments(data.comentarios);
      })
      .catch(err => {
        console.error('Error fetching comentarios desde JSON Server:', err);
        data.comentarios = [];
        renderComments(data.comentarios);
      });
  }

  // Sólo cargamos comentarios si existe el formulario (así no bloqueamos la página principal)
  if (document.getElementById('review-form')) {
    loadComments();
  }

  // render de los productos
  function renderProducts(productos) {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const categorias = data.categorias || [];
    const tallas = data.tallas || [];

    (productos || []).forEach(producto => {
      // producto.talla puede no existir
      const productoTallas = Array.isArray(producto.talla) ? producto.talla : [];
      const categoria = categorias.find(c => c.id === producto.categoriaId)?.nombre || 'Desconocida';
      const tallasNombres = productoTallas
        .map(id => tallas.find(t => t.id === id)?.nombre || 'Desconocida')
        .join(', ');

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${producto.img}" alt="${producto.nombre}">
        <h4>${producto.nombre}</h4>
        <p><strong>Categoría:</strong> ${categoria}</p>
        <p>${producto.descripcion}</p>
        <p class="precio">$${producto.precio}</p>
        <p><strong>Tallas:</strong> ${tallasNombres}</p>
      `;

      card.addEventListener('click', () => {
        window.location.href = `producto.html?id=${producto.id}`;
      });

      grid.appendChild(card);
    });
  }

  // render de los comentarios
  function renderComments(comments) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    list.innerHTML = '';
    comments.forEach(comment => {
      const div = document.createElement('div');
      div.className = 'review-card';
      div.innerHTML = `
        <h4>${escapeHtml(comment.nombre)}</h4>
        <p>${escapeHtml(comment.comentario)}</p>
        <button class="delete-btn" data-id="${comment.id}">Eliminar</button>
      `;

      // Solo permitir eliminar comentarios que no sean de la lista original (id <= 3)
      const deleteBtn = div.querySelector('.delete-btn');
      if (comment.id && comment.id <= 3) {
        deleteBtn.style.display = 'none';
      } else if (comment.id) {
        deleteBtn.addEventListener('click', () => {
          if (confirm('¿Seguro que quieres eliminar este comentario?')) {
            deleteComment(comment.id);
          }
        });
      }

      list.appendChild(div);
    });
  }

  // Agregar comentario (POST)
  function addComment(comment) {
    fetch(`${API_BASE}/comentario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    })
      .then(r => {
        if (!r.ok) throw new Error('Error al agregar comentario');
        return r.json();
      })
      .then(newComment => {
        loadComments();
      })
      .catch(err => {
        alert('Error al agregar comentario: ' + err.message);
      });
  }

  // Eliminar comentario (DELETE)
  function deleteComment(id) {
    fetch(`${API_BASE}/comentario/${id}`, {
      method: 'DELETE'
    })
      .then(r => {
        if (!r.ok) throw new Error('Error al eliminar comentario');
        loadComments();
      })
      .catch(err => {
        alert('Error al eliminar comentario: ' + err.message);
      });
  }

  //  envío y POST
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', e => {
      e.preventDefault();
      const nameEl = document.getElementById('review-name');
      const commentEl = document.getElementById('review-comment');
      const name = nameEl ? nameEl.value.trim() : '';
      const comment = commentEl ? commentEl.value.trim() : '';

      if (!name || !comment) return alert('Por favor, complete todos los campos.');

      if (firstCommentName === null) {
        firstCommentName = name;
      } else if (name !== firstCommentName) {
        alert('Debe usar el mismo nombre que en su primer comentario.');
        return;
      }

      const newComment = { nombre: name, comentario: comment };

      addComment(newComment);

      if (nameEl) nameEl.value = '';
      if (commentEl) commentEl.value = '';
    });
  }

  // pequeña función para escapar HTML en comentarios/nombres
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, tag => ({
      '&':'&amp;','<':'<','>':'>','"':'"',"'":"&#39;"
    }[tag]));
  }
});
