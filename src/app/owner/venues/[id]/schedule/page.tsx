// src/app/owner/venues/[id]/schedule/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  booking_id: number;
  user_first_name: string;
  user_last_name: string;
  user_phone: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
}

export default function VenueSchedulePage() {
  const params = useParams();
  const venueId = params.id as string;
  const { token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null); // For Modal
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bookings
  useEffect(() => {
    if (!token) return;
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/v1/venues/${venueId}/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [token, venueId]);

  // Filter bookings for the selected date
  const dailyBookings = bookings.filter(b => {
    const bookingDate = new Date(b.start_time);
    return bookingDate.toDateString() === selectedDate.toDateString();
  });

  // Generate time slots (06:00 to 23:00)
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6);

  // Helper to check if a slot has a booking
  const getBookingForSlot = (hour: number) => {
    return dailyBookings.find(b => {
      const startHour = new Date(b.start_time).getHours();
      return startHour === hour && b.status === 'confirmed';
    });
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Daily Schedule</h1>
            <Link href="/owner/dashboard" className="text-teal-600 hover:underline">Back to Dashboard</Link>
          </div>

          {/* Date Selector */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center space-x-4">
            <label className="font-semibold text-gray-700">Select Date:</label>
            <input 
              type="date" 
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="border p-2 rounded text-black"
            />
          </div>

          {/* Visual Grid */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-200">
              {timeSlots.map(hour => {
                const booking = getBookingForSlot(hour);
                const timeLabel = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

                return (
                  <div key={hour} className="flex h-16 hover:bg-gray-50 transition-colors">
                    {/* Time Column */}
                    <div className="w-24 flex-shrink-0 border-r border-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                      {timeLabel}
                    </div>
                    
                    {/* Slot Column */}
                    <div className="flex-grow p-2">
                      {booking ? (
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className="w-full h-full bg-green-100 border border-green-300 rounded-md flex items-center px-4 text-left hover:bg-green-200 transition-colors"
                        >
                          <div>
                            <p className="font-bold text-green-800 text-sm">
                              {booking.user_first_name} {booking.user_last_name}
                            </p>
                            <p className="text-xs text-green-700">Booking ID: #{booking.booking_id}</p>
                          </div>
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs italic">
                          Available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- VERIFICATION MODAL --- */}
          {selectedBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
                
                <h2 className="text-2xl font-bold text-black mb-2">Verify Player</h2>
                <div className="w-full h-1 bg-gray-200 mb-6"></div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Player Name</p>
                    <p className="text-xl font-bold text-teal-700">
                      {selectedBooking.user_first_name} {selectedBooking.user_last_name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Phone Number</p>
                    <p className="text-lg font-semibold text-black">
                      {selectedBooking.user_phone || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-xs text-gray-500 uppercase">Booking ID</p>
                       <p className="font-mono text-black">#{selectedBooking.booking_id}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 uppercase">Amount Paid</p>
                       <p className="font-mono text-green-600 font-bold">₹{selectedBooking.total_price}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={() => setSelectedBooking(null)}
                      className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
                    >
                      Verified / Check In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}