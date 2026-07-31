---
title: "Cloudflare VectorizeとRAG入門：検索とAI回答の違いを理解する"
description: "Cloudflare Vectorizeを使った意味検索とRAGの役割を、検索・根拠・AI回答の違いから短く説明します。"
date: 2026-07-31T12:00
author: gui
tags: ["技術", "Cloudflare", "Vectorize", "RAG", "サイト内検索"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: "RAGは「検索してから答える」仕組み"
  text: "Vectorizeは意味が近い公開情報を探す役、RAGは選んだ情報を根拠としてAIが回答を組み立てる役です。VectorizeだけでもRAGでも、回答するAIだけでもRAGではありません。"
processFigure:
  eyebrow: RAGの基本
  title: "質問を根拠付きの回答へつなぐ4段階"
  description: "検索結果をそのまま答えにせず、元の公開ページを取り出してから回答の根拠にします。"
  variant: inline
  steps:
    - title: 公開情報を整える
      description: "利用者に見せてよいページだけを検索対象にする。"
      icon: i-lucide-file-check-2
      accent: slate
    - title: 質問を意味で探す
      description: "質問をembeddingへ変換し、Vectorizeで近い情報を探す。"
      icon: i-lucide-search
      accent: brand
    - title: 根拠を絞る
      description: "元ページ、URL、更新状態を確認して回答に使う情報だけを選ぶ。"
      icon: i-lucide-list-checks
      accent: amber
    - title: 答えるか、保留する
      description: "根拠が足りるときだけAIが回答し、足りなければ確認できないと伝える。"
      icon: i-lucide-message-square-text
      accent: emerald
linkCards:
  - href: /insights/cloudflare-vectorize-safe-implementation/
    title: Vectorizeを安全に実装する詳細ガイド
    description: "公開HTMLのcorpus化、差分同期、Preview／Production分離、API境界を実装するときに読む記事です。"
    icon: i-lucide-wrench
  - href: https://developers.cloudflare.com/vectorize/
    title: Cloudflare Vectorize公式ドキュメント
    description: "Vectorizeの用途、embedding、検索の公式仕様を確認できます。"
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/
    title: CloudflareによるRAGとベクトルDBの解説
    description: "検索結果をLLMの追加コンテキストとして使うRAGの流れを確認できます。"
    icon: i-lucide-network
---

## まずRAGとは

RAGは **Retrieval Augmented Generation** の略です。日本語では「検索で取り出した情報を補って、AIが回答を生成する仕組み」と考えると分かりやすくなります。

たとえると、Vectorizeは意味が近い資料を見つける司書の検索棚です。RAGは、その棚から見つけた資料を読んで出典を添えながら答える司書の仕事全体です。

つまり、AIへ質問をそのまま送るのではなく、先に自分の公開情報から関連資料を探し、その資料を追加コンテキストとして渡します。Cloudflareも、ベクトル検索で得たコンテキストをLLMへのpromptに加える使い方をRAGとして説明しています。[Cloudflare公式解説](https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/)

## VectorizeとRAGの役割は違う

| 部品      | 担当すること                   | それだけでできること                       |
| --------- | ------------------------------ | ------------------------------------------ |
| Pagefind  | ページ内の単語を探す           | 製品名、固有名詞、エラーコードを素早く探す |
| Vectorize | 意味が近い情報を探す           | 言い換えや関連ページを候補として返す       |
| RAG       | 検索結果を根拠にAIが回答を作る | 回答と、参照したページのURLを返す          |

Vectorizeは回答を生成しません。RAGは検索だけでもありません。検索、根拠の選別、回答生成、出典表示までを一つの契約として設計して初めて、利用者が答えを確かめられます。

## どこから始めるか

最初からチャットボットを作る必要はありません。次の順番が分かりやすく、安全です。

1. Pagefindを通常検索として残す。
2. Vectorizeで「関連するページを探す」機能を追加し、検索品質を評価する。
3. 根拠に使うページ、URL表示、情報不足時の扱いを決める。
4. その条件を満たせる場合だけ、RAGでAI回答を追加する。

この順番なら、AI回答の見栄えより先に、検索対象そのものが正しいかを確かめられます。

## RAGで先に決める4つのこと

| 決めること   | はじめやすい選択                           | 理由                                       |
| ------------ | ------------------------------------------ | ------------------------------------------ |
| 質問の対象   | 公開サイトの説明だけ                       | 社内情報や下書きを誤って答えに使わない     |
| 根拠の表示   | 回答ごとに元ページへリンク                 | 利用者が回答を確認できる                   |
| 情報不足時   | 「確認できません」と伝える                 | もっともらしい推測を避ける                 |
| 検索との分離 | 入力中はPagefind、明示操作でVectorize／RAG | 送信範囲、費用、待ち時間を分かりやすくする |

RAGは誤答をゼロにする技術ではありません。検索対象の選び方、根拠の確認、回答できない条件を明示することが品質を決めます。

## 実装詳細は別記事で読む

このページは「何のために使うか」を理解する入門です。公開HTMLからのcorpus作成、content hash、差分同期、Preview／Production分離、rate limitは、[Vectorizeを安全に実装する詳細ガイド](/insights/cloudflare-vectorize-safe-implementation/)に分けています。
