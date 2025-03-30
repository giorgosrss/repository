'use client';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Food categories that we can recognize
const FOOD_CATEGORIES = [
  'apple', 'banana', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza',
  'donut', 'cake', 'sandwich', 'salad', 'bread', 'chicken', 'rice', 'pasta',
  'beef', 'fish', 'egg', 'avocado', 'tomato'
];

// Food units mapping
const FOOD_UNITS: Record<string, string> = {
  'apple': 'whole',
  'banana': 'whole',
  'orange': 'whole',
  'broccoli': 'cup',
  'carrot': 'whole',
  'hot dog': 'whole',
  'pizza': 'slice',
  'donut': 'whole',
  'cake': 'slice',
  'sandwich': 'whole',
  'salad': 'bowl',
  'bread': 'slice',
  'chicken': 'piece',
  'rice': 'cup',
  'pasta': 'cup',
  'beef': 'oz',
  'fish': 'fillet',
  'egg': 'whole',
  'avocado': 'whole',
  'tomato': 'whole'
};

// Mock nutrition database - in a real app, this would be more comprehensive or come from an API
const NUTRITION_DATABASE: Record<string, any> = {
  'apple': { 
    calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, sugar: 19,
    vitamins: ['C', 'K'], minerals: ['Potassium'],
    saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 2, potassium: 195,
    glycemicIndex: 36, allergens: [], processedLevel: "Unprocessed",
    additives: [], antiInflammatory: ["Quercetin", "Catechin"], 
    antioxidants: ["Vitamin C", "Polyphenols"]
  },
  'banana': { 
    calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14,
    vitamins: ['B6', 'C'], minerals: ['Potassium', 'Magnesium'],
    saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 422,
    glycemicIndex: 51, allergens: [], processedLevel: "Unprocessed",
    additives: [], antiInflammatory: ["Dopamine", "Catechin"], 
    antioxidants: ["Dopamine", "Vitamin C"]
  },
  'orange': { 
    calories: 69, protein: 1.3, carbs: 17, fat: 0.2, fiber: 3.4, sugar: 12,
    vitamins: ['C'], minerals: ['Potassium', 'Calcium'],
    saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 0, potassium: 237,
    glycemicIndex: 40, allergens: ["Citrus"], processedLevel: "Unprocessed",
    additives: [], antiInflammatory: ["Flavonoids", "Hesperidin"], 
    antioxidants: ["Vitamin C", "Carotenoids"]
  },
  'broccoli': { 
    calories: 31, protein: 2.5, carbs: 6, fat: 0.4, fiber: 2.4, sugar: 1.5,
    vitamins: ['C', 'K'], minerals: ['Potassium', 'Iron'],
    saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 33, potassium: 288,
    glycemicIndex: 15, allergens: [], processedLevel: "Unprocessed",
    additives: [], antiInflammatory: ["Sulforaphane", "Kaempferol"], 
    antioxidants: ["Vitamin C", "Lutein"]
  },
  'pizza': { 
    calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2.5, sugar: 3.8,
    vitamins: ['A', 'B12'], minerals: ['Calcium', 'Iron'],
    saturatedFat: 4.5, transFat: 0.2, cholesterol: 18, sodium: 640, potassium: 184,
    glycemicIndex: 60, allergens: ["Gluten", "Dairy"], processedLevel: "Processed",
    additives: ["MSG", "Sodium Nitrate"], antiInflammatory: [], 
    antioxidants: ["Lycopene"]
  },
  'sandwich': { 
    calories: 320, protein: 18, carbs: 35, fat: 12, fiber: 4, sugar: 5,
    vitamins: ['B3', 'B12'], minerals: ['Iron', 'Zinc'],
    saturatedFat: 3.5, transFat: 0.1, cholesterol: 45, sodium: 730, potassium: 320,
    glycemicIndex: 55, allergens: ["Gluten"], processedLevel: "Moderately Processed",
    additives: [], antiInflammatory: [], antioxidants: []
  },
  'salad': { 
    calories: 150, protein: 6, carbs: 12, fat: 8, fiber: 4, sugar: 3,
    vitamins: ['A', 'C', 'K'], minerals: ['Iron', 'Calcium', 'Potassium'],
    saturatedFat: 1.5, transFat: 0, cholesterol: 0, sodium: 120, potassium: 350,
    glycemicIndex: 15, allergens: [], processedLevel: "Minimally Processed",
    additives: [], antiInflammatory: ["Omega-3", "Flavonoids"], 
    antioxidants: ["Vitamin C", "Vitamin E", "Carotenoids"]
  },
  'chicken': { 
    calories: 220, protein: 33, carbs: 0, fat: 8, fiber: 0, sugar: 0,
    vitamins: ['B6', 'B12'], minerals: ['Phosphorus', 'Selenium'],
    saturatedFat: 2.5, transFat: 0, cholesterol: 88, sodium: 122, potassium: 302,
    glycemicIndex: 0, allergens: [], processedLevel: "Minimally Processed",
    additives: [], antiInflammatory: [], antioxidants: []
  },
  // Default for unknown food items
  'default': { 
    calories: 250, protein: 12, carbs: 30, fat: 10, fiber: 3, sugar: 5,
    vitamins: ['A', 'C'], minerals: ['Iron', 'Calcium'],
    saturatedFat: 3, transFat: 0, cholesterol: 15, sodium: 300, potassium: 250,
    glycemicIndex: 50, allergens: [], processedLevel: "Minimally Processed",
    additives: [], antiInflammatory: ["Omega-3", "Polyphenols"], 
    antioxidants: ["Vitamin C", "Vitamin E"]
  }
};

