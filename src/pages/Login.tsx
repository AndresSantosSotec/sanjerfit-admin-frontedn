
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SanjerLogo from '@/components/SanjerLogo';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login authentication
    setTimeout(() => {
      if (username && password) {
        // Normally would validate with backend
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al panel de administración",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: "Por favor ingrese usuario y contraseña válidos",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sanjer-blue">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-8">
          <SanjerLogo className="w-48" />
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario / Correo</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              className="w-full"
              required
            />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-center w-full">
              <button 
                type="button" 
                onClick={() => toast({ title: "Funcionalidad en desarrollo" })}
                className="text-sanjer-blue hover:underline"
              >
                Recordar | Recuperar Contraseña
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-sanjer-green hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
