// Serviço para gerenciar colaboradores

// Função para criar um novo colaborador
export const createCollaborator = async (collaboratorData) => {
  try {
    console.log("Iniciando criação de colaborador:", collaboratorData.email);
    
    // Enviar dados para a API
    const response = await fetch('/api/collaborator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collaboratorData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao criar colaborador');
    }
    
    console.log("Colaborador criado com sucesso");
    return { success: true, collaborator: responseData.collaborator };
  } catch (error) {
    console.error("Erro ao criar colaborador:", error);
    return { success: false, error: error.message };
  }
};

// Função para buscar um colaborador pelo email
export const getCollaboratorByEmail = async (email) => {
  try {
    const response = await fetch(`/api/collaborator?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao buscar colaborador');
    }
    
    return { success: true, collaborator: responseData.collaborator };
  } catch (error) {
    console.error("Erro ao buscar colaborador:", error);
    return { success: false, error: error.message };
  }
};

// Função para buscar todos os colaboradores
export const getAllCollaborators = async () => {
  try {
    const response = await fetch('/api/collaborator', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao buscar colaboradores');
    }
    
    return { success: true, collaborators: responseData.collaborators };
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return { success: false, error: error.message };
  }
};

// Função para atualizar um colaborador
export const updateCollaborator = async (id, collaboratorData) => {
  try {
    const response = await fetch(`/api/collaborator/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collaboratorData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao atualizar colaborador');
    }
    
    return { success: true, collaborator: responseData.collaborator };
  } catch (error) {
    console.error("Erro ao atualizar colaborador:", error);
    return { success: false, error: error.message };
  }
};

// Função para excluir um colaborador
export const deleteCollaborator = async (id) => {
  try {
    const response = await fetch(`/api/collaborator/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao excluir colaborador');
    }
    
    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Erro ao excluir colaborador:", error);
    return { success: false, error: error.message };
  }
};