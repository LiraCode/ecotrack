import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
  Tooltip
} from '@mui/material';
import { Close, Cancel, Add, LocationOn, Person, AccessTime } from '@mui/icons-material';

export default function ScheduleDialog({
  open,
  onClose,
  selectedDate,
  schedules,
  onCancel,
  onAddNew,
  isMobile
}) {
  // Filtra os agendamentos para a data selecionada
  const filteredSchedules = schedules.filter(
    schedule => schedule.date === selectedDate
  );
  // Função para extrair o horário da data
  // Função corrigida para extrair o horário da data
  const getTimeFromDate = (dateString, scheduleObj) => {
    if (!dateString) return 'Não informado';

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        // Convertendo para o fuso horário GMT-3
        const offset = 0 * 60; // GMT-3 em minutos
        const localTime = new Date(date.getTime() + offset * 60 * 1000);

        return localTime.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    } catch (e) {
      console.error("Erro ao converter data:", e);
    }

    return 'Não informado';
  };

  const capitalizeWords = (str) => {
    if (!str) return 'Não informado';
    return str.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };


  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            Agendamentos para {selectedDate}
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, mt: 1 }}>
        {filteredSchedules.length > 0 ? (
          <List>
            {filteredSchedules.map((schedule, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>


                    {/* Botão para cancelar agendamento */}
                    {(schedule.status !== "Coletado" && schedule.status !== 'Cancelado') && (
                      <Tooltip title="Cancelar agendamento">
                        <IconButton
                          edge="end"
                          onClick={() => onCancel(schedule.date, schedule.name)}
                          sx={{ color: '#f44336', marginTop: '50px', marginRight: '10px' }}
                          disabled={schedule.status === 'Coletado' || schedule.status === 'Cancelado'}
                        >
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                }
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  mb: 2,
                  backgroundColor: schedule.status === 'Cancelado' ? '#ffebee' :
                    schedule.status === 'Coletado' ? '#f1f8e9' : 'white',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: 2,
                  opacity: schedule.status === 'Cancelado' ? 0.7 : 1
                }}
              >
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 'bold',
                      color: schedule.status === 'Cancelado' ? '#d32f2f' :
                        schedule.status === 'Coletado' ? '#4caf50' : '#333',
                      textDecoration: (schedule.status === 'Coletado' || schedule.status === 'Cancelado') ? 'line-through' : 'none'
                    }}
                  >
                    {schedule.name}
                  </Typography>

                  <Chip
                    label={schedule.type}
                    size="small"
                    sx={{
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      mt: 0.5,
                      mr: 1
                    }}
                  />

                  <Chip
                    label={schedule.status === "Cancelado" ? "Cancelado" : schedule.status}
                    size="small"
                    sx={{
                      backgroundColor: schedule.status !== 'Cancelado' ? '#ffcdd2' :
                        schedule.status === "Coletado" ? '#4caf50' : '#ffecb3',
                      color: schedule.status !== 'Cancelado' ? '#d32f2f' :
                        schedule.status === "Coletado" ? 'white' : '#ff6f00',
                      mt: 0.5
                    }}
                  />
                </Box>

                <Divider sx={{ width: '100%', my: 1 }} />

                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime fontSize="small" sx={{ color: '#757575', mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Horário: {getTimeFromDate(schedule.time, schedule)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationOn fontSize="small" sx={{ color: '#757575', mr: 1, mt: 0.5 }} />
                    <Typography variant="body2" color="textSecondary">
                      Endereço: {capitalizeWords(schedule.street) || 'Não informado'}, {schedule.number || 'Não informado'}
                      {schedule.neighborhood && ` - ${capitalizeWords(schedule.neighborhood)}`}
                      {schedule.addressComplement && `\\| ${capitalizeWords(schedule.addressComplement)}`}
                      {schedule.city && ` \| ${capitalizeWords(schedule.city)}`}
                      {schedule.state && ` - ${capitalizeWords(schedule.state)}`}
                    </Typography>
                  </Box>


                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person fontSize="small" sx={{ color: '#757575', mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Responsável pela coleta: {schedule.collector || 'Não informado'}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
            Não há agendamentos para esta data.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button
          onClick={onAddNew}
          startIcon={<Add />}
          variant="outlined"
          sx={{
            borderColor: '#2e7d32',
            color: '#2e7d32',
            '&:hover': {
              borderColor: '#1b5e20',
              backgroundColor: '#f1f8e9'
            }
          }}
        >
          Adicionar Novo
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#2e7d32',
            '&:hover': {
              backgroundColor: '#1b5e20',
            }
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
