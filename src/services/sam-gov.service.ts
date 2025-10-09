/**
 * SAM.gov Lead Generation Service
 * 
 * Provides functionality for searching federal contract opportunities
 * and importing them as leads into the CRM.
 */

import { prisma } from '@/lib/prisma';

const SAM_API_BASE = 'https://api.sam.gov/opportunities/v2/search';

export interface SamGovOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  department?: string;
  subTier?: string;
  office?: string;
  postedDate: string;
  type: string;
  baseType?: string;
  archiveType?: string;
  archiveDate?: string;
  typeOfSetAsideDescription?: string;
  typeOfSetAside?: string;
  responseDeadLine?: string;
  naicsCode?: string;
  classificationCode?: string;
  active?: string;
  award?: any;
  pointOfContact?: Array<{
    fax?: string;
    type?: string;
    email?: string;
    phone?: string;
    title?: string;
    fullName?: string;
  }>;
  description?: string;
  organizationType?: string;
  officeAddress?: {
    zipcode?: string;
    city?: string;
    countryCode?: string;
    state?: string;
  };
  placeOfPerformance?: {
    city?: {
      code?: string;
      name?: string;
    };
    state?: {
      code?: string;
      name?: string;
    };
    zip?: string;
    country?: {
      code?: string;
      name?: string;
    };
  };
  additionalInfoLink?: string;
  uiLink?: string;
  links?: Array<{
    rel?: string;
    href?: string;
  }>;
  resourceLinks?: string[];
}

export interface SamGovSearchParams {
  keywords?: string;
  naicsCodes?: string[]; // Array of NAICS codes
  pscCodes?: string[]; // Product Service Codes
  postedFrom?: string; // YYYY-MM-DD
  postedTo?: string; // YYYY-MM-DD
  responseDeadlineFrom?: string; // YYYY-MM-DD
  responseDeadlineTo?: string; // YYYY-MM-DD
  state?: string; // Two-letter state code
  city?: string;
  zipCode?: string;
  radius?: number; // Miles from zipCode
  setAsideTypes?: string[]; // SBA, 8AN, HZC, WOSB, VO, etc.
  noticeTypes?: string[]; // Solicitation, Award, Sources Sought, etc.
  organizationType?: string; // OFFICE, SUBTIER, DEPT
  active?: boolean; // true = active only, false = archived only, undefined = all
  minContractValue?: number;
  maxContractValue?: number;
  limit?: number;
  offset?: number;
}

export interface SamGovSearchResult {
  opportunities: SamGovOpportunity[];
  totalRecords: number;
}

/**
 * Get SAM.gov API key for a tenant
 */
export async function getTenantSamGovApiKey(orgId: string): Promise<string | null> {
  const org = await prisma.customer.findUnique({
    where: { id: orgId },
    select: { metadata: true },
  });

  if (!org?.metadata) return null;

  const metadata = org.metadata as any;
  return metadata?.samGovApiKey || null;
}

/**
 * Save SAM.gov API key for a tenant
 */
export async function saveTenantSamGovApiKey(orgId: string, apiKey: string): Promise<void> {
  const org = await prisma.customer.findUnique({
    where: { id: orgId },
    select: { metadata: true },
  });

  const metadata = (org?.metadata as any) || {};
  metadata.samGovApiKey = apiKey;

  await prisma.customer.update({
    where: { id: orgId },
    data: { metadata },
  });
}

/**
 * Search SAM.gov opportunities
 */
