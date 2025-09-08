
export interface ArbitrageOpportunity {
  id: string;
  productName: string;
  ebayPrice: number;
  amazonPrice: number;
  ebayUrl: string;
  amazonUrl: string;
  imageUrl: string;
  ebaySeller: string;
  amazonSeller: string;
  fees: {
    ebay: number;
    amazon: number;
    shipping: number;
  };
  potentialProfit: number;
  roi: number;
  dateFound: string;
}

export interface GeminiAnalysis {
  riskScore: number;
  summary: string;
  potentialIssues: string[];
}

export type View = 'dashboard' | 'performance' | 'settings';

export interface PerformanceData {
  date: string;
  profit: number;
  opportunities: number;
}
   