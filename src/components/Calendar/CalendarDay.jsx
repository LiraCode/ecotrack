import { Paper, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function CalendarDay({ dayObj, selectedDate, hasSchedule, onClick }) {
  const theme = useTheme();

  return (
    <Paper 
      elevation={0}
      onClick={() => dayObj.currentMonth && onClick()}
      sx={{
        aspectRatio: '1',
        minHeight: '40px',
        textAlign: 'center',
        cursor: dayObj.currentMonth ? 'pointer' : 'default',
        backgroundColor: dayObj.day === selectedDate && dayObj.currentMonth 
          ? theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.4)' : '#e8f5e9'
          : !dayObj.currentMonth 
            ? theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9f9f9'
            : theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
        '&:hover': {
          backgroundColor: dayObj.currentMonth 
            ? theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.3)' : '#e8f5e9'
            : undefined
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e0e0e0'}`,
        borderRadius: '4px',
        position: 'relative',
        color: !dayObj.currentMonth 
          ? theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : '#bdbdbd'
          : theme.palette.mode === 'dark' ? 'text.primary' : 'inherit'
      }}
    >
      <Typography 
        variant="body2"
        fontWeight={dayObj.day === selectedDate ? 'bold' : 'normal'}
        sx={{
          color: dayObj.day === selectedDate 
            ? theme.palette.mode === 'dark' ? 'primary.light' : '#2e7d32'
            : theme.palette.mode === 'dark' ? 'text.primary' : 'inherit'
        }}
      >
        {dayObj.day}
      </Typography>
      
      {hasSchedule && (
        <Box sx={{
          position: 'absolute',
          bottom: '4px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: theme.palette.mode === 'dark' ? 'primary.light' : '#2e7d32'
        }} />
      )}
    </Paper>
  );
}