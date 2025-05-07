"use client"

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useBibleVersion } from './context/BibleVersionContext'
import type { BibleBook } from '@/types/bible-book'
import { useRouter } from 'next/navigation'

export default function Home() {
  const cardRef = useRef<HTMLDivElement>(null)
  const mediasRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const { selectedVersion } = useBibleVersion()
  const [books, setBooks] = useState<BibleBook[]>([])
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const router = useRouter()
  const gsapInitialized = useRef(false)

  // Fetch books data
  useEffect(() => {
    const fetchBooks = async () => {
      if (!selectedVersion) return

      try {
        const response = await fetch(`/api/bible/${selectedVersion.value}/books`)
        if (!response.ok) throw new Error('Failed to fetch books')
        const data = await response.json()
        setBooks(data)
      } catch (err) {
        console.error('Error fetching books:', err)
      }
    }

    fetchBooks()
  }, [selectedVersion])

  // Handle image loading
  useEffect(() => {
    if (books.length === 0) return

    const images = document.querySelectorAll('.media')
    let loadedCount = 0

    const handleImageLoad = () => {
      loadedCount++
      if (loadedCount === images.length) {
        setImagesLoaded(true)
      }
    }

    images.forEach(img => {
      if ((img as HTMLImageElement).complete) {
        handleImageLoad()
      } else {
        img.addEventListener('load', handleImageLoad)
      }
    })

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad)
      })
    }
  }, [books])

  // Initialize GSAP
  useEffect(() => {
    if (!gsapInitialized.current) {
      gsapInitialized.current = true
    }
  }, [])

  // Setup animations only after books and images are loaded
  useEffect(() => {
    if (!cardRef.current || !mediasRef.current || !imagesLoaded || !gsapInitialized.current) return

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

    // Add mouse move listener
    window.addEventListener("mousemove", handleMouseMove)

    // Set initial position
    gsap.set(card, {
      x: W / 2,
      y: H / 2
    })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.clearTimeout(isMoving)
    }
  }, [books, imagesLoaded])

  const handleSectionClick = () => {
    if (!sectionRef.current) return

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <section 
          ref={sectionRef}
          className="mwg_effect002 cursor-pointer" 
          onClick={handleSectionClick}
        >
          <p className="text">Explore the books of the Bible in a new way</p>
          <p className="shop">The Bible Project</p>
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
      </div>
    </div>
  )
}