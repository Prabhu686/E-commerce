const amazonPaapi = require('amazon-paapi');

const commonParams = () => ({
  AccessKey: process.env.AMAZON_ACCESS_KEY,
  SecretKey: process.env.AMAZON_SECRET_KEY,
  PartnerTag: process.env.AMAZON_PARTNER_TAG,
  PartnerType: 'Associates',
  Marketplace: 'www.amazon.in',
});

const isConfigured = () =>
  process.env.AMAZON_ACCESS_KEY &&
  process.env.AMAZON_ACCESS_KEY !== '<your_amazon_access_key>';

const searchItems = async (keyword, category = null, page = 1) => {
  if (!isConfigured()) return mockSearch(keyword);
  const params = {
    ...commonParams(),
    Keywords: keyword,
    SearchIndex: categoryToIndex(category),
    ItemPage: page,
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'CustomerReviews.StarRating',
      'CustomerReviews.Count',
    ],
  };
  try {
    const data = await amazonPaapi.SearchItems(params);
    return formatItems(data?.SearchResult?.Items || []);
  } catch (err) {
    console.error('Amazon SearchItems error:', err.message);
    return mockSearch(keyword);
  }
};

const getItem = async (asin) => {
  if (!isConfigured()) return null;
  const params = {
    ...commonParams(),
    ItemIds: [asin],
    Resources: [
      'Images.Primary.Large',
      'Images.Variants.Large',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'Offers.Listings.Availability.Message',
      'CustomerReviews.StarRating',
      'CustomerReviews.Count',
    ],
  };
  try {
    const data = await amazonPaapi.GetItems(params);
    const items = formatItems(data?.ItemsResult?.Items || []);
    return items[0] || null;
  } catch (err) {
    console.error('Amazon GetItems error:', err.message);
    return null;
  }
};

const getVariations = async (asin) => {
  if (!isConfigured()) return [];
  const params = {
    ...commonParams(),
    ASIN: asin,
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'Offers.Listings.Price',
    ],
  };
  try {
    const data = await amazonPaapi.GetVariations(params);
    return formatItems(data?.VariationsResult?.Items || []);
  } catch (err) {
    console.error('Amazon GetVariations error:', err.message);
    return [];
  }
};

const formatItems = (items) =>
  items.map((item) => ({
    asin: item.ASIN,
    name: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
    description: item.ItemInfo?.Features?.DisplayValues?.join(' ') || '',
    price: item.Offers?.Listings?.[0]?.Price?.Amount || null,
    originalPrice: item.Offers?.Listings?.[0]?.SavingBasis?.Amount || null,
    currency: 'INR',
    image: item.Images?.Primary?.Large?.URL || '',
    images: [
      item.Images?.Primary?.Large?.URL,
      ...(item.Images?.Variants?.map((v) => v.Large?.URL) || []),
    ].filter(Boolean),
    rating: item.CustomerReviews?.StarRating?.Value || 0,
    numReviews: item.CustomerReviews?.Count || 0,
    amazonUrl: item.DetailPageURL,
    availability: item.Offers?.Listings?.[0]?.Availability?.Message || 'Check on Amazon',
    source: 'amazon',
  }));

const categoryToIndex = (cat) => {
  const map = {
    electronics: 'Electronics',
    fashion: 'Fashion',
    sports: 'SportingGoods',
    home: 'HomeAndKitchen',
    beauty: 'Beauty',
    books: 'Books',
  };
  return map[cat] || 'All';
};

const mockSearch = (keyword) => [
  {
    asin: 'B09W9FND7K',
    name: `boAt Airdopes 141 TWS Earbuds — ${keyword}`,
    description: 'True Wireless with 42H playtime, ENx Tech, BEAST Mode, IPX4 water resistance.',
    price: 1299, originalPrice: 2990, currency: 'INR',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'],
    rating: 4.1, numReviews: 312456,
    amazonUrl: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`,
    availability: 'In Stock', source: 'amazon',
  },
  {
    asin: 'B0BDJH3XBN',
    name: `Samsung Galaxy M34 5G — ${keyword}`,
    description: '6000mAh battery, 120Hz Super AMOLED display, 50MP triple camera.',
    price: 17999, originalPrice: 22999, currency: 'INR',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'],
    rating: 4.3, numReviews: 89234,
    amazonUrl: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`,
    availability: 'In Stock', source: 'amazon',
  },
  {
    asin: 'B08CF3B7N1',
    name: `Prestige Iris 750W Mixer Grinder — ${keyword}`,
    description: '3 stainless steel jars, 3 speed control with incher, ISI certified.',
    price: 2295, originalPrice: 3995, currency: 'INR',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=400'],
    rating: 4.2, numReviews: 45678,
    amazonUrl: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`,
    availability: 'In Stock', source: 'amazon',
  },
  {
    asin: 'B07DJGX5JK',
    name: `Wildcraft Unisex Laptop Backpack — ${keyword}`,
    description: '30L capacity, water resistant, padded laptop compartment up to 17 inch.',
    price: 1299, originalPrice: 2499, currency: 'INR',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
    rating: 4.0, numReviews: 23456,
    amazonUrl: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`,
    availability: 'In Stock', source: 'amazon',
  },
];

module.exports = { searchItems, getItem, getVariations, isConfigured };
