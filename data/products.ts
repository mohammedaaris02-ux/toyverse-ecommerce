export type Product = {
  name: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  originalPrice: string;
  discount: string;
  badge?: string;
  palette: string;
};

export const bestSellers: Product[] = [
  {
    name: 'Creative Building Blocks Set',
    category: 'Educational Toys',
    rating: 4.9,
    reviews: 128,
    price: '₹799',
    originalPrice: '₹999',
    discount: '20% OFF',
    badge: 'Best Seller',
    palette: 'from-[#F2EFFF] to-[#EDF6FF]',
  },
  {
    name: 'Kids Turbo Racing Car',
    category: 'Remote Control',
    rating: 4.8,
    reviews: 96,
    price: '₹1,299',
    originalPrice: '₹1,599',
    discount: '19% OFF',
    palette: 'from-[#EDF6FF] to-[#FFF8E1]',
  },
  {
    name: 'Cuddle Buddy Teddy Bear',
    category: 'Dolls & Plush',
    rating: 4.9,
    reviews: 164,
    price: '₹699',
    originalPrice: '₹899',
    discount: '22% OFF',
    palette: 'from-[#FFF0F6] to-[#F2EFFF]',
  },
  {
    name: 'Smart Learning Activity Board',
    category: 'Educational Toys',
    rating: 4.7,
    reviews: 82,
    price: '₹999',
    originalPrice: '₹1,299',
    discount: '23% OFF',
    badge: 'New',
    palette: 'from-[#ECFDF5] to-[#EDF6FF]',
  },
];

export const newArrivals: Product[] = [
  {
    name: 'Rainbow Stacking Rings',
    category: 'Early Learning',
    rating: 4.8,
    reviews: 54,
    price: '₹549',
    originalPrice: '₹699',
    discount: '21% OFF',
    badge: 'New',
    palette: 'from-[#FFF8E1] to-[#FFF0F6]',
  },
  {
    name: 'Junior Art Studio Kit',
    category: 'Art & Creativity',
    rating: 4.9,
    reviews: 71,
    price: '₹899',
    originalPrice: '₹1,099',
    discount: '18% OFF',
    badge: 'New',
    palette: 'from-[#F2EFFF] to-[#FFF8E1]',
  },
  {
    name: 'Mini Explorer Outdoor Set',
    category: 'Outdoor Toys',
    rating: 4.7,
    reviews: 43,
    price: '₹1,149',
    originalPrice: '₹1,399',
    discount: '18% OFF',
    badge: 'New',
    palette: 'from-[#ECFDF5] to-[#EDF6FF]',
  },
  {
    name: 'Puzzle Safari Learning Box',
    category: 'Educational Toys',
    rating: 4.8,
    reviews: 66,
    price: '₹749',
    originalPrice: '₹949',
    discount: '21% OFF',
    badge: 'New',
    palette: 'from-[#EDF6FF] to-[#F2EFFF]',
  },
];
