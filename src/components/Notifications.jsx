import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Paper,
  Stack,
  Avatar
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const notificationConfig = {
  info: {
    icon: <InfoIcon color="info" />,
    color: 'info.main',
    bgColor: 'info.lighter',
    label: 'Informação'
  },
  success: {
    icon: <CheckCircleIcon color="success" />,
    color: 'success.main',
    bgColor: 'success.lighter',
    label: 'Sucesso'
  },
  warning: {
    icon: <WarningIcon color="warning" />,
    color: 'warning.main',
    bgColor: 'warning.lighter',
    label: 'Aviso'
  },
  error: {
    icon: <ErrorIcon color="error" />,
    color: 'error.main',
    bgColor: 'error.lighter',
    label: 'Erro'
  }
};

const NotificationIcon = ({ type }) => {
  const config = notificationConfig[type] || notificationConfig.info;
  return config.icon;
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Notifications() {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (notifying) {
      markAsRead();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Buscar notificações
  const fetchNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar notificações');
      }

      const data = await response.json();
      setNotifications(data.notifications);
      
      // Verificar se há notificações não lidas
      const hasUnread = data.notifications.some(notification => !notification.read);
      setNotifying(hasUnread);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificações como lidas
  const markAsRead = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar notificações como lidas');
      }

      setNotifying(false);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ width: 40, height: 40 }}
      >
        <Badge color="error" variant="dot" invisible={!notifying}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: '70vh',
              overflowY: 'auto'
            }
          }
        }}
      >
        <Paper elevation={0}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Notificações</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.length === 0 ? (
                <ListItem>
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma notificação
                  </Typography>
                </ListItem>
              ) : (
                notifications.map((notification) => (
                  <Box key={notification._id}>
                    <ListItem
                      sx={{
                        py: 2,
                        px: 2.5,
                        ...(notification.read && {
                          bgcolor: 'action.hover'
                        })
                      }}
                    >
                      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                        <NotificationIcon type={notification.type} />
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              color={notificationConfig[notification.type]?.color || 'info.main'}
                            >
                              {notification.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: notificationConfig[notification.type]?.bgColor || 'info.lighter',
                                color: notificationConfig[notification.type]?.color || 'info.main'
                              }}
                            >
                              {notificationConfig[notification.type]?.label || 'Informação'}
                            </Typography>
                          </Stack>
                          <Typography
                            component="div"
                            variant="body2"
                            color="textPrimary"
                            sx={{ mb: 0.5 }}
                          >
                            {notification.content}
                          </Typography>
                          <Typography
                            component="div"
                            variant="caption"
                            color="textSecondary"
                          >
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    </ListItem>
                    <Divider />
                  </Box>
                ))
              )}
            </List>
          )}
        </Paper>
      </Popover>
    </>
  );
} 