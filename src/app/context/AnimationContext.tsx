'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window {
    gsap: any;
    __ANIMATED_ELEMENT__: HTMLElement | null;
  }
}

interface AnimationContextType {
  animateToProject: (projectId: string, clickedElement: HTMLElement) => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Initialize GSAP
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Clean up animated element after navigation
    const handleRouteChange = () => {
      if (window.__ANIMATED_ELEMENT__) {
        // Don't remove the element, just reset its styles
        gsap.set(window.__ANIMATED_ELEMENT__, {
          position: '',
          left: '',
          top: '',
          width: '',
          height: '',
          clearProps: 'all'
        });
        window.__ANIMATED_ELEMENT__ = null;
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const animateToProject = (projectId: string, clickedElement: HTMLElement) => {
    const container = containerRef.current;
    if (!container) return;

    // Get all project elements except the clicked one
    const otherProjects = Array.from(container.querySelectorAll('.project')).filter(
      project => project !== clickedElement
    );

    // Get the project's position
    const projectRect = clickedElement.getBoundingClientRect();

    // Clone the element to keep in the original position
    const clone = clickedElement.cloneNode(true) as HTMLElement;
    clone.style.opacity = '0';
    clone.style.visibility = 'hidden';
    clickedElement.parentNode?.insertBefore(clone, clickedElement);

    // Move the element to the body but keep its original class
    document.body.appendChild(clickedElement);
    clickedElement.style.position = 'fixed';
    clickedElement.style.left = `${projectRect.left}px`;
    clickedElement.style.top = `${projectRect.top}px`;
    clickedElement.style.width = `${projectRect.width}px`;
    clickedElement.style.height = `${projectRect.height}px`;
    
    // Store the element globally so it persists during route change
    window.__ANIMATED_ELEMENT__ = clickedElement;
    animatedElementRef.current = clickedElement;

    // Create a timeline for the animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Navigate to the project page after animation
        router.push(`/book/${projectId}`);
      }
    });

    // 1. Fade out other projects
    tl.to(otherProjects, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut"
    });

    // 2. Move to the left
    tl.to(clickedElement, {
      left: 0,
      top: '60px',
      duration: 0.3,
      ease: "power2.inOut"
    });

    // 3. Expand to full viewport width
    tl.to(clickedElement, {
      width: '100vw',
      duration: 0.5,
      ease: "power2.inOut"
    });

    // 4. Show the clone only after the original is fully expanded
    tl.to(clone, {
      opacity: 1,
      visibility: 'visible',
      duration: 0.1,
      ease: "none"
    }, "+=0.1");
  };

  return (
    <AnimationContext.Provider value={{ animateToProject }}>
      <div ref={containerRef} className="w-full h-full">
        {children}
      </div>
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
} 