# NutriScan - AI-Powered Meal Scanner

NutriScan is a web application that uses AI to scan your meals and provide nutritional information. It's designed to work especially well on mobile devices, including Safari on iOS.

## Features

- Scan your meal using your device's camera
- Automatic quantity detection (e.g., 2 bananas, 3 slices of pizza)
- Get instant nutritional information (calories, macronutrients, vitamins, etc.)
- Debloat score to help identify foods that may cause bloating
- Beautiful, user-friendly interface
- Works on mobile browsers, including Safari on iOS
- Privacy-focused (all scanning happens on your device)

## Technologies Used

- Next.js for the frontend framework
- TensorFlow.js for AI capabilities
- React Webcam for camera access
- TailwindCSS for styling
- TypeScript for type safety

## Getting Started

To run this application locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Mobile Access

### Important: Camera Access on Mobile Devices

Camera access requires a secure context (HTTPS) when accessing from non-localhost domains. Here are the options for testing on mobile devices:

### Option 1: Using localhost (easiest for testing)
1. Run the app on your computer with `npm run dev`
2. On your mobile device, use a browser and navigate to:
   ```
   http://localhost:3000
   ```
   
### Option 2: Using IP address with HTTPS (recommended for external devices)
1. Install SSL proxy dependencies:
   ```bash
   npm install
   ```
2. Generate self-signed certificates:
   ```bash
   npm run generate-cert
   ```
3. Run the app with HTTPS:
   ```bash
   npm run dev:https
   ```
4. On your mobile device, navigate to:
   ```
   https://YOUR_COMPUTER_IP:3443
   ```
   Replace YOUR_COMPUTER_IP with your computer's IP address
   
5. Accept the security warning about the self-signed certificate

### Option 3: Using a tunnel service (easiest for sharing)
1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```
2. Run your app:
   ```bash
   npm run dev
   ```
3. In a separate terminal, run the ngrok helper:
   ```bash
   npm run dev:ngrok
   ```
4. Use the HTTPS URL provided by ngrok on your mobile device

## Troubleshooting Camera Access

If you experience issues with camera access:

- **iOS Safari**: Go to Settings > Safari > Camera > Allow
- **Android Chrome**: Ensure you're using HTTPS or try enabling "Insecure origins treated as secure" in chrome://flags
- **Different Browser**: Try Firefox or Chrome if Safari is giving permission issues
- **Clear Cache**: Try clearing your browser cache and cookies
- **Reload App**: Sometimes a simple reload solves permission issues

## Usage Notes

- For best results, ensure good lighting when scanning your meal
- Hold your device steady over the food
- Allow camera permissions when prompted
- The app can detect multiple food items at once (e.g., a sandwich and an apple)
- Works best with clearly separated food items

## Deployment

This application can be deployed to platforms like Vercel, Netlify, or any hosting service that supports Next.js. "# repository" 
