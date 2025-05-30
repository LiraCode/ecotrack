// Função para marcar um agendamento como concluído
export const completeScheduling = async (schedulingId) => {
  try {
    // Obter token de autenticação do localStorage
    const token = localStorage.getItem('ecotrack_token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`/api/schedule/${schedulingId}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao concluir agendamento');
    }
    
    const data = await response.json();
    return { success: true, message: data.message, updatedScores: data.updatedScores };
  } catch (error) {
    console.error('Erro ao concluir agendamento:', error);
    return { success: false, error: error.message };
  }
};

// Função para cancelar um agendamento
export const cancelScheduling = async (schedulingId) => {
  try {
    // Obter token de autenticação do localStorage
    const token = localStorage.getItem('ecotrack_token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`/api/schedule/${schedulingId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Cancelado' })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao cancelar agendamento');
    }
    
    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    return { success: false, error: error.message };
  }
};
