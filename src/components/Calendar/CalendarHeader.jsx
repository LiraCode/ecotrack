import { Typography, Select, MenuItem, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const years = [2024, 2025, 2026];

export default function CalendarHeader({ currentMonth, currentYear, setCurrentMonth, setCurrentYear }) {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 2
    }}>
      <Typography variant="h5" sx={{ 
        color: theme.palette.mode === 'dark' ? 'primary.light' : '#2e7d32', 
        fontWeight: 'bold' 
      }}>
        {months[currentMonth]} {currentYear}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Select
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          sx={{ 
            minWidth: 120, 
            fontSize: '0.875rem',
            backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
            color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit',
            '& .MuiSelect-icon': {
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit'
            }
          }}
          size="small"
        >
          {months.map((month, index) => (
            <MenuItem 
              key={month} 
              value={index} 
              sx={{ 
                fontSize: '0.875rem',
                color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit'
              }}
            >
              {month}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={currentYear}
          onChange={(e) => setCurrentYear(e.target.value)}
          sx={{ 
            minWidth: 100, 
            fontSize: '0.875rem',
            backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
            color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit',
            '& .MuiSelect-icon': {
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit'
            }
          }}
          size="small"
        >
          {years.map((year) => (
            <MenuItem 
              key={year} 
              value={year} 
              sx={{ 
                fontSize: '0.875rem',
                color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit'
              }}
            >
              {year}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}