// Initialize TensorFlow.js and load COCO-SSD model
let model: cocoSsd.ObjectDetection | null = null;

export const initializeModel = async (): Promise<void> => {
  // Load TensorFlow backend
  await tf.setBackend('webgl');
  
  // Load COCO-SSD model if not already loaded
  if (!model) {
    try {
      model = await cocoSsd.load();
      console.log('COCO-SSD model loaded successfully');
    } catch (error) {
      console.error('Error loading COCO-SSD model:', error);
      throw new Error('Failed to load AI model');
    }
  }
};

export const processImage = async (imageData: string): Promise<any> => {
  // Make sure model is initialized
  if (!model) {
    await initializeModel();
  }
  
  // Create an HTML Image element from the data URL
  const image = new Image();
  image.src = imageData;
  
  // Wait for the image to load
  await new Promise<void>((resolve) => {
    image.onload = () => resolve();
  });
  
  try {
    // Run object detection
    const predictions = await model!.detect(image);
    
    // Filter for food items and group by class
    const foodItemsGrouped: Record<string, any[]> = {};
    
    predictions.forEach(prediction => {
      if (FOOD_CATEGORIES.includes(prediction.class)) {
        if (!foodItemsGrouped[prediction.class]) {
          foodItemsGrouped[prediction.class] = [];
        }
        foodItemsGrouped[prediction.class].push(prediction);
      }
    });
    
    // If we found multiple types of food, we'll report them all
    const foodTypes = Object.keys(foodItemsGrouped);
    
    if (foodTypes.length > 0) {
      // If multiple food types, pick the one with highest confidence as primary
      let primaryFoodType = foodTypes[0];
      let bestConfidence = Math.max(...foodItemsGrouped[primaryFoodType].map(item => item.score));
      
      for (const foodType of foodTypes) {
        const foodTypeMaxConfidence = Math.max(...foodItemsGrouped[foodType].map(item => item.score));
        if (foodTypeMaxConfidence > bestConfidence) {
          bestConfidence = foodTypeMaxConfidence;
          primaryFoodType = foodType;
        }
      }
      
      // Get nutrition data for the primary food
      const nutritionData = NUTRITION_DATABASE[primaryFoodType] || NUTRITION_DATABASE.default;
      
      // Create a description of the food quantities
      const foodQuantities = foodTypes.map(foodType => {
        const count = foodItemsGrouped[foodType].length;
        const unit = FOOD_UNITS[foodType] || 'serving';
        const name = foodType.charAt(0).toUpperCase() + foodType.slice(1);
        
        return {
          name: foodType,
          displayName: name,
          quantity: count,
          unit: unit,
          confidence: Math.max(...foodItemsGrouped[foodType].map(item => item.score))
        };
      });
      
      // Sort by confidence
      foodQuantities.sort((a, b) => b.confidence - a.confidence);
      
      // Create a human-readable description
      const quantityDescription = foodQuantities.map(food => {
        const pluralUnit = food.quantity > 1 && food.unit !== 'oz' ? 
          (food.unit === 'fish' ? 'fish' : `${food.unit}s`) : food.unit;
        return `${food.quantity} ${pluralUnit} of ${food.displayName}`;
      }).join(', ');
      
      // Return combined result
      return {
        foodName: primaryFoodType.charAt(0).toUpperCase() + primaryFoodType.slice(1),
        confidence: bestConfidence,
        quantityDescription: quantityDescription,
        foodQuantities: foodQuantities,
        ...nutritionData
      };
    } else {
      // If no food items detected, return default data
      return {
        foodName: 'Unknown Food',
        quantityDescription: 'Unknown quantity',
        foodQuantities: [],
        ...NUTRITION_DATABASE.default
      };
    }
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to analyze food image');
  }
};

