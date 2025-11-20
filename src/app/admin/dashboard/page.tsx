// src/app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import PendingVenues from '@/components/admin/PendingVenues';
import Link from 'next/link';

// 1. NEW INTERFACE FOR STATS
interface VenueStats {
  venue_id: number;
  venue_name: string;
  sport_category: string;
  total_bookings: number;
  total_revenue: number;
}

// 2. NEW GROUPED TYPE
// This will look like:
// { "Football": [ ...venue stats... ], "Swimming": [ ...venue stats... ] }
type GroupedStats = Record<string, VenueStats[]>;

export default function AdminDashboardPage() {
  const [groupedStats, setGroupedStats] = useState<GroupedStats>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { token } = useAuth();

  // 3. FETCH NEW GROUPED STATISTICS
  useEffect(() => {
    if (!token) return;
    const fetchAdminStats = async () => {
      setIsLoadingStats(true);
      try {
        // 4. Call the new API endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/stats/by-venue`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data: VenueStats[] = await res.json();
        
        // 5. Group the flat array by sport_category
        const groups = data.reduce((acc, venue) => {
          const category = venue.sport_category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(venue);
          return acc;
        }, {} as GroupedStats);

        setGroupedStats(groups);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchAdminStats();
  }, [token]);


  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-black">
              Admin Dashboard
            </h1>
            <Link 
              href="/admin/bookings"
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold"
            >
              View All Bookings
            </Link>
          </div>
          <p className="text-lg text-gray-700 mb-6">
            Welcome, Admin. Here you can manage users, approve listings,
            and oversee the entire platform.
          </p>

          {/* --- 6. REBUILT Statistics Section --- */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">Platform Statistics by Venue</h2>
            
            {isLoadingStats ? (
              <p className="text-gray-700">Loading statistics...</p>
            ) : (
              <div className="space-y-8">
                {Object.keys(groupedStats).length === 0 ? (
                  <p className="p-6 bg-white rounded-lg shadow-md text-lg text-gray-700">
                    No statistics found.
                  </p>
                ) : (
                  // Outer loop: Iterate over Sport Categories
                  Object.entries(groupedStats).map(([category, venues]) => (
                    <div key={category}>
                      <h3 className="text-3xl font-semibold text-black mb-4 capitalize">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        {/* Inner loop: Iterate over Venues in that category */}
                        {venues.map(venue => (
                          <div key={venue.venue_id} className="bg-white p-6 rounded-lg shadow-md">
                            <h4 className="text-xl font-bold text-black mb-4">{venue.venue_name}</h4>
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium text-gray-500">Total Bookings</h5>
                                <p className="text-2xl font-bold text-black">{venue.total_bookings}</p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-500">Total Revenue</h5>
                                <p className="text-2xl font-bold text-black">₹{venue.total_revenue.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* --- Pending Venues (Unchanged) --- */}
          <PendingVenues />

        </div>
      </div>
    </ProtectedRoute>
  );
}