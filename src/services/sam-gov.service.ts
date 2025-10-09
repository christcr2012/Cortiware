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
  state?: string; // Two-letter state code
  city?: string;
  zipCode?: string;
  radius?: number; // Miles from zipCode
  setAsideTypes?: string[]; // SBA, 8AN, HZC, WOSB, VO, etc.
  limit?: number;
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

  url.searchParams.set('limit', (params.limit || 50).toString());

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

