// src/app/support/contact/page.tsx
"use client";

import Link from 'next/link';
import { Phone, Mail, Instagram, ArrowLeft, MessageCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-500 hover:text-teal-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to SportGrid Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question about a booking, or want to list your venue on SportGrid? 
            Our team is ready to assist you.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Phone Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-500 text-sm mb-4">Mon-Fri from 8am to 5pm</p>
            <a href="tel:+916364573073" className="text-xl font-bold text-teal-700 hover:underline">
              +91 63645 73073
            </a>
          </div>

          {/* Email Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-500 text-sm mb-4">For general inquiries & listings</p>
            <a href="mailto:theplayarenaa@gmail.com" className="text-lg font-bold text-blue-700 hover:underline break-all">
              thesportgrid@gmail.com
            </a>
          </div>

          {/* Social Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <Instagram className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow Us</h3>
            <p className="text-gray-500 text-sm mb-4">Updates & Community</p>
            <a 
              href="https://instagram.com/sportgrid" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg font-bold text-pink-700 hover:underline"
            >
              @SportGrid
            </a>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-gray-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
              <Clock className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Support Hours</h4>
              <p className="text-gray-600">Our support team is available daily.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Response time</p>
            <p className="text-xl font-bold text-gray-800">Within 24 Hours</p>
          </div>
        </div>

      </div>
    </div>
  );
}