// src/app/login/page.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; // 1. Import the icons

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 2. Add state for visibility

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // --- THIS IS THE CHANGE ---
        // We now pass BOTH the token and the role to our context
        login(data.token, data.role); 
        // -------------------------
        
        setMessage('Success! Logging you in...');
        setTimeout(() => {
          router.push('/'); // Redirect to home
        }, 1500);
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
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-black">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={labelStyle}>Email</label>
            <input 
              type="email" 
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              className={inputStyle} 
              required 
            />
          </div>
          
          {/* 3. Password Input with Toggle Button */}
          <div>
            <label htmlFor="password" className={labelStyle}>Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} // 4. Dynamic type
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                className={inputStyle} 
                required 
              />
              <button
                type="button" // Important: type="button" to prevent form submission
                onClick={() => setShowPassword(!showPassword)} // 5. Toggle state
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" /> 
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {/* End of password block */}

          {message && (
            <p className={`text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}

          <button type="submit" className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold">
            Login
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600">
          Don't have an account? <Link href="/register" className="text-teal-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}