// customer-history-client.tsx
"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

type PartyWithTotals = {
  id: number;
  name: string;
  phone: string | null;
  role: 'customer' | 'supplier' | 'both';
  total_sales: number;
  total_purchases: number;
  transactions: any[];
};

const currency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default function CustomerHistoryClient({ initialParty, initialHistory }: { initialParty: PartyWithTotals, initialHistory: any[] }) {
  const [party, setParty] = useState(initialParty);
  const [combinedHistory, setCombinedHistory] = useState(initialHistory);

  const totalSales = useMemo(() => combinedHistory?.filter(t => t.type === 'transaction' && t.kind === 'sale').reduce((sum, t) => sum + t.qty * t.price_per_unit, 0) || 0, [combinedHistory]);
  const totalPurchases = useMemo(() => combinedHistory?.filter(t => t.type === 'transaction' && t.kind === 'purchase').reduce((sum, t) => sum + t.qty * t.price_per_unit, 0) || 0, [combinedHistory]);
  const totalPaymentsReceived = useMemo(() => combinedHistory?.filter(p => p.type === 'payment' && p.direction === 'in').reduce((sum, p) => sum + p.amount, 0) || 0, [combinedHistory]);
  const totalPaymentsMade = useMemo(() => combinedHistory?.filter(p => p.type === 'payment' && p.direction === 'out').reduce((sum, p) => sum + p.amount, 0) || 0, [combinedHistory]);
  
  return (
    <div className="space-y-6">
      <div>
        <Link href="/customers" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to all parties</Link>
        <h1 className="text-3xl font-bold">{party.name}</h1>
        <p className="text-gray-600">{party.phone}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Sales</h3>
          <p className="text-2xl font-bold text-blue-600">{currency(totalSales)}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Purchases</h3>
          <p className="text-2xl font-bold text-green-600">{currency(totalPurchases)}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Payments Received</h3>
          <p className="text-2xl font-bold text-green-600">{currency(totalPaymentsReceived)}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Payments Made</h3>
          <p className="text-2xl font-bold text-red-600">{currency(totalPaymentsMade)}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Complete History</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {combinedHistory.length === 0 ? (
                 <tr><td colSpan={4} className="text-center p-4">No history found.</td></tr>
            ) : (
                combinedHistory.map((item, index) => {
                    if (item.type === 'transaction') {
                        const isSale = item.kind === 'sale';
                        return (
                          <tr key={`trans-${item.id}`}>
                            <td className="px-6 py-4">{format(new Date(item.ts), 'd/M/yyyy')}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isSale ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {isSale ? 'Sale' : 'Purchase'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{item.products?.name} ({item.products?.size || 'N/A'})</td>
                            <td className="px-6 py-4 text-right">{currency(item.qty * item.price_per_unit)}</td>
                          </tr>
                        );
                    } else if (item.type === 'payment') {
                        const isReceived = item.direction === 'in';
                        const description = `Payment via ${item.method}${item.instrument_ref ? ` to ${item.instrument_ref}` : ''}`;
                        return (
                          <tr key={`pay-${item.id}`}>
                            <td className="px-6 py-4">{format(new Date(item.created_at), 'd/M/yyyy')}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isReceived ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {isReceived ? 'Payment' : 'Payment Made'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{description}</td>
                            <td className="px-6 py-4 text-right">{currency(item.amount)}</td>
                          </tr>
                        );
                    }
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}