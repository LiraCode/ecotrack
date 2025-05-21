import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Autocomplete,
  Chip
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import AddressForm from './AddressForm';
import WasteTypeSelector from '../Waste/WasteTypeSelector';

export default function EcoPointForm({ initialData, onSubmit, onCancel, loading, wasteTypes }) {
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    description: '',
    typeOfWasteId: [],
    address: null
  });
  const [errors, setErrors] = useState({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [formStep, setFormStep] = useState(1); // 1: Dados básicos, 2: Endereço

  // Preencher o formulário com dados iniciais se estiver editando
  useEffect(() => {
    if (initialData) {
      // Extract waste type IDs
      let wasteTypeIds = [];
      if (initialData.typeOfWasteId && initialData.typeOfWasteId.length > 0) {
        wasteTypeIds = initialData.typeOfWasteId.map(waste => 
          typeof waste === 'string' ? waste : waste._id
        );
      }

      setFormData({
        name: initialData.name || '',
        cnpj: initialData.cnpj || '',
        description: initialData.description || '',
        typeOfWasteId: wasteTypeIds,
        address: initialData.address || null
      });
      
      if (initialData.address) {
        setAddressData(initialData.address);
      }
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleWasteTypesChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      typeOfWasteId: value
    }));
    
    if (errors.typeOfWasteId) {
      setErrors(prev => ({ ...prev, typeOfWasteId: '' }));
    }
  };

  const validateBasicInfo = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    if (!formData.typeOfWasteId || formData.typeOfWasteId.length === 0) {
      newErrors.typeOfWasteId = 'Selecione pelo menos um tipo de resíduo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateBasicInfo()) {
      setFormStep(2);
      setShowAddressForm(true);
    }
  };

  const handlePrevStep = () => {
    setFormStep(1);
    setShowAddressForm(false);
  };

  const handleAddressSubmit = (address) => {
    setAddressData(address);
    setFormData(prev => ({
      ...prev,
      address: address
    }));
    
    // Prepare data for submission
    const submissionData = {
      ...formData,
      address: address,
      // typeOfWasteId is already in the correct format from WasteTypeSelector
    };
    
    // Submit the form
    onSubmit(submissionData);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={onCancel}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h6">
          {initialData ? 'Editar Ecoponto' : 'Novo Ecoponto'}
        </Typography>
      </Box>
      
      {formStep === 1 ? (
        // Etapa 1: Informações básicas
        <Box component="form">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Ecoponto"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleInputChange}
                error={!!errors.cnpj}
                helperText={errors.cnpj}
                placeholder="XX.XXX.XXX/XXXX-XX"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <WasteTypeSelector
                value={formData.typeOfWasteId}
                onChange={handleWasteTypesChange}
                error={!!errors.typeOfWasteId}
                helperText={errors.typeOfWasteId}
                label="Tipos de Resíduos Aceitos"
                multiple={true}
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
              variant="contained"
              onClick={handleNextStep}
              disabled={loading}
              sx={{ 
                backgroundColor: '#2e7d32',
                '&:hover': {
                  backgroundColor: '#1b5e20',
                }
              }}
            >
              Próximo: Endereço
            </Button>
          </Box>
        </Box>
      ) : (
        // Etapa 2: Endereço
        <Box>
          <AddressForm
            initialData={addressData}
            onSubmit={handleAddressSubmit}
            onCancel={handlePrevStep}
            loading={loading}
          />
        </Box>
      )}
    </Box>
  );
}