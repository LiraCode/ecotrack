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
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import { useTheme } from '@mui/material/styles';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const theme = useTheme();

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
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`relative flex h-8.5 w-8.5 items-center justify-center rounded-lg hover:bg-green-950/60 dark:hover:bg-green-950/70 transition-colors`}
        href="#"
      >
        {notifying && (
          <span className="absolute -top-0.5 -right-0.5 z-1 h-4 w-4 rounded-full bg-red-500 dark:bg-red-600">
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-400 dark:bg-red-500 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 dark:bg-red-600 text-[10px] font-medium text-white">
              {notifications.filter(n => !n.read).length}
            </span>
          </span>
        )}

        <NotificationsIcon className={`${theme.palette.mode === 'dark' ? 'text-gray-200' : 'text-gray-100'}`} />
      </Link>

      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-4 flex w-75 flex-col rounded-lg border shadow-lg ${
            theme.palette.mode === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h5 className={`text-sm font-semibold ${
              theme.palette.mode === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Notificações
            </h5>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`p-4 text-center ${
                theme.palette.mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      theme.palette.mode === 'dark' ? 'bg-green-900' : 'bg-green-100'
                    }`}>
                      <NotificationIcon type={notification.type} className={`${
                        theme.palette.mode === 'dark' ? 'text-green-300' : 'text-green-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h6 className={`mb-0.5 text-sm font-medium ${
                        theme.palette.mode === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h6>
                      <p className={`text-xs ${
                        theme.palette.mode === 'dark' ? 'text-gray-400' : 'text-gray-700'
                      }`}>
                        {notification.content}
                      </p>
                      <p className={`text-xs mt-1 ${
                        theme.palette.mode === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownNotification;