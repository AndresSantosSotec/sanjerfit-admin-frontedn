
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';

const PrizeDelivery = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Demo data for prizes
  const prizes = [
    { id: 1, name: 'Audífonos Bluetooth', image: '/placeholder.svg', cost: 500 },
    { id: 2, name: 'Gorra SanjerFit', image: '/placeholder.svg', cost: 200 },
    { id: 3, name: 'Vitaminas (30 días)', image: '/placeholder.svg', cost: 350 },
    { id: 4, name: 'Chaqueta Deportiva', image: '/placeholder.svg', cost: 800 },
  ];
  
  const handlePrizeDelivery = (prizeId: number) => {
    toast({
      title: "Premio registrado",
      description: "La entrega del premio ha sido registrada correctamente",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Entrega de Premios" 
        subtitle="Registra la entrega de premios a los colaboradores"
      />
      
      <div className="p-6 flex-1">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Nombre Completo:</h3>
              <div className="relative">
                <Input 
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Monedas Disponibles:</h3>
              <Input type="text" value="1,250 CoinFits" disabled />
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Premios a Canjear</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {prizes.map((prize) => (
            <Card key={prize.id} className="overflow-hidden">
              <div className="h-40 bg-sanjer-lightgray flex items-center justify-center">
                <img 
                  src={prize.image} 
                  alt={prize.name}
                  className="h-32 object-contain"
                />
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold mb-2">{prize.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">{prize.cost} CoinFits</p>
                <Button 
                  onClick={() => handlePrizeDelivery(prize.id)}
                  className="w-full bg-sanjer-green hover:bg-green-600"
                >
                  Registrar Premio
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Registro de Premios</h3>
          
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-sanjer-gray">
                <tr>
                  <th className="px-6 py-3">Premio</th>
                  <th className="px-6 py-3">Colaborador</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">CoinFits</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { prize: "Vitaminas (30 días)", employee: "Carlos Mendez", date: "16/05/2025", coins: 350 },
                  { prize: "Gorra SanjerFit", employee: "Mariana López", date: "15/05/2025", coins: 200 },
                  { prize: "Audífonos Bluetooth", employee: "Roberto Sánchez", date: "14/05/2025", coins: 500 },
                ].map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-6 py-4">{item.prize}</td>
                    <td className="px-6 py-4">{item.employee}</td>
                    <td className="px-6 py-4">{item.date}</td>
                    <td className="px-6 py-4">{item.coins}</td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Imprimiendo recibo..." })}>
                        Imprimir recibo
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizeDelivery;
