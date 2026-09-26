---
title: "Codex任务分工如何设计：公开插件Task Routing"
description: "以Codex Task Routing为例，说明如何保留主任务设置、标识有效策略版本、交接有边界的工作并核实实际执行情况。"
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/codex-task-routing-design.webp
tags: ["技术", "AI", "开发"]
callout:
  type: note
  title: "已验证的范围"
  text: "已核对公开代码、合并的PR、三个操作系统上的CI及隔离环境中的安装测试。本文没有声称已量化质量或使用量改善，也没有声称在真实账号中验证过子模型运行。"
---

在Codex中并行处理多项工作时，选择模型只是其中一步。还需要确定哪些工作可以独立交付、交接哪些资料，以及如何验收结果。Acecore公开了[Codex Task Routing](https://github.com/acecore-systems/codex-task-routing)，将这些判断写成明确的策略。

## 常规工作由主任务负责

主任务负责通常的调查、实现和验证。只有专业环节的交接确实有价值时，才将有边界的工作交给其他负责人。插件保留用户为主任务选择的模型和推理设置，避免仅为换到同一模型而交接，也避免主任务没有独立工作时仍然并行。

交接不能只写“完成一篇文章”。应列明原始资料、范围、可用工具、验收条件，以及遇到无法确认的情况何时返回。主任务要检查关键差异和证据，而不只看结论。

## 区分策略与实际执行

插件在任务开始时展示有效策略及其哈希。覆盖设置不会暗中修改主任务设置；启动钩子本身不调用模型，也不发起网络请求。

配置中的模型名称不证明该模型实际运行。连接、执行和结果需要分别核实；无法取得的使用量应标记为缺失。普通Chat路径是可选项，无法确认可用性或权限时应停止。

## 检查结果的边界

[策略更新PR](https://github.com/acecore-systems/codex-task-routing/pull/13)记录了134项单元测试、Windows、Ubuntu、macOS的CI，以及隔离Codex目录中的安装、钩子、重装和卸载测试。[先前的PR](https://github.com/acecore-systems/codex-task-routing/pull/12)完善了Windows诊断和打包检查。

这些结果验证了发布包和配置路径，并不证明真实账号中的子模型运行、质量或使用量改善，也不证明普通Chat路径在所有主机上都可用。安装条件和步骤见[公开README](https://github.com/acecore-systems/codex-task-routing#readme)。
