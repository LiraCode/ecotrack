import { useState } from 'react';
import { Box, Typography, IconButton, Grid } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function Calendar({ 
  schedules, 
  setSchedules, 
  setOpenNewDialog, 
  setOpenViewDialog, 
  setSelectedFullDate,
  isMobile 
}) {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Função para formatar a data no formato DD/MM/YYYY
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Função para verificar se uma data tem agendamentos
  const hasSchedule = (date) => {
    const formattedDate = formatDate(date);
    return schedules.some(schedule => schedule.date === formattedDate);
  };

  // Função para obter o número de dias em um mês
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Função para obter o primeiro dia da semana do mês
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Função para navegar para o mês anterior
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };

  // Função para navegar para o próximo mês
  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };

  // Função para lidar com o clique em uma data
  const handleDateClick = (day) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    
    setSelectedFullDate(clickedDate);
    
    // Verifica se há agendamentos para esta data
    const formattedDate = formatDate(clickedDate);
    const schedulesForDate = schedules.filter(s => s.date === formattedDate);
    
    if (schedulesForDate.length > 0) {
      // Se houver agendamentos, abre o diálogo de visualização
      setOpenViewDialog(true);
    } else {
      // Se não houver agendamentos, abre o diálogo de novo agendamento
      setOpenNewDialog(true);
    }
  };

  // Renderiza o calendário
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Adiciona os dias vazios no início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ height: '40px', width: '40px' }} />);
    }
    
    // Adiciona os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = new Date().toDateString() === date.toDateString();
      const hasEvent = hasSchedule(date);
      
      days.push(
        <Box 
          key={day}
          onClick={() => handleDateClick(day)}
          sx={{
            height: '40px',
            width: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            cursor: 'pointer',
            backgroundColor: isToday 
              ? theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.4)' : '#e8f5e9'
              : hasEvent 
                ? theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.3)' : '#c8e6c9'
                : 'transparent',
            border: isToday 
              ? `2px solid ${theme.palette.mode === 'dark' ? '#4caf50' : '#4caf50'}`
              : 'none',
            outline: isToday 
              ? `2px solid ${theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.5)' : 'rgba(76,175,80,0.3)'}`
              : 'none',
            outlineOffset: '2px',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.3)' : '#e8f5e9'
            }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit',
              fontWeight: isToday ? 'bold' : 'normal'
            }}
          >
            {day}
          </Typography>
        </Box>
      );
    }
    
    return days;
  };

  // Nomes dos meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Nomes dos dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Box sx={{ 
      width: '100%',
      backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
      borderRadius: '8px',
      padding: 2,
      boxShadow: theme.palette.mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
      mb: 4
    }}>
      {/* Cabeçalho do calendário */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <IconButton onClick={handlePrevMonth} sx={{ color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit' }}>
          <ArrowBackIos />
        </IconButton>
        
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold',
          color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main'
        }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Typography>
        
        <IconButton onClick={handleNextMonth} sx={{ color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit' }}>
          <ArrowForwardIos />
        </IconButton>
      </Box>
     {/* Dias da semana - Alinhados corretamente */}

{/* Dias da semana - Ajuste fino de alinhamento */}
<Box sx={{ 
  display: 'flex', 
  justifyContent: 'center', 
  mb: 1,
  px: 1 // Adiciona padding horizontal para manter alinhamento
}}>
  <Grid container sx={{ 
    maxWidth: '350px', 
    width: '100%',
    justifyContent: 'space-between' // Distribuição uniforme
  }}>
    {weekDays.map((day, index) => (
      <Grid item 
        key={index} 
        sx={{ 
          width: '14.28%', // 100% / 7 dias = 14.28%
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 40 // Altura fixa para alinhamento vertical
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            width: '100%', // Garante ocupar toda a célula
            color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main'
          }}
        >
          {day}
        </Typography>
      </Grid>
    ))}
  </Grid>
</Box>

{/* Grade do calendário - Correção para evitar desalinhamento da última linha */}
<Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
  <Grid container sx={{ maxWidth: '350px', width: '100%' }}>
    {Array.from({ length: 42 }).map((_, index) => {
      const day = renderCalendar()[index] || ''; // Preenche espaços vazios corretamente
      return (
        <Grid item 
          key={index} 
          sx={{ 
            width: 'calc(100% / 7)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 40, 
            mb: 1 
          }}
        >
          {day}
        </Grid>
      );
    })}
  </Grid>
</Box>



      
      {/* Legenda */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mt: 2,
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.4)' : '#e8f5e9',
            border: `2px solid ${theme.palette.mode === 'dark' ? '#4caf50' : '#4caf50'}`,
            outline: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.5)' : 'rgba(76,175,80,0.3)'}`,
            outlineOffset: '2px'
          }} />
          <Typography variant="caption" sx={{ 
            color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit',
            fontWeight: 'medium'
          }}>
            Hoje
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.3)' : '#c8e6c9'
          }} />
          <Typography variant="caption" sx={{ 
            color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit',
            fontWeight: 'medium'
          }}>
            Com agendamento
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}