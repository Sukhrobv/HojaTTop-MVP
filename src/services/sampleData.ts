// Sample data for HojaTTop toilets in Tashkent
import { Toilet } from '@/types'

export const sampleToilets: Omit<Toilet, 'id'>[] = [
  {
    name: 'Кафе "Пончик"',
    address: 'ул. Амира Темура, 41',
    latitude: 41.311081,
    longitude: 69.279737,
    rating: 4.5,
    reviewCount: 23,
    features: {
      isAccessible: true,
      hasBabyChanging: true,
      hasAblution: false,
      isFree: false,
    },
    openHours: '08:00 - 22:00',
    photos: [],
    lastUpdated: Date.now()
  },
  {
    name: 'ТЦ "Самарканд Дарваза"',
    address: 'ул. Коратош, 5А',
    latitude: 41.320749,
    longitude: 69.254433,
    rating: 3.8,
    reviewCount: 45,
    features: {
      isAccessible: true,
      hasBabyChanging: false,
      hasAblution: true,
      isFree: true,
    },
    openHours: '09:00 - 21:00',
    photos: [],
    lastUpdated: Date.now()
  },
  {
    name: 'Chorsu Bazaar',
    address: 'Chorsu Metro Station',
    latitude: 41.326936,
    longitude: 69.227734,
    rating: 3.2,
    reviewCount: 67,
    features: {
      isAccessible: false,
      hasBabyChanging: false,
      hasAblution: true,
      isFree: false,
    },
    openHours: '07:00 - 19:00',
    photos: [],
    lastUpdated: Date.now()
  },
  {
    name: 'Tashkent City Mall',
    address: 'ул. Ислама Каримова, 2',
    latitude: 41.295021,
    longitude: 69.268540,
    rating: 4.7,
    reviewCount: 89,
    features: {
      isAccessible: true,
      hasBabyChanging: true,
      hasAblution: false,
      isFree: true,
    },
    openHours: '10:00 - 22:00',
    photos: [],
    lastUpdated: Date.now()
  },
  {
    name: 'АЗС Uzbekneftegaz',
    address: 'ул. Бобура, 45',
    latitude: 41.305764,
    longitude: 69.241852,
    rating: 3.5,
    reviewCount: 12,
    features: {
      isAccessible: true,
      hasBabyChanging: false,
      hasAblution: false,
      isFree: true,
    },
    openHours: '24/7',
    photos: [],
    lastUpdated: Date.now()
  },
  {
    name: 'Парк Алишера Навои',
    address: 'ул. Алмазар',
    latitude: 41.318524,
    longitude: 69.287651,
    rating: 2.9,
    reviewCount: 34,
    features: {
      isAccessible: false,
      hasBabyChanging: false,
      hasAblution: false,
      isFree: true,
    },
    openHours: '06:00 - 23:00',
    photos: [],
    lastUpdated: Date.now()
  },
  {
    name: 'Мечеть Минор',
    address: 'ул. Зарафшан, 12',
    latitude: 41.308547,
    longitude: 69.265891,
    rating: 4.9,
    reviewCount: 156,
    features: {
      isAccessible: true,
      hasBabyChanging: false,
      hasAblution: true,
      isFree: true,
    },
    openHours: '05:00 - 22:00',
    photos: [],
    lastUpdated: Date.now()
  },
  {
    name: 'Ресторан "Плов Центр"',
    address: 'ул. Ифтихор, 1',
    latitude: 41.299874,
    longitude: 69.272541,
    rating: 4.1,
    reviewCount: 78,
    features: {
      isAccessible: true,
      hasBabyChanging: true,
      hasAblution: true,
      isFree: false,
    },
    openHours: '11:00 - 23:00',
    photos: [],
    lastUpdated: Date.now()
  },
  {
    name: 'Hilton Tashkent City',
    address: 'ул. Ислама Каримова, 2A',
    latitude: 41.294521,
    longitude: 69.269147,
    rating: 4.8,
    reviewCount: 92,
    features: {
      isAccessible: true,
      hasBabyChanging: true,
      hasAblution: false,
      isFree: false,
    },
    openHours: '24/7',
    photos: [],
    lastUpdated: Date.now()
  },
  {
    name: 'Mega Planet',
    address: 'ул. Юнусабад, 41',
    latitude: 41.365214,
    longitude: 69.285749,
    rating: 4.3,
    reviewCount: 124,
    features: {
      isAccessible: true,
      hasBabyChanging: true,
      hasAblution: false,
      isFree: true,
    },
    openHours: '10:00 - 22:00',
    photos: [],
    lastUpdated: Date.now()
  }
]

// Sample reviews for testing
export const sampleReviews = [
  {
    toiletId: '', // Will be filled when creating
    userId: 'anonymous1',
    userName: 'Анонимный пользователь',
    rating: 4,
    cleanliness: 4,
    accessibility: 5,
    comment: 'Чисто и удобно. Есть все необходимое.',
    photos: [],
    createdAt: Date.now() - 86400000 // 1 day ago
  },
  {
    toiletId: '',
    userId: 'anonymous2', 
    userName: 'Анонимный пользователь',
    rating: 3,
    cleanliness: 2,
    accessibility: 4,
    comment: 'Немного грязновато, но в целом терпимо.',
    photos: [],
    createdAt: Date.now() - 172800000 // 2 days ago
  }
]