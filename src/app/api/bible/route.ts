import { NextResponse } from 'next/server';

const BIBLIA_API_KEY = '5b01f70d6ef9d6dcae58d1a483dce2a3';
const BIBLIA_API_URL = 'https://api.biblia.com/v1';

export async function GET(request: Request) {
  console.log('API route called');
  console.log('Request URL:', request.url);
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    console.log('Action:', action);

    if (!action) {
      console.log('No action provided');
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }

    // Test endpoint
    if (action === 'test') {
      console.log('Test endpoint called');
      return NextResponse.json({ message: 'API route is working' });
    }

    switch (action) {
      case 'versions': {
        console.log('Fetching Bible versions from Biblia API');
        const response = await fetch(`${BIBLIA_API_URL}/bible/find.txt?key=${BIBLIA_API_KEY}`);
        console.log('Biblia API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Biblia API error response:', errorText);
          throw new Error(`Failed to fetch Bible versions: ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw Biblia API response:', data);
        
        if (!data || !data.bibles || !Array.isArray(data.bibles)) {
          throw new Error('Invalid response format from Biblia API');
        }

        // Transform the response into our BibleVersion format
        const versions = data.bibles
          .filter((bible: any) => bible.languages.includes('en'))
          .map((bible: any) => ({
            value: bible.bible,
            label: `${bible.title} (${bible.abbreviatedTitle})`
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));

        console.log('Transformed versions:', versions);
        return NextResponse.json(versions);
      }

      case 'verse': {
        const version = searchParams.get('version');
        const reference = searchParams.get('reference');

        if (!version || !reference) {
          return NextResponse.json(
            { error: 'Version and reference are required' },
            { status: 400 }
          );
        }

        const response = await fetch(
          `${BIBLIA_API_URL}/bible/content/${version}.txt?key=${BIBLIA_API_KEY}&passage=${encodeURIComponent(reference)}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Verse error response:', errorText);
          throw new Error('Failed to fetch verse');
        }

        const text = await response.text();
        return NextResponse.json({ content: text });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 