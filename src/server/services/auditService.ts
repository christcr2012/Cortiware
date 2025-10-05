export class ServiceError extends Error {
  statusCode: number;
  code: string;
  details?: any;
  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const auditService = {
  async list(_orgId: string, _opts: any) {
    return {
      items: [],
      page: 1,
      limit: 50,
      total: 0,
    };
  },
  async getById(_orgId: string, _id: string) {
    return {
      id: _id,
      action: 'noop',
      createdAt: new Date().toISOString(),
    };
  },
};

