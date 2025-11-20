// app/register/page.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. Import the router

export default function RegisterPage() {
  const router = useRouter(); // 2. Initialize the router
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    dob: '',
    address: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirm_password) {
      setMessage('Error: Passwords do not match!');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // 3. On success, redirect to login
        setMessage('Success! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000); // Add a small delay so the user can see the message
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Error: Could not connect to server.');
    }
  };

  const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-black";
  const labelStyle = "block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-20">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-black">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... all your form inputs (first_name, last_name, etc.) ... */}
          {/* (No changes needed inside the <form> tags) */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="first_name" className={labelStyle}>First Name</label>
              <input type="text" name="first_name" onChange={handleChange} className={inputStyle} required />
            </div>
            <div className="w-1/2">
              <label htmlFor="last_name" className={labelStyle}>Last Name</label>
              <input type="text" name="last_name" onChange={handleChange} className={inputStyle}  />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className={labelStyle}>Email</label>
            <input type="email" name="email" onChange={handleChange} className={inputStyle} required />
          </div>
          <div>
            <label htmlFor="phone" className={labelStyle}>Phone</label>
            <input type="tel" name="phone" onChange={handleChange} className={inputStyle} />
          </div>
          <div>
            <label htmlFor="dob" className={labelStyle}>Date of Birth</label>
            <input type="date" name="dob" onChange={handleChange} className={inputStyle} />
          </div>
          <div>
            <label htmlFor="address" className={labelStyle}>Address</label>
            <textarea name="address" onChange={handleChange} className={`${inputStyle} h-20`}></textarea>
          </div>
          <div>
            <label htmlFor="password" className={labelStyle}>Password</label>
            <input type="password" name="password" onChange={handleChange} className={inputStyle} required />
          </div>
          <div>
            <label htmlFor="confirm_password" className={labelStyle}>Confirm Password</label>
            <input type="text" name="confirm_password" onChange={handleChange} className={inputStyle} required />
          </div>

          {message && (
            <p className={`text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}

          <button type="submit" className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold">
            Register
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-teal-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}