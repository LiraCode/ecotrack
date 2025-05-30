'use client';

import AppLayout from '@/components/Layout/page';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  ListSubheader,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function NotificacoesAdmin() {
  const { user } = useAuth();
  const router = useRouter();
  const [tipoDestinatario, setTipoDestinatario] = useState('grupo');
  const [grupo, setGrupo] = useState('usuarios');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipo, setTipo] = useState('info');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      router.push('/administracao/login');
    }
  }, [user, router]);

  // Verificar status da sidebar e responsividade
  useEffect(() => {
    const sidebarStatus = localStorage.getItem('sidebarOpen');
    if (sidebarStatus === 'true') {
      setSidebarOpen(true);
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
        localStorage.setItem('sidebarOpen', 'false');
        setIsMobile(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    fetch('/api/users/all', {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'uid': user.uid
      }
    })
      .then(res => res.json())
      .then(setUsuarios)
      .catch(err => {
        console.error(err);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar usuários',
          severity: 'error'
        });
      });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/notifications/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
          'uid': user.uid
        },
        body: JSON.stringify({
          tipoDestinatario: tipoDestinatario === 'grupo' ? 'grupo' : 'usuario',
          destinatario: tipoDestinatario === 'grupo' ? grupo : usuarioSelecionado,
          titulo,
          conteudo,
          tipo
        })
      });

      if (!response.ok) throw new Error('Erro ao enviar notificação');

      setSnackbar({
        open: true,
        message: 'Notificação enviada com sucesso',
        severity: 'success'
      });
      setTitulo('');
      setConteudo('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao enviar notificação',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box
        sx={{
          p: 3,
          width: '100%',
          maxWidth: '1600px',
          marginLeft: '100px',
          flexGrow: 1,
          overflow: 'auto',
          transition: 'margin-left 0.3s',
          xs: { marginLeft: sidebarOpen ? '240px' : '0px' },
          marginRight: isMobile ? '0' : '100px',
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{ color: '#2e7d32', fontWeight: 'bold' }}
            >
              Gerenciamento de Notificações
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <FormControl>
                <RadioGroup
                  row
                  value={tipoDestinatario}
                  onChange={(e) => setTipoDestinatario(e.target.value)}
                >
                  <FormControlLabel
                    value="grupo"
                    control={<Radio />}
                    label="Grupo de Usuários"
                  />
                  <FormControlLabel
                    value="usuario"
                    control={<Radio />}
                    label="Usuário Específico"
                  />
                </RadioGroup>
              </FormControl>

              {tipoDestinatario === 'grupo' ? (
                <FormControl fullWidth>
                  <InputLabel>Grupo</InputLabel>
                  <Select
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value)}
                    label="Grupo"
                  >
                    <MenuItem value="usuarios">Usuários</MenuItem>
                    <MenuItem value="responsaveis">Responsáveis</MenuItem>
                    <MenuItem value="administradores">Administradores</MenuItem>
                    <MenuItem value="todos">Todos</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Usuário</InputLabel>
                  <Select
                    value={usuarioSelecionado}
                    onChange={(e) => setUsuarioSelecionado(e.target.value)}
                    label="Usuário"
                  >
                    <ListSubheader>Usuários</ListSubheader>
                    {usuarios
                      .filter((u) => u.role === 'Usuario')
                      .map((usuario) => (
                        <MenuItem key={usuario.firebaseId} value={usuario.firebaseId}>
                          {usuario.name}
                        </MenuItem>
                      ))}
                    <ListSubheader>Responsáveis</ListSubheader>
                    {usuarios
                      .filter((u) => u.role === 'Responsavel')
                      .map((usuario) => (
                        <MenuItem key={usuario.firebaseId} value={usuario.firebaseId}>
                          {usuario.name}
                        </MenuItem>
                      ))}
                    <ListSubheader>Administradores</ListSubheader>
                    {usuarios
                      .filter((u) => u.role === 'Administrador')
                      .map((usuario) => (
                        <MenuItem key={usuario.firebaseId} value={usuario.firebaseId}>
                          {usuario.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="info">Informação</MenuItem>
                  <MenuItem value="success">Sucesso</MenuItem>
                  <MenuItem value="warning">Alerta</MenuItem>
                  <MenuItem value="error">Erro</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                fullWidth
              />

              <TextField
                label="Conteúdo"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Enviando...' : 'Enviar Notificação'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
} 