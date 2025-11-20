// src/app/sports/snooker/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link'; // 1. Import Link

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

export default function SnookerPage() {
  const [clubs, setClubs] = useState<Venue[]>([]);
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
        
        // Filter for Snooker Clubs
        const filteredClubs = allVenues.filter(
          venue => venue.sport_category.toLowerCase() === 'snooker'
        );
        setClubs(filteredClubs);

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
          Explore All Snooker Clubs
        </h1>

        {isLoading && <p className="text-gray-700">Loading snooker clubs...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!isLoading && !error && (
          <div>
            {clubs.length === 0 ? (
              <p className="text-lg text-gray-700">No approved snooker clubs found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club) => (
                  <div key={club.id} className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-black mb-2">{club.name}</h2>
                    <p className="text-gray-600 mb-1">{club.address}</p>
                    <p className="text-gray-800 mb-3">₹{club.price_per_hour.toFixed(2)} per hour</p>
                    <p className="text-sm text-gray-500 mb-4">{club.description}</p>
                    
                    {/* 2. Wrap button in Link */}
                    <Link href={`/venues/${club.id}`}>
                      <button className="py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold">
                        View Details
                      </button>
                    </Link>
                    
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