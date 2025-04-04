'use client';
import { useState } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent } from '@mui/material';
import Post from '@/components/common/Post/page';

export default function AgendamentoPage() {
  const [schedules, setSchedules] = useState([
    { id: 1, date: '05/03/2025', status: 'PENDENTE' },
    { id: 2, date: '31/02/2025', status: 'PENDENTE' },
    { id: 3, date: '01/02/2025', status: 'CONCLUÍDA' }
  ]);

  const [newSchedule, setNewSchedule] = useState('');

  const handleAddSchedule = () => {
    if (newSchedule) {
      const formattedDate = new Date(newSchedule).toLocaleDateString('pt-BR');
      setSchedules([
        ...schedules,
        { id: schedules.length + 1, date: formattedDate, status: 'PENDENTE' }
      ]);
      setNewSchedule('');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Agendamento de Coleta
      </Typography>
      
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            value={newSchedule}
            onChange={(e) => setNewSchedule(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <Button 
            variant="contained" 
            onClick={handleAddSchedule}
            disabled={!newSchedule}
          >
            Agendar
          </Button>
        </Box>
      </Card>
      
      <Typography variant="h6" gutterBottom>
        Agendamentos
      </Typography>
      {schedules.map((schedule) => (
        <Post
          key={schedule.id}
          title={`COLETA ${schedule.status}`}
          content={`Data: ${schedule.date}`}
          status={schedule.status}
        />
      ))}
    </Box>
  );
}