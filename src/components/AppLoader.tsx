import { useEffect, useState } from 'react';

export function AppLoader() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ProjectKAF</h1>
          <p className="text-gray-600">Restaurant Management Platform</p>
        </div>
        
        <div className="space-y-3">
          <div className="text-lg text-gray-700 font-medium">
            Loading{dots}
          </div>
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Initializing multi-tenant restaurant SaaS</p>
        </div>
      </div>
    </div>
  );
}