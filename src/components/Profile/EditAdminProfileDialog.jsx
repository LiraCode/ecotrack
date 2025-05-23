'use client'
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Grid,
  Alert,
  Avatar
} from '@mui/material';
import { Close, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase/firebase';
export default function EditAdminProfileDialog({
  open,
  onClose,
  isMobile,
}) {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Administrador'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const fileInputRef = useRef(null);

  // Buscar dados do administrador quando o diálogo é aberto
  useEffect(() => {
    if (open && user) {
      fetchAdminData();
      setPhotoURL(user.photoURL || '');
    }
  }, [open, user]);

  const fetchAdminData = async () => {
    if (!user) return;

    try {
      setFetchLoading(true);
      const response = await fetch(`/api/admin/${user.uid}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const adminData = data.admin;
        setUserData({
          name: adminData.name || '',
          email: adminData.email || user.email || '',
          phone: adminData.phone || '',
          role: adminData.role || 'Administrador'
        });
      } else {
        console.error('Failed to fetch admin data:', await response.text());
        setErrorMessage('Erro ao carregar dados do administrador');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setErrorMessage('Erro ao carregar dados do administrador');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessMessage('');
    setErrorMessage('');
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await fetch(`/api/admin/${user.uid}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        const adminData = data.admin;
        updateUserProfile({displayName: adminData.name});

        setSuccessMessage('Perfil atualizado com sucesso!');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Erro ao atualizar perfil. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com o clique no botão de upload de foto
  const handlePhotoButtonClick = () => {
    fileInputRef.current.click();
  };

  // Função para lidar com a seleção de arquivo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione uma imagem válida.');
      return;
    }

    // Verificar tamanho do arquivo (limite de 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter menos de 5MB.');
      return;
    }

    try {
      setPhotoLoading(true);
      setErrorMessage('');

      // Criar referência para o arquivo no Firebase Storage
      const storageRef = ref(storage, `profile_photos/${user.uid}/${Date.now()}_${file.name}`);

      // Fazer upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);

      // Obter URL do arquivo
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Atualizar photoURL usando a função do contexto
      const result = await updateUserProfile({ photoURL: downloadURL });

      if (result.success) {
        // Atualizar estado local
        setPhotoURL(downloadURL);
        setSuccessMessage('Foto de perfil atualizada com sucesso!');
      } else {
        setErrorMessage('Erro ao atualizar foto de perfil. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setErrorMessage('Erro ao atualizar foto de perfil. Tente novamente mais tarde.');
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogTitle sx={{
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            Editar Perfil
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 0.5 }}
          disabled={loading}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, mt: 1 }}>
        {fetchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            {/* Mensagens de sucesso e erro */}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}

            <Box>
              {/* Seção de foto de perfil */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={photoURL || (user && user.photoURL) || ''}
                    alt={userData.name || 'Perfil'}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '3px solid #2e7d32',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: '#2e7d32',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#1b5e20',
                      },
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onClick={handlePhotoButtonClick}
                    disabled={photoLoading}
                  >
                    {photoLoading ? <CircularProgress size={24} color="inherit" /> : <PhotoCamera />}
                  </IconButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                    disabled={true} // Email não pode ser alterado diretamente
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Função"
                    name="role"
                    value={userData.role}
                    margin="normal"
                    variant="outlined"
                    disabled={true} // Função não pode ser alterada diretamente
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={handleClose}
          sx={{ color: '#666' }}
          disabled={loading || photoLoading}
        >
          Cancelar
        </Button>

        <Button
          onClick={handleSubmitProfile}
          variant="contained"
          sx={{
            backgroundColor: '#2e7d32',
            '&:hover': {
              backgroundColor: '#1b5e20',
            }
          }}
          disabled={loading || photoLoading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Salvando...
            </>
          ) : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}