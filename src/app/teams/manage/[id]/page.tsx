// src/app/teams/manage/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';

// Define the shape of the member data
interface TeamMember {
  user_id: number;
  team_id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: 'pending' | 'joined';
}

export default function ManageTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const { token } = useAuth();
  const params = useParams();
  const teamId = params.id as string; // Get team ID from URL

  // Function to fetch team members
  const fetchMembers = async () => {
    if (!token || !teamId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/teams/${teamId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch members');
      }
      const data: TeamMember[] = await res.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'You may not be a member of this team');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch members on load
  useEffect(() => {
    fetchMembers();
  }, [token, teamId]);

  // Handle inviting a new member
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/teams/${teamId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      setInviteMessage('Invite sent successfully!');
      setInviteEmail('');
      fetchMembers(); // Refresh the member list
    } catch (err) {
      setInviteMessage(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const joinedMembers = members.filter(m => m.status === 'joined');
  const pendingMembers = members.filter(m => m.status === 'pending');

  return (
    <ProtectedRoute allowedRoles={['player', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            Manage Team
          </h1>

          {isLoading && <p className="text-gray-700">Loading team members...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Member Lists */}
              <div className="md:col-span-2 space-y-6">
                {/* Joined Members */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold text-black mb-4">Joined Members ({joinedMembers.length})</h2>
                  <ul className="divide-y divide-gray-200">
                    {joinedMembers.map(member => (
                      <li key={member.user_id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="text-lg font-medium text-black">{member.first_name} {member.last_name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Pending Members */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold text-black mb-4">Pending Invites ({pendingMembers.length})</h2>
                  <ul className="divide-y divide-gray-200">
                    {pendingMembers.map(member => (
                      <li key={member.user_id} className="py-3">
                        <p className="text-lg font-medium text-black">{member.first_name} {member.last_name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Invite Form */}
              <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                <h2 className="text-2xl font-semibold text-black mb-4">Invite Member</h2>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">User's Email</label>
                    <input
                      type="email"
                      id="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-black"
                      placeholder="player@example.com"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold"
                  >
                    Send Invite
                  </button>
                  {inviteMessage && (
                    <p className={`text-sm text-center ${inviteMessage.startsWith('Invite sent') ? 'text-green-500' : 'text-red-500'}`}>
                      {inviteMessage}
                    </p>
                  )}
                </form>
              </div>

            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}