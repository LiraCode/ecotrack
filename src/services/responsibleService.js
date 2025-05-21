  import { auth } from '@/config/firebase/firebase';
  import { updateProfile } from 'firebase/auth';
  import { getAuthToken } from './authService';

  // Obter dados do responsável atual
  export const getResponsibleProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
    
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não foi possível obter o token de autenticação');
      }
    
      const response = await fetch(`/api/responsible?uid=${currentUser.uid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar perfil do responsável');
      }
    
      const data = await response.json();
      return { success: true, responsible: data.responsible };
    } catch (error) {
      console.error('Erro ao buscar perfil do responsável:', error);
      return { success: false, error: error.message };
    }
  };

  // Atualizar perfil do responsável
  export const updateResponsibleProfile = async (profileData) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
    
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não foi possível obter o token de autenticação');
      }
    
      const response = await fetch(`/api/responsible/${currentUser.uid}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar perfil do responsável');
      }
    
      const data = await response.json();
    
      // Atualizar o displayName no Firebase Auth se o nome foi alterado
      if (profileData.name && profileData.name !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: profileData.name
        });
      }
    
      return { success: true, responsible: data.responsible };
    } catch (error) {
      console.error('Erro ao atualizar perfil do responsável:', error);
      return { success: false, error: error.message };
    }
  };

  // Obter ecopontos associados ao responsável
  export const getResponsibleOrganizations = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
    
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não foi possível obter o token de autenticação');
      }
    
      const response = await fetch(`/api/responsible/${currentUser.uid}/organizations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar ecopontos do responsável');
      }
    
      const data = await response.json();
      return { success: true, organizations: data.organizations };
    } catch (error) {
      console.error('Erro ao buscar ecopontos do responsável:', error);
      return { success: false, error: error.message };
    }
  };