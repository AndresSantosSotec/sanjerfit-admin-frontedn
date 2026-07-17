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
    fechaNacimiento: '',
    fechaIngreso: '',
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
      .replace(/[\u0300-\u036f]/g, '')  // remover acentos
      .replace(/\s+/g, '.')             // espacios a puntos
      .replace(/[^a-z0-9.]/g, '')       // solo letras, números y puntos
      .replace(/\.{2,}/g, '.')          // no puntos consecutivos
      .replace(/^\.+|\.+$/g, '')        // no puntos al inicio/final

    const email = `${normalized}@coosanjer.com.gt`  // cambio de dominio
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // 3) Manejadores de entrada
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'peso') {
      formattedValue = formatDecimal(value, 1); // Peso con 1 decimal
    } else if (name === 'altura') {
      formattedValue = formatDecimal(value, 0); // Sin decimales para altura
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  // Función para limitar y formatear números decimales
  const formatDecimal = (val: string, maxDecimals: number) => {
    if (val === '') return '';
    // Permite números y un solo punto decimal
    let cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    if (parts[1] && parts[1].length > maxDecimals) {
      cleaned = `${parts[0]}.${parts[1].substring(0, maxDecimals)}`;
    }
    return cleaned;
  };

  // 4) IMC & Nivel asignado automático
  const calculateBMI = () => {
    const w = parseFloat(formData.peso)
    const h = parseFloat(formData.altura) / 100 // cm a metros
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return

    const imcVal = w / (h * h)
    const imcStr = imcVal.toFixed(1)

    // Clasificación de nivel sugerido
    let level = 'KoalaFit'
    if (imcVal >= 25 && imcVal < 30) {
      level = 'JaguarFit'
    } else if (imcVal >= 30) {
      level = 'HalcónFit'
    }

    setFormData(f => ({
      ...f,
      indiceMasaCorporal: imcStr,
      nivelAsignado: level
    }))
  }

  const getBMIClassification = (imc: number) => {
    if (imc < 18.5) return 'Bajo peso'
    if (imc < 25) return 'Peso saludable'
    if (imc < 30) return 'Sobrepeso'
    return 'Obesidad'
  }

  // Foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      return toast({
        title: 'Error',
        description: 'La imagen excede el límite de 2MB',
        variant: 'destructive',
      })
    }

    const previewUrl = URL.createObjectURL(file)
    setFormData(f => ({
      ...f,
      photo: file,
      photoPreview: previewUrl
    }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let formattedValue = formData[name as keyof typeof formData] as string;

    if (name === 'peso') {
      formattedValue = formatDecimal(formData.peso, 1); // Peso con 1 decimal
    } else if (name === 'altura') {
      formattedValue = formatDecimal(formData.altura, 0); // Sin decimales para altura
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

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
      fecha_nacimiento: formData.fechaNacimiento,
      fecha_ingreso: formData.fechaIngreso,
      tipo_sangre: formData.tipoSangre,
      alergias: formData.alergias,
      padecimientos: formData.padecimientos,
      indice_masa_corporal: formData.indiceMasaCorporal,
      nivel_asignado: formData.nivelAsignado,
    }
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        fd.append(k, v);
      }
    })
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
        fechaNacimiento: '', fechaIngreso: '',
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
      <div className="p-4 sm:p-6 flex-1">
        <div className="glass-card shadow-sm rounded-2xl p-5 sm:p-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <TabsTrigger value="personal" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">Datos Generales</TabsTrigger>
              <TabsTrigger value="medical" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">Datos Médicos</TabsTrigger>
              <TabsTrigger value="account" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">Cuenta de Usuario</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>

              {/* --- Datos Generales --- */}
              <TabsContent value="personal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-slate-700 dark:text-slate-300 font-medium">Nombre Completo:</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  {/* Sexo */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Sexo:</Label>
                    <RadioGroup
                      name="sexo"
                      value={formData.sexo}
                      onValueChange={v => setFormData(f => ({ ...f, sexo: v }))}
                      className="flex space-x-4 pt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="masculino" id="masculino" className="border-slate-300 dark:border-slate-600 text-sanjer-green" />
                        <Label htmlFor="masculino" className="text-slate-600 dark:text-slate-400 font-normal">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="femenino" id="femenino" className="border-slate-300 dark:border-slate-600 text-sanjer-green" />
                        <Label htmlFor="femenino" className="text-slate-600 dark:text-slate-400 font-normal">Femenino</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Foto */}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="photo" className="text-slate-700 dark:text-slate-300 font-medium">Fotografía:</Label>
                    <div className="flex items-start space-x-4">
                      <div className="w-32 h-32 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                        {formData.photoPreview
                          ? <img src={formData.photoPreview} className="w-full h-full object-cover" />
                          : <User className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                        }
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          id="photo"
                          name="photo"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png"
                          onChange={handlePhotoUpload}
                        />
                        <Label htmlFor="photo" className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors">
                          <Upload className="mr-2 h-4 w-4 text-slate-400" />Subir foto
                        </Label>
                        <p className="text-xs text-slate-400 dark:text-slate-500">JPG/PNG, máx 2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-slate-700 dark:text-slate-300 font-medium">Teléfono:</Label>
                    <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                  </div>

                  {/* Dirección */}
                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-slate-700 dark:text-slate-300 font-medium">Dirección:</Label>
                    <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                  </div>

                  {/* Ocupación */}
                  <div className="space-y-2">
                    <Label htmlFor="ocupacion" className="text-slate-700 dark:text-slate-300 font-medium">Ocupación:</Label>
                    <Input id="ocupacion" name="ocupacion" value={formData.ocupacion} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                  </div>

                  {/* Área */}
                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-slate-700 dark:text-slate-300 font-medium">Área:</Label>
                    <Input id="area" name="area" value={formData.area} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                  </div>

                  {/* Peso */}
                  <div className="space-y-2">
                    <Label htmlFor="peso" className="text-slate-700 dark:text-slate-300 font-medium">Peso (kg):</Label>
                    <Input
                      id="peso"
                      name="peso"
                      type="number"
                      step="0.1"
                      min="0"
                      max="300"
                      value={formData.peso}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onWheel={e => e.currentTarget.blur()}
                      placeholder="70.5"
                      className="text-right bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Altura */}
                  <div className="space-y-2">
                    <Label htmlFor="altura" className="text-slate-700 dark:text-slate-300 font-medium">Altura (cm):</Label>
                    <Input
                      id="altura"
                      name="altura"
                      type="number"
                      step="1"
                      min="0"
                      max="250"
                      value={formData.altura}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onWheel={e => e.currentTarget.blur()}
                      placeholder="170"
                      className="text-right bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento" className="text-slate-700 dark:text-slate-300 font-medium">Fecha de Nacimiento:</Label>
                    <Input
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Fecha de Ingreso */}
                  <div className="space-y-2">
                    <Label htmlFor="fechaIngreso" className="text-slate-700 dark:text-slate-300 font-medium">Fecha de Ingreso:</Label>
                    <Input
                      id="fechaIngreso"
                      name="fechaIngreso"
                      type="date"
                      value={formData.fechaIngreso}
                      onChange={handleChange}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Indicador IMC */}
                  {formData.indiceMasaCorporal && (
                    <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">IMC Calculado:</h4>
                          <p className="text-2xl font-bold text-sanjer-blue dark:text-blue-400">
                            {formData.indiceMasaCorporal}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {getBMIClassification(parseFloat(formData.indiceMasaCorporal))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Nivel Recomendado:</p>
                          <p className="text-lg font-bold text-sanjer-green">
                            {formData.nivelAsignado}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
                        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
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
                <h3 className="text-base font-semibold text-sanjer-blue dark:text-blue-400 mb-4">Datos Médicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipoSangre" className="text-slate-700 dark:text-slate-300 font-medium">Tipo de Sangre:</Label>
                    <Input id="tipoSangre" name="tipoSangre" value={formData.tipoSangre} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alergias" className="text-slate-700 dark:text-slate-300 font-medium">Alergias:</Label>
                    <Input id="alergias" name="alergias" value={formData.alergias} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="padecimientos" className="text-slate-700 dark:text-slate-300 font-medium">Padecimientos:</Label>
                    <Input id="padecimientos" name="padecimientos" value={formData.padecimientos} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl mb-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1">Nivel asignado automáticamente:</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Basado en el IMC, ajustable manualmente.</p>
                  </div>
                  <RadioGroup
                    name="nivelAsignado"
                    value={formData.nivelAsignado}
                    onValueChange={v => setFormData(f => ({ ...f, nivelAsignado: v }))}
                    className="flex space-x-6 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="KoalaFit" id="koala" className="border-slate-300 dark:border-slate-600 text-sanjer-green" />
                      <Label htmlFor="koala" className="text-slate-700 dark:text-slate-300 font-normal">KoalaFit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="JaguarFit" id="jaguar" className="border-slate-300 dark:border-slate-600 text-sanjer-green" />
                      <Label htmlFor="jaguar" className="text-slate-700 dark:text-slate-300 font-normal">JaguarFit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="HalcónFit" id="halcon" className="border-slate-300 dark:border-slate-600 text-sanjer-green" />
                      <Label htmlFor="halcon" className="text-slate-700 dark:text-slate-300 font-normal">HalcónFit</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>

              {/* --- Cuenta de Usuario --- */}
              <TabsContent value="account">
                <h3 className="text-base font-semibold text-sanjer-blue dark:text-blue-400 mb-4">Cuenta de Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <Mail className="h-4 w-4 text-slate-400" /> Correo Electrónico:
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                      required
                      readOnly
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Generado automáticamente</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <Lock className="h-4 w-4 text-slate-400" /> Contraseña: <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        className="pr-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                        required
                      />
                      <button
                        onClick={togglePasswordVisibility}
                        type="button"
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-2 mt-2">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrengthInfo.color}`}
                            style={{ width: `${Object.values(passwordStrength).filter(Boolean).length * 25}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Seguridad: <span className="font-semibold">{passwordStrengthInfo.level}</span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasMinLength
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              : <XCircle className="h-3.5 w-3.5 text-red-500" />
                            }
                            Mín 8 caracteres
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasUpperCase
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              : <XCircle className="h-3.5 w-3.5 text-red-500" />
                            }
                            Letra mayúscula
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasLowerCase
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              : <XCircle className="h-3.5 w-3.5 text-red-500" />
                            }
                            Letra minúscula
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordStrength.hasNumber
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              : <XCircle className="h-3.5 w-3.5 text-red-500" />
                            }
                            Número
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmarPassword" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <Lock className="h-4 w-4 text-slate-400" /> Confirmar Contraseña: <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmarPassword"
                      name="confirmarPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmarPassword}
                      onChange={handleChange}
                      className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 ${formData.password && formData.confirmarPassword && formData.password !== formData.confirmarPassword ? 'border-red-500' : ''}`}
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
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                <Button type="submit" className="bg-sanjer-green hover:bg-green-600 text-white">
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
