// FIX: Using a relative path to avoid the '@/' alias issue.
import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { kind, party_name, notes, items } = await request.json();

    if (!kind || !party_name || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Step 1: Find or create the party (customer/supplier)
    let partyId;
    const { data: existingParty } = await supabase
      .from('parties')
      .select('id')
      .ilike('name', party_name.trim())
      .single();

    if (existingParty) {
      partyId = existingParty.id;
    } else {
      const { data: newParty, error: partyError } = await supabase
        .from('parties')
        .insert({ name: party_name.trim(), role: kind === 'sale' ? 'customer' : 'supplier' })
        .select('id')
        .single();
      if (partyError) throw partyError;
      partyId = newParty.id;
    }

    // Step 2: Prepare the stock move records to be inserted
    const movesToInsert = items.map((item: any) => ({
      kind: kind,
      party_id: partyId,
      product_id: item.product_id,
      qty: item.qty,
      price_per_unit: item.price_per_unit,
      notes: notes || null,
    }));

    // Step 3: Insert all the stock moves in a single operation
    const { data, error } = await supabase.from('stock_moves').insert(movesToInsert).select();

    if (error) {
      throw error;
    }

    // Return the partyId so we can redirect on the frontend
    return NextResponse.json({ party_id: partyId });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}