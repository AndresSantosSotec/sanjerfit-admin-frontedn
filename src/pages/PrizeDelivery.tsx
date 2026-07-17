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
  email: string;
}

const PrizeDelivery = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Premio | null>(null);
  const [deliverySuccess, setDeliverySuccess] = useState(false);
  const [prizes, setPrizes] = useState<Premio[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const fetchPrizes = useCallback(async () => {
    try {
      const res = await api.get<Paginated<Premio>>('/webadmin/premios');
      setPrizes(res.data.data.filter(p => p.is_active && p.stock > 0));
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudieron cargar los premios' });
    }
  }, [toast]);

  const fetchCollaborators = useCallback(async () => {
    try {
      const res = await api.get('/webadmin/colaborators');
      const mapped = (res.data as any[]).map(col => ({
        id: col.id,
        name: col.nombre,
        email: col.user?.email ?? '',
        coins: col.coin_fits ?? 0,
        level: col.nivel_asignado ?? 'KoalaFit',
      }));
      setCollaborators(mapped);
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudieron cargar los colaboradores' });
    }
  }, [toast]);

  useEffect(() => { fetchPrizes(); fetchCollaborators(); }, [fetchPrizes, fetchCollaborators]);
  
  const filteredCollaborators = searchTerm.length >= 2 ? 
    collaborators.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) : 
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
        fetchCollaborators();
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
      
      <div className="p-4 sm:p-6 flex-1 space-y-6">
        <div className="glass-card shadow-sm rounded-2xl p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Seleccionar Colaborador:</h3>
              <div className="relative">
                <Input 
                  type="text"
                  placeholder="Buscar por nombre o email (mín. 2 letras)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                
                {searchTerm.length >= 2 && (
                  <div className="absolute w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl z-10 overflow-hidden max-h-52 overflow-y-auto">
                    {filteredCollaborators.length > 0 ? filteredCollaborators.map(collaborator => (
                      <div 
                        key={collaborator.id}
                        className="px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center justify-between transition-colors text-slate-800 dark:text-slate-200 text-sm"
                        onClick={() => handleCollaboratorSelect(collaborator)}
                      >
                        <div>
                          <span className="font-medium">{collaborator.name}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">{collaborator.email}</span>
                        </div>
                        <span className="text-xs text-sanjer-green font-semibold">{collaborator.coins} CF</span>
                      </div>
                    )) : (
                      <div className="px-3 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">
                        No se encontraron colaboradores
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {selectedCollaborator ? (
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Colaborador Seleccionado:</h3>
                <div className="flex items-start space-x-4 p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-sanjer-blue to-sanjer-green rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{selectedCollaborator.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Nivel: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedCollaborator.level}</span>
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        CoinFits: <span className="font-semibold text-sanjer-green">{selectedCollaborator.coins}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Monedas Disponibles:</h3>
                <Input type="text" value="Seleccione un colaborador" disabled className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500" />
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Premios a Canjear</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {prizes.map((prize) => (
            <Card key={prize.id} className="glass-card shadow-sm rounded-2xl overflow-hidden border-slate-100 dark:border-slate-800">
              <div className="h-40 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                <img 
                  src={prize.image_url || prize.image_path || '/placeholder.svg'}
                  alt={prize.nombre}
                  className="h-32 object-contain"
                />
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{prize.nombre}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{prize.costo_fitcoins} CoinFits</p>
                <Button
                  onClick={() => handlePrizeDelivery(prize)}
                  className="w-full bg-sanjer-green hover:bg-green-600 text-white font-semibold rounded-xl text-sm"
                  disabled={!selectedCollaborator || selectedCollaborator.coins < prize.costo_fitcoins}
                >
                  Registrar Premio
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="glass-card shadow-sm rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Registro de Premios</h3>
          
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 dark:text-slate-500">
                  <th className="px-6 py-3 font-semibold">Premio</th>
                  <th className="px-6 py-3 font-semibold">Colaborador</th>
                  <th className="px-6 py-3 font-semibold">Fecha</th>
                  <th className="px-6 py-3 font-semibold">CoinFits</th>
                  <th className="px-6 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {[
                  { prize: "Vitaminas (30 días)", employee: "Carlos Mendez", date: "16/05/2025", coins: 350 },
                  { prize: "Gorra SanjerFit", employee: "Mariana López", date: "15/05/2025", coins: 200 },
                  { prize: "Audífonos Bluetooth", employee: "Roberto Sánchez", date: "14/05/2025", coins: 500 },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{item.prize}</td>
                    <td className="px-6 py-4">{item.employee}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 dark:text-slate-500">{item.date}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{item.coins}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="bg-white dark:bg-slate-800 border-slate-250 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => toast({ title: "Imprimiendo recibo..." })}>
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-100">Confirmar Entrega de Premio</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Por favor confirme la entrega del premio al colaborador.
            </DialogDescription>
          </DialogHeader>
          
          {deliverySuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-600">¡Entrega Exitosa!</h3>
            </div>
          ) : (
            <>
              {selectedCollaborator && selectedPrize && (
                <div className="py-4 space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-100">{selectedCollaborator.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        CoinFits actuales: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedCollaborator.coins}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                    <div className="w-10 h-10 bg-sanjer-green/10 rounded-xl flex items-center justify-center text-sanjer-green">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-100">{selectedPrize.nombre}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Costo: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedPrize.costo_fitcoins} CoinFits</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Después de esta operación, el colaborador tendrá <span className="font-bold text-sanjer-green">{selectedCollaborator.coins - selectedPrize.costo_fitcoins} CoinFits</span> disponibles.
                    </p>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setDeliveryDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-sanjer-green hover:bg-green-600 text-white" onClick={confirmDelivery}>
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
