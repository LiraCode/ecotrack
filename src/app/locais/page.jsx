'use client';
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, Divider } from '@mui/material';
import dynamic from 'next/dynamic';
//import { useRef, useState } from 'react';
import { useRef, useState, useEffect } from 'react';
import Header from '@/components/header/page';
import Sidebar from '@/components/Sidebar';

const MapWithNoSSR = dynamic(
  () => import('@/components/Map/page'),
  { 
    ssr: false,
    loading: () => <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#4caf50'
    }}>
      Carregando mapa...
    </Box>
  }
);

export default function LocaisPage() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null); // Adicionando a referência para o container do mapa
  const [activeMarker, setActiveMarker] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);


  // Ecopontos oficiais de Maceió com coordenadas mais precisas
  const collectionPoints = [
    { 
      name: "Ecoponto - Pajuçara", 
      lat: -9.661687, 
      lng: -35.713437, 
      address: "Rua Campos Teixeira, n°476",
      region: "Pajuçara"
    },
    { 
      name: "Ecoponto - Tabuleiro", 
      lat: -9.593063, 
      lng: -35.768438, 
      address: "Rua Botafogo, por trás do Posto de Saúde Dr. Ib Gatto Falcão",
      region: "Tabuleiro do Martins"
    },
    { 
      name: "Ecoponto - Vergel", 
      lat: -9.660438, 
      lng: -35.761063, 
      address: "Av. Governador Teobaldo Barbosa – Vergel do Lago",
      region: "Vergel do Lago"
    },
    { 
      name: "Ecoponto - Santa Lúcia", 
      lat: -9.583938, 
      lng: -35.750563, 
      address: "Avenida Oswaldo Ramos, 912 - Jardim Petrópolis",
      region: "Jardim Petrópolis"
    },
    { 
      name: "Ecoponto - Gruta de Lourdes", 
      lat: -9.617938, 
      lng: -35.734313, 
      address: "Rua Antônio Menezes de Araújo Lemos, 143 - Gruta de Lourdes",
      region: "Gruta de Lourdes"
    },
    { 
      name: "Ecoponto - Santa Maria", 
      lat: -9.539562, 
      lng: -35.791313, 
      address: "Av. Lourival Melo Mota, Conjunto Santa Maria, s/n – Cidade Universitária",
      region: "Cidade Universitária"
    },
    { 
      name: "Ecoponto - Feitosa", 
      lat: -9.628563, 
      lng: -35.717312, 
      address: "Rua André Cardoso Borba - 366/394 - Feitosa",
      region: "Feitosa"
    }
  ];

  const handleMarkerClick = (point) => {
    if (mapRef.current) {
      mapRef.current.flyTo([point.lat, point.lng], 16);
      setActiveMarker(point.name);
      
      // Rola a página para o container do mapa
      if (mapContainerRef.current) {
        mapContainerRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar */}
      {isClient && (
 /* <Box sx={{
    width: sidebarOpen ? '240px' : '100px',
    flexShrink: 0,
    transition: 'width 0.3s ease',
    overflow: 'hidden'
  }}>*/
<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//</Box>
)}


      {/* Main Content Area */}
      <Box sx={{ 
  flex: 1,
  marginLeft: sidebarOpen ? '240px' : '100px',
  transition: 'margin-left 0.3s ease',
        width: '100%',
        overflowX: 'hidden'
      }}>
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Conteúdo da página */}
        <Box sx={{ 
          p: 3,
          backgroundColor: '#f8f9fa',
          flex: 1,
          maxWidth: '1200px',
          mx: 'auto',
          boxSizing: 'border-box'
        }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: '#2e7d32',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}
          >
            Ecopontos por Maceió
          </Typography>
          
          {/* Container do mapa com ref */}
          <Box ref={mapContainerRef}>
            <Card 
              sx={{ 
                mb: 4,
                border: '2px solid #4caf50',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                width: '100%'
              }}
            >
              <CardContent sx={{ height: '500px' }}>
                <MapWithNoSSR 
                  ref={mapRef}
                  markers={collectionPoints} 
                  activeMarker={activeMarker}
                />
              </CardContent>
            </Card>
          </Box>
          
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: '#388e3c',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ 
              backgroundColor: '#4caf50', 
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem'
            }}>
              Ecopontos Oficiais
            </span>
          </Typography>
          
          <List sx={{ 
            width: '100%', 
            backgroundColor: 'white', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {collectionPoints.map((point, index) => (
              <Box key={index}>
                <ListItem 
                  component="button"
                  onClick={() => handleMarkerClick(point)}
                  sx={{
                    backgroundColor: activeMarker === point.name ? '#e8f5e9' : 'white',
                    '&:hover': {
                      backgroundColor: '#c8e6c9',
                      cursor: 'pointer'
                    },
                    py: 2,
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: '#4caf50',
                          mb: 0.5
                        }}
                      >
                        {point.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography 
                          component="span" 
                          display="block" 
                          variant="body2"
                          sx={{
                            color: '#616161'
                          }}
                        >
                          {point.address}
                        </Typography>
                        <Typography 
                          component="span" 
                          variant="caption"
                          sx={{
                            color: '#9e9e9e',
                            fontStyle: 'italic'
                          }}
                        >
                          {point.region}
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    borderRadius: '4px',
                    px: 1,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    Ver no mapa
                  </Box>
                </ListItem>
                {index < collectionPoints.length - 1 && (
                  <Divider sx={{ 
                    backgroundColor: '#e0e0e0',
                    mx: 2
                  }} />
                )}
              </Box>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
}