'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

interface CameraCaptureProps {
  onImageCapture: (imageData: string) => void;
  analyzing: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCapture, analyzing }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isExternalConnection, setIsExternalConnection] = useState(false);

  // Check if this is an external connection via IP
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsExternalConnection(!isLocalhost);
  }, []);

  // Explicitly request camera permission on component mount
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        // Force a secure context warning if needed
        if (isExternalConnection && window.location.protocol !== 'https:') {
          console.warn('Camera access may be blocked on non-secure origins outside localhost');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 720 },
            height: { ideal: 1280 }
          } 
        });
        
        setPermission(true);
        setCameraError(null);
        
        // Clean up the stream we just requested (the Webcam component will create its own)
        stream.getTracks().forEach(track => track.stop());
      } catch (err: any) {
        console.error('Camera permission error:', err);
        setPermission(false);
        
        // Customize error message based on the error and connection type
        if (isExternalConnection && window.location.protocol !== 'https:') {
          setCameraError('Camera access denied. When accessing via IP address, you need HTTPS. See instructions below.');
        } else {
          setCameraError(err.message || 'Camera access denied');
        }
      }
    };
    
    const timer = setTimeout(() => {
      requestCameraPermission();
    }, 500); // Small delay to ensure DOM is fully loaded
    
    return () => {
      clearTimeout(timer);
      // Cleanup any active media streams when component unmounts
      if (webcamRef.current && webcamRef.current.video) {
        const stream = webcamRef.current.video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [isExternalConnection]);

  useEffect(() => {
    // Check if running on mobile device
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
  }, []);

  useEffect(() => {
    // Check if iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      document.documentElement.classList.add('ios-device');
    }
  }, []);

  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
    setPermission(true);
    setCameraError(null);
  }, []);

  const handlePermissionCheck = useCallback((permissionState: boolean) => {
    setPermission(permissionState);
    if (!permissionState) {
      if (isExternalConnection && window.location.protocol !== 'https:') {
        setCameraError('Camera access denied. When accessing via IP address, you need HTTPS. See instructions below.');
      } else {
        setCameraError('Camera permission denied');
      }
    }
  }, [isExternalConnection]);

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onImageCapture(imageSrc);
      } else {
        setCameraError('Failed to capture image. Please try again.');
      }
    } else {
      setCameraError('Camera not initialized. Please refresh and try again.');
    }
  }, [onImageCapture]);

  const retryCamera = useCallback(() => {
    window.location.reload();
  }, []);

  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: "environment", // Use the rear camera
  };

  if (permission === false || cameraError) {
    return (
      <div className="card flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="text-red-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Camera Access Required</h2>
        <p className="text-gray-600">{cameraError || 'Please allow camera access to scan your food.'}</p>
        
        {isExternalConnection && window.location.protocol !== 'https:' && (
          <div className="mt-2 bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-1">Why is this happening?</p>
            <p className="mb-2">Browsers block camera access on non-secure connections when accessing via IP address.</p>
            <p className="font-medium mb-1">Solutions:</p>
            <ol className="list-decimal list-inside text-left space-y-1">
              <li>Use localhost instead of IP address</li>
              <li>Use a secure HTTPS connection</li>
              <li>On Android, try using Chrome and enabling "Insecure origins treated as secure" in chrome://flags</li>
              <li>For iOS, try visiting this page directly on your device using a local web server</li>
            </ol>
          </div>
        )}
        
        {isMobile && /iPhone|iPad|iPod/.test(navigator.userAgent) && (
          <p className="text-sm text-gray-500 mt-2">
            For iOS users: Go to Settings &gt; Safari &gt; Camera &gt; Allow
          </p>
        )}
        
        <button 
          className="btn-primary"
          onClick={retryCamera}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (permission === null) {
    return (
      <div className="card flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="text-primary-500 mb-2">
          <svg className="animate-spin h-10 w-10 mb-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Requesting Camera Access</h2>
        <p className="text-gray-600">Please allow camera access when prompted</p>
        
        {isExternalConnection && window.location.protocol !== 'https:' && (
          <p className="text-amber-600 text-sm mt-2">
            <strong>Note:</strong> If no prompt appears, your browser may be blocking camera access.
            Try using localhost instead of IP address.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-center justify-center space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Scan Your Meal</h2>
      
      <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-[3/4] max-h-[50vh]">
        {!analyzing ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={handleCameraReady}
              onUserMediaError={() => handlePermissionCheck(false)}
              onUserMediaSuccess={() => handlePermissionCheck(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-dashed border-white opacity-50 m-6 pointer-events-none"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <svg className="animate-spin h-10 w-10 mb-4 mx-auto text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="font-medium">Analyzing your meal...</p>
              <p className="text-xs mt-2 text-gray-300">Our AI is calculating nutrition information</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full">
        <button
          className="btn-primary w-full flex items-center justify-center"
          disabled={!isCameraReady || analyzing}
          onClick={captureImage}
        >
          {analyzing ? (
            <span>Analyzing...</span>
          ) : (
            <span>Scan Meal</span>
          )}
        </button>
        
        {isMobile && (
          <p className="text-xs text-center mt-2 text-gray-500">
            Hold your phone steadily over your meal for best results
          </p>
        )}
      </div>
    </div>
  );
};

export default CameraCapture; 