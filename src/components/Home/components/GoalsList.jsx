'use client';
import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip, Button, CircularProgress, useTheme } from "@mui/material";
import { EmojiEvents as EmojiEventsIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function GoalsList({ goals, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, width: '100%' }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmojiEventsIcon sx={{ mr: 1 }} /> Meus Desafios Ativos
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress color="success" />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmojiEventsIcon sx={{ mr: 1 }} /> Meus Desafios Ativos
      </Typography>
      {goals.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary'
        }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Nenhuma meta ativa no momento
          </Typography>
          <Link href="/cliente/metas" style={{ textDecoration: 'none' }}>
            <Button
              component="span"
              variant="outlined"
              sx={{
                color: '#2e8b57',
                borderColor: '#2e8b57',
                '&:hover': { 
                  borderColor: '#1f6b47', 
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(46, 139, 87, 0.1)' : '#e8f5e9' 
                }
              }}
            >
              Participar de Metas
            </Button>
          </Link>
        </Box>
      ) : (
        <>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {goals.map((goal) => (
              <ListItem
                key={goal.id}
                sx={{
                  mb: 1,
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'divider' : '#e0e0e0',
                  borderRadius: 1,
                  backgroundColor: goal.completed 
                    ? theme.palette.mode === 'dark' ? 'rgba(46, 139, 87, 0.1)' : '#e8f5e9' 
                    : theme.palette.mode === 'dark' ? 'background.paper' : 'white',
                  '&:hover': { 
                    backgroundColor: goal.completed 
                      ? theme.palette.mode === 'dark' ? 'rgba(46, 139, 87, 0.15)' : '#d7ecd9' 
                      : theme.palette.mode === 'dark' ? 'action.hover' : '#f5f5f5' 
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: goal.completed ? '#2e8b57' : theme.palette.mode === 'dark' ? 'action.selected' : '#e0e0e0' }}>
                    <EmojiEventsIcon sx={{ color: goal.completed ? 'white' : theme.palette.mode === 'dark' ? 'text.secondary' : '#757575' }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>
                  <Typography align="center" color="text.primary">{goal.title}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Chip
                      size="small"
                      label={goal.completed ? "Concluído" : "Em andamento"}
                      sx={{
                        backgroundColor: goal.completed ? '#2e8b57' : theme.palette.mode === 'dark' ? 'background.paper' : '#fafafa',
                        color: goal.completed ? 'white' : theme.palette.mode === 'dark' ? 'text.secondary' : '#757575',
                        borderColor: goal.completed ? '#2e8b57' : theme.palette.mode === 'dark' ? 'divider' : '#e0e0e0',
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
                  '&:hover': { 
                    borderColor: '#1f6b47', 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(46, 139, 87, 0.1)' : '#e8f5e9' 
                  }
                }}
              >
                Participar de Metas
              </Button>
            </Link>
          </Box>
        </>
      )}
    </Paper>
  );
}
