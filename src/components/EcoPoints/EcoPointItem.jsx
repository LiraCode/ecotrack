import React from 'react';

const EcoPointItem = ({ point, isActive, onClick, isLast }) => {
  return (
    <button
      onClick={onClick}
      className={`py-4 px-4 w-full text-left flex justify-between items-center ${
        isActive ? 'bg-green-50' : 'bg-white'
      } hover:bg-green-100 transition-colors duration-200`}
    >
      <div>
        <h3 className="font-bold text-green-600 mb-1">{point.name}</h3>
        <p className="text-gray-700 text-sm">{point.address}</p>
        <span className="text-gray-400 text-xs italic">{point.region}</span>
      </div>
      <div className="bg-green-600 text-white rounded px-2 py-1 text-xs font-bold">
        Ver no mapa
      </div>
    </button>
  );
};

export default EcoPointItem;
