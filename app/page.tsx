import { createClient } from '@/lib/supabase/server';
import { Users, Package, ShoppingCart } from 'lucide-react';

export default async function Dashboard() {
  const supabase = await createClient();

  // Fetch count of customers
  const { count: customerCount } = await supabase.from('parties').select('*', { count: 'exact' });

  // Fetch count of products
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact' });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg shadow flex items-center gap-4">
          <Users className="h-8 w-8 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-500">Customers</p>
            <p className="text-2xl font-bold">{customerCount}</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow flex items-center gap-4">
          <Package className="h-8 w-8 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-500">Products</p>
            <p className="text-2xl font-bold">{productCount}</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow flex items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-500">Sales</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <p className="text-gray-500 mt-2">No recent activity to display.</p>
      </div>
    </div>
  );
}