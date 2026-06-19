# Learning Vuddy Profile Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Learning Vuddyの3章をBefore / Afterへ統合し、Profile Vuddyと同一CSS・フォント・iframe構造へ揃える。

**Architecture:** Learning固有の本文を維持しながら、Benefits・Comparison・Exampleを4カードへ再構成する。CSSはProfileのstyleブロックを完全コピーし、独自デモDOMをProfileと同じiframe構造へ置換する。

**Tech Stack:** HTML、CSS、Reveal.js、Node.js test runner

## Task 1: 回帰テストを追加

**Files:**
- Create: `scripts/test-learning-vuddy-presentation.mjs`

1. 15スライド、Before / Afterの4カード、BIZ UDPゴシック、Profile CSS完全一致、iframe化を検証する。
2. テストを実行し、変更前に失敗することを確認する。

## Task 2: Learningプレゼンテーションを更新

**Files:**
- Modify: `pages/service-guide/learning-vuddy/index.html`

1. Benefits・Comparison・Exampleを1章へ統合する。
2. 情報提供・興味把握・改善材料・次の行動の4カードへLearning向け文言を配置する。
3. Learning独自デモDOMをProfileと同じiframe構造へ置換する。
4. styleブロックとGoogle Fonts設定をProfileと一致させる。

## Task 3: 検証

1. 専用テストを実行する。
2. `git diff --check`を実行する。
3. CSS、DOM、iframe、15スライドを確認する。
