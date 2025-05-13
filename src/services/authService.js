import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/config/firebase/firebase";
import mongoose from "mongoose";

// Função para registrar um novo usuário
export const registerUser = async (email, password, userData) => {
  try {
    console.log("Iniciando registro de usuário:", email);
    
    // Criar usuário no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    
    console.log("Usuário criado no Firebase:", user.uid);
    
    // Atualizar o perfil do usuário com o nome
    await updateProfile(user, {
      displayName: userData.nomeCompleto
    });
    console.log("Perfil do usuário atualizado:", user.displayName);
      
    // preparar dados do usuário para enviar à API, registerUser é somente para usuários comuns	não precisa de verificação de tipo
      const addressData = {
        street: userData.endereco || '',
        number: userData.numero || '',
        complement: userData.complemento || '',
        neighborhood: userData.bairro || '',
        city: userData.cidade || '',
        state: userData.estado || '',
        zipCode: userData.cep || '',
        isDefault: true
      };
      
      const addressResponse = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });
      
      if (!addressResponse.ok) {
        const errorData = await addressResponse.json();
        throw new Error(errorData.error || 'Erro ao criar endereço no banco de dados');
      }
      
      const addressResult = await addressResponse.json();
      const addressId = addressResult.address._id;
      console.log("Endereço criado com sucesso, ID:", addressId);
      
      // Preparar dados do usuário com a referência ao endereço
      const userDataForAPI = {
        firebaseId: user.uid,
        cpf: userData.cpf,
        name: userData.nomeCompleto,
        email: userData.email,
        phone: userData.telefone,
        role: 'user',
        address: addressId,
      };
      
      // Enviar dados para o MongoDB através da API
      console.log("Enviando dados para a API:", userDataForAPI);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataForAPI),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar usuário no banco de dados');
      }
      
      const responseData = await response.json();
      console.log("Usuário criado com sucesso:", responseData);
      
      return {
        success: true,
        user: responseData.user
      };
    }  catch (error) {
    console.error("Erro no registro:", error);
    return { success: false, error: error.message };
  }
};
// Função para registrar um responsável
export const registerResponsible = async (email, password, responsibleData) => {
  try {
    console.log("Iniciando registro de responsável:", email);
    
    // Criar usuário no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Usuário responsável criado no Firebase:", user.uid);
    
    // Atualizar o perfil do usuário com o nome
    await updateProfile(user, {
      displayName: responsibleData.name
    });
    
    // Preparar dados para enviar à API
    const dataForAPI = {
      firebaseId: user.uid,
      cpf: responsibleData.cpf,
      name: responsibleData.name,
      email: responsibleData.email,
      phone: responsibleData.phone
    };
    
    // Enviar dados para o MongoDB através da API
    console.log("Enviando dados para a API de responsáveis:", dataForAPI);
    const response = await fetch('/api/responsible', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`
      },
      body: JSON.stringify(dataForAPI),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao salvar dados do responsável');
    }
    
    console.log("Registro de responsável concluído com sucesso");
    return { success: true, responsible: responseData.responsible };
  } catch (error) {
    console.error("Erro no registro do responsável:", error);
    return { success: false, error: error.message };
  }
};

export const registerAdmin = async (email, password, adminData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, {
      displayName: adminData.nomeCompleto
    });

    const dataForAPI = {
      firebaseId: user.uid,
      name: adminData.nomeCompleto,
      email: adminData.email,
      phone: adminData.phone,
      role: adminData.role
    };
    console.log("Enviando dados para a API de administradores:", dataForAPI);
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`
      },
      body: JSON.stringify(dataForAPI),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao salvar dados do administrador');
    }

    console.log("Registro de administrador concluído com sucesso");
    return { success: true, admin: responseData.admin };
  } catch (error) {
    console.error("Erro no registro do administrador:", error);
    return { success: false, error: error.message };
  }};

// Função para fazer login


// Função para fazer logout
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return { success: false, error: error.message };
  }
};

// Função para enviar email de redefinição de senha
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email de redefinição de senha:", error);
    return { success: false, error: error.message };
  }
};

