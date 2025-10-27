import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Search, Users, Shield, Key, Edit, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { GenericForm } from '@/components/forms/GenericForm'
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog'
import { AvatarWithTemporaryUrl } from '@/components/ui/AvatarWithTemporaryUrl'
import { User, getUsers, createUser, updateUser, deleteUser, CreateUserPayload, UpdateUserPayload, syncUserPermissions } from '@/lib/services/users.service'
import { Permission, getPermissions } from '@/lib/services/permissions.service'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-toastify'

const userSchema = z.object({
  name: z.string().min(3, 'O nome é obrigatório.'),
  email: z.string().email('O e-mail é inválido.'),
  login:z.string().min(3, 'O login é obrigatório.'),
  password: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const hasUpperCase = /[A-Z]/.test(val);
      const hasLowerCase = /[a-z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasMinLength = val.length >= 8;
      return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
    },
    { message: "A senha deve ter no mínimo 8 caracteres, com maiúsculas, minúsculas e números." }
  ),
  role: z.string().min(1, "O perfil é obrigatório."), // Ajustado para string para compatibilidade com o form
  status: z.enum(['ativo', 'inativo']),
  avatar: z.any()
    .transform((value) => {
      if (value instanceof FileList) return value[0] || null;
      return value;
    })
    .refine(
      (file) => !(file instanceof File) || file.size <= 2 * 1024 * 1024, // 2MB
      `O tamanho máximo do avatar é de 2MB.`
    )
    .refine(
      (file) => !(file instanceof File) || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Formato de arquivo inválido. Use JPG, PNG ou WebP."
    )
    .optional().nullable(),
});

