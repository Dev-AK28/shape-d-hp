'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import ScrollReveal from '@/components/scroll/ScrollReveal';
import SectionShell from '@/components/ui/SectionShell';
import { PUBLIC_CONTACT_EMAIL } from '@/lib/contact/constants';

type SubmitStatus = 'idle' | 'success' | 'error';
type ContactFormData = {
  name: string;
  email: string;
  company: string;
  message: string;
};
type FieldErrors = Partial<Record<keyof ContactFormData, string>>;

const ERROR_MESSAGES: Record<number, string> = {
  400: '入力内容に誤りがあります。必須項目を確認してください。',
  413: '送信データが大きすぎます。メッセージを短くしてください。',
  429: '送信回数の上限に達しました。しばらく待ってから再度お試しください。',
  500: '送信に失敗しました。再度お試しください。',
};

function getErrorMessage(status: number): string {
  return ERROR_MESSAGES[status] ?? ERROR_MESSAGES[500];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_FIELDS = [
  {
    id: 'name' as const,
    label: 'お名前',
    type: 'text',
    required: true,
    placeholder: '山田 太郎',
    requiredMessage: 'お名前を入力してください。',
  },
  {
    id: 'email' as const,
    label: 'メールアドレス',
    type: 'email',
    required: true,
    placeholder: 'example@email.com',
    requiredMessage: 'メールアドレスを入力してください。',
    invalidMessage: 'メールアドレスの形式が正しくありません。',
  },
  {
    id: 'company' as const,
    label: '会社名',
    type: 'text',
    required: false,
    placeholder: '株式会社〇〇',
  },
];

function validateContactForm(data: ContactFormData): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of CONTACT_FIELDS) {
    const value = data[field.id].trim();
    if (field.required && value === '') {
      errors[field.id] = field.requiredMessage;
    } else if (field.type === 'email' && value !== '' && !EMAIL_PATTERN.test(value)) {
      errors[field.id] = field.invalidMessage;
    }
  }

  if (data.message.trim() === '') {
    errors.message = 'メッセージを入力してください。';
  }

  return errors;
}

export default function ContactPage() {
  const reduceMotion = useReducedMotion();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (id: keyof ContactFormData) => {
    setFieldErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateContactForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitStatus('idle');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', company: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(getErrorMessage(response.status));
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage(ERROR_MESSAGES[500]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <PageHeader
        title="CONTACT"
        subtitle="お気軽にご相談ください"
        email={PUBLIC_CONTACT_EMAIL}
        animateTitle={false}
        showDivider={false}
      />

      <SectionShell padding="md">
        <div className="mx-auto max-w-[600px]">
          <ScrollReveal delay={0.15}>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
              {CONTACT_FIELDS.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="mb-2 block text-sm tracking-[0.1em] text-blue-300"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    required={field.required}
                    value={formData[field.id]}
                    onChange={(e) => {
                      setFormData({ ...formData, [field.id]: e.target.value });
                      clearFieldError(field.id);
                    }}
                    aria-invalid={fieldErrors[field.id] ? true : undefined}
                    aria-describedby={fieldErrors[field.id] ? `${field.id}-error` : undefined}
                    className={`w-full rounded-lg border bg-black/40 px-4 py-4 font-serif text-base text-white backdrop-blur-md ${
                      fieldErrors[field.id] ? 'border-red-400/60' : 'border-white/10'
                    }`}
                    placeholder={field.placeholder}
                  />
                  {fieldErrors[field.id] ? (
                    <p id={`${field.id}-error`} role="alert" className="mt-2 text-sm text-red-400">
                      {fieldErrors[field.id]}
                    </p>
                  ) : null}
                </div>
              ))}

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm tracking-[0.1em] text-blue-300"
                >
                  メッセージ
                </label>
                <textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    clearFieldError('message');
                  }}
                  rows={6}
                  aria-invalid={fieldErrors.message ? true : undefined}
                  aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                  className={`w-full resize-y rounded-lg border bg-black/40 px-4 py-4 font-serif text-base text-white backdrop-blur-md ${
                    fieldErrors.message ? 'border-red-400/60' : 'border-white/10'
                  }`}
                  placeholder="ご相談内容をお聞かせください"
                />
                {fieldErrors.message ? (
                  <p id="message-error" role="alert" className="mt-2 text-sm text-red-400">
                    {fieldErrors.message}
                  </p>
                ) : null}
              </div>

              {submitStatus === 'success' && (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={reduceMotion ? false : { opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                  className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4 text-center text-green-400"
                >
                  送信しました。お問い合わせありがとうございます。
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  role="alert"
                  aria-live="assertive"
                  initial={reduceMotion ? false : { opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-4 text-center text-red-400"
                >
                  {errorMessage}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={reduceMotion ? undefined : { scale: 1.02, borderColor: '#93c5fa' }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="self-start rounded-full border border-blue-400 px-16 py-5 font-serif text-lg text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </motion.button>
            </form>
          </ScrollReveal>
        </div>
      </SectionShell>
    </main>
  );
}
