import { PolicyPage, type PolicySection } from '@/components/legal/PolicyPage';

export const metadata = { title: 'Privacy Policy | ToyVerse' };

const sections: PolicySection[] = [
  {
    title: 'Introduction',
    paragraphs: [
      'This policy explains the information used by the ToyVerse demonstration store when you browse, create an account, save products, or place a demo order.',
    ],
  },
  {
    title: 'Information We Collect',
    paragraphs: [
      'The demo may process details you provide, including your name, email, phone number, saved preferences, delivery addresses, cart contents, and order history.',
    ],
  },
  {
    title: 'Account Information',
    paragraphs: [
      'Account identity and sessions are managed through Supabase Authentication. Your email comes from the authenticated account, while available customer details are stored in your profile.',
    ],
  },
  {
    title: 'Order and Delivery Information',
    paragraphs: [
      'A demo order stores product, price, quantity, delivery address, payment state, and tracking information so the order-management experience can function.',
    ],
  },
  {
    title: 'How Information Is Used',
    paragraphs: [
      'Information supports account features, carts, wishlists, demo orders, delivery progress, security, and technical troubleshooting.',
    ],
  },
  {
    title: 'Authentication and Google Sign-In',
    paragraphs: [
      'Email/password and optional Google sign-in are handled by Supabase Authentication. Google may provide basic metadata such as a display name and avatar. Google users are never made administrators automatically.',
    ],
  },
  {
    title: 'Cookies and Browser Technologies',
    paragraphs: [
      'Authentication cookies and browser storage may maintain sessions and preserve interface selections. You can clear locally stored information through your browser settings.',
    ],
  },
  {
    title: 'Payment Information',
    paragraphs: [
      'Checkout currently uses a demo payment simulation. ToyVerse does not collect or store real credit-card or debit-card numbers through this demonstration flow.',
    ],
  },
  {
    title: 'Data Storage and Supabase',
    paragraphs: [
      'The project uses Supabase for authentication, database records, and product image storage. Access is intended to be controlled through authenticated sessions and row-level security policies.',
    ],
  },
  {
    title: 'Security and Data Sharing',
    paragraphs: [
      'Reasonable technical controls are used, but no demonstration environment can guarantee absolute security. Information is not intended to be sold and is shared only with configured infrastructure where needed to run the project.',
    ],
  },
  {
    title: 'User Choices',
    paragraphs: [
      'You may update available profile and address details, remove wishlist or cart items, and sign out to end your current session.',
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      'ToyVerse sells products intended for children, but accounts and orders are intended to be managed by parents, guardians, or other adults. The project is not designed to knowingly collect personal information directly from children.',
    ],
  },
  {
    title: 'Changes and Contact',
    paragraphs: [
      'This policy may change as the demonstration evolves. Questions can be submitted through the ToyVerse Contact page.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      subtitle="How information is handled across the ToyVerse demonstration shopping experience."
      sections={sections}
    />
  );
}
