import mongoose from 'mongoose';

// Goal Schema
const GoalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Título é obrigatório']
    },
    description: {
        type: String,
        required: [true, 'Descrição é obrigatória']
    },
    initialDate: {
        type: Date,
        required: [true, 'Data inicial é obrigatória']
    },
    validUntil: {
        type: Date,
        required: [true, 'Data final é obrigatória']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
    points: {
        type: Number,
        required: [true, 'Pontuação é obrigatória'],
        min: [1, 'Pontuação deve ser maior que zero']
    },
    challenges: [{
        waste: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Waste',
            required: [true, 'Tipo de resíduo é obrigatório']
        },
        value: {
            type: mongoose.Schema.Types.Decimal128,
            required: [true, 'Valor é obrigatório']
        },
        type: {
            type: String,
            enum: ['quantity', 'weight'],
            required: [true, 'Tipo de medida é obrigatório']
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: [true, 'Criador é obrigatório']
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

// Middleware para verificar e atualizar status de meta expirada
GoalSchema.pre('save', function(next) {
    // Atualizar data de modificação
    this.updatedAt = new Date();
    
    // Verificar se a meta está expirada
    if (this.status === 'active' && this.validUntil) {
        const now = new Date();
        if (now > new Date(this.validUntil)) {
            this.status = 'expired';
            console.log(`Meta ${this._id} atualizada para expirada no middleware`);
        }
    }
    
    next();
});

// Método para verificar se a meta está expirada
GoalSchema.methods.isExpired = function() {
    if (!this.validUntil) return false;
    return new Date() > new Date(this.validUntil);
};

// Método para verificar se a meta está ativa
GoalSchema.methods.isActive = function() {
    return this.status === 'active' && !this.isExpired();
};

const Goal = mongoose.models.Goal || mongoose.model('Goal', GoalSchema);

export default Goal;
