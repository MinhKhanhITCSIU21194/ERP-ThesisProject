export declare class Role {
  roleId: number;
  name: string;
  permissions: Record<string, any>;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  users: any[];
  hasPermission(resource: string, action: string): boolean;
  canManage(resource: string): boolean;
}
//# sourceMappingURL=role.d.ts.map
