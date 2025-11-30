import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error al conectar MongoDB:', err));

// IMPORTAR routers
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta de prueba en la raíz
app.get('/', (req, res) => {
  res.send('API Funcionando');
});

// 🔥 IMPORTANTE PARA RENDER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
