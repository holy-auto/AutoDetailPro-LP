# マップ・位置情報アーキテクチャ設計書

最終更新: 2026-05-02
ステータス: **Draft（実装前・方針合意待ち）**

---

## 1. 背景と問題意識

### 1.1 なぜこのドキュメントがあるか

現状コードは `react-native-maps` + Google Directions API という **Google 全面依存**の構成になっている。これは過去のコミット時点の暫定実装で、中長期方針とは合致していない。本ドキュメントは方針を明文化し、実装作業の前提を固める。

### 1.2 先行事例から得た教訓

| 事例 | 学び |
|---|---|
| **Uber × Google Maps** | 利用量増加で従量課金が暴騰し、数百億円規模の自前マップ構築に追い込まれた。最終的に Mapbox 併用へ移行 |
| **Uber 自前マップ** | フルスクラッチは無謀。OSS（OSM/MapLibre）ベースが現実解だと業界全体が学んだ |
| **GO（旧 JapanTaxi）** | NAVITIME 等の日本特化ルーティングを採用。日本の住所精度・建物名検索で Google より優位 |
| **Google Maps 規約 §3.2.4** | 取得したジオデータをサービス外に保存・分析・再利用することを禁止。**Google を使い続ける限り自社データ資産は永遠にゼロ** |

### 1.3 戦略的要件

1. **コストが MAU に線形連動しない** こと（Uber の失敗回避）
2. **取得した位置情報を自社 DB に蓄積し、再利用可能** であること（参入障壁構築）
3. **日本市場の住所・道路事情に最適化** されていること（GO の成功条件の踏襲）
4. **段階的移行が可能** であり、一度に全部書き換えなくて済むこと

---

## 2. 採用する技術スタック

| レイヤ | 採用技術 | 理由 |
|---|---|---|
| 地図表示 SDK | **MapLibre Native**（`@maplibre/maplibre-react-native`）| OSS、ライセンス料ゼロ。Mapbox から fork されたコミュニティ版で実績豊富 |
| ベクタタイル | **PMTiles**（Cloudflare R2 配信） | サーバ不要・Egress 無料・1 ファイル運用。日本全国で 5〜15 GB |
| ルーティング | **OSRM**（自前ホスト・自動車プロファイル） | OSS、低レイテンシ。Valhalla も候補だが OSRM の方が立ち上げが速い |
| ジオコーディング（住所→座標） | **国土地理院 地名検索 API** + フォールバック **Nominatim** | 国産・無料・日本の住所精度が最強。海外住所は Nominatim |
| 逆ジオコーディング（座標→住所） | **国土地理院 逆ジオコーディング API** | 同上 |
| 実走行データ蓄積 | **PostGIS（既存 Supabase）** | プロの GPS トレースを `gps_traces` テーブルに保存し、独自データ資産化 |

### 2.1 採用しない技術と理由

| 技術 | 不採用理由 |
|---|---|
| Google Maps Platform | 規約上データ蓄積不可 + 従量課金が MAU 比例で青天井 |
| Apple Maps（MapKit JS / native） | iOS 限定、規約上データ保存制約あり、Android で使えない |
| Mapbox（公式 SDK） | 月額 MAU 課金で Google より安いがロックインがある。MapLibre で代替可能 |
| 自前タイルサーバ（TileServer GL on VPS） | PMTiles + R2 の方が運用が楽で安価 |
| NAVITIME API | ルーティング品質は最高だが商用ライセンス料が高額。Phase 3 で必要なら追加検討 |

---

## 3. データ蓄積戦略

「Google で配ると Google のもの、自社サーバ経由なら自社のもの」が原則。以下のデータを **能動的に保存** していく。

### 3.1 蓄積するデータ

| データ | スキーマ | 用途 |
|---|---|---|
| プロの実走行 GPS トレース | `gps_traces(order_id, pro_id, geom, recorded_at, speed)` | OSRM の予測 ETA と実所要時間を比較 → 自社で日本一精度の高い ETA モデルを構築 |
| 住所→実座標補正ログ | `geocode_corrections(input_address, suggested_lat, suggested_lng, actual_lat, actual_lng, corrected_at)` | 「マンション ◯◯ 棟」など住所文字列のジオコーディングが現地と何 m ズレるかの実データ |
| ルート品質フィードバック | `route_quality(order_id, suggested_polyline, actual_polyline, suggested_eta_sec, actual_duration_sec)` | OSRM の提案 vs 実走行を蓄積 → ルートエンジンを継続改善 |
| 駐車・洗車適地 POI | `wash_spots(lat, lng, building_name, notes, verified_count)` | 「このマンションの洗車できる場所はここ」といった現場知 |

### 3.2 期待される効果（24 ヶ月後）

- **ETA 精度**：OSM デフォルトの ±30% → 自社モデルで ±10%（時間帯・道路別に補正済み）
- **住所マッチング精度**：Google 並み or 超え（日本特化）
- **POI データ**：競合が持っていない「洗車適地」一次データが数万点
- これらは **買収・資金調達時の無形資産として評価可能**

---

## 4. コスト試算

### 4.1 月額コスト比較（注：レート ¥150/USD で換算）

