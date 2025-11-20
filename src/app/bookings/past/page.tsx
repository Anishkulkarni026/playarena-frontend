// src/app/bookings/past/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Define the shape of a Booking
interface Booking {
  id: number;
  user_id: number;
  venue_id: number;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
  // We'll add venue_name later if we join tables
}

export default function PastBookingsPage() {
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
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch your bookings');
        }

        const allBookings: Booking[] = await res.json();

        // --- Filter for Past Bookings ---
        const pastBookings = allBookings.filter(b => 
          new Date(b.end_time) < new Date() && b.status === 'confirmed'
        );
        // ---------------------------------

        setBookings(pastBookings);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  return (
    // Protect this page so only logged-in users can see it
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            Past Bookings
          </h1>
          
          {isLoading && <p className="text-gray-700">Loading your bookings...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-lg text-gray-700">You have no past bookings.</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 opacity-75">
                    {/* TODO: Fetch and show venue name instead of ID */}
                    <h2 className="text-2xl font-semibold text-black mb-2">
                      Booking for Venue ID: {booking.venue_id}
                    </h2>
                    <p className="text-gray-800">
                      <strong>Date:</strong> {new Date(booking.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-gray-800">
                      <strong>Time:</strong> {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                    </p>
                    <p className="text-gray-600">
                      <strong>Status:</strong> <span className="capitalize font-medium text-gray-500">{booking.status}</span>
                    </p>
                    <p className="text-gray-600">
                      <strong>Price:</strong> ₹{booking.total_price.toFixed(2)}
                    </p>
                    {/* You could add a "Review Venue" button here */}
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