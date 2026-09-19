/**
 * Pakistani Provinces/States
 */
export const pakistaniProvinces = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Kashmir',
  'Islamabad Capital Territory',
];

/**
 * Major Pakistani Cities by Province
 */
export const pakistaniCities: Record<string, string[]> = {
  Punjab: [
    'Lahore',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Bahawalpur',
    'Sargodha',
    'Sheikhupura',
    'Jhang',
    'Rahim Yar Khan',
    'Gujrat',
    'Kasur',
    'Mardan',
    'Dera Ghazi Khan',
    'Sahiwal',
    'Okara',
    'Wah Cantonment',
    'Chiniot',
    'Kamoke',
    'Hafizabad',
    'Mandi Bahauddin',
    'Jhelum',
    'Burewala',
    'Khanewal',
    'Daska',
    'Muridke',
    'Pakpattan',
  ],
  Sindh: [
    'Karachi',
    'Hyderabad',
    'Sukkur',
    'Larkana',
    'Nawabshah',
    'Mirpur Khas',
    'Jacobabad',
    'Shikarpur',
    'Khairpur',
    'Dadu',
    'Thatta',
    'Badin',
    'Tando Allahyar',
    'Jamshoro',
    'Kandhkot',
    'Tando Muhammad Khan',
    'Umerkot',
    'Kashmore',
    'Ghotki',
    'Sehwan Sharif',
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar',
    'Abbottabad',
    'Mardan',
    'Swat',
    'Mingora',
    'Kohat',
    'Bannu',
    'Nowshera',
    'Charsadda',
    'Dera Ismail Khan',
    'Tank',
    'Hangu',
    'Lakki Marwat',
    'Swabi',
    'Haripur',
    'Mansehra',
    'Dir',
    'Chitral',
  ],
  Balochistan: [
    'Quetta',
    'Zhob',
    'Gwadar',
    'Turbat',
    'Chaman',
    'Khuzdar',
    'Lasbela',
    'Sibi',
    'Kalat',
    'Jaffarabad',
    'Nasirabad',
    'Musakhel',
    'Barkhan',
    'Kohlu',
    'Dera Bugti',
  ],
  'Gilgit-Baltistan': [
    'Gilgit',
    'Skardu',
    'Hunza',
    'Nagar',
    'Ghanche',
    'Diamer',
    'Astore',
    'Ghizer',
  ],
  'Azad Kashmir': [
    'Muzaffarabad',
    'Mirpur',
    'Kotli',
    'Rawalakot',
    'Bagh',
    'Poonch',
    'Sudhnati',
    'Haveli',
    'Neelum',
  ],
  'Islamabad Capital Territory': [
    'Islamabad',
  ],
};

/**
 * All cities flattened for dropdown
 */
export const allPakistaniCities = Object.values(pakistaniCities).flat().sort();

/**
 * Validate Pakistani phone number (03XX-XXXXXXX format)
 */
export function validatePakistaniPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s\-]/g, '');
  
  // Pattern: 03 followed by 9 digits (total 11 digits)
  const pattern = /^03[0-9]{9}$/;
  
  return pattern.test(cleaned);
}

/**
 * Format phone number to 03XX-XXXXXXX format
 */
export function formatPakistaniPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('03')) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  
  return phone;
}

/**
 * Get cities for a specific province
 */
export function getCitiesForProvince(province: string): string[] {
  return pakistaniCities[province] || [];
}

/**
 * Validate postal code (Pakistan: 5 digits)
 */
export function validatePakistaniPostalCode(postalCode: string): boolean {
  const pattern = /^[0-9]{5}$/;
  return pattern.test(postalCode);
}
