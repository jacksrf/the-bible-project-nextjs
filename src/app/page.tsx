"use client"

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useBibleVersion } from './context/BibleVersionContext'
import type { BibleBook } from '@/types/bible-book'
import { useRouter } from 'next/navigation'
import { bibleBooks } from '@/data/bible-books'

export default function Home() {
  const cardRef = useRef<HTMLDivElement>(null)
  const mediasRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const progressCircleRef = useRef<SVGCircleElement>(null)
  const progressNumberRef = useRef<HTMLSpanElement>(null)
  const { selectedVersion } = useBibleVersion()
  const books = bibleBooks // Use the books directly since they're static
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [fadeOutLoader, setFadeOutLoader] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(true) // Set to true since we're using hardcoded data
  const router = useRouter()
  const gsapInitialized = useRef(false)

  // Preload images
  useEffect(() => {
    if (!dataLoaded || books.length === 0) return

    console.log('Starting image preload...')
    let loadedCount = 0
    const totalImages = books.length
    let isEffectActive = true

    const handleImageLoad = () => {
      if (!isEffectActive) return
      
      loadedCount++
      console.log(`Image preloaded ${loadedCount}/${totalImages}`)
      if (loadedCount === totalImages) {
        console.log('All images preloaded')
        setImagesLoaded(prev => {
          if (!prev) {
            console.log('Setting imagesLoaded to true')
            return true
          }
          return prev
        })
      }
    }

    books.forEach(book => {
      const img = new Image()
      img.src = `/medias/${book.image.toLowerCase()}`
      if (img.complete) {
        handleImageLoad()
      } else {
        img.onload = handleImageLoad
      }
    })

    return () => {
      isEffectActive = false
      books.forEach(book => {
        const img = new Image()
        img.onload = null
      })
    }
  }, [books, dataLoaded])

  // Initialize GSAP
  useEffect(() => {
    if (!gsapInitialized.current) {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
      gsapInitialized.current = true
    }
  }, [])

  // Set initial card position
  useEffect(() => {
    if (!cardRef.current || !showContent) return

    const card = cardRef.current
    const W = window.innerWidth
    const H = window.innerHeight
    const cardWidth = card.offsetWidth
    const cardHeight = card.offsetHeight

    console.log(W, H, cardWidth, cardHeight)

    // Set initial position to center, accounting for card dimensions
    gsap.set(card, {
      x: 0,
      y: 0
    })
  }, [showContent])

  // Animate loading progress
  useEffect(() => {
    if (!isLoading || !progressCircleRef.current || !progressNumberRef.current || !dataLoaded || !imagesLoaded) return

    console.log('Starting circle animation')
    let isAnimating = true
    const duration = 2.5 // 2.5 seconds total
    const circle = progressCircleRef.current
    const number = progressNumberRef.current
    const circumference = 2 * Math.PI * 45 // 2πr where r=45

    // Reset states before starting animation
    setLoadingProgress(0)
    gsap.set(circle, {
      strokeDasharray: circumference,
      strokeDashoffset: circumference
    })
    gsap.set(number, {
      textContent: '0'
    })

    // Create a timeline for synchronized animations
    const tl = gsap.timeline({
      onComplete: () => {
        if (isAnimating) {
          console.log('Circle animation complete')
          setFadeOutLoader(true)
          setTimeout(() => {
            if (isAnimating) {
              setIsLoading(false)
              setShowContent(true)
            }
          }, 500)
        }
      }
    })

    // Animate both the circle and number together
    tl.to([circle, number], {
      duration: duration,
      ease: "none",
      onUpdate: function() {
        const progress = this.progress() * 100
        const roundedProgress = Math.round(progress)
        setLoadingProgress(roundedProgress)
        gsap.set(circle, {
          strokeDashoffset: circumference - (circumference * progress) / 100
        })
        gsap.set(number, {
          textContent: roundedProgress
        })
      }
    })

    return () => {
      isAnimating = false
      tl.kill()
    }
  }, [isLoading, dataLoaded, imagesLoaded])

  // Animate progress circle
  useEffect(() => {
    if (!progressCircleRef.current) return

    const circle = progressCircleRef.current
    const circumference = 2 * Math.PI * 45 // 2πr where r=45

    gsap.to(circle, {
      strokeDashoffset: circumference - (circumference * loadingProgress) / 100,
      duration: 0.5,
      ease: "power2.out"
    })
  }, [loadingProgress])

  // Setup animations only after books and images are loaded
  useEffect(() => {
    if (!cardRef.current || !mediasRef.current || !imagesLoaded || !gsapInitialized.current || !showContent) return

    const card = cardRef.current
    const medias = mediasRef.current
    const nbMedias = medias.querySelectorAll('.media').length
    if (nbMedias === 0) return

    // Initialize GSAP animations
    const xTo = gsap.quickTo(card, "x", {duration: 1, ease: "power4"})
    const yTo = gsap.quickTo(card, "y", {duration: 1, ease: "power4"})
    const rotationTo = gsap.quickTo(card, "rotation", {duration: 1, ease: "power4"})
    const xToMedias = gsap.quickTo(medias, "xPercent", {duration: 0.6, ease: "power2"})
    const yToMedias = gsap.quickTo(medias, "yPercent", {duration: 0.7, ease: "power2"})

    const W = window.innerWidth
    const H = window.innerHeight

    // Set initial active media
    const firstMedia = medias.querySelector('.media')
    if (firstMedia) {
      firstMedia.classList.add('on')
    }

    let isMoving: NodeJS.Timeout
    let oldPosX = W / 2
    let oldPosY = H / 2
    let incr = 0
    let index = 0

    const handleMouseMove = (e: MouseEvent) => {
      const posX = e.clientX
      const posY = e.clientY

      const valueX = (posX - oldPosX) / 2
      const valueY = (posY - oldPosY) / 2

      const clampValueX = gsap.utils.clamp(-8, 8, valueX)
      const clampValueY = gsap.utils.clamp(-8, 8, valueY)

      rotationTo((posX - oldPosX) / 4)
      xTo(posX - W / 2)
      yTo(posY - H / 2 + window.scrollY)

      xToMedias(-clampValueX)
      yToMedias(-clampValueY)

      oldPosX = posX
      oldPosY = posY

      incr += Math.abs(valueX) + Math.abs(valueY)
      if (incr > 300) {
        incr = 0

        const activeMedia = medias.querySelector('.media.on')
        if (activeMedia) {
          activeMedia.classList.remove('on')
        }

        const mediasList = medias.querySelectorAll('.media')
        const nextMedia = mediasList[index % nbMedias]
        if (nextMedia) {
          nextMedia.classList.add('on')
        }
        index++
      }

      window.clearTimeout(isMoving)
      isMoving = setTimeout(() => {
        rotationTo(0)
        xToMedias(0)
        yToMedias(0)
      }, 66)
    }

    // Add mouse move listener only after fade in animation is complete
    const fadeInAnimation = gsap.fromTo(sectionRef.current, 
      { 
        opacity: 0,
        y: 20
      },
      { 
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          // Add mouse move listener after fade in is complete
          window.addEventListener("mousemove", handleMouseMove)
        }
      }
    )

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.clearTimeout(isMoving)
      // Kill all GSAP animations
      gsap.killTweensOf([card, medias])
    }
  }, [books, imagesLoaded, showContent])

  const handleSectionClick = (e: React.MouseEvent) => {
    if (!sectionRef.current) return

    // Check if we clicked on a project
    const target = e.target as HTMLElement
    const project = target.closest('.project')
    if (project && !project.classList.contains('on')) {
      // Scroll to the project first
      project.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Wait for scroll to complete before starting the animation
      setTimeout(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            router.push('/books')
          }
        })

        tl.to(sectionRef.current, {
          opacity: 0,
          y: -50,
          duration: 0.5,
          ease: "power2.inOut"
        })
      }, 1000) // Wait for scroll animation to complete
      return
    }

    // If we clicked on the active project or the section, proceed with normal animation
    const tl = gsap.timeline({
      onComplete: () => {
        router.push('/books')
      }
    })

    tl.to(sectionRef.current, {
      opacity: 0,
      y: -50,
      duration: 0.5,
      ease: "power2.inOut"
    })
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 transition-opacity duration-500 ${fadeOutLoader ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-[100px] h-[100px]">
          <div className="progress-circle">
            <div className="progress-circle__circle">
              <svg className="progress-circle__svg" viewBox="0 0 100 100">
                <circle className="progress-circle__circle-bg" cx="50" cy="50" r="45" />
                <circle 
                  ref={progressCircleRef}
                  className="progress-circle__circle-fill" 
                  cx="50" 
                  cy="50" 
                  r="45"
                  style={{
                    strokeDasharray: '283',
                    strokeDashoffset: '283'
                  }}
                />
              </svg>
              <div className="progress-circle__text">
                <span ref={progressNumberRef} className="progress-circle__text-value">0</span>
                <span className="progress-circle__text-percent">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"> */}
        <section 
          ref={sectionRef}
          className="mwg_effect002 cursor-pointer opacity-0" 
          onClick={handleSectionClick}
        >
          <p className="text">Explore the books of the Bible in a new way</p>
          <p className="shop">The Lumen Bible</p>
          <div ref={cardRef} className="card">
            <div ref={mediasRef} className="medias">
              {books.map((book, index) => (
                <img 
                  key={book.name}
                  className={`media ${index === 0 ? 'on' : ''}`}
                  src={`/medias/${book.image.toLowerCase()}`}
                  alt={book.name}
                />
              ))}
            </div>
          </div>
        </section>
      {/* </div> */}
    </div>
  )
}