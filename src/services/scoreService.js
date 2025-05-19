// Adicione esta importação no topo do arquivo
import { getAuthToken } from '@/services/authService';
// Serviço para gerenciar scores e participação em metas

// Obter scores do usuário
export const getUserScores = async (status = null) => {
  try {
    let url = '/api/scores';
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
      throw new Error(errorData.error || 'Erro ao buscar scores');
    }
    
    const data = await response.json();
    return { success: true, scores: data.scores };
  } catch (error) {
    console.error('Erro ao buscar scores:', error);
    return { success: false, error: error.message };
  }
};

// Obter score por ID
export const getScoreById = async (id) => {
  try {
    const response = await fetch(`/api/scores?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar score');
    }
    
    const data = await response.json();
    return { success: true, score: data.scores[0] };
  } catch (error) {
    console.error('Erro ao buscar score:', error);
    return { success: false, error: error.message };
  }
};

// Participar de uma meta
export const joinGoal = async (goalId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Não foi possível obter o token de autenticação');
    }
    
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goalId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao participar da meta');
    }
    
    const data = await response.json();
    return { success: true, score: data.score };
  } catch (error) {
    console.error('Erro ao participar da meta:', error);
    return { success: false, error: error.message };
  }
};

// Atualizar score manualmente (admin)
export const updateScore = async (id, scoreData) => {
  try {
    const response = await fetch('/api/scores', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...scoreData
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar score');
    }
    
    const data = await response.json();
    return { success: true, score: data.score };
  } catch (error) {
    console.error('Erro ao atualizar score:', error);
    return { success: false, error: error.message };
  }
};

// Obter ranking
export const getRanking = async (limit = 10, goalId = null) => {
  try {
    let url = `/api/scores/ranking?limit=${limit}`;
    if (goalId) {
      url += `&goalId=${goalId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar ranking');
    }
    
    const data = await response.json();
    return { success: true, ranking: data.ranking };
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return { success: false, error: error.message };
  }
};

// Atualizar scores a partir de um agendamento concluído
export const updateScoresFromScheduling = async (schedulingId) => {
  try {
    const response = await fetch('/api/scores/update-from-scheduling', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schedulingId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar scores a partir do agendamento');
    }
    
    const data = await response.json();
    return { success: true, updatedScores: data.updatedScores };
  } catch (error) {
    console.error('Erro ao atualizar scores a partir do agendamento:', error);
    return { success: false, error: error.message };
  }
};


// Verificar scores expirados
export const checkExpiredScores = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Não foi possível obter o token de autenticação');
    }
    
    const response = await fetch('/api/scores/check-expired', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao verificar scores expirados');
    }
    
    const data = await response.json();
    return { success: true, expiredCount: data.expiredCount };
  } catch (error) {
    console.error('Erro ao verificar scores expirados:', error);
    return { success: false, error: error.message };
  }
};

// Atualizar progresso de um score
export const updateScoreProgress = async (scoreId, currentValue) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Não foi possível obter o token de autenticação');
    }
    
    const response = await fetch(`/api/scores/${scoreId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentValue }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar progresso');
    }
    
    const data = await response.json();
    return { success: true, score: data.score };
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return { success: false, error: error.message };
  }
};

// Remover participação em uma meta
export const removeScore = async (scoreId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Não foi possível obter o token de autenticação');
    }
    
    const response = await fetch(`/api/scores/${scoreId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao remover participação');
    }
    
    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erro ao remover participação:', error);
    return { success: false, error: error.message };
  }
};