// Serviço para buscar endereço pelo CEP
export const fetchAddressByCEP = async (cep) => {
  try {
    // Remove formatação do CEP
    const cleanCEP = cep.replace(/[^\d]/g, '');
    
    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      success: true,
      address: {
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        zipCode: cleanCEP
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Serviço para obter coordenadas do endereço
export const getCoordinatesFromAddress = async (address) => {
  try {
    const fullAddress = `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}, ${address.state}, Brasil`;
    
    // Usando a API do OpenStreetMap Nominatim (gratuita)
    const response = await fetch(
      `   https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
    );
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Coordenadas não encontradas para este endereço');
    }

    return {
      success: true,
      coordinates: {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};