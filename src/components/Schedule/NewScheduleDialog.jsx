import { useState } from 'react';
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
  Typography ,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';

export default function NewScheduleDialog({ 
  open, 
  onClose, 
  selectedDate, 
  onAddSchedule, 
  isMobile 
}) {
  const [scheduleType, setScheduleType] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setScheduleType('');
    setError('');
    onClose();
  };

  const handleSubmit = () => {
    if (!scheduleType) {
      setError('Por favor, selecione um tipo de agendamento');
      return;
    }
    
    onAddSchedule(scheduleType);
    handleClose();
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
        
        <FormControl fullWidth error={!!error} sx={{ mb: error ? 0 : 2 }}>
          <InputLabel id="schedule-type-label">Tipo de Agendamento</InputLabel>
          <Select
            labelId="schedule-type-label"
            value={scheduleType}
            label="Tipo de Agendamento"
            onChange={(e) => {
              setScheduleType(e.target.value);
              setError('');
            }}
          >
            <MenuItem value="Coleta de Resíduos de Metal">Coleta de Resíduos de Metal</MenuItem>
            <MenuItem value="Coleta de Plástico">Coleta de Plástico</MenuItem>
            <MenuItem value="Coleta de Papel">Coleta de Papel</MenuItem>
            <MenuItem value="Coleta de Vidro">Coleta de Vidro</MenuItem>
            <MenuItem value="Coleta de Resíduos Orgânicos">Coleta de Resíduos Orgânicos</MenuItem>
            <MenuItem value="Coleta de Resíduos Eletrônicos">Coleta de Resíduos Eletrônicos</MenuItem>
          </Select>
          {error && <Typography color="error" variant="caption">{error}</Typography>}
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