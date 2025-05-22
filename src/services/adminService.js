import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  sendEmailVerification
} from "firebase/auth";

export const registerAdmin = async (token, password, adminData) => {
  try {
    // Verificar se o token foi fornecido
    if (!token) {
      console.error("Token de autenticação não fornecido");
      return { success: false, error: "Token de autenticação não fornecido" };
    }
    const email = adminData.email;
    const name = adminData.nomeCompleto || adminData.name;
    const phone = adminData.phone || '';
    const role = adminData.role || 'Agente'

    console.log("Enviando solicitação para registrar administrador via API");
      const data = {
      email,
      password,
      name,
      phone,
      role,
    };
    console.log("Dados do administrador:", data);
    // Enviar dados para a API usando o token do administrador atual
    const response = await fetch("/api/admin/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({data}),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Erro na resposta da API:", responseData);
      throw new Error(responseData.error || 'Falha ao registrar administrador');
    }

    console.log("Registro de administrador concluído com sucesso");
    return { success: true, admin: responseData.admin };
  } catch (error) {
    console.error("Erro no registro do administrador:", error);
    return { success: false, error: error.message };
  }
};

  // updateAdmin é para atualizar os dados do administrador
  export const updateAdmin = async (token, uid, adminId, updatedData) => {
    try {
      const response = await fetch(`/api/admin/${adminId}`, {
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
          responseData.error || "Falha ao atualizar dados do administrador"
        );
      }

      //esse user  é o user do firebase que esta sendo atualizado tem que obter o user e passar para o updateProfile pelo id do firebase
      const user = await getUserById(uid);
      updateProfile(user, {
        displayName: adminData.nomeCompleto,
        photoURL: adminData.photoURL,
      });
      console.log("Dados do administrador atualizados com sucesso");
      return { success: true, admin: responseData.admin };
    } catch (error) {
      console.error("Erro ao atualizar dados do administrador:", error);
      return { success: false, error: error.message };
    }
  };

  //funcao para deletar um administrador
  export const deleteAdmin = async (token, uid) => {
    try {
      const response = await fetch(`/api/admin/${uid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.error || "Falha ao deletar dados do administrador"
        );
    }
      console.log("Dados do administrador deletados com sucesso");
      return { success: true, admin: responseData.admin };
    } catch (error) {
      console.error("Erro ao deletar dados do administrador:", error);
      return { success: false, error: error.message };
    }
  };

   export const getAdmins = async (token) => {
      try 
      {
        
        const response = await fetch("/api/admin", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          // Check the structure of your API response and extract the array correctly
          if (Array.isArray(data)) {
            // console.log("1", data);
            return (data);
          } else if (data.admins && Array.isArray(data.admins)) {
            // console.log("2", data.admins);
            return data.admins;
          } else if (data.data && Array.isArray(data.data)) {
            // console.log("3", data.data);
            return(data.data);
          } else {
            console.error("Unexpected API response format:", data);
            showAlert(
                "Formato de resposta inesperado ao carregar administradores",
                "error"
            );
            return([]);
          }
        } else {
          showAlert(data.message || "Erro ao carregar administradores", "error");
          return([]);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
        showAlert('Erro ao carregar administradores', 'error');
        return([]);
      }
      }