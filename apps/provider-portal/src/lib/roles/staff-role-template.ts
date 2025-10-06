export type StaffRoleCapabilities = {
  canExpand: boolean;
  canLimit: boolean;
  canRename: boolean;
  canClone: boolean;
  canCreateVariants: boolean;
};

export type StaffRoleConstraints = {
  dataVisibility?: any;
  timeRestrictions?: any;
  approvalWorkflows?: any;
};

export const STAFF_ROLE_TEMPLATE = {
  name: 'Staff',
  basePermissions: [
    'dashboard:view',
    'lead:read',
  ],
  defaultConstraints: {},
  customizationOptions: {
    capabilities: {
      canExpand: true,
      canLimit: true,
      canRename: true,
      canClone: true,
      canCreateVariants: true,
    } as StaffRoleCapabilities,
    constraints: {} as StaffRoleConstraints,
  },
};

export const STAFF_ROLE_VARIANTS = {
  standard: {
    name: 'Standard Staff',
    additionalPermissions: [],
  },
} as const;

