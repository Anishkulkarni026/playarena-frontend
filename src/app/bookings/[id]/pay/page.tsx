// src/app/bookings/[id]/pay/page.tsx
"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PaymentPage() {
  const params = useParams();
  const bookingId = params.id;
  const router = useRouter();
  const { token } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Payment Successful! Booking Confirmed.");
        router.push('/bookings/upcoming');
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-black mb-6 text-center">Complete Payment</h1>
          
          <div className="bg-blue-50 p-4 rounded-md mb-6 text-blue-800 text-sm">
             Booking ID: <strong>#{bookingId}</strong>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-2 border rounded text-black" required />
            </div>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                <input type="text" placeholder="MM/YY" className="w-full p-2 border rounded text-black" required />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input type="text" placeholder="123" className="w-full p-2 border rounded text-black" required />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-3 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}