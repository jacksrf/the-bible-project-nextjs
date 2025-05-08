"use client"

import { useEffect, useRef, useState } from 'react'
import BibleProject from '@/components/bible-project'
import Lenis from '@studio-freight/lenis'
import { useBibleVersion } from '@/app/context/BibleVersionContext'
import type { BibleBook } from '@/types/bible-book'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import { useAnimation } from '@/app/context/AnimationContext'
import type { Callback } from 'gsap'

// Add type declarations for GSAP
declare global {
  interface Window {
    gsap: any
    ScrollTrigger: any
    ScrollToPlugin: any
  }
}

export default function Home() {
  const { selectedVersion } = useBibleVersion();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const { animateToProject } = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<Callback | null>(null);

  useEffect(() => {

    const projectElements = document.body.querySelectorAll('.project');
    projectElements.forEach(element => {
      if (element.parentElement === document.body) {
        document.body.removeChild(element);
      }
    });

    const fetchBooks = async () => {
      if (!selectedVersion) {
        setError('Please select a Bible version first');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/bible/${selectedVersion.value}/books`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [selectedVersion]);

  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /* LENIS SMOOTH SCROLL */
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Integrate Lenis with GSAP ScrollTrigger
    lenisRef.current.on('scroll', ScrollTrigger.update);

    // Create a proxy for Lenis scroll
    const rafCallback = (time: number) => {
      lenisRef.current?.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);

    // Clean up function
    return () => {
      lenisRef.current?.destroy();
      gsap.ticker.remove(rafCallback);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (loading || error || books.length === 0) return;

    // Kill any existing ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    gsap.killTweensOf(".mwg_effect038 .books_container");

    // Initialize animations after component mount and books are loaded
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 769px)", () => {
      const projects = document.querySelectorAll(".mwg_effect038 .project");
      if (!projects.length) return;

      // Reset any existing 'on' classes
      projects.forEach(project => project.classList.remove('on'));
      projects[0].classList.add("on");
      
      const numProjects = projects.length;
      let currentProject = projects[0];

      const container = document.querySelector(".mwg_effect038 .books_container");
      if (!container) return;

      const dist = container.clientWidth - document.body.clientWidth;
      const section = document.querySelector(".mwg_effect038");
      if (!section) return;

      const booksContainer = document.querySelector(".books_container");
      if (!booksContainer) return;

      const pinHeight = booksContainer.clientHeight * 2;

      // Create the horizontal scroll animation
      gsap.to(container, {
        x: -dist,
        ease: "none",
        scrollTrigger: {
          trigger: ".mwg_effect038 .pin-height",
          pin: container,
          start: "top top=+80px",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            const closestIndex = Math.round(self.progress * (numProjects - 1));
            const closestProject = projects[closestIndex];

            if (closestProject !== currentProject) {
              currentProject.classList.remove("on");
              closestProject.classList.add("on");
              currentProject = closestProject;
            }
          },
        },
      });
    });

    return () => {
      mm.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.killTweensOf(".mwg_effect038 .books_container");
    };
  }, [loading, error, books]);

  // Add a separate effect to handle window focus/blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Force a re-render to reinitialize GSAP
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create fade-in animation
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );

    // Add ticker for smooth animations
    const tickerCallback: Callback = (time: number) => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${Math.sin(time * 0.001) * 5}px)`;
      }
    };

    tickerRef.current = tickerCallback;
    gsap.ticker.add(tickerCallback);

    return () => {
      if (tickerRef.current) {
        gsap.ticker.remove(tickerRef.current);
      }
    };
  }, []);

  const handleProjectClick = (e: React.MouseEvent<HTMLDivElement>, projectId: string, index: number) => {
    const clickedElement = e.currentTarget;
    console.log('Has "on" class:', clickedElement.classList.contains('on'));
    
    if (clickedElement.classList.contains('on')) {
      animateToProject(projectId.replace(/\s+/g, '-'), clickedElement);
    } else {
      // remove class on from element that has on class
      const activeElement = document.querySelector('.project.on');
      if (activeElement) {
        activeElement.classList.remove('on');
      }
      clickedElement.classList.add('on');
      setTimeout(() => {
        animateToProject(projectId.replace(/\s+/g, '-'), clickedElement);
      }, 100);
    }
  };

  if (!selectedVersion) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg> */}
              </div>
              <div className="ml-3">
                {/* <p className="text-sm text-yellow-700">
                  Please select a Bible version to view the books.
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg> */}
              </div>
              <div className="ml-3">
                {/* <p className="text-sm text-red-700">{error}</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mwg_effect038">
      <div className="pin-height">
        <div className="books_container">
          {books.map((book, index) => (
            <div
              key={book.name}
              className="project"
              onClick={(e) => handleProjectClick(e, book.name, index)}
            >
              <div className="datas">
                <h1 className="label">{book.name}</h1>
                <p className="designer">{book.testament === "OT" ? "Old Testament" : "New Testament"}</p>
              </div>
              <div className="media-container">
                <div className="media cursor-pointer">
                  <img
                    src={`/medias/${book.image.toLowerCase()}`}
                    alt={book.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}