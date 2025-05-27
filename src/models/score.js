const mongoose = require('mongoose');

// Score Schema
const ScoreSchema = new mongoose.Schema({
      clientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      goalId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Goal', 
        required: true 
      },
      status: { 
        type: String, 
        required: true, 
        enum: ['active', 'inactive', 'expired', 'completed'], 
        default: 'active' 
      },
      // Objeto para armazenar o progresso de cada desafio
      progress: {
        type: Map,
        of: {
          currentValue: { type: Number, default: 0 },
          targetValue: { type: Number, required: true },
          completed: { type: Boolean, default: false }
        },
        default: new Map()
      },
      // Pontuação total ganha (só é contabilizada quando o status é 'completed')
      earnedPoints: { 
        type: Number, 
        default: 0 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      },
      updatedAt: { 
        type: Date, 
        default: Date.now 
      }
});

// Método para atualizar o progresso de um desafio específico
ScoreSchema.methods.updateProgress = async function(challengeId, currentValue) {
  if (!this.progress) {
    this.progress = new Map();
  }

  const challenge = this.progress.get(challengeId);
  if (!challenge) {
    return false;
  }

  challenge.currentValue = currentValue;
  challenge.completed = currentValue >= challenge.targetValue;
  this.progress.set(challengeId, challenge);
  this.markModified('progress');

  // Verificar se todos os desafios foram completados
  const allCompleted = Array.from(this.progress.values()).every(p => p.completed);
  if (allCompleted) {
    this.status = 'completed';
    // Buscar a pontuação da meta
    const Goal = mongoose.model('Goal');
    const goal = await Goal.findById(this.goalId);
    if (goal) {
      this.earnedPoints = goal.points;
    }
  }

  return true;
};

// Método para atualizar o progresso de um tipo específico de resíduo
ScoreSchema.methods.updateWasteProgress = function(wasteId, quantity) {
  if (!this.populated('goalId')) {
    throw new Error('O campo goalId precisa estar populado para atualizar o progresso');
  }

  // Encontrar o desafio correspondente ao tipo de resíduo
  const challenge = this.goalId.challenges.find(c => 
    c.waste._id.toString() === wasteId.toString()
  );

  if (!challenge) {
    return false;
  }

  const challengeId = challenge._id.toString();

  // Inicializar o progresso se necessário
  if (!this.progress) {
    this.progress = new Map();
  }

  let currentProgress = this.progress.get(challengeId) || {
    currentValue: 0,
    targetValue: parseFloat(challenge.value),
    completed: false
  };

  // Atualizar o valor atual
  currentProgress.currentValue += quantity;

  // Verificar se o desafio foi completado
  currentProgress.completed = currentProgress.currentValue >= currentProgress.targetValue;

  // Salvar o progresso atualizado
  this.progress.set(challengeId, currentProgress);
  this.markModified('progress');

  // Verificar se todos os desafios foram completados
  const allCompleted = Array.from(this.progress.values()).every(p => p.completed);
  if (allCompleted) {
    this.status = 'completed';
    this.earnedPoints = this.goalId.points;
  }

  return true;
};

// Middleware para atualizar o campo updatedAt antes de salvar
ScoreSchema.pre('save', function(next) {
      this.updatedAt = new Date();
      next();
});

// Middleware para verificar se a meta expirou
ScoreSchema.pre('save', async function(next) {
      if (this.status === 'active') {
          try {
              // Buscar a meta associada para obter a data de término
              const Goal = mongoose.model('Goal');
              const goal = await Goal.findById(this.goalId);
            
              if (goal && goal.validUntil && new Date() > new Date(goal.validUntil)) {
                  // Meta expirou
                  this.status = 'expired';
                  console.log(`Meta ${goal._id} expirou!`);
              }
          } catch (error) {
              console.error('Erro ao verificar expiração da meta:', error);
              // Não interromper o salvamento por causa deste erro
          }
      }
      next();
});

module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema);