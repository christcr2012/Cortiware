'use client';

/**
 * Import Wizard Component
 * 
 * Client-only component that:
 * - Parses CSV files
 * - Generates *.import.json files for batch processing
 * - No new HTTP routes (uses existing batch job endpoints)
 */

import React, { useState } from 'react';

type Row = Record<string, any>;

export function ImportWizard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [entity, setEntity] = useState<string>('assets');
  const [fileName, setFileName] = useState<string>('');

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFileName(f.name);
    const reader = new FileReader();
    
    reader.onload = () => {
      const text = reader.result as string;
      // Naive CSV parse (comma only for demo)
      const [head, ...lines] = text.split(/\r?\n/).filter(Boolean);
      const cols = head.split(',');
      const r = lines.map((line) => {
        const vals = line.split(',');
        const obj: Row = {};
        cols.forEach((c, i) => {
          obj[c.trim()] = (vals[i] || '').trim();
        });
        return obj;
      });
      setRows(r);
    };
    
    reader.readAsText(f);
  }

  function download() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${entity}.import.json`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Import Wizard</h1>
        <p className="text-gray-600">
          Import data from CSV files. The wizard will generate a JSON file that can be used with batch import jobs.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entity Type
          </label>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="assets">Assets</option>
            <option value="customers">Customers</option>
            <option value="landfills">Landfills</option>
            <option value="routes">Routes</option>
            <option value="stops">Stops</option>
            <option value="services">Services</option>
            <option value="products">Products</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSV File
          </label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={onFile}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fileName && (
            <p className="mt-2 text-sm text-gray-500">
              Selected: {fileName}
            </p>
          )}
        </div>

        {rows.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-700">
                Rows parsed: <span className="text-blue-600">{rows.length}</span>
              </div>
              <button
                onClick={download}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Download {entity}.import.json
              </button>
            </div>

            <div className="bg-gray-50 rounded p-4 max-h-96 overflow-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 rows):</h3>
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(rows.slice(0, 5), null, 2)}
              </pre>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              💡 Tip: Drop the downloaded file into the importer CLI or use it with batch job endpoints.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How to use:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Select the entity type you want to import</li>
          <li>Upload a CSV file with your data</li>
          <li>Review the parsed data in the preview</li>
          <li>Download the generated JSON file</li>
          <li>Use the JSON file with existing batch import endpoints</li>
        </ol>
      </div>
    </div>
  );
}

