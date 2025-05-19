import React from 'react';
import EcoPointItem from './EcoPointItem';

const EcoPointsList = ({ points, activeMarker, onMarkerClick }) => {
  // Garantir que points é um array
  const safePoints = Array.isArray(points) ? points : [];
  
  if (safePoints.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Nenhum ecoponto encontrado.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-4">
      {safePoints.map((point, index) => (
        <div key={index}>
          <EcoPointItem 
            point={point} 
            isActive={activeMarker === point.name}
            onClick={() => onMarkerClick(point)}
            isLast={index === safePoints.length - 1}
          />
          {index < safePoints.length - 1 && (
            <div className="my-2 bg-gray-200 h-px" />
          )}
        </div>
      ))}
    </div>
  );
};

export default EcoPointsList;
