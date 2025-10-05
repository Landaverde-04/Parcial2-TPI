const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json()); 

const DB_PATH = './Elias/VentaDeAudifonos/db.json';

// Función auxiliar para leer la base de datos
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

// Función auxiliar para escribir en la base de datos
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Función para obtener el siguiente ID autoincremental para productos
function getNextProductId() {
  const data = readDB();
  if (data.productos.length === 0) {
    return 1;
  }
  // Encontrar el ID más alto y sumarle 1
  const maxId = Math.max(...data.productos.map(p => parseInt(p.id) || 0));
  return maxId + 1;
}

// Función para obtener el siguiente ID autoincremental para ventas
function getNextVentaId() {
  const data = readDB();
  if (data.ventas.length === 0) {
    return 1;
  }
  // Encontrar el ID más alto y sumarle 1
  const maxId = Math.max(...data.ventas.map(v => parseInt(v.id) || 0));
  return maxId + 1;
}

// ====== RUTAS DE PRODUCTOS ======

app.get('/productos', (req, res) => {
  const data = readDB();
  res.json(data);
});

app.get('/productos/:id', (req, res) => {
  const data = readDB();
  const producto = data.productos.find(p => p.id.toString() === req.params.id.toString());
  if (producto) {
    res.json(producto);
  } else {
    res.status(404).json({ message: 'Producto no encontrado' });
  }
});

app.post('/productos', (req, res) => {
  try {
    const data = readDB();
    const nuevoProducto = req.body;

    // Asignar ID autoincremental
    nuevoProducto.id = getNextProductId().toString();

    data.productos.push(nuevoProducto);
    writeDB(data);

    res.status(201).json({ message: 'Producto agregado correctamente', producto: nuevoProducto });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ message: 'Error al agregar producto', error: error.message });
  }
});

app.put('/productos/:id', (req, res) => {
  try {
    const data = readDB();
    const index = data.productos.findIndex(p => p.id.toString() === req.params.id.toString());

    if (index !== -1) {
      data.productos[index] = { ...data.productos[index], ...req.body, id: req.params.id };
      writeDB(data);
      res.json({ message: 'Producto actualizado correctamente', producto: data.productos[index] });
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
});

app.delete('/productos/:id', (req, res) => {
  try {
    const data = readDB();
    const index = data.productos.findIndex(p => p.id.toString() === req.params.id.toString());

    if (index !== -1) {
      data.productos.splice(index, 1);
      writeDB(data);
      res.json({ message: 'Producto eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
});

// ====== RUTAS DE VENTAS ======

app.get('/ventas', (req, res) => {
  const data = readDB();
  res.json(data);
});

app.get('/ventas/:id', (req, res) => {
  const data = readDB();
  const venta = data.ventas.find(v => v.id.toString() === req.params.id.toString());
  if (venta) {
    res.json(venta);
  } else {
    res.status(404).json({ message: 'Venta no encontrada' });
  }
});

app.post('/ventas', (req, res) => {
  try {
    const data = readDB();
    const nuevaVenta = req.body;

    // Asignar ID autoincremental
    nuevaVenta.id = getNextVentaId().toString();

    data.ventas.push(nuevaVenta);
    writeDB(data);

    res.status(201).json({ message: 'Venta agregada correctamente', venta: nuevaVenta });
  } catch (error) {
    console.error('Error al agregar venta:', error);
    res.status(500).json({ message: 'Error al agregar venta', error: error.message });
  }
});

app.put('/ventas/:id', (req, res) => {
  try {
    const data = readDB();
    const index = data.ventas.findIndex(v => v.id.toString() === req.params.id.toString());

    if (index !== -1) {
      data.ventas[index] = { ...data.ventas[index], ...req.body, id: req.params.id };
      writeDB(data);
      res.json({ message: 'Venta actualizada correctamente', venta: data.ventas[index] });
    } else {
      res.status(404).json({ message: 'Venta no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar venta:', error);
    res.status(500).json({ message: 'Error al actualizar venta', error: error.message });
  }
});

app.delete('/ventas/:id', (req, res) => {
  try {
    const data = readDB();
    const index = data.ventas.findIndex(v => v.id.toString() === req.params.id.toString());

    if (index !== -1) {
      data.ventas.splice(index, 1);
      writeDB(data);
      res.json({ message: 'Venta eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Venta no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    res.status(500).json({ message: 'Error al eliminar venta', error: error.message });
  }
});

// Configuración SSL
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

const HOST = '172.23.243.26';
const PORT = 3000;

https.createServer(options, app).listen(PORT, HOST, () => {
  console.log(`Servidor HTTPS corriendo en https://${HOST}:${PORT}`);
});