# Vuddy Featuresカード枠線統一 設計

## 目的

`pages/service-introduction-materials/vuddy/index.html` のFeaturesセクションにある4枚のカードを、参照画像と同じ統一された枠線表現にする。

## 対象

- Featuresセクションの `.feature-card` 4枚のみ
- 他セクションのカードや共通アクセントスタイルは変更しない

## 表示仕様

- 4枚すべての枠線を `var(--vuddy-line)` の1px実線に統一する
- `.accent`、`.accent-blue`、`.accent-coral`、`.accent-yellow` による色付き上枠を、このセクション内に限って無効化する
- 既存の角丸、背景色、ミント系オフセット影、カード高さ、余白、文言は維持する

## 実装方針

`.profile-feature-layout .feature-card` にスコープしたCSSで上枠を通常の1px枠へ上書きする。HTMLのクラス構造や共通アクセント定義には手を加えず、影響範囲をFeaturesセクションへ限定する。

## 確認項目

- 4枚すべての上枠を含む全辺が同じ太さ・色で表示される
- 各カードの右下に既存のミント系影が残る
- カードの高さ、配置、文言、内部余白に変化がない
- 他スライドのアクセント付きカードに変化がない
