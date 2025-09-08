import { MOCK_OPPORTUNITIES } from '../constants';
import type { ArbitrageOpportunity } from '../types';

/**
 * Fetches arbitrage opportunities from the backend server.
 * In a real application, this would make a network request to your API.
 * For demonstration, it falls back to mock data if the API call fails.
 * 
 * Replace `/api/opportunities` with your actual backend endpoint.
 */
export const fetchOpportunities = async (): Promise<ArbitrageOpportunity[]> => {
  try {
    // This is where you would call your actual backend API.
    // The endpoint `/api/opportunities` is a placeholder.
    // You will need to build a backend server that provides this endpoint.
    const response = await fetch('/api/opportunities');
    
    if (!response.ok) {
        // If the server responds with an error, throw to be caught by the calling component.
        throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const data: ArbitrageOpportunity[] = await response.json();
    return data;

  } catch (error) {
    console.error("Could not fetch from backend:", error);
    // As a fallback for this demo, we return mock data.
    // In a real production app, you would handle this error in the UI.
    console.log("Falling back to mock data.");
    return MOCK_OPPORTUNITIES;
    // Or you could re-throw the error to be handled by the UI component:
    // throw new Error("Failed to connect to the backend service.");
  }
};