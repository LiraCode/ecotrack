'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAuth } from 'firebase/auth';
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
  Stack
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

// Configurações
const NOTIFICATION_REFRESH_INTERVAL = 60 * 1000; // 1 minuto em milissegundos

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

const DropdownNotification = () => {
  const { user } = useAuth();
  const auth = getAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setNotifications([]);
      return;
    }

    try {
      setError(null);
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar notificações');
      }

      const data = await response.json();
      
      // Se a resposta for uma mensagem de "nenhuma notificação", definir array vazio
      if (data.message === 'Nenhuma notificação encontrada') {
        setNotifications([]);
        setNotifying(false);
      } else {
        // Caso contrário, usar o array de notificações retornado
        const notificationsArray = Array.isArray(data) ? data : [];
        setNotifications(notificationsArray);
        // Verificar se há notificações não lidas
        const hasUnread = notificationsArray.some(notification => !notification.read);
        setNotifying(hasUnread);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      setError('Erro ao carregar notificações');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!user) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
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
    // Atualizar notificações no intervalo definido
    const interval = setInterval(fetchNotifications, NOTIFICATION_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [user]);

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
    return new Date(date).toLocaleDateString("pt-BR", options);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        sx={{
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
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
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: '70vh',
            overflowY: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Notificações</Typography>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Nenhuma notificação
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
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
                      <Typography
                        variant="subtitle2"
                        color={notificationConfig[notification.type]?.color || 'info.main'}
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textPrimary"
                        sx={{ mb: 0.5, mt: 0.5 }}
                      >
                        {notification.content}
                      </Typography>
                      <Typography
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
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default DropdownNotification;
