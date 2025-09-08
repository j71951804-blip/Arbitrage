import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

const Settings: React.FC = () => {
  const [minProfit, setMinProfit] = useState(10);
  const [minRoi, setMinRoi] = useState(25);
  const [keywords, setKeywords] = useState('headphones, lego, pressure cooker');
  const [notifications, setNotifications] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Load settings from local storage on component mount
  useEffect(() => {
    const savedMinProfit = localStorage.getItem('minProfit');
    const savedMinRoi = localStorage.getItem('minRoi');
    const savedKeywords = localStorage.getItem('keywords');
    const savedNotifications = localStorage.getItem('notifications');
    const savedGeminiKey = localStorage.getItem('geminiApiKey');

    if (savedMinProfit) setMinProfit(JSON.parse(savedMinProfit));
    if (savedMinRoi) setMinRoi(JSON.parse(savedMinRoi));
    if (savedKeywords) setKeywords(savedKeywords);
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('minProfit', JSON.stringify(minProfit));
    localStorage.setItem('minRoi', JSON.stringify(minRoi));
    localStorage.setItem('keywords', keywords);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('geminiApiKey', geminiApiKey);
    alert('Settings saved!');
  };

  const InputField: React.FC<{ label: string; type: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; }> = ({ label, type, value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
      />
    </div>
  );
  
  const Toggle: React.FC<{label: string, enabled: boolean, setEnabled: (enabled: boolean) => void}> = ({label, enabled, setEnabled}) => (
     <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`${enabled ? 'bg-cyan-500' : 'bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500`}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}/>
        </button>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-6">
          
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-white">API Keys</h3>
            <p className="text-sm text-gray-400">Your keys are stored securely in your browser's local storage.</p>
             <div className="mt-4 space-y-4">
                 <InputField 
                    label="Gemini API Key" 
                    type="password" 
                    value={geminiApiKey} 
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter your Google Gemini API key"
                />
                {/* Placeholder for other keys */}
                 <InputField 
                    label="eBay API Key (coming soon)" 
                    type="password" 
                    value="" 
                    onChange={() => {}}
                    placeholder="Future integration"
                />
                 <InputField 
                    label="Amazon API Key (coming soon)" 
                    type="password" 
                    value="" 
                    onChange={() => {}}
                    placeholder="Future integration"
                />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">Profitability Thresholds</h3>
            <p className="text-sm text-gray-400">Set the minimum profit and ROI to filter opportunities.</p>
          </div>
          <InputField label="Minimum Profit (£)" type="number" value={minProfit} onChange={(e) => setMinProfit(Number(e.target.value))} />
          <InputField label="Minimum ROI (%)" type="number" value={minRoi} onChange={(e) => setMinRoi(Number(e.target.value))} />
          
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white">Scanning</h3>
            <p className="text-sm text-gray-400">Define keywords to search for. Separate with commas.</p>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300">Search Keywords</label>
            <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                rows={3}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            />
            </div>
          
           <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <p className="text-sm text-gray-400">Enable or disable alerts for high-value deals.</p>
          </div>
          <Toggle label="Email/Telegram Alerts" enabled={notifications} setEnabled={setNotifications} />
          
          <div className="flex justify-end pt-4">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Settings;