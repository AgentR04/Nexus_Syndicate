import React, { useState } from 'react';

// Mock market data
const mockAssets = [
  { id: 1, name: 'Credits', symbol: 'CRD', price: 1.00, change: 0.00, volume: 1250000 },
  { id: 2, name: 'Data Shards', symbol: 'DSRD', price: 12.75, change: 1.25, volume: 85000 },
  { id: 3, name: 'Synthetic Alloys', symbol: 'SYNTH', price: 45.30, change: -2.10, volume: 12000 },
  { id: 4, name: 'Quantum Cores', symbol: 'QCORE', price: 320.50, change: 15.75, volume: 3000 },
  { id: 5, name: 'Neural Implants', symbol: 'NIMP', price: 78.25, change: 3.50, volume: 7500 },
  { id: 6, name: 'Cyber Enhancements', symbol: 'CENH', price: 156.00, change: -5.25, volume: 4200 },
];

// Mock arbitrage opportunities
const mockArbitrage = [
  { id: 1, asset: 'Data Shards', buyLocation: 'Neon District', sellLocation: 'Tech Haven', profitMargin: 8.5 },
  { id: 2, asset: 'Synthetic Alloys', buyLocation: 'Digital Wastes', sellLocation: 'Quantum Fields', profitMargin: 12.3 },
  { id: 3, asset: 'Neural Implants', buyLocation: 'Shadow Market', sellLocation: 'Cyber Nexus', profitMargin: 15.7 },
];

const MarketHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prices' | 'trade' | 'arbitrage'>('prices');
  const [selectedAsset, setSelectedAsset] = useState<number | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState<string>('');

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  const formatChange = (change: number): string => {
    return change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the trade to the backend
    alert(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${tradeAmount} of asset ID ${selectedAsset}`);
    setTradeAmount('');
  };

  return (
    <div className="cyber-panel p-4 h-full">
      <h2 className="text-xl font-cyber text-neon-blue mb-4">MARKET HUB</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-neon-blue mb-4">
        <button
          className={`px-3 py-2 font-cyber text-xs ${activeTab === 'prices' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('prices')}
        >
          LIVE PRICES
        </button>
        <button
          className={`px-3 py-2 font-cyber text-xs ${activeTab === 'trade' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('trade')}
        >
          TRADE
        </button>
        <button
          className={`px-3 py-2 font-cyber text-xs ${activeTab === 'arbitrage' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('arbitrage')}
        >
          ARBITRAGE
        </button>
      </div>
      
      {/* Live Asset Prices */}
      {activeTab === 'prices' && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {mockAssets.map((asset) => (
            <div 
              key={asset.id}
              className="bg-dark-gray p-3 rounded flex justify-between items-center hover:bg-medium-gray transition-colors cursor-pointer"
              onClick={() => {
                setSelectedAsset(asset.id);
                setActiveTab('trade');
              }}
            >
              <div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${asset.change >= 0 ? 'bg-neon-green' : 'bg-neon-pink'} mr-2`}></div>
                  <h4 className="font-cyber text-neon-blue">{asset.name}</h4>
                </div>
                <div className="text-xs text-light-gray mt-1">{asset.symbol}</div>
              </div>
              <div className="text-right">
                <div className="font-mono">{formatPrice(asset.price)}</div>
                <div className={`text-xs ${asset.change >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                  {formatChange(asset.change)}
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-dark-blue rounded">
            <h3 className="text-sm font-cyber text-neon-purple mb-2">MARKET VOLUME</h3>
            <div className="space-y-2">
              {mockAssets.map((asset) => (
                <div key={asset.id} className="flex justify-between items-center">
                  <span className="text-xs">{asset.symbol}</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-dark-gray rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${asset.change >= 0 ? 'bg-neon-green' : 'bg-neon-pink'}`} 
                        style={{ width: `${(asset.volume / 1250000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-mono">{formatVolume(asset.volume)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Trade Interface */}
      {activeTab === 'trade' && (
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-cyber text-neon-purple mb-2">SELECT ASSET</h3>
            <div className="grid grid-cols-2 gap-2">
              {mockAssets.map((asset) => (
                <div 
                  key={asset.id}
                  className={`p-2 rounded text-center cursor-pointer transition-colors ${
                    selectedAsset === asset.id 
                      ? 'bg-neon-blue bg-opacity-20 border border-neon-blue' 
                      : 'bg-dark-gray hover:bg-medium-gray'
                  }`}
                  onClick={() => setSelectedAsset(asset.id)}
                >
                  <div className="text-xs font-cyber">{asset.symbol}</div>
                  <div className="text-xs">{formatPrice(asset.price)}</div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedAsset && (
            <form onSubmit={handleTradeSubmit}>
              <div className="mb-4">
                <h3 className="text-sm font-cyber text-neon-purple mb-2">TRADE TYPE</h3>
                <div className="flex">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-center text-sm ${
                      tradeType === 'buy' 
                        ? 'bg-neon-green bg-opacity-20 border border-neon-green text-neon-green' 
                        : 'bg-dark-gray text-light-gray'
                    }`}
                    onClick={() => setTradeType('buy')}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-center text-sm ${
                      tradeType === 'sell' 
                        ? 'bg-neon-pink bg-opacity-20 border border-neon-pink text-neon-pink' 
                        : 'bg-dark-gray text-light-gray'
                    }`}
                    onClick={() => setTradeType('sell')}
                  >
                    SELL
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-cyber text-neon-purple mb-2">AMOUNT</h3>
                <div className="relative">
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="w-full bg-dark-blue border border-neon-blue p-2 rounded text-light-gray focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    required
                  />
                  <div className="absolute right-2 top-2 text-xs text-light-gray">
                    {mockAssets.find(a => a.id === selectedAsset)?.symbol}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-cyber text-neon-purple mb-2">TRADE PREVIEW</h3>
                <div className="bg-dark-gray p-3 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs">Asset</span>
                    <span className="text-xs font-cyber">
                      {mockAssets.find(a => a.id === selectedAsset)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs">Price</span>
                    <span className="text-xs font-mono">
                      {formatPrice(mockAssets.find(a => a.id === selectedAsset)?.price || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs">Amount</span>
                    <span className="text-xs font-mono">
                      {tradeAmount || '0'}
                    </span>
                  </div>
                  <div className="border-t border-neon-blue my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-xs">Total</span>
                    <span className="text-xs font-mono">
                      {formatPrice((mockAssets.find(a => a.id === selectedAsset)?.price || 0) * (parseFloat(tradeAmount) || 0))}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className={`w-full py-2 font-cyber ${
                  tradeType === 'buy' 
                    ? 'bg-neon-green bg-opacity-20 border border-neon-green text-neon-green hover:bg-opacity-30' 
                    : 'bg-neon-pink bg-opacity-20 border border-neon-pink text-neon-pink hover:bg-opacity-30'
                } transition-colors`}
              >
                {tradeType === 'buy' ? 'CONFIRM BUY' : 'CONFIRM SELL'}
              </button>
            </form>
          )}
          
          {!selectedAsset && (
            <div className="text-center p-4">
              <p className="text-light-gray">Select an asset to trade</p>
            </div>
          )}
        </div>
      )}
      
      {/* Arbitrage Opportunities */}
      {activeTab === 'arbitrage' && (
        <div>
          <h3 className="text-sm font-cyber text-neon-purple mb-3">ARBITRAGE OPPORTUNITIES</h3>
          
          <div className="space-y-3">
            {mockArbitrage.map((opportunity) => (
              <div key={opportunity.id} className="bg-dark-gray p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-cyber text-neon-blue">{opportunity.asset}</h4>
                    <div className="text-xs text-light-gray mt-1">
                      Buy: {opportunity.buyLocation} | Sell: {opportunity.sellLocation}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-neon-green font-mono">+{opportunity.profitMargin.toFixed(1)}%</div>
                    <button className="text-xs text-neon-blue hover:text-neon-purple transition-colors mt-1">
                      Execute Trade
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-cyber text-neon-purple mb-2">MARKET INSIGHTS</h3>
            <div className="bg-dark-blue p-3 rounded">
              <div className="text-xs text-light-gray space-y-2">
                <p>• Data Shards prices rising in Tech Haven due to increased demand</p>
                <p>• Quantum Cores showing volatility across all territories</p>
                <p>• Neural Implants market stabilizing after recent fluctuations</p>
                <p>• Shadow Market offering best prices for rare resources</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 py-2 bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30 transition-colors font-cyber">
            DEPLOY TRADING AI
          </button>
        </div>
      )}
    </div>
  );
};

export default MarketHub;
