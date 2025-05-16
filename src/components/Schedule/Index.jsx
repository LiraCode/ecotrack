'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, useMediaQuery, useTheme, Button } from '@mui/material';
import { CalendarToday, Add } from '@mui/icons-material';
import Calendar from '../Calendar/Calendar';
import ScheduleList from './ScheduleList';
import NewScheduleDialog from './NewScheduleDialog';
import ScheduleDialog from './ScheduleDialog';
import { useAuth } from "@/context/AuthContext";


export default function AgendamentoPage({ sidebarOpen = false }) {
    const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [schedules, setSchedules] = useState([]);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedFullDate, setSelectedFullDate] = useState(new Date());
  const [showPastSchedules, setShowPastSchedules] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchSchedules();
  }, [user]);

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/schedule', {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        const formattedSchedules = data.map(schedule => ({
          id: schedule._id,
          name: schedule.collectionPointId.name,
          date: new Date(schedule.date).toLocaleDateString('pt-BR'),
          type: schedule.wastes.map(w => w.wasteId.type || w.wasteId.name).join(', '),
          completed: schedule.status === 'Concluído',
          status: schedule.status,
          collector: schedule.collector,
          wastes: schedule.wastes,
          addressId: schedule.addressId
        }));
        setSchedules(formattedSchedules);
        console.log( "teste",formattedSchedules);
      } else {
        console.error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

   const handleAddSchedule = async (newSchedule) => {
    await fetchSchedules(); // Refresh schedules after adding new one
  };
  
  const handleToggleComplete = (date, type) => {
    setSchedules(prev => prev.map(s => 
      s.date === date && s.type === type 
        ? { ...s, completed: !s.completed } 
        : s
    ));
  };

  const handleDeleteSchedule = async (date, type) => {
    try {
      const scheduleToDelete = schedules.find(s => 
        s.date === date && s.type === type
      );

      if (!scheduleToDelete) return;

      const response = await fetch(`/api/schedule/${scheduleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        await fetchSchedules(); // Refresh schedules after deletion
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  // Função para abrir o diálogo de novo agendamento
  const handleOpenNewDialog = () => {
    setSelectedFullDate(new Date());
    setOpenNewDialog(true);
  };

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 3,
      backgroundColor: 'gray.50',
      minHeight: '100vh',
      marginLeft: sidebarOpen && !isMobile ? '240px' : '0',
      width: sidebarOpen && !isMobile ? 'calc(100% - 240px)' : '100%',
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Título principal centralizado */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'center',
        mb: 3,
        px: isMobile ? 1 : 3
      }}>
        <Typography 
          variant={isMobile ? 'h4' : 'h3'} 
          sx={{ 
            color: '#2e7d32', 
            fontWeight: 'bold',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <CalendarToday sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }} />
          Agendamento
        </Typography>
      </Box>

      {/* Conteúdo principal */}
      <Box sx={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: isMobile ? 1 : 3
      }}>
        <Calendar 
          schedules={schedules} 
          setSchedules={setSchedules}
          setOpenNewDialog={setOpenNewDialog}
          setOpenViewDialog={setOpenViewDialog}
          setSelectedFullDate={setSelectedFullDate}
          isMobile={isMobile}
        />
        
        {/* Botão de novo agendamento centralizado */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenNewDialog}
          sx={{ 
            backgroundColor: '#2e7d32',
            '&:hover': {
              backgroundColor: '#1b5e20',
            },
            mb: 4,
            px: 3,
            py: 1
          }}
        >
          Novo Agendamento
        </Button>
        
        {/* Toggle para mostrar agendamentos anteriores */}
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2 
        }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowPastSchedules(!showPastSchedules)}
            sx={{ 
              borderColor: '#2e7d32',
              color: '#2e7d32',
              '&:hover': {
                borderColor: '#1b5e20',
                backgroundColor: '#f1f8e9'
              }
            }}
          >
            {showPastSchedules ? 'Ocultar Agendamentos Anteriores' : 'Mostrar Agendamentos Anteriores'}
          </Button>
        </Box>
        
        {/* Lista de agendamentos futuros */}
       <ScheduleList 
        title="Próximos Agendamentos"
        schedules={schedules.filter(s => !s.completed)}
        setSchedules={setSchedules} 
        isMobile={isMobile}
        onViewSchedule={(date) => {
          const [day, month, year] = date.split('/').map(Number);
          setSelectedFullDate(new Date(year, month - 1, day));
          setOpenViewDialog(true);
        }}
      />
        
        {/* Lista de agendamentos anteriores (concluídos) */}
        {showPastSchedules && (
        <ScheduleList 
          title="Agendamentos Anteriores"
          schedules={schedules.filter(s => s.completed)}
          setSchedules={setSchedules} 
          isMobile={isMobile}
          onViewSchedule={(date) => {
            const [day, month, year] = date.split('/').map(Number);
            setSelectedFullDate(new Date(year, month - 1, day));
            setOpenViewDialog(true);
          }}
          isPastList={true}
        />
      )}
      </Box>

      {/* Diálogos */}
      <NewScheduleDialog
        open={openNewDialog}
        onClose={() => setOpenNewDialog(false)}
        selectedDate={formatDate(selectedFullDate)}
        onAddSchedule={handleAddSchedule}
        isMobile={isMobile}
      />

      <ScheduleDialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        selectedDate={formatDate(selectedFullDate)}
        schedules={schedules}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteSchedule}
        onAddNew={() => {
          setOpenViewDialog(false);
          setOpenNewDialog(true);
        }}
        isMobile={isMobile}
      />
    </Box>
  );
}