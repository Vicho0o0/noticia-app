const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS para permitir el acceso desde el frontend
app.use(cors({
  origin: 'http://localhost:4321' // Cambia esto al puerto donde corre tu frontend en desarrollo
}));

// Configuración de multer para almacenar archivos en backend/public/img_noticias
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/img_noticias'),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ storage });

// Ruta para manejar la carga de imágenes
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó una imagen' });
  }

  // Generar la URL de la imagen
  const imageUrl = `http://localhost:${PORT}/img_noticias/${req.file.filename}`;
  res.json({ imageUrl });
});

// Hacer que la carpeta de imágenes sea accesible públicamente
app.use('/img_noticias', express.static(path.join(__dirname, 'public/img_noticias')));

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
