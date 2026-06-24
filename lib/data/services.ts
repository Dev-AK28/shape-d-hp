/** Shared service list — single source of truth for title/category/description/tagline. */

export type ServiceCategory = 'Digital Solution' | 'Human Solution';

export const SERVICE_LIST = [
  {
    id: 'ai-product' as const,
    title: 'AIプロダクト開発',
    category: 'Digital Solution' as ServiceCategory,
    description:
      '着想を、鮮度を保ったまま形にする。最新のAIスタックを指揮し、事業の核を最短距離でプロダクトへと昇華させます。',
    tagline: '着想の鮮度を保ち、市場投入のリードタイムを短縮',
  },
  {
    id: 'dx' as const,
    title: '業務自動化・DX支援',
    category: 'Digital Solution' as ServiceCategory,
    description:
      '思考のノイズを削ぎ落とし、本来の創造性に没頭できる環境を構築。ルーティンをAIに委ね、淀みのないワークフローを実現します。',
    tagline: '創造的業務への集中時間を最大化',
  },
  {
    id: 'web-app' as const,
    title: 'Webアプリ・モバイルアプリ開発',
    category: 'Digital Solution' as ServiceCategory,
    description:
      '最新のAI活用手法による圧倒的な納期短縮。モダンな技術スタックを使用したWebアプリおよびモバイルアプリの開発。',
    tagline: 'ユーザー体験の最適化とスケーラビリティの確保',
  },
  {
    id: 'coaching' as const,
    title: '自己表現コーチング',
    category: 'Human Solution' as ServiceCategory,
    description:
      'AI時代に代替不可能な『個』の価値を最大化。心理学士の視点から、自覚・言語化・表現の3スキルを習得し、自己一致した生き方を支援します。',
    tagline: '個の資本化と自己一致した生き方の実現',
  },
] as const;
