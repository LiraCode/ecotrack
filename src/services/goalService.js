// Serviço para gerenciar metas

// Obter todas as metas
export const getAllGoals = async (status = null) => {
  console.log('getAllGoals called with status:', status);
  try {
    let url = '/api/goals';
    if (status) {
      url += `?status=${status}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar metas');
    }
    
    const data = await response.json();
    return { success: true, goals: data.goals };
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    return { success: false, error: error.message };
  }
};

export const getGoalById = async (id) => {
  console.log('getGoalById called with id:', id);
  try {
    const response = await fetch(`/api/goals?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar meta');
    }
    
    const data = await response.json();
    return { success: true, goal: data.goals[0] };
  } catch (error) {
    console.error('Erro ao buscar meta:', error);
    return { success: false, error: error.message };
  }
};

// Criar nova meta (admin)
export const createGoal = async (goalData) => {
  try {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar meta');
    }
    
    const data = await response.json();
    return { success: true, goal: data.goal };
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    return { success: false, error: error.message };
  }
};

// Atualizar meta (admin)
export const updateGoal = async (id, goalData) => {
  try {
    const response = await fetch('/api/goals', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...goalData
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar meta');
    }
    
    const data = await response.json();
    return { success: true, goal: data.goal };
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    return { success: false, error: error.message };
  }
};

// Remover meta (admin)
export const deleteGoal = async (id) => {
  try {
    const response = await fetch(`/api/goals?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao remover meta');
    }
    
    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erro ao remover meta:', error);
    return { success: false, error: error.message };
  }
};