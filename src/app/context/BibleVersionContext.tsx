'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { bibleGatewayApi } from '../services/bibleGatewayApi';

export type BibleVersion = {
  value: string;
  label: string;
};

interface BibleVersionContextType {
  selectedVersion: BibleVersion | null;
  setSelectedVersion: (version: BibleVersion) => void;
  bibleVersions: BibleVersion[];
  isLoading: boolean;
  error: string | null;
}

const BibleVersionContext = createContext<BibleVersionContextType | undefined>(undefined);

export function BibleVersionProvider({ children }: { children: React.ReactNode }) {
  const [selectedVersion, setSelectedVersion] = useState<BibleVersion | null>(null);
  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBibleVersions = async () => {
      try {
        console.log('Fetching Bible versions...');
        const versions = await bibleGatewayApi.getBibleVersions();
        console.log('Received versions:', versions);
        setBibleVersions(versions);
        
        // Set the first version as selected if none is selected
        if (!selectedVersion && versions.length > 0) {
          console.log('Setting initial version:', versions[0]);
          setSelectedVersion(versions[0]);
        }
      } catch (err) {
        console.error('Error in fetchBibleVersions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Bible versions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBibleVersions();
  }, []);

  return (
    <BibleVersionContext.Provider value={{ 
      selectedVersion, 
      setSelectedVersion, 
      bibleVersions,
      isLoading,
      error
    }}>
      {children}
    </BibleVersionContext.Provider>
  );
}

export function useBibleVersion() {
  const context = useContext(BibleVersionContext);
  if (context === undefined) {
    throw new Error('useBibleVersion must be used within a BibleVersionProvider');
  }
  return context;
} 