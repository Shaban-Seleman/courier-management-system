import React from 'react';

export default function CouriersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Courier Fleet</h1>
        <button className="px-4 py-2 bg-logistics-600 text-white rounded-lg text-sm font-medium hover:bg-logistics-700 shadow-sm shadow-logistics-500/30">
          Add Courier
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
        Courier management and tracking interface coming soon.
      </div>
    </div>
  );
}
