import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

interface CurrencyConverterProps {
  price: number;
  baseCurrency?: string;
}

interface ExchangeRates {
  [key: string]: number;
}

const currencies = [
  { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
];

// Mock exchange rates (in production, fetch from API)
const exchangeRates: ExchangeRates = {
  PKR: 1,
  USD: 0.0036,
  EUR: 0.0033,
  GBP: 0.0028,
  AED: 0.013,
  SAR: 0.013,
};

export default function CurrencyConverter({ price, baseCurrency = 'PKR' }: CurrencyConverterProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('preferredCurrency') || baseCurrency;
  });
  const [showConverter, setShowConverter] = useState(false);

  useEffect(() => {
    localStorage.setItem('preferredCurrency', selectedCurrency);
  }, [selectedCurrency]);

  const convertedPrice = price * exchangeRates[selectedCurrency];
  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  const formatPrice = (amount: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (!currency) return amount.toFixed(2);

    // Different formatting for different currencies
    switch (currencyCode) {
      case 'PKR':
        return `${currency.symbol} ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
      case 'USD':
        return `${currency.symbol}${amount.toFixed(2)}`;
      case 'EUR':
        return `${currency.symbol}${amount.toFixed(2)}`;
      case 'GBP':
        return `${currency.symbol}${amount.toFixed(2)}`;
      case 'AED':
        return `${amount.toFixed(2)} ${currency.symbol}`;
      case 'SAR':
        return `${amount.toFixed(2)} ${currency.symbol}`;
      default:
        return `${currency.symbol}${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="relative">
      {/* Currency Selector Button */}
      <button
        onClick={() => setShowConverter(!showConverter)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-black transition-colors"
      >
        <Globe size={16} />
        <span className="text-sm font-medium">{selectedCurrency}</span>
      </button>

      {/* Currency Dropdown */}
      {showConverter && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowConverter(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[200px]"
          >
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Select Currency</p>
            </div>
            <div className="p-2">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    setSelectedCurrency(currency.code);
                    setShowConverter(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedCurrency === currency.code ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{currency.symbol}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium">{currency.code}</p>
                      <p className="text-xs text-gray-500">{currency.name}</p>
                    </div>
                  </div>
                  {selectedCurrency === currency.code && (
                    <div className="w-2 h-2 bg-black rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500">
                Converted: {formatPrice(convertedPrice, selectedCurrency)}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

// Helper function to get formatted price
export function useCurrency(price: number, baseCurrency = 'PKR') {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferredCurrency') || baseCurrency;
    }
    return baseCurrency;
  });

  const convertedPrice = price * exchangeRates[selectedCurrency];

  const formatPrice = (amount: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (!currency) return amount.toFixed(2);

    switch (currencyCode) {
      case 'PKR':
        return `${currency.symbol} ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
      case 'USD':
      case 'EUR':
      case 'GBP':
        return `${currency.symbol}${amount.toFixed(2)}`;
      case 'AED':
      case 'SAR':
        return `${amount.toFixed(2)} ${currency.symbol}`;
      default:
        return `${currency.symbol}${amount.toFixed(2)}`;
    }
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    convertedPrice,
    formatPrice: (amount: number) => formatPrice(amount, selectedCurrency),
    originalPrice: formatPrice(price, baseCurrency),
  };
}
