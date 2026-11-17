---
title: "分别减少GitHub Actions重复运行和Gradle构建时间"
description: "重新审视push和PR中重复的CI触发条件，并在同一提交上比较Android的Gradle缓存。整理决策条件和实测结果的局限。"
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-performance-tuning-cover-v2.webp
tags: ["GitHub Actions", "Android", "运维"]
---

如果Android CI每次都重复相同的处理，那么将缓存恢复所需时间也纳入比较，可以为是否引入缓存提供决策依据。本文通过DaysChat Android作业在同一提交上的测试，介绍如何确认速度和可复现性。

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-gradle">
  <figcaption><strong id="diagram-gradle">在相同输入下比较缓存</strong><span>将保存和恢复的开销纳入考量，观察整个作业。</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>首次运行</strong><span>创建缓存并记录保存时间。</span></li>
    <li><strong>重新运行同一提交</strong><span>确认恢复时间和复用的任务。</span></li>
    <li><strong>验证产物</strong><span>确认目标架构和APK生成。</span></li>
  </ol>
</figure>

## 避免在push和PR中重复进行相同验证

在另一个会议记录系统中，向工作分支push和创建PR都会触发常规CI和Rust parity。我们将push触发范围限定为main，保留PR验证，并允许在创建PR前需要确认时手动运行。生产发布的触发条件没有改变。

内部调查显示，11月有97次push触发的运行对应的PR侧运行也成功，Linux运行器的总运行时间为342分钟。这是用于调查重复运行的执行时间，并非变更后实际节省的时间或费用。在缩小触发范围之前，需要确认如何验证没有PR的变更，以及是否会影响必需检查和发布。可以在[GitHub Actions事件](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)中查看push和pull_request的触发条件。

## 作业内的实测结果和条件

根据内部变更记录中保留的同一提交比较，Android作业首次运行耗时16分20秒，包含恢复过程的重新运行耗时6分16秒。复用了194个Gradle任务，x86_64和arm64-v8a的检查以及APK生成也均通过。首次保存耗时34秒，重新运行时恢复耗时62秒，测试缓存大小约为1.81 GB。

| 观测项目    | 首次运行 | 重新运行 |
| ----------- | -------- | -------- |
| Android作业 | 16分20秒 | 6分16秒  |
| 缓存操作    | 保存34秒 | 恢复62秒 |

这1组是使用PR专用缓存测得的示例。最终配置中，只有main会保存共享缓存，PR则以只读方式恢复缓存。我们并未测量最终配置下所有PR是否都能获得相同的时间缩短，也未测量费用是否会减少。运行环境和缓存命中率也会影响结果。

## 确定复用条件和安全的保存方式

[Gradle构建缓存](https://docs.gradle.org/current/userguide/build_cache.html)根据任务的输入和输出判断是否可以复用。如果任务的输入声明不准确，就可能导致使用旧输出，因此首先要比较干净运行的过程、产物和测试结果。还要确认依赖关系或构建设置发生变更时，缓存是否会按预期失效。

限制能够保存缓存的执行主体，确保不受信任的变更无法更新共享缓存。[GitHub Actions依赖关系缓存](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching)有访问范围和使用注意事项。不要将缓存用作存储敏感信息的场所，应同时观测缓存大小、保存和恢复时间以及作业总耗时。

首先将范围限定在1个作业，记录同一提交首次运行和重新运行的产物与耗时。即使观察到耗时缩短，也要另行确认在不同变更或缓存缺失时仍能正常构建。确认日期：2026年11月17日。
