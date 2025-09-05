import { createAdminClient } from '../../../lib/supabase/admin';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const supabase = createAdminClient();
  try {
    const { party_name, bill_no, items, payment } = await request.json();

    if (!party_name || !items || items.length === 0) {
      return NextResponse.json({ error: 'Customer Name and at least one item are required.' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('save_sale_and_payment', {
        p_party_name: party_name,
        p_bill_no: bill_no,
        p_items: items,
        p_payment_amount: payment?.amount || 0,
        p_payment_method: payment?.method || null,
        p_payment_recipient: payment?.recipient || null
    });
    
    if (error || !data || data.length === 0) {
        console.error('RPC Error:', error);
        return NextResponse.json({ error: 'Failed to save transaction.' }, { status: 500 });
    }
    
    const partyId = data[0].party_id;
    revalidatePath(`/customers/${partyId}`);

    return NextResponse.json({ message: 'Sale saved successfully!', party_id: partyId });

  } catch (error: any) {
    console.error('API Sales Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}