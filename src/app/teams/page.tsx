// src/app/teams/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

// Define the shape of the team data
interface UserTeam {
  team_id: number;
  team_name: string;
  owner_id: number;
  user_status: 'pending' | 'joined';
  joined_at: string | null;
}

export default function ExistingTeamsPage() {
  const [myTeams, setMyTeams] = useState<UserTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Get the token for API calls

  // Function to fetch teams
  const fetchMyTeams = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/teams/mine`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch your teams');

      const data: UserTeam[] = await res.json();
      setMyTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch teams on component load
  useEffect(() => {
    fetchMyTeams();
  }, [token]);

  // Function to handle accepting or rejecting an invite
  const handleInviteResponse = async (teamId: number, action: 'joined' | 'rejected') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/teams/${teamId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to respond to invite');
      }

      // Refresh the list of teams to show the change
      fetchMyTeams();

    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Separate teams into "joined" and "pending"
  const joinedTeams = myTeams.filter(team => team.user_status === 'joined');
  const pendingInvites = myTeams.filter(team => team.user_status === 'pending');

  return (
    <ProtectedRoute allowedRoles={['player', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-8">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-black">
              Your Teams
            </h1>
            <Link href="/teams/new">
              <button className="py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold">
                + Create New Team
              </button>
            </Link>
          </div>

          {isLoading && <p className="text-gray-700">Loading your teams...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="space-y-8">

              {/* --- Section 1: Pending Invitations --- */}
              <div>
                <h2 className="text-2xl font-semibold text-black mb-4">
                  Pending Invitations
                </h2>
                {pendingInvites.length === 0 ? (
                  <p className="text-gray-500">You have no pending invitations.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingInvites.map(team => (
                      <div key={team.team_id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-lg text-black">{team.team_name}</p>
                          <p className="text-sm text-gray-500">You have a pending invite.</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleInviteResponse(team.team_id, 'joined')}
                            className="py-1 px-3 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleInviteResponse(team.team_id, 'rejected')}
                            className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold text-sm"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- Section 2: Joined Teams --- */}
              <div>
                <h2 className="text-2xl font-semibold text-black mb-4">
                  Joined Teams
                </h2>
                {joinedTeams.length === 0 ? (
                  <p className="text-gray-500">You have not joined any teams yet.</p>
                ) : (
                  <div className="space-y-3">
                    {joinedTeams.map(team => (
                      <div key={team.team_id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-lg text-black">{team.team_name}</p>
                          <p className="text-sm text-green-600 font-medium">Joined</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          
                          {/* THIS IS THE FIX: 
                            The href now matches the file path src/app/teams/[id]/chat/page.tsx
                          */}
                          <Link href={`/teams/${team.team_id}/chat`}>
                            <button className="py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-semibold text-sm">
                              Chat
                            </button>
                          </Link>

                          {/* This link is correct and matches:
                            src/app/teams/manage/[id]/page.tsx
                          */}
                          <Link href={`/teams/manage/${team.team_id}`}>
                            <button className="py-1 px-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold text-sm">
                              Manage
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}