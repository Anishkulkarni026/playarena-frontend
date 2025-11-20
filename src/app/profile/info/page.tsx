// src/app/profile/info/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  role: string;
  avatar_url: string;
}

export default function ProfileInfoPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-2xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-8">Your Profile</h1>

          {isLoading ? (
            <p className="text-gray-700">Loading profile...</p>
          ) : profile ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-teal-600 p-6 flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-teal-600 overflow-hidden border-2 border-white">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile.first_name} {profile.last_name}</h2>
                  <p className="text-teal-100 capitalize">{profile.role}</p>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span>{profile.phone || "No phone number added"}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span>{profile.dob ? new Date(profile.dob).toLocaleDateString() : "No DOB added"}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>{profile.address || "No address added"}</span>
                </div>

                <div className="pt-6">
                  <Link href="/profile/edit" className="block w-full text-center py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-md font-semibold">
                    Edit Information
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Failed to load profile.</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}