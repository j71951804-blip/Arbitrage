// Updated App.tsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Performance from './components/Performance';
import Settings from './components/Settings';
import Spinner from './components/ui/Spinner';
import type { View } from './types';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'performance':
        return <Performance />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

// Updated Settings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth/AuthContext';
import { apiService } from '../services/apiService';
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

  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
      setKeywordsText(user.settings.keywords?.join(', ') || '');
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

      await apiService.updateSettings(updatedSettings);
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
      await apiService.updateApiKeys(apiKeys);
      setMessage('API keys saved successfully!');
      
      // Update user status
      const profile = await apiService.getProfile();
      updateUser(profile);
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
              Configure your eBay and Amazon API credentials to enable real-time data fetching.
            </p>

            {/* eBay API Keys */}
            <div className="mb-6">
              <h4 className="font-medium text-cyan-400 mb-3">
                eBay API Keys {user?.hasEbayKeys && <span className="text-green-400">✓</span>}
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
                  placeholder="Your eBay App ID"
                />
                <InputField
                  label="Cert ID"
                  type="password"
                  value={apiKeys.ebay.certId}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    ebay: { ...prev.ebay, certId: e.target.value }
                  }))}
                  placeholder="Your eBay Cert ID"
                />
                <InputField
                  label="Dev ID"
                  type="text"
                  value={apiKeys.ebay.devId}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    ebay: { ...prev.ebay, devId: e.target.value }
                  }))}
                  placeholder="Your eBay Dev ID"
                />
              </div>
            </div>

            {/* Amazon API Keys */}
            <div className="mb-6">
              <h4 className="font-medium text-cyan-400 mb-3">
                Amazon API Keys {user?.hasAmazonKeys && <span className="text-green-400">✓</span>}
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
                  placeholder="Your Amazon Access Key"
                />
                <InputField
                  label="Secret Key"
                  type="password"
                  value={apiKeys.amazon.secretKey}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    amazon: { ...prev.amazon, secretKey: e.target.value }
                  }))}
                  placeholder="Your Amazon Secret Key"
                />
                <InputField
                  label="Associate Tag"
                  type="text"
                  value={apiKeys.amazon.associateTag}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    amazon: { ...prev.amazon, associateTag: e.target.value }
                  }))}
                  placeholder="Your Amazon Associate Tag"
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

      {/* API Setup Instructions */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">API Setup Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-cyan-400 mb-2">eBay Developer Account</h4>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Visit <a href="https://developer.ebay.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">developer.ebay.com</a></li>
                <li>Create a developer account</li>
                <li>Create a new application</li>
                <li>Copy your App ID, Cert ID, and Dev ID</li>
                <li>Enable the "Browse API" for your application</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-cyan-400 mb-2">Amazon Product Advertising API</h4>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Join <a href="https://affiliate-program.amazon.co.uk" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Amazon Associates</a></li>
                <li>Apply for Product Advertising API access</li>
                <li>Get approved (requires active associate account)</li>
                <li>Generate your Access Key and Secret Key</li>
                <li>Note your Associate Tag (tracking ID)</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
