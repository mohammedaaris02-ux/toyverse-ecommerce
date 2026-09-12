'use client';

import { useRef, useState, type SubmitEvent } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  HeartHandshake,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import {
  AnnouncementBar,
  fadeUp,
  Footer,
  Header,
} from '@/components/toyverse/shared';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const subjects = [
  'Product Question',
  'Order Support',
  'Delivery Query',
  'Return / Refund',
  'Payment Issue',
  'General Enquiry',
];
const initial = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  order: '',
  message: '',
  consent: false,
};
type FormValues = typeof initial;
type Errors = Partial<Record<keyof FormValues, string>>;
const input =
  'mt-2 h-12 w-full rounded-xl border border-[#D9E2F0] bg-white px-4 text-base text-[#101828] outline-none transition focus:border-[#6D4AFF] focus:ring-3 focus:ring-[#6D4AFF]/20 aria-invalid:border-[#D92D20]';
const wrap = 'mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8';
const topics = [
  { label: 'Product Information', subject: 'Product Question', icon: Package },
  { label: 'Order Tracking', subject: 'Order Support', icon: HelpCircle },
  { label: 'Shipping & Delivery', subject: 'Delivery Query', icon: Truck },
  { label: 'Returns & Refunds', subject: 'Return / Refund', icon: RotateCcw },
  { label: 'Payment Questions', subject: 'Payment Issue', icon: CreditCard },
  { label: 'General Support', subject: 'General Enquiry', icon: MessageCircle },
];
const faqs = [
  [
    'How long does delivery usually take?',
    'Demo delivery timelines are typically shown as 3–7 business days depending on the delivery location.',
  ],
  [
    'Can I return a product?',
    "Eligible products can follow the store's return policy. Final return rules will be connected later.",
  ],
  [
    'How can I track my order?',
    'Order tracking will be available through the customer account once order management is connected.',
  ],
  [
    'What payment methods will be supported?',
    'ToyVerse currently uses a development demo checkout. No real payment is charged.',
  ],
  [
    'How do I choose the right toy by age?',
    'Use the Categories and age filters to discover products matched to different age groups.',
  ],
];

