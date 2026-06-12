# WaveManager 仕様

## 責務
ウェーブの進行管理。敵のスポーンタイミング・ウェーブ進行。

## ウェーブ構成（10ウェーブ）
各ウェーブは複数のバッチで構成。バッチ={type, count, interval, delay}
- スライム: HP40, 速度80, 報酬10
- ゴーレム: HP120, 速度40, 報酬15
- ウィザード: HP60, 速度60, 報酬12
- ボス: HP500, 速度30, 報酬100

## 公開 API
- `constructor(enemyManager)`
- `startNextWave()` — 次のウェーブを開始
- `update(dt)` — スポーンタイマー更新
- `isWaveActive()` — ウェーブ進行中か
- `getCurrentWave()` — 現在ウェーブ番号
- `getTotalWaves()` — 総ウェーブ数
- `isAllWavesDone()` — 全ウェーブ完了か

## 依存コンポーネント
- `./enemy_manager.js` の `EnemyManager` — 敵スポーン
