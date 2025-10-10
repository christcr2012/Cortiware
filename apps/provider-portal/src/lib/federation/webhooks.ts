import { prisma } from '@/lib/prisma';
import { hmacSHA256 } from './signature';

const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000; // 1 second

/**
 * Dispatch webhook event to registered endpoint
 * @param orgId - Organization ID
 * @param type - Event type (e.g., 'escalation.acknowledged')
 * @param payload - Event payload
 */
export async function dispatchEvent(orgId: string, type: string, payload: any): Promise<void> {
  try {
    // Look up webhook registration
    const registration = await prisma.webhookRegistration.findUnique({
      where: { orgId },
    });
    
    if (!registration || !registration.enabled) {
      console.log(`No active webhook registration for org ${orgId}`);
      return;
    }
    
    const body = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    
    // Compute signature
    const signature = `sha256:${hmacSHA256(registration.secretHash, body)}`;
    
    // Attempt delivery with retries
    let attempt = 0;
    let success = false;
    
    while (attempt < MAX_RETRIES && !success) {
      try {
        const response = await fetch(registration.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Provider-Signature': signature,
            'X-Provider-Event-Type': type,
          },
          body,
          signal: AbortSignal.timeout(10000), // 10s timeout
        });
        
        if (response.ok) {
          success = true;
          console.log(`Webhook delivered to ${orgId} for event ${type}`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        attempt++;
        console.error(`Webhook delivery attempt ${attempt} failed for ${orgId}:`, error);
        
        if (attempt < MAX_RETRIES) {
          // Exponential backoff
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    if (!success) {
      console.error(`Webhook delivery failed after ${MAX_RETRIES} attempts for ${orgId}`);
      // TODO: Insert into DLQ (dead letter queue) for manual retry
    }
  } catch (error) {
    console.error('Error dispatching webhook event:', error);
  }
}

