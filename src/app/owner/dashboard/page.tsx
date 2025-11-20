// src/app/owner/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import DashboardChart from '@/components/DashboardChart';

// Interface for the Venue List
interface Venue {
  id: number;
  status: string;
  name: string;
  sport_category: string;
  price_per_hour: number;
}

// Interface for the Chart Data (from API)
interface VenueStats {
  venue_name: string;
  total_bookings: number;
  total_revenue: number;
}

export default function OwnerDashboardPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [chartData, setChartData] = useState<any[]>([]); // State for the chart
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // 1. Fetch Venue List
  useEffect(() => {
    if (!token) return;
    const fetchMyVenues = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/mine`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch venues');
        const data: Venue[] = await res.json();
        setVenues(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyVenues();
  }, [token]);

  // 2. Fetch Chart Data (Real Stats)
  useEffect(() => {
    if (!token) return;
    const fetchChartData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/stats/by-venue`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data: VenueStats[] = await res.json();
        
        // Transform API data for the Recharts component
        const formattedData = data.map(item => ({
          name: item.venue_name,
          bookings: item.total_bookings,
          revenue: item.total_revenue
        }));
        
        setChartData(formattedData);
      } catch (err) {
        console.error("Error loading chart data:", err);
      }
    };
    fetchChartData();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-black">
              Owner Dashboard
            </h1>
            <Link 
              href="/owner/venues/new" 
              className="py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold"
            >
              + List New Venue
            </Link>
          </div>
          
          {/* --- Chart Section (Real Data) --- */}
          <div className="mb-8">
             <DashboardChart data={chartData} />
          </div>

          {/* --- My Venues List Section (as Cards) --- */}
          <div>
            {isLoading && <p className="text-gray-700">Loading your venues...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            
            {!isLoading && !error && (
              <div>
                {venues.length === 0 ? (
                  <p className="p-6 bg-white rounded-lg shadow-md text-lg text-gray-700">
                    You have not listed any venues yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                      <div key={venue.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                        <div className="p-6 flex-grow">
                          <div className="flex justify-between items-center mb-2">
                            <h2 className="text-2xl font-semibold text-black">{venue.name}</h2>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(venue.status)}`}>
                              {venue.status}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4">₹{venue.price_per_hour.toFixed(2)} / hour</p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                          <Link 
                            href={`/owner/venues/${venue.id}/dashboard`} 
                            className="flex-1 py-2 px-3 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-sm"
                          >
                            Stats & Bookings
                          </Link>
                          <Link 
                            href={`/owner/venues/${venue.id}/edit`} 
                            className="flex-1 py-2 px-3 text-center bg-gray-200 hover:bg-gray-300 text-black rounded-md font-semibold text-sm"
                          >
                            Edit/Photos
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}