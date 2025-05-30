import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Criar índice composto para consultas eficientes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Verificar se o modelo já existe para evitar recompilação
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification; 