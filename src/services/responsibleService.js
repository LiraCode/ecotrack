
export const createResponsible = async (responsibleData) => {
  try {
    console.log("Iniciando criação de responsável:", responsibleData.email);
    
    // Enviar dados para a API
    const response = await fetch('/api/responsible', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsibleData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao criar responsável');
    }
    
    console.log("Responsável criado com sucesso");
    return { success: true, responsible: responseData.responsible };
  } catch (error) {
    console.error("Erro ao criar responsável:", error);
    return { success: false, error: error.message };
  }
};

// Função para buscar um responsável pelo CPF
export const getResponsibleByCpf = async (cpf) => {
  try {
    const response = await fetch(`/api/responsible?cpf=${cpf}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao buscar responsável');
    }
    
    return { success: true, responsible: responseData.responsible };
  } catch (error) {
    console.error("Erro ao buscar responsável:", error);
    return { success: false, error: error.message };
  }
};

// Função para buscar um responsável pelo email
export const getResponsibleByEmail = async (email) => {
  try {
    const response = await fetch(`/api/responsible?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao buscar responsável');
    }
    
    return { success: true, responsible: responseData.responsible };
  } catch (error) {
    console.error("Erro ao buscar responsável:", error);
    return { success: false, error: error.message };
  }
};

// Função para buscar todos os responsáveis
export const getAllResponsibles = async () => {
  try {
    const response = await fetch('/api/responsible', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao buscar responsáveis');
    }
    
    return { success: true, responsibles: responseData.responsibles };
  } catch (error) {
    console.error("Erro ao buscar responsáveis:", error);
    return { success: false, error: error.message };
  }
};

// Função para atualizar um responsável
export const updateResponsible = async (id, responsibleData) => {
  try {
    const response = await fetch(`/api/responsible/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsibleData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao atualizar responsável');
    }
    
    return { success: true, responsible: responseData.responsible };
  } catch (error) {
    console.error("Erro ao atualizar responsável:", error);
    return { success: false, error: error.message };
  }
};

// Função para excluir um responsável
export const deleteResponsible = async (id) => {
  try {
    const response = await fetch(`/api/responsible/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao excluir responsável');
    }
    
    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Erro ao excluir responsável:", error);
    return { success: false, error: error.message };
  }
};