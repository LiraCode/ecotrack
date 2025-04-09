'use client';
import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/Layout/page';
import EcoPointsList from '@/components/EcoPoints/EcoPointsList';
import PageTitle from '@/components/UI/PageTitle';
import MapContainer from '@/components/EcoPoints/MapContainer';
import { ecoPointsData } from '@/data/ecoPointsData';

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

  useEffect(() => {
    setIsClient(true);
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
              markers={ecoPointsData} 
              activeMarker={activeMarker}
            />
          )}
        </MapContainer>
        
        <div className="flex justify-center mb-6">
          <span className="bg-green-600 text-white py-2 px-4 rounded-full text-sm font-bold">
            Ecopontos Oficiais
          </span>
        </div>
        
        <EcoPointsList 
          points={ecoPointsData} 
          activeMarker={activeMarker} 
          onMarkerClick={handleMarkerClick} 
        />
      </div>
    </AppLayout>
  );
}