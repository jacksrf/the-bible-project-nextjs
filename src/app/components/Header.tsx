'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BibleVersionSelector } from "@/components/bible-version-selector";

export default function Header() {
  const pathname = usePathname();
  
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/books" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">The Lumen Bible</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {/* <BibleVersionSelector /> */}
          </nav>
        </div>
      </div>
    </header>
  );
}
