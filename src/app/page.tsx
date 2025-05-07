"use client"

import { useEffect, useRef, useState } from 'react'
import BibleProject from '@/components/bible-project'
import Lenis from '@studio-freight/lenis'
import { useBibleVersion } from './context/BibleVersionContext'
import type { BibleBook } from '@/types/bible-book'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ScrollToPlugin from 'gsap/ScrollToPlugin'

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

  useEffect(() => {
    const fetchBooks = async () => {
      if (!selectedVersion) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching books for version:', selectedVersion.value);
        const response = await fetch(`/api/bible/${selectedVersion.value}/books`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        console.log('Received books:', data);
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
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
    gsap.ticker.add((time) => {
      lenisRef.current?.raf(time * 1000);
    });

    // Clean up function
    return () => {
      lenisRef.current?.destroy();
      gsap.ticker.remove(lenisRef.current?.raf);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (loading || error || books.length === 0) return;

    // Initialize animations after component mount and books are loaded
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 769px)", () => {
      const projects = document.querySelectorAll(".mwg_effect038 .project");
      if (!projects.length) return;

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

      // Add click handlers to projects
      projects.forEach((project, index) => {
        const label = project.querySelector("p.label");
        if (!label) return;

        label.addEventListener("click", () => {
          const scrollProgress = pinHeight / numProjects;
          const scrollPosition = scrollProgress * index + scrollProgress / 2;

          const currentScroll = window.scrollY;
          const currentProgress = currentScroll / pinHeight;
          const currentClosestIndex = Math.round(currentProgress * (numProjects - 1));

          let duration;
          if (currentClosestIndex > index) {
            duration = (2 / numProjects) * (currentClosestIndex - index);
          } else {
            duration = (2 / numProjects) * (index - currentClosestIndex);
          }

          // Use Lenis for smooth scrolling
          lenisRef.current?.scrollTo(scrollPosition, {
            duration: duration * 1000,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        });
      });

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
    };
  }, [loading, error, books]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 p-4 rounded-lg bg-red-50 border border-red-200">
          <h2 className="text-lg font-semibold mb-2">Error Loading Books</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative">
      <BibleProject books={books} />
    </main>
  )
}