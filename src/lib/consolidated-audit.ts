type AuditEvent = { type: string; message: string; meta?: Record<string, any> };

export const consolidatedAudit = {
  async log(event: AuditEvent) {
    try { console.log('[audit]', event); } catch {}
  },
};

