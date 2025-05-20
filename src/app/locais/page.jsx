'use client';
import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/Layout/page';
import EcoPointsList from '@/components/EcoPoints/EcoPointsList';
import PageTitle from '@/components/ui/PageTitle';
import MapContainer from '@/components/EcoPoints/MapContainer';

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
        
        // Get ecopoints array from response
        const ecopointsArray = data.ecopoints || [];
        
        // Format data to match the expected structure
        const formattedEcoPoints = ecopointsArray
          .filter(point => {
            // Filter points without valid coordinates
            const hasLat = point.lat || (point.location?.coordinates && point.location.coordinates[1]);
            const hasLng = point.lng || (point.location?.coordinates && point.location.coordinates[0]);
            return hasLat && hasLng;
          })
          .map(point => ({
            name: point.name,
            lat: point.lat || point.location.coordinates[1],
            lng: point.lng || point.location.coordinates[0],
            address: point.address?.street 
              ? `${point.address.street}, ${point.address.number}` 
              : 'Endereço não disponível',
            region: point.address?.neighborhood || 'Região não especificada',
            id: point._id
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

  const handleMarkerClick = (point) => {
    if (mapRef.current) {
      mapRef.current.flyTo([point.lat, point.lng], 16);
      setActiveMarker(point.name);
      
      if (mapContainerRef.current) {
        mapContainerRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <AppLayout>
      <div className="p-3 bg-gray-50 flex-1 max-w-6xl mx-auto box-border w-full">
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
        
        <div className="flex justify-center mb-6">
          <span className="bg-green-600 text-white py-2 px-4 rounded-full text-sm font-bold">
            Ecopontos Oficiais
          </span>
        </div>
        
        {/* Render the EcoPointsList directly, just like in the original code */}
        <EcoPointsList 
          points={loading ? [] : ecoPoints} 
          activeMarker={activeMarker} 
          onMarkerClick={handleMarkerClick} 
        />
        
        {/* Show loading indicator if needed */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Carregando ecopontos...</p>
          </div>
        )}
        
        {/* Show error if needed */}
        {error && (
          <div className="text-center py-4 text-red-600">
            Erro ao carregar ecopontos: {error}
          </div>
        )}
      </div>
    </AppLayout>
  );
}