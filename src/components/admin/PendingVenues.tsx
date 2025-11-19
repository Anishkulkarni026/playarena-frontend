// src/components/admin/PendingVenues.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

// Define the shape of a Venue object
interface Venue {
  id: number;
  owner_id: number;
  status: string;
  name: string;
  sport_category: string;
  description: string;
  address: string;
  price_per_hour: number;
  created_at: string;
}

export default function PendingVenues() {
  // Initialize state as an empty array, not null
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setLoading(false); // Stop loading if no token
      return;
    }

    const fetchPendingVenues = async () => {
      setLoading(true); // Ensure loading is true
      try {
        const res = await fetch('http://localhost:8080/api/v1/admin/venues?status=pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch venues');
        }

        // --- THIS IS THE FIX ---
        // 1. Expect data to be Venue[] OR null
        const data: Venue[] | null = await res.json(); 
        // 2. If data is null, set state to an empty array
        setVenues(data || []); 
        // ---------------------

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingVenues();
  }, [token]);

  const handleUpdateStatus = async (id: number, newStatus: 'approved' | 'rejected') => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8080/api/v1/admin/venues/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setVenues(venues.filter(venue => venue.id !== id));
      
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) return <p className="text-gray-700">Loading pending venues...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-black mb-4">
        Pending Venue Approvals
      </h2>
      {/* This check is now safe because 'venues' will always be an array */}
      {venues.length === 0 ? (
        <p className="text-gray-500">No pending venues found.</p>
      ) : (
        <ul className="space-y-4">
          {venues.map(venue => (
            <li key={venue.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-black">{venue.name}</h3>
                <p className="text-sm text-gray-600">{venue.address}</p>
                <p className="text-sm text-gray-800">Category: {venue.sport_category}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateStatus(venue.id, 'approved')}
                  className="py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(venue.id, 'rejected')}
                  className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold text-sm"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}