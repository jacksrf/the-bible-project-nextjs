import { NextResponse } from 'next/server';
import type { BibleBook } from '@/types/bible-book';

const BIBLIA_API_KEY = '5b01f70d6ef9d6dcae58d1a483dce2a3';
const BIBLIA_API_URL = 'https://api.biblia.com/v1';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching books for Bible version:', params.id);
    
    // List of Bible books in order
    const bibleBooks = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
      'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
      'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
      'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
      'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
      'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts',
      'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
      '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
      '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
      'Jude', 'Revelation'
    ];

    // Transform the books into our BibleBook format
    const books: BibleBook[] = bibleBooks.map((bookName, index) => ({
      id: String(index + 1),
      name: bookName,
      testament: index < 39 ? 'OT' : 'NT',
      chapters: 0, // We'll need to fetch this separately if needed
      image: bookName.toLowerCase().replace(/\s+/g, '-') + '.jpg'
    }));

    console.log('Transformed books:', books);
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error in books API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch books' },
      { status: 500 }
    );
  }
} 