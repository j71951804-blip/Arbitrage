import React, { useState, useEffect } from 'react';
import { fetchOpportunities } from '../services/arbitrageService';
import type { ArbitrageOpportunity } from '../types';
import OpportunityCard from './OpportunityCard';
import Spinner from './ui/Spinner';

const Dashboard: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOpportunities();
        setOpportunities(data);
      } catch (err) {
        setError("Failed to load opportunities. Please ensure the backend is running and you have configured the correct API endpoints.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      );
    }

    if (error) {
       return (
        <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
          <h3 className="font-bold">An Error Occurred</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm text-gray-400">Displaying mock data as a fallback.</p>
        </div>
      );
    }
    
    if (opportunities.length === 0) {
        return <div className="text-center text-gray-400">No opportunities found.</div>
    }

    return (
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Opportunities</h1>
      {renderContent()}
      {/* If there was an error, we still might show the fallback mock data */}
      {error && opportunities.length > 0 && (
         <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;