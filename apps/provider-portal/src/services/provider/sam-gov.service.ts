/**
 * SAM.gov Integration Service for Provider Portal
 * 
 * Provides functionality for:
 * - Entity validation and monitoring
 * - NAICS code analytics
 * - Exclusion list checking
 * - Registration expiration tracking
 */

import { prisma } from '@/lib/prisma';

const SAM_API_BASE = 'https://api.sam.gov';
const SAM_ENTITY_API = `${SAM_API_BASE}/entity-information/v3/entities`;
const SAM_EXCLUSIONS_API = `${SAM_API_BASE}/entity-information/v3/exclusions`;

export interface SamGovEntity {
  ueiSAM: string;
  entityName: string;
  registrationStatus: 'Active' | 'Inactive' | 'Expired';
  registrationDate: string;
  expirationDate: string;
  cageCode?: string;
  duns?: string;
  naicsCodes: string[];
  pscCodes: string[];
  businessTypes: string[];
  address: {
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface SamGovExclusion {
  ueiSAM: string;
  entityName: string;
  exclusionType: string;
  exclusionProgram: string;
  activeDate: string;
  terminationDate?: string;
}

export interface ClientSamStatus {
  orgId: string;
  orgName: string;
  ueiSAM?: string;
  registrationStatus: 'Active' | 'Inactive' | 'Expired' | 'Not Registered' | 'Unknown';
  expirationDate?: string;
  daysUntilExpiration?: number;
  naicsCodes: string[];
  isExcluded: boolean;
  lastChecked: Date;
}

/**
 * Validate a single entity in SAM.gov
 */
export async function validateSamEntity(ueiSAM: string): Promise<SamGovEntity | null> {
  const apiKey = process.env.SAM_API_KEY;
  if (!apiKey) {
    throw new Error('SAM_API_KEY not configured');
  }

  try {
    const url = `${SAM_ENTITY_API}?ueiSAM=${ueiSAM}&api_key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Entity not found
      }
      throw new Error(`SAM.gov API error: ${response.status}`);
    }

    const data = await response.json();
    const entity = data.entityData?.[0];

    if (!entity) {
      return null;
    }

    return {
      ueiSAM: entity.entityRegistration?.ueiSAM || ueiSAM,
      entityName: entity.entityRegistration?.legalBusinessName || 'Unknown',
      registrationStatus: entity.entityRegistration?.registrationStatus || 'Unknown',
      registrationDate: entity.entityRegistration?.registrationDate || '',
      expirationDate: entity.entityRegistration?.expirationDate || '',
      cageCode: entity.entityRegistration?.cageCode,
      duns: entity.entityRegistration?.duns,
      naicsCodes: entity.coreData?.naicsCodes?.map((n: any) => n.naicsCode) || [],
      pscCodes: entity.coreData?.pscCodes || [],
      businessTypes: entity.entityRegistration?.businessTypes || [],
      address: {
        line1: entity.coreData?.physicalAddress?.addressLine1,
        city: entity.coreData?.physicalAddress?.city,
        state: entity.coreData?.physicalAddress?.stateOrProvinceCode,
        zip: entity.coreData?.physicalAddress?.zipCode,
      },
    };
  } catch (error) {
    console.error('SAM.gov validation error:', error);
    throw error;
  }
}

/**
 * Check if entity is on exclusion list
 */
export async function checkExclusionList(ueiSAM: string): Promise<SamGovExclusion[]> {
  const apiKey = process.env.SAM_API_KEY;
  if (!apiKey) {
    throw new Error('SAM_API_KEY not configured');
  }

  try {
    const url = `${SAM_EXCLUSIONS_API}?ueiSAM=${ueiSAM}&api_key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No exclusions found
      }
      throw new Error(`SAM.gov Exclusions API error: ${response.status}`);
    }

    const data = await response.json();
    const exclusions = data.exclusionDetails || [];

    return exclusions.map((ex: any) => ({
      ueiSAM: ex.ueiSAM || ueiSAM,
      entityName: ex.name || 'Unknown',
      exclusionType: ex.classificationType || 'Unknown',
      exclusionProgram: ex.exclusionProgram || 'Unknown',
      activeDate: ex.activeDate || '',
      terminationDate: ex.terminationDate,
    }));
  } catch (error) {
    console.error('SAM.gov exclusion check error:', error);
    return [];
  }
}

/**
 * Get SAM.gov status for all client organizations
 */
export async function getAllClientSamStatus(): Promise<ClientSamStatus[]> {
  // Get all organizations from database
  const orgs = await prisma.customer.findMany({
    select: {
      id: true,
      company: true,
      metadata: true,
    },
  });

  const statuses: ClientSamStatus[] = [];

  for (const org of orgs) {
    const metadata = org.metadata as any;
    const ueiSAM = metadata?.ueiSAM || metadata?.samGov?.ueiSAM;

    if (!ueiSAM) {
      statuses.push({
        orgId: org.id,
        orgName: org.company || 'Unknown',
        registrationStatus: 'Not Registered',
        naicsCodes: [],
        isExcluded: false,
        lastChecked: new Date(),
      });
      continue;
    }

    try {
      const entity = await validateSamEntity(ueiSAM);
      const exclusions = await checkExclusionList(ueiSAM);

      if (!entity) {
        statuses.push({
          orgId: org.id,
          orgName: org.company || 'Unknown',
          ueiSAM,
          registrationStatus: 'Unknown',
          naicsCodes: [],
          isExcluded: exclusions.length > 0,
          lastChecked: new Date(),
        });
        continue;
      }

      const expirationDate = entity.expirationDate ? new Date(entity.expirationDate) : undefined;
      const daysUntilExpiration = expirationDate
        ? Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : undefined;

      statuses.push({
        orgId: org.id,
        orgName: org.company || entity.entityName,
        ueiSAM,
        registrationStatus: entity.registrationStatus,
        expirationDate: entity.expirationDate,
        daysUntilExpiration,
        naicsCodes: entity.naicsCodes,
        isExcluded: exclusions.length > 0,
        lastChecked: new Date(),
      });
    } catch (error) {
      console.error(`Error checking SAM.gov for org ${org.id}:`, error);
      statuses.push({
        orgId: org.id,
        orgName: org.company || 'Unknown',
        ueiSAM,
        registrationStatus: 'Unknown',
        naicsCodes: [],
        isExcluded: false,
        lastChecked: new Date(),
      });
    }
  }

  return statuses;
}

/**
 * Get NAICS code analytics across all clients
 */
export async function getNaicsAnalytics() {
  const statuses = await getAllClientSamStatus();
  
  const naicsCount: Record<string, { code: string; count: number; clients: string[] }> = {};

  for (const status of statuses) {
    for (const code of status.naicsCodes) {
      if (!naicsCount[code]) {
        naicsCount[code] = { code, count: 0, clients: [] };
      }
      naicsCount[code].count += 1;
      naicsCount[code].clients.push(status.orgName);
    }
  }

  return Object.values(naicsCount).sort((a, b) => b.count - a.count);
}

/**
 * Bulk validate all clients
 */
export async function bulkValidateClients() {
  const statuses = await getAllClientSamStatus();
  
  return {
    total: statuses.length,
    active: statuses.filter(s => s.registrationStatus === 'Active').length,
    expired: statuses.filter(s => s.registrationStatus === 'Expired').length,
    expiringSoon: statuses.filter(s => s.daysUntilExpiration && s.daysUntilExpiration <= 30).length,
    excluded: statuses.filter(s => s.isExcluded).length,
    notRegistered: statuses.filter(s => s.registrationStatus === 'Not Registered').length,
    statuses,
  };
}

