'use client';

import React from 'react';
import Image from 'next/image';

interface SignInLayoutProps {
  children: React.ReactNode;
}

export function SignInLayout({ children }: SignInLayoutProps) {
  console.log('SignInLayout rendered with children:', !!children);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] relative overflow-hidden w-full">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6E86FF]/10 via-transparent to-[#FF6BBA]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(110,134,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,107,186,0.1)_0%,transparent_50%)]" />
      </div>

      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 shadow-2xl p-8 flex flex-col items-center hover:bg-gray-800/50 transition-all duration-300">
        {/* Logo */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] mb-6 shadow-lg p-3 hover:scale-105 transition-transform duration-200">
          <img 
            src="/FinalFavicon.webp" 
            alt="Syntora"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 text-center">
          Welcome to Syntora
        </h1>

        {/* Form Content */}
        {children}
      </div>

      {/* Social Proof */}
      <SocialProof />
    </div>
  );
}

function SocialProof() {
  return (
    <div className="relative z-10 mt-12 flex flex-col items-center text-center">
      <p className="text-gray-400 text-sm mb-2">
        Join{' '}
        <span className="font-medium bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] bg-clip-text text-transparent">
          thousands
        </span>{' '}
        of users who are already using Syntora.
      </p>
      <div className="flex space-x-1">
        {[
          'https://randomuser.me/api/portraits/men/32.jpg',
          'https://randomuser.me/api/portraits/women/44.jpg',
          'https://randomuser.me/api/portraits/men/54.jpg',
          'https://randomuser.me/api/portraits/women/68.jpg',
        ].map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`User ${index + 1}`}
            className="w-8 h-8 rounded-full border-2 border-gray-700 object-cover hover:scale-110 transition-transform duration-200"
          />
        ))}
      </div>
    </div>
  );
}
