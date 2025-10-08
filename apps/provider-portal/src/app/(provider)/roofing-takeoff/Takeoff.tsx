'use client';

/**
 * Roofing Takeoff Component
 * 
 * Interactive canvas for measuring roof areas.
 * Click to add points, calculates area automatically.
 */

import React, { useState } from 'react';

type Point = { x: number; y: number };

function calculateArea(polygon: Point[]): number {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y;
  }
  return Math.abs(area / 2);
}

export function Takeoff() {
  const [polygon, setPolygon] = useState<Point[]>([]);

  function addPoint(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const newPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setPolygon([...polygon, newPoint]);
  }

  function reset() {
    setPolygon([]);
  }

  // Convert pixels to square feet (placeholder conversion)
  const areaPixels = calculateArea(polygon);
  const sqft = Math.round(areaPixels / 144); // Rough conversion
  const waste = Math.round(sqft * 0.1); // 10% waste factor

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Roofing Takeoff (Prototype)</h1>
        <p className="text-gray-600">
          Click on the canvas to measure roof areas. Each click adds a point to the polygon.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div
          onClick={addPoint}
          className="relative border-2 border-gray-300 rounded-lg cursor-crosshair bg-gray-50 hover:bg-gray-100 transition-colors"
          style={{ width: 600, height: 400 }}
        >
          {polygon.map((point, i) => (
            <div
              key={i}
              className="absolute bg-blue-600 rounded-full"
              style={{
                left: point.x - 4,
                top: point.y - 4,
                width: 8,
                height: 8,
              }}
            />
          ))}
          {polygon.length > 1 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
            >
              <polygon
                points={polygon.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
              />
            </svg>
          )}
          {polygon.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Click to start measuring
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-gray-600">
              Points: <span className="font-semibold text-gray-900">{polygon.length}</span>
            </div>
            <div className="text-sm text-gray-600">
              Area (est): <span className="font-semibold text-gray-900">{sqft} sqft</span>
            </div>
            <div className="text-sm text-gray-600">
              Waste (10%): <span className="font-semibold text-gray-900">{waste} sqft</span>
            </div>
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold text-blue-600">{sqft + waste} sqft</span>
            </div>
          </div>

          <button
            onClick={reset}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Prototype Notice:</h3>
        <p className="text-sm text-yellow-800">
          This is a simplified prototype. Production version should include:
        </p>
        <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
          <li>Image upload and overlay</li>
          <li>Scale calibration</li>
          <li>Multiple roof sections</li>
          <li>Pitch/slope calculations</li>
          <li>Material selection</li>
          <li>Export to estimate</li>
        </ul>
      </div>
    </div>
  );
}

