'use client';
import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '@/config/firebase/firebase';
import { Lock, Refresh, Email } from '@mui/icons-material';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Validação de senha
  const validatePassword = () => {
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    
    return true;
  };

  // Função para trocar a senha
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Limpar mensagens anteriores
    setError('');
    setSuccess('');
    
    // Validar senha
    if (!validatePassword()) return;
    
    try {
      setLoading(true);
      
      // Verificar se o usuário está autenticado
      const user = auth.currentUser;
      if (!user) {
        setError('Usuário não autenticado. Faça login novamente.');
        return;
      }
      
      // Reautenticar o usuário
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Atualizar a senha
      await updatePassword(user, newPassword);
      
      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setSuccess('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      
      // Tratar erros específicos
      if (error.code === 'auth/wrong-password') {
        setError('Senha atual incorreta');
      } else if (error.code === 'auth/weak-password') {
        setError('A nova senha é muito fraca');
      } else if (error.code === 'auth/requires-recent-login') {
        setError('Esta operação é sensível e requer autenticação recente. Faça login novamente.');
      } else {
        setError(`Erro ao alterar senha: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar email de redefinição de senha
  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const user = auth.currentUser;
      if (!user || !user.email) {
        setError('Email do usuário não disponível');
        return;
      }
      
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setSuccess(`Email de redefinição de senha enviado para ${user.email}`);
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      setError(`Erro ao enviar email de redefinição: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      {/* Mensagens de sucesso e erro */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: '#2e7d32' }}>
          <Lock sx={{ mr: 1 }} /> Alterar Senha
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Para alterar sua senha, insira sua senha atual e depois a nova senha.
        </Typography>
        
        <form onSubmit={handleChangePassword}>
          <TextField
            fullWidth
            type="password"
            label="Senha Atual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
          />
          
          <TextField
            fullWidth
            type="password"
            label="Nova Senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="new-password"
            helperText="A senha deve ter pelo menos 6 caracteres"
          />
          
          <TextField
            fullWidth
            type="password"
            label="Confirmar Nova Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="new-password"
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#2e7d32',
                '&:hover': {
                  backgroundColor: '#1b5e20',
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Alterando...
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: '#2e7d32' }}>
          <Email sx={{ mr: 1 }} /> Esqueceu a Senha?
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Se você esqueceu sua senha atual, podemos enviar um link de redefinição para seu email.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleResetPassword}
            disabled={loading || resetSent}
            sx={{
              borderColor: '#2e7d32',
              color: '#2e7d32',
              '&:hover': {
                borderColor: '#1b5e20',
                backgroundColor: '#f1f8e9',
              },
            }}
          >
            {resetSent ? 'Email Enviado' : 'Enviar Email de Redefinição'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}