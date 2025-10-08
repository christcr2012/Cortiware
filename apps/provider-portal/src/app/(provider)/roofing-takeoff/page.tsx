/**
 * Roofing Takeoff Prototype Page
 * 
 * Client-only demo page for roofing measurements.
 * Allows providers to click on a canvas to measure roof areas.
 */

import { Takeoff } from './Takeoff';

export const metadata = {
  title: 'Roofing Takeoff | Cortiware',
  description: 'Measure roof areas for estimates',
};

export default function RoofingTakeoffPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Takeoff />
    </div>
  );
}

