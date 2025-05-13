
export const getAllWasteTypes = async () => {
  try {
    const response = await fetch('/api/waste', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar tipos de resíduos');
    }
    
    const data = await response.json();
    return { success: true, wasteTypes: data.wasteTypes };
  } catch (error) {
    console.error('Erro ao buscar tipos de resíduos:', error);
    return { success: false, error: error.message };
  }
};

// Get a specific waste type by ID
export const getWasteTypeById = async (id) => {
  try {
    const response = await fetch(`/api/waste?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar tipo de resíduo');
    }
    
    const data = await response.json();
    return { success: true, waste: data.waste };
  } catch (error) {
    console.error('Erro ao buscar tipo de resíduo:', error);
    return { success: false, error: error.message };
  }
};

// Create a new waste type
export const createWasteType = async (wasteData) => {
  try {
    const response = await fetch('/api/waste', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wasteData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar tipo de resíduo');
    }
    
    const data = await response.json();
    return { success: true, waste: data.waste };
  } catch (error) {
    console.error('Erro ao criar tipo de resíduo:', error);
    return { success: false, error: error.message };
  }
};

// Update an existing waste type
export const updateWasteType = async (id, wasteData) => {
  try {
    const response = await fetch('/api/waste', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...wasteData
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar tipo de resíduo');
    }
    
    const data = await response.json();
    return { success: true, waste: data.waste };
  } catch (error) {
    console.error('Erro ao atualizar tipo de resíduo:', error);
    return { success: false, error: error.message };
  }
};

// Delete a waste type
export const deleteWasteType = async (id) => {
  try {
    const response = await fetch(`/api/waste?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao remover tipo de resíduo');
    }
    
    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erro ao remover tipo de resíduo:', error);
    return { success: false, error: error.message };
  }
};