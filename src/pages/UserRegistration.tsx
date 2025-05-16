
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';
import { Lock, Mail, Upload, Image, User, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

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
    confirmarPassword: '',
    nivelAsignado: 'KoalaFit',
    
    // Photo
    photo: null as File | null,
    photoPreview: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
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
      const password = `${normalizedName.substring(0, 3)}${randomDigits}`;
      
      setFormData(prev => ({
        ...prev,
        email
      }));
    }
  }, [formData.nombre]);
  
  // Add password strength check
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    });
  }, [formData.password]);
  
  const getPasswordStrengthLevel = () => {
    const { hasMinLength, hasUpperCase, hasLowerCase, hasNumber } = passwordStrength;
    const criteriaMet = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber].filter(Boolean).length;
    
    if (criteriaMet === 0) return { level: "muy débil", color: "bg-red-500" };
    if (criteriaMet === 1) return { level: "débil", color: "bg-red-400" };
    if (criteriaMet === 2) return { level: "moderada", color: "bg-yellow-500" };
    if (criteriaMet === 3) return { level: "fuerte", color: "bg-green-400" };
    return { level: "muy fuerte", color: "bg-green-600" };
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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

  // Calculate automatic level based on health metrics
  const calculateLevel = () => {
    const bmi = parseFloat(formData.indiceMasaCorporal);
    
    if (isNaN(bmi)) return 'KoalaFit'; // Default level
    
    if (bmi > 30) {
      return 'KoalaFit';
    } else if (bmi > 25) {
      return 'JaguarFit';
    } else {
      return 'HalcónFit';
    }
  };

  useEffect(() => {
    if (formData.indiceMasaCorporal) {
      const calculatedLevel = calculateLevel();
      setFormData(prev => ({
        ...prev,
        nivelAsignado: calculatedLevel
      }));
    }
  }, [formData.indiceMasaCorporal]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error al subir la imagen",
          description: "La imagen no debe superar los 2MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast({
          title: "Formato no válido",
          description: "Solo se permiten imágenes JPG o PNG",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password fields
    if (!formData.password) {
      toast({
        title: "Error de validación",
        description: "La contraseña es obligatoria",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmarPassword) {
      toast({
        title: "Error de validación",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }
    
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

  const passwordStrengthInfo = getPasswordStrengthLevel();

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
                  
                  {/* Photo upload section */}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="photo">Fotografía:</Label>
                    <div className="flex items-start space-x-4">
                      <div className="w-32 h-32 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                        {formData.photoPreview ? (
                          <img 
                            src={formData.photoPreview} 
                            alt="Vista previa" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <Input
                            id="photo"
                            name="photo"
                            type="file"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            accept="image/jpeg, image/png"
                          />
                          <Label htmlFor="photo" className="inline-flex items-center justify-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                            <Upload className="h-4 w-4 mr-2" />
                            Subir fotografía
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Formatos aceptados: JPG, PNG. Tamaño máximo: 2MB.
                        </p>
                      </div>
                    </div>
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
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-md mb-4">
                    <h4 className="font-medium mb-2">Nivel asignado automáticamente basado en evaluación:</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      El nivel se calcula automáticamente según el IMC del colaborador, pero puede modificarlo manualmente si es necesario.
                    </p>
                  </div>
                  
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
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
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
                      <Lock className="h-4 w-4" /> Contraseña: <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="pr-10"
                        required
                      />
                      <button 
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {formData.password && (
                      <div className="space-y-2 mt-2">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passwordStrengthInfo.color}`} 
                            style={{ 
                              width: `${Object.values(passwordStrength).filter(Boolean).length * 25}%` 
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Seguridad: <span className="font-medium">{passwordStrengthInfo.level}</span>
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasMinLength ? 
                              <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                              <XCircle className="h-3 w-3 text-red-500" />
                            }
                            Mínimo 8 caracteres
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasUpperCase ? 
                              <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                              <XCircle className="h-3 w-3 text-red-500" />
                            }
                            Una letra mayúscula
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasLowerCase ? 
                              <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                              <XCircle className="h-3 w-3 text-red-500" />
                            }
                            Una letra minúscula
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasNumber ? 
                              <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                              <XCircle className="h-3 w-3 text-red-500" />
                            }
                            Un número
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmarPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Confirmar Contraseña: <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmarPassword"
                        name="confirmarPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmarPassword}
                        onChange={handleChange}
                        className={formData.password && formData.confirmarPassword && formData.password !== formData.confirmarPassword ? "border-red-500" : ""}
                        required
                      />
                    </div>
                    {formData.password && formData.confirmarPassword && formData.password !== formData.confirmarPassword && (
                      <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                    )}
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
