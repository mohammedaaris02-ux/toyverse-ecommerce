import { PolicyPage, type PolicySection } from '@/components/legal/PolicyPage';

export const metadata = { title: 'Terms & Conditions | ToyVerse' };

const sections: PolicySection[] = [
  {
    title: 'Acceptance of Terms',
    paragraphs: [
      'By using the ToyVerse demonstration website, you agree to use it in accordance with these informational terms and applicable laws.',
    ],
  },
  {
    title: 'Website Usage and User Accounts',
    paragraphs: [
      'You are responsible for accurate account information, protecting your credentials, and using customer or administrative features only when authorized.',
    ],
  },
  {
    title: 'Product Information',
    paragraphs: [
      'Names, descriptions, images, ratings, prices, and age guidance are demonstration catalog information and may be corrected as the portfolio project evolves.',
    ],
  },
  {
    title: 'Pricing and Availability',
    paragraphs: [
      'Displayed prices and stock levels support the demo checkout. Cart placement does not reserve inventory; availability is validated again when an order is submitted.',
    ],
  },
  {
    title: 'Cart and Checkout',
    paragraphs: [
      'Cart totals remain estimates until checkout. The server validates active products, database prices, quantities, and available stock before creating an order.',
    ],
  },
  {
    title: 'Demo Orders and Payment',
    paragraphs: [
      'Orders and payments are simulations for development and portfolio demonstration. No live payment gateway is active and no real charge is made.',
    ],
  },
  {
    title: 'Shipping and Delivery',
    paragraphs: [
      'Addresses, assignments, dates, and tracking updates demonstrate an order workflow. They do not represent guaranteed real-world shipment or delivery.',
    ],
  },
  {
    title: 'Order Status and Cancellations',
    paragraphs: [
      'Order and delivery statuses may be updated through demonstration administration tools. Cancellation availability depends on the simulated order state.',
    ],
  },
  {
    title: 'Returns and Refunds',
    paragraphs: [
      'Because this environment has no real charges or fulfillment, it does not provide a production return or refund service. A live store would require separate operational policies.',
    ],
  },
  {
    title: 'Intellectual Property',
    paragraphs: [
      'ToyVerse interface, written content, and project assets may not be presented as another service without appropriate permission, except where third-party rights apply.',
    ],
  },
  {
    title: 'Acceptable Use',
    paragraphs: [
      'Do not attempt unauthorized access, disrupt the website, submit malicious content, misuse accounts, or manipulate catalog, order, or delivery data.',
    ],
  },
  {
    title: 'Demo Disclaimer and Limitations',
    paragraphs: [
      'The website is provided as a demonstration without guarantees of continuous availability or production suitability. Do not rely on it for real purchases, payments, shipping, or legally binding transactions.',
    ],
  },
  {
    title: 'Changes and Contact',
    paragraphs: [
      'These terms may be updated as ToyVerse develops. Questions can be submitted through the Contact page.',
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      subtitle="The terms that apply when using the ToyVerse demonstration storefront."
      sections={sections}
    />
  );
}
