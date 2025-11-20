// src/app/bookings/canceled/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Booking {
  id: number;
  venue_id: number;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
}

export default function CanceledBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/mine`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch your bookings');

        const allBookings: Booking[] = await res.json();

        // --- Filter for Canceled Bookings ---
        const canceled = allBookings.filter(b => b.status === 'canceled');
        setBookings(canceled);

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
            Canceled Bookings
          </h1>
          
          {isLoading && <p className="text-gray-700">Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-lg text-gray-700">You have no canceled bookings.</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 opacity-60">
                    <h2 className="text-2xl font-semibold text-black mb-2">
                      Booking for Venue ID: {booking.venue_id}
                    </h2>
                    <p className="text-gray-800">
                      <strong>Date:</strong> {new Date(booking.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      <strong>Status:</strong> <span className="capitalize font-medium text-red-600">{booking.status}</span>
                    </p>
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