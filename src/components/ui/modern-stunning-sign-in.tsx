"use client"

import * as React from "react"
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

const SignIn1 = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { signIn, signInWithGoogle, user } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);
 
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
 
  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message || "Failed to sign in. Please try again.");
      } else {
        // Success - the useEffect will handle redirect
      }
    } catch (err) {
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message || "Failed to sign in with Google. Please try again.");
      }
      // Success - OAuth will handle redirect
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] relative overflow-hidden w-full">
      {/* Background gradient overlay - matching the app's style */}
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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 text-center">
          Welcome to Syntora
        </h2>

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {/* Email Input */}
            <div className="relative">
              <input
                placeholder="Email"
                type="email"
                value={email}
                className="w-full px-5 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6E86FF] focus:border-transparent transition-all duration-200 hover:bg-gray-800/70"
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                className="w-full px-5 py-3 pr-12 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6E86FF] focus:border-transparent transition-all duration-200 hover:bg-gray-800/70"
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-400 text-left bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          <hr className="border-gray-700/50" />

          <div>
            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-medium px-5 py-3 rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all duration-200 mb-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            {/* Google Sign In */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-xl px-5 py-3 font-medium text-white shadow hover:bg-gray-700/50 hover:scale-105 transition-all duration-200 mb-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            <div className="w-full text-center">
              <span className="text-xs text-gray-400">
                Don&apos;t have an account?{" "}
                <a
                  href="#"
                  className="underline text-[#6E86FF] hover:text-[#FF6BBA] transition-colors"
                >
                  Sign up, it&apos;s free!
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User count and avatars */}
      <div className="relative z-10 mt-12 flex flex-col items-center text-center">
        <p className="text-gray-400 text-sm mb-2">
          Join <span className="font-medium bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] bg-clip-text text-transparent">thousands</span> of
          users who are already using Syntora.
        </p>
        <div className="flex space-x-1">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-gray-700 object-cover hover:scale-110 transition-transform duration-200"
          />
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-gray-700 object-cover hover:scale-110 transition-transform duration-200"
          />
          <img
            src="https://randomuser.me/api/portraits/men/54.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-gray-700 object-cover hover:scale-110 transition-transform duration-200"
          />
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-gray-700 object-cover hover:scale-110 transition-transform duration-200"
          />
        </div>
      </div>
    </div>
  );
};
 
export { SignIn1 }; 