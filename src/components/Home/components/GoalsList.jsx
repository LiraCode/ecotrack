'use client';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip, Button, CircularProgress } from "@mui/material";
import { EmojiEvents as EmojiEventsIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function GoalsList({ goals, loading }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress size={30} sx={{ color: '#2e8b57' }} />
      </Box>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9' }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Você não tem metas ativas no momento.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmojiEventsIcon sx={{ mr: 1 }} /> Meus Desafios Ativos
      </Typography>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {goals.map((goal) => (
          <ListItem
            key={goal.id}
            sx={{
              mb: 1,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              backgroundColor: goal.completed ? '#e8f5e9' : 'white',
              '&:hover': { backgroundColor: goal.completed ? '#d7ecd9' : '#f5f5f5' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: goal.completed ? '#2e8b57' : '#e0e0e0' }}>
                <EmojiEventsIcon sx={{ color: goal.completed ? 'white' : '#757575' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText>
              <Typography align="center">{goal.title}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Chip
                  size="small"
                  label={goal.completed ? "Concluído" : "Em andamento"}
                  sx={{
                    backgroundColor: goal.completed ? '#2e8b57' : '#fafafa',
                    color: goal.completed ? 'white' : '#757575',
                    borderColor: goal.completed ? '#2e8b57' : '#e0e0e0',
                    border: '1px solid'
                  }}
                />
              </Box>
            </ListItemText>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Link href="/cliente/metas" style={{ textDecoration: 'none' }}>
          <Button
            component="span"
            variant="outlined"
            sx={{
              color: '#2e8b57',
              borderColor: '#2e8b57',
              '&:hover': { borderColor: '#1f6b47', backgroundColor: '#e8f5e9' }
            }}
          >
            Adicionar Nova Meta
          </Button>
        </Link>
      </Box>
    </Paper>
  );
}