export function ContactPage() {
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSuccess(false);
  }
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};
    if (!values.name.trim()) next.name = 'Please enter your full name.';
    if (!values.email.trim()) next.email = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = 'Please enter a valid email address.';
    if (!subjects.includes(values.subject))
      next.subject = 'Please choose a subject.';
    if (!values.message.trim()) next.message = 'Please enter a message.';
    if (!values.consent)
      next.consent = 'Please confirm your agreement before continuing.';
    setErrors(next);
    if (Object.keys(next).length) {
      setSuccess(false);
      const first = Object.keys(next)[0];
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSuccess(true);
  }
  function error(key: keyof FormValues) {
    return errors[key] ? (
      <p id={`${key}-error`} className="mt-2 text-sm text-[#B42318]">
        {errors[key]}
      </p>
    ) : null;
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-[#101828]">
        <AnnouncementBar />
        <Header />
        <section className="bg-[#F2EFFF]">
          <motion.div {...fadeUp} className={wrap}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#6D4AFF]">
              <HeartHandshake className="size-4" />
              We&apos;re Here To Help
            </span>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
              Need Help? Let&apos;s Make It Easy.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#667085]">
              Questions about products, orders, delivery or returns? Send us a
              message and our support team will help you.
            </p>
            <p className="mt-5 text-sm font-semibold text-[#5B3DF5]">
              Friendly support · Clear answers · Fast response
            </p>
          </motion.div>
        </section>
        <section
          className={`${wrap} grid items-start gap-8 lg:grid-cols-[3fr_2fr]`}
        >
          <motion.form
            {...fadeUp}
            ref={form}
            id="contact-form"
            noValidate
            onSubmit={submit}
            className="min-w-0 scroll-mt-28 rounded-2xl border border-[#E6EAF2] bg-white p-5 shadow-sm sm:p-8"
          >
            <h2 className="text-2xl font-extrabold">Send Us A Message</h2>
            <p className="mt-3 leading-7 text-[#667085]">
              Fill in the form below and we&apos;ll get back to you as soon as
              possible.
            </p>
            <p className="mt-3 rounded-lg bg-[#EDF6FF] px-3 py-2 text-sm leading-6 text-[#475467]">
              Demo form only. Messages are not sent or stored. Please use sample
              information.
            </p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {(
                [
                  {
                    key: 'name',
                    label: 'Full Name',
                    type: 'text',
                    autoComplete: 'name',
                    required: true,
                  },
                  {
                    key: 'email',
                    label: 'Email Address',
                    type: 'email',
                    autoComplete: 'email',
                    required: true,
                  },
                  {
                    key: 'phone',
                    label: 'Phone Number (Optional)',
                    type: 'tel',
                    autoComplete: 'tel',
                    required: false,
                  },
                ] as const
              ).map(({ key, label, type, autoComplete, required }) => (
                <div key={key}>
                  <label
                    htmlFor={`contact-${key}`}
                    className="text-sm font-bold"
                  >
                    {label}
                  </label>
                  <input
                    id={`contact-${key}`}
                    name={key}
                    type={type}
                    autoComplete={autoComplete}
                    required={required}
                    value={values[key]}
                    onChange={(event) => update(key, event.target.value)}
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `${key}-error` : undefined}
                    className={input}
                  />
                  {error(key)}
                </div>
              ))}
              <div>
                <label htmlFor="contact-subject" className="text-sm font-bold">
                  Subject
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  required
                  value={values.subject}
                  onChange={(event) => update('subject', event.target.value)}
                  aria-invalid={!!errors.subject}
                  aria-describedby={
                    errors.subject ? 'subject-error' : undefined
                  }
                  className={input}
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject}>{subject}</option>
                  ))}
                </select>
                {error('subject')}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="contact-order" className="text-sm font-bold">
                  Order Number (Optional)
                </label>
                <input
                  id="contact-order"
                  name="order"
                  value={values.order}
                  onChange={(event) => update('order', event.target.value)}
                  className={input}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="contact-message" className="text-sm font-bold">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={6}
                  maxLength={5000}
                  value={values.message}
                  onChange={(event) => update('message', event.target.value)}
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? 'message-error' : undefined
                  }
                  placeholder="Tell us how we can help..."
                  className={`${input} h-auto min-h-40 resize-y py-3`}
                />
                {error('message')}
              </div>
            </div>
            <label className="mt-5 flex min-h-11 items-center gap-3 text-sm text-[#475467]">
              <input
                name="consent"
                type="checkbox"
                required
                checked={values.consent}
                onChange={(event) => update('consent', event.target.checked)}
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? 'consent-error' : undefined}
                className="size-4 shrink-0 accent-[#6D4AFF] focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30"
              />
              I agree to the Privacy Policy.
            </label>
            {error('consent')}
            <button
              type="submit"
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] px-6 font-bold text-white transition hover:-translate-y-px hover:shadow-lg hover:shadow-[#6D4AFF]/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30"
            >
              <Send className="size-4" />
              Send Message
            </button>
            {success && (
              <output className="mt-5 block rounded-xl border border-[#ABEFC6] bg-[#ECFDF5] p-4 text-sm text-[#067647]">
                <strong className="flex items-start gap-2">
                  <CheckCircle2 className="size-5 shrink-0" />
                  Thanks! Your message has been received.
                </strong>
                <span className="mt-2 block">
                  Demo confirmation only. Nothing was sent or stored.
                </span>
              </output>
            )}
          </motion.form>
          <aside className="min-w-0 pt-2 lg:pl-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-[#EDF6FF] text-[#247BFE]">
              <MessageCircle className="size-7" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold">
              Contact Information
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#667085]">
              Demo contact details for this portfolio project.
            </p>
            <dl className="mt-7 divide-y divide-[#E6EAF2]">
              {[
                { label: 'Email', value: 'support@toyverse.demo', icon: Mail },
                { label: 'Phone', value: '+91 98765 43210', icon: Phone },
                {
                  label: 'Support Hours',
                  value: 'Monday – Saturday, 9:00 AM – 7:00 PM',
                  icon: Clock,
                },
                {
                  label: 'Location',
                  value: 'Chennai, Tamil Nadu, India',
                  icon: MapPin,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex gap-4 py-5">
                  <Icon className="mt-1 size-5 shrink-0 text-[#6D4AFF]" />
                  <div className="min-w-0">
                    <dt className="text-sm font-semibold text-[#667085]">
                      {label}
                    </dt>
                    <dd className="mt-2 break-words font-semibold leading-7">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </aside>
        </section>
        <section className={wrap}>
          <h2 className="sr-only">Support Options</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Email Support',
                text: 'Send us your questions anytime.',
                icon: Mail,
              },
              {
                title: 'Phone Support',
                text: 'Talk to our support team during business hours.',
                icon: Phone,
              },
              {
                title: 'Order Help',
                text: 'Get help with tracking, delivery and returns.',
                icon: Package,
              },
              {
                title: 'Product Guidance',
                text: "Need help choosing the right toy? We're happy to help.",
                icon: Sparkles,
              },
            ].map(({ title, text, icon: Icon }) => (
              <motion.article
                {...fadeUp}
                whileHover={{ y: -3 }}
                key={title}
                className="rounded-2xl border border-[#E6EAF2] bg-white p-6 shadow-sm"
              >
                <Icon className="size-6 text-[#247BFE]" />
                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                <p className="mt-3 leading-7 text-[#667085]">{text}</p>
              </motion.article>
            ))}
          </div>
        </section>
        <section className="bg-[#EDF6FF]">
          <div className={wrap}>
            <h2 className="mb-8 text-3xl font-black">What Can We Help With?</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map(({ label, subject, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    update('subject', subject);
                    form.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                    form.current
                      ?.querySelector<HTMLElement>('[name="subject"]')
                      ?.focus({ preventScroll: true });
                  }}
                  className="flex min-h-20 items-center gap-4 rounded-xl border border-[#E6EAF2] bg-white p-5 text-left font-bold transition hover:-translate-y-px hover:border-[#6D4AFF]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30"
                >
                  <Icon className="size-5 shrink-0 text-[#6D4AFF]" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className={wrap}>
          <h2 className="mb-8 text-3xl font-black">
            Frequently Asked Questions
          </h2>
          <Accordion>
            {faqs.map(([question, answer]) => (
              <AccordionItem key={question} value={question}>
                <AccordionTrigger className="min-h-16 items-center gap-4 py-5 text-base font-bold hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 leading-7 text-[#667085]">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <section className="border-y border-[#E6EAF2] bg-white">
          <div className={`${wrap} grid gap-6 sm:grid-cols-2 lg:grid-cols-4`}>
            {[
              [ShieldCheck, 'Secure Shopping'],
              [HeartHandshake, 'Friendly Support'],
              [RotateCcw, 'Easy Returns'],
              [Truck, 'Fast Delivery'],
            ].map(([Icon, title]) => {
              const TrustIcon = Icon as typeof ShieldCheck;
              return (
                <div
                  key={String(title)}
                  className="flex items-center gap-3 text-sm font-bold"
                >
                  <TrustIcon className="size-6 text-[#6D4AFF]" />
                  {String(title)}
                </div>
              );
            })}
          </div>
        </section>
        <Footer />
      </main>
    </MotionConfig>
  );
}
