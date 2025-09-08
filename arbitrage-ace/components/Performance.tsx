
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MOCK_PERFORMANCE_DATA } from '../constants';
import Card from './ui/Card';

const Performance: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Performance Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-white mb-4">Daily Profit (£)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_PERFORMANCE_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                  <XAxis dataKey="date" stroke="#A0AEC0" />
                  <YAxis stroke="#A0AEC0" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }}
                    labelStyle={{ color: '#E2E8F0' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#4FD1C5" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-white mb-4">Opportunities Found</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_PERFORMANCE_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="date" stroke="#A0AEC0" />
                    <YAxis stroke="#A0AEC0" />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }}
                        labelStyle={{ color: '#E2E8F0' }}
                    />
                    <Legend />
                    <Bar dataKey="opportunities" fill="#63B3ED" />
                    </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Performance;
   