| MAU | Google 構成 | 本設計（OSS） | 差額/月 |
|---|---|---|---|
| 1,000 | 約 ¥25 万 | 約 ¥1.5 万 | ▲ ¥23.5 万（94% 削減） |
| 10,000 | 約 ¥250 万 | 約 ¥3 万 | ▲ ¥247 万（98% 削減） |
| 100,000 | 約 ¥2,500 万 | 約 ¥15 万 | ▲ ¥2,485 万（99% 削減） |

### 4.2 内訳（OSS 構成・MAU 1 万想定）

| 項目 | 月額 |
|---|---|
| Cloudflare R2（タイル配信、ストレージ 15 GB） | 約 ¥500 |
| VPS（OSRM + Nominatim、Hetzner CX31 相当） | 約 ¥2,000 |
| ログ・トレース DB（Supabase 既存枠） | ¥0（既存） |
| 監視（UptimeRobot 無料枠） | ¥0 |
| **合計** | **約 ¥2,500–3,000** |

### 4.3 隠れコスト

| 項目 | 規模感 |
|---|---|
| 初期構築工数 | 1〜2 週間（OSRM ビルド、PMTiles 生成、Nominatim 初期インポート） |
| OSM 差分更新運用 | 月 1 回の cron 自動化で 30 分／月 |
| 障害対応 | SLA なし。Hetzner の冗長構成で緩和。Phase 3 で LB 導入 |
| DevOps 学習 | Docker + cron + 監視リテラシー必須 |

---

## 5. 段階的移行ロードマップ

一度に全部置き換えると壊れるので、3 フェーズに分割する。

### Phase 1：表示の Google 排除（1〜2 スプリント）

- `react-native-maps` を `@maplibre/maplibre-react-native` に差し替え
- ベクタタイルは初期は **MapTiler マネージド版**（$25/月）でショートカット
- ルーティングは Google Directions のまま暫定維持
- **Acceptance Criteria**：地図表示が iOS / Android で動作し、Google Maps SDK 依存が `package.json` から消えている

### Phase 2：ルーティング・ジオコーディングの自前化（2〜3 スプリント）

- OSRM + Nominatim を Hetzner / Sakura VPS にデプロイ
- `mobile/supabase/functions/get-directions/index.ts` を OSRM 呼び出しに切り替え
- 住所入力フォームのジオコーディングを国土地理院 API に切り替え
- 既存 `GOOGLE_MAPS_API_KEY` を完全に廃止
- **Acceptance Criteria**：`grep -r "googleapis\|maps.google" mobile/` が 0 件

### Phase 3：データ蓄積基盤と自前タイル化（継続）

- `gps_traces` / `geocode_corrections` / `route_quality` / `wash_spots` テーブルを作成
- プロアプリの位置情報送信処理を `gps_traces` 書き込みに改造
- ETA 補正モデル（時間帯 × 道路区間 × 平均速度）の集計ジョブを追加
- MapTiler から PMTiles 自前ホストに移行（コスト最適化）
- **Acceptance Criteria**：実走行データが日次で集計され、ETA 精度のメトリクスが計測されている

---

## 6. 移行リスクと緩和策

| リスク | 影響 | 緩和策 |
|---|---|---|
| OSM の住所カバレッジが日本で甘い場所がある | 配車ミス・ETA ズレ | 国土地理院 API を一次にし、OSM はフォールバック |
| OSRM 自前ホストが落ちる | ルート計算停止 | Phase 2 で 2 リージョン冗長 + Google Directions へのフォールバック実装（emergency switch） |
| MapLibre Native の React Native 0.74+ 対応が不安定 | ビルド失敗 | Phase 1 着手前に最新リリースの動作確認 PR を打つ |
| OSM タイルの地図デザインが地味 | UX 劣化感 | OpenMapTiles のスタイル JSON をブランドカラーに合わせてカスタムビルド |
| Google からの法的請求（過去データ削除義務） | 法務リスク | 移行と同時に Google 由来データを `cache_purge` ジョブで削除 |

---

## 7. 未決事項（このドキュメント承認時に決める）

- [ ] Phase 1 のタイル配信を **MapTiler マネージド** で始めるか、最初から **PMTiles 自前** で始めるか
- [ ] OSRM のホスティング先（Hetzner / Sakura / さくらの VPS / Vultr）
- [ ] 国土地理院 API の利用クレジット表記の文言（「地図データ © OpenStreetMap contributors / 国土地理院」）
- [ ] `gps_traces` の保存粒度（毎秒 / 5 秒に 1 点 / 状態変化時のみ）と保存期間（90 日 / 1 年 / 無期限）
- [ ] プロアプリのバッテリー影響を受け入れる範囲（バックグラウンド位置情報の頻度）

---

## 8. 参考資料

- MapLibre Native: https://maplibre.org/
- PMTiles spec: https://github.com/protomaps/PMTiles
- OSRM backend: https://github.com/Project-OSRM/osrm-backend
- 国土地理院 地名検索 API: https://msearch.gsi.go.jp/
- Nominatim: https://nominatim.org/
- Google Maps Platform 利用規約 §3.2.4: https://cloud.google.com/maps-platform/terms
- Uber × Mapbox 移行事例: https://www.uber.com/blog/maps-data/
