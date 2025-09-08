import { MOCK_OPPORTUNITIES } from '../constants';
import type { ArbitrageOpportunity } from '../types';

export const fetchOpportunities = async (): Promise<ArbitrageOpportunity[]> => {
  // Simulate loading time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Apply user filters from settings
  const minProfit = Number(localStorage.getItem('minProfit') || '10');
  const minRoi = Number(localStorage.getItem('minRoi') || '25');
  
  const filteredOpportunities = MOCK_OPPORTUNITIES.filter(opp => 
    opp.potentialProfit >= minProfit && opp.roi >= minRoi
  );
  
  // Make dates feel current
  return filteredOpportunities.map(opp => ({
    ...opp,
    dateFound: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  }));
};
