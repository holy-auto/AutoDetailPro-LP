"use client";

import { useState } from "react";

const areas: { value: string; label: string; group: string }[] = [
  { value: "hokkaido", label: "北海道", group: "北海道・東北" },
  { value: "aomori", label: "青森県", group: "北海道・東北" },
  { value: "iwate", label: "岩手県", group: "北海道・東北" },
  { value: "miyagi", label: "宮城県", group: "北海道・東北" },
  { value: "akita", label: "秋田県", group: "北海道・東北" },
  { value: "yamagata", label: "山形県", group: "北海道・東北" },
  { value: "fukushima", label: "福島県", group: "北海道・東北" },
  { value: "ibaraki", label: "茨城県", group: "関東" },
  { value: "tochigi", label: "栃木県", group: "関東" },
  { value: "gunma", label: "群馬県", group: "関東" },
  { value: "saitama", label: "埼玉県", group: "関東" },
  { value: "chiba", label: "千葉県", group: "関東" },
  { value: "tokyo", label: "東京都", group: "関東" },
  { value: "kanagawa", label: "神奈川県", group: "関東" },
  { value: "niigata", label: "新潟県", group: "中部" },
  { value: "toyama", label: "富山県", group: "中部" },
  { value: "ishikawa", label: "石川県", group: "中部" },
  { value: "fukui", label: "福井県", group: "中部" },
  { value: "yamanashi", label: "山梨県", group: "中部" },
  { value: "nagano", label: "長野県", group: "中部" },
  { value: "gifu", label: "岐阜県", group: "中部" },
  { value: "shizuoka", label: "静岡県", group: "中部" },
  { value: "aichi", label: "愛知県", group: "中部" },
  { value: "mie", label: "三重県", group: "近畿" },
  { value: "shiga", label: "滋賀県", group: "近畿" },
  { value: "kyoto", label: "京都府", group: "近畿" },
  { value: "osaka", label: "大阪府", group: "近畿" },
  { value: "hyogo", label: "兵庫県", group: "近畿" },
  { value: "nara", label: "奈良県", group: "近畿" },
  { value: "wakayama", label: "和歌山県", group: "近畿" },
  { value: "tottori", label: "鳥取県", group: "中国" },
  { value: "shimane", label: "島根県", group: "中国" },
  { value: "okayama", label: "岡山県", group: "中国" },
  { value: "hiroshima", label: "広島県", group: "中国" },
  { value: "yamaguchi", label: "山口県", group: "中国" },
  { value: "tokushima", label: "徳島県", group: "四国" },
  { value: "kagawa", label: "香川県", group: "四国" },
  { value: "ehime", label: "愛媛県", group: "四国" },
  { value: "kochi", label: "高知県", group: "四国" },
  { value: "fukuoka", label: "福岡県", group: "九州・沖縄" },
  { value: "saga", label: "佐賀県", group: "九州・沖縄" },
  { value: "nagasaki", label: "長崎県", group: "九州・沖縄" },
  { value: "kumamoto", label: "熊本県", group: "九州・沖縄" },
  { value: "oita", label: "大分県", group: "九州・沖縄" },
  { value: "miyazaki", label: "宮崎県", group: "九州・沖縄" },
  { value: "kagoshima", label: "鹿児島県", group: "九州・沖縄" },
  { value: "okinawa", label: "沖縄県", group: "九州・沖縄" },
];

const areaGroups = Array.from(new Set(areas.map((a) => a.group)));

const experienceOptions = [
  { value: "beginner", label: "未経験 / 学習中" },
  { value: "1-3", label: "1〜3年" },
  { value: "3-5", label: "3〜5年" },
  { value: "5-10", label: "5〜10年" },
  { value: "10+", label: "10年以上" },
];

const serviceOptions = [
  "出張手洗い洗車",
  "出張ガラスコーティング",
  "出張内装クリーニング",
  "出張ポリッシュ磨き",
  "フルディテイリング",
  "エンジンルーム洗浄",
];

export default function ProSignupForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [experience, setExperience] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !agree) return;

    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/pro-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          phone,
          area,
          experience,
          services,
          message,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setName("");
        setPhone("");
        setArea("");
        setExperience("");
        setServices([]);
        setMessage("");
      } else {
        setStatus("error");
        setErrorMessage(data?.error ?? "登録に失敗しました。");
      }
    } catch {
      setStatus("error");
      setErrorMessage("通信エラーが発生しました。");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="プロ事前登録フォーム"
      className="bg-white rounded-2xl p-6 lg:p-8 text-[#0a2540] soft-shadow-lg space-y-4"
    >
      <div>
        <p className="text-[10px] font-bold tracking-[0.25em] text-[#0099e6] uppercase mb-1">
          Pro Pre-registration
        </p>
        <h3 className="text-xl lg:text-2xl font-bold text-[#0a2540] mb-1">
          認定プロ第一期生 事前登録
        </h3>
        <p className="text-[12px] text-[#5a7090] leading-relaxed">
          全国47都道府県から事前登録を受付中。ローンチ時に優先案内・研修招待・初期報酬アップを行います。
          下記フォームよりお気軽にお申し込みください。
        </p>
      </div>

      <div>
        <label htmlFor="pro-email" className="block text-[12px] font-bold text-[#0a2540] mb-1.5">
          メールアドレス <span className="text-[#c41e60]">*</span>
        </label>
        <input
          id="pro-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mobilewash.jp"
          className="w-full px-4 py-2.5 rounded-lg text-[14px] text-[#0a2540] placeholder-[#8ba0ba] bg-white border border-[#e4eef7] focus:outline-none focus:ring-2 focus:ring-[#0099e6]/30 focus:border-[#0099e6]"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="pro-name" className="block text-[12px] font-bold text-[#0a2540] mb-1.5">
            お名前
          </label>
          <input
            id="pro-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            className="w-full px-4 py-2.5 rounded-lg text-[14px] text-[#0a2540] placeholder-[#8ba0ba] bg-white border border-[#e4eef7] focus:outline-none focus:ring-2 focus:ring-[#0099e6]/30 focus:border-[#0099e6]"
          />
        </div>
        <div>
          <label htmlFor="pro-phone" className="block text-[12px] font-bold text-[#0a2540] mb-1.5">
            電話番号
          </label>
          <input
            id="pro-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="090-0000-0000"
            className="w-full px-4 py-2.5 rounded-lg text-[14px] text-[#0a2540] placeholder-[#8ba0ba] bg-white border border-[#e4eef7] focus:outline-none focus:ring-2 focus:ring-[#0099e6]/30 focus:border-[#0099e6]"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="pro-area" className="block text-[12px] font-bold text-[#0a2540] mb-1.5">
            活動希望エリア
          </label>
          <select
            id="pro-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-[14px] text-[#0a2540] bg-white border border-[#e4eef7] focus:outline-none focus:ring-2 focus:ring-[#0099e6]/30 focus:border-[#0099e6]"
          >
            <option value="">選択してください（全国対応）</option>
            {areaGroups.map((g) => (
              <optgroup key={g} label={g}>
                {areas
                  .filter((a) => a.group === g)
                  .map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pro-exp" className="block text-[12px] font-bold text-[#0a2540] mb-1.5">
            経験年数
          </label>
          <select
            id="pro-exp"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-[14px] text-[#0a2540] bg-white border border-[#e4eef7] focus:outline-none focus:ring-2 focus:ring-[#0099e6]/30 focus:border-[#0099e6]"
          >
            <option value="">選択してください</option>
            {experienceOptions.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="block text-[12px] font-bold text-[#0a2540] mb-1.5">
          得意なメニュー（複数選択可）
        </legend>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((s) => (
            <label
              key={s}
              className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full cursor-pointer border transition-colors ${
                services.includes(s)
                  ? "bg-[#0099e6] text-white border-[#0099e6]"
                  : "bg-white text-[#5a7090] border-[#e4eef7] hover:border-[#cfdfee]"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={services.includes(s)}
                onChange={() => toggleService(s)}
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="pro-msg" className="block text-[12px] font-bold text-[#0a2540] mb-1.5">
          メッセージ・自己PR（任意）
        </label>
        <textarea
          id="pro-msg"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="例：店舗で5年勤務後、現在は副業として活動。ガラスコーティングが得意です。"
          className="w-full px-4 py-2.5 rounded-lg text-[14px] text-[#0a2540] placeholder-[#8ba0ba] bg-white border border-[#e4eef7] focus:outline-none focus:ring-2 focus:ring-[#0099e6]/30 focus:border-[#0099e6]"
        />
      </div>

      <label className="flex items-start gap-2 text-[12px] text-[#5a7090] leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 accent-[#0099e6]"
        />
        <span>
          <a href="#" className="text-[#0099e6] hover:underline">利用規約</a>
          ・
          <a href="#" className="text-[#0099e6] hover:underline">プライバシーポリシー</a>
          に同意のうえ申し込みます。
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "loading" || !agree || !email}
        className="w-full bg-[#0099e6] hover:bg-[#0077b3] disabled:bg-[#cfdfee] disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-full transition-colors text-[14px]"
      >
        {status === "loading" ? "送信中..." : "プロ事前登録に申し込む"}
      </button>

      {status === "success" && (
        <p className="text-[#0a8f7c] text-[13px] font-medium" role="status">
          ✓ 申込ありがとうございます。担当よりメールでご連絡します。
        </p>
      )}
      {status === "error" && (
        <p className="text-[#c41e60] text-[13px] font-medium" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