// For demo purposes without actual TensorFlow processing
export const mockProcessImage = async (imageData: string): Promise<any> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Randomly select a food item from our database for demo purposes
  const foodItems = Object.keys(NUTRITION_DATABASE).filter(item => item !== 'default');
  
  // Randomly decide if we're detecting a single food type or multiple
  const detectMultiple = Math.random() > 0.5;
  
  if (detectMultiple) {
    // Select 2-3 random food types
    const numFoodTypes = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const selectedFoods: string[] = [];
    
    while (selectedFoods.length < numFoodTypes) {
      const randomFood = foodItems[Math.floor(Math.random() * foodItems.length)];
      if (!selectedFoods.includes(randomFood)) {
        selectedFoods.push(randomFood);
      }
    }
    
    // Create quantities for each food type
    const foodQuantities = selectedFoods.map(food => {
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
      return {
        name: food,
        displayName: food.charAt(0).toUpperCase() + food.slice(1),
        quantity,
        unit: FOOD_UNITS[food] || 'serving',
        confidence: 0.85 + (Math.random() * 0.13)
      };
    });
    
    // Sort by confidence
    foodQuantities.sort((a, b) => b.confidence - a.confidence);
    
    // Primary food is the one with highest confidence
    const primaryFood = foodQuantities[0].name;
    
    // Create a human-readable description
    const quantityDescription = foodQuantities.map(food => {
      const pluralUnit = food.quantity > 1 && food.unit !== 'oz' ? 
        (food.unit === 'fish' ? 'fish' : `${food.unit}s`) : food.unit;
      return `${food.quantity} ${pluralUnit} of ${food.displayName}`;
    }).join(', ');
    
    return {
      foodName: primaryFood.charAt(0).toUpperCase() + primaryFood.slice(1),
      confidence: foodQuantities[0].confidence,
      quantityDescription,
      foodQuantities,
      ...NUTRITION_DATABASE[primaryFood]
    };
  } else {
    // Single food type
    const randomFood = foodItems[Math.floor(Math.random() * foodItems.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const unit = FOOD_UNITS[randomFood] || 'serving';
    const pluralUnit = quantity > 1 && unit !== 'oz' ? 
      (unit === 'fish' ? 'fish' : `${unit}s`) : unit;
    
    const foodQuantities = [{
      name: randomFood,
      displayName: randomFood.charAt(0).toUpperCase() + randomFood.slice(1),
      quantity,
      unit,
      confidence: 0.92
    }];
    
    return {
      foodName: randomFood.charAt(0).toUpperCase() + randomFood.slice(1),
      confidence: 0.92,
      quantityDescription: `${quantity} ${pluralUnit} of ${randomFood.charAt(0).toUpperCase() + randomFood.slice(1)}`,
      foodQuantities,
      ...NUTRITION_DATABASE[randomFood]
    };
  }
}; 