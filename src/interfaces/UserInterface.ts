import { Permission } from "@/lib/services/permissions.service";

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string | null;
  pivot: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface User {
  id: number;
  login: string;
  name: string;
  email: string;
  active:number|undefined
  created_at: string;
  updated_at: string;
  roles: Role[];
  avatar: string | null;
  permissions: Permission[];
}
