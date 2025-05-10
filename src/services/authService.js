import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/config/firebase/firebase";

// Função para registrar um novo usuário
export const registerUser = async (email, password, userData) => {
  try {
    console.log("Iniciando registro de usuário:", email);
    
    // Criar usuário no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Usuário criado no Firebase:", user.uid);
    
    // Atualizar o perfil do usuário com o nome
    await updateProfile(user, {
      displayName: userData.nomeCompleto
    });
    
    // Determinar o tipo de usuário
    const userType = userData.userType === 'administração' ? 'admin' : 
                     userData.userType === 'colaborador' ? 'collaborator' : 'user';
    
    // Preparar dados para enviar à API
    const userDataForAPI = {
      uid: user.uid, // Será salvo como firebaseId no modelo
      name: userData.nomeCompleto,
      email: userData.email,
      phone: userData.telefone || '',
      type: userType
    };
    
    // Adicionar CPF se não for administrador
    if (userType !== 'admin') {
      userDataForAPI.cpf = userData.cpf;
    }
    
    // Enviar dados para o MongoDB através da API
    console.log("Enviando dados para a API:", userDataForAPI);
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDataForAPI),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao salvar dados no MongoDB');
    }
    
    // Se for cliente e tiver endereço, criar o endereço separadamente
    if (userType === 'user' && userData.endereco) {
      console.log("Criando endereço para o cliente");
      
      const addressData = {
        uid: user.uid, // Enviamos o UID do Firebase
        street: userData.endereco,
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
      
      const addressResponseData = await addressResponse.json();
      
      if (!addressResponse.ok) {
        console.error("Erro ao criar endereço:", addressResponseData);
        // Não lançar erro aqui, apenas registrar, para não interromper o fluxo de registro
      } else {
        console.log("Endereço criado com sucesso");
      }
    }
    
    console.log("Registro concluído com sucesso");
    return { success: true, user: responseData.user };
  } catch (error) {
    console.error("Erro no registro:", error);
    return { success: false, error: error.message };
  }
};
