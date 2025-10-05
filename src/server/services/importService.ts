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

export const importService = {
  async importContacts(_orgId: string, _userId: string, _rows: any[]) {
    return { imported: _rows.length, duplicates: 0, errors: 0 };
  },
};

