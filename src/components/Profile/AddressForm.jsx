import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';

export default function AddressForm({ initialData, onSubmit, onCancel, loading }) {
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
  const [errors, setErrors] = useState({});
  const [zipCodeLoading, setZipCodeLoading] = useState(false);
  const [zipCodeError, setZipCodeError] = useState('');

  // Preencher o formulário com dados iniciais se estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        street: initialData.street || '',
        number: initialData.number || '',
        complement: initialData.complement || '',
        neighborhood: initialData.neighborhood || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zipCode: initialData.zipCode || '',
        isDefault: initialData.isDefault || false
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleZipCodeBlur = async () => {
    const zipCode = formData.zipCode.replace(/\D/g, '');
    
    if (zipCode.length !== 8) {
      return;
    }
    
    try {
      setZipCodeLoading(true);
      setZipCodeError('');
      
      const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setZipCodeError('CEP não encontrado');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state
      }));
    } catch (error) {
      console.error('Error fetching address from CEP:', error);
      setZipCodeError('Erro ao buscar CEP');
    } finally {
      setZipCodeLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.street.trim()) {
      newErrors.street = 'Rua é obrigatória';
    }
    
    if (!formData.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }
    
    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'CEP é obrigatório';
    } else if (!/^\d{5}-?\d{3}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'CEP inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={onCancel}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h6">
          {initialData ? 'Editar Endereço' : 'Novo Endereço'}
        </Typography>
      </Box>
      
      {zipCodeError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {zipCodeError}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="CEP"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            onBlur={handleZipCodeBlur}
            error={!!errors.zipCode}
            helperText={errors.zipCode}
            InputProps={{
              endAdornment: zipCodeLoading ? (
                <CircularProgress size={20} />
              ) : null
            }}
            placeholder="00000-000"
          />
        </Grid>
        
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Rua/Avenida"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            error={!!errors.street}
            helperText={errors.street}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Número"
            name="number"
            value={formData.number}
            onChange={handleInputChange}
            error={!!errors.number}
            helperText={errors.number}
          />
        </Grid>
        
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Complemento"
            name="complement"
            value={formData.complement}
            onChange={handleInputChange}
            placeholder="Apartamento, bloco, etc."
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Bairro"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleInputChange}
            error={!!errors.neighborhood}
            helperText={errors.neighborhood}
          />
        </Grid>
        
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Cidade"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            error={!!errors.city}
            helperText={errors.city}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Estado"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            error={!!errors.state}
            helperText={errors.state}
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
            label="Definir como endereço principal"
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Save />}
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
          ) : 'Salvar Endereço'}
        </Button>
      </Box>
    </Box>
  );
}