"use client";

import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { useEffect, useState, useCallback } from 'react';

interface NavbarProps {
  userButton: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ userButton }) => {
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  const checkSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const userMetadata = await user.getOrganizationMemberships();
      
      console.log('Navbar - User:', user);
      console.log('Navbar - User Metadata:', userMetadata);
      
      setIsAdmin(userMetadata.some(membership => membership.role === 'admin'));
      setIsSubscribed(userMetadata.some(membership => membership.role === 'member' && membership.status === 'active') || userMetadata.some(membership => membership.role === 'admin'));
      
      console.log('Navbar - Is Admin:', isAdmin);
      console.log('Navbar - Is Subscribed:', isSubscribed);
    } catch (error) {
      console.error('Navbar - Error checking subscription:', error);
    }
  }, [user]);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              Bookblitz AI
            </Link>
          </div>
          <div className="flex items-center">
            <SignedOut>
              <Link href="/sign-in" className="text-gray-800 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Sign in
              </Link>
              <Link href="/pricing" className="text-gray-800 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Pricing
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/ebook-generator" className="text-gray-800 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Ebook Generator
              </Link>
              {!isSubscribed && (
                <Link href="/pricing" className="text-gray-800 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Upgrade
                </Link>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

