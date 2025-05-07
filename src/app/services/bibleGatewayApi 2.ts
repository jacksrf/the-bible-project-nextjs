import { BibleVersion } from '../context/BibleVersionContext';

class BibleGatewayApi {
  async testApi(): Promise<boolean> {
    try {
      console.log('Testing API route...');
      const response = await fetch('/api/bible?action=test');
      console.log('Test response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test API error response:', errorText);
        throw new Error('API test failed');
      }

      const data = await response.json();
      console.log('Test response:', data);
      return true;
    } catch (error) {
      console.error('API test error:', error);
      return false;
    }
  }

  async getBibleVersions(): Promise<BibleVersion[]> {
    try {
      console.log('Starting getBibleVersions...');
      
      // First test if the API route is working
      console.log('Testing API route before fetching versions...');
      const isWorking = await this.testApi();
      console.log('API test result:', isWorking);
      
      if (!isWorking) {
        throw new Error('API route is not working');
      }

      console.log('Making request to /api/bible?action=versions');
      const response = await fetch('/api/bible?action=versions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Versions response status:', response.status);
      console.log('Versions response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch Bible versions: ${errorText}`);
      }

      const versions = await response.json();
      console.log('Received versions:', versions);
      return versions;
    } catch (error) {
      console.error('Error fetching Bible versions:', error);
      throw error;
    }
  }

  async getVerse(version: string, reference: string): Promise<string> {
    try {
      console.log('Fetching verse:', { version, reference });
      const response = await fetch(
        `/api/bible?action=verse&version=${version}&reference=${encodeURIComponent(reference)}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Verse error response:', errorText);
        throw new Error('Failed to fetch verse');
      }

      const data = await response.json();
      console.log('Received verse data:', data);
      return data.content;
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  }
}

export const bibleGatewayApi = new BibleGatewayApi(); 