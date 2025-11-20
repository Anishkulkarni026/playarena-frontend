// src/app/owner/venues/[id]/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Interface for Stats
interface OwnerStats {
  total_bookings: number;
  total_revenue: number;
  popular_time: string;
}

// Interface for Bookings
interface VenueBooking {
  booking_id: number;
  user_first_name: string;
  user_last_name: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
}

export default function VenueStatsDashboardPage() {
  const params = useParams();
  const venueId = params.id as string;
  const { token } = useAuth();

  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [bookings, setBookings] = useState<VenueBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NEW STATES FOR BLOCKING ---
  const [blockDate, setBlockDate] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  // Function to fetch data (extracted so we can call it again after blocking)
  const refreshData = async () => {
    if (!token || !venueId) return;
    // Keep existing data while refreshing to avoid flicker, unless it's first load
    if (!stats) setIsLoading(true); 
    
    try {
      const statsPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/venues/${venueId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const bookingsPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const [statsRes, bookingsRes] = await Promise.all([statsPromise, bookingsPromise]);

      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData: OwnerStats = await statsRes.json();
      setStats(statsData);

      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
      const bookingsData: VenueBooking[] = await bookingsRes.json();
      setBookings(bookingsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [token, venueId]);

  // --- NEW HANDLE BLOCK SLOT ---
  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsBlocking(true);

    // Create ISO timestamps
    const startDateTime = new Date(`${blockDate}T${blockStartTime}:00`);
    const endDateTime = new Date(`${blockDate}T${blockEndTime}:00`);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/block`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          venue_id: parseInt(venueId),
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString()
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to block slot');
      }
      
      alert("Slot blocked successfully!");
      
      // Clear form
      setBlockDate('');
      setBlockStartTime('');
      setBlockEndTime('');
      
      // Refresh the list to show the new block
      refreshData();

    } catch (err) {
      alert(err instanceof Error ? err.message : "Error blocking slot");
    } finally {
      setIsBlocking(false);
    }
  };

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

          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/owner/dashboard" className="text-teal-600 hover:text-teal-800">
              &larr; Back to All Venues
            </Link>

            {/* ✅ NEW: SCHEDULE BUTTON */}
            <Link
              href={`/owner/venues/${venueId}/schedule`}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold text-sm"
            >
              Schedule
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-black mb-6">Venue Dashboard</h1>

          {/* Statistics */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-500">Total Bookings</h3>
                <p className="text-3xl font-bold text-black">{isLoading ? '...' : stats?.total_bookings || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-500">Total Revenue</h3>
                <p className="text-3xl font-bold text-black">
                  {isLoading ? '...' : `₹${(stats?.total_revenue || 0).toFixed(2)}`}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-500">Popular Time</h3>
                <p className="text-3xl font-bold text-black">{isLoading ? '...' : stats?.popular_time || '--:--'}</p>
              </div>
            </div>
          </div>

          {/* Block Slot */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-red-500">
            <h2 className="text-xl font-bold text-black mb-4">Block Time Slot (Maintenance/Holiday)</h2>

            <form onSubmit={handleBlockSlot} className="flex flex-col md:flex-row gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date</label>
                <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)}
                  className="border p-2 rounded text-black" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Start Time</label>
                <input type="time" value={blockStartTime} onChange={e => setBlockStartTime(e.target.value)}
                  className="border p-2 rounded text-black" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">End Time</label>
                <input type="time" value={blockEndTime} onChange={e => setBlockEndTime(e.target.value)}
                  className="border p-2 rounded text-black" required />
              </div>
              <button
                type="submit"
                disabled={isBlocking}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold disabled:bg-gray-400"
              >
                {isBlocking ? "Blocking..." : "Block Slot"}
              </button>
            </form>
          </div>

          {/* Bookings */}
          <div>
            <h2 className="text-2xl font-semibold text-black mb-4">Bookings & Blocks</h2>

            {isLoading && <p className="text-gray-700">Loading bookings...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!isLoading && !error && (
              <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                {bookings.length === 0 ? (
                  <p className="p-6 text-lg text-gray-700">No bookings found.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.booking_id}>
                          <td className="px-6 py-4 text-sm text-black font-medium">
                            {booking.user_first_name} {booking.user_last_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(booking.start_time).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {" - "}
                            {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {booking.total_price === 0 ? "Block" : `₹${booking.total_price.toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}