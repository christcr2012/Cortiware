export function createStaffConstraintEnforcer(_orgId: string, _userId: string) {
  return {
    async enforceSensitiveActionConstraints(_action: 'read' | 'write' | 'delete', _entityType: string, _entityId: string, _policy: any) {
      return { approved: true };
    }
  };
}

