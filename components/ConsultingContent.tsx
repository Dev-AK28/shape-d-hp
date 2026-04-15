'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ConsultingContent() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; speed: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.3 + 0.05
    }));
    setStars(newStars);

    const interval = setInterval(() => {
      setStars(prevStars => prevStars.map(star => {
        const newX = star.x + (Math.random() - 0.5) * 0.1;
        return {
          ...star,
          y: star.y - star.speed < 0 ? 100 : star.y - star.speed,
          x: newX < 0 ? 100 : (newX > 100 ? 0 : newX)
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 1,
      title: "自覚",
      subtitle: "Awareness",
      description: "自分の内側にある価値観や感情に気づく。",
      detail: "心理学の知見を活かし、無意識のレベルにある自分の価値観、感情、思考パターンに気づきます。深層ヒアリングを通じて、言葉にならない内なる声を丁寧に引き出し、自己理解を深めます。幼少期からの環境的抑圧によって押し殺された本音を再発見し、自己一致への第一歩を踏み出します。",
      duration: "1〜2週間",
      output: "自己理解の深化・内面の言語化"
    },
    {
      id: 2,
      title: "言語化",
      subtitle: "Verbalization",
      description: "気づきを明確な言葉や概念に変換。",
      detail: "自覚した内なる価値や感情を、他者に伝わる明確な言葉や概念に変換します。抽象的な感情を具体的な表現に落とし込み、自分のアイデンティティやメッセージを明確にします。言語化は単なる言葉の変換ではなく、自己概念の確立プロセスです。自分の価値を論理的に構築できるようになります。",
      duration: "2〜3週間",
      output: "明確な言葉・コンセプトの確立"
    },
    {
      id: 3,
      title: "表現",
      subtitle: "Expression",
      description: "言語化したものを対外的に表現・発信。",
      detail: "言語化したコンセプトやメッセージを、対外的に表現・発信します。Webサイト、プレゼンテーション、SNS等を通じて、自分の価値を社会に届け、影響を与える表現活動を行います。適切なタイミング・トーンで伝える技術を習得し、人間関係の質を根本から変えます。「自分を語れない」という制約を解き放ちます。",
      duration: "2〜4週間",
      output: "対外的な表現・発信・影響の創出"
    }
  ];

  const perspectives = [
    { perspective: "時代", reason: "個を語れない人間が選ばれない時代になった" },
    { perspective: "AI", reason: "AIに代替されない唯一の領域が個性・言語化力" },
    { perspective: "日本社会", reason: "抑圧の構造が自己不一致を生み、大多数が損をし続けている" },
    { perspective: "既存解決策", reason: "カウンセリングもコーチングも届かない層が存在する" },
    { perspective: "心理学", reason: "自己一致こそが心理的健康の根本であり、それを促す手段が自己表現力" },
    { perspective: "スキル", reason: "習得可能と定義することで、諦めていた人に出口を提示できる" },
    { perspective: "組織", reason: "個人の自己表現力が組織のパフォーマンスに直結する" },
    { perspective: "社会", reason: "自己表現力の普及が国力の向上につながる" }
  ];

  return (
    <section style={{ position: 'relative', padding: '160px 24px', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'white',
              borderRadius: '50%',
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.3)`
            }}
          />
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', marginBottom: '120px' }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
            Consulting Process
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #a78bfa, transparent)', margin: '0 auto' }}></div>
          <p style={{ color: '#9ca3af', marginTop: '32px', maxWidth: '48rem', margin: '32px auto 0', lineHeight: 1.8, fontSize: '16px', fontFamily: 'serif' }}>
            自己表現力を習得し、自己一致した生き方を実現する
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ marginBottom: '120px', padding: '64px', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.05)', backdropFilter: 'blur(10px)' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: '#a78bfa', marginBottom: '32px', fontFamily: 'serif', lineHeight: 1.3 }}>
            「自分を語れない人間は、選ばれない時代」
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: 2, marginBottom: '24px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
            終身雇用・年功序列という日本型雇用モデルが崩壊しつつある。転職・副業・独立が当たり前になった現代では、「組織に属していること」ではなく「自分が何者で、何を提供できるか」を語れることが、生存戦略として機能する時代になった。
          </p>
          <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: 2, fontFamily: 'serif', letterSpacing: '0.02em' }}>
            AIが多くの業務を代替できるようになった結果、逆説的に「AIには代替できないもの」の価値が急騰している。それが個性・価値観・視点・言語化力であり、それを形にする力こそが自己表現力に他ならない。
          </p>
        </motion.div>

        {/* 3 Steps */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ marginBottom: '160px' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: '#a78bfa', marginBottom: '64px', fontFamily: 'serif', letterSpacing: '0.05em' }}>
            3 Steps Process
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px' }}>
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3 + index * 0.15, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                style={{ padding: '48px', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.05)', backdropFilter: 'blur(10px)' }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '2px solid rgba(167, 139, 250, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    fontWeight: 300,
                    color: '#a78bfa',
                    fontFamily: 'serif',
                    background: 'rgba(167, 139, 250, 0.1)',
                    marginBottom: '24px'
                  }}>
                    {step.id}
                  </div>
                  <h4 style={{ fontSize: '12px', color: '#a78bfa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {step.subtitle}
                  </h4>
                  <h3 style={{ fontSize: '24px', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif', lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                </div>

                <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: 2, marginBottom: '24px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  {step.description}
                </p>

                <div style={{ padding: '24px', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.05)', marginBottom: '24px' }}>
                  <p style={{ color: '#9ca3af', lineHeight: 1.9, fontSize: '14px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                    {step.detail}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '24px', fontSize: '13px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>所要時間: </span>
                    <span style={{ color: '#d1d5db', marginLeft: '8px' }}>{step.duration}</span>
                  </div>
                  <div>
                    <span style={{ color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>成果物: </span>
                    <span style={{ color: '#d1d5db', marginLeft: '8px' }}>{step.output}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 8 Perspectives Grid */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ marginBottom: '120px' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: '#a78bfa', marginBottom: '64px', fontFamily: 'serif', letterSpacing: '0.05em' }}>
            なぜ「自己表現力」が最も必要なスキルなのか
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {perspectives.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                style={{ padding: '32px', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.05)', backdropFilter: 'blur(10px)' }}
              >
                <h4 style={{ fontSize: '14px', color: '#a78bfa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'serif' }}>
                  {item.perspective}
                </h4>
                <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: 1.8, fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  {item.reason}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', padding: '64px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(167, 139, 250, 0.1), rgba(167, 139, 250, 0.2))', backdropFilter: 'blur(10px)' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
            自己表現力は、個人の幸福・組織の生産性・社会の活力、この三つを同時に底上げできる唯一のスキルである。
          </h3>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05, borderColor: '#c4b5fd', transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'inline-block', padding: '16px 48px', border: '1px solid #a78bfa', borderRadius: '9999px', color: '#a78bfa', background: 'transparent', cursor: 'pointer', fontSize: '16px', fontFamily: 'serif', textDecoration: 'none' }}
          >
            無料で初回相談をする
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
