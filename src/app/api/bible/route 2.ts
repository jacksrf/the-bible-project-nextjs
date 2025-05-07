import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.biblegateway.com/2';

interface AccessTokenResponse {
  access_token: string;
  expiration: number;
}

interface ErrorResponse {
  error: {
    errcode: number;
    errmsg: string;
  };
}

let accessToken: string | null = null;
let tokenExpiration: number = 0;

async function getAccessToken(): Promise<string> {
  console.log('Starting getAccessToken function');
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check if we have a valid token
  if (accessToken && tokenExpiration > currentTime) {
    console.log('Using cached token:', accessToken);
    return accessToken;
  }

  try {
    console.log('About to request new token...');
    const username = process.env.BIBLE_GATEWAY_USERNAME;
    const password = process.env.BIBLE_GATEWAY_PASSWORD;
    
    console.log('Environment variables:', {
      username: username ? 'Set' : 'Not set',
      password: password ? 'Set' : 'Not set'
    });

    if (!username || !password) {
      console.log('Credentials missing - throwing error');
      throw new Error('Bible Gateway credentials not configured');
    }

    console.log('Credentials found, constructing URL...');
    const tokenUrl = `${BASE_URL}/request_access_token?username=${username}&password=${password}`;
    console.log('Token request URL:', tokenUrl);

    const response = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Token response status:', response.status);
    console.log('Token response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw token response text:', responseText);

    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed token response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to parse token response as JSON:', e);
      throw new Error('Invalid JSON response from token server');
    }

    // Handle the response data
    // if (!data || typeof data !== 'object') {
    //   console.error('Invalid response format:', data);
    //   throw new Error('Invalid token response format');
    // }

    // if (!data.access_token || typeof data.access_token !== 'string') {
    //   console.error('Invalid access_token in response:', data);
    //   throw new Error('Missing or invalid access_token in response');
    // }

    // Set expiration to 1 hour from now if not provided
    const expiration = typeof data.expiration === 'number' ? data.expiration : (currentTime + 3600);
    
    console.log('Token data:', {
      token: data.access_token,
      expiration: expiration,
      currentTime: currentTime
    });

    accessToken = data.access_token;
    tokenExpiration = expiration;
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  console.log('API route called - TEST');
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

    console.log('About to get access token...');
    const token = await getAccessToken();
    console.log('Got access token:', token ? 'Yes' : 'No');

    switch (action) {
      case 'versions': {
        console.log('Fetching Bible versions with token:', token);
        const response = await fetch(`${BASE_URL}/bible?access_token=${token}`);
        console.log('Bible Gateway response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Bible Gateway error response:', errorText);
          const errorData = JSON.parse(errorText) as ErrorResponse;
          if (errorData.error.errcode === 4) {
            console.log('Token expired, retrying...');
            accessToken = null;
            return GET(request);
          }
          throw new Error(`Failed to fetch Bible versions: ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw Bible Gateway response:', JSON.stringify(data, null, 2));
        
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format from Bible Gateway');
        }

        // Transform the response into our BibleVersion format
        const versions = Object.entries(data)
          .filter(([key]) => {
            const englishVersions = ['NIV', 'ESV', 'KJV', 'NKJV', 'NLT', 'CSB', 'NASB', 'AMP', 'NRSV', 'RSV', 'ASV', 'CEV', 'GNT', 'MSG', 'WEB'];
            const isEnglish = englishVersions.includes(key);
            console.log(`Version ${key} is English: ${isEnglish}`);
            return isEnglish;
          })
          .map(([key, value]: [string, any]) => {
            console.log(`Processing version ${key}:`, value);
            return {
              value: key,
              label: `${value.name || value.title || key} (${key})`
            };
          })
          .sort((a, b) => a.label.localeCompare(b.label));

        console.log('Final transformed versions:', JSON.stringify(versions, null, 2));
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
          `${BASE_URL}/bible/${reference}/${version}?access_token=${token}`
        );

        if (!response.ok) {
          const errorData = (await response.json()) as ErrorResponse;
          if (errorData.error.errcode === 4) {
            accessToken = null;
            return GET(request);
          }
          throw new Error('Failed to fetch verse');
        }

        const data = await response.json();
        return NextResponse.json(data);
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