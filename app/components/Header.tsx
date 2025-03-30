'use client';

const Header = () => {
  return (
    <header className="w-full px-6 py-4 bg-white shadow-sm z-10">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 text-transparent bg-clip-text">
            NutriScan
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-800 font-medium">
            AI Powered
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium hidden sm:inline-block">
            Quantity Detection
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header; 