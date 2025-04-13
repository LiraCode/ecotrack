'use client';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Button } from "@mui/material";
import { 
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  Recycling as RecyclingIcon,
  ElectricBolt as ElectricBoltIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function UpcomingSchedules({ schedules }) {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CalendarTodayIcon sx={{ mr: 1 }} /> Próximos Agendamentos
      </Typography>
      {schedules.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {schedules.map((schedule) => (
            <ListItem
              key={schedule.id}
              secondaryAction={
                <Link href={`/agendamento/${schedule.id}`} style={{ textDecoration: 'none' }}>
                  <IconButton component="span" edge="end" aria-label="details" sx={{ color: '#2e8b57' }}>
                    <ArrowForwardIcon />
                  </IconButton>
                </Link>
              }
              sx={{ 
                mb: 1, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#e8f5e9' }}>
                  {schedule.type.includes('Eletrônico') ? 
                    <ElectricBoltIcon sx={{ color: '#2e8b57' }} /> : 
                    <RecyclingIcon sx={{ color: '#2e8b57' }} />
                  }
                </Avatar>
              </ListItemAvatar>
              <ListItemText>
               <Typography align="center">{schedule.location}</Typography>
                
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" align="center">
                        {schedule.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" align="center">
                        {schedule.time}
                      </Typography>
                    </Box>
                  </Box>
                  </ListItemText>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            Nenhum agendamento próximo
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Link href="/agendamento" style={{ textDecoration: 'none' }}>
              <Button 
                component="span"
                variant="contained" 
                sx={{ 
                  mt: 2,
                  backgroundColor: '#2e8b57', 
                  '&:hover': { backgroundColor: '#1f6b47' }
                }}
              >
                Agendar Coleta
              </Button>
            </Link>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
