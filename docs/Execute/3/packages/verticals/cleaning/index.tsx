import React from 'react';
import { Api } from '../../shared/api-client'; // via TS path mapping

export const meta = {
  key: 'cleaning',
  nav: [
    { label: 'Leads', path: '/' },
    { label: 'Schedule', path: '/schedule' },
    { label: 'Invoices', path: '/invoices' }
  ]
};

function Leads(){ return <div><h1>Cleaning · Leads</h1><p>Import/Fetch/Score (wire to API)</p></div>; }
function Schedule(){ return <div><h1>Cleaning · Schedule</h1><p>Calendar/Grid/Map</p></div>; }
function Invoices(){ return <div><h1>Cleaning · Invoices</h1><p>Generate/Send/Pay</p></div>; }

export const routes = [
  { path: '/', element: React.createElement(Leads) },
  { path: '/schedule', element: React.createElement(Schedule) },
  { path: '/invoices', element: React.createElement(Invoices) }
];
