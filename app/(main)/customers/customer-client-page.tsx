"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Define the new type which includes the totals
type PartyWithTotals = {
  id: number;
  name: string;
  phone: string | null;
  role: 'customer' | 'supplier' | 'both';
  total_sales: number;
  total_purchases: number;
};

const currency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default function CustomerClientPage({ initialParties }: { initialParties: PartyWithTotals[] }) {
  const [parties, setParties] = useState(initialParties);
  const [filter, setFilter] = useState<'all' | 'customer' | 'supplier'>('all');

  const filteredParties = useMemo(() => {
    if (filter === 'all') return parties;
    if (filter === 'customer') return parties.filter(p => p.role === 'customer' || p.role === 'both');
    if (filter === 'supplier') return parties.filter(p => p.role === 'supplier' || p.role === 'both');
    return [];
  }, [filter, parties]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers & Suppliers</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex space-x-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>All</button>
            <button onClick={() => setFilter('customer')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'customer' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Customers</button>
            <button onClick={() => setFilter('supplier')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'supplier' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Suppliers</button>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchases</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParties.map((party) => (
                <tr key={party.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    <Link href={`/customers/${party.id}`} className="text-blue-600 hover:underline">
                      {party.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${party.role === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {party.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">{currency(party.total_sales)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">{currency(party.total_purchases)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}