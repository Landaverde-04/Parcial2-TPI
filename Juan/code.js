document.addEventListener('DOMContentLoaded', function() {
    let data = {};
    let currentProducts = [];

    // Generate or get unique user ID for this browser session
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
        localStorage.setItem('userId', userId);
    }

    // Get user name
    let userName = localStorage.getItem('userName');

    fetch('chemistoreapi.json')
        .then(response => response.json())
        .then(fetchedData => {
            data = fetchedData;

            // Only run product rendering if on index.html (productos-grid exists)
            const grid = document.getElementById('productos-grid');
            if (grid) {
                // Parse URL params for category filter
                const urlParams = new URLSearchParams(window.location.search);
                const categoryId = urlParams.get('category') ? parseInt(urlParams.get('category')) : null;

                if (categoryId) {
                    currentProducts = data.camisetas.filter(producto => producto.categoriaId === categoryId);
                } else {
                    currentProducts = data.camisetas;
                }
                renderProducts(currentProducts);

                // Optional: Make h2 clickable to show all (reset without changing URL)
                const h2Title = document.querySelector('header h2');
                h2Title.style.cursor = 'pointer';
                h2Title.addEventListener('click', function() {
                    currentProducts = data.camisetas;
                    renderProducts(currentProducts);
                    // Update URL to remove category param
                    window.history.replaceState({}, document.title, window.location.pathname);
                });
            }
        })
        .catch(error => console.error('Error fetching data:', error));

    function renderProducts(productos) {
        const grid = document.getElementById('productos-grid');
        if (!grid) return;

        grid.innerHTML = ''; // Clear grid

        const categorias = data.categorias;
        const tallas = data.tallas;

        productos.forEach(producto => {
            // Map categoriaId to categoria name
            const categoria = categorias.find(cat => cat.id === producto.categoriaId)?.nombre || 'Desconocida';

            // Map talla ids to names
            const tallasNombres = producto.talla.map(id => tallas.find(t => t.id === id)?.nombre || 'Desconocida').join(', ');

            // Create card
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

    // Reviews functionality for opinion.html
    if (document.getElementById('reviews-list')) {
        let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        let editingId = null;

        const form = document.getElementById('review-form');
        const nameInput = document.getElementById('review-name');
        const commentInput = document.getElementById('review-comment');
        const list = document.getElementById('reviews-list');

        // Pre-fill name if exists
        nameInput.value = userName || '';

        function renderReviews() {
            list.innerHTML = '';
            reviews.forEach(review => {
                const card = document.createElement('div');
                card.className = 'review-card';

                // Only show edit/delete buttons if review belongs to current user
                const isOwner = review.userId === userId;

                card.innerHTML = `
                    <h4>${review.name}</h4>
                    <p>${review.comment}</p>
                    <small>${new Date(review.date).toLocaleString()}</small>
                    ${isOwner ? `<button class="edit-btn" data-id="${review.id}">Editar</button>
                    <button class="delete-btn" data-id="${review.id}">Eliminar</button>` : ''}
                `;
                list.appendChild(card);
            });
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = nameInput.value.trim();
            const comment = commentInput.value.trim();
            if (!name || !comment) return;

            if (editingId) {
                const review = reviews.find(r => r.id === editingId);
                if (review && review.userId === userId) {
                    review.name = name;
                    review.comment = comment;
                    editingId = null;
                    form.querySelector('button').textContent = 'Publicar';
                } else {
                    alert('No tienes permiso para editar este comentario.');
                    return;
                }
            } else {
                // Check if name matches registered name
                if (userName && name !== userName) {
                    alert('Debes usar tu nombre registrado: ' + userName);
                    return;
                }
                if (!userName) {
                    localStorage.setItem('userName', name);
                    userName = name;
                }
                const newReview = {
                    id: Date.now(),
                    name,
                    comment,
                    date: new Date().toISOString(),
                    userId: userId
                };
                reviews.push(newReview);
            }
            localStorage.setItem('reviews', JSON.stringify(reviews));
            nameInput.value = '';
            commentInput.value = '';
            renderReviews();
        });

        list.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const id = parseInt(e.target.dataset.id);
                const review = reviews.find(r => r.id === id);
                if (review && review.userId === userId) {
                    nameInput.value = review.name;
                    commentInput.value = review.comment;
                    editingId = id;
                    form.querySelector('button').textContent = 'Actualizar';
                } else {
                    alert('No tienes permiso para editar este comentario.');
                }
            } else if (e.target.classList.contains('delete-btn')) {
                const id = parseInt(e.target.dataset.id);
                const review = reviews.find(r => r.id === id);
                if (review && review.userId === userId) {
                    if (confirm('¿Eliminar esta opinión?')) {
                        reviews = reviews.filter(r => r.id !== id);
                        localStorage.setItem('reviews', JSON.stringify(reviews));
                        renderReviews();
                    }
                } else {
                    alert('No tienes permiso para eliminar este comentario.');
                }
            }
        });

        renderReviews();
    }
});
