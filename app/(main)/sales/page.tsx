"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const currency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);

export default function SalesPage() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState<number | "">(0);
  const [rate, setRate] = useState<number | "">(0);
  const [amount, setAmount] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number | "">(0);
  const [paymentRecipient, setPaymentRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSaveSale = async () => {
    if (!customer || !qty || !rate) {
      alert("Please fill in all details.");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        party_name: customer,
        item: { product, qty: Number(qty), rate: Number(rate) },
        payment: { amount: Number(paymentAmount), recipient: paymentRecipient }
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save sale');

      alert("✅ Sale and Payment saved successfully!");
      router.push(`/customers/${result.party_id}`);

    } catch (err: any) {
      alert("❌ Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Sales Entry (Simplified)</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Customer & Product</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Customer Name</label>
          <input value={customer} onChange={e => setCustomer(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Enter customer name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <input value={product} onChange={e => setProduct(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Enter product name" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Qty</label>
            <input type="number" value={qty} onChange={e => {setQty(e.target.value === '' ? '' : Number(e.target.value)); setAmount(Number(e.target.value) * Number(rate));}} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rate</label>
            <input type="number" value={rate} onChange={e => {setRate(e.target.value === '' ? '' : Number(e.target.value)); setAmount(Number(e.target.value) * Number(qty));}} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Amount</label>
            <input type="number" value={amount} readOnly className="w-full px-3 py-2 border rounded-md bg-gray-100" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Record Payment</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recipient</label>
            <input value={paymentRecipient} onChange={e => setPaymentRecipient(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. PhonePe" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSaveSale} disabled={loading} className="px-8 py-3 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Sale'}
        </button>
      </div>
    </div>
  );
}