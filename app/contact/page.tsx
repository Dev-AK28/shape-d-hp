'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ScrollReveal from '@/components/scroll/ScrollReveal';
import TextReveal from '@/components/scroll/TextReveal';
import SectionShell from '@/components/ui/SectionShell';
import { PUBLIC_CONTACT_EMAIL } from '@/lib/contact/constants';

type SubmitStatus = 'idle' | 'success' | 'error';

const ERROR_MESSAGES: Record<number, string> = {
  400: '入力内容に誤りがあります。必須項目を確認してください。',
  413: '送信データが大きすぎます。メッセージを短くしてください。',
  429: '送信回数の上限に達しました。しばらく待ってから再度お試しください。',
  500: '送信に失敗しました。再度お試しください。',
};

function getErrorMessage(status: number): string {
  return ERROR_MESSAGES[status] ?? ERROR_MESSAGES[500];
}

export default function ContactPage() {
  const reduceMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <SectionShell padding="sm" className="flex min-h-[60vh] items-center justify-center pt-[120px]">
        <ScrollReveal className="max-w-[800px] text-center">
          <h1 className="mb-6 font-serif text-[clamp(48px,6vw,64px)] font-light tracking-wider text-white">
            CONTACT
          </h1>
          <TextReveal
            as="p"
            text="お気軽にご相談ください"
            className="font-serif text-lg leading-relaxed text-gray-400"
          />
          <p className="mt-2 font-serif text-sm text-gray-500">{PUBLIC_CONTACT_EMAIL}</p>
        </ScrollReveal>
      </SectionShell>

      <SectionShell padding="md">
        <div className="mx-auto max-w-[600px]">
          <ScrollReveal delay={0.15}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {[
                { id: 'name', label: 'お名前', type: 'text', required: true, placeholder: '山田 太郎' },
                { id: 'email', label: 'メールアドレス', type: 'email', required: true, placeholder: 'example@email.com' },
                { id: 'company', label: '会社名', type: 'text', required: false, placeholder: '株式会社〇〇' },
              ].map((field) => (
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
                    value={formData[field.id as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-4 font-serif text-base text-white backdrop-blur-md"
                    placeholder={field.placeholder}
                  />
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
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full resize-y rounded-lg border border-white/10 bg-black/40 px-4 py-4 font-serif text-base text-white backdrop-blur-md"
                  placeholder="ご相談内容をお聞かせください"
                />
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
