---
title: "Dynmapを512pxタイルへ移行する手順：公開検証とR2の旧画像整理"
description: "Dynmapの512pxタイル移行で、描画範囲、通常・ズーム画像、R2の保存先をどう検証するか。8サーバー・89マップの実例から、削除前の確認と費用比較の条件を説明します。"
date: "2026-09-27T22:40:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/dynmap-512-migration.webp
tags: ["技術", "Cloudflare"]
callout:
  type: note
  title: "確認できた範囲"
  text: "2026年9月11日の本番監査で移行と旧画像削除を確認しました。請求額と、通常運転時の費用削減率は確認できていません。"
---

Dynmapの地図画像をCloudflare R2から配信する構成で、画像形式の切替と旧データの整理を行いました。対象は8サーバー・89マップです。作業の中心は、画像を作り直すことよりも、新しい画像の公開を確かめてから旧画像を消す順序にありました。

## Dynmapタイル移行で最初に比べる条件

512pxタイルへの移行を検討するなら、同じ描画範囲で通常画像とズーム画像を比べ、閲覧時の取得数と描画中の書込み数を分けて記録します。旧prefixは候補一覧を作る段階に留め、新画像の表示と再描画による復元方法を確認してから削除を判断してください。

[R2：容量・操作数の測り方](https://developers.cloudflare.com/r2/platform/metrics-analytics/)

## 描画範囲を決めて段階的に切り替える

正式マップを512pxタイルに統一しました。追加描画が必要な21件は、公開中心から半径2,000ブロックに範囲を区切りました。世界全域の描画完了を待つ設計にはせず、通常更新を続けながら切り替えています。

R2通信に失敗したときの再試行、書き込み失敗時の更新保持、ズーム画像で「存在しない」と「読み取り障害」を区別する処理も見直しました。再起動後にズーム更新を再開できるようにした修正は、[Dynmap forkのPR #9](https://github.com/acecore-systems/dynmap/pull/9)に記録しています。Cloudflare側の障害そのものがなくなるという意味ではありません。

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-dynmap-512-migration">
  <figcaption>
    <strong id="diagram-dynmap-512-migration">新画像の検証が終わってから旧データを整理する</strong>
    <span>公開表示と保存先を監査してから整理します。旧画像にバックアップはなく、通常運転時の費用削減も未確認です。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M3 5l9-3 9 3v14l-9 3-9-3z M12 2v20 M3 5l9 3 9-3 M3 12l9 3 9-3"/>
        </svg>
      </span>
      <strong>範囲を決め新形式を生成</strong>
      <span>512px対象と描画範囲を決め、通常の更新を続けながら新形式の画像を段階的に生成して公開する。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z M16 16l5 5"/>
        </svg>
      </span>
      <strong>公開画像と保存先を監査</strong>
      <span>通常・ズーム画像、Web資材とlive JSON、正式な保存先prefixをそれぞれ確認して公開と保存を監査する。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 7h16 M9 7V4h6v3 M7 7l1 14h8l1-14"/>
        </svg>
      </span>
      <strong>監査後に旧データを整理</strong>
      <span>監査後に旧画像/hashを整理する。旧画像はbackupに無く、必要ならworldから再描画する必要がある。</span>
    </li>
  </ol>
</figure>

## 公開表示と保存先を別々に検証する

切替後は、公開設定の89マップに対して通常画像とズーム画像を各1枚、計178枚確認しました。画像が512pxであることに加え、Web資材とライブJSONの更新も点検しています。R2側では正式な画像prefixと保存先が一致するかを監査し、旧通常・day画像の192prefixが空であることを確認しました。

最後に旧画像と旧hashファイル、計11,707,356オブジェクト・約51.71GBを削除しました。旧画像の内容はバックアップしていないため、必要になればワールドから再描画する必要があります。現行画像、world、設定とJARのバックアップは保持しています。削除の成否は処理終了だけで判断せず、最終監査で旧画像・stage・旧hashファイルが残っていないことを確認しました。

## 容量と請求額を混同しない

移行作業を含む連続する24時間を比べると、成功したPutObjectは240,835回から90,423回に減りました。ただし、両期間とも移行中であり、通常運転時の削減率や月額料金の差を示す数字ではありません。請求額も未確認です。

同様の移行では、[R2の操作数と容量の指標](https://developers.cloudflare.com/r2/platform/metrics-analytics/)を別々に見て、公開表示、現行画像、旧データの有無を順に確かめることが重要です。削除は最後に行い、対象と復元方法を先に決めておく必要があります。
