// src/app/profile/payment-methods/page.tsx
"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { CreditCard, Trash2, Plus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function PaymentMethodsPage() {
  // Mock data for UI purposes
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/28', holder: 'John Doe', color: 'bg-gradient-to-br from-gray-900 to-gray-800' },
    { id: 2, type: 'Mastercard', last4: '8832', expiry: '09/26', holder: 'John Doe', color: 'bg-gradient-to-br from-blue-900 to-blue-800' },
  ]);

  const handleDelete = (id: number) => {
    if (confirm('Remove this card?')) {
      setCards(cards.filter(c => c.id !== id));
    }
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Payment Methods</h1>
              <p className="text-gray-600">Manage your saved cards for faster checkout.</p>
            </div>
            <button className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-teal-700 transition-colors text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add New Card
            </button>
          </div>

          <div className="grid gap-6">
            {cards.map((card) => (
              <div key={card.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between group">
                
                {/* Card Visual */}
                <div className="flex items-center space-x-6 w-full sm:w-auto">
                  <div className={`w-16 h-10 rounded-md ${card.color} flex items-center justify-center shadow-sm`}>
                    <span className="text-white text-[10px] font-bold tracking-wider uppercase">{card.type}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-gray-900">•••• •••• •••• {card.last4}</p>
                      {card.id === 1 && <span className="bg-teal-100 text-teal-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Default</span>}
                    </div>
                    <p className="text-sm text-gray-500">Expires {card.expiry}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 sm:mt-0 flex items-center space-x-4 w-full sm:w-auto justify-end">
                  <button 
                    onClick={() => handleDelete(card.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2"
                    aria-label="Delete card"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Security Badge */}
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
              <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-blue-900">Secure Payments</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Your payment information is encrypted and securely stored by our payment partner (Razorpay). 
                  SportGrid never stores your actual card numbers on our servers.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}