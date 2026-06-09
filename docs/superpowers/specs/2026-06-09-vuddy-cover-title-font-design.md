# Vuddy Cover Title Font Design

## Goal

表紙の「Vuddy サービス紹介資料」に、ほかのスライドと同じフォントファミリーを明示する。

## Design

`.cover-title` に既存の共通フォントスタック
`"Vuddy Noto Sans JP", "Noto Sans JP", sans-serif` を追加する。
`font-size: 34px` と `font-weight: 500` は変更しない。

既存の表紙レイアウトテストに、フォントファミリー、サイズ、太さの静的な回帰条件を追加する。
