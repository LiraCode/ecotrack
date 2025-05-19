import { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  AccountCircle, 
  Settings, 
  ExitToApp, 
  Person
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import EditProfileDialog from '../Profile/EditProfileDialog';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    handleMenuClose();
    setOpenProfileDialog(true);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <>
      <IconButton
        edge="end"
        color="inherit"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenuOpen}
      >
        <AccountCircle />
      </IconButton>
      
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {user && (
          <MenuItem disabled>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={user.displayName || 'Usuário'} 
              secondary={user.email} 
            />
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleEditProfile}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Editar Perfil" />
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </MenuItem>
      </Menu>
      
      {/* Diálogo de Edição de Perfil */}
      <EditProfileDialog
        open={openProfileDialog}
        onClose={() => setOpenProfileDialog(false)}
        isMobile={isMobile}
      />
    </>
  );
}