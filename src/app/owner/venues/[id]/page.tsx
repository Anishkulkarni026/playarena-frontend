// src/app/venues/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// 1. Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Define the Venue interface
interface Venue {
  id: number;
  name: string;
  sport_category: string;
  description: string;
  address: string;
  price_per_hour: number;
}

// Interface for Photos
interface VenuePhoto {
  id: number;
  image_url: string;
}

export default function VenueDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isLoggedIn, token } = useAuth();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [photos, setPhotos] = useState<VenuePhoto[]>([]); // State for photos
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Fetch Venue Data & Photos
  useEffect(() => {
    if (!id) return;

    const fetchVenueData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Set up both API requests
        const venueDetailsPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}`);
        const venuePhotosPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/photos`);

        // Wait for both to finish
        const [detailsRes, photosRes] = await Promise.all([venueDetailsPromise, venuePhotosPromise]);

        // Process venue details
        if (detailsRes.status === 404) throw new Error('Venue not found.');
        if (!detailsRes.ok) throw new Error('Failed to fetch venue data');
        const detailsData: Venue = await detailsRes.json();
        setVenue(detailsData);

        // Process venue photos
        if (!photosRes.ok) {
          console.warn("Could not fetch photos, but venue data is loaded.");
          setPhotos([]); 
        } else {
          const photosData: VenuePhoto[] = await photosRes.json();
          setPhotos(photosData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenueData();
  }, [id]);

  // Handle Booking
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    setBookingMessage('');

    if (!isLoggedIn || !token) {
      setBookingMessage('Error: You must be logged in to book.');
      setIsBooking(false);
      return;
    }
    
    const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          venue_id: parseInt(id),
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');
      
      setBookingMessage('Success! Your booking is confirmed.');
      setTimeout(() => {
        router.push('/bookings/upcoming');
      }, 2000);
    } catch (err) {
      setBookingMessage(err instanceof Error ? `Error: ${err.message}` : 'An unknown error occurred');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-4xl mx-auto p-8">
        
        {isLoading && <p className="text-gray-700 text-xl">Loading venue details...</p>}
        {error && <p className="text-red-500 text-xl">Error: {error}</p>}
        
        {!isLoading && !error && venue && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Venue Details & Photos */}
            <div className="bg-white rounded-lg shadow-md p-8 space-y-6 overflow-hidden">
              
              {/* --- CAROUSEL SECTION --- */}
              {photos.length > 0 ? (
                <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg relative">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full h-full"
                  >
                    {photos.map((photo) => (
                      <SwiperSlide key={photo.id}>
                        <div className="relative w-full h-full">
                          {/* Use standard img tag for simplicity with external URLs */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={photo.image_url} 
                            alt={venue.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                  <p className="text-gray-500">No photos available</p>
                </div>
              )}
              {/* --- END CAROUSEL --- */}

              <h1 className="text-4xl font-bold text-black">{venue.name}</h1>
              <p className="text-lg text-gray-500">{venue.address}</p>
              <p className="text-2xl font-semibold text-teal-600">
                ₹{venue.price_per_hour.toFixed(2)} / hour
              </p>
              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-2xl font-semibold text-black mb-2">Description</h2>
                <p className="text-lg text-gray-700">{venue.description || "No description provided."}</p>
              </div>
            </div>

            {/* Right Column: Booking Form */}
            <div className="bg-white rounded-lg shadow-md p-8 h-fit">
              <h2 className="text-3xl font-bold text-black mb-6">Book Your Slot</h2>
              
              {!isLoggedIn ? (
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-4">You must be logged in to book a venue.</p>
                  <Link href={`/login?redirect=/venues/${id}`}>
                    <button className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold">
                       Login to Book
                    </button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Select Date</label>
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Select Start Time (1-hour slots)</label>
                    <input
                      type="time"
                      id="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-black"
                      step="3600" // Only allow hourly steps
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isBooking}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold disabled:bg-gray-400"
                  >
                    {isBooking ? 'Booking...' : 'Book Now'}
                  </button>
                  {bookingMessage && (
                    <p className={`text-center ${bookingMessage.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
                      {bookingMessage}
                    </p>
                  )}
                </form>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}