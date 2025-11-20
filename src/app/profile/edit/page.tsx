// src/app/profile/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Camera } from 'lucide-react';

export default function EditProfilePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    dob: '',
    address: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current data
  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            dob: data.dob ? data.dob.split('T')[0] : '',
            address: data.address || '',
          });
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Handle Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Optimistic UI update (optional, but good UX)
      setAvatarUrl(URL.createObjectURL(file));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setAvatarUrl(data.url); // Set the real URL from server
      
    } catch (err) {
      alert("Failed to upload profile picture");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/profile/info');
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-black";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-xl mx-auto p-8">
          <h1 className="text-3xl font-bold text-black mb-6">Edit Profile</h1>
          
          {isLoading ? (
            <p className="text-gray-700">Loading...</p>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
              
              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center">
                <div className="relative h-24 w-24">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-teal-50">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 shadow-md transition-colors">
                    <Camera size={16} />
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">Change Profile Photo</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className={labelStyle}>First Name</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputStyle} required />
                  </div>
                  <div className="w-1/2">
                    <label className={labelStyle}>Last Name</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>
                
                <div>
                  <label className={labelStyle}>Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} />
                </div>
                
                <div>
                  <label className={labelStyle}>Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputStyle} />
                </div>
                
                <div>
                  <label className={labelStyle}>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} className={`${inputStyle} h-24`}></textarea>
                </div>

                <div className="pt-4 flex space-x-4">
                  <button type="button" onClick={() => router.back()} className="w-1/2 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSaving} className="w-1/2 py-3 bg-teal-600 text-white rounded-md font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}