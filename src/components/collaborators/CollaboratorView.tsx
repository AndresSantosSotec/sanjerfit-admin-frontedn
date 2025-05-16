
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { Collaborator } from '@/types/collaborator';

interface CollaboratorViewProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator: Collaborator;
}

export const CollaboratorView = ({ isOpen, onClose, collaborator }: CollaboratorViewProps) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'HalconFit':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'JaguarFit':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'KoalaFit':
      default:
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Colaborador</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6">
          {/* Header with photo and basic info */}
          <div className="flex items-start space-x-4 pb-4 border-b">
            <Avatar className="w-24 h-24">
              {collaborator.photo ? (
                <AvatarImage src={collaborator.photo} alt={collaborator.name} />
              ) : (
                <AvatarFallback className="text-3xl">
                  {collaborator.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{collaborator.name}</h3>
              <p className="text-gray-500">{collaborator.email}</p>
              <p className="text-sm text-gray-500">{collaborator.occupation}</p>
              
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={collaborator.status === 'Activo' ? 'default' : 'secondary'}>
                  {collaborator.status}
                </Badge>
                <Badge className={getLevelColor(collaborator.level)}>
                  {collaborator.level}
                </Badge>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-sanjer-green">{collaborator.coinFits}</div>
              <div className="text-xs text-gray-500">CoinFits</div>
            </div>
          </div>
          
          {/* Information sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h4 className="font-medium mb-3 text-gray-600">Información Personal</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Área:</span>
                  <span className="col-span-2">{collaborator.area}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Teléfono:</span>
                  <span className="col-span-2">{collaborator.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Dirección:</span>
                  <span className="col-span-2">{collaborator.address}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Última Actividad:</span>
                  <span className="col-span-2">{collaborator.lastActive}</span>
                </div>
              </div>
            </div>
            
            {/* Medical Information */}
            <div>
              <h4 className="font-medium mb-3 text-gray-600">Información Médica</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Altura:</span>
                  <span className="col-span-2">{collaborator.height} cm</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Peso:</span>
                  <span className="col-span-2">{collaborator.weight} kg</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">IMC:</span>
                  <span className="col-span-2">{collaborator.bmi}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Tipo Sangre:</span>
                  <span className="col-span-2">{collaborator.bloodType}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div>
            <h4 className="font-medium mb-3 text-gray-600">Información Adicional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500 text-sm">Alergias:</span>
                <p>{collaborator.allergies || "Ninguna registrada"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500 text-sm">Padecimientos:</span>
                <p>{collaborator.medicalConditions || "Ninguno registrado"}</p>
              </div>
            </div>
          </div>
          
          {/* Level information */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium mb-2 text-blue-800">Información de Nivel: {collaborator.level}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collaborator.level === 'KoalaFit' && (
                <div className="border-l-4 border-purple-400 pl-3">
                  <p className="text-sm">Metas Diarias:</p>
                  <ul className="text-xs list-disc list-inside text-gray-700">
                    <li>3,000 pasos</li>
                    <li>20 minutos activos</li>
                    <li>10 CoinFits por día</li>
                  </ul>
                </div>
              )}
              
              {collaborator.level === 'JaguarFit' && (
                <div className="border-l-4 border-blue-400 pl-3">
                  <p className="text-sm">Metas Diarias:</p>
                  <ul className="text-xs list-disc list-inside text-gray-700">
                    <li>6,000 pasos</li>
                    <li>30 minutos activos</li>
                    <li>10 CoinFits por día</li>
                  </ul>
                </div>
              )}
              
              {collaborator.level === 'HalconFit' && (
                <div className="border-l-4 border-green-400 pl-3">
                  <p className="text-sm">Metas Diarias:</p>
                  <ul className="text-xs list-disc list-inside text-gray-700">
                    <li>10,000 pasos</li>
                    <li>45 minutos activos</li>
                    <li>10 CoinFits por día</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
