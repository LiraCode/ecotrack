import React from 'react';

const CardTitle = ({ title }) => {
  return (
    <h1 className="font-bold mb-6 text-green-700 dark:text-green-400 text-left uppercase text-2xl md:text-3xl">
      {title}
    </h1>
  );
};

export default CardTitle;
