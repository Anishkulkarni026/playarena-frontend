// src/app/sports/turfs/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link'; // <-- 1. IMPORT LINK

// Define the shape of a Venue
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

export default function TurfsPage() {
  const [turfs, setTurfs] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues`);
        if (!res.ok) throw new Error('Failed to fetch venues');
        
        const allVenues: Venue[] = await res.json();
        
        const filteredTurfs = allVenues.filter(
          venue => venue.sport_category.toLowerCase() === 'football' || venue.sport_category.toLowerCase() === 'turf'
        );
        setTurfs(filteredTurfs);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-black mb-6">
          Explore All Turfs
        </h1>

        {isLoading && <p className="text-gray-700">Loading turfs...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {!isLoading && !error && (
          <div>
            {turfs.length === 0 ? (
              <p className="text-lg text-gray-700">No approved turfs found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {turfs.map((turf) => (
                  <div key={turf.id} className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-black mb-2">{turf.name}</h2>
                    <p className="text-gray-600 mb-1">{turf.address}</p>
                    <p className="text-gray-800 mb-3">₹{turf.price_per_hour.toFixed(2)} per hour</p>
                    <p className="text-sm text-gray-500 mb-4">{turf.description}</p>
                    
                    {/* --- 2. THIS IS THE FIX --- */}
                    <Link href={`/venues/${turf.id}`}>
                      <button className="py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold">
                        View Details
                      </button>
                    </Link>
                    {/* ------------------------ */}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}