import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { format } from 'date-fns';

const currency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Fetch all transactions (sales and purchases) for the customer
  const { data: transactions } = await supabase
    .from('stock_moves')
    .select('*, products(name)')
    .eq('party_id', params.id)
    .order('ts', { ascending: false });

  // Fetch all payments for the customer
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('party_id', params.id)
    .order('created_at', { ascending: false });

  const totalSales = transactions?.filter(t => t.kind === 'sale').reduce((sum, t) => sum + t.qty * t.price_per_unit, 0) || 0;
  const totalPurchases = transactions?.filter(t => t.kind === 'purchase').reduce((sum, t) => sum + t.qty * t.price_per_unit, 0) || 0;
  const totalPaymentsReceived = payments?.filter(p => p.direction === 'in').reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold">Total Sales</h3>
        <p className="text-2xl font-bold text-blue-600">{currency(totalSales)}</p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold">Payments Received</h3>
        <p className="text-2xl font-bold text-green-600">{currency(totalPaymentsReceived)}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Transaction History</h2>
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
            {transactions?.map((t) => (
              <tr key={t.id}>
                <td className="px-6 py-4">{new Date(t.ts).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.kind === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {t.kind}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{t.products?.name}</td>
                <td className="px-6 py-4 text-right">{currency(t.qty * t.price_per_unit)}</td>
              </tr>
            ))}
            {payments?.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Payment
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">Payment received via {p.method} to {p.instrument_ref}</td>
                <td className="px-6 py-4 text-right">{currency(p.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}