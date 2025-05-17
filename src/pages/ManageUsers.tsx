
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, User, Eye } from 'lucide-react';
import { CollaboratorModal } from '@/components/collaborators/CollaboratorModal';
import { CollaboratorView } from '@/components/collaborators/CollaboratorView';
import { Collaborator } from '@/types/collaborator';

const initialCollaborators: Collaborator[] = [
  {
    id: '1',
    name: 'Carlos Mendez',
    email: 'c.mendez@sanjerfit.com',
    phone: '301-555-0123',
    area: 'Contabilidad',
    level: 'JaguarFit',
    status: 'Activo',
    photo: '',
    address: 'Calle 123 #45-67',
    occupation: 'Contador',
    weight: 75,
    height: 175,
    bloodType: 'O+',
    allergies: 'Ninguna',
    medicalConditions: 'Ninguna',
    bmi: '24.5',
    coinFits: 120,
    lastActive: '2025-05-15'
  },
  {
    id: '2',
    name: 'Mariana López',
    email: 'm.lopez@sanjerfit.com',
    phone: '302-555-0456',
    area: 'Recursos Humanos',
    level: 'HalconFit',
    status: 'Activo',
    photo: '',
    address: 'Av Principal #28-14',
    occupation: 'Analista RRHH',
    weight: 58,
    height: 162,
    bloodType: 'A+',
    allergies: 'Polen',
    medicalConditions: 'Ninguna',
    bmi: '22.1',
    coinFits: 185,
    lastActive: '2025-05-16'
  },
  {
    id: '3',
    name: 'Roberto Sánchez',
    email: 'r.sanchez@sanjerfit.com',
    phone: '304-555-0789',
    area: 'Tecnología',
    level: 'KoalaFit',
    status: 'Inactivo',
    photo: '',
    address: 'Carrera 45 #12-34',
    occupation: 'Desarrollador',
    weight: 82,
    height: 180,
    bloodType: 'B-',
    allergies: 'Mariscos',
    medicalConditions: 'Hipertensión',
    bmi: '25.3',
    coinFits: 75,
    lastActive: '2025-05-10'
  }
];

const ManageUsers = () => {
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [currentCollaborator, setCurrentCollaborator] = useState<Collaborator | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCollaborators = collaborators.filter(
    collaborator => 
      collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setCurrentCollaborator(null);
    setEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (collaborator: Collaborator) => {
    setCurrentCollaborator(collaborator);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const openViewModal = (collaborator: Collaborator) => {
    setCurrentCollaborator(collaborator);
    setIsViewModalOpen(true);
  };

  const handleSaveCollaborator = (collaborator: Collaborator) => {
    if (editMode) {
      // Update existing collaborator
      setCollaborators(prevCollaborators => 
        prevCollaborators.map(c => 
          c.id === collaborator.id ? collaborator : c
        )
      );
      toast({
        title: "Colaborador actualizado",
        description: `${collaborator.name} ha sido actualizado correctamente`,
      });
    } else {
      // Add new collaborator with status explicitly set to a valid type value
      const newCollaborator: Collaborator = {
        ...collaborator,
        id: String(Date.now()),
        status: 'Activo', // Explicitly typed as one of the allowed values
        lastActive: new Date().toISOString().split('T')[0]
      };
      setCollaborators(prevCollaborators => [...prevCollaborators, newCollaborator]);
      toast({
        title: "Colaborador añadido",
        description: `${newCollaborator.name} ha sido añadido correctamente`,
      });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsAlertDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      const collaboratorToDelete = collaborators.find(c => c.id === deleteId);
      setCollaborators(prevCollaborators => 
        prevCollaborators.filter(c => c.id !== deleteId)
      );
      toast({
        title: "Colaborador eliminado",
        description: collaboratorToDelete 
          ? `${collaboratorToDelete.name} ha sido eliminado del sistema`
          : "El colaborador ha sido eliminado del sistema",
      });
      setIsAlertDialogOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Gestión de Colaboradores" 
        subtitle="Administra los colaboradores registrados en el sistema SanjerFit"
      />
      
      <div className="p-6 flex-1">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={openAddModal} className="bg-sanjer-green hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Añadir Colaborador
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>CoinFits</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollaborators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      No se encontraron colaboradores con esa búsqueda
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCollaborators.map((collaborator) => (
                    <TableRow key={collaborator.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {collaborator.photo ? (
                              <AvatarImage src={collaborator.photo} alt={collaborator.name} />
                            ) : (
                              <AvatarFallback>
                                {collaborator.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>{collaborator.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{collaborator.email}</TableCell>
                      <TableCell>{collaborator.area}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${
                            collaborator.level === 'HalconFit' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : collaborator.level === 'JaguarFit' 
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          }`}
                        >
                          {collaborator.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={collaborator.status === 'Activo' ? 'default' : 'secondary'}
                        >
                          {collaborator.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{collaborator.coinFits}</TableCell>
                      <TableCell>{collaborator.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => openViewModal(collaborator)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => openEditModal(collaborator)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => confirmDelete(collaborator.id)}
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add/Edit Collaborator Modal */}
      <CollaboratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCollaborator}
        collaborator={currentCollaborator}
        isEditMode={editMode}
      />

      {/* View Collaborator Modal */}
      {currentCollaborator && (
        <CollaboratorView
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          collaborator={currentCollaborator}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El colaborador será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageUsers;