export function Usuarios() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [modalPermissoesAberto, setModalPermissoesAberto] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null); // Usuário para o form de edição
  const [userToManagePermissions, setUserToManagePermissions] = useState<User | null>(null); // Usuário para o modal de permissões
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5, 
  });

  const { data: allPermissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
    staleTime: 1000 * 60 * 60, 
  });

  const { mutate: createUserMutation, isPending: isCreating } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao criar: ${error.message}`),
  });

  const { mutate: updateUserMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) => updateUser(id, payload),
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao atualizar: ${error.message}`),
  });

  const { mutate: deleteUserMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAlertOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao excluir: ${error.message}`),
  });

  const { mutate: syncPermissionsMutation, isPending: isSyncingPermissions } = useMutation({
    mutationFn: ({ userId, permissionIds }: { userId: number, permissionIds: number[] }) => syncUserPermissions(userId, permissionIds),
    onSuccess: () => {
      toast.success("Permissões atualizadas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalida a query de usuários para buscar os dados atualizados
      setModalPermissoesAberto(false);
      setUserToManagePermissions(null);
    },
    onError: (error: Error) => toast.error(`Erro ao salvar permissões: ${error.message}`),
  });

  const filteredUsers = useMemo(() => users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRole = !roleFilter || (user.roles && user.roles[0] && user.roles[0].name.toLowerCase() === roleFilter);
    const matchStatus = !statusFilter || user.status === statusFilter
    
    return matchSearch && matchRole && matchStatus
  }), [users, searchTerm, roleFilter, statusFilter]);

  const activeUsersCount = users.filter(u => u.status === 'ativo').length;
  const masterUsersCount = users.filter(u => u.roles && u.roles[0]?.name.toLowerCase() === 'master').length;
  const managerUsersCount = users.filter(u => u.roles && u.roles[0]?.name.toLowerCase() === 'gerente').length;
  const auxUsersCount = users.filter(u => u.roles && u.roles[0]?.name.toLowerCase() === 'auxiliar').length;

  const handleFormSubmit = (data: z.infer<typeof userSchema>) => {
    const payload = { ...data };
    if (userToEdit && !payload.password) {
      delete payload.password;
    }

    if (userToEdit) {
      updateUserMutation({ id: userToEdit.id, payload });
    } else {
      createUserMutation(payload as CreateUserPayload);
    }
  };

  const handleEditClick = (user: User) => {
    const userWithRoleName = {
      ...user,
      role: user.roles[0]?.name|| 'auxiliar'
    };
    setUserToEdit(userWithRoleName as any);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation(userToDelete);
    }
  };

  const handleOpenNewModal = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleManagePermissionsClick = (user: User) => {
    setUserToManagePermissions(user);
    const currentUserPermissionIds = new Set(user.permissions.map(p => p.id));
    setSelectedPermissions(currentUserPermissionIds);
    setModalPermissoesAberto(true)
  }

  const handleSalvarPermissoes = () => {
    if (userToManagePermissions) {
      syncPermissionsMutation({
        userId: userToManagePermissions.id,
        permissionIds: Array.from(selectedPermissions),
      });
    }
  }

  const handlePermissionChange = (permissionId: number, isChecked: boolean) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(permissionId);
      } else {
        newSet.delete(permissionId);
      }
      return newSet;
    });
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel?.toLowerCase()) {
      case 'Admin': return 'bg-red-100 text-red-800'
      case 'Gerente': return 'bg-blue-100 text-blue-800'
      case 'Auxiliar': return 'bg-green-100 text-green-800'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getNivelLabel = (nivel: string) => {
    switch (nivel?.toLowerCase()) {
      case 'master': return 'Master'
      case 'gerente': return 'Gerente'
      case 'auxiliar': return 'Auxiliar'
      default: return nivel
    }
  }

  const groupedPermissions = useMemo(() => {
    return allPermissions.reduce((acc, permission) => {
      (acc[permission.group] = acc[permission.group] || []).push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [allPermissions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Acessos</h1>
          <p className="text-muted-foreground">Gerencie usuários e permissões do sistema</p>
        </div>
        <Button onClick={handleOpenNewModal}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold text-green-600">{activeUsersCount}</p>}
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Masters</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold text-red-600">{masterUsersCount}</p>}
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gerentes</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold text-blue-600">{managerUsersCount}</p>}
              </div>
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auxiliares</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold text-purple-600">{auxUsersCount}</p>}
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="busca" placeholder="Nome ou e-mail..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="filtroNivel">Nível</Label>
              <Select onValueChange={(value) => setRoleFilter(value === "all" ? "" : value)} value={roleFilter || "all"}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="auxiliar">Auxiliar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroStatus">Status</Label>
              <Select onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)} value={statusFilter || "all"}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead className='text-center'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))}
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <AvatarWithTemporaryUrl path={user.avatar} fallback={user.name.charAt(0).toUpperCase()} />
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getNivelColor(user.roles[0]?.name)}`}>
                      {getNivelLabel(user.roles[0]?.name || 'auxiliar')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(new Date(user.created_at))}</TableCell>
                  <TableCell>
                    <div className=" space-x-2 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleManagePermissionsClick(user)}
                        title="Gerenciar Permissões"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(user)}
                        title="Editar Usuário"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(user.id)}
                        title="Excluir Usuário"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalPermissoesAberto} onOpenChange={setModalPermissoesAberto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Permissões - {userToManagePermissions?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([groupName, permissions]) => (
              <div key={groupName}>
                <h4 className="font-semibold mb-2 border-b pb-1">{groupName}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        checked={selectedPermissions.has(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`perm-${permission.id}`} className="text-sm font-normal" title={permission.description}>{permission.description}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setModalPermissoesAberto(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSalvarPermissoes} disabled={isSyncingPermissions}>
                {isSyncingPermissions ? 'Salvando...' : 'Salvar Permissões'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GenericForm
        isOpen={isModalOpen}
        onOpenChange={(isOpen) => { if (!isOpen) setUserToEdit(null); setIsModalOpen(isOpen); }}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
        initialData={userToEdit}
        fields={[
          { name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Nome do usuário', gridCols: 2, disabled: false },
          { name: 'email', label: 'E-mail', type: 'email', placeholder: 'usuario@empresa.com', gridCols: 2, disabled: false },
          { name: 'login', label: 'Login', type: 'text', placeholder: 'Login de acesso', gridCols: 2, disabled: false },
          { name: 'password', label: `Senha ${userToEdit ? '(deixe vazio para manter)' : ''}`, type: 'password', placeholder: 'Senha de acesso', gridCols: 2, disabled: false },
          { name: 'role', label: 'Perfil de Acesso', type: 'select', options: [{ value: 'Auxiliar', label: 'Auxiliar' }, { value: 'Gerente', label: 'Gerente' }, { value: 'Admin', label: 'Admin' }], gridCols: 1, disabled: false },
          { name: 'status', label: 'Status', type: 'select', options: [{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }], gridCols: 1, disabled: false },
          { name: 'avatar', label: 'Avatar', type: 'file', accept: '.png,.jpg,.jpeg,.webp', placeholder: 'Selecione uma imagem ',gridCols: 2, disabled: false },
        ]}
        schema={userSchema}
        title={userToEdit ? 'Editar Usuário' : 'Novo Usuário'}
        description="Preencha as informações para gerenciar o acesso do usuário."
      />

      <DeleteConfirmationDialog
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        description="Essa ação não pode ser desfeita. Isso irá excluir permanentemente o usuário."
      />
    </div>
  )
}