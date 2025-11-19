// src/components/NewVenueForm.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function NewVenueForm() {
  const [name, setName] = useState('');
  const [sportCategory, setSportCategory] = useState('Football');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // NEW STATES
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [lunchStart, setLunchStart] = useState('');
  const [lunchEnd, setLunchEnd] = useState('');

  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!token) {
      setMessage('Error: You are not authenticated.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/v1/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          sport_category: sportCategory,
          description,
          address,
          price_per_hour: parseFloat(pricePerHour),
          opening_time: openingTime,
          closing_time: closingTime,
          lunch_start_time: lunchStart,
          lunch_end_time: lunchEnd,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Venue created! Redirecting to add photos...');
        setTimeout(() => {
          router.push(`/owner/venues/${data.id}/edit`);
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to create venue');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-black";
  const labelStyle = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white rounded-lg shadow-md">

      <div>
        <label htmlFor="name" className={labelStyle}>Venue Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputStyle}
          required
        />
      </div>

      <div>
        <label htmlFor="sportCategory" className={labelStyle}>Sport Category</label>
        <select
          id="sportCategory"
          value={sportCategory}
          onChange={(e) => setSportCategory(e.target.value)}
          className={inputStyle}
          required
        >
          <option value="Football">Football</option>
          <option value="Swimming">Swimming</option>
          <option value="Badminton">Badminton</option>
          <option value="Snooker">Snooker</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className={labelStyle}>Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputStyle} h-24`}
        ></textarea>
      </div>

      <div>
        <label htmlFor="address" className={labelStyle}>Address</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputStyle}
          required
        />
      </div>

      {/* NEW — OPENING & CLOSING TIME */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Opening Time</label>
          <input
            type="time"
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
            className={inputStyle}
            required
          />
        </div>

        <div>
          <label className={labelStyle}>Closing Time</label>
          <input
            type="time"
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
            className={inputStyle}
            required
          />
        </div>
      </div>

      {/* NEW — LUNCH BREAK (OPTIONAL) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Lunch Start (Optional)</label>
          <input
            type="time"
            value={lunchStart}
            onChange={(e) => setLunchStart(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div>
          <label className={labelStyle}>Lunch End (Optional)</label>
          <input
            type="time"
            value={lunchEnd}
            onChange={(e) => setLunchEnd(e.target.value)}
            className={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="pricePerHour" className={labelStyle}>Price per Hour (in ₹)</label>
        <input
          type="number"
          id="pricePerHour"
          value={pricePerHour}
          onChange={(e) => setPricePerHour(e.target.value)}
          className={inputStyle}
          required
          min="0"
        />
      </div>

      {message && (
        <p className={`text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold disabled:bg-gray-400"
      >
        {isLoading ? 'Submitting...' : 'Submit for Approval'}
      </button>
    </form>
  );
}
