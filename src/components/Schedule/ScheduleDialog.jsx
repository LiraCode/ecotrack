import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography,
  Box
} from '@mui/material';
import { Close, Delete, CheckCircle, Cancel, Add } from '@mui/icons-material';

export default function ScheduleDialog({ 
  open, 
  onClose, 
  selectedDate, 
  schedules, 
  onToggleComplete, 
  onDelete,
  onAddNew,
  isMobile 
}) {
  // Filtra os agendamentos para a data selecionada
  const filteredSchedules = schedules.filter(
    schedule => schedule.date === selectedDate
  );

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
                    <IconButton 
                      edge="end" 
                      onClick={() => onToggleComplete(schedule.date, schedule.type)}
                      sx={{ color: schedule.completed ? '#4caf50' : '#f44336' }}
                    >
                      {schedule.completed ? <CheckCircle /> : <Cancel />}
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={() => onDelete(schedule.date, schedule.type)}
                      sx={{ color: '#f44336' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                }
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  mb: 1,
                  backgroundColor: schedule.completed ? '#f1f8e9' : 'white'
                }}
              >
                <ListItemText
                  primary={schedule.type}
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      Status: {schedule.completed ? 'Concluído' : 'Pendente'}
                    </Typography>
                  }
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 'bold',
                      color: schedule.completed ? '#4caf50' : '#333',
                      textDecoration: schedule.completed ? 'line-through' : 'none'
                    }
                  }}
                />
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
