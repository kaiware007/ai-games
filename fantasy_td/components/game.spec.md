# Game 仕様

## 責務
メインループ・状態管理・シーン遷移（title/playing/gameover/win）

## ゲームパラメータ
- 初期ゴールド: 500
- 初期ライフ: 20
- 総ウェーブ数: 10

## 公開 API
- `constructor(canvas)`
- `init()` — 初期化
- `start()` — ゲーム開始（requestAnimationFrameループ）
- `update(dt)` — 1フレームの更新
- `draw()` — 描画
- `handleClick(x, y)` — クリック処理
- `gameOver()` — ゲームオーバー状態
- `gameWin()` — 勝利状態
- `restart()` — リスタート

## 依存コンポーネント
- InputManager, PathManager, EnemyManager, TowerManager, WaveManager, HUD
