import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth/AuthContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [settings, setSettings] = useState({
    minProfit: 10,
    minRoi: 25,
    keywords: [] as string[],
    notifications: true
  });
  const [apiKeys, setApiKeys] = useState({
    ebay: {
      appId: '',
      certId: '',
      devId: ''
    },
    amazon: {
      accessKey: '',
      secretKey: '',
      associateTag: ''
    }
  });
  const [keywordsText, setKeywordsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
      setKeywordsText(user.settings.keywords?.join(', ') || 'electronics, books, toys');
    }
    
    // Load Gemini API key from localStorage
    const savedGeminiKey = localStorage.getItem('geminiApiKey');
    if (savedGeminiKey) {
      setGeminiApiKey(savedGeminiKey);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const updatedSettings = {
        ...settings,
        keywords: keywordsText.split(',').map(k => k.trim()).filter(k => k)
      };

      // Save to localStorage for now (will be API call later)
      localStorage.setItem('minProfit', JSON.stringify(updatedSettings.minProfit));
      localStorage.setItem('minRoi', JSON.stringify(updatedSettings.minRoi));
      localStorage.setItem('keywords', updatedSettings.keywords.join(', '));
      localStorage.setItem('notifications', JSON.stringify(updatedSettings.notifications));
      
      updateUser({ settings: updatedSettings });
      setMessage('Settings saved successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKeys = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Save Gemini API key to localStorage
      localStorage.setItem('geminiApiKey', geminiApiKey);
      
      // For now, just save to localStorage (will be API call later)
      setMessage('API keys saved successfully!');
      
      // Update user status
      updateUser({ 
        hasEbayKeys: !!(apiKeys.ebay.appId && apiKeys.ebay.certId && apiKeys.ebay.devId),
        hasAmazonKeys: !!(apiKeys.amazon.accessKey && apiKeys.amazon.secretKey && apiKeys.amazon.associateTag)
      });
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField: React.FC<{ 
    label: string; 
    type: string; 
    value: string | number; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    placeholder?: string; 
  }> = ({ label, type, value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
      />
    </div>
  );
  
  const Toggle: React.FC<{
    label: string; 
    enabled: boolean; 
    setEnabled: (enabled: boolean) => void;
  }> = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`${enabled ? 'bg-cyan-500' : 'bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500`}
      >
        <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`} />
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <Button onClick={logout} variant="secondary">
          Logout
        </Button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-900/50 border border-red-500 text-red-200' : 'bg-green-900/50 border border-green-500 text-green-200'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys Configuration */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3>
            <p className="text-sm text-gray-400 mb-6">
              Configure your API credentials. Currently working: Gemini AI only.
            </p>

            {/* Gemini API Key */}
            <div className="mb-6">
              <h4 className="font-medium text-cyan-400 mb-3">
                Gemini API Key {geminiApiKey && <span className="text-green-400">✓</span>}
              </h4>
              <InputField
                label="Gemini API Key"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Google Gemini API key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your free API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a>
              </p>
            </div>

            {/* eBay API Keys (Future) */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-500 mb-3">
                eBay API Keys (Coming Soon) {user?.hasEbayKeys && <span className="text-green-400">✓</span>}
              </h4>
              <div className="space-y-3">
                <InputField
                  label="App ID"
                  type="text"
                  value={apiKeys.ebay.appId}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    ebay: { ...prev.ebay, appId: e.target.value }
                  }))}
                  placeholder="Your eBay App ID (future feature)"
                />
                <InputField
                  label="Cert ID"
                  type="password"
                  value={apiKeys.ebay.certId}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    ebay: { ...prev.ebay, certId: e.target.value }
                  }))}
                  placeholder="Your eBay Cert ID (future feature)"
                />
                <InputField
                  label="Dev ID"
                  type="text"
                  value={apiKeys.ebay.devId}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    ebay: { ...prev.ebay, devId: e.target.value }
                  }))}
                  placeholder="Your eBay Dev ID (future feature)"
                />
              </div>
            </div>

            {/* Amazon API Keys (Future) */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-500 mb-3">
                Amazon API Keys (Coming Soon) {user?.hasAmazonKeys && <span className="text-green-400">✓</span>}
              </h4>
              <div className="space-y-3">
                <InputField
                  label="Access Key"
                  type="text"
                  value={apiKeys.amazon.accessKey}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    amazon: { ...prev.amazon, accessKey: e.target.value }
                  }))}
                  placeholder="Amazon Access Key (future feature)"
                />
                <InputField
                  label="Secret Key"
                  type="password"
                  value={apiKeys.amazon.secretKey}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    amazon: { ...prev.amazon, secretKey: e.target.value }
                  }))}
                  placeholder="Amazon Secret Key (future feature)"
                />
                <InputField
                  label="Associate Tag"
                  type="text"
                  value={apiKeys.amazon.associateTag}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    amazon: { ...prev.amazon, associateTag: e.target.value }
                  }))}
                  placeholder="Amazon Associate Tag (future feature)"
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveApiKeys} 
              disabled={isLoading}
              className="w-full justify-center"
            >
              {isLoading ? <Spinner size="sm" /> : 'Save API Keys'}
            </Button>
          </div>
        </Card>

        {/* App Settings */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Application Settings</h3>
            
            <div className="space-y-6">
              {/* Profitability Thresholds */}
              <div>
                <h4 className="font-medium text-cyan-400 mb-3">Profitability Thresholds</h4>
                <div className="space-y-3">
                  <InputField
                    label="Minimum Profit (£)"
                    type="number"
                    value={settings.minProfit}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      minProfit: Number(e.target.value)
                    }))}
                  />
                  <InputField
                    label="Minimum ROI (%)"
                    type="number"
                    value={settings.minRoi}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      minRoi: Number(e.target.value)
                    }))}
                  />
                </div>
              </div>

              {/* Search Keywords */}
              <div>
                <h4 className="font-medium text-cyan-400 mb-3">Search Keywords</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Keywords (comma-separated)
                  </label>
                  <textarea
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="electronics, books, toys, headphones"
                  />
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h4 className="font-medium text-cyan-400 mb-3">Notifications</h4>
                <Toggle
                  label="Enable Notifications"
                  enabled={settings.notifications}
                  setEnabled={(enabled) => setSettings(prev => ({
                    ...prev,
                    notifications: enabled
                  }))}
                />
              </div>

              <Button 
                onClick={handleSaveSettings} 
                disabled={isLoading}
                className="w-full justify-center"
              >
                {isLoading ? <Spinner size="sm" /> : 'Save Settings'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Status */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Current Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-cyan-400">Frontend</h4>
              <p className="text-green-400">✓ Working with mock data</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-cyan-400">AI Features</h4>
              <p className={geminiApiKey ? "text-green-400" : "text-yellow-400"}>
                {geminiApiKey ? "✓ Gemini API configured" : "⚠ Add Gemini API key"}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-cyan-400">Real Data</h4>
              <p className="text-yellow-400">⚠ Backend in development</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
