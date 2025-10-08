/**
 * Roofing Takeoff Tool - CLIENT/OWNER PORTAL (Roofing Vertical)
 *
 * Roofing-specific measurement tool for calculating roof dimensions and materials.
 * Allows roofing contractors to click on a canvas to measure roof areas.
 *
 * Access: Owner-only (not available to staff/field users)
 * Availability: Only visible to clients with roofing vertical enabled
 *
 * Part of the Roofing vertical pack tools.
 */

import { Takeoff } from './Takeoff';

export const metadata = {
  title: 'Roofing Takeoff | Cortiware',
  description: 'Measure roof areas and calculate materials for estimates',
};

export default function RoofingTakeoffPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Takeoff />
    </div>
  );
}

