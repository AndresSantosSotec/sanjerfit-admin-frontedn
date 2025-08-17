
import React, { useCallback, useEffect, useState } from 'react';
import { Search, Award, User, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';
import api from '@/api/client';
import { Paginated, Premio } from '@/types/premio';

interface Collaborator {
  id: number;
  name: string;
  coins: number;
  level: string;
}

const PrizeDelivery = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Premio | null>(null);
  const [deliverySuccess, setDeliverySuccess] = useState(false);
  const [prizes, setPrizes] = useState<Premio[]>([]);

  const fetchPrizes = useCallback(async () => {
    try {
      const res = await api.get<Paginated<Premio>>('/webadmin/premios');
      setPrizes(res.data.data.filter(p => p.is_active && p.stock > 0));
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudieron cargar los premios' });
    }
  }, [toast]);

  useEffect(() => { fetchPrizes(); }, [fetchPrizes]);
  
  // Demo data for collaborators
  const collaborators: Collaborator[] = [
    { id: 1, name: 'Ana Martínez', coins: 350, level: 'HalcónFit' },
    { id: 2, name: 'Carlos López', coins: 180, level: 'JaguarFit' },
    { id: 3, name: 'María Fernández', coins: 70, level: 'KoalaFit' },
  ];
  
  const filteredCollaborators = searchTerm ? 
    collaborators.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())) : 
    [];
  
  const handleCollaboratorSelect = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setSearchTerm('');
  };
  
  const handlePrizeDelivery = (prize: Premio) => {
    setSelectedPrize(prize);
    setDeliveryDialogOpen(true);
  };

  const confirmDelivery = async () => {
    if (!selectedPrize || !selectedCollaborator) return;
    try {
      await api.post(`/webadmin/premios/${selectedPrize.id}/deliver`, {
        collaborator_id: selectedCollaborator.id,
      });
      setDeliverySuccess(true);
      setTimeout(() => {
        setDeliverySuccess(false);
        setDeliveryDialogOpen(false);
        toast({
          title: 'Premio registrado',
          description: 'La entrega del premio ha sido registrada correctamente',
        });
        fetchPrizes();
      }, 2000);
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo registrar la entrega' });
    }
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
              <h3 className="text-lg font-semibold">Seleccionar Colaborador:</h3>
              <div className="relative">
                <Input 
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                
                {searchTerm && filteredCollaborators.length > 0 && (
                  <div className="absolute w-full mt-1 bg-white shadow-lg rounded-md border z-10">
                    {filteredCollaborators.map(collaborator => (
                      <div 
                        key={collaborator.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                        onClick={() => handleCollaboratorSelect(collaborator)}
                      >
                        <span>{collaborator.name}</span>
                        <span className="text-xs text-gray-500">{collaborator.level}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {selectedCollaborator ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Colaborador Seleccionado:</h3>
                <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-md">
                  <div className="w-12 h-12 bg-sanjer-blue rounded-full flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedCollaborator.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        Nivel: <span className="font-medium">{selectedCollaborator.level}</span>
                      </span>
                      <span className="text-sm text-gray-600">
                        CoinFits: <span className="font-medium">{selectedCollaborator.coins}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Monedas Disponibles:</h3>
                <Input type="text" value="Seleccione un colaborador" disabled />
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Premios a Canjear</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {prizes.map((prize) => (
            <Card key={prize.id} className="overflow-hidden">
              <div className="h-40 bg-sanjer-lightgray flex items-center justify-center">
                <img 
                  src={prize.image_url || prize.image_path || '/placeholder.svg'}
                  alt={prize.nombre}
                  className="h-32 object-contain"
                />
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold mb-2">{prize.nombre}</h4>
                <p className="text-sm text-muted-foreground mb-4">{prize.costo_fitcoins} CoinFits</p>
                <Button
                  onClick={() => handlePrizeDelivery(prize)}
                  className="w-full bg-sanjer-green hover:bg-green-600"
                  disabled={!selectedCollaborator || selectedCollaborator.coins < prize.costo_fitcoins}
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
      
      {/* Prize Delivery Dialog */}
      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Entrega de Premio</DialogTitle>
            <DialogDescription>
              Por favor confirme la entrega del premio al colaborador.
            </DialogDescription>
          </DialogHeader>
          
          {deliverySuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-600">¡Entrega Exitosa!</h3>
            </div>
          ) : (
            <>
              {selectedCollaborator && selectedPrize && (
                <div className="py-4">
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md mb-4">
                    <div className="w-10 h-10 bg-sanjer-blue rounded-full flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedCollaborator.name}</h4>
                      <span className="text-sm text-gray-600">
                        CoinFits actuales: <span className="font-medium">{selectedCollaborator.coins}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-medium">{selectedPrize.nombre}</h4>
                        <span className="text-sm text-gray-600">
                          Costo: <span className="font-medium">{selectedPrize.costo_fitcoins} CoinFits</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <p className="text-sm text-blue-800">
                        Después de esta operación, el colaborador tendrá <span className="font-bold">{selectedCollaborator.coins - selectedPrize.costo_fitcoins} CoinFits</span> disponibles.
                      </p>
                    </div>
                  </div>
                )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeliveryDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-sanjer-green hover:bg-green-600" onClick={confirmDelivery}>
                  Confirmar Entrega
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrizeDelivery;
