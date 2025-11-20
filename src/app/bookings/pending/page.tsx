// src/app/bookings/pending/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Define the shape of a Booking
interface Booking {
  id: number;
  venue_id: number;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
}

export default function PendingBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Get the token for the API call

  useEffect(() => {
    if (!token) return; // Wait for the token

    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/mine`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch your bookings');

        const allBookings: Booking[] = await res.json();

        // --- Filter for Pending Bookings ---
        const pending = allBookings.filter(b => b.status === 'pending');
        // ----------------------------------

        setBookings(pending);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            Pending Bookings
          </h1>
          
          {isLoading && <p className="text-gray-700">Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-lg text-gray-700">You have no pending bookings.</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-black mb-2">
                      Booking for Venue ID: {booking.venue_id}
                    </h2>
                    <p className="text-gray-800">
                      <strong>Date:</strong> {new Date(booking.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      <strong>Status:</strong> <span className="capitalize font-medium text-yellow-600">{booking.status}</span>
                    </p>
                    <p className="text-gray-600 mb-4">
                      <strong>Price:</strong> ₹{booking.total_price.toFixed(2)}
                    </p>
                    {/* This button will later link to the payment page */}
                    <button className="py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-semibold text-sm">
                      Complete Payment
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}