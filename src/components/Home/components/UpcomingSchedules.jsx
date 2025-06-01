import React from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { CalendarToday as CalendarTodayIcon } from '@mui/icons-material';

const UpcomingSchedules = ({ schedules, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress size={30} sx={{ color: '#2e8b57' }} />
      </Box>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9' }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Você não tem agendamentos próximos.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid 
      container 
      spacing={2}
      sx={{
        justifyContent: { xs: 'center', sm: 'flex-start' }
      }}
    >
      {schedules.map((schedule) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          key={schedule.id}
        >
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderLeft: '4px solid #2e8b57',
              ...(isMobile && {
                maxWidth: '400px',
                margin: '0 auto'
              })
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              {schedule.location}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {schedule.date} às {schedule.time}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 'auto', 
                color: 'text.secondary',
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              <span style={{ fontWeight: 'bold' }}>Tipo:</span> {schedule.type}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default UpcomingSchedules;
