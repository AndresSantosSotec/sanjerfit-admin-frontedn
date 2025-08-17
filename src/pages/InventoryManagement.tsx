
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

  const [editingPrize, setEditingPrize] = useState<Premio | null>(null);
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

  const filteredPrizes = prizes.filter(prize =>
    prize.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
                    value={newPrize.nombre}
                    onChange={(e) => setNewPrize({ ...newPrize, nombre: e.target.value })}
                    placeholder="Ej: Gorra deportiva"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Imagen del Premio</Label>
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                      {newPrize.imagePreview ? (
                        <img src={newPrize.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Image className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          id="prize-image"
                          name="prize-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Label htmlFor="prize-image" className="inline-flex items-center justify-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                          <Upload className="h-4 w-4 mr-2" />
                          Subir imagen
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Formatos aceptados: JPG, PNG. Tamaño máximo: 5MB.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo en CoinFits</Label>
                  <Input 
                    id="cost"
                    type="number"
                    value={newPrize.costo_fitcoins}
                    onChange={(e) => setNewPrize({ ...newPrize, costo_fitcoins: e.target.value })}
                    placeholder="Ej: 100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Inicial</Label>
                  <Input 
                    id="stock"
                    type="number"
                    value={newPrize.stock}
                    onChange={(e) => setNewPrize({ ...newPrize, stock: e.target.value })}
                    placeholder="Ej: 10"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleAddPrize}
                  disabled={!newPrize.nombre || !newPrize.costo_fitcoins}
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
              <div 
                className="h-40 bg-sanjer-lightgray flex items-center justify-center relative cursor-pointer group"
                onClick={() => openImageUpload(prize)}
              >
                <img 
                  src={prize.image_url || prize.image_path || '/placeholder.svg'}
                  alt={prize.nombre}
                  className="h-32 object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold mb-1">{prize.nombre}</h4>
                <p className="text-sm text-muted-foreground mb-3">{prize.costo_fitcoins} CoinFits</p>
                
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
      
      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Imagen</DialogTitle>
            <DialogDescription>
              Selecciona una nueva imagen para este premio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <Image className="h-12 w-12 text-gray-300" />
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
                  <Label htmlFor="prize-image-update" className="inline-flex items-center justify-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar imagen
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Formatos aceptados: JPG, PNG. Tamaño máximo: 5MB.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={savePrizeImage} 
              disabled={!imagePreview}
              className="bg-sanjer-green hover:bg-green-600"
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