// Função para buscar dados do usuário atual
export const getCurrentUserData = async () => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('Nenhum usuário autenticado');
    }
    
    const uid = currentUser.uid;
    
    // Tentar buscar como usuário comum primeiro
    try {
      const userResponse = await fetch(`/api/users?uid=${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        return { success: true, userData: userData.user, userType: 'user' };
      }
    } catch (error) {
      console.log("Usuário não encontrado como usuário comum, tentando como colaborador...");
    }
    
    // Tentar buscar como colaborador
    try {
      const collaboratorResponse = await fetch(`/api/collaborator?uid=${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',

        },
      });
      
      if (collaboratorResponse.ok) {
        const collaboratorData = await collaboratorResponse.json();
        return { success: true, userData: collaboratorData.collaborator, userType: 'collaborator' };
      }
    } catch (error) {
      console.log("Usuário não encontrado como colaborador, tentando como responsável...");
    }
    
    // Tentar buscar como responsável
    try {
      const responsibleResponse = await fetch(`/api/responsible?uid=${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (responsibleResponse.ok) {
        const responsibleData = await responsibleResponse.json();
        return { success: true, userData: responsibleData.responsible, userType: 'responsible' };
      }
    } catch (error) {
      console.log("Usuário não encontrado como responsável");
    }
    
    // Se chegou aqui, não encontrou o usuário em nenhuma coleção
    throw new Error('Usuário não encontrado no banco de dados');
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return { success: false, error: error.message };
  }
};

// Função para buscar dados do colaborador pelo email
export const getCollaboratorData = async (email) => {
  try {
    // Buscar dados do colaborador no MongoDB
    const response = await fetch(`/api/collaborator?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao buscar dados do colaborador');
    }
    
    return { success: true, collaboratorData: responseData.collaborator };
  } catch (error) {
    console.error("Erro ao buscar dados do colaborador:", error);
    return { success: false, error: error.message };
  }
};

// Função para buscar dados do responsável pelo email ou CPF
export const getResponsibleData = async (identifier, type = 'email') => {
  try {
    // Buscar dados do responsável no MongoDB
    const queryParam = type === 'email' ? 'email' : 'cpf';
    const response = await fetch(`/api/responsible?${queryParam}=${identifier}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao buscar dados do responsável');
    }
    
    return { success: true, responsibleData: responseData.responsible };
  } catch (error) {
    console.error("Erro ao buscar dados do responsável:", error);
    return { success: false, error: error.message };
  }
};

// Função para atualizar dados do usuário
export const updateUserData = async (userData) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('Nenhum usuário autenticado');
    }
    
    // Adicionar o UID do usuário atual aos dados
    const updatedData = {
      ...userData,
      uid: currentUser.uid
    };
    
    // Atualizar dados no MongoDB
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao atualizar dados do usuário');
    }
    
    // Atualizar o displayName no Firebase Auth se o nome foi alterado
    if (userData.name && userData.name !== currentUser.displayName) {
      await updateProfile(currentUser, {
        displayName: userData.name
      });
    }
    
    return { success: true, userData: responseData.user };
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    return { success: false, error: error.message };
  }
};

// Função para atualizar dados do colaborador
export const updateCollaboratorData = async (collaboratorData) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('Nenhum usuário autenticado');
    }
    
    // Buscar o colaborador pelo firebaseId
    const getResponse = await fetch(`/api/collaborator?uid=${currentUser.uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const getData = await getResponse.json();
    
    if (!getResponse.ok) {
      console.error("Erro ao buscar colaborador:", getData);
      throw new Error(getData.error || 'Falha ao buscar dados do colaborador');
    }
    
    const collaboratorId = getData.collaborator._id;
    
    // Atualizar dados no MongoDB
    const response = await fetch(`/api/collaborator/${collaboratorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collaboratorData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao atualizar dados do colaborador');
    }
    
    // Atualizar o displayName no Firebase Auth se o nome foi alterado
    if (collaboratorData.name && collaboratorData.name !== currentUser.displayName) {
      await updateProfile(currentUser, {
        displayName: collaboratorData.name
      });
    }
    
    return { success: true, collaboratorData: responseData.collaborator };
  } catch (error) {
    console.error("Erro ao atualizar dados do colaborador:", error);
    return { success: false, error: error.message };
  }
};

// Função para atualizar dados do responsável
export const updateResponsibleData = async (responsibleData) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('Nenhum usuário autenticado');
    }
    
    // Buscar o responsável pelo firebaseId
    const getResponse = await fetch(`/api/responsible?uid=${currentUser.uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const getData = await getResponse.json();
    
    if (!getResponse.ok) {
      console.error("Erro ao buscar responsável:", getData);
      throw new Error(getData.error || 'Falha ao buscar dados do responsável');
    }
    
    const responsibleId = getData.responsible._id;
    
    // Atualizar dados no MongoDB
    const response = await fetch(`/api/responsible/${responsibleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsibleData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao atualizar dados do responsável');
    }
    
    // Atualizar o displayName no Firebase Auth se o nome foi alterado
    if (responsibleData.name && responsibleData.name !== currentUser.displayName) {
      await updateProfile(currentUser, {
        displayName: responsibleData.name
      });
    }
    
    return { success: true, responsibleData: responseData.responsible };
  } catch (error) {
    console.error("Erro ao atualizar dados do responsável:", error);
    return { success: false, error: error.message };
  }
};
