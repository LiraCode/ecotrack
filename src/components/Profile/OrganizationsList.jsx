'use client'
import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Business,
  LocationOn,
  Edit,
  ExpandMore,
  ExpandLess,
  Info,
  Recycling
} from '@mui/icons-material';
import EditEcoPointDialog from './EditEcoPointDialog';

export default function OrganizationsList({ 
  organizations, 
  onRefresh,
  loading 
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEcoPointId, setSelectedEcoPointId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é dispositivo móvel
  useState(() => {
    setIsMobile(window.innerWidth < 600);
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEditEcoPoint = (id) => {
    setSelectedEcoPointId(id);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedEcoPointId(null);
    // Atualizar a lista de ecopontos após edição
    if (onRefresh) onRefresh();
  };

  return (
    <Box>
      {organizations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Business sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Nenhuma organização encontrada.
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {organizations.map((org, index) => (
            <Box key={org._id}>
              {index > 0 && <Divider component="li" sx={{ my: 1 }} />}
              <Paper 
                elevation={1} 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#2e7d32',
                        width: 50,
                        height: 50,
                        mr: 1
                      }}
                    >
                      <Business />
                    </Avatar>
                  </ListItemAvatar>
                                    <ListItemText
                    primary={
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {org.name}
                      </Typography>
                    }
                    secondary={
                      <Typography component="div" variant="body2" color="text.secondary">
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <LocationOn fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" component="span">
                              {org.address ? 
                                `${org.address.street}, ${org.address.number} - ${org.address.neighborhood}, ${org.address.city}/${org.address.state}` : 
                                'Endereço não informado'}
                            </Typography>
                          </Box>
                          
                          {org.cnpj && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              CNPJ: {org.cnpj}
                            </Typography>
                          )}
                          
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              size="small" 
                              label={`${org.typeOfWasteId?.length || 0} tipos de resíduos`}
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                          </Box>
                        </Box>
                      </Typography>
                    }
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Editar ecoponto">
                      <IconButton 
                        edge="end" 
                        aria-label="editar"
                        onClick={() => handleEditEcoPoint(org._id)}
                        sx={{ 
                          color: '#2e7d32',
                          '&:hover': {
                            backgroundColor: '#e8f5e9'
                          },
                          mr: 1
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={expandedId === org._id ? "Ocultar detalhes" : "Ver detalhes"}>
                      <IconButton 
                        edge="end" 
                        aria-label="ver detalhes"
                        onClick={() => handleToggleDetails(org._id)}
                        sx={{ 
                          color: '#2e7d32',
                          '&:hover': {
                            backgroundColor: '#e8f5e9'
                          }
                        }}
                      >
                        {expandedId === org._id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                
                {/* Detalhes expandidos */}
                <Collapse in={expandedId === org._id} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 3, bgcolor: '#f9f9f9', borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#2e7d32' }}>
                      Detalhes do Ecoponto
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {org.description && (
                        <Grid item xs={12}>
                          <Card variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                <Info fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Descrição
                              </Typography>
                              <Typography variant="body2">
                                {org.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                      
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                              Endereço Completo
                            </Typography>
                            {org.address ? (
                              <>
                                <Typography variant="body2">
                                  {org.address.street}, {org.address.number}
                                </Typography>
                                {org.address.complement && (
                                  <Typography variant="body2">
                                    {org.address.complement}
                                  </Typography>
                                )}
                                <Typography variant="body2">
                                  {org.address.neighborhood}, {org.address.city}/{org.address.state}
                                </Typography>
                                <Typography variant="body2">
                                  CEP: {org.address.zipCode}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Endereço não informado
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              <Recycling fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                              Tipos de Resíduos Aceitos
                            </Typography>
                            {org.typeOfWasteId && org.typeOfWasteId.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {org.typeOfWasteId.map(waste => (
                                  <Chip 
                                    key={waste._id} 
                                    label={waste.type} 
                                    size="small" 
                                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Nenhum tipo de resíduo especificado
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEditEcoPoint(org._id)}
                        sx={{
                          borderColor: '#2e7d32',
                          color: '#2e7d32',
                          '&:hover': {
                            borderColor: '#1b5e20',
                            backgroundColor: '#f1f8e9',
                          },
                        }}
                      >
                        Editar Ecoponto
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </Paper>
            </Box>
          ))}
        </List>
      )}
      
      {/* Diálogo de edição de ecoponto */}
      <EditEcoPointDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        ecoPointId={selectedEcoPointId}
        isMobile={isMobile}
      />
    </Box>
  );
}