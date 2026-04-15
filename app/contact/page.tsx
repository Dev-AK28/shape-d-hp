'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';

const CONTACT_EMAIL = 'kota.icehockey2016@gmail.com';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: CONTACT_EMAIL
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', company: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A192F] to-black">
      <Navigation />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ textAlign: 'center', maxWidth: '800px' }}
        >
          <h1 style={{ fontSize: 'clamp(48px, 6vw, 64px)', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif', letterSpacing: '0.05em' }}>
            CONTACT
          </h1>
          <p style={{ fontSize: '18px', color: '#9ca3af', lineHeight: 1.8, fontFamily: 'serif' }}>
            お気軽にご相談ください
          </p>
        </motion.div>
      </div>

      <section style={{ padding: '120px 24px', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <motion.form
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
          >
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#93c5fd', fontSize: '14px', letterSpacing: '0.1em' }}>
                お名前
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'serif',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#93c5fd', fontSize: '14px', letterSpacing: '0.1em' }}>
                メールアドレス
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'serif',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#93c5fd', fontSize: '14px', letterSpacing: '0.1em' }}>
                会社名
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'serif',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="株式会社〇〇"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#93c5fd', fontSize: '14px', letterSpacing: '0.1em' }}>
                メッセージ
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'serif',
                  backdropFilter: 'blur(10px)',
                  resize: 'vertical'
                }}
                placeholder="ご相談内容をお聞かせください"
              />
            </div>

            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ade80', textAlign: 'center' }}
              >
                送信しました。お問い合わせありがとうございます。
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', textAlign: 'center' }}
              >
                送信に失敗しました。再度お試しください。
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, borderColor: '#93c5fa' }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '20px 64px',
                border: '1px solid #60a5fa',
                borderRadius: '9999px',
                color: '#93c5fd',
                background: 'transparent',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '18px',
                fontFamily: 'serif',
                opacity: isSubmitting ? 0.5 : 1,
                alignSelf: 'flex-start'
              }}
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </motion.button>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
