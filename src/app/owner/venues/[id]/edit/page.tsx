// src/app/owner/venues/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Interface for Photos
interface VenuePhoto {
  id: number;
  image_url: string;
}

// UPDATED Interface for Details
interface VenueDetails {
  name: string;
  sport_category: string;
  description: string;
  address: string;
  price_per_hour: number;

  opening_time: string;
  closing_time: string;
  lunch_start_time: string;
  lunch_end_time: string;
}

export default function EditVenuePage() {
  const params = useParams();
  const venueId = params.id as string;
  const { token } = useAuth();
  
  // State
  const [photos, setPhotos] = useState<VenuePhoto[]>([]);
  const [formData, setFormData] = useState<VenueDetails>({
    name: '',
    sport_category: 'Football',
    description: '',
    address: '',
    price_per_hour: 0,
    opening_time: '06:00',
    closing_time: '23:00',
    lunch_start_time: '',
    lunch_end_time: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [photoMessage, setPhotoMessage] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. Fetch Data (Photos + Details) ---
  useEffect(() => {
    if (!venueId) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [photosRes, detailsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/photos`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}`)
        ]);

        if (photosRes.ok) setPhotos(await photosRes.json());
        
        if (detailsRes.ok) {
          const data = await detailsRes.json();
          setFormData({
            name: data.name,
            sport_category: data.sport_category,
            description: data.description,
            address: data.address,
            price_per_hour: data.price_per_hour,

            opening_time: data.opening_time || '06:00',
            closing_time: data.closing_time || '23:00',
            lunch_start_time: data.lunch_start_time || '',
            lunch_end_time: data.lunch_end_time || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [venueId]);

  // --- 2. Update Venue Details ---
  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormMessage('Details updated successfully!');
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setFormMessage('Error updating details');
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. Handle New Photo Upload ---
  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !token) return;

    const fd = new FormData();
    fd.append('image', imageFile);

    setPhotoMessage('Uploading...');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/photos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        setPhotoMessage('Upload successful!');
        setImageFile(null);

        const newPhotosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/photos`);
        setPhotos(await newPhotosRes.json());
      } else {
        setPhotoMessage('Upload failed');
      }
    } catch (err) {
      setPhotoMessage('Error uploading');
    }
  };

  // --- 4. Handle Photo Deletion ---
  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Delete this photo?') || !token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/photos/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
         const newPhotosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/photos`);
         setPhotos(await newPhotosRes.json());
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Helper for inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const val =
      e.target.name === 'price_per_hour'
        ? parseFloat(e.target.value)
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-5xl mx-auto p-8">
          <div className="mb-6">
            <Link href="/owner/dashboard" className="text-teal-600 hover:underline">
              &larr; Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-black mb-8">Manage Venue</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN — EDIT DETAILS */}
            <div className="bg-white rounded-lg shadow-md p-8 h-fit">
              <h2 className="text-2xl font-semibold text-black mb-6">Edit Details</h2>
              
              <form onSubmit={handleUpdateDetails} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded text-black" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select name="sport_category" value={formData.sport_category} onChange={handleChange} className="w-full p-2 border rounded text-black">
                    <option value="Football">Football</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Snooker">Snooker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded text-black h-24" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded text-black" required />
                </div>

                {/* NEW TIME INPUTS */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                    <input
                      type="time"
                      name="opening_time"
                      value={formData.opening_time}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                    <input
                      type="time"
                      name="closing_time"
                      value={formData.closing_time}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-black"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lunch Start (Optional)</label>
                    <input
                      type="time"
                      name="lunch_start_time"
                      value={formData.lunch_start_time}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lunch End (Optional)</label>
                    <input
                      type="time"
                      name="lunch_end_time"
                      value={formData.lunch_end_time}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                  <input type="number" name="price_per_hour" value={formData.price_per_hour} onChange={handleChange} className="w-full p-2 border rounded text-black" required />
                </div>

                <button type="submit" disabled={isSaving} className="w-full py-2 bg-teal-600 text-white rounded font-semibold hover:bg-teal-700 disabled:bg-gray-400">
                  {isSaving ? 'Saving...' : 'Update Details'}
                </button>

                {formMessage && <p className="text-center text-green-600">{formMessage}</p>}
              </form>
            </div>

            {/* RIGHT COLUMN — PHOTOS */}
            <div className="bg-white rounded-lg shadow-md p-8 h-fit">
              <h2 className="text-2xl font-semibold text-black mb-6">Photos</h2>

              {/* Upload Form */}
              <form onSubmit={handlePhotoUpload} className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Photo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => e.target.files && setImageFile(e.target.files[0])} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                <button type="submit" className="mt-3 w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm">Upload</button>
                {photoMessage && <p className="text-sm text-center mt-2 text-gray-600">{photoMessage}</p>}
              </form>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.image_url} alt="Venue" className="w-full h-32 object-cover rounded-lg shadow-sm" />

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}

                {photos.length === 0 && (
                  <p className="text-gray-500 col-span-2 text-center py-4">No photos yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
