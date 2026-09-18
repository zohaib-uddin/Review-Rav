import { useState } from 'react';
import { Globe, Check } from 'lucide-react';

type Language = 'en' | 'ur' | 'ar';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('language', lang);
    
    // Update document direction for RTL languages
    const langOption = languages.find(l => l.code === lang);
    if (langOption) {
      document.documentElement.dir = langOption.dir;
      document.documentElement.lang = lang;
    }
    
    setIsOpen(false);
    
    // In production, this would trigger i18next language change
    // i18next.changeLanguage(lang);
    
    // Reload page to apply translations
    window.location.reload();
  };

  const currentLanguage = languages.find(l => l.code === currentLang);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-black transition-colors"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{currentLanguage?.flag} {currentLanguage?.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[200px]">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Select Language</p>
            </div>
            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    currentLang === lang.code ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium">{lang.name}</p>
                      <p className="text-xs text-gray-500">{lang.code.toUpperCase()}</p>
                    </div>
                  </div>
                  {currentLang === lang.code && (
                    <Check size={16} className="text-green-600" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500 text-center">
                {currentLanguage?.dir === 'rtl' ? 'Right-to-Left' : 'Left-to-Right'} Layout
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Translation helper function
export function t(key: string, lang?: Language): string {
  const currentLang = lang || (localStorage.getItem('language') as Language) || 'en';
  
  const translations: Record<Language, Record<string, string>> = {
    en: {
      'home': 'Home',
      'shop': 'Shop',
      'about': 'About',
      'contact': 'Contact',
      'cart': 'Cart',
      'wishlist': 'Wishlist',
      'login': 'Login',
      'register': 'Register',
      'search': 'Search',
      'add_to_cart': 'Add to Cart',
      'buy_now': 'Buy Now',
      'out_of_stock': 'Out of Stock',
      'in_stock': 'In Stock',
      'low_stock': 'Low Stock',
      'free_shipping': 'Free Shipping',
      'secure_payment': 'Secure Payment',
      'easy_returns': 'Easy Returns',
    },
    ur: {
      'home': 'ہوم',
      'shop': 'شاپ',
      'about': 'ہمارے بارے میں',
      'contact': 'رابطہ',
      'cart': 'کارٹ',
      'wishlist': 'خواہش',
      'login': 'لاگ ان',
      'register': 'رجسٹر',
      'search': 'تلاش',
      'add_to_cart': 'کارٹ میں شامل کریں',
      'buy_now': 'ابھی خریدیں',
      'out_of_stock': 'سٹاک ختم',
      'in_stock': 'دستیاب',
      'low_stock': 'کم سٹاک',
      'free_shipping': 'مفت شپنگ',
      'secure_payment': 'محفوظ ادائیگی',
      'easy_returns': 'آسان واپسی',
    },
    ar: {
      'home': 'الرئيسية',
      'shop': 'المتجر',
      'about': 'من نحن',
      'contact': 'اتصل بنا',
      'cart': 'السلة',
      'wishlist': 'المفضلة',
      'login': 'تسجيل الدخول',
      'register': 'التسجيل',
      'search': 'بحث',
      'add_to_cart': 'أضف إلى السلة',
      'buy_now': 'اشتري الآن',
      'out_of_stock': 'نفذ من المخزون',
      'in_stock': 'متوفر',
      'low_stock': 'مخزون منخفض',
      'free_shipping': 'شحن مجاني',
      'secure_payment': 'دفع آمن',
      'easy_returns': 'إرجاع سهل',
    },
  };

  return translations[currentLang]?.[key] || key;
}

// Hook for using translations in components
export function useTranslation() {
  const lang = (localStorage.getItem('language') as Language) || 'en';
  
  return {
    t: (key: string) => t(key, lang),
    lang,
    dir: languages.find(l => l.code === lang)?.dir || 'ltr',
  };
}
