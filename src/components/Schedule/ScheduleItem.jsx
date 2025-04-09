import { Card, CardContent, Typography, Button, IconButton, Box } from '@mui/material';
import { CheckCircle, Close } from '@mui/icons-material';

export default function ScheduleItem({ index, schedule, setSchedules, isMobile }) {
  const handleToggleComplete = () => {
    setSchedules(prev => {
      const newSchedules = [...prev];
      newSchedules[index].completed = !newSchedules[index].completed;
      return newSchedules;
    });
  };

  const handleDelete = () => {
    setSchedules(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card 
      sx={{
        position: 'relative',
        width: '100%',
        borderLeft: '4px solid #4caf50',
        backgroundColor: schedule.completed ? '#e8f5e9' : 'background.paper',
        transition: 'background-color 0.3s ease',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }}
    >
      <IconButton
        aria-label="Excluir agendamento"
        sx={{
          position: 'absolute',
          right: theme => theme.spacing(isMobile ? 1 : 2),
          top: theme => theme.spacing(isMobile ? 1 : 2),
          '& .MuiSvgIcon-root': {
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }
        }}
        onClick={handleDelete}
        size="small"
      >
        <Close />
      </IconButton>

      <CardContent
        sx={{
          p: theme => theme.spacing(isMobile ? 1 : 1.5),
          '&:last-child': {
            paddingBottom: theme => theme.spacing(isMobile ? 1 : 1.5)
          }
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#2e7d32',
            textAlign: 'center',
            mb: isMobile ? 0.5 : 1,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            fontWeight: 500,
            lineHeight: 1.2,
            wordBreak: 'break-word'
          }}
        >
          {schedule.date} - {schedule.type}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mt: isMobile ? 1 : 1.5
        }}>
          <Button
            variant="contained"
            size={isMobile ? 'small' : 'medium'}
            startIcon={schedule.completed && (
              <CheckCircle sx={{ 
                fontSize: isMobile ? '0.75rem' : '0.875rem' 
              }} />
            )}
            sx={{
              backgroundColor: schedule.completed ? '#81c784' : '#4caf50',
              '&:hover': {
                backgroundColor: '#388e3c',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              },
              minWidth: isMobile ? '140px' : '180px',
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              py: isMobile ? 0.5 : 1,
              px: isMobile ? 1 : 2,
              transition: 'all 0.3s ease',
              textTransform: 'none',
              borderRadius: '8px'
            }}
            onClick={handleToggleComplete}
            aria-label={schedule.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
          >
            {schedule.completed ? 'CONCLUÍDO ✓' : 'MARCAR CONCLUÍDO'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}