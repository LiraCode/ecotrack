const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const CollectionPoint = require('../models/collectionPoint');
const Address = require('../models/address');
const Responsable = require('../models/responsable');
const Waste = require('../models/waste');

// Importar dados dos ecopontos
const { ecoPointsData } = require('../data/ecoPointsData');

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

// Função para garantir que existam tipos de resíduos
async function ensureWasteTypes() {
  try {
    // Verificar se já existem tipos de resíduos
    const wasteCount = await Waste.countDocuments();
    
    if (wasteCount === 0) {
      console.log('Nenhum tipo de resíduo encontrado. Criando tipos básicos...');
      
      // Criar tipos básicos de resíduos
      const wastesData = [
        { name: 'Plástico', description: 'Resíduos plásticos', category: 'Reciclável' },
        { name: 'Papel', description: 'Papéis e papelões', category: 'Reciclável' },
        { name: 'Vidro', description: 'Garrafas e outros vidros', category: 'Reciclável' },
        { name: 'Metal', description: 'Latas e outros metais', category: 'Reciclável' },
        { name: 'Eletrônicos', description: 'Resíduos eletrônicos', category: 'Especial' },
        { name: 'Óleo de cozinha', description: 'Óleo de cozinha usado', category: 'Especial' },
        { name: 'Pilhas e baterias', description: 'Pilhas e baterias usadas', category: 'Especial' }
      ];
      
      const result = await Waste.insertMany(wastesData);
      console.log(`${result.length} tipos de resíduos criados com sucesso`);
    }
    
    // Buscar e retornar os tipos de resíduos
    return await Waste.find();
  } catch (error) {
    console.error('Erro ao garantir tipos de resíduos:', error);
    throw error;
  }
}

// Função para garantir que exista um responsável
async function ensureResponsable() {
  try {
    // Verificar se já existe um responsável
    const responsableCount = await Responsable.countDocuments();
    
    if (responsableCount === 0) {
      console.log('Nenhum responsável encontrado. Criando responsável padrão...');
      
      // Criar responsável padrão
      const responsableData = {
        name: 'Secretaria Municipal de Desenvolvimento Sustentável',
        email: 'sustentabilidade@maceio.al.gov.br',
        phone: '82 3312-5000',
        document: '12.200.135/0001-80', // CNPJ fictício
        address: new mongoose.Types.ObjectId() // ID fictício para endereço
      };
      
      const responsable = new Responsable(responsableData);
      await responsable.save();
      console.log('Responsável padrão criado com sucesso');
      return responsable;
    }
    
    // Buscar e retornar o primeiro responsável
    return await Responsable.findOne();
  } catch (error) {
    console.error('Erro ao garantir responsável:', error);
    throw error;
  }
}

// Função para extrair número do endereço
function extractNumberFromAddress(addressStr) {
  // Procurar por padrões como "n°476" ou números no início
  const numberMatch = addressStr.match(/n°(\d+)/) || addressStr.match(/nº(\d+)/) || addressStr.match(/n\.(\d+)/) || addressStr.match(/^(\d+)/);
  
  if (numberMatch && numberMatch[1]) {
    return numberMatch[1];
  }
  
  // Se não encontrar um padrão específico, retornar "S/N"
  return "S/N";
}

// Função para extrair rua do endereço
function extractStreetFromAddress(addressStr) {
  // Remover o número se estiver no início
  let street = addressStr.replace(/^\d+\s*,?\s*/, '');
  
  // Remover padrões como "n°476"
  street = street.replace(/,?\s*n°\d+/, '').replace(/,?\s*nº\d+/, '').replace(/,?\s*n\.\d+/, '');
  
  // Pegar a primeira parte do endereço até a primeira vírgula ou traço
  const parts = street.split(/[,-]/);
  return parts[0].trim();
}

// Função para extrair bairro do endereço ou usar a região
function extractNeighborhoodFromAddress(addressStr, region) {
  // Procurar por padrões como "- Bairro" ou após vírgula
  const parts = addressStr.split(/[,-]/);
  
  if (parts.length > 1) {
    // Pegar a última parte como bairro
    return parts[parts.length - 1].trim();
  }
  
  // Se não encontrar, usar a região
  return region;
}

// Função principal para importar ecopontos
async function importEcoPoints() {
  try {
    // Conectar ao banco de dados
    await connectToDB();
    
    // Garantir que existam tipos de resíduos
    const wasteTypes = await ensureWasteTypes();
    
    // Garantir que exista um responsável
    const responsable = await ensureResponsable();
    
    // Limpar coleções existentes (opcional - remova se quiser preservar dados)
    await CollectionPoint.deleteMany({});
    console.log('Coleção de pontos de coleta limpa com sucesso');
    
    // Processar cada ecoponto
    const ecoPointsPromises = ecoPointsData.map(async (ecoPoint) => {
      try {
        // Extrair informações do endereço
        const number = extractNumberFromAddress(ecoPoint.address);
        const street = extractStreetFromAddress(ecoPoint.address);
        const neighborhood = extractNeighborhoodFromAddress(ecoPoint.address, ecoPoint.region);
        
        // Criar endereço
        const address = new Address({
          street: street,
          number: number,
          complement: '',
          neighborhood: neighborhood,
          city: 'Maceió',
          state: 'AL',
          zipCode: '57000-000', // CEP genérico para Maceió
          isDefault: true
        });
        
        await address.save();
        console.log(`Endereço criado para ${ecoPoint.name}`);
        
        // Selecionar aleatoriamente alguns tipos de resíduos para este ponto
        const randomWasteTypes = wasteTypes
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * wasteTypes.length) + 1)
          .map(waste => waste._id);
        
        // Criar ponto de coleta
        const collectionPoint = new CollectionPoint({
          cnpj: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`, // CNPJ fictício
          name: ecoPoint.name,
          description: `Ponto de coleta localizado na região de ${ecoPoint.region}`,
          responsableId: responsable._id,
          typeOfWasteId: randomWasteTypes,
          address: address._id,
          location: {
            type: 'Point',
            coordinates: [ecoPoint.lng, ecoPoint.lat] // [longitude, latitude]
          }
        });
        
        await collectionPoint.save();
        console.log(`Ponto de coleta ${ecoPoint.name} criado com sucesso`);
        
        return collectionPoint;
      } catch (error) {
        console.error(`Erro ao processar ecoponto ${ecoPoint.name}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(ecoPointsPromises);
    const successCount = results.filter(result => result !== null).length;
    
    console.log(`Importação concluída: ${successCount} de ${ecoPointsData.length} ecopontos importados com sucesso`);
  } catch (error) {
    console.error('Erro durante a importação:', error);
  } finally {
    // Fechar conexão com o banco de dados
    mongoose.connection.close();
    console.log('Conexão com o banco de dados fechada');
  }
}

// Executar a importação
importEcoPoints();