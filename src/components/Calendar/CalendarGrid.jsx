import { Typography, Box } from '@mui/material';
import CalendarDay from './CalendarDay';

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function CalendarGrid({ 
  currentMonth, 
  currentYear, 
  selectedDate, 
  schedules,
  setSelectedDate,
  setSelectedFullDate,
  setOpenNewDialog,
  setOpenViewDialog
}) {
  // Função para gerar o calendário (agora definida dentro do componente)
  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const weeks = [];
    let week = [];
    
    // Dias do mês anterior (se necessário)
    for (let i = firstDay - 1; i >= 0; i--) {
      week.push({
        day: daysInPrevMonth - i,
        currentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i)
      });
    }
    
    // Dias do mês atual
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
    
    // Dias do próximo mês (se necessário)
    if (week.length > 0) {
      let nextMonthDay = 1;
      while (week.length < 7) {
        week.push({
          day: nextMonthDay,
          currentMonth: false,
          date: new Date(year, month + 1, nextMonthDay)
        });
        nextMonthDay++;
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  // Função para formatar data
  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Verifica se há agendamentos para o dia
  const hasSchedule = (dayObj) => {
    if (!dayObj.date) return false;
    const formattedDate = formatDate(dayObj.date);
    return schedules.some(s => s.date === formattedDate);
  };

  // Gera o calendário
  const calendarWeeks = generateCalendar(currentMonth, currentYear);

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '4px',
      width: '100%',
      maxWidth: '400px'
    }}>
      {/* Cabeçalho com dias da semana */}
      {weekDays.map((day) => (
        <Box key={day} sx={{
          textAlign: 'center',
          py: 1,
          fontWeight: 'bold',
          fontSize: '0.75rem',
          color: '#2e7d32'
        }}>
          {day}
        </Box>
      ))}

      {/* Dias do calendário */}
      {calendarWeeks.flat().map((dayObj, index) => (
        <CalendarDay
          key={`day-${index}`}
          dayObj={dayObj}
          selectedDate={selectedDate}
          hasSchedule={hasSchedule(dayObj)}
          onClick={() => {
            if (!dayObj.currentMonth) return;
            setSelectedDate(dayObj.day);
            setSelectedFullDate(dayObj.date);
            const formattedDate = formatDate(dayObj.date);
            const dateSchedules = schedules.filter(s => s.date === formattedDate);
            dateSchedules.length > 0 
              ? setOpenViewDialog(true) 
              : setOpenNewDialog(true);
          }}
        />
      ))}
    </Box>
  );
}