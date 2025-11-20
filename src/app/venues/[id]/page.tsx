// src/app/venues/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Interfaces
interface Venue {
  id: number;
  name: string;
  sport_category: string;
  description: string;
  address: string;
  price_per_hour: number;

  // NEW FIELDS
  opening_time: string;
  closing_time: string;
  lunch_start_time?: string;
  lunch_end_time?: string;
}

interface VenuePhoto {
  id: number;
  image_url: string;
}
interface BookedSlot {
  start_time: string;
  end_time: string;
}

export default function VenueDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isLoggedIn, token } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [photos, setPhotos] = useState<VenuePhoto[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  // UI States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // --- HELPER: Convert 24h to 12h format ---
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes} ${ampm}`;
  };

  // Generate next 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  const dateOptions = generateDates();

  // ✅ NEW SMART TIME SLOT GENERATION
  const generateTimeSlots = () => {
    if (!venue) return [];

    const slots = [];
    const startHour = parseInt(venue.opening_time.split(':')[0]);
    const endHour = parseInt(venue.closing_time.split(':')[0]);

    let lunchStart = -1;
    let lunchEnd = -1;

    if (venue.lunch_start_time && venue.lunch_end_time) {
      lunchStart = parseInt(venue.lunch_start_time.split(':')[0]);
      lunchEnd = parseInt(venue.lunch_end_time.split(':')[0]);
    }

    for (let i = startHour; i < endHour; i++) {
      if (lunchStart !== -1 && i >= lunchStart && i < lunchEnd) {
        continue;
      }
      const hour = i < 10 ? `0${i}` : i;
      slots.push(`${hour}:00`);
    }
    return slots;
  };

  const timeSlots = venue ? generateTimeSlots() : [];

  // Fetch Venue & Photos
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [venueRes, photosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/photos`)
        ]);

        if (venueRes.ok) setVenue(await venueRes.json());
        if (photosRes.ok) setPhotos(await photosRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch Booked Slots
  useEffect(() => {
    if (!id) return;
    const fetchSlots = async () => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/slots?date=${dateStr}`);
        if (res.ok) {
          setBookedSlots(await res.json());
          setSelectedTime(null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  const isSlotBooked = (timeStr: string) => {
    const slotStart = new Date(`${selectedDate.toISOString().split('T')[0]}T${timeStr}:00`);
    return bookedSlots.some(booking => {
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      return slotStart >= bookingStart && slotStart < bookingEnd;
    });
  };

  const handleBooking = async () => {
    if (!isLoggedIn || !token) {
      router.push(`/login?redirect=/venues/${id}`);
      return;
    }
    if (!selectedTime) return;

    setIsBooking(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    const startDateTime = new Date(`${dateStr}T${selectedTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings`, {
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
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      router.push(`/bookings/${data.id}/pay`);

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Booking failed');
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/slots?date=${dateStr}`)
        .then(r => r.json())
        .then(data => setBookedSlots(data));
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-5xl mx-auto p-6">
        {isLoading || !venue ? (
          <p className="text-center text-gray-600">Loading venue...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: Photos & Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {photos.length > 0 ? (
                  <div className="w-full h-80">
                    <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} loop={true} className="h-full w-full">
                      {photos.map((photo) => (
                        <SwiperSlide key={photo.id}>
                          <img src={photo.image_url} alt={venue.name} className="w-full h-full object-cover" />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500">No Photos</div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
                      <p className="text-gray-500 mt-1">{venue.address}</p>
                    </div>
                    <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-bold">
                      {venue.sport_category}
                    </div>
                  </div>
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed">{venue.description || "No description available."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Slot Picker */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Book Your Slot</h2>

                {/* Date Picker Pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                  {dateOptions.map((date) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-lg border transition-all ${isSelected
                            ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-teal-500'
                          }`}
                      >
                        <span className="text-xs font-medium uppercase">{dayName}</span>
                        <span className="text-lg font-bold">{dayNum}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots Grid */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3 font-medium">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((time) => {
                      const booked = isSlotBooked(time);
                      const selected = selectedTime === time;

                      return (
                        <button
                          key={time}
                          disabled={booked}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 text-sm font-medium rounded border transition-all ${booked
                              ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed line-through'
                              : selected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-white text-teal-700 border-teal-500 hover:bg-teal-50'
                            }`}
                        >
                          {formatTime(time)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer / Action */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Price</span>
                    <span className="text-xl font-bold text-gray-900">₹{venue.price_per_hour}</span>
                  </div>

                  {/* ✅ Terms Checkbox (NEW) */}
                  <div className="mb-4">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the <span className="text-teal-600 underline cursor-pointer">Terms & Conditions</span>, including the cancellation policy and venue rules.
                      </label>
                    </div>
                  </div>

                  {/* Updated Book Button */}
                  <button
                    onClick={handleBooking}
                    disabled={!selectedTime || isBooking || !termsAccepted}
                    className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${!selectedTime || !termsAccepted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'
                      }`}
                  >
                    {isBooking ? 'Processing...' : selectedTime ? `Book ${formatTime(selectedTime)}` : 'Select a Time'}
                  </button>
                </div>


              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
