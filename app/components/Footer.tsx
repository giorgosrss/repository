'use client';

const Footer = () => {
  return (
    <footer className="w-full px-6 py-3 bg-white border-t border-gray-100 text-center">
      <div className="max-w-md mx-auto text-xs text-gray-500">
        <p className="mb-1">NutriScan © {new Date().getFullYear()}</p>
        <p>Privacy-focused AI food scanning for better health</p>
      </div>
    </footer>
  );
};

export default Footer; 