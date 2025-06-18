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
  Divider,
  CircularProgress,
  IconButton,
  Grid,
  Tabs,
  Tab,
  Alert,
  Avatar
} from '@mui/material';
import { Close, Edit, Add, Delete, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import AddressForm from './AddressForm';
import AddressList from './AddressList';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase/firebase';
import { data } from 'autoprefixer';
import { formatPhone, validatePhone } from '@/utils/validators';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@mui/material/styles';



export default function EditProfileDialog({
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
    cpf: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const fileInputRef = useRef(null);
  const [phoneError, setPhoneError] = useState('');
  const theme = useTheme();

  // Buscar dados do usuário quando o diálogo é aberto
  useEffect(() => {
    if (open && user) {
      fetchUserData();
      fetchUserAddresses();
      setPhotoURL(user.photoURL || '');
    }
  }, [open, user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setFetchLoading(true);
      const response = await fetch(`/api/users/user`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          uid: user.uid
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("teste", data.user);
        setUserData({
          name: data.user.name || '',
          email: data.user.email || user.email || '',
          phone: data.user.phone || '',
          cpf: data.user.cpf || ''
        });
      } else {
        console.error('Failed to fetch user data:', await response.text());
        setErrorMessage('Erro ao carregar dados do usuário');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('Erro ao carregar dados do usuário');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchUserAddresses = async () => {
    if (!user) return;

    try {
      setFetchLoading(true);
      const response = await fetch(`/api/users/${user.uid}/profile/addresses`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data || []);
      } else {
        console.error('Failed to fetch user addresses:', await response.text());
        setErrorMessage('Erro ao carregar endereços');
      }
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      setErrorMessage('Erro ao carregar endereços');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab(0);
    setShowAddressForm(false);
    setEditingAddress(null);
    setSuccessMessage('');
    setErrorMessage('');
    onClose();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Formatar telefone enquanto digita
      const formattedPhone = formatPhone(value);
      setUserData(prev => ({ ...prev, [name]: formattedPhone }));
      
      // Validar telefone quando tiver 10 ou 11 dígitos
      const numericPhone = value.replace(/[^\d]/g, '');
      if (numericPhone.length >= 10) {
        if (!validatePhone(value)) {
          setPhoneError('Telefone inválido');
        } else {
          setPhoneError('');
        }
      } else {
        setPhoneError('');
      }
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitProfile = async () => {
    try {
      // Validar telefone antes de salvar
      if (phoneError) {
        toast({
          title: "Erro",
          description: "Por favor, corrija o telefone antes de salvar.",
          variant: "destructive",
        });
        return;
      }
      
      if (userData.phone && !validatePhone(userData.phone)) {
        setPhoneError('Telefone inválido');
        toast({
          title: "Erro",
          description: "Por favor, insira um telefone válido.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      setErrorMessage('');

      const response = await fetch(`/api/users/${user.uid}/profile/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile updated:", data.user);
        updateUserProfile({displayName: data.name});

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

      // Obter URL do arquivoA
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

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        },
      });

      if (response.ok) {
        // Atualizar a lista de endereços após a exclusão
        setAddresses(addresses.filter(addr => addr._id !== addressId));
        setSuccessMessage('Endereço removido com sucesso!');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Erro ao remover endereço');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setErrorMessage('Erro ao remover endereço. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressFormSubmit = async (addressData) => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Determinar se estamos editando ou adicionando um novo endereço
      const method = editingAddress ? 'PUT' : 'POST';
      const url = editingAddress
        ? `/api/addresses/${editingAddress._id}`
        : '/api/addresses';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({
          ...addressData,
          userId: user.uid
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (editingAddress) {
          // Atualizar o endereço existente na lista
          setAddresses(addresses.map(addr =>
            addr._id === editingAddress._id ? data.address : addr
          ));
          setSuccessMessage('Endereço atualizado com sucesso!');
        } else {
          // Adicionar o novo endereço à lista
          setAddresses([...addresses, data.address]);
          setSuccessMessage('Endereço adicionado com sucesso!');
        }

        // Fechar o formulário de endereço
        setShowAddressForm(false);
        setEditingAddress(null);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Erro ao salvar endereço');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setErrorMessage('Erro ao salvar endereço. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
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
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : '#f5f5f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'divider' : 'transparent'
      }}>
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32' 
          }}>
            Editar Perfil
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          sx={{ 
            minWidth: 'auto', 
            p: 0.5,
            color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit'
          }}
          disabled={loading}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ 
        pt: 2, 
        mt: 1,
        backgroundColor: theme.palette.mode === 'dark' ? 'background.default' : 'inherit'
      }}>
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

            {/* Abas para alternar entre perfil e endereços */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ 
                mb: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
                  '&.Mui-selected': {
                    color: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32'
                  }
                }
              }}
            >
              <Tab label="Dados Pessoais" />
              <Tab label="Endereços" />
            </Tabs>

            {/* Aba de Dados Pessoais */}
            {activeTab === 0 && (
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
                        border: '3px solid',
                        borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32',
                        boxShadow: theme.palette.mode === 'dark' ? '0 4px 8px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? 'primary.dark' : '#1b5e20',
                        },
                        boxShadow: theme.palette.mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)'
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
                        },
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CPF"
                      name="cpf"
                      value={userData.cpf}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      disabled={userData.cpf}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
                        },
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
                        },
                      }}
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
                      disabled={true}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
                        },
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
                        },
                      }}
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
                      error={!!phoneError}
                      helperText={phoneError}
                      placeholder="(00) 00000-0000"
                      inputProps={{
                        maxLength: 15
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
                        },
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Aba de Endereços */}
            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'primary.dark' : '#1b5e20',
                      },
                    }}
                  >
                    Adicionar Endereço
                  </Button>
                </Box>

                {showAddressForm ? (
                  <AddressForm
                    onSave={handleAddressFormSubmit}
                    onCancel={handleCancelAddressForm}
                    initialData={editingAddress}
                  />
                ) : (
                  <AddressList
                    addresses={addresses}
                    onEdit={handleEditAddress}
                    onDelete={handleDeleteAddress}
                  />
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 2,
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : '#f5f5f5',
        borderTop: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'divider' : 'transparent'
      }}>
        <Button
          onClick={handleClose}
          sx={{
            color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'action.hover' : 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmitProfile}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'primary.main' : '#2e7d32',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'primary.dark' : '#1b5e20',
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}