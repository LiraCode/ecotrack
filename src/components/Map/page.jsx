'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { forwardRef, useEffect } from 'react';

// Configuração dos ícones com CDN
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = forwardRef(({ markers, activeMarker }, ref) => {
    return (
      <MapContainer 
        center={[-9.62, -35.73]}  // Centro aproximado de Maceió
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '10px' }}
        ref={ref}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {markers.map((marker) => {
          const isActive = activeMarker === marker.name;
          return (
            <Marker 
              key={marker.name}
              position={[marker.lat, marker.lng]}
              eventHandlers={{
                click: () => console.log(`Marker clicked: ${marker.name}`),
              }}
              icon={isActive ? 
                new L.Icon({
                  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                  iconSize: [30, 46],
                  iconAnchor: [15, 46],
                  popupAnchor: [1, -34],
                  shadowSize: [46, 46],
                  className: 'active-marker'
                }) : 
                L.icon({
                  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                })
              }
            >
              <Popup>
                <div style={{ 
                  minWidth: '200px',
                  padding: '8px'
                }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0',
                    color: isActive ? '#1b5e20' : '#2e7d32',
                    fontSize: '16px',
                    fontWeight: isActive ? 'bold' : 'normal'
                  }}>
                    {marker.name}
                  </h3>
                  <p style={{ 
                    margin: '4px 0',
                    color: '#616161',
                    fontSize: '14px'
                  }}>
                    {marker.address}
                  </p>
                  <p style={{ 
                    margin: '4px 0 0 0',
                    color: '#9e9e9e',
                    fontSize: '12px',
                    fontStyle: 'italic'
                  }}>
                    {marker.region}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    );
  });

Map.displayName = 'Map';

export default Map;