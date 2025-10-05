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

export const customerPortalService = {
  async verifyCustomerToken(token: string): Promise<{ customerId: string } | null> {
    // Placeholder: accept any non-empty token
    return token ? { customerId: 'cust_' + token.slice(0, 6) } : null;
  },
  async requestAppointment(input: any) {
    return { id: 'appt_' + Math.random().toString(36).slice(2, 8), ...input, status: 'requested' };
  },
  async getDashboard(customerId: string) {
    return { customerId, recentJobs: [], invoices: [], messages: [] };
  },
  async submitFeedback(input: any) {
    return { id: 'fb_' + Math.random().toString(36).slice(2, 8), ...input, receivedAt: new Date().toISOString() };
  },
};

