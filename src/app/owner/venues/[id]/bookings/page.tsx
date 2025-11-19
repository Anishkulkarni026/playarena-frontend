// src/app/owner/venues/[id]/bookings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Interface for the booking data
interface VenueBooking {
  booking_id: number;
  venue_name: string;
  user_first_name: string;
  user_last_name: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
}

export default function VenueBookingsPage() {
  const params = useParams();
  const venueId = params.id as string;
  const { token } = useAuth();
  
  const [bookings, setBookings] = useState<VenueBooking[]>([]);
  const [venueName, setVenueName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !venueId) return;

    const fetchVenueBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch bookings');
        }

        const data: VenueBooking[] = await res.json();
        setBookings(data);
        if (data.length > 0) {
          setVenueName(data[0].venue_name); // Set venue name from the first booking
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenueBookings();
  }, [token, venueId]);

  // Helper to format the status with colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-6xl mx-auto p-8">
          <div className="mb-4">
            <Link href="/owner/dashboard" className="text-teal-600 hover:text-teal-800">
              &larr; Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-black mb-6">
            Bookings for {venueName || `Venue ${venueId}`}
          </h1>
          
          {isLoading && <p className="text-gray-700">Loading bookings...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              {bookings.length === 0 ? (
                <p className="p-6 text-lg text-gray-700">No bookings found for this venue.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.booking_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{booking.user_first_name} {booking.user_last_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(booking.start_time).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{booking.total_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}