# 剁手辅助

剁手辅助是一个 local-first 的消费辅助网站，目标只有两件事：

- 帮你判断这个月还能花多少
- 帮你判断这笔钱现在该不该花

这是一个零后端单机版网站：

- 不做登录
- 不做云同步
- 不做服务端 API
- 核心数据只保存在浏览器本地 IndexedDB
- 最终部署目标是 GitHub Pages
- 构建方式是静态导出

## 已完成功能

- 首页预算总览、分类统计、奶茶额度、最近记录、快速操作
- 账本页完整 CRUD：新增、编辑、删除、分类筛选、按月查看
- 决策页金额输入、分类选择、建议结果与依据展示
- 设置页预算模式、预算值、奶茶额度、手动加杯、主题模式、动效等级
- JSON 导出 / 导入
- 清空本地数据
- GitHub Pages 静态导出
- GitHub Actions 自动部署工作流

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui 风格基础组件
- Motion for React `motion/react`
- Dexie + IndexedDB
- Zustand
- Zod
- date-fns

## 本地运行

1. 安装依赖

```bash
pnpm install
```

2. 启动开发环境

```bash
pnpm dev
```

3. 浏览器打开

```text
http://localhost:3000
```

## 常用命令

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

说明：

- `pnpm typecheck` 会先执行 `next typegen` 再做 TypeScript 检查
- `pnpm build` 会生成可部署到 GitHub Pages 的静态导出产物
- 导出目录是 `out/`

## 本地数据说明

本项目的业务数据分两层保存：

- `IndexedDB`：账本记录、月预算、奶茶额度、奖励记录、应用设置
- `localStorage`：当前没有保存核心业务数据，只用于浏览器侧轻量状态时可以扩展

当前不会自动注入 demo 数据。首次打开是空白可用状态。

## 预算模式说明

- `固定预算`
  当前设置的预算会作为默认值用于后续新月份

- `每月手动`
  新月份默认预算从 `0` 开始，需要你在设置页自己输入本月预算

## 备份与恢复

### 导出 JSON

进入设置页，点击 `导出 JSON`：

- 会导出完整业务数据
- 文件包含 schemaVersion、账本、预算、奶茶额度、奖励记录和设置

### 导入 JSON

进入设置页，点击 `导入 JSON`：

- 导入前会先做 Zod schema 校验
- 导入是覆盖当前本地数据，不是合并
- 导入完成后页面会立即刷新为新数据状态

### 清空数据

进入设置页，点击 `清空本地数据`：

- 会删除当前浏览器中的全部业务数据
- 删除后不会自动恢复
- 系统会重新建立空白设置、预算和奶茶额度结构，但不会生成 demo 账单

## GitHub Pages 部署

工作流文件已提供在 [deploy-pages.yml](./.github/workflows/deploy-pages.yml)。

### 启用方式

1. 把代码推送到默认分支，例如 `main`
2. 打开仓库 `Settings`
3. 进入 `Pages`
4. 在 `Build and deployment` 中把 `Source` 设为 `GitHub Actions`
5. 后续每次 push 到 `main` 会自动构建并部署

### 工作流做了什么

- 安装 pnpm 和 Node.js
- 安装依赖并缓存
- 执行 Next.js 静态构建
- 上传 `out/` 目录为 Pages artifact
- 发布到 GitHub Pages

## 自定义域名

当前仓库已经预置了 [CNAME](./public/CNAME)：

```text
www.255654.xyz
```

这意味着：

- 构建时如果检测到 `public/CNAME` 存在，会自动关闭仓库子路径 `basePath`
- 自定义域名场景会直接从站点根路径 `/` 提供资源
- 如果未来改回纯仓库域名部署，只要移除 `public/CNAME`，构建会恢复自动 `/<repo>` 路径

### `www.255654.xyz` 的 DNS

- `CNAME`
- 主机记录：`www`
- 目标值：`sikuai2333.github.io`

### 如果还要支持裸域 `255654.xyz`

为 `@` 添加：

- `A` -> `185.199.108.153`
- `A` -> `185.199.109.153`
- `A` -> `185.199.110.153`
- `A` -> `185.199.111.153`
- `AAAA` -> `2606:50c0:8000::153`
- `AAAA` -> `2606:50c0:8001::153`
- `AAAA` -> `2606:50c0:8002::153`
- `AAAA` -> `2606:50c0:8003::153`

### GitHub Pages 设置

1. 打开仓库 `Settings -> Pages`
2. `Custom domain` 设为 `www.255654.xyz`
3. 等 DNS 生效后，勾上 `Enforce HTTPS`

## 仓库路径和 `basePath` 说明

项目已经在 [next.config.ts](./next.config.ts) 中处理了两种 GitHub Pages 地址：

- 用户主页站点：`https://<user>.github.io/`
- 仓库站点：`https://<user>.github.io/<repo>/`
- 自定义域名站点：`https://www.255654.xyz/`

当前策略：

- GitHub Actions 环境下会自动读取 `GITHUB_REPOSITORY`
- 如果存在 `public/CNAME`，则优先按自定义域名根路径构建，不使用 `basePath`
- 如果仓库名不是 `<user>.github.io` 且没有自定义域名，则自动设置 `basePath` 为 `/<repo>`
- 本地如果要预览仓库子路径效果，可以手动设置 `NEXT_PUBLIC_BASE_PATH`

PowerShell 示例：

```powershell
$env:NEXT_PUBLIC_BASE_PATH = "/消费助手"
pnpm build
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

## 静态导出约束

本项目遵守以下限制，保证 GitHub Pages 可用：

- 不使用 API routes
- 不依赖服务端数据库
- 不依赖登录和服务端会话
- 业务逻辑全部在客户端执行
- 所有页面都可静态导出

## 当前目录重点

```text
src/app                 页面入口
src/components          UI 与业务组件
src/db                  Dexie schema 与 repository
src/hooks               数据与偏好 hooks
src/lib                 日期、货币、决策、导入导出工具
.github/workflows       GitHub Pages 部署工作流
TASKS.md                当前开发清单
```

## 验收命令

以下命令应全部通过：

```bash
pnpm lint
pnpm typecheck
pnpm build
```
