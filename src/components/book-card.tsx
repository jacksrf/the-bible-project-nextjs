'use client';

import React from 'react';
import Image from 'next/image';
import { BibleBook } from '@/types/bible-book';
import { useAnimation } from '@/app/context/AnimationContext';

interface BookCardProps {
  book: BibleBook;
}

export function BookCard({ book }: BookCardProps) {
  const { animateToProject } = useAnimation();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Find the closest project element for animation
    const projectElement = e.currentTarget.closest('.project');
    if (projectElement) {
      animateToProject(book.name, projectElement as HTMLElement);
    }
  };

  // Convert the image name to match the file system case
  const getImagePath = (imageName: string) => {
    // Special cases for books that need different casing
    const specialCases: { [key: string]: string } = {
      '1-corinthians.jpg': '1Corinthians.jpg',
      '2-corinthians.jpg': '2Corinthians.jpg',
      '1-thessalonians.jpg': '1Thessalonians.jpg',
      '2-thessalonians.jpg': '2Thessalonians.jpg',
      '1-timothy.jpg': '1Timothy.jpg',
      '2-timothy.jpg': '2Timothy.jpg',
      '1-john.jpg': '1John.jpg',
      '2-john.jpg': '2John.jpg',
      '3-john.jpg': '3John.jpg',
      '1-peter.jpg': '1Peter.jpg',
      '2-peter.jpg': '2Peter.jpg',
      '1-samuel.jpg': '1Samuel.jpg',
      '2-samuel.jpg': '2Samuel.jpg',
      '1-kings.jpg': '1Kings.jpg',
      '2-kings.jpg': '2Kings.jpg',
      '1-chronicles.jpg': '1Chronicles.jpg',
      '2-chronicles.jpg': '2Chronicles.jpg',
      'acts.jpg': 'Acts.jpg',
      'colossians.jpg': 'Colossians.jpg',
      'hebrews.jpg': 'Hebrews.jpg',
      'romans.jpg': 'Romans.jpg',
      'songofsolomon.jpg': 'SongOfSolomon.jpg'
    };

    return specialCases[imageName.toLowerCase()] || imageName;
  };

  return (
    <div 
      onClick={handleClick}
      className="media cursor-pointer relative bg-gray-100"
    >
      <Image
        src={`/medias/${getImagePath(book.image)}`}
        alt={book.name}
        width={800}
        height={600}
        className="object-cover opacity-0"
        onError={(e) => {
          // Hide the error image and show the fallback
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
}
