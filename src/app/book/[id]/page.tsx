'use client'

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { BibleBook } from '@/types/bible-book';
import { bibleBooks } from '@/data/bible-books';
import gsap from 'gsap';
import { useBibleVersion } from '@/app/context/BibleVersionContext';

interface Chapter {
  reference: string;
  text: string;
}

declare global {
  interface Window {
    gsap: any;
  }
}

interface BookPageProps {
  params: {
    id: string;
  };
}

export default function BookPage({ params }: BookPageProps) {
  const { id } = params;
  const bookName = id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const project = bibleBooks.find(book => 
    book.name.toLowerCase() === bookName.toLowerCase()
  );
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedVersion } = useBibleVersion();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Combined effect for initial setup and content fetching
  useEffect(() => {
    let isMounted = true;

    // Add class to body
    document.body.classList.add('book-page-active');

    const fetchBookContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://api.biblia.com/v1/bible/content/asv.html?passage=${bookName}&style=fullyFormatted&key=5b01f70d6ef9d6dcae58d1a483dce2a3`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch book content');
        }

        const text = await response.text();
        
        if (isMounted) {
          setChapters([{ reference: bookName, text }]);
          setLoading(false);

          // Wait for the next render cycle to ensure content is in DOM
          setTimeout(() => {
            const proseContent = document.querySelector('.prose') as HTMLElement;
            if (proseContent) {
              gsap.fromTo(
                proseContent,
                { opacity: 0, y: 20 },
                { 
                  opacity: 1, 
                  y: 0, 
                  duration: 1, 
                  ease: "power2.out",
                  onStart: () => {
                    // Ensure the element is visible before animation
                    proseContent.style.visibility = 'visible';
                  }
                }
              );
            }
          }, 100);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching book content:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch book content');
          setLoading(false);
        }
      }
    };

    fetchBookContent();

    // Cleanup function
    return () => {
      isMounted = false;
      document.body.classList.remove('book-page-active');
      
      // Remove .project.on element from body
      const projectOn = document.querySelector('.project.on');
      if (projectOn && projectOn.parentElement === document.body) {
        document.body.removeChild(projectOn);
      }
    };
  }, [bookName]); // Only depend on bookName

  if (!project) {
    notFound();
  }

  return (
    <div ref={containerRef} className="book-page-container">
      <div className="book-page">
        <div className="datas">
          <h1 className="label">{project.name}</h1>
          <p className="designer">{project.testament === "OT" ? "Old Testament" : "New Testament"}</p>
        </div>
        <div className="media-container project-content">
          <div className="media cursor-pointer">
            <Image
              src={`/medias/${project.image.toLowerCase()}`}
              alt={project.name}
              width={800}
              height={600}
              priority
            />
          </div>
          <div className="book-content">
            <div className="book-content-inner">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 p-4"></div>
              ) : (
                chapters.map((chapter, index) => (
                  <div key={index} className="mb-8">
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: chapter.text }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 