export async function searchSamGovOpportunities(
  apiKey: string,
  params: SamGovSearchParams
): Promise<SamGovSearchResult> {
  const url = new URL(SAM_API_BASE);
  url.searchParams.set('api_key', apiKey);

  // Add search parameters
  if (params.keywords) {
    url.searchParams.set('q', params.keywords);
  }

  if (params.naicsCodes && params.naicsCodes.length > 0) {
    url.searchParams.set('naics', params.naicsCodes.join(','));
  }

  if (params.pscCodes && params.pscCodes.length > 0) {
    url.searchParams.set('psc', params.pscCodes.join(','));
  }

  if (params.postedFrom) {
    url.searchParams.set('postedFrom', params.postedFrom);
  }

  if (params.postedTo) {
    url.searchParams.set('postedTo', params.postedTo);
  }

  if (params.responseDeadlineFrom) {
    url.searchParams.set('responseDeadlineFrom', params.responseDeadlineFrom);
  }

  if (params.responseDeadlineTo) {
    url.searchParams.set('responseDeadlineTo', params.responseDeadlineTo);
  }

  if (params.state) {
    url.searchParams.set('state', params.state);
  }

  if (params.city) {
    url.searchParams.set('city', params.city);
  }

  if (params.zipCode) {
    url.searchParams.set('zip', params.zipCode);
    if (params.radius) {
      url.searchParams.set('radius', params.radius.toString());
    }
  }

  if (params.setAsideTypes && params.setAsideTypes.length > 0) {
    url.searchParams.set('typeOfSetAside', params.setAsideTypes.join(','));
  }

  if (params.noticeTypes && params.noticeTypes.length > 0) {
    url.searchParams.set('noticeType', params.noticeTypes.join(','));
  }

  if (params.organizationType) {
    url.searchParams.set('organizationType', params.organizationType);
  }

  if (params.active !== undefined) {
    url.searchParams.set('active', params.active ? 'true' : 'false');
  }

  url.searchParams.set('limit', (params.limit || 50).toString());

  if (params.offset) {
    url.searchParams.set('offset', params.offset.toString());
  }

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`SAM.gov API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const opportunities = data.opportunitiesData || [];
    const totalRecords = data.totalRecords || opportunities.length;

    return {
      opportunities,
      totalRecords,
    };
  } catch (error) {
    console.error('SAM.gov search error:', error);
    throw error;
  }
}

/**
 * Import SAM.gov opportunity as a lead
 */
export async function importOpportunityAsLead(
  orgId: string,
  userId: string,
  opportunity: SamGovOpportunity
): Promise<{ id: string; publicId: string }> {
  // Check if already imported
  const existingLead = await prisma.lead.findFirst({
    where: {
      orgId,
      sourceType: 'RFP',
      sourceDetail: opportunity.noticeId,
    },
  });

  if (existingLead) {
    return { id: existingLead.id, publicId: existingLead.publicId };
  }

  // Extract contact info
  const primaryContact = opportunity.pointOfContact?.[0];
  const contactName = primaryContact?.fullName || null;
  const email = primaryContact?.email || null;
  const phone = primaryContact?.phone || null;

  // Extract location
  const city = opportunity.placeOfPerformance?.city?.name || opportunity.officeAddress?.city || null;
  const state = opportunity.placeOfPerformance?.state?.code || opportunity.officeAddress?.state || null;
  const zip = opportunity.placeOfPerformance?.zip || opportunity.officeAddress?.zipcode || null;

  // Create lead
  const lead = await prisma.lead.create({
    data: {
      orgId,
      publicId: `RFP_${opportunity.noticeId}`,
      company: opportunity.department || opportunity.subTier || 'Federal Agency',
      contactName,
      email,
      phoneE164: phone,
      status: 'NEW',
      sourceType: 'RFP',
      sourceDetail: opportunity.noticeId,
      systemGenerated: false,
      city,
      state,
      zip,
      notes: `SAM.gov Opportunity: ${opportunity.title}\n\nSolicitation: ${opportunity.solicitationNumber || 'N/A'}\nPosted: ${opportunity.postedDate}\nDeadline: ${opportunity.responseDeadLine || 'N/A'}\nNAICS: ${opportunity.naicsCode || 'N/A'}\nSet-Aside: ${opportunity.typeOfSetAsideDescription || 'None'}\n\nDescription:\n${opportunity.description || 'No description available'}\n\nLink: ${opportunity.uiLink || opportunity.additionalInfoLink || 'N/A'}`,
      metadata: {
        samGov: {
          noticeId: opportunity.noticeId,
          solicitationNumber: opportunity.solicitationNumber,
          naicsCode: opportunity.naicsCode,
          responseDeadline: opportunity.responseDeadLine,
          setAsideType: opportunity.typeOfSetAsideDescription,
          uiLink: opportunity.uiLink,
        },
      },
    },
  });

  return { id: lead.id, publicId: lead.publicId };
}

/**
 * Get NAICS codes for common industries
 */
export const INDUSTRY_NAICS_CODES = {
  roofing: ['238160'], // Roofing Contractors
  hvac: ['238220'], // Plumbing, Heating, and Air-Conditioning Contractors
  janitorial: ['561720', '561740', '561790'], // Janitorial, Carpet Cleaning, Building Services
  construction: ['236220', '238'], // Commercial Building Construction, Specialty Trade Contractors
  landscaping: ['561730'], // Landscaping Services
  painting: ['238320'], // Painting and Wall Covering Contractors
  electrical: ['238210'], // Electrical Contractors
  plumbing: ['238220'], // Plumbing Contractors
};

/**
 * Get default NAICS codes for a tenant based on their industry
 */
export async function getTenantDefaultNaicsCodes(orgId: string): Promise<string[]> {
  const org = await prisma.customer.findUnique({
    where: { id: orgId },
    select: { metadata: true },
  });

  if (!org?.metadata) return [];

  const metadata = org.metadata as any;
  return metadata?.samGovNaicsCodes || [];
}

/**
 * NAICS Code descriptions
 */
export const NAICS_DESCRIPTIONS: Record<string, string> = {
  '238160': 'Roofing Contractors',
  '238220': 'Plumbing, Heating, and Air-Conditioning Contractors',
  '561720': 'Janitorial Services',
  '561740': 'Carpet and Upholstery Cleaning Services',
  '561790': 'Other Services to Buildings and Dwellings',
  '236220': 'Commercial and Institutional Building Construction',
  '238': 'Specialty Trade Contractors',
  '561730': 'Landscaping Services',
  '238320': 'Painting and Wall Covering Contractors',
  '238210': 'Electrical Contractors and Other Wiring Installation Contractors',
};

/**
 * Common PSC (Product Service Codes)
 */
export const COMMON_PSC_CODES: Record<string, string> = {
  'S201': 'Housekeeping- Custodial Janitorial',
  'S214': 'Housekeeping- Landscaping/Groundskeeping',
  'S299': 'Housekeeping- Other',
  'Y1AA': 'Construction of Structures and Facilities',
  'Z1DA': 'Maintenance of Real Property',
  'Z2AA': 'Utilities and Housekeeping Services',
};

/**
 * Set-Aside Types
 */
export const SET_ASIDE_TYPES: Record<string, string> = {
  'SBA': 'Small Business Set-Aside',
  '8AN': '8(a) Set-Aside',
  'HZC': 'HUBZone Set-Aside',
  'WOSB': 'Women-Owned Small Business',
  'EDWOSB': 'Economically Disadvantaged WOSB',
  'SDVOSB': 'Service-Disabled Veteran-Owned Small Business',
  'VSA': 'Veteran-Owned Small Business',
};

/**
 * Notice Types
 */
export const NOTICE_TYPES: Record<string, string> = {
  'Solicitation': 'Solicitation',
  'Presolicitation': 'Presolicitation',
  'Combined Synopsis/Solicitation': 'Combined Synopsis/Solicitation',
  'Award Notice': 'Award Notice',
  'Sources Sought': 'Sources Sought',
  'Special Notice': 'Special Notice',
  'Sale of Surplus Property': 'Sale of Surplus Property',
};

/**
 * Saved Search interface
 */
export interface SavedSearch {
  id: string;
  name: string;
  searchParams: SamGovSearchParams;
  createdAt: Date;
  lastRun?: Date;
  alertEnabled: boolean;
  alertFrequency?: 'daily' | 'weekly';
}

/**
 * Save a search template
 */
export async function saveSamGovSearch(
  orgId: string,
  name: string,
  searchParams: SamGovSearchParams,
  alertEnabled: boolean = false,
  alertFrequency?: 'daily' | 'weekly'
): Promise<SavedSearch> {
  const org = await prisma.customer.findUnique({
    where: { id: orgId },
    select: { metadata: true },
  });

  const metadata = (org?.metadata as any) || {};
  const savedSearches = metadata.samGovSavedSearches || [];

  const newSearch: SavedSearch = {
    id: `search_${Date.now()}`,
    name,
    searchParams,
    createdAt: new Date(),
    alertEnabled,
    alertFrequency,
  };

  savedSearches.push(newSearch);
  metadata.samGovSavedSearches = savedSearches;

  await prisma.customer.update({
    where: { id: orgId },
    data: { metadata },
  });

  return newSearch;
}

/**
 * Get saved searches for a tenant
 */
export async function getSavedSearches(orgId: string): Promise<SavedSearch[]> {
  const org = await prisma.customer.findUnique({
    where: { id: orgId },
    select: { metadata: true },
  });

  if (!org?.metadata) return [];

  const metadata = org.metadata as any;
  return metadata?.samGovSavedSearches || [];
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(orgId: string, searchId: string): Promise<void> {
  const org = await prisma.customer.findUnique({
    where: { id: orgId },
    select: { metadata: true },
  });

  const metadata = (org?.metadata as any) || {};
  const savedSearches = (metadata.samGovSavedSearches || []).filter(
    (s: SavedSearch) => s.id !== searchId
  );

  metadata.samGovSavedSearches = savedSearches;

  await prisma.customer.update({
    where: { id: orgId },
    data: { metadata },
  });
}

/**
 * Get SAM.gov analytics for a tenant
 */
export async function getSamGovAnalytics(orgId: string) {
  // Get all SAM.gov imported leads
  const leads = await prisma.lead.findMany({
    where: {
      orgId,
      sourceType: 'RFP',
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      metadata: true,
      state: true,
    },
  });

  // Aggregate by NAICS
  const byNaics: Record<string, number> = {};
  const byState: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const lead of leads) {
    const metadata = lead.metadata as any;
    const naics = metadata?.samGov?.naicsCode;
    if (naics) {
      byNaics[naics] = (byNaics[naics] || 0) + 1;
    }

    if (lead.state) {
      byState[lead.state] = (byState[lead.state] || 0) + 1;
    }

    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
  }

  // Calculate conversion rate
  const converted = leads.filter(l => l.status === 'CONVERTED').length;
  const conversionRate = leads.length > 0 ? (converted / leads.length) * 100 : 0;

  return {
    totalImported: leads.length,
    converted,
    conversionRate,
    byNaics,
    byState,
    byStatus,
  };
}

