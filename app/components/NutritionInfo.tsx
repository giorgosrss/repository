'use client';

import React from 'react';

interface FoodQuantity {
  name: string;
  displayName: string;
  quantity: number;
  unit: string;
  confidence: number;
}

interface NutritionData {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  vitamins: string[];
  minerals: string[];
  // Quantity information
  quantityDescription: string;
  foodQuantities: FoodQuantity[];
  // Additional detailed nutrition fields
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  glycemicIndex?: number | null;
  allergens?: string[];
  processedLevel?: string;
  additives?: string[];
  antiInflammatory?: string[];
  antioxidants?: string[];
}

interface NutritionInfoProps {
  nutritionData: NutritionData;
  onReset: () => void;
}

const NutritionInfo: React.FC<NutritionInfoProps> = ({ nutritionData, onReset }) => {
  const { 
    foodName, 
    calories, 
    protein, 
    carbs, 
    fat, 
    fiber, 
    sugar, 
    vitamins, 
    minerals,
    quantityDescription,
    foodQuantities = [],
    saturatedFat = fat * 0.4, // Estimate if not provided
    transFat = 0,
    cholesterol = 0,
    sodium = 120,
    potassium = 250,
    glycemicIndex = null,
    allergens = [],
    processedLevel = "Minimally Processed",
    additives = [],
    antiInflammatory = ["Omega-3", "Polyphenols"],
    antioxidants = ["Vitamin E", "Vitamin C"]
  } = nutritionData;

  // Calculate approximate water content
  const approximateWaterContent = 100 - (protein + carbs + fat);

  // Calculate debloat score (0-100) based on fiber, sodium, and water content
  const debloatScore = Math.min(100, Math.max(0, 
    50 + 
    (fiber * 5) + 
    (approximateWaterContent * 0.5) - 
    (sodium * 0.02) -
    (sugar * 2)
  ));

  // Debloat rating based on score
  const getDebloatRating = () => {
    if (debloatScore >= 80) return "Excellent";
    if (debloatScore >= 65) return "Good";
    if (debloatScore >= 50) return "Moderate";
    if (debloatScore >= 35) return "Poor";
    return "Very Poor";
  };

  // Debloat color based on rating
  const getDebloatColor = () => {
    if (debloatScore >= 80) return "text-green-600";
    if (debloatScore >= 65) return "text-green-500";
    if (debloatScore >= 50) return "text-yellow-500";
    if (debloatScore >= 35) return "text-orange-500";
    return "text-red-500";
  };

  // Format confidence percentage
  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className="card flex flex-col space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{foodName}</h2>
        <p className="text-sm text-gray-500">Analyzed Results</p>
      </div>
      
      {/* Food quantity section */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Detected Food</h3>
        <p className="text-base font-medium text-gray-800">{quantityDescription}</p>
        
        {foodQuantities.length > 1 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Individual Items:</p>
            <div className="space-y-1">
              {foodQuantities.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">
                    {item.quantity} {item.quantity > 1 && item.unit !== 'oz' ? 
                      (item.unit === 'fish' ? 'fish' : `${item.unit}s`) : 
                      item.unit} of {item.displayName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatConfidence(item.confidence)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main nutrition summary */}
      <div className="bg-primary-50 rounded-xl p-4 flex justify-center items-center space-x-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-700">{calories}</div>
          <div className="text-xs text-gray-500">calories</div>
        </div>
        
        <div className="h-12 w-px bg-primary-200"></div>
        
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-xl font-bold text-primary-700">{protein}g</div>
            <div className="text-xs text-gray-500">protein</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-primary-700">{carbs}g</div>
            <div className="text-xs text-gray-500">carbs</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-primary-700">{fat}g</div>
            <div className="text-xs text-gray-500">fat</div>
          </div>
        </div>
      </div>

      {/* Debloat score section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Debloat Score</h3>
          <div className={`text-lg font-bold ${getDebloatColor()}`}>{Math.round(debloatScore)}/100</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 h-2.5 rounded-full" 
            style={{ width: `${debloatScore}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2 text-gray-600">
          Rating: <span className={`font-medium ${getDebloatColor()}`}>{getDebloatRating()}</span>
        </p>
        <div className="mt-2 text-xs text-gray-500">
          {fiber > 3 && <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded mr-1 mb-1">High Fiber</span>}
          {sodium > 400 && <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded mr-1 mb-1">High Sodium</span>}
          {sugar > 10 && <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded mr-1 mb-1">High Sugar</span>}
          {approximateWaterContent > 70 && <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded mr-1 mb-1">Hydrating</span>}
        </div>
      </div>

      {/* Detailed nutrition section */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Fiber</p>
            <p className="font-semibold">{fiber}g</p>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Sugar</p>
            <p className="font-semibold">{sugar}g</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Saturated Fat</p>
            <p className="font-semibold">{saturatedFat.toFixed(1)}g</p>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Sodium</p>
            <p className="font-semibold">{sodium}mg</p>
          </div>
        </div>
        
        {/* Anti-inflammatory compounds */}
        {antiInflammatory.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Anti-inflammatory Compounds</p>
            <div className="flex flex-wrap gap-1">
              {antiInflammatory.map((item) => (
                <span key={item} className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Vitamins section */}
        <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Vitamins</p>
          <div className="flex flex-wrap gap-1">
            {vitamins.map((vitamin) => (
              <span key={vitamin} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                {vitamin}
              </span>
            ))}
          </div>
        </div>
        
        {/* Minerals section */}
        <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Minerals</p>
          <div className="flex flex-wrap gap-1">
            {minerals.map((mineral) => (
              <span key={mineral} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {mineral}
              </span>
            ))}
          </div>
        </div>
        
        {/* Processing level */}
        <div className="bg-white shadow-sm rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Processing Level</p>
          <p className="font-semibold">{processedLevel}</p>
          {additives.length > 0 && (
            <div className="mt-1">
              <p className="text-xs text-gray-500">Additives</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {additives.map((additive) => (
                  <span key={additive} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
                    {additive}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <button
          className="btn-secondary w-full"
          onClick={onReset}
        >
          Scan Another Meal
        </button>
      </div>
    </div>
  );
};

export default NutritionInfo; 