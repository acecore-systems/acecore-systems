---
title: "複数サイトのAI案内を共通Workerと逐次表示へ移した記録"
description: "公開サイトのAI案内を共通の処理基盤へ接続し、回答を逐次表示するまでの設計と公開画面での確認をまとめます。"
date: 2026-09-25T12:00
author: gui
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80
tags: ["技術", "AI", "Cloudflare", "Webサイト"]
---

Acecoreの公開サイトでは、訪問者が目的に合うページや相談先を探せるようAI案内を用意しています。2026年8月には、Acecoreと専門サイトの案内を共通の処理基盤へ接続し、回答が完成するまで待たずに文章を順に表示する構成へ進めました。

## サイトごとの入口と共通の処理を分ける

各サイトの画面は、その事業に合った質問例と案内先を持ちます。Acecore Systemsの画面では、開発、運用、料金、相談の流れを尋ねられます。画面からの要求は同じサイトのAPIを通し、サーバー側で共通Workerへ渡します。Aceserverのアルファ君は別の共有基盤を使い、ポータルとWikiで会話の体験を揃えています。

## 途中の文章と確定した回答を分ける

逐次表示にはSSEを使います。生成途中の文字は同じ吹き出しにプレーンテキストとして追加し、完了後にだけリンクを検証した表示へ切り替えます。途中の未確定な文字列をそのままHTMLとして扱わないための設計です。固定のJSON応答も受けられるようにし、切替時の互換性を維持しました。

## 公開情報から相談先へ

Systemsの本番画面では、公開情報を使って相談先を案内するAIウィジェットと応答を確認しました。画面には個人情報や機密情報を入力しないよう案内があり、回答から問い合わせページへ進めます。料金や契約条件はAI回答だけで決めず、正規ページと担当者の確認につなげる設計です。

旧構成を扱った[問い合わせAIチャットの設計記事](/insights/astro-ai-contact-chat/)は、2026年6月時点の実装記録です。今回の変更は、[Acecoreの逐次表示](https://github.com/acecore-systems/acecore-net/pull/240)、[Systemsの共通Worker接続](https://github.com/acecore-systems/acecore-systems/pull/58)、[Aceserverポータル](https://github.com/acecore-systems/aceserver-portal/pull/111)と[Wiki](https://github.com/acecore-systems/aceserver-wiki/pull/81)の更新を参照できます。
