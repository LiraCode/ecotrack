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
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Chip
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br'; // Importar localização pt-br
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import WasteTypeSelector from '@/components/Waste/WasteTypeSelector';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@mui/material/styles';

export default function NewScheduleDialog({ 
  open, 
  onClose,  
  onAddSchedule, 
  isMobile,
  fetchSchedules // Nova prop para buscar os agendamentos atualizados
}) {
  const { user } = useAuth();
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedEcoPoint, setSelectedEcoPoint] = useState('');
  const [ecoPoints, setEcoPoints] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [availableWasteTypes, setAvailableWasteTypes] = useState([]);
  const [error, setError] = useState('');
  const [ecoPointsError, setEcoPointsError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs().hour(10).minute(0));
  const [timeError, setTimeError] = useState('');
  const [dateError, setDateError] = useState('');
  const theme = useTheme();

  // Fetch eco-points and user addresses when component mounts
  useEffect(() => {
    if (open && user) {
      fetchEcoPoints();
      fetchUserAddresses();
    }
  }, [open, user]);

  // Update available waste types when eco point changes
  useEffect(() => {
    if (selectedEcoPoint) {
      const ecoPoint = ecoPoints.find(ep => ep._id === selectedEcoPoint);
      if (ecoPoint && ecoPoint.typeOfWasteId) {
        setAvailableWasteTypes(ecoPoint.typeOfWasteId);
        // Reset selected materials when eco point changes
        setSelectedMaterials([]);
      }
    }
  }, [selectedEcoPoint, ecoPoints]);

  const fetchEcoPoints = async () => {
    try {
      setFetchLoading(true);
      // Não é necessário enviar token para este endpoint específico
      const response = await fetch('/api/collection-points');
      
      if (response.ok) {
        const data = await response.json();
        //console.log("Eco-points:", data);
        setEcoPoints(data || []);
      } else {
        console.error('Failed to fetch eco-points:', await response.text());
        setEcoPoints([]);
      }
    } catch (error) {
      console.error('Error fetching eco-points:', error);
      setEcoPoints([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchUserAddresses = async () => {
    if (!user) return;
    
    try {
      setFetchLoading(true);
      // Usando o uid do usuário do Firebase
      const response = await fetch(`/api/users/${user.uid}/addresses`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserAddresses(data || []);
        // Set default address if available
        if (data && data.length > 0) {
          setSelectedAddress(data[0]._id);
        }
      } else {
        console.error('Failed to fetch user addresses:', await response.text());
        setUserAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      setUserAddresses([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMaterials([]);
    setSelectedEcoPoint('');
    setSelectedAddress('');
    setError('');
    setEcoPointsError('');
    setAddressError('');
    setTimeError('');
    setDateError('');
    onClose();
  };

  // Function to validate date is not in the past
  const validateDate = (date) => {
    const today = dayjs().startOf('day');
    return date.isBefore(today) ? false : true;
  };

  // Handle date change with validation
  const handleDateChange = (newDate) => {
    if (!validateDate(newDate)) {
      setDateError('Não é possível selecionar datas anteriores a hoje');
      // Still set the date to today to avoid invalid state
      setSelectedDate(dayjs());
    } else {
      setDateError('');
      setSelectedDate(dayjs(newDate));
    }
  };

  const handleSubmit = async () => {
    // Validate date is not in the past
    if (!validateDate(selectedDate)) {
      setDateError('Não é possível agendar para datas anteriores a hoje');
      return;
    }
    
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
    
    // Validate address selection
    if (!selectedAddress) {
      setAddressError('Por favor, selecione um endereço');
      return;
    }
    
    // Validate time selection
    if (!selectedTime) {
      setTimeError('Por favor, selecione um horário');
      return;
    }
    
    // Find the selected eco-point object
    const ecoPoint = ecoPoints.find(ep => ep._id === selectedEcoPoint);
    
    // Find the selected address object
    const address = userAddresses.find(addr => addr._id === selectedAddress);
    
    // Prepare wastes array with selected materials
    const wastes = selectedMaterials.map(materialId => {
      const material = availableWasteTypes.find(waste => waste._id === materialId);
      return {
        wasteId: materialId,
        quantity: 1, // Default quantity
        weight: 0,   // Default weight
      };
    });
    
    // Combine date and time into a single datetime
    const combinedDateTime = dayjs(selectedDate)
      .hour(selectedTime.hour())
      .minute(selectedTime.minute())
      .second(0);
    
    // Create scheduling data
    const schedulingData = {
      collectionPointId: selectedEcoPoint,
      date: combinedDateTime.toISOString(), // Convert date properly with time
      wastes: wastes,
      addressId: selectedAddress
    };
    
    try {
      setLoading(true);
      console.log(schedulingData);
      // Corrigido para usar o endpoint correto e incluir o token de autenticação
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(schedulingData),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Notificar o componente pai sobre o novo agendamento
        if (typeof onAddSchedule === 'function') {
          onAddSchedule(data);
        }
        
        // Buscar dados atualizados do servidor
        if (typeof fetchSchedules === 'function') {
          await fetchSchedules();
        }
        
        // Fechar o diálogo após sucesso
        handleClose();
      } else {
        let errorMessage = 'Erro ao criar agendamento';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      setError('Erro ao criar agendamento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = (event) => {
    setSelectedMaterials(event.target.value);
    setError('');
  };

  const handleEcoPointChange = (event) => {
    setSelectedEcoPoint(event.target.value);
    setEcoPointsError('');
  };

  const handleAddressChange = (event) => {
    setSelectedAddress(event.target.value);
    setAddressError('');
  };

  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
    setTimeError('');
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
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : '#f5f5f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main' 
          }}>
            Novo Agendamento
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
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 4 }}>
                {/* Date Picker with validation */}
                <DatePicker
                  label="Selecione uma data"
                  value={selectedDate}
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  sx={{ 
                    mb: 2, 
                    width: '100%',
                    '& .MuiInputBase-root': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'white'
                    }
                  }}
                  disablePast={true}
                  minDate={dayjs()}
                />
                
                {dateError && (
                  <FormHelperText error sx={{ mt: 0, mb: 2 }}>
                    {dateError}
                  </FormHelperText>
                )}
                
                {/* Time Picker */}
                <TimePicker
                  label="Selecione um horário"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  ampm={false}
                  sx={{ 
                    mt: 2, 
                    width: '100%',
                    '& .MuiInputBase-root': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'white'
                    }
                  }}
                />
                
                {timeError && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {timeError}
                  </FormHelperText>
                )}
                
                {selectedDate && selectedTime && (
                  <Typography variant="body1" sx={{ 
                    mt: 2,
                    color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary'
                  }}>
                    Data e hora selecionadas: <strong>
                      {selectedDate.format("DD/MM/YYYY")} às {selectedTime.format("HH:mm")}
                    </strong>
                  </Typography>
                )}
              </Box>
            </LocalizationProvider>
            
            {/* Eco-Point Selection */}
            <FormControl fullWidth error={!!ecoPointsError} sx={{ mb: 2 }}>
              <InputLabel>Eco Ponto</InputLabel>
              <Select
                value={selectedEcoPoint}
                onChange={handleEcoPointChange}
                label="Eco Ponto"
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'white'
                }}
              >
                {ecoPoints.map((point) => (
                  <MenuItem key={point._id} value={point._id}>
                    {point.name}
                  </MenuItem>
                ))}
              </Select>
              {ecoPointsError && (
                <FormHelperText>{ecoPointsError}</FormHelperText>
              )}
            </FormControl>

            {/* Address Selection */}
            <FormControl fullWidth error={!!addressError} sx={{ mb: 2 }}>
              <InputLabel>Endereço</InputLabel>
              <Select
                value={selectedAddress}
                onChange={handleAddressChange}
                label="Endereço"
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'white'
                }}
              >
                {userAddresses.map((address) => (
                  <MenuItem key={address._id} value={address._id}>
                    {`${address.street}, ${address.number} - ${address.neighborhood}`}
                  </MenuItem>
                ))}
              </Select>
              {addressError && (
                <FormHelperText>{addressError}</FormHelperText>
              )}
            </FormControl>

            {/* Material Selection */}
            <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
              <InputLabel>Tipos de Resíduos</InputLabel>
              <Select
                multiple
                value={selectedMaterials}
                onChange={handleMaterialChange}
                label="Tipos de Resíduos"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const material = availableWasteTypes.find(w => w._id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={material ? material.name : value}
                          sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.2)' : '#e8f5e9',
                            color: theme.palette.mode === 'dark' ? 'success.light' : '#2e7d32'
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'white'
                }}
              >
                {availableWasteTypes.map((waste) => (
                  <MenuItem key={waste._id} value={waste._id}>
                    <Checkbox checked={selectedMaterials.indexOf(waste._id) > -1} />
                    <ListItemText primary={waste.name} />
                  </MenuItem>
                ))}
              </Select>
              {error && (
                <FormHelperText>{error}</FormHelperText>
              )}
            </FormControl>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'text.secondary' : '#666' 
          }}
          disabled={loading || fetchLoading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{ 
            backgroundColor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.main',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark',
            }
          }}
          disabled={loading || fetchLoading || userAddresses.length === 0}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Agendando...
            </>
          ) : 'Agendar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}