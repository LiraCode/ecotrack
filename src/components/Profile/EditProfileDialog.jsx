'use client'
import { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { Close, Edit, Add, Delete } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import AddressForm from './AddressForm';
import AddressList from './AddressList';

export default function EditProfileDialog({ 
  open, 
  onClose,
  isMobile 
}) {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
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

  // Buscar dados do usuário quando o diálogo é aberto
  useEffect(() => {
    if (open && user) {
      fetchUserData();
      fetchUserAddresses();
    }
  }, [open, user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/users/${user.uid}/profile/user`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData({
          name: data.name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          cpf: data.cpf || ''
        });
        
        // Log para debug
        console.log("Dados do usuário carregados:", data);
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
        
        // Log para debug
        console.log("Endereços carregados:", data);
        
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
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitProfile = async () => {
    try {
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
        // Atualizar o perfil no contexto de autenticação se necessário
        if (updateUserProfile) {
          await updateUserProfile({ displayName: userData.name });
        }
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
            
            {/* Abas para alternar entre perfil e endereços */}
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Dados Pessoais" />
              <Tab label="Endereços" />
            </Tabs>
            
            {/* Aba de Dados Pessoais */}
            {activeTab === 0 && (
              <Box>
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
                      label="CPF"
                      name="cpf"
                      value={userData.cpf}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      disabled={userData.cpf} // Desabilitar edição de CPF se já existir
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
                      disabled // Email não pode ser alterado, apenas pelo Firebase Auth
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
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitProfile}
                    disabled={loading}
                    sx={{ 
                      backgroundColor: '#2e7d32',
                      '&:hover': {
                        backgroundColor: '#1b5e20',
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Salvando...
                      </>
                    ) : 'Salvar Alterações'}
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Aba de Endereços */}
            {activeTab === 1 && !showAddressForm && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    Meus Endereços
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={fetchAddresses}
                      sx={{ mr: 1 }}
                      disabled={loading}
                    >
                      Atualizar
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddAddress}
                    >
                      Adicionar Endereço
                    </Button>
                  </Box>
                </Box>
                
                <AddressList 
                  addresses={addresses}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  loading={loading}
                />
              </Box>
            )}
            
            {/* Formulário de Endereço (para adicionar ou editar) */}
            {activeTab === 1 && showAddressForm && (
              <AddressForm 
                initialData={editingAddress}
                onSubmit={handleAddressFormSubmit}
                onCancel={handleCancelAddressForm}
                loading={loading}
              />
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={handleClose}
          sx={{ color: '#666' }}
          disabled={loading || fetchLoading}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}