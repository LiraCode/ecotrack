'use client';
import { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid, Paper, Stack, 
  Select, MenuItem, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { CalendarToday, EventAvailable, CheckCircle, Add, Close } from '@mui/icons-material';

export default function AgendamentoPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedFullDate, setSelectedFullDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    type: '',
    date: ''
  });
  
  const [schedules, setSchedules] = useState([
    { date: '28/03/2025', type: 'Coleta de Resíduos de Metal', completed: true },
    { date: '05/04/2025', type: 'Coleta de Plástico', completed: false }
  ]);

  // Gerar calendário para o mês e ano atuais
  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const weeks = [];
    let week = [];
    
    // Adicionar dias vazios para alinhar o primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      week.push({
        day: '',
        currentMonth: false,
        date: null
      });
    }
    
    // Adicionar dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      week.push({
        day: i,
        currentMonth: true,
        date: new Date(year, month, i)
      });
      
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    // Se necessário, complete a última semana
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({
          day: '',
          currentMonth: false,
          date: null
        });
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  const weeks = generateCalendar(currentMonth, currentYear);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = [2024, 2025, 2026];

  const handleMonthChange = (event) => {
    setCurrentMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setCurrentYear(event.target.value);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateClick = (dayObj) => {
    if (!dayObj.currentMonth || !dayObj.date) return;
    
    setSelectedDate(dayObj.day);
    setSelectedFullDate(dayObj.date);
    const formattedDate = formatDate(dayObj.date);
    
    const dateSchedules = schedules.filter(s => s.date === formattedDate);
    
    if (dateSchedules.length > 0) {
      setOpenViewDialog(true);
    } else {
      setNewSchedule({
        type: '',
        date: formattedDate
      });
      setOpenNewDialog(true);
    }
  };

  const handleAddSchedule = () => {
    if (newSchedule.type && newSchedule.date) {
      setSchedules(prev => [
        ...prev,
        {
          date: newSchedule.date,
          type: newSchedule.type,
          completed: false
        }
      ]);
      setNewSchedule({
        type: '',
        date: ''
      });
      setOpenNewDialog(false);
    }
  };

  const handleDeleteSchedule = (index) => {
    setSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const getSchedulesForSelectedDate = () => {
    const formattedDate = formatDate(selectedFullDate);
    return schedules.filter(s => s.date === formattedDate);
  };

  return (
    <Box sx={{ 
      p: 2, 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      marginLeft: '240px',
      marginTop: '64px',
      width: 'calc(100% - 240px)'
    }}>
      {/* Título principal centralizado */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mb: 3
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: '#2e7d32', 
            fontWeight: 'bold',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <CalendarToday sx={{ fontSize: '2rem' }} />
          Agendamento
        </Typography>
      </Box>

      {/* Cabeçalho do Mês/Ano */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
          {months[currentMonth]} {currentYear}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Select
            value={currentMonth}
            onChange={handleMonthChange}
            sx={{ minWidth: 120, fontSize: '0.875rem' }}
            size="small"
            variant="outlined"
          >
            {months.map((month, index) => (
              <MenuItem key={month} value={index} sx={{ fontSize: '0.875rem' }}>
                {month}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={currentYear}
            onChange={handleYearChange}
            sx={{ minWidth: 100, fontSize: '0.875rem' }}
            size="small"
            variant="outlined"
          >
            {years.map((year) => (
              <MenuItem key={year} value={year} sx={{ fontSize: '0.875rem' }}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Calendário com células quadradas */}
      <Card sx={{ 
        mb: 2, 
        border: '1px solid #e0e0e0', 
        boxShadow: 'none',
        maxWidth: 'fit-content'
      }}>
        <CardContent sx={{ p: 1 }}>
          {/* Dias da semana - Cabeçalho */}
          <Grid container spacing={0} sx={{ mb: 1 }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
              <Grid item xs key={`day-${index}`} sx={{ 
                textAlign: 'center',
                width: '40px',
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                  {day.charAt(0)}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Semanas com dias */}
          {weeks.map((week, weekIndex) => (
            <Grid container spacing={0} key={weekIndex} sx={{ mb: 0 }}>
              {week.map((dayObj, dayIndex) => (
                <Grid item xs key={`${weekIndex}-${dayIndex}`} sx={{
                  width: '40px',
                  height: '40px'
                }}>
                  <Paper 
                    elevation={0}
                    onClick={() => handleDateClick(dayObj)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      textAlign: 'center',
                      cursor: dayObj.currentMonth && dayObj.date ? 'pointer' : 'default',
                      backgroundColor: dayObj.day === selectedDate && dayObj.currentMonth 
                        ? '#e8f5e9' 
                        : 'transparent',
                      '&:hover': { 
                        backgroundColor: (dayObj.currentMonth && dayObj.date) ? '#e8f5e9' : undefined 
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '1px solid #f0f0f0',
                      borderRadius: 0
                    }}
                  >
                    <Typography 
                      color={
                        dayObj.day === selectedDate && dayObj.currentMonth 
                          ? '#2e7d32' 
                          : !dayObj.currentMonth ? '#bdbdbd' : 'text.primary'
                      }
                      fontWeight={
                        dayObj.day === selectedDate && dayObj.currentMonth 
                          ? 'bold' 
                          : 'normal'
                      }
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {dayObj.day || ''}
                    </Typography>
                    {dayObj.currentMonth && dayObj.date && schedules.some(s => {
                      const scheduleDate = s.date.split('/');
                      const dayDate = formatDate(dayObj.date).split('/');
                      return scheduleDate[0] === dayDate[0] && 
                             scheduleDate[1] === dayDate[1] && 
                             scheduleDate[2] === dayDate[2];
                    }) && (
                      <Box sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#2e7d32',
                        mt: 0.5
                      }} />
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ))}
        </CardContent>
      </Card>

      {/* Botão para adicionar novo agendamento */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, maxWidth: '600px' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="small"
          sx={{ 
            backgroundColor: '#2e7d32', 
            '&:hover': { backgroundColor: '#1b5e20' },
            fontSize: '0.75rem'
          }}
          onClick={() => {
            setNewSchedule({
              type: '',
              date: formatDate(selectedFullDate)
            });
            setOpenNewDialog(true);
          }}
        >
          Novo Agendamento
        </Button>
      </Box>

      {/* Agenda */}
      <Typography variant="h6" gutterBottom sx={{ 
        color: '#2e7d32', 
        mt: 2,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1rem'
      }}>
        <EventAvailable sx={{ mr: 1, fontSize: '1rem' }} />
        Minha Agenda
      </Typography>

      <Stack spacing={1} sx={{ maxWidth: '1000px' }}>
        {schedules.map((schedule, index) => (
          <Card key={index} sx={{ 
            borderLeft: '4px solid #4caf50',
            backgroundColor: schedule.completed ? '#e8f5e9' : 'background.paper',
            position: 'relative'
          }}>
            <IconButton
              sx={{ 
                position: 'absolute', 
                right: 10, 
                top: 8,
                '& .MuiSvgIcon-root': { fontSize: '0.875rem' }
              }}
              onClick={() => handleDeleteSchedule(index)}
              size="small"
            >
              <Close />
            </IconButton>
            <CardContent sx={{ p: 1.5 }}>
              <Typography 
                sx={{ 
                  color: '#2e7d32',
                  textAlign: 'center',
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
                {schedule.date} - {schedule.type}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={schedule.completed ? <CheckCircle sx={{ fontSize: '0.875rem' }} /> : null}
                  sx={{ 
                    backgroundColor: schedule.completed ? '#81c784' : '#4caf50',
                    '&:hover': { backgroundColor: '#388e3c' },
                    minWidth: '180px',
                    fontSize: '0.75rem',
                    py: 1
                  }}
                  onClick={() => {
                    const newSchedules = [...schedules];
                    newSchedules[index].completed = !newSchedules[index].completed;
                    setSchedules(newSchedules);
                  }}
                >
                  {schedule.completed ? 'CONCLUÍDO ✓' : 'MARCAR CONCLUÍDO'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Diálogo para NOVO agendamento */}
      <Dialog open={openNewDialog} onClose={() => setOpenNewDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ py: 1.5, fontSize: '1rem' }}>Novo Agendamento</DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Data"
              value={newSchedule.date}
              sx={{ mb: 1.5 }}
              size="small"
              disabled
            />
            <TextField
              fullWidth
              label="Tipo de Agendamento"
              name="type"
              value={newSchedule.type}
              onChange={handleInputChange}
              sx={{ mb: 1 }}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1 }}>
          <Button 
            onClick={() => setOpenNewDialog(false)} 
            size="small"
            sx={{ fontSize: '0.75rem' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddSchedule}
            variant="contained"
            disabled={!newSchedule.type}
            size="small"
            sx={{ 
              backgroundColor: '#2e7d32', 
              '&:hover': { backgroundColor: '#1b5e20' },
              fontSize: '0.75rem'
            }}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para VISUALIZAR agendamentos existentes */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ py: 1.5, fontSize: '1rem' }}>
          Agendamentos para {formatDate(selectedFullDate)}
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <List>
            {getSchedulesForSelectedDate().map((schedule, index) => (
              <div key={index}>
                <ListItem>
                  <ListItemText
                    primary={schedule.type}
                    secondary={`Status: ${schedule.completed ? 'Concluído' : 'Pendente'}`}
                  />
                  <Box>
                    <IconButton
                      onClick={() => {
                        const newSchedules = [...schedules];
                        const scheduleIndex = schedules.findIndex(s => 
                          s.date === schedule.date && s.type === schedule.type
                        );
                        newSchedules[scheduleIndex].completed = !newSchedules[scheduleIndex].completed;
                        setSchedules(newSchedules);
                      }}
                      size="small"
                    >
                      <CheckCircle color={schedule.completed ? 'success' : 'action'} />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        handleDeleteSchedule(
                          schedules.findIndex(s => 
                            s.date === schedule.date && s.type === schedule.type
                          )
                        );
                      }}
                      size="small"
                    >
                      <Close />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < getSchedulesForSelectedDate().length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1 }}>
          <Button 
            onClick={() => {
              setNewSchedule({
                type: '',
                date: formatDate(selectedFullDate)
              });
              setOpenViewDialog(false);
              setOpenNewDialog(true);
            }}
            variant="outlined"
            size="small"
            startIcon={<Add />}
            sx={{ fontSize: '0.75rem' }}
          >
            Adicionar Novo
          </Button>
          <Button 
            onClick={() => setOpenViewDialog(false)} 
            variant="contained"
            size="small"
            sx={{ 
              backgroundColor: '#2e7d32', 
              '&:hover': { backgroundColor: '#1b5e20' },
              fontSize: '0.75rem'
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}