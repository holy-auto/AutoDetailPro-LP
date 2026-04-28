export type Prefecture = {
  slug: string;
  name: string;
  nameKana: string;
  region: string;
  status: "active" | "soon";
  cities: string[];
  description: string;
};

export const prefectures: Prefecture[] = [
  {
    slug: "tokyo",
    name: "東京都",
    nameKana: "とうきょうと",
    region: "首都圏",
    status: "active",
    cities: ["新宿区", "渋谷区", "港区", "世田谷区", "品川区", "目黒区", "江東区", "千代田区", "中央区", "豊島区"],
    description: "東京都全域で出張洗車・出張コーティングをご提供。マンション駐車場・タワマン地下・月極駐車場まで認定プロが出張します。",
  },
  {
    slug: "kanagawa",
    name: "神奈川県",
    nameKana: "かながわけん",
    region: "首都圏",
    status: "active",
    cities: ["横浜市", "川崎市", "相模原市", "藤沢市", "鎌倉市", "茅ヶ崎市"],
    description: "横浜市・川崎市を中心に、神奈川県全域で出張洗車サービスを展開しています。",
  },
  {
    slug: "saitama",
    name: "埼玉県",
    nameKana: "さいたまけん",
    region: "首都圏",
    status: "active",
    cities: ["さいたま市", "川口市", "所沢市", "越谷市", "草加市", "春日部市"],
    description: "さいたま市・川口市を中心に、埼玉県全域で出張洗車・出張コーティングをご利用いただけます。",
  },
  {
    slug: "chiba",
    name: "千葉県",
    nameKana: "ちばけん",
    region: "首都圏",
    status: "active",
    cities: ["千葉市", "船橋市", "柏市", "市川市", "松戸市", "浦安市"],
    description: "千葉市・船橋市を中心に、千葉県全域で出張洗車プロをマッチングします。",
  },
  {
    slug: "osaka",
    name: "大阪府",
    nameKana: "おおさかふ",
    region: "関西圏",
    status: "active",
    cities: ["大阪市", "堺市", "豊中市", "吹田市", "東大阪市", "高槻市"],
    description: "大阪市内のマンション駐車場・月極駐車場で出張洗車・出張コーティングが可能です。",
  },
  {
    slug: "kyoto",
    name: "京都府",
    nameKana: "きょうとふ",
    region: "関西圏",
    status: "active",
    cities: ["京都市中京区", "京都市左京区", "京都市右京区", "京都市伏見区", "宇治市"],
    description: "京都市内を中心に、出張洗車・出張ガラスコーティングを承っています。",
  },
  {
    slug: "hyogo",
    name: "兵庫県",
    nameKana: "ひょうごけん",
    region: "関西圏",
    status: "active",
    cities: ["神戸市", "西宮市", "尼崎市", "姫路市", "明石市"],
    description: "神戸市・西宮市・尼崎市を中心に、兵庫県全域で出張洗車プロが対応します。",
  },
  {
    slug: "aichi",
    name: "愛知県",
    nameKana: "あいちけん",
    region: "中部・東海",
    status: "active",
    cities: ["名古屋市", "豊田市", "岡崎市", "一宮市", "豊橋市", "安城市"],
    description: "名古屋市を中心に愛知県全域で、出張洗車・出張コーティングをご提供しています。",
  },
  {
    slug: "shizuoka",
    name: "静岡県",
    nameKana: "しずおかけん",
    region: "中部・東海",
    status: "soon",
    cities: ["静岡市", "浜松市", "沼津市", "富士市"],
    description: "静岡県は2026年内に出張洗車サービス開始予定。先行登録受付中です。",
  },
  {
    slug: "fukuoka",
    name: "福岡県",
    nameKana: "ふくおかけん",
    region: "九州",
    status: "soon",
    cities: ["福岡市", "北九州市", "久留米市"],
    description: "福岡県は2026年内に出張洗車サービス開始予定。先行登録受付中です。",
  },
  {
    slug: "hokkaido",
    name: "北海道",
    nameKana: "ほっかいどう",
    region: "東北・北海道",
    status: "soon",
    cities: ["札幌市", "旭川市", "函館市"],
    description: "北海道は2026年内に出張洗車サービス開始予定。先行登録受付中です。",
  },
  {
    slug: "miyagi",
    name: "宮城県",
    nameKana: "みやぎけん",
    region: "東北・北海道",
    status: "soon",
    cities: ["仙台市"],
    description: "宮城県は2026年内に出張洗車サービス開始予定。先行登録受付中です。",
  },
];

export function getPrefecture(slug: string): Prefecture | undefined {
  return prefectures.find((p) => p.slug === slug);
}
