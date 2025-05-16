
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload } from 'lucide-react';
import { Collaborator } from '@/types/collaborator';

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collaborator: Collaborator) => void;
  collaborator: Collaborator | null;
  isEditMode: boolean;
}

export const CollaboratorModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  collaborator, 
  isEditMode 
}: CollaboratorModalProps) => {
  const [formData, setFormData] = useState<Collaborator>({
    id: '',
    name: '',
    email: '',
    phone: '',
    area: '',
    level: 'KoalaFit',
    status: 'Activo',
    photo: '',
    address: '',
    occupation: '',
    weight: 0,
    height: 0,
    bloodType: '',
    allergies: '',
    medicalConditions: '',
    bmi: '',
    coinFits: 0,
    lastActive: new Date().toISOString().split('T')[0]
  });
  
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState('personal');
  
  useEffect(() => {
    if (collaborator) {
      setFormData(collaborator);
      setPhotoPreview(collaborator.photo);
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        phone: '',
        area: '',
        level: 'KoalaFit',
        status: 'Activo',
        photo: '',
        address: '',
        occupation: '',
        weight: 0,
        height: 0,
        bloodType: '',
        allergies: '',
        medicalConditions: '',
        bmi: '',
        coinFits: 0,
        lastActive: new Date().toISOString().split('T')[0]
      });
      setPhotoPreview('');
    }
    setActiveTab('personal');
  }, [collaborator, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
      
      // Calculate BMI if weight and height are set
      if ((name === 'weight' || name === 'height') && formData.weight && formData.height) {
        const weight = name === 'weight' ? parseFloat(value) : formData.weight;
        const height = name === 'height' ? parseFloat(value) / 100 : formData.height / 100; // cm to m
        if (weight > 0 && height > 0) {
          const bmi = (weight / (height * height)).toFixed(1);
          setFormData(prev => ({ ...prev, bmi }));
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB');
      return;
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Solo se permiten imágenes JPG o PNG');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setFormData({ ...formData, photo: result });
    };
    reader.readAsDataURL(file);
  };
  
  const calculateLevel = () => {
    const bmi = parseFloat(formData.bmi);
    if (isNaN(bmi)) return 'KoalaFit';
    
    if (bmi > 30) {
      return 'KoalaFit';
    } else if (bmi > 25) {
      return 'JaguarFit';
    } else {
      return 'HalconFit';
    }
  };
  
  const handleAutomaticLevel = () => {
    const calculatedLevel = calculateLevel();
    setFormData(prev => ({ ...prev, level: calculatedLevel }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Colaborador' : 'Añadir Nuevo Colaborador'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Actualiza la información del colaborador en el sistema.'
              : 'Complete la información para registrar un nuevo colaborador.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="personal">Datos Personales</TabsTrigger>
              <TabsTrigger value="medical">Datos Médicos</TabsTrigger>
              <TabsTrigger value="account">Nivel y Cuenta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-start space-x-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="w-20 h-20">
                      {photoPreview ? (
                        <AvatarImage src={photoPreview} alt="Vista previa" />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          <User size={32} />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="relative">
                      <Input
                        id="photo"
                        name="photo"
                        type="file"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        accept="image/jpeg, image/png"
                      />
                      <Label
                        htmlFor="photo"
                        className="inline-flex items-center justify-center px-3 py-1 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Subir foto
                      </Label>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo:</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Ingrese nombre completo"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico:</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="ejemplo@sanjerfit.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono:</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="300-123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección:</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Dirección completa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation">Ocupación:</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Cargo o función"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Área:</Label>
                  <Input
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    placeholder="Departamento o área"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="medical">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm):</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={formData.height || ''}
                    onChange={handleChange}
                    placeholder="Altura en centímetros"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg):</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    value={formData.weight || ''}
                    onChange={handleChange}
                    placeholder="Peso en kilogramos"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bmi">IMC (Índice Masa Corporal):</Label>
                  <Input
                    id="bmi"
                    name="bmi"
                    value={formData.bmi}
                    readOnly
                    placeholder="Calculado automáticamente"
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Tipo de Sangre:</Label>
                  <Input
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    placeholder="Ej: O+, A-, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias:</Label>
                  <Input
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="Alergias conocidas o 'Ninguna'"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Padecimientos:</Label>
                  <Input
                    id="medicalConditions"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    placeholder="Condiciones médicas o 'Ninguna'"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="account">
              <div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-md mb-4">
                  <h4 className="font-medium mb-2">Nivel Fitness</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Asigne un nivel de acuerdo al estado físico del colaborador. El sistema puede calcularlo automáticamente basado en el IMC.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Label>Nivel asignado:</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) => handleSelectChange('level', value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KoalaFit">KoalaFit (Inicial)</SelectItem>
                          <SelectItem value="JaguarFit">JaguarFit (Intermedio)</SelectItem>
                          <SelectItem value="HalconFit">HalcónFit (Avanzado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAutomaticLevel}
                      disabled={!formData.bmi}
                    >
                      Calcular Automáticamente
                    </Button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-md">
                    <div className="border-l-4 border-purple-400 pl-3">
                      <h5 className="font-medium">KoalaFit</h5>
                      <p className="text-xs text-gray-600">Metas: 3,000 pasos, 20 min activos</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-3">
                      <h5 className="font-medium">JaguarFit</h5>
                      <p className="text-xs text-gray-600">Metas: 6,000 pasos, 30 min activos</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-3">
                      <h5 className="font-medium">HalcónFit</h5>
                      <p className="text-xs text-gray-600">Metas: 10,000 pasos, 45 min activos</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="coinFits">CoinFits Actuales:</Label>
                    <Input
                      id="coinFits"
                      name="coinFits"
                      type="number"
                      value={formData.coinFits || ''}
                      onChange={handleChange}
                      placeholder="Cantidad de CoinFits"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado:</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-sanjer-green hover:bg-green-600"
            >
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
