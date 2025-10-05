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

type ContactInput = { name?: string; email?: string; phone?: string; organizationId?: string };

export const contactService = {
  async list(_orgId: string, opts: { page: number; limit: number; search?: string }) {
    return { items: [], page: opts.page, limit: opts.limit, total: 0 };
  },
  async create(_orgId: string, _userId: string, input: ContactInput) {
    return { id: `contact_${Math.random().toString(36).slice(2,8)}`, ...input, createdAt: new Date().toISOString() };
  },
  async getById(_orgId: string, id: string) {
    return { id, name: 'Placeholder', email: 'placeholder@rs.local' };
  },
  async update(_orgId: string, _userId: string, id: string, input: ContactInput) {
    return { id, ...input, updatedAt: new Date().toISOString() };
  },
  async delete(_orgId: string, _userId: string, _id: string) {
    return { ok: true };
  },
};

