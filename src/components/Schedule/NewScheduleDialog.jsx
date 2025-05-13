import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Box,
  Checkbox,
  ListItemText,
  FormHelperText,
  Divider
} from '@mui/material';
import { Close } from '@mui/icons-material';

export default function NewScheduleDialog({ 
  open, 
  onClose, 
  selectedDate, 
  onAddSchedule, 
  isMobile 
}) {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedEcoPoint, setSelectedEcoPoint] = useState('');
  const [ecoPoints, setEcoPoints] = useState([]);
  const [error, setError] = useState('');
  const [ecoPointsError, setEcoPointsError] = useState('');

  // Material types available for selection
  const materialTypes = [
    'Coleta de Resíduos de Metal',
    'Coleta de Plástico',
    'Coleta de Papel',
    'Coleta de Vidro',
    'Coleta de Resíduos Orgânicos',
    'Coleta de Resíduos Eletrônicos'
  ];

  // Fetch eco-points when component mounts
  useEffect(() => {
    const fetchEcoPoints = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/ecopoints');
        if (response.ok) {
          const data = await response.json();
          setEcoPoints(data.ecoPoints || []);
        } else {
          console.log('Failed to fetch eco-points');
          // Fallback data if API fails
          setEcoPoints([
            { id: '1', name: 'Eco Ponto Central', address: 'Av. Principal, 123' },
            { id: '2', name: 'Eco Ponto Norte', address: 'Rua das Flores, 456' },
            { id: '3', name: 'Eco Ponto Sul', address: 'Av. das Árvores, 789' },
          ]);
        }
      } catch (error) {
        console.log('Error fetching eco-points:', error);
        // Fallback data if API fails
        setEcoPoints([
          { id: '1', name: 'Eco Ponto Central', address: 'Av. Principal, 123' },
          { id: '2', name: 'Eco Ponto Norte', address: 'Rua das Flores, 456' },
          { id: '3', name: 'Eco Ponto Sul', address: 'Av. das Árvores, 789' },
        ]);
      }
    };

    if (open) {
      fetchEcoPoints();
    }
  }, [open]);

  const handleClose = () => {
    setSelectedMaterials([]);
    setSelectedEcoPoint('');
    setError('');
    setEcoPointsError('');
    onClose();
  };

  const handleSubmit = () => {
    // Validate material selection
    if (selectedMaterials.length === 0) {
      setError('Por favor, selecione pelo menos um tipo de material');
      return;
    }

    // Validate eco-point selection
    if (!selectedEcoPoint) {
      setEcoPointsError('Por favor, selecione um Eco Ponto');
      return;
    }
    
    // Find the selected eco-point object
    const ecoPoint = ecoPoints.find(ep => ep.id === selectedEcoPoint);
    
    // Pass both materials and eco-point to parent component
    onAddSchedule({
      materials: selectedMaterials,
      ecoPoint: ecoPoint
    });
    
    handleClose();
  };

  const handleMaterialChange = (event) => {
    setSelectedMaterials(event.target.value);
    setError('');
  };

  const handleEcoPointChange = (event) => {
    setSelectedEcoPoint(event.target.value);
    setEcoPointsError('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
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
            Novo Agendamento
          </Typography>
        </Box>
        <Button 
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <Close />
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2, mt: 1 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Data selecionada: <strong>{selectedDate}</strong>
        </Typography>
        
        {/* Multiple Material Type Selection */}
        <WasteTypeSelector
          value={selectedMaterials}
          onChange={handleMaterialChange}
          error={!!error}
          helperText={error}
          label="Tipos de Materiais"
          multiple={true}
        />
        
        <Divider sx={{ my: 2 }} />
        
        {/* Eco-Point Selection */}
        <FormControl fullWidth error={!!ecoPointsError} sx={{ mb: ecoPointsError ? 1 : 2 }}>
          <InputLabel id="eco-point-label">Eco Ponto</InputLabel>
          <Select
            labelId="eco-point-label"
            value={selectedEcoPoint}
            onChange={handleEcoPointChange}
            label="Eco Ponto"
          >
            {ecoPoints.map((ecoPoint) => (
              <MenuItem key={ecoPoint.id} value={ecoPoint.id}>
                <Typography variant="body1">{ecoPoint.name}</Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  {ecoPoint.address}
                </Typography>
              </MenuItem>
            ))}
          </Select>
          {ecoPointsError && <FormHelperText>{ecoPointsError}</FormHelperText>}
        </FormControl>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={handleClose}
          sx={{ color: '#666' }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{ 
            backgroundColor: '#2e7d32',
            '&:hover': {
              backgroundColor: '#1b5e20',
            }
          }}
        >
          Agendar
        </Button>
      </DialogActions>
    </Dialog>
  );
}