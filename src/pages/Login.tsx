import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SanjerLogo from '@/components/SanjerLogo';

const Login = () => {
  const [email, setEmail] = useState('');           // renombrado
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const resp = await axios.post(
        import.meta.env.VITE_API_URL + '/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { token, user } = resp.data;
      // Guarda en localStorage para usarlo en futuras peticiones
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.name}`,
      });

      navigate('/dashboard');
    } catch (err: any) {
      toast({
        title: "Error de inicio de sesión",
        description:
          err.response?.data?.message ||
          err.response?.data?.errors?.email?.[0] ||
          "Credenciales inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sanjer-blue">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-8">
          <SanjerLogo className="w-48" />
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
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
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full"
              required
            />
          </div>
          
          <div className="text-center text-sm">
            <button 
              type="button" 
              onClick={() => toast({ title: "Funcionalidad en desarrollo" })}
              className="text-sanjer-blue hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
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
