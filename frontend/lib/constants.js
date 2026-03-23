export const SHIPPING_RATES = {
    'القاهرة': 85, 'الجيزة': 85, 'القليوبية': 85,
    'الإسكندرية': 95, 'الشرقية': 95, 'الغربية': 95, 'الدقهلية': 95,
    'المنوفية': 95, 'البحيرة': 95, 'كفر الشيخ': 95, 'دمياط': 95,
    'الإسماعيلية': 95, 'السويس': 95, 'محافظات أخرى': 110
};

export const CATEGORIES = [
    { value: 'all', label: 'الكل' },
    { value: 'laser', label: 'قص ليزر' },
    { value: 'print', label: 'طباعة' },
    { value: 'gifts', label: 'هدايا' },
    { value: 'wedding', label: 'مناسبات' }
];

export const ORDER_STATUSES = [
    'جديد',
    'تصميم', 
    'إنتاج',
    'جاهز للتسليم'
];

export const SHIPPING_DEADLINE = new Date("2026-03-16T22:30:00+02:00").getTime();

export const WHATSAPP_NUMBER = '201016176778';

export const TOAST_DURATION = 3000;
