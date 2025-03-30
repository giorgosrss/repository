'use client';

import { useState, useEffect } from 'react';
import CameraCapture from './components/CameraCapture';
import NutritionInfo from './components/NutritionInfo';
import Header from './components/Header';
import Footer from './components/Footer';
import { mockProcessImage } from './lib/imageProcessor';

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraSupport, setHasCameraSupport] = useState(true);
  const [isExternalIP, setIsExternalIP] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(true);

  // Check if the site is being accessed externally and if it's in a secure context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if accessing via localhost or IP
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsExternalIP(!isLocalhost);
      
      // Check if in a secure context
      setIsSecureContext(window.isSecureContext);
      
      // If external IP and not secure, show warning
      if (!isLocalhost && window.location.protocol !== 'https:') {
        console.warn('Camera access may be blocked - not using HTTPS on external IP');
      }
    }
  }, []);

  // Check if the device supports getUserMedia (camera access)
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraSupport(false);
      setError("Your browser doesn't support camera access. Try using Safari on iOS.");
    }
  }, []);

  const handleImageCapture = async (imageData: string) => {
    setAnalyzing(true);
    setError(null);
    
    try {
      // In a production app, use the real processImage function
      // For demo/development, use the mock version
      const result = await mockProcessImage(imageData);
      setNutritionData(result);
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      setError(error.message || 'Failed to analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScan = () => {
    setNutritionData(null);
    setError(null);
  };

  // Show warning if external IP but not secure context
  const showHttpsWarning = isExternalIP && !isSecureContext;

  if (!hasCameraSupport) {
    return (
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 to-white">
        <Header />
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
          <div className="card flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Camera Not Supported</h2>
            <p className="text-gray-600">{error || "Your browser doesn't support camera access. Please try a different browser like Safari."}</p>
          </div>
        </div>
        
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 to-white">
      <Header />
      
      {showHttpsWarning && (
        <div className="bg-amber-100 p-4 text-amber-800 text-sm">
          <p className="font-bold">⚠️ HTTPS Required for Camera Access</p>
          <p>You're accessing this app via an IP address with HTTP. Camera access requires HTTPS.</p>
          <div className="mt-2">
            <p className="font-semibold">Try one of these solutions:</p>
            <ol className="list-decimal list-inside">
              <li>Access via localhost instead: <strong>http://localhost:3000</strong></li>
              <li>Use a secure HTTPS connection through a service like ngrok</li>
              <li>Deploy the app to a service with HTTPS (Vercel, Netlify, etc.)</li>
            </ol>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
            <button 
              className="ml-2 underline font-medium"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        {!nutritionData ? (
          <CameraCapture onImageCapture={handleImageCapture} analyzing={analyzing} />
        ) : (
          <NutritionInfo nutritionData={nutritionData} onReset={resetScan} />
        )}
      </div>
      
      <Footer />
    </main>
  );
} 