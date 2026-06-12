# InputManager 仕様

## 責務
マウス・タッチ入力を管理する。ポインタ位置・クリック状態を追跡。

## 公開 API
- `constructor(canvas)` — キャンバスにイベントリスナーをセット
- `getPointerPos()` — 現在のポインタ位置 {x, y} を返す
- `isMouseDown()` — マウス/タッチが押されているか
- `handleClick(x, y)` — クリック処理をゲームに通知
- `update()` — 状態のリセット

## 依存コンポーネント
なし
