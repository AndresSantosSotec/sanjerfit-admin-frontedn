
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';
import { Lock, Mail } from 'lucide-react';

const UserRegistration = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Personal data
    nombre: '',
    sexo: '',
    telefono: '',
    direccion: '',
    ocupacion: '',
    peso: '',
    altura: '',
    area: '',
    
    // Medical data
    tipoSangre: '',
    alergias: '',
    padecimientos: '',
    indiceMasaCorporal: '',
    
    // Account data
    email: '',
    password: '',
    nivelAsignado: 'KoalaFit',
  });

  useEffect(() => {
    if (formData.nombre) {
      // Generate email based on name (removing spaces and accents)
      const normalizedName = formData.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ".");
      
      const email = `${normalizedName}@sanjerfit.com`;
      
      // Generate a simple password based on name + random digits
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const password = `${normalizedName.substring(0, 5)}${randomDigits}`;
      
      setFormData(prev => ({
        ...prev,
        email,
        password,
      }));
    }
  }, [formData.nombre]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.peso);
    const height = parseFloat(formData.altura) / 100; // convert cm to meters
    
    if (weight && height) {
      const bmi = (weight / (height * height)).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        indiceMasaCorporal: bmi,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Colaborador registrado",
      description: "Los datos se han guardado correctamente",
    });
    
    console.log("Form data submitted:", formData);
  };

  const handleNivelChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      nivelAsignado: value
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Registro de Colaboradores" 
        subtitle="Ingrese los datos del nuevo colaborador"
      />
      
      <div className="p-6 flex-1">
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="personal" className="text-sm">Datos Generales</TabsTrigger>
              <TabsTrigger value="medical" className="text-sm">Datos Médicos</TabsTrigger>
              <TabsTrigger value="account" className="text-sm">Cuenta de Usuario</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="personal">
                <h3 className="text-lg font-semibold text-sanjer-blue mb-4">Datos Generales</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo:</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sexo:</Label>
                    <RadioGroup 
                      name="sexo" 
                      value={formData.sexo}
                      onValueChange={(value) => setFormData(prev => ({...prev, sexo: value}))}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="masculino" id="masculino" />
                        <Label htmlFor="masculino">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="femenino" id="femenino" />
                        <Label htmlFor="femenino">Femenino</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono:</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección:</Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ocupacion">Ocupación:</Label>
                    <Input
                      id="ocupacion"
                      name="ocupacion"
                      value={formData.ocupacion}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">Área:</Label>
                    <Input
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg):</Label>
                    <Input
                      id="peso"
                      name="peso"
                      type="number"
                      value={formData.peso}
                      onChange={handleChange}
                      onBlur={calculateBMI}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="altura">Altura (cm):</Label>
                    <Input
                      id="altura"
                      name="altura"
                      type="number"
                      value={formData.altura}
                      onChange={handleChange}
                      onBlur={calculateBMI}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="medical">
                <h3 className="text-lg font-semibold text-sanjer-blue mb-4">Datos Médicos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipoSangre">Tipo de Sangre:</Label>
                    <Input
                      id="tipoSangre"
                      name="tipoSangre"
                      value={formData.tipoSangre}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alergias">Alergias:</Label>
                    <Input
                      id="alergias"
                      name="alergias"
                      value={formData.alergias}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="padecimientos">Padecimientos:</Label>
                    <Input
                      id="padecimientos"
                      name="padecimientos"
                      value={formData.padecimientos}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="indiceMasaCorporal">Índice Masa Corporal:</Label>
                    <Input
                      id="indiceMasaCorporal"
                      name="indiceMasaCorporal"
                      value={formData.indiceMasaCorporal}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Nivel asignado basado en evaluación:</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroup 
                        name="nivelAsignado" 
                        value={formData.nivelAsignado}
                        onValueChange={handleNivelChange}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="KoalaFit" id="koala" />
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                            <Label htmlFor="koala">KoalaFit</Label>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="JaguarFit" id="jaguar" />
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <Label htmlFor="jaguar">JaguarFit</Label>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="HalcónFit" id="halcon" />
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <Label htmlFor="halcon">HalcónFit</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="account">
                <h3 className="text-lg font-semibold text-sanjer-blue mb-4">Cuenta de Usuario</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Correo Electrónico:
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Generado automáticamente según el nombre del colaborador</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Contraseña:
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="text"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Generada automáticamente. El colaborador podrá cambiarla después.</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
                  <h4 className="font-medium text-sanjer-blue mb-2">Credenciales de Acceso</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Con estas credenciales el colaborador podrá acceder a su cuenta en la aplicación móvil SanjerFit.
                    Se recomienda que cambie su contraseña después del primer inicio de sesión.
                  </p>
                </div>
              </TabsContent>
              
              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sanjer-green hover:bg-green-600">
                  Guardar Datos
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
