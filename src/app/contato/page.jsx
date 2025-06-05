'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Card,
  CardContent,
  Grid,
  Divider,
  CircularProgress,
  Chip,
  Stack,
  Paper
} from '@mui/material';
import AppLayout from '@/components/Layout/page';

const formatAddress = (address) => {
  const parts = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    `${address.city} - ${address.state}`,
    `CEP: ${address.zipCode}`
  ].filter(Boolean);
  return parts.join(', ');
};

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    ecoponto: '',
    mensagem: '',
    tipoContato: 'ecoponto'
  });

  const [loading, setLoading] = useState(false);
  const [ecopontos, setEcopontos] = useState([]);
  const [loadingEcopontos, setLoadingEcopontos] = useState(true);

  // Buscar lista de ecopontos quando a página carregar
  useEffect(() => {
    const fetchEcopontos = async () => {
      try {
        setLoadingEcopontos(true);
        const response = await fetch('/api/collection-points');
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          // Ordenar ecopontos por nome
          const sortedEcopontos = data.sort((a, b) => a.name.localeCompare(b.name));
          setEcopontos(sortedEcopontos);
        }
      } catch (error) {
        console.error('Erro ao carregar ecopontos:', error);
      } finally {
        setLoadingEcopontos(false);
      }
    };
    fetchEcopontos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Mensagem enviada com sucesso!');
        setFormData({
          nome: '',
          email: '',
          ecoponto: '',
          mensagem: '',
          tipoContato: 'ecoponto'
        });
      } else {
        throw new Error('Erro ao enviar mensagem');
      }
    } catch (error) {
      alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const selectedEcoponto = ecopontos.find(ep => ep._id === formData.ecoponto);

  return (
    <AppLayout>
    <Container 
      maxWidth={false} 
      sx={{ 
        py: 8, 
        maxWidth: '90vw !important',
        minHeight: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: '800px',
          backgroundColor: 'transparent'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 4,
            fontWeight: 600,
            color: '#08B75B'
          }}
        >
          Entre em Contato
        </Typography>
        
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            mt: 4,
            '& .MuiTextField-root, & .MuiFormControl-root': {
              mb: 2.5
            }
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Tipo de Contato</InputLabel>
            <Select
              value={formData.tipoContato}
              label="Tipo de Contato"
              required
              onChange={(e) => setFormData({ ...formData, tipoContato: e.target.value, ecoponto: e.target.value === 'admin' ? '' : formData.ecoponto })}
            >
              <MenuItem value="ecoponto">Contato com Ecoponto</MenuItem>
              <MenuItem value="admin">Contato com Administração</MenuItem>
            </Select>
          </FormControl>

          {formData.tipoContato === 'ecoponto' && (
            <>
              <FormControl fullWidth>
                <InputLabel>Selecione um Ecoponto</InputLabel>
                <Select
                  value={formData.ecoponto}
                  label="Selecione um Ecoponto"
                  required
                  onChange={(e) => setFormData({ ...formData, ecoponto: e.target.value })}
                >
                  {loadingEcopontos ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }}/> Carregando ecopontos...
                    </MenuItem>
                  ) : (
                    ecopontos.map((ecoponto) => (
                      <MenuItem key={ecoponto._id} value={ecoponto._id}>
                        {ecoponto.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {selectedEcoponto && (
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mt: 2, 
                    mb: 3,
                    border: '1px solid rgba(8, 183, 91, 0.2)',
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(8, 183, 91, 0.1)',
                      borderColor: 'rgba(8, 183, 91, 0.4)'
                    }
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        color: '#08B75B',
                        fontWeight: 600 
                      }}
                    >
                      {selectedEcoponto.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph
                      sx={{ mb: 2 }}
                    >
                      {selectedEcoponto.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: '#08B75B',
                            fontWeight: 600,
                            mb: 1 
                          }}
                        >
                          Endereço
                        </Typography>
                        <Typography variant="body2">
                          {formatAddress(selectedEcoponto.address)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: '#08B75B',
                            fontWeight: 600,
                            mb: 1 
                          }}
                        >
                          Tipos de Resíduos Aceitos
                        </Typography>
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          flexWrap="wrap" 
                          useFlexGap 
                          sx={{ gap: 1 }}
                        >
                          {selectedEcoponto.typeOfWasteId.map((waste) => (
                            <Chip 
                              key={waste._id}
                              label={waste.type}
                              size="small"
                              sx={{
                                borderColor: '#08B75B',
                                color: '#08B75B',
                                '&:hover': {
                                  backgroundColor: 'rgba(8, 183, 91, 0.1)'
                                }
                              }}
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Grid>

                      {selectedEcoponto.responsableId?.phone && (
                        <Grid item xs={12} sm={6}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              color: '#08B75B',
                              fontWeight: 600,
                              mb: 1 
                            }}
                          >
                            Telefone
                          </Typography>
                          <Typography variant="body2">
                            {selectedEcoponto.responsableId.phone}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <TextField
            fullWidth
            label="Nome"
            required
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#08B75B'
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#08B75B'
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#08B75B'
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#08B75B'
              }
            }}
          />

          <TextField
            fullWidth
            label="Mensagem"
            multiline
            rows={4}
            required
            value={formData.mensagem}
            onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#08B75B'
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#08B75B'
              }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              bgcolor: '#08B75B',
              '&:hover': {
                bgcolor: '#069c4b'
              },
              height: '48px',
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </Box>
      </Paper>
    </Container>
    </AppLayout>
  );
} 