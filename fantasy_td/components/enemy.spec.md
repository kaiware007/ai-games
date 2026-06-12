# Enemy 仕様

## 責務
敵キャラクターの移動・状態管理（HP、スロー、ポイズン効果）

## ゲームルール
- 敵は経路に沿って移動
- HPが0になると破壊（ゴールド報酬）
- ゴールに到達するとライフ-1
- スロー効果: 速度を一定時間減少
- ポイズン効果: 時間経過でダメージ

## 公開 API
- `constructor(path, hp, speed, reward, type)`
- `update(dt)` — 移動・効果の更新
- `draw(ctx)` — 描画
- `takeDamage(amount)` — ダメージを受ける
- `applySlow(factor, duration)` — スロー効果
- `applyPoison(damage, duration)` — ポイズン効果
- `isDead()` — 死亡判定
- `isReachedEnd()` — ゴール到達判定

## 依存コンポーネント
- `./path.js` の `PathManager` — 経路位置計算
