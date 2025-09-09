'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/app/lib/supabase/api';

interface BibleVerse {
  verse: string;
  reference: string;
}

export const BibleVerseToast: React.FC = () => {
  const [hasShownToday, setHasShownToday] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAndShowBibleVerse = async () => {
      try {
        // Check if we've already shown a bible verse today
        const shown = await api.hasShownBibleVerseToday();
        setHasShownToday(shown);

        if (!shown) {
          // Get today's bible verse
          const bibleVerse = await api.getDailyBibleVerse();
          
          if (bibleVerse) {
            // Show the toast notification
            toast({
              title: "📖 Daily Bible Verse",
              description: `"${bibleVerse.verse}" — ${bibleVerse.reference}`,
              duration: 10000, // Show for 10 seconds
              className: "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30",
            });

            // Mark as shown
            await api.markBibleVerseShown();
            setHasShownToday(true);
          }
        }
      } catch (error) {
        console.error('Error showing bible verse:', error);
      }
    };

    // Check on component mount
    checkAndShowBibleVerse();
  }, [toast]);

  return null; // This component doesn't render anything visible
}; 