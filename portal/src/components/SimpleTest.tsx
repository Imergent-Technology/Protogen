import React from 'react';
import { Button } from '@protogen/shared';

export const SimpleTest: React.FC = () => {
  const handleTestOAuth = () => {
    // Simulate OAuth callback by setting URL parameters
    const testUser = {
      id: 1,
      name: 'Test User',
      email: 'test@protogen.local',
      reputation: 0.85,
      is_admin: false
    };
    const testToken = 'test-token-123';
    
    // Set URL parameters to simulate OAuth callback
    const url = new URL(window.location.href);
    url.searchParams.set('token', testToken);
    url.searchParams.set('user', encodeURIComponent(JSON.stringify(testUser)));
    url.searchParams.set('provider', 'google');
    
    // Reload the page with the test parameters
    window.location.href = url.toString();
  };

  return (
    <div className="p-8 bg-green-100 border border-green-300 rounded-lg">
      <h1 className="text-2xl font-bold text-green-800 mb-4">
        Portal Test - React Hooks Working!
      </h1>
      <p className="text-green-700 mb-4">
        If you can see this, the Portal is working correctly without React hooks issues.
      </p>
      <Button onClick={handleTestOAuth} className="bg-blue-500 hover:bg-blue-600">
        Test OAuth Login
      </Button>
    </div>
  );
};
