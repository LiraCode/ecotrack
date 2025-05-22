import { auth } from '@/config/firebase/firebase';
import { updateProfile, deleteUser, getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export const registerResponsible = async (token, email, password, responsibleData) => {
  try {
    // Verificar se o token foi fornecido
    if (!token) {
      console.error("Token de autenticação não fornecido");
      return { success: false, error: "Token de autenticação não fornecido" };
    }

    console.log("Enviando solicitação para registrar responsável via API");
    
    // Estruturar os dados corretamente para a API
    const data = {
      email: email,
      password: password,
      name: responsibleData.name,
      phone: responsibleData.phone || '',
      cpf: responsibleData.cpf
    };
    
    // Enviar dados para a API usando o token do administrador atual
    const response = await fetch("/api/responsible", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao registrar responsável');
    }

    console.log("Registro de responsável concluído com sucesso");
    return { success: true, responsible: responseData.responsible };
  } catch (error) {
    console.error("Erro no registro do responsável:", error);
    return { success: false, error: error.message };
  }
};

export const updateResponsible = async (token, responsibleId, updatedData) => {
  try {
    const response = await fetch(`/api/responsible/${responsibleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(
        responseData.error || "Falha ao atualizar dados do responsável"
      );
    }

    console.log("Dados do responsável atualizados com sucesso");
    return { success: true, responsible: responseData.responsible };
  } catch (error) {
    console.error("Erro ao atualizar dados do responsável:", error);
    return { success: false, error: error.message };
  }
};

export const deleteResponsible = async (token, responsibleId) => {
  try {
    const response = await fetch(`/api/responsible/${responsibleId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(
        responseData.error || "Falha ao deletar dados do responsável"
      );
    }
    
    console.log("Dados do responsável deletados com sucesso");
    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Erro ao deletar dados do responsável:", error);
    return { success: false, error: error.message };
  }
};

export const getResponsibles = async (token) => {
  try {
    const response = await fetch("/api/responsible", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching responsibles:", errorData.error || "Unknown error");
      return [];
    }
    
    const data = await response.json();
    console.log("API response for responsibles:", data);
    
    // Verificar a estrutura da resposta e extrair o array corretamente
    if (data.success && data.responsibles && Array.isArray(data.responsibles)) {
      return data.responsibles;
    } else {
      console.error("Unexpected API response format:", data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching responsibles:', error);
    return [];
  }
};

export const getResponsibleById = async (token, id) => {
  try {
    const response = await fetch(`/api/responsible/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao buscar responsável");
    }
    
    const data = await response.json();
    return { success: true, responsible: data.responsible };
  } catch (error) {
    console.error('Erro ao buscar responsável:', error);
    return { success: false, error: error.message };
  }
};

export const getResponsibleByEmail = async (token, email) => {
  try {
    const response = await fetch(`/api/responsible?email=${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao buscar responsável por email");
    }
    
    const data = await response.json();
    return { success: true, responsible: data.responsible };
  } catch (error) {
    console.error('Erro ao buscar responsável por email:', error);
    return { success: false, error: error.message };
  }
};
