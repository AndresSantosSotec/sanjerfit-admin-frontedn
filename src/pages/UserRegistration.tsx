import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import AdminHeader from '@/components/AdminHeader'
import {
  Lock,
  Mail,
  Upload,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle
} from 'lucide-react'

const UserRegistration = () => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nombre: '',
    sexo: '',
    telefono: '',
    direccion: '',
    ocupacion: '',
    area: '',
    peso: '',
    altura: '',
    tipoSangre: '',
    alergias: '',
    padecimientos: '',
    indiceMasaCorporal: '',
    nivelAsignado: 'KoalaFit',
    email: '',
    password: '',
    confirmarPassword: '',
    photo: null as File | null,
    photoPreview: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  })

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  })

  // 1) Generar email y pwd base al cambiar "nombre"
  useEffect(() => {
    const nm = formData.nombre.trim().toLowerCase()
    if (!nm) return
    let normalized = nm
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '')
    const email = `${normalized}@sanjerfit.com`
    const digits = Math.floor(1000 + Math.random() * 9000)
    const pwd = `${normalized.substring(0, 3)}${digits}`

    setFormData(f => ({
      ...f,
      email,
      password: pwd,
      confirmarPassword: pwd
    }))
  }, [formData.nombre])

  // 2) Comprobar fuerza de contraseña
  useEffect(() => {
    const p = formData.password
    setPasswordStrength({
      hasMinLength: p.length >= 8,
      hasUpperCase: /[A-Z]/.test(p),
      hasLowerCase: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
    })
  }, [formData.password])

  const getPasswordStrengthLevel = () => {
    const { hasMinLength, hasUpperCase, hasLowerCase, hasNumber } = passwordStrength
    const cnt = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber].filter(Boolean).length
    if (cnt === 0) return { level: 'muy débil', color: 'bg-red-500' }
    if (cnt === 1) return { level: 'débil', color: 'bg-red-400' }
    if (cnt === 2) return { level: 'moderada', color: 'bg-yellow-500' }
    if (cnt === 3) return { level: 'fuerte', color: 'bg-green-400' }
    return { level: 'muy fuerte', color: 'bg-green-600' }
  }
  const passwordStrengthInfo = getPasswordStrengthLevel()
  const togglePasswordVisibility = () => setShowPassword(v => !v)



  // Clasificación IMC
  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return 'Bajo peso'
    if (bmi < 25) return 'Peso normal'
    if (bmi < 30) return 'Sobrepeso'
    if (bmi < 35) return 'Obesidad I'
    if (bmi < 40) return 'Obesidad II'
    return 'Obesidad III'
  }
  // Nivel recomendado según IMC
  const getRecommendedLevel = (bmi: number) => {
    if (bmi > 30) return 'KoalaFit'
    if (bmi > 25) return 'JaguarFit'
    return 'HalcónFit'
  }

  // 3) Cálculo IMC al vuelo
  const calculateBMI = () => {
    const w = parseFloat(formData.peso)
    const h = parseFloat(formData.altura) / 100
    if (w > 0 && h > 0) {
      const bmi = (w / (h * h)).toFixed(1)
      setFormData(f => ({
        ...f,
        indiceMasaCorporal: bmi,
        nivelAsignado: getRecommendedLevel(parseFloat(bmi))
      }))
    }
  }

  // 4) Foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024)
      return toast({ title: 'Error', description: 'Máx 2MB', variant: 'destructive' })
    if (!['image/jpeg', 'image/png'].includes(file.type))
      return toast({ title: 'Error', description: 'Solo JPG/PNG', variant: 'destructive' })
    setFormData(f => ({ ...f, photo: file, photoPreview: URL.createObjectURL(file) }))
  }

  // Modificar o agregar esta función de formato
  const formatDecimal = (value: string, decimals: number = 1): string => {
    // Eliminar caracteres no numéricos excepto punto
    const cleaned = value.replace(/[^\d.]/g, '');
    // Asegurar solo un punto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    // Formatear decimales
    if (parts.length === 2) {
      return parts[0] + '.' + parts[1].slice(0, decimals);
    }
    return cleaned;
  };

  // Modificar el handleChange existente
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Formatear según el campo
    let formattedValue = value;
    if (name === 'peso') {
      formattedValue = formatDecimal(value, 1); // 1 decimal para peso
    } else if (name === 'altura') {
      formattedValue = formatDecimal(value, 0); // Sin decimales para altura
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  // Modificar los inputs de peso y altura

  // 5) Envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.password)
      return toast({ title: 'Error', description: 'Contraseña obligatoria', variant: 'destructive' })
    if (formData.password !== formData.confirmarPassword)
      return toast({ title: 'Error', description: 'Contraseñas no coinciden', variant: 'destructive' })

    const fd = new FormData()
    const fields: Record<string, string> = {
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmarPassword,
      sexo: formData.sexo,
      telefono: formData.telefono,
      direccion: formData.direccion,
      ocupacion: formData.ocupacion,
      area: formData.area,
      peso: formData.peso,
      altura: formData.altura,
      tipo_sangre: formData.tipoSangre,
      alergias: formData.alergias,
      padecimientos: formData.padecimientos,
      indice_masa_corporal: formData.indiceMasaCorporal,
      nivel_asignado: formData.nivelAsignado,
    }
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v))
    formData.photo && fd.append('photo', formData.photo)

    try {
      await api.post('/webadmin/colaborators', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast({ title: 'Éxito', description: 'Colaborador creado.' })
      // reset
      setFormData({
        nombre: '', sexo: '', telefono: '', direccion: '',
        ocupacion: '', area: '', peso: '', altura: '',
        tipoSangre: '', alergias: '', padecimientos: '',
        indiceMasaCorporal: '', nivelAsignado: 'KoalaFit',
        email: '', password: '', confirmarPassword: '',
        photo: null, photoPreview: ''
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'No se pudo crear',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Registro de Colaboradores" subtitle="Ingrese los datos del nuevo colaborador" />
      <div className="p-6 flex-1">
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="personal">Datos Generales</TabsTrigger>
              <TabsTrigger value="medical">Datos Médicos</TabsTrigger>
              <TabsTrigger value="account">Cuenta de Usuario</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>

              {/* --- Datos Generales --- */}
              <TabsContent value="personal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Nombre */}
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

                  {/* Sexo */}
                  <div className="space-y-2">
                    <Label>Sexo:</Label>
                    <RadioGroup
                      name="sexo"
                      value={formData.sexo}
                      onValueChange={v => setFormData(f => ({ ...f, sexo: v }))}
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

                  {/* Foto */}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="photo">Fotografía:</Label>
                    <div className="flex items-start space-x-4">
                      <div className="w-32 h-32 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                        {formData.photoPreview
                          ? <img src={formData.photoPreview} className="w-full h-full object-cover" />
                          : <User className="h-12 w-12 text-gray-300" />
                        }
                      </div>
                      <div className="flex-1">
                        <Input
                          id="photo"
                          name="photo"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png"
                          onChange={handlePhotoUpload}
                        />
                        <Label htmlFor="photo" className="inline-flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-100">
                          <Upload className="mr-2" />Subir foto
                        </Label>
                        <p className="text-xs text-gray-500">JPG/PNG, máx 2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono:</Label>
                    <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} />
                  </div>

                  {/* Dirección */}
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección:</Label>
                    <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
                  </div>

                  {/* Ocupación */}
                  <div className="space-y-2">
                    <Label htmlFor="ocupacion">Ocupación:</Label>
                    <Input id="ocupacion" name="ocupacion" value={formData.ocupacion} onChange={handleChange} />
                  </div>

                  {/* Área */}
                  <div className="space-y-2">
                    <Label htmlFor="area">Área:</Label>
                    <Input id="area" name="area" value={formData.area} onChange={handleChange} />
                  </div>

                  {/* Peso */}
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg):</Label>
                    <Input
                      id="peso"
                      name="peso"
                      type="number"
                      step="0.1"
                      min="0"
                      max="300"
                      value={formData.peso}
                      onChange={handleChange}
                      onBlur={() => {
                        // Al salir del campo redondea a 1 decimal
                        if (formData.peso !== '') {
                          const v = parseFloat(formData.peso)
                          setFormData(f => ({
                            ...f,
                            peso: isNaN(v) ? '' : v.toFixed(1)
                          }))
                          calculateBMI()  // recálculo inmediato
                        }
                      }}
                      onWheel={e => e.currentTarget.blur()} // evita cambios con scroll
                      placeholder="70.5"
                      className="text-right"
                    />
                  </div>

                  {/* Altura */}
                  <div className="space-y-2">
                    <Label htmlFor="altura">Altura (cm):</Label>
                    <Input
                      id="altura"
                      name="altura"
                      type="number"
                      step="1"
                      min="0"
                      max="250"
                      value={formData.altura}
                      onChange={handleChange}
                      onBlur={() => {
                        // Al salir del campo redondea a entero
                        if (formData.altura !== '') {
                          const v = parseFloat(formData.altura)
                          setFormData(f => ({
                            ...f,
                            altura: isNaN(v) ? '' : Math.round(v).toString()
                          }))
                          calculateBMI()
                        }
                      }}
                      onWheel={e => e.currentTarget.blur()}
                      placeholder="170"
                      className="text-right"
                    />
                  </div>


                  {/* Indicador IMC */}
                  {formData.indiceMasaCorporal && (
                    <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">IMC Calculado:</h4>
                          <p className="text-2xl font-bold text-sanjer-blue">
                            {formData.indiceMasaCorporal}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getBMIClassification(parseFloat(formData.indiceMasaCorporal))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Nivel Recomendado:</p>
                          <p className="text-lg font-bold text-sanjer-green">
                            {formData.nivelAsignado}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${parseFloat(formData.indiceMasaCorporal) < 18.5
                              ? 'bg-blue-400'
                              : parseFloat(formData.indiceMasaCorporal) < 25
                                ? 'bg-green-400'
                                : parseFloat(formData.indiceMasaCorporal) < 30
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                            style={{
                              width: `${Math.min(
                                (parseFloat(formData.indiceMasaCorporal) / 40) * 100,
                                100
                              )}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Bajo peso</span>
                          <span>Normal</span>
                          <span>Sobrepeso</span>
                          <span>Obesidad</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* --- Datos Médicos --- */}
              <TabsContent value="medical">
                <h3 className="text-lg font-semibold text-sanjer-blue mb-4">Datos Médicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipoSangre">Tipo de Sangre:</Label>
                    <Input id="tipoSangre" name="tipoSangre" value={formData.tipoSangre} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alergias">Alergias:</Label>
                    <Input id="alergias" name="alergias" value={formData.alergias} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="padecimientos">Padecimientos:</Label>
                    <Input id="padecimientos" name="padecimientos" value={formData.padecimientos} onChange={handleChange} />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-md mb-4">
                    <h4 className="font-medium mb-2">Nivel asignado automáticamente:</h4>
                    <p className="text-sm text-gray-600">Basado en el IMC, ajustable manualmente.</p>
                  </div>
                  <RadioGroup
                    name="nivelAsignado"
                    value={formData.nivelAsignado}
                    onValueChange={v => setFormData(f => ({ ...f, nivelAsignado: v }))}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="KoalaFit" id="koala" /><Label htmlFor="koala">KoalaFit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="JaguarFit" id="jaguar" /><Label htmlFor="jaguar">JaguarFit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="HalcónFit" id="halcon" /><Label htmlFor="halcon">HalcónFit</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>

              {/* --- Cuenta de Usuario --- */}
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
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-gray-50"
                      required
                    />
                    <p className="text-xs text-gray-500">Generado automáticamente</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Contraseña: <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        className="pr-10"
                        required
                      />
                      <button
                        onClick={togglePasswordVisibility}
                        type="button"
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-2 mt-2">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrengthInfo.color}`}
                            style={{ width: `${Object.values(passwordStrength).filter(Boolean).length * 25}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Seguridad: <span className="font-medium">{passwordStrengthInfo.level}</span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasMinLength
                              ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                              : <XCircle className="h-3 w-3 text-red-500" />
                            }
                            Mín 8 caracteres
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasUpperCase
                              ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                              : <XCircle className="h-3 w-3 text-red-500" />
                            }
                            Letra mayúscula
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasLowerCase
                              ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                              : <XCircle className="h-3 w-3 text-red-500" />
                            }
                            Letra minúscula
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasNumber
                              ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                              : <XCircle className="h-3 w-3 text-red-500" />
                            }
                            Número
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmarPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Confirmar Contraseña: <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmarPassword"
                      name="confirmarPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmarPassword}
                      onChange={handleChange}
                      className={formData.password && formData.confirmarPassword && formData.password !== formData.confirmarPassword ? 'border-red-500' : ''}
                      required
                    />
                    {formData.password && formData.confirmarPassword && formData.password !== formData.confirmarPassword && (
                      <p className="text-xs text-red-500">No coinciden</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setFormData({
                    nombre: '', sexo: '', telefono: '', direccion: '',
                    ocupacion: '', area: '', peso: '', altura: '',
                    tipoSangre: '', alergias: '', padecimientos: '',
                    indiceMasaCorporal: '', nivelAsignado: 'KoalaFit',
                    email: '', password: '', confirmarPassword: '',
                    photo: null, photoPreview: ''
                  })}
                >
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
  )
}

export default UserRegistration
