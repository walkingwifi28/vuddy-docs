# Recruit Vuddy Profile Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recruit Vuddyの3章をBefore / Afterへ統合し、Profile Vuddyと同一CSS・フォント・iframe構造へ揃える。

**Architecture:** Recruit固有の本文は維持しながら、Benefits・Comparison・Exampleを4カードへ再構成する。CSSはProfileのstyleブロックを完全コピーし、独自デモDOMをProfileと同じiframe構造へ置換する。

**Tech Stack:** HTML、CSS、Reveal.js、Node.js test runner

## Task 1: 回帰テストを追加

**Files:**
- Create: `scripts/test-recruit-vuddy-presentation.mjs`

1. 15スライド、Before / Afterの4カード、BIZ UDPゴシック、Profile CSS完全一致、iframe化を検証するテストを書く。
2. `node --test scripts/test-recruit-vuddy-presentation.mjs`を実行し、期待どおり失敗することを確認する。

## Task 2: Recruitプレゼンテーションを更新

**Files:**
- Modify: `pages/service-guide/recruit-vuddy/index.html`

1. Benefits・Comparison・Exampleを1章へ統合する。
2. 情報提供・興味把握・改善材料・次の行動の4カードへRecruit向け文言を配置する。
3. Recruit独自デモDOMをProfileと同じiframe構造へ置換する。
4. styleブロックをProfileのCSSへ完全置換する。
5. Google FontsのBIZ UDPゴシック読み込みをProfileと一致させる。

## Task 3: 検証

**Files:**
- Verify: `pages/service-guide/recruit-vuddy/index.html`
- Verify: `scripts/test-recruit-vuddy-presentation.mjs`

1. 専用テストを実行する。
2. `git diff --check`を実行する。
3. DOM構造、CSS一致、iframe、15スライドを確認する。
