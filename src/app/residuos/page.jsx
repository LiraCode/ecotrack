'use client';

import AppLayout from '@/components/Layout/page';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { getAllWasteTypes } from '@/services/wasteService';

export default function WasteTypesPage() {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch waste types on component mount
  useEffect(() => {
    const fetchWasteTypes = async () => {
      setLoading(true);
      try {
        const result = await getAllWasteTypes();
        if (result.success) {
          setWasteTypes(result.wasteTypes);
        } else {
          setError(result.error || 'Erro ao carregar tipos de resíduos');
        }
      } catch (error) {
        console.error('Error fetching waste types:', error);
        setError('Erro ao carregar tipos de resíduos');
      } finally {
        setLoading(false);
      }
    };

    fetchWasteTypes();
  }, []);

  // Get icon for waste type
  const getWasteIcon = (type) => {
    const typeLC = type.toLowerCase();
    if (typeLC.includes('metal')) return '🔧';
    if (typeLC.includes('plástico')) return '♻️';
    if (typeLC.includes('papel')) return '📄';
    if (typeLC.includes('vidro')) return '🥛';
    if (typeLC.includes('orgânico')) return '🍎';
    if (typeLC.includes('eletrônico')) return '💻';
    return '🗑️';
  };

  return (
    <AppLayout>
      <div className="lg:ml-[110px] lg:mr-[0px] lg:mt-0 mt-16 flex flex-col  max-w-90vh h-95vh">
         <Box sx={{ 
        width: '100%', 
        maxWidth: '1600px', 
        mx: 'auto', 
        px: { xs: 2, sm: 3 }, 
        py: 3 
      }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, color: '#2e7d32', fontWeight: 'bold' }}>
          Tipos de Resíduos Aceitos
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="body1" paragraph>
            Conheça os diferentes tipos de resíduos que podem ser descartados em nossos Eco Pontos ou 
            agendados para coleta. O descarte correto é fundamental para o sucesso da reciclagem e 
            para a preservação do meio ambiente.
          </Typography>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress color="success" />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : wasteTypes.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Nenhum tipo de resíduo cadastrado no momento.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {wasteTypes.map((waste) => (
              <Grid item xs={12} sm={6} md={4} key={waste._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h2" component="span" sx={{ mr: 2, color: '#2e7d32' }}>
                        {getWasteIcon(waste.type)}
                      </Typography>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                        {waste.type}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {waste.description || 'Nenhuma descrição disponível.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#2e7d32', fontWeight: 'bold' }}>
            Dicas para Separação de Resíduos
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>O que fazer:</Typography>
                <ul>
                  <li>Lave as embalagens antes de descartar</li>
                  <li>Separe os materiais por tipo</li>
                  <li>Remova rótulos e tampas quando possível</li>
                  <li>Amasse papéis e papelões para ocupar menos espaço</li>
                  <li>Verifique se o material está seco antes de descartar</li>
                </ul>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>O que não fazer:</Typography>
                <ul>
                  <li>Misturar resíduos orgânicos com recicláveis</li>
                  <li>Descartar materiais sujos ou com restos de alimentos</li>
                  <li>Colocar materiais cortantes sem proteção</li>
                  <li>Descartar pilhas e baterias junto com outros materiais</li>
                  <li>Misturar diferentes tipos de plásticos</li>
                </ul>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        </Box>
      </div>
    </AppLayout>
  );
}