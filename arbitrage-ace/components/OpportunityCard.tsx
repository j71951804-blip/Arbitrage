
import React, { useState } from 'react';
import type { ArbitrageOpportunity, GeminiAnalysis } from '../types';
import { analyzeOpportunity, generateListingDescription } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { EbayIcon, AmazonIcon, ArrowRightIcon, SparklesIcon, DocumentTextIcon } from './icons/Icons';

interface OpportunityCardProps {
  opportunity: ArbitrageOpportunity;
}

const InfoRow: React.FC<{ label: string; value: string | number; valueColor?: string }> = ({ label, value, valueColor = 'text-white' }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">{label}</span>
    <span className={`font-semibold ${valueColor}`}>{value}</span>
  </div>
);

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    const result = await analyzeOpportunity(opportunity);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    setDescription(null);
    const result = await generateListingDescription(opportunity);
    setDescription(result);
    setIsGenerating(false);
  };

  const totalCost = opportunity.ebayPrice + opportunity.fees.ebay + opportunity.fees.shipping;

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <img src={opportunity.imageUrl} alt={opportunity.productName} className="w-24 h-24 object-cover rounded-lg" />
          <div className="flex-1">
            <h3 className="font-bold text-white text-md leading-tight">{opportunity.productName}</h3>
            <p className="text-xs text-gray-400 mt-1">Found: {new Date(opportunity.dateFound).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between space-x-2 bg-gray-900 p-3 rounded-lg">
            <div className="text-center">
                <EbayIcon className="h-6 w-6 mx-auto text-gray-400"/>
                <p className="text-lg font-bold text-white">£{opportunity.ebayPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{opportunity.ebaySeller}</p>
            </div>
            <ArrowRightIcon className="h-6 w-6 text-cyan-400 shrink-0"/>
             <div className="text-center">
                <AmazonIcon className="h-6 w-6 mx-auto text-gray-400"/>
                <p className="text-lg font-bold text-white">£{opportunity.amazonPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{opportunity.amazonSeller}</p>
            </div>
        </div>

        <div className="mt-4 space-y-2">
          <InfoRow label="Total Cost" value={`£${totalCost.toFixed(2)}`} />
          <InfoRow label="Est. Net Profit" value={`£${opportunity.potentialProfit.toFixed(2)}`} valueColor="text-green-400" />
          <InfoRow label="Est. ROI" value={`${opportunity.roi.toFixed(2)}%`} valueColor="text-green-400" />
        </div>
      </div>
      
      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
        <div className="flex space-x-2">
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1 justify-center">
                <SparklesIcon className="h-5 w-5 mr-2"/>
                {isAnalyzing ? <Spinner size="sm" /> : 'AI Analysis'}
            </Button>
            <Button onClick={handleGenerateDescription} disabled={isGenerating} className="flex-1 justify-center">
                <DocumentTextIcon className="h-5 w-5 mr-2"/>
                {isGenerating ? <Spinner size="sm" /> : 'Gen Desc'}
            </Button>
        </div>

        {analysis && (
          <div className="mt-4 p-3 bg-gray-900 rounded-lg">
            <h4 className="font-semibold text-cyan-400">AI Risk Analysis</h4>
            <p className="text-sm mt-1"><span className="text-gray-400">Risk Score:</span> {analysis.riskScore}/10</p>
            <p className="text-sm mt-1"><span className="text-gray-400">Summary:</span> {analysis.summary}</p>
             <ul className="text-sm list-disc list-inside mt-2">
              {analysis.potentialIssues.map((issue, index) => <li key={index}>{issue}</li>)}
            </ul>
          </div>
        )}
         {description && (
          <div className="mt-4 p-3 bg-gray-900 rounded-lg">
            <h4 className="font-semibold text-cyan-400">Generated Description</h4>
            <p className="text-sm mt-1 whitespace-pre-wrap">{description}</p>
          </div>
        )}

        <div className="mt-4 flex space-x-2">
            <a href={opportunity.ebayUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="secondary" className="w-full justify-center">View on eBay</Button>
            </a>
            <a href={opportunity.amazonUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="secondary" className="w-full justify-center">View on Amazon</Button>
            </a>
        </div>
      </div>
    </Card>
  );
};

export default OpportunityCard;
   