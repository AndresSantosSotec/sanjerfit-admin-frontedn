import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Minus, Package, Image, Upload } from 'lucide-react';
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
import api from '@/api/client';
import { Paginated, Premio } from '@/types/premio';

const InventoryManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [newPrize, setNewPrize] = useState({
    nombre: '',
    costo_fitcoins: '',
    stock: '',
    image: null as File | null,
    imagePreview: ''
  });

  const [prizes, setPrizes] = useState<Premio[]>([]);

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedPrizeForImage, setSelectedPrizeForImage] = useState<Premio | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchPrizes = useCallback(async () => {
    try {
      const res = await api.get<Paginated<Premio>>('/webadmin/premios');
      setPrizes(res.data.data);
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudieron cargar los premios' });
    }
  }, [toast]);

  useEffect(() => { fetchPrizes(); }, [fetchPrizes]);
  
  const handleUpdateStock = async (id: number, increment: boolean) => {
    const prize = prizes.find(p => p.id === id);
    if (!prize) return;
    const newStock = increment ? prize.stock + 1 : Math.max(0, prize.stock - 1);
    try {
      await api.put(`/webadmin/premios/${id}`, { stock: newStock });
      toast({
        title: 'Stock actualizado',
        description: increment
          ? 'Se ha añadido una unidad al inventario'
          : 'Se ha removido una unidad del inventario',
      });
      fetchPrizes();
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo actualizar el stock' });
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPrize({
        ...newPrize,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };
  
  const handlePrizeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const savePrizeImage = async () => {
    if (selectedPrizeForImage && uploadedImage) {
      try {
        const form = new FormData();
        form.append('file', uploadedImage);
        const res = await api.post('/webadmin/files', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const path = res.data.path || res.data.image_path;
        await api.put(`/webadmin/premios/${selectedPrizeForImage.id}`, { image_path: path });
        toast({
          title: 'Imagen actualizada',
          description: 'La imagen del premio ha sido actualizada correctamente',
        });
        setShowImageDialog(false);
        setImagePreview('');
        setUploadedImage(null);
        fetchPrizes();
      } catch (e) {
        toast({ title: 'Error', description: 'No se pudo actualizar la imagen' });
      }
    }
  };

  const openImageUpload = (prize: Premio) => {
    setSelectedPrizeForImage(prize);
    setShowImageDialog(true);
    setImagePreview('');
  };
  
  const handleAddPrize = async () => {
    try {
      let imagePath = '';
      if (newPrize.image) {
        const form = new FormData();
        form.append('file', newPrize.image);
        const res = await api.post('/webadmin/files', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imagePath = res.data.path || res.data.image_path || '';
      }
      await api.post('/webadmin/premios', {
        nombre: newPrize.nombre,
        costo_fitcoins: parseInt(newPrize.costo_fitcoins) || 0,
        stock: parseInt(newPrize.stock) || 0,
        image_path: imagePath || undefined,
      });
      setNewPrize({ nombre: '', costo_fitcoins: '', stock: '', image: null, imagePreview: '' });
      toast({ title: 'Premio añadido', description: 'El nuevo premio ha sido agregado al inventario' });
      fetchPrizes();
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo agregar el premio' });
    }
  };

  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outofstock'>('all');

  const filteredPrizes = prizes.filter(prize => {
    const matchesSearch = prize.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(prize.costo_fitcoins).includes(searchTerm);
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'instock' && prize.stock > 0) ||
      (stockFilter === 'outofstock' && prize.stock === 0);
    return matchesSearch && matchesStock;
  });

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Gestión de Inventario" 
        subtitle="Administra el inventario de premios disponibles"
      />
      
      <div className="p-4 sm:p-6 flex-1 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-64">
            <Input 
              type="text"
              placeholder="Buscar premio o costo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'all' | 'instock' | 'outofstock')}
            className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-sanjer-green/50 transition-all text-sm"
          >
            <option value="all">Todos</option>
            <option value="instock">Con stock</option>
            <option value="outofstock">Agotados</option>
          </select>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-glow-green text-white font-semibold rounded-xl text-sm px-4 py-2 flex items-center gap-1.5 transition-all duration-200">
                <Plus className="h-4 w-4" />
                Añadir Premio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-slate-800 dark:text-slate-100">Añadir Nuevo Premio</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                  Completa la información del nuevo premio para añadirlo al inventario.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">Nombre del Premio</Label>
                  <Input 
                    id="name"
                    value={newPrize.nombre}
                    onChange={(e) => setNewPrize({ ...newPrize, nombre: e.target.value })}
                    placeholder="Ej: Gorra deportiva"
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-855 dark:text-slate-100"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="image" className="text-slate-700 dark:text-slate-300 font-medium">Imagen del Premio</Label>
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {newPrize.imagePreview ? (
                        <img src={newPrize.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Image className="h-8 w-8 text-slate-300 dark:text-slate-650" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="relative">
                        <Input
                          id="prize-image"
                          name="prize-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Label htmlFor="prize-image" className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                          <Upload className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          Subir imagen
                        </Label>
                      </div>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500">
                        Formatos: JPG, PNG. Máx: 5MB.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="cost" className="text-slate-700 dark:text-slate-300 font-medium">Costo en CoinFits</Label>
                  <Input 
                    id="cost"
                    type="number"
                    value={newPrize.costo_fitcoins}
                    onChange={(e) => setNewPrize({ ...newPrize, costo_fitcoins: e.target.value })}
                    placeholder="Ej: 100"
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-855 dark:text-slate-100 text-right"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stock" className="text-slate-700 dark:text-slate-300 font-medium">Stock Inicial</Label>
                  <Input 
                    id="stock"
                    type="number"
                    value={newPrize.stock}
                    onChange={(e) => setNewPrize({ ...newPrize, stock: e.target.value })}
                    placeholder="Ej: 10"
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-855 dark:text-slate-100 text-right"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleAddPrize}
                  disabled={!newPrize.nombre || !newPrize.costo_fitcoins}
                  className="bg-sanjer-green hover:bg-green-600 text-white font-semibold rounded-xl text-sm"
                >
                  Añadir Premio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPrizes.map((prize) => (
            <Card key={prize.id} className="glass-card shadow-sm rounded-2xl overflow-hidden border-slate-100 dark:border-slate-800">
              <div 
                className="h-40 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center relative cursor-pointer group"
                onClick={() => openImageUpload(prize)}
              >
                <img 
                  src={prize.image_url || prize.image_path || '/placeholder.svg'}
                  alt={prize.nombre}
                  className="h-32 object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-t-2xl">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{prize.nombre}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{prize.costo_fitcoins} CoinFits</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Package className="h-4 w-4 mr-1.5 text-slate-400" />
                    <span className="text-xs">Stock: <span className="font-bold text-slate-750 dark:text-slate-250">{prize.stock}</span></span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="icon"
                      variant="outline"
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 h-8 w-8 rounded-lg"
                      onClick={() => handleUpdateStock(prize.id, false)}
                      disabled={prize.stock <= 0}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="icon"
                      variant="outline"
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 h-8 w-8 rounded-lg"
                      onClick={() => handleUpdateStock(prize.id, true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredPrizes.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl shadow-sm border-slate-100 dark:border-slate-800">
            <Package className="h-10 w-10 mx-auto text-slate-350 dark:text-slate-500 mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No se encontraron premios</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">Intenta con otra búsqueda o añade un nuevo premio.</p>
          </div>
        )}
      </div>
      
      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-100">Actualizar Imagen</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Selecciona una nueva imagen para este premio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full h-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <Image className="h-10 w-10 text-slate-300 dark:text-slate-650" />
                )}
              </div>
              
              <div className="w-full">
                <div className="relative">
                  <Input
                    id="prize-image-update"
                    name="prize-image-update"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePrizeImageUpload}
                  />
                  <Label htmlFor="prize-image-update" className="inline-flex items-center justify-center w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-sm font-semibold">
                    <Upload className="h-4 w-4 mr-1.5 text-slate-400" />
                    Seleccionar imagen
                  </Label>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
                  Formatos: JPG, PNG. Máx: 5MB.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setShowImageDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={savePrizeImage} 
              disabled={!imagePreview}
              className="bg-sanjer-green hover:bg-green-600 text-white font-semibold rounded-xl text-sm"
            >
              Guardar Imagen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
