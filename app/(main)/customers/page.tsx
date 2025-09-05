import { createClient } from '@/lib/supabase/server';
import CustomerClientPage from './customer-client-page';

export default async function CustomersPage() {
  const supabase = await createClient();
  
  // Call the new Supabase function to get parties with their totals
  const { data: parties, error } = await supabase.rpc('get_parties_with_totals');

  if (error) {
    console.error('Error fetching parties with totals:', error);
  }

  // FIX: Passing the 'parties' data as 'initialParties'
  return <CustomerClientPage initialParties={parties || []} />;
}