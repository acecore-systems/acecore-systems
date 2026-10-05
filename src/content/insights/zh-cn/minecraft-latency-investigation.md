---
title: "排查 Minecraft 卡顿：静默采集指标与共享存储定位"
description: "从安静地采集 TPS/MSPT，到对照 JFR 与操作系统 I/O 观测。本文区分已经完成的原因调查与尚未验证的性能改进。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: "/images/insights/minecraft-latency-investigation.webp"
tags: ["Minecraft", "Monitoring", "Performance"]
callout:
  type: note
  title: "区分原因调查与改进效果"
  text: "持续监测和保存等待原因调查已经完成。迁移到其他存储以及性能对比尚未进行；调查没有证明部件故障，也没有证明所有玩家的卡顿都已消失。"
---

Minecraft 卡顿可能来自服务器 tick 处理、短暂保存停顿、网络或客户端渲染等不同环节。本文匿名介绍对多台 Paper 服务器的调查，不公开内部主机名和配置。

## 分别测量平均值与短暂停顿

记录 TPS、MSPT 的平均值、最大值和 p95，以及慢 tick 的累计次数。平均值良好也可能掩盖短暂停顿。仅看主机整体 CPU 使用率，无法区分单线程处理与 I/O 等待。

## 安静采集，同时记录缺失数据

本案例中，一个小型插件通过 Paper 公共 API 获取测量值并写入本地 JSON，再由采集器汇总为监控时间序列。文件 I/O 在游戏主线程之外执行；先写临时文件再替换，避免读取到未写完的内容。这并不是隐藏普通控制台日志。

同时检查数据时间戳和采集是否成功。采集器停止后留下的旧值不能算作正常，也不要把缺失数据替换成 TPS 零。

## 对照有界采样中的 JVM、OS 与保存处理

问题复现时，JFR、操作系统等待观测和块 I/O 分别在有限时长的窗口内采集。再将这些观测与连续 MSPT 数据和周期性 I/O 压力对照，以区分 GC 活动和同步保存期间的等待。所有采样并非同时进行。一般性的 Paper 分析入口可参考[官方 spark 性能分析指南](https://docs.papermc.io/paper/profiling/)。本案例为深入调查保存期间的等待，补充使用了 JFR 和 OS 观测。

在正常的 240 秒观测窗口与停滞的 220 秒窗口中，逐秒 write-await 中位数分别为 1.60 ms 和 43.71 ms；最大值分别为 6.00 ms 和 123.57 ms。这是两个观测窗口的比较，不是措施实施前后的改善结果，也不是通用基准测试。

除同步保存与文件系统 journal 等待外，多个应用发出的设备请求也出现延迟，因此将原因候选缩小到共享存储路径。[Linux 块 tracepoint](https://www.kernel.org/doc/html/latest/core-api/tracepoint.html) 的完成事件可能只代表请求的一部分，因此没有把无法对应的请求混入全部 I/O 的统计。采集时长和数据量均有限，并考虑了测量本身的开销。

## 将后续工作作为独立测试

调查结束后停止了限时跟踪，并确认常态采集正常。迁移存储后，在相近使用条件下对多个周期进行比较的测试尚未进行。本文为后续工作记录调查结果，并要求准备备份、恢复和回滚方案；没有降低保存耐久性，也没有在缺少证据时将原因归咎于 GC 或某个插件。

关于监控信号与故障诊断的区别，另见[OpenClaw 监控与故障调查](/insights/openclaw-monitoring-investigation/)；恢复测试见[R2 与 restic 备份监控](/insights/restic-r2-backup-verification/)。
