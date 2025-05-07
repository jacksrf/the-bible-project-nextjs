import { NextResponse } from 'next/server';
import type { BibleBook } from '@/types/bible-book';
import { bibleBooks } from '@/data/bible-books';

const BIBLIA_API_KEY = '5b01f70d6ef9d6dcae58d1a483dce2a3';
const BIBLIA_API_URL = 'https://api.biblia.com/v1';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching books for Bible version:', params.id);
    
    // Use the bibleBooks array from our data file which has the correct image paths
    return NextResponse.json(bibleBooks);
  } catch (error) {
    console.error('Error in books API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch books' },
      { status: 500 }
    );
  }
} 