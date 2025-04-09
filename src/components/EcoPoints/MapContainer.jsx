import React, { forwardRef } from 'react';

const MapContainer = forwardRef(({ children }, ref) => {
  return (
    <div ref={ref}>
      <div className="mb-8 border-2 border-green-600 rounded-xl shadow-lg shadow-green-200/50 w-full">
        <div className="h-[500px]">
          {children}
        </div>
      </div>
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
