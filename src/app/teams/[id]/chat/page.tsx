// src/app/teams/[id]/chat/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

interface ChatMessage {
  id: number;
  team_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  message_content: string;
  created_at: string;
}

interface TokenPayload {
  id: number; // Our backend token has "id"
  email: string;
  role: string;
}

export default function TeamChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const { token } = useAuth();
  const params = useParams();
  const teamId = params.id as string;
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Decode User ID from token to know which messages are "mine"
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, [token]);

  const fetchMessages = async () => {
    if (!token || !teamId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/teams/${teamId}/chat`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [token, teamId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/teams/${teamId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });
      setNewMessage('');
      fetchMessages(); // Refresh instantly
    } catch (err) {
      alert('Failed to send');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20 flex flex-col">
        <div className="max-w-4xl mx-auto p-4 w-full flex-grow flex flex-col h-[85vh]">
          <h1 className="text-3xl font-bold text-black mb-4">Team Chat</h1>

          <div className="bg-white rounded-lg shadow-md flex-grow flex flex-col overflow-hidden">
            {/* Messages Area */}
            <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50">
              {isLoading && <p className="text-gray-500 text-center">Loading...</p>}
              {!isLoading && messages.length === 0 && (
                <p className="text-gray-500 text-center mt-10">No messages yet. Start the conversation!</p>
              )}
              
              {messages.map((msg) => {
                const isMe = msg.user_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500 mb-1 px-1">
                      {isMe ? 'You' : `${msg.first_name} ${msg.last_name}`}
                    </span>
                    <div className={`px-4 py-2 rounded-2xl max-w-xs break-words ${
                      isMe 
                        ? 'bg-teal-600 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}>
                      {msg.message_content}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
              />
              <button 
                type="submit" 
                className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}