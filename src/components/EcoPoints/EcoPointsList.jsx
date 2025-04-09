import React from 'react';
import EcoPointItem from './EcoPointItem';

const EcoPointsList = ({ points, activeMarker, onMarkerClick }) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-md">
      {points.map((point, index) => (
        <div key={index}>
          <EcoPointItem 
            point={point} 
            isActive={activeMarker === point.name}
            onClick={() => onMarkerClick(point)}
            isLast={index === points.length - 1}
          />
          {index < points.length - 1 && (
            <div className="mx-2 bg-gray-200 h-px" />
          )}
        </div>
      ))}
    </div>
  );
};

export default EcoPointsList;
