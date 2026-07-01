/** Shared service list — single source of truth for title/category/description/tagline. */

export type ServiceCategory = 'Digital Solution' | 'Human Solution';

type Service = {
  readonly id: string;
  readonly title: string;
  readonly category: ServiceCategory;
  readonly description: string;
  readonly tagline: string;
};

export const SERVICE_LIST = [
  {
    id: 'ai-product',
    title: 'AIプロダクト開発',
    category: 'Digital Solution',
    description:
      '着想を、鮮度を保ったまま形にする。最新のAIスタックを指揮し、事業の核を最短距離でプロダクトへと昇華させます。',
    tagline: '着想の鮮度を保ち、市場投入のリードタイムを短縮',
  },
  {
    id: 'dx',
    title: '業務自動化・DX支援',
    category: 'Digital Solution',
    description:
      '思考のノイズを削ぎ落とし、本来の創造性に没頭できる環境を構築。ルーティンをAIに委ね、淀みのないワークフローを実現します。',
    tagline: '創造的業務への集中時間を最大化',
  },
  {
    id: 'web-app',
    title: 'Webアプリ・モバイルアプリ開発',
    category: 'Digital Solution',
    description:
      '最新のAI活用手法による圧倒的な納期短縮。モダンな技術スタックを使用したWebアプリおよびモバイルアプリの開発。',
    tagline: 'ユーザー体験の最適化とスケーラビリティの確保',
  },
  {
    id: 'coaching',
    title: '自己表現コーチング',
    category: 'Human Solution',
    description:
      'AI時代に代替不可能な『個』の価値を最大化。心理学士の視点から、自覚・言語化・表現の3スキルを習得し、自己一致した生き方を支援します。',
    tagline: '個の資本化と自己一致した生き方の実現',
  },
] as const satisfies readonly Service[];

export type ServiceId = (typeof SERVICE_LIST)[number]['id'];

/** Look up a service by id. Throws if the id is not present (guarded by ServiceId type). */
export function getServiceById(id: ServiceId) {
  const service = SERVICE_LIST.find((s) => s.id === id);
  if (!service) {
    throw new Error(`Service not found for id: ${id}`);
  }
  return service;
}
