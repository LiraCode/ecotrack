const mongoose = require('mongoose');
require('dotenv').config();

// Modelos
const Goal = require('../models/goal');
const Score = require('../models/score');
const Waste = require('../models/waste');
const User = require('../models/user');

// URI de conexão do MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

// Função para conectar ao MongoDB
async function connectToDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado ao MongoDB com sucesso');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

// Função para garantir que existam resíduos
async function ensureWastes() {
  try {
    // Verificar se já existem resíduos
    const wasteCount = await Waste.countDocuments();
    
    if (wasteCount === 0) {
      console.log('Nenhum resíduo encontrado. Criando resíduos básicos...');
      
      // Criar resíduos básicos
      const wastesData = [
        { name: 'Plástico', description: 'Resíduos plásticos', category: 'Reciclável' },
        { name: 'Papel', description: 'Papéis e papelões', category: 'Reciclável' },
        { name: 'Vidro', description: 'Garrafas e outros vidros', category: 'Reciclável' },
        { name: 'Metal', description: 'Latas e outros metais', category: 'Reciclável' },
        { name: 'Eletrônicos', description: 'Resíduos eletrônicos', category: 'Especial' }
      ];
      
      const result = await Waste.insertMany(wastesData);
      console.log(`${result.length} resíduos criados com sucesso`);
    }
    
    // Buscar e retornar os resíduos
    return await Waste.find().limit(5);
  } catch (error) {
    console.error('Erro ao garantir resíduos:', error);
    throw error;
  }
}

// Função para importar metas
async function importGoals() {
  try {


    // Garantir que existam resíduos
    const wastes = await ensureWastes();
    



    console.log(`Encontrados ${wastes.length} resíduos para usar nas metas`);
    
    // Dados de exemplo para metas
    const goalsData = [
      {
        title: 'Reciclagem de Plástico - Junho',
        description: 'Reciclar plástico durante o mês de junho',
        initialDate: new Date('2025-06-01'),
        validUntil: new Date('2025-06-30'),
        status: 'active',
        points: 150,
        targetType: 'weight',
        targetValue: 20,
        challenges: [
          {
            waste: wastes[0]._id,
            weight: 20,
          }
        ]
      },
      {
        title: 'Coleta de Garrafas PET - Julho',
        description: 'Coletar garrafas PET durante o mês de julho',
        initialDate: new Date('2025-07-01'),
        validUntil: new Date('2025-07-31'),
        status: 'active',
        points: 200,
        targetType: 'quantity',
        targetValue: 50,
        challenges: [
          {

            waste: wastes[0]._id, // Usando o mesmo resíduo se não houver suficientes
            quantity: 50,
          }
        ]
      },
      {
        title: 'Reciclagem de Papel - Agosto',
        description: 'Reciclar papel e papelão durante o mês de agosto',
        initialDate: new Date('2025-08-01'),
        validUntil: new Date('2025-08-31'),
        status: 'active',
        points: 180,
        targetType: 'weight',
        targetValue: 15,
        challenges: [
          {

            waste: wastes.length > 1 ? wastes[1]._id : wastes[0]._id,
            weight: 15,
          }
        ]
      },
      {
        title: 'Coleta de Eletrônicos - Setembro',
        description: 'Coletar eletrônicos usados durante setembro',
        initialDate: new Date('2025-09-01'),
        validUntil: new Date('2025-09-30'),
        status: 'inactive',
        points: 300,
        targetType: 'weight',
        targetValue: 10,
        challenges: [
          {

            waste: wastes.length > 4 ? wastes[4]._id : wastes[0]._id,
            weight: 10,
          }
        ]
      },
      {
        title: 'Reciclagem Multimaterial - Outubro',
        description: 'Meta multimaterial: reciclar diversos tipos de resíduos',
        initialDate: new Date('2025-10-01'),
        validUntil: new Date('2025-10-31'),
        status: 'active',
        points: 500,
        targetType: 'weight',
        targetValue: 50,
        challenges: [
          {
            waste: wastes[0]._id,
            weight: 15,
          },
          {

            waste: wastes.length > 1 ? wastes[1]._id : wastes[0]._id,
            weight: 15,
          },
          {

            waste: wastes.length > 2 ? wastes[2]._id : wastes[0]._id,
            weight: 20,
          }
        ]
      }
    ];
    
    // Limpar coleção existente
    await Goal.deleteMany({});
    console.log('Coleção de metas limpa com sucesso');
    
    // Inserir novas metas
    const result = await Goal.insertMany(goalsData);
    console.log(`${result.length} metas importadas com sucesso`);
    
    return result;
  } catch (error) {
    console.error('Erro ao importar metas:', error);
    throw error;
  }
}

