import { Box, Typography, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { CheckCircle, Cancel, AccessTime, AutoDelete } from '@mui/icons-material';

export default function ScheduleList({ 
  title = "Próximos Agendamentos",
  schedules, 
  setSchedules, 
  isMobile, 
  onViewSchedule,
  isPastList = false
}) {
  const formatTime = (isoTime) => {
    try {
      const timeObj = new Date(isoTime);
      return timeObj.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      console.error('Erro ao formatar hora:', error);
      return isoTime;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        mt: isPastList ? 2 : 4,
        mb: 4,
        backgroundColor: isPastList ? "#DBECCF" : "#fff",
        borderRadius: "8px",
        padding: isMobile ? 1.5 : 2,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        maxWidth: { xs: '100%', sm: '800px' },
        margin: '0 auto'
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: isPastList ? "#757575" : "#2e7d32",
          borderBottom: "2px solid #e0e0e0",
          paddingBottom: 1,
          textAlign: 'left',
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}
      >
        {title}
      </Typography>

      <List sx={{ width: "100%", padding: 0 }}>
        {schedules.length > 0 ? (
          schedules.map((schedule, index) => (
            <Box key={index}>
              <ListItem sx={{ p: isMobile ? 0 : 1 }}>
                <Button
                  onClick={() => onViewSchedule(schedule.date)}
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: "4px",
                    "&:hover": {
                      backgroundColor: isPastList ? "#eeeeee" : "#f0f7f0",
                    },
                    mb: isMobile ? 0.5 : 1,
                    opacity: isPastList ? 0.8 : 1,
                    p: isMobile ? 1.5 : 2
                  }}
                >
                  <ListItemText
                    primary={
                      <>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            whiteSpace: "pre-line", 
                            textAlign: 'left',
                            fontSize: isMobile ? '1rem' : '1.25rem',
                            fontWeight: 'bold',
                            color: '#2e7d32'
                          }}
                        >
                          {`${schedule.name} \n`}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            whiteSpace: "pre-line", 
                            textAlign: 'left',
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            color: '#666',
                            mt: 0.5
                          }}
                        >
                          {` Tipos de Resíduos: `}
                        </Typography>
                        <Typography
                          variant="p"
                          sx={{ 
                            whiteSpace: "pre-line", 
                            textAlign: 'left',
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            color: '#333',
                            fontWeight: '500'
                          }}
                        >
                          {`${schedule.type}`}
                        </Typography>
                      </>
                    }
                    secondary={
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        sx={{ 
                          whiteSpace: "pre-line", 
                          mt: isMobile ? 1.5 : 1, 
                          textAlign: 'left',
                          fontSize: isMobile ? '0.875rem' : '1rem',
                          '& .date-label': {
                            color: '#666',
                            fontWeight: '500'
                          },
                          '& .status-label': {
                            color: '#666',
                            fontWeight: '500'
                          }
                        }}
                      >
                        {`Data: ${schedule.date}\nHorário: ${formatTime(schedule.time)}\nStatus: ${schedule.status}`}
                      </Typography>
                    }
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: "bold",
                        color: isPastList ? "#757575" : "#333",
                        textDecoration: schedule.completed
                          ? "line-through"
                          : "none",
                      },
                    }}
                  />
                  {schedule.status === "Coletado" ? (
                    <CheckCircle sx={{ color: "#4caf50", ml: 2, fontSize: isMobile ? '1.5rem' : '2rem' }} />
                  ) : schedule.status === "Cancelado" ? (
                    <Cancel sx={{ color: "#f44336", ml: 2, fontSize: isMobile ? '1.5rem' : '2rem' }} />
                  ) : schedule.status === "Confirmado" ? (
                    <AutoDelete sx={{ color: "#007bff", ml: 2, fontSize: isMobile ? '1.5rem' : '2rem' }} />
                  ) : (
                    <AccessTime sx={{ color: "orange", ml: 2, fontSize: isMobile ? '1.5rem' : '2rem' }} />
                  )}
                </Button>
              </ListItem>
              {index < schedules.length - 1 && (
                <Divider sx={{ my: isMobile ? 0.5 : 1 }} />
              )}
            </Box>
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{ 
              textAlign: "center", 
              color: "#666", 
              py: 2,
              fontSize: isMobile ? '0.875rem' : '1rem'
            }}
          >
            {isPastList
              ? "Não há agendamentos anteriores."
              : 'Não há agendamentos futuros. Clique em "Novo Agendamento" para adicionar.'}
          </Typography>
        )}
      </List>
    </Box>
  );
}