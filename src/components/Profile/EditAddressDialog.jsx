import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function EditAddressDialog({
  open,
  onClose,
  address,
  onSave,
  isNew = false
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  // Efeito para inicializar o formulário quando o diálogo é aberto
  useEffect(() => {
    console.log("EditAddressDialog - Diálogo aberto:", open);
    console.log("EditAddressDialog - Endereço recebido:", address);
    
    if (open) {
      if (!isNew && address) {
        // Preencher o formulário com os dados do endereço existente
        setFormData({
          street: address.street || '',
          number: address.number || '',
          complement: address.complement || '',
          neighborhood: address.neighborhood || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
          isDefault: address.isDefault || false
        });
      } else {
        // Resetar o formulário para um novo endereço
        setFormData({
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
          isDefault: false
        });
      }
    }
  }, [open, address, isNew]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validar campos obrigatórios
      const requiredFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Campos obrigatórios: ${missingFields.join(', ')}`);
        return;
      }

      // Preparar dados para envio
      const addressData = {
        ...formData
      };

      console.log("Dados a serem enviados:", addressData);

      // Determinar se é uma criação ou atualização
      let response;
      if (isNew) {
        // Criar novo endereço
        response = await fetch(`/api/users/${user.uid}/Profile/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(addressData),
        });
      } else {
        // Atualizar endereço existente
        response = await fetch(
          `/api/users/${user.uid}/profile/addresses/${address._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.accessToken}`,
            },
            body: JSON.stringify(addressData),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar endereço');
      }

      const savedAddress = await response.json();
      console.log("Endereço salvo com sucesso:", savedAddress);
      
      // Chamar a função de callback com o endereço salvo
      if (onSave) {
        onSave(savedAddress);
      }
      
      // Fechar o diálogo
      onClose();
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      setError(error.message || 'Erro ao salvar endereço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isNew ? 'Adicionar Novo Endereço' : 'Editar Endereço'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              label="Rua/Avenida"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Número"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Complemento"
              name="complement"
              value={formData.complement}
              onChange={handleInputChange}
              placeholder="Apartamento, bloco, etc. (opcional)"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bairro"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cidade"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Estado"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CEP"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
              placeholder="00000-000"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  name="isDefault"
                  color="primary"
                />
              }
              label="Definir como endereço padrão"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Salvando...
            </>
          ) : (
            isNew ? 'Adicionar' : 'Salvar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}