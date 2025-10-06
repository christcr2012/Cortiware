// Service-layer contract for Organizations
// Decouples App Router handlers from Prisma specifics.
// TODO(sonnet): Implement using Prisma relations to resolve org from user.

export type Organization = { id: string; name?: string };

export interface OrganizationService {
  /** Resolve the current user's organization (MVP assumes a single org). */
  getForUser(userEmail: string): Promise<Organization | null>;
}

export const organizationService: OrganizationService = {
  async getForUser(_userEmail: string) {
    // TODO(sonnet): Prisma join from User -> Organization via memberships/tenant relation
    throw new Error('Not implemented');
  },
};

