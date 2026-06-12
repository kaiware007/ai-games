# Fantasy Tower Defense — 仕様書

## 概要
ファンタジー風のタワーディフェンスゲーム。敵がマップ上の決まった経路を進んでくるので、プレイヤーはタワーを配置して敵を倒していく。全10ウェーブをクリアすれば勝利。

## 操作方法
- **PC**: マウスクリックでタワーを配置
- **スマホ**: タッチでタワーを配置
- 画面下部のタワー選択パネルからタワーを選んで、マップ上に配置

## 勝敗条件
- **勝利**: 全10ウェーブをクリア
- **ゲームオーバー**: ライフが0になる（敵がゴールに到達するとライフ-1）

## 技術構成
- エンジン: JavaScript (HTML5 Canvas)
- ライブラリ: なし（素のCanvas API）
- ファイル構成:
  - js/input.js: InputManager — キーボード・タッチ入力
  - js/path.js: PathManager — 敵の移動経路
  - js/enemy.js: Enemy — 敵キャラクター
  - js/enemy_manager.js: EnemyManager — 敵の管理
  - js/tower.js: Tower — タワー
  - js/tower_manager.js: TowerManager — タワーの管理
  - js/wave.js: WaveManager — ウェーブ管理
  - js/hud.js: HUD — UI描画
  - js/game.js: Game — メインループ・状態管理

## 詳細仕様
各要素の詳細ルール・API は `components/` フォルダの各仕様書を参照すること:
- 入力 → `components/input.spec.md`
- 経路 → `components/path.spec.md`
- 敵 → `components/enemy.spec.md`
- タワー → `components/tower.spec.md`
- ウェーブ → `components/wave.spec.md`
- HUD → `components/hud.spec.md`
- ゲーム → `components/game.spec.md`

## 更新履歴
| 日付 | 変更内容 |
|------|---------|
| 2026-06-12 | 初版作成 |
