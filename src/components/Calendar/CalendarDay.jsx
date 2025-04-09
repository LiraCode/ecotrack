import { Paper, Typography, Box } from '@mui/material';

export default function CalendarDay({ dayObj, selectedDate, hasSchedule, onClick }) {
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
          ? '#e8f5e9' 
          : !dayObj.currentMonth 
            ? '#f9f9f9' 
            : '#ffffff',
        '&:hover': {
          backgroundColor: dayObj.currentMonth ? '#e8f5e9' : undefined
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        position: 'relative',
        color: !dayObj.currentMonth ? '#bdbdbd' : 'inherit'
      }}
    >
      <Typography 
        variant="body2"
        fontWeight={dayObj.day === selectedDate ? 'bold' : 'normal'}
        sx={{
          color: dayObj.day === selectedDate ? '#2e7d32' : 'inherit'
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
          backgroundColor: '#2e7d32'
        }} />
      )}
    </Paper>
  );
}