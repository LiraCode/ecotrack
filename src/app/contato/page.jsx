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
  Stack
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
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Entre em Contato
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <FormControl fullWidth margin="normal">
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Selecione um Ecoponto</InputLabel>
              <Select
                value={formData.ecoponto}
                label="Selecione um Ecoponto"
                required
                onChange={(e) => setFormData({ ...formData, ecoponto: e.target.value })}
              >
                {loadingEcopontos ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> Carregando ecopontos...
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
              <Card variant="outlined" sx={{ mt: 2, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedEcoponto.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedEcoponto.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Endereço
                      </Typography>
                      <Typography variant="body2">
                        {formatAddress(selectedEcoponto.address)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Tipos de Resíduos Aceitos
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                        {selectedEcoponto.typeOfWasteId.map((waste) => (
                          <Chip 
                            key={waste._id}
                            label={waste.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Grid>

                    {selectedEcoponto.responsableId?.phone && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
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
          margin="normal"
          required
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        />
        
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <TextField
          fullWidth
          label="Mensagem"
          multiline
          rows={4}
          margin="normal"
          required
          value={formData.mensagem}
          onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </Box>
    </Container>
    </AppLayout>
  );
} 