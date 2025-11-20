// src/app/teams/new/page.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError("You must be logged in to create a team.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: teamName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create team');
      }

      // Success! Redirect back to the main teams page
      router.push('/teams');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle = "block text-sm font-medium text-gray-700";
  const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-black";

  return (
    <ProtectedRoute allowedRoles={['player', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            Create a New Team
          </h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div>
              <label htmlFor="teamName" className={labelStyle}>Team Name</label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className={inputStyle}
                required
                placeholder="e.g., The All-Stars"
              />
            </div>
            
            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="flex space-x-4">
              <Link href="/teams" className="w-1/2">
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-md text-black font-semibold"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="w-1/2 py-3 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold disabled:bg-gray-400"
              >
                {isLoading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}