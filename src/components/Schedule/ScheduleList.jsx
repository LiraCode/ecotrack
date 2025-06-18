import { Box, Typography, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { CheckCircle, Cancel, AccessTime, AutoDelete } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function ScheduleList({ 
  title = "Próximos Agendamentos",
  schedules, 
  setSchedules, 
  isMobile, 
  onViewSchedule,
  isPastList = false
}) {
  const theme = useTheme();

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
        backgroundColor: theme.palette.mode === 'dark' 
          ? (isPastList ? 'rgba(76, 175, 80, 0.1)' : 'background.paper')
          : (isPastList ? "#DBECCF" : "#fff"),
        borderRadius: "8px",
        padding: isMobile ? 1.5 : 2,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 4px rgba(0,0,0,0.2)'
          : '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: { xs: '100%', sm: '800px' },
        margin: '0 auto'
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: theme.palette.mode === 'dark'
            ? (isPastList ? 'text.secondary' : 'primary.light')
            : (isPastList ? "#757575" : "#2e7d32"),
          borderBottom: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e0e0e0'}`,
          paddingBottom: 1,
          textAlign: 'left',
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}
      >
        {title}
      </Typography>

      <List>
        {schedules.length > 0 ? (
          schedules.map((schedule, index) => (
            <Box key={schedule.id || index}>
              <ListItem
                button
                onClick={() => onViewSchedule(schedule.date)}
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'background.paper'
                    : 'transparent',
                  borderRadius: '4px',
                  mb: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'action.hover'
                      : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                <ListItemText
                  primary={schedule.name}
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
                          color: theme.palette.mode === 'dark' ? 'text.secondary' : '#666',
                          fontWeight: '500'
                        },
                        '& .status-label': {
                          color: theme.palette.mode === 'dark' ? 'text.secondary' : '#666',
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
                      color: theme.palette.mode === 'dark'
                        ? (isPastList ? 'text.secondary' : 'text.primary')
                        : (isPastList ? "#757575" : "#333"),
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
              </ListItem>
              {index < schedules.length - 1 && (
                <Divider sx={{ 
                  my: isMobile ? 0.5 : 1,
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }} />
              )}
            </Box>
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{ 
              textAlign: "center", 
              color: theme.palette.mode === 'dark' ? 'text.secondary' : '#666', 
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