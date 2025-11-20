// src/app/bookings/upcoming/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// UPDATED interface
interface Booking {
  id: number;
  user_id: number;
  venue_id: number;
  venue_name: string;      
  sport_category: string;  
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
}

export default function UpcomingBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchBookings = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/mine`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch your bookings');

      const allBookings: Booking[] = await res.json();

      const upcoming = allBookings.filter(
        b => new Date(b.start_time) > new Date() && b.status === 'confirmed'
      );

      setBookings(upcoming);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleCancel = async (bookingID: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/${bookingID}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');

      setMessage('Booking canceled successfully.');
      fetchBookings();
    } catch (err) {
      setMessage(err instanceof Error ? `Error: ${err.message}` : 'Unknown error');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            Upcoming Bookings
          </h1>

          {isLoading && <p className="text-gray-700">Loading your bookings...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {message && <p className="text-blue-600 mb-4">{message}</p>}

          {!isLoading && !error && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-lg text-gray-700">You have no upcoming bookings.</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-semibold text-black mb-2">
                          {booking.sport_category} at {booking.venue_name}
                        </h2>

                        <p className="text-gray-800">
                          <strong>Date:</strong> {new Date(booking.start_time).toLocaleDateString()}
                        </p>
                        <p className="text-gray-800">
                          <strong>Time:</strong> {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                          {' '} - {' '} 
                          {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>

                        <p className="text-gray-600">
                          <strong>Status:</strong>{" "}
                          <span className="capitalize font-medium text-green-600">{booking.status}</span>
                        </p>

                        <p className="text-gray-600">
                          <strong>Price:</strong> ₹{booking.total_price.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold"
                      >
                        Cancel Booking
                      </button>
                    </div>
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
