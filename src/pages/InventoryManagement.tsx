
import React, { useState } from 'react';
import { Plus, Minus, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';

interface Prize {
  id: number;
  name: string;
  image: string;
  cost: number;
  stock: number;
}

const InventoryManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [newPrize, setNewPrize] = useState({
    name: '',
    cost: '',
    stock: ''
  });
  
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: 1, name: 'Audífonos Bluetooth', image: '/placeholder.svg', cost: 500, stock: 15 },
    { id: 2, name: 'Gorra SanjerFit', image: '/placeholder.svg', cost: 200, stock: 42 },
    { id: 3, name: 'Vitaminas (30 días)', image: '/placeholder.svg', cost: 350, stock: 20 },
    { id: 4, name: 'Chaqueta Deportiva', image: '/placeholder.svg', cost: 800, stock: 8 },
    { id: 5, name: 'Botella Deportiva', image: '/placeholder.svg', cost: 150, stock: 26 },
    { id: 6, name: 'Mochila Gym', image: '/placeholder.svg', cost: 400, stock: 12 },
    { id: 7, name: 'Smartwatch', image: '/placeholder.svg', cost: 1200, stock: 5 },
    { id: 8, name: 'Toalla Fitness', image: '/placeholder.svg', cost: 100, stock: 30 },
  ]);
  
  const handleUpdateStock = (id: number, increment: boolean) => {
    setPrizes(prizes.map(prize => {
      if (prize.id === id) {
        return {
          ...prize,
          stock: increment ? prize.stock + 1 : Math.max(0, prize.stock - 1)
        };
      }
      return prize;
    }));
    
    toast({
      title: "Stock actualizado",
      description: increment ? "Se ha añadido una unidad al inventario" : "Se ha removido una unidad del inventario",
    });
  };
  
  const handleAddPrize = () => {
    const newId = Math.max(...prizes.map(p => p.id)) + 1;
    
    setPrizes([
      ...prizes,
      {
        id: newId,
        name: newPrize.name,
        image: '/placeholder.svg',
        cost: parseInt(newPrize.cost) || 0,
        stock: parseInt(newPrize.stock) || 0
      }
    ]);
    
    setNewPrize({
      name: '',
      cost: '',
      stock: ''
    });
    
    toast({
      title: "Premio añadido",
      description: "El nuevo premio ha sido agregado al inventario",
    });
  };
  
  const filteredPrizes = prizes.filter(prize => 
    prize.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Gestión de Inventario" 
        subtitle="Administra el inventario de premios disponibles"
      />
      
      <div className="p-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Input 
              type="text"
              placeholder="Buscar premio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-sanjer-green hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Nuevo Premio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Premio</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo premio para añadirlo al inventario.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Premio</Label>
                  <Input 
                    id="name"
                    value={newPrize.name}
                    onChange={(e) => setNewPrize({...newPrize, name: e.target.value})}
                    placeholder="Ej: Audífonos Bluetooth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo en CoinFits</Label>
                  <Input 
                    id="cost"
                    type="number"
                    value={newPrize.cost}
                    onChange={(e) => setNewPrize({...newPrize, cost: e.target.value})}
                    placeholder="Ej: 500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Inicial</Label>
                  <Input 
                    id="stock"
                    type="number"
                    value={newPrize.stock}
                    onChange={(e) => setNewPrize({...newPrize, stock: e.target.value})}
                    placeholder="Ej: 10"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleAddPrize}
                  disabled={!newPrize.name || !newPrize.cost}
                  className="bg-sanjer-green hover:bg-green-600"
                >
                  Añadir Premio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPrizes.map((prize) => (
            <Card key={prize.id} className="overflow-hidden">
              <div className="h-40 bg-sanjer-lightgray flex items-center justify-center">
                <img 
                  src={prize.image} 
                  alt={prize.name}
                  className="h-32 object-contain"
                />
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold mb-1">{prize.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{prize.cost} CoinFits</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">Stock: {prize.stock}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="icon"
                      variant="outline"
                      onClick={() => handleUpdateStock(prize.id, false)}
                      disabled={prize.stock <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon"
                      variant="outline"
                      onClick={() => handleUpdateStock(prize.id, true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredPrizes.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No se encontraron premios</h3>
            <p className="text-muted-foreground">Intenta con otra búsqueda o añade un nuevo premio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
