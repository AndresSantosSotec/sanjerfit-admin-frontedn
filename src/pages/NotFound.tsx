
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sanjer-gray">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-sanjer-blue">404</h1>
        <h2 className="text-3xl font-semibold mt-6 mb-6">Página no encontrada</h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Button asChild className="bg-sanjer-blue hover:bg-blue-700">
          <Link to="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