// Função para garantir que existam usuários
async function ensureUsers() {
  try {
    // Verificar se já existem usuários
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('Nenhum usuário encontrado. Criando usuários de exemplo...');
      
      // Criar usuários de exemplo
      const usersData = [
        {
          firebaseId: 'firebase1',
          cpf: '12345678901',
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '11987654321',
          role: 'user',
          address: [new mongoose.Types.ObjectId()] // ID fictício para endereço
        },
        {
          firebaseId: 'firebase2',
          cpf: '23456789012',
          name: 'Maria Souza',
          email: 'maria@example.com',
          phone: '11976543210',
          role: 'user',
          address: [new mongoose.Types.ObjectId()] // ID fictício para endereço
        },
        {
          firebaseId: 'firebase3',
          cpf: '34567890123',
          name: 'Pedro Santos',
          email: 'pedro@example.com',
          phone: '11965432109',
          role: 'user',
          address: [new mongoose.Types.ObjectId()] // ID fictício para endereço
        }
      ];
      
      const result = await User.insertMany(usersData);
      console.log(`${result.length} usuários criados com sucesso`);
    }
    
    // Buscar e retornar os usuários
    return await User.find().limit(10);
  } catch (error) {
    console.error('Erro ao garantir usuários:', error);
    throw error;
  }
}

// Função para importar scores
async function importScores(goals) {
  try {
    if (!goals || goals.length === 0) {
      console.log('Nenhuma meta encontrada para criar scores.');
      return [];
    }
    
    // Garantir que existam usuários
    const users = await ensureUsers();
    
    console.log(`Encontrados ${users.length} usuários para criar scores`);
    
    // Dados de exemplo para scores
    const scoresData = [];
    
    // Criar alguns scores para cada usuário
    for (const user of users) {
      // Cada usuário participa de 1-3 metas aleatórias
      const numGoals = Math.floor(Math.random() * 4) + 1;
      const userGoals = [...goals].sort(() => 0.5 - Math.random()).slice(0, Math.min(numGoals, goals.length));
      
      for (const goal of userGoals) {
        // Determinar status aleatório
        const statuses = ['active', 'completed', 'expired'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Calcular progresso e pontos ganhos com base no status
        let currentValue = 0;
        let earnedPoints = 0;
        
        if (randomStatus === 'completed') {
          // Se completado, o valor atual é igual ou maior que o valor alvo
          currentValue = goal.targetValue;
          earnedPoints = goal.points;
        } else if (randomStatus === 'active') {
          // Se ativo, o valor atual é entre 0 e o valor alvo
          currentValue = Math.floor(Math.random() * goal.targetValue);
        } else if (randomStatus === 'expired') {
          // Se expirado, o valor atual é entre 0 e o valor alvo
          currentValue = Math.floor(Math.random() * goal.targetValue);
        }
        
        // Criar score
        const scoreData = {
          clientId: user._id,
          goalId: goal._id,
          status: randomStatus,
          currentValue: currentValue,
          earnedPoints: earnedPoints,
          createdAt: new Date(goal.initialDate),
          updatedAt: new Date()
        };
        
        scoresData.push(scoreData);
      }
    }
    
    // Limpar coleção existente
    await Score.deleteMany({});
    console.log('Coleção de scores limpa com sucesso');
    
    // Inserir novos scores
    const result = await Score.insertMany(scoresData);
    console.log(`${result.length} scores importados com sucesso`);
    
    return result;
  } catch (error) {
    console.error('Erro ao importar scores:', error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    await connectToDB();
    
    // Importar metas
    const goals = await importGoals();
    
    // Importar scores
    await importScores(goals);
    
    console.log('Importação concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a importação:', error);
    process.exit(1);
  }
}

// Executar script
main();