export type ServiceCategory = {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'exterior',
    name: '外装洗車',
    icon: 'car-wash',
    description: '手洗い洗車・ワックスがけ',
    color: '#3B82F6',
  },
  {
    id: 'interior',
    name: '内装クリーニング',
    icon: 'car-seat',
    description: 'シート・ダッシュボード・フロアマット',
    color: '#8B5CF6',
  },
  {
    id: 'coating',
    name: 'コーティング',
    icon: 'shield-check',
    description: 'ガラスコーティング・セラミック',
    color: '#F59E0B',
  },
  {
    id: 'polish',
    name: '磨き・研磨',
    icon: 'auto-fix',
    description: '傷消し・ポリッシュ・鏡面仕上げ',
    color: '#EC4899',
  },
  {
    id: 'full_detail',
    name: 'フルディテイル',
    icon: 'star-circle',
    description: '外装＋内装＋コーティングのフルコース',
    color: '#1E3A5F',
  },
  {
    id: 'engine',
    name: 'エンジンルーム',
    icon: 'engine',
    description: 'エンジンルーム洗浄・美装',
    color: '#EF4444',
  },
];

export const PAYMENT_METHODS = [
  { id: 'online', name: 'オンライン決済', icon: 'credit-card' },
  { id: 'cash', name: '現金決済', icon: 'cash' },
] as const;

export const PAYOUT_SCHEDULES = [
  { id: 'instant', name: '即日払い', fee: 3, description: '+3%手数料' },
  { id: 'weekly', name: '週払い', fee: 0, description: '毎週月曜振込' },
  { id: 'monthly', name: '月払い', fee: 0, description: '毎月1日振込' },
] as const;

export const ORDER_STATUSES = [
  { id: 'searching', label: 'プロ検索中', icon: 'magnify' },
  { id: 'accepted', label: '承認済み', icon: 'check-circle' },
  { id: 'arriving', label: '移動中', icon: 'car' },
  { id: 'in_progress', label: '作業中', icon: 'wrench' },
  { id: 'pending_confirm', label: '完了確認待ち', icon: 'clipboard-check' },
  { id: 'completed', label: '完了', icon: 'check-all' },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]['id'];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['id'];
export type PayoutSchedule = (typeof PAYOUT_SCHEDULES)[number]['id'];
