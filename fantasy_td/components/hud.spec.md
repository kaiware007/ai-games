# HUD 仕様

## 責務
ゴールド・ライフ・ウェーブ情報の描画。タワー選択パネルの描画。

## 公開 API
- `constructor(width, height)`
- `draw(ctx, gameState)` — ゲーム情報描画（gold, lives, wave）
- `drawTowerPanel(ctx, selectedTower)` — 下部タワー選択パネル
- `handleTowerSelect(type)` — タワー選択

## 依存コンポーネント
なし
