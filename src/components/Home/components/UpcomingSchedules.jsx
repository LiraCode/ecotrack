import React from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { CalendarToday as CalendarTodayIcon } from '@mui/icons-material';

const UpcomingSchedules = ({ schedules, loading }) => {
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
    <Grid container spacing={2}>
      {schedules.map((schedule) => (
        <Grid item xs={12} sm={6} key={schedule.id}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderLeft: '4px solid #2e8b57'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {schedule.location}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {schedule.date} às {schedule.time}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 'auto', color: 'text.secondary' }}>
              <span style={{ fontWeight: 'bold' }}>Tipo:</span> {schedule.type}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default UpcomingSchedules;
