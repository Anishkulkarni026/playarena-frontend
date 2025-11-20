// src/app/admin/bookings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// 1. Update the interface to include the new fields
interface AdminBooking {
  booking_id: number;
  venue_id: number;
  venue_name: string;
  sport_category: string;
  user_id: number;
  user_first_name: string; // <-- ADD THIS
  user_last_name: string;  // <-- ADD THIS
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
}

// Define the shape of our new grouped object
type GroupedBookings = Record<string, Record<string, AdminBooking[]>>;

export default function AdminAllBookingsPage() {
  const [groupedBookings, setGroupedBookings] = useState<GroupedBookings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchAllBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch bookings');
        }

        const data: AdminBooking[] = await res.json(); // API now sends names

        // Grouping logic remains the same
        const groups = data.reduce((acc, booking) => {
          const category = booking.sport_category;
          const venueName = booking.venue_name;

          if (!acc[category]) {
            acc[category] = {};
          }
          if (!acc[category][venueName]) {
            acc[category][venueName] = [];
          }

          acc[category][venueName].push(booking);
          return acc;
        }, {} as GroupedBookings); 

        setGroupedBookings(groups);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBookings();
  }, [token]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-6xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            All Platform Bookings
          </h1>
          
          {isLoading && <p className="text-gray-700">Loading all bookings...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="space-y-8">
              {Object.keys(groupedBookings).length === 0 ? (
                <p className="p-6 bg-white rounded-lg shadow-md text-lg text-gray-700">
                  No bookings found on the platform.
                </p>
              ) : (
                Object.entries(groupedBookings).map(([category, venues]) => (
                  <div key={category}>
                    <h2 className="text-3xl font-semibold text-black mb-4 capitalize">{category}</h2>
                    
                    <div className="space-y-6">
                      {Object.entries(venues).map(([venueName, bookings]) => (
                        <div key={venueName} className="bg-white rounded-lg shadow-md overflow-hidden">
                          <h3 className="text-xl font-bold text-black p-4 bg-gray-50 border-b">{venueName}</h3>
                          
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                {/* 2. Update table header */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bookings.map((booking) => (
                                <tr key={booking.booking_id}>
                                  <td className="px-6 py-4 text-sm text-gray-700">{new Date(booking.start_time).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">
                                    {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  {/* 3. Update table data cell to show name */}
                                  <td className="px-6 py-4 text-sm text-gray-700">{booking.user_first_name} {booking.user_last_name}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                      {booking.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700">₹{booking.total_price.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
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