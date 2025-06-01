'use client';
import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/Layout/page';
import EcoPointsList from '@/components/EcoPoints/EcoPointsList';
import PageTitle from '@/components/ui/PageTitle';
import MapContainer from '@/components/EcoPoints/MapContainer';
import { Box, Container, Typography, Paper, Chip, useTheme, useMediaQuery } from '@mui/material';
import { LocationOn as LocationOnIcon } from '@mui/icons-material';

const MapWithNoSSR = dynamic(
  () => import('@/components/Map/page'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center text-green-600">
        Carregando mapa...
      </div>
    )
  }
);

export default function LocaisPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [ecoPoints, setEcoPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch ecopoints from MongoDB
  useEffect(() => {
    const fetchEcoPoints = async () => {
      try {
        const response = await fetch('/api/collection-points/ecopoints');
        
        if (!response.ok) {
          throw new Error('Falha ao buscar ecopontos');
        }
        
        const data = await response.json();
        const ecopointsArray = data.ecopoints || [];
        
        const formattedEcoPoints = ecopointsArray
          .filter(point => {
            const hasLat = point.lat;
            const hasLng = point.lng;
            return hasLat && hasLng;
          })
          .map(point => ({
            id: point._id,
            name: point.name,
            lat: point.lat || (point.location?.coordinates ? point.location.coordinates[1] : null),
            lng: point.lng || (point.location?.coordinates ? point.location.coordinates[0] : null),
            address: point.address?.street 
              ? `${point.address.street}, ${point.address.number}` 
              : 'Endereço não disponível',
            region: point.address?.neighborhood || 'Região não especificada'
          }));
        
        setEcoPoints(formattedEcoPoints);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar ecopontos:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEcoPoints();
  }, []);

  const handleMarkerClick = (ecoPoint) => {
    if (mapRef.current && ecoPoint && ecoPoint.lat && ecoPoint.lng) {
      mapRef.current.flyTo([ecoPoint.lat, ecoPoint.lng], 16);
      setActiveMarker(ecoPoint.name);
      
      if (mapContainerRef.current) {
        mapContainerRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  if (!isClient) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <PageTitle title="Ecopontos por Maceió" />
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <Typography sx={{ ml: 2, color: 'text.secondary' }}>Carregando...</Typography>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageTitle title="Ecopontos por Maceió" />
        
        <MapContainer ref={mapContainerRef}>
          {isClient && (
            <MapWithNoSSR 
              ref={mapRef}
              markers={loading ? [] : ecoPoints} 
              activeMarker={activeMarker}
            />
          )}
        </MapContainer>
        
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Chip
            label="Lista de Ecopontos Parceiros"
            color="primary"
            sx={{
              bgcolor: '#2e8b57',
              color: 'white',
              fontSize: '1rem',
              py: 2,
              px: 3,
              '& .MuiChip-label': {
                px: 2
              }
            }}
          />
        </Box>
        
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            mb: 4
          }}
        >
          <Box sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                <Typography sx={{ ml: 2, color: 'text.secondary' }}>
                  Carregando ecopontos...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                <Typography color="error">
                  Erro ao carregar ecopontos: {error}
                </Typography>
              </Box>
            ) : (
              <EcoPointsList 
                points={ecoPoints} 
                activeMarker={activeMarker} 
                onMarkerClick={handleMarkerClick} 
              />
            )}
          </Box>
        </Paper>
      </Container>
    </AppLayout>
  );
}