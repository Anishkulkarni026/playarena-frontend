// src/app/profile/payments/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Download, Calendar, MapPin, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: number;
  venue_name: string;
  sport_category: string;
  total_price: number;
  created_at: string;
  status: string;
}

export default function PastPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        // We reuse the bookings API because every confirmed booking IS a payment
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/mine`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.ok) {
          const bookings = await res.json();
          // Filter for confirmed bookings only (actual payments)
          const paidBookings = bookings.filter((b: any) => b.status === 'confirmed');
          setTransactions(paidBookings);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-2">Transaction History</h1>
          <p className="text-gray-600 mb-8">View and download receipts for your past games.</p>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white p-12 rounded-xl text-center shadow-sm">
              <p className="text-gray-500 text-lg mb-4">No payment history found.</p>
              <Link href="/sports/turfs" className="text-teal-600 font-semibold hover:underline">
                Book your first game now
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wide">
                      <th className="p-4">Description</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{tx.venue_name}</span>
                            <span className="text-xs text-gray-500">{tx.sport_category} Booking</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(tx.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Success
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900">
                          ₹{tx.total_price.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <button className="text-gray-400 hover:text-teal-600 transition-colors" title="Download Receipt">
                            <Download className="w-5 h-5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}