import { NextResponse } from 'next/server';

const BIBLE_API_KEY = process.env.BIBLE_API_KEY;
const BIBLE_API_URL = 'https://api.scripture.api.bible/v1';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!BIBLE_API_KEY) {
    return NextResponse.json(
      { error: 'Bible API key not configured' },
      { status: 500 }
    );
  }

  try {
    // First, get the list of available Bibles
    const biblesResponse = await fetch(`${BIBLE_API_URL}/bibles`, {
      headers: {
        'api-key': BIBLE_API_KEY,
      },
    });

    if (!biblesResponse.ok) {
      throw new Error('Failed to fetch Bibles');
    }

    const biblesData = await biblesResponse.json();
    const nivBible = biblesData.data.find((bible: any) => bible.name === 'New International Version');
    
    if (!nivBible) {
      throw new Error('NIV Bible not found');
    }

    // Then, fetch the specific book
    const bookResponse = await fetch(
      `${BIBLE_API_URL}/bibles/${nivBible.id}/books/${params.id}/chapters`,
      {
        headers: {
          'api-key': BIBLE_API_KEY,
        },
      }
    );

    if (!bookResponse.ok) {
      throw new Error('Failed to fetch book content');
    }

    const bookData = await bookResponse.json();
    
    // Get the first chapter as an example
    const firstChapter = bookData.data[0];
    const chapterResponse = await fetch(
      `${BIBLE_API_URL}/bibles/${nivBible.id}/chapters/${firstChapter.id}`,
      {
        headers: {
          'api-key': BIBLE_API_KEY,
        },
      }
    );

    if (!chapterResponse.ok) {
      throw new Error('Failed to fetch chapter content');
    }

    const chapterData = await chapterResponse.json();
    
    return NextResponse.json([
      {
        reference: chapterData.data.reference,
        text: chapterData.data.content,
      },
    ]);
  } catch (error) {
    console.error('Error fetching Bible content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bible content' },
      { status: 500 }
    );
  }
} 