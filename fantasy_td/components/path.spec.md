# PathManager 仕様

## 責務
敵が移動する経路を管理。ウェイポイント配列から距離ベースの位置計算。

## 公開 API
- `constructor(waypoints)` — ウェイポイント[{x,y}]で初期化
- `getPointAtDistance(distance)` — 経路上の距離に対応する{x,y}を返す
- `getTotalLength()` — 経路の全長を返す
- `draw(ctx)` — 経路を描画

## 依存コンポーネント
なし
