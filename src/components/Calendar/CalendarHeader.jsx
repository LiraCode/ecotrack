import { Typography, Select, MenuItem, Box } from '@mui/material';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const years = [2024, 2025, 2026];

export default function CalendarHeader({ currentMonth, currentYear, setCurrentMonth, setCurrentYear }) {
  return (
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
          onChange={(e) => setCurrentMonth(e.target.value)}
          sx={{ minWidth: 120, fontSize: '0.875rem' }}
          size="small"
        >
          {months.map((month, index) => (
            <MenuItem key={month} value={index} sx={{ fontSize: '0.875rem' }}>
              {month}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={currentYear}
          onChange={(e) => setCurrentYear(e.target.value)}
          sx={{ minWidth: 100, fontSize: '0.875rem' }}
          size="small"
        >
          {years.map((year) => (
            <MenuItem key={year} value={year} sx={{ fontSize: '0.875rem' }}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}