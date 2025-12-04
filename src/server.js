import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 8080;

// Conexión a Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor funcionando en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar MongoDB:', err);
  });
