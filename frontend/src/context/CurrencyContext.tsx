import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY';

interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromINR: number; // Conversion multiplier from base INR
}

export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyRate> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1.0 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.012 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.011 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromINR: 0.0094 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rateFromINR: 0.044 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromINR: 1.84 },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInINR: number | null | undefined, showCode?: boolean) => string;
  currentRate: CurrencyRate;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('valorize_currency') as CurrencyCode) || 'INR';
  });

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem('valorize_currency', code);
  };

  const currentRate = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;

  const formatPrice = (amountInINR: number | null | undefined, showCode: boolean = false): string => {
    if (amountInINR === null || amountInINR === undefined || isNaN(amountInINR)) {
      return 'Price on Inquiry';
    }

    const converted = amountInINR * currentRate.rateFromINR;
    let formatted: string;

    if (currency === 'JPY') {
      formatted = Math.round(converted).toLocaleString();
    } else if (converted >= 1000) {
      formatted = converted.toLocaleString(undefined, { maximumFractionDigits: 1 });
    } else {
      formatted = converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (showCode) {
      return `${currentRate.symbol}${formatted} ${currency}`;
    }
    return `${currentRate.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currentRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

