const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json()); // 👈 necesario para leer el body JSON

// Ruta para servir tus JSON
app.get('/productos', (req, res) => {
  const productos = require('./Elias/VentaDeAudifonos/db.json'); // tu archivo JSON
  res.json(productos);
});

app.get('/ventas', (req, res) => {
  const ventas = require('./Elias/VentaDeAudifonos/db.json'); // tu archivo JSON
  res.json(ventas);
});

// ✅ NUEVA RUTA: agregar producto
app.post('/productos', (req, res) => {
  try {
    const dbPath = './Elias/VentaDeAudifonos/db.json';
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const nuevoProducto = req.body;

    // Si no tiene id, generar uno automático
    if (!nuevoProducto.id) {
      nuevoProducto.id = Date.now().toString();
    }

    // Agregar al arreglo de productos
    data.productos.push(nuevoProducto);

    // Guardar cambios en el archivo
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

    res.status(201).json({ message: 'Producto agregado correctamente', producto: nuevoProducto });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ message: 'Error al agregar producto', error: error.message });
  }
});

// Configuración SSL
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// Escuchar en IP y puerto deseado
const HOST = '172.23.243.26';
const PORT = 3000;

https.createServer(options, app).listen(PORT, HOST, () => {
  console.log(`Servidor HTTPS corriendo en https://${HOST}:${PORT}`);
});
