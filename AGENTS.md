# 《剁手辅助》AGENTS.md（零后端单机版 / GitHub Pages / GitHub Actions / Codex 执行版 v3）

## 0. 本版强约束（必须遵守）

1. **这是网站，不是 Kotlin / 原生 App。**
2. **这是零后端单机版，MVP 不允许出现服务端 API、服务端数据库、登录注册、云同步。**
3. **最终部署目标是 GitHub Pages，通过 GitHub Actions 自动发布。**
4. **禁止部署到 Vercel。**
5. **必须兼容静态导出。所有业务逻辑默认放在客户端执行。**
6. **必须使用浏览器本地数据库。核心数据放 IndexedDB。**
7. **必须移动端优先。**
8. **必须有统一主题、明确 UI/UX 规范、适度动画过渡。**
9. **页面不能像后台模板，也不能是纯白模。**
10. **所有实现优先简单、稳定、可持续迭代，避免炫技和过度工程化。**

---

## 1. 项目目标

### 1.1 项目名称
剁手辅助

### 1.2 一句话定义
一个帮助用户判断“该不该花”和“这个月还能花多少”的本地优先消费辅助网站。

### 1.3 核心问题
本产品主要解决以下问题：
1. 手里有钱，但不舍得花。
2. 不知道本月该花多少、还能花多少。
3. 想记录支出，但不想使用复杂严肃的记账系统。
4. 希望在手机上快速记录、快速决策、快速获得情绪反馈。

### 1.4 目标用户
核心先服务单人用户，尤其是：
- 对消费有犹豫感的人
- 想控制预算但不想被复杂表单压垮的人
- 更愿意在手机浏览器里使用的人
- 希望产品有一点情绪价值和趣味感的人

---

## 2. 产品定位

### 2.1 产品不是
- 不是传统财务软件
- 不是复杂报表系统
- 不是多人协作账本
- 不是 SaaS 平台
- 不是必须联网才能使用的产品
- 不是“极简到没情绪”的理财工具

### 2.2 产品是
- 一个 **local-first** 的个人消费辅助工具
- 一个“预算 + 决策 + 轻娱乐”结合的网页应用
- 一个适合移动端、单手操作、快记录快反馈的产品
- 一个可以静态部署到 GitHub Pages 的网站
- 一个未来可增强为 PWA 的产品

### 2.3 MVP 核心价值
用户打开产品后，应在极短时间完成两件事：
1. 记录一笔支出
2. 判断一笔钱要不要花

---

## 3. 版本目标与边界

### 3.1 P0 必做功能
1. 月预算设置
2. 首页预算总览
3. 快速记账
4. 两类账本（生活必需 / 娱乐）
5. 本月已花 / 剩余可花统计
6. 剁手决策按钮
7. 奶茶额度模块
8. 本地持久化存储
9. JSON 导出 / 导入
10. GitHub Pages 静态部署适配
11. GitHub Actions 自动构建与发布
12. 基础动效与统一主题

### 3.2 P1 可增强功能
1. 历史月份切换
2. 月度复盘页
3. 更丰富的决策文案
4. 更丰富的 emoji / icon
5. PWA 安装提示
6. 更多奖励动作
7. 更强的动画细节

### 3.3 明确不做
1. 登录注册
2. 云同步
3. 图片上传
4. 长备注
5. 自动读账单
6. 第三方运动数据接入
7. 多人协作
8. 服务端数据库
9. 服务端 API
10. 支付、会员、广告系统
11. 企业后台管理系统

---

## 4. 技术选型（锁定，不随意切换）

### 4.1 固定技术栈
- **框架**：Next.js（App Router）
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **基础组件**：shadcn/ui
- **动画**：Motion for React（`motion/react`）
- **本地数据库**：Dexie（IndexedDB）
- **轻状态管理**：Zustand
- **表单校验**：Zod
- **日期处理**：date-fns
- **图标**：lucide-react
- **表格/图表**：非必须，MVP 不优先引入图表库
- **包管理器**：pnpm
- **测试**：Vitest + Testing Library（P1，可后补）

### 4.2 技术选型理由
1. Next.js 生态成熟，适合快速交付 Web 项目。
2. TypeScript 有利于长流程协作与后续维护。
3. Tailwind + shadcn/ui 能在保证统一设计的前提下快速产出 UI。
4. Motion for React 适合做自然、轻量、可控的过渡动画。
5. Dexie 适合本地优先产品，把核心数据稳定保存到浏览器端。
6. Zustand 足够轻，适合 UI 状态和少量会话状态。
7. 整套方案支持纯前端静态导出，方便 GitHub Pages 托管。

### 4.3 明确排除
- Kotlin
- React Native
- Flutter
- Firebase / Supabase 作为 MVP 前提
- Vercel 作为默认部署平台
- 依赖 Node 服务器的 SSR-only 方案

---

## 5. GitHub Pages 与静态导出策略（必须遵守）

### 5.1 部署目标
最终网站部署到 **GitHub Pages**。

### 5.2 发布方式
通过 **GitHub Actions** 自动构建并发布静态站点。

### 5.3 Next.js 必须满足的条件
1. 使用静态导出模式。
2. 不使用 API routes。
3. 不依赖服务端渲染取数。
4. 所有业务逻辑都可以在客户端执行。
5. 所有页面都必须能被静态导出。
6. 如果某个特性妨碍静态导出，优先删掉该特性或改为纯客户端方案。

### 5.4 GitHub Pages 路径兼容要求
必须考虑两种情况：
1. 用户名站点：`https://<user>.github.io/`
2. 仓库站点：`https://<user>.github.io/<repo>/`

因此需要：
- 支持根据仓库名配置 `basePath`
- 支持静态资源路径正确加载
- 提供清晰注释，方便后续修改仓库名

### 5.5 推荐 next.config.ts 约束
Codex 在实现时应优先满足下列目标：
- `output: 'export'`
- 如有图片组件需求，确保静态导出兼容
- 针对 GitHub Pages 仓库路径处理 `basePath`
- 避免使用必须依赖服务端运行时的能力

---

## 6. 数据存储方案

### 6.1 总体原则
本项目不是“没有数据库”，而是使用 **浏览器本地数据库**。

### 6.2 存储分层

#### A. IndexedDB（主数据库）
用于存储业务主数据：
- 账单记录
- 月预算设置
- 奶茶额度
- 奖励加杯记录
- 应用级业务配置

#### B. localStorage（轻量配置）
只存少量非核心配置：
- 首次引导是否完成
- 主题偏好
- 是否展示某些 UI 提示

#### C. JSON 导出 / 导入
必须实现：
- 导出全部业务数据为 JSON 文件
- 从 JSON 文件恢复数据
- 导入前执行 schema 校验

### 6.3 数据安全原则
- 核心数据默认只落在浏览器本地
- 不上传服务器
- 不要求账号
- 设置页中必须提供“导出备份”入口
- 删除数据前必须二次确认

---

## 7. 数据模型设计

### 7.1 类型定义

```ts
export type CategoryType = 'essential' | 'fun'
export type BudgetMode = 'fixed' | 'manual'
export type RewardType = 'exercise' | 'manual'
```

### 7.2 表：ledger_entries

```ts
export interface LedgerEntry {
  id: string
  amount: number
  category: CategoryType
  emoji: string
  createdAt: string
  monthKey: string
}
```

### 7.3 表：monthly_budget

```ts
export interface MonthlyBudget {
  id: string
  monthKey: string
  budget: number
  mode: BudgetMode
  createdAt: string
  updatedAt: string
}
```

### 7.4 表：milk_tea_quota

```ts
export interface MilkTeaQuota {
  id: string
  monthKey: string
  totalCups: number
  usedCups: number
  bonusCups: number
  updatedAt: string
}
```

### 7.5 表：reward_logs

```ts
export interface RewardLog {
  id: string
  monthKey: string
  type: RewardType
  amount: number
  emoji: string
  note?: string
  createdAt: string
}
```

### 7.6 表：app_settings

```ts
export interface AppSettings {
  id: string
  defaultBudgetMode: BudgetMode
  fixedBudgetValue?: number
  defaultMilkTeaCups: number
  onboardingDone: boolean
  themeMode: 'system' | 'light' | 'dark'
  motionLevel: 'full' | 'reduced'
  updatedAt: string
}
```

### 7.7 导出结构

```ts
export interface ExportPayload {
  schemaVersion: string
  exportedAt: string
  ledgerEntries: LedgerEntry[]
  monthlyBudgets: MonthlyBudget[]
  milkTeaQuotas: MilkTeaQuota[]
  rewardLogs: RewardLog[]
  appSettings: AppSettings[]
}
```

---

## 8. 目录结构建议

```bash
src/
  app/
    page.tsx
    ledger/page.tsx
    decision/page.tsx
    settings/page.tsx
    layout.tsx
    globals.css
  components/
    common/
    home/
    ledger/
    decision/
    settings/
    navigation/
    animation/
  db/
    index.ts
    schema.ts
    repositories/
  stores/
    app-store.ts
    ui-store.ts
  lib/
    date.ts
    currency.ts
    export-import.ts
    decision.ts
    theme.ts
    motion.ts
    utils.ts
  hooks/
  types/
  constants/
  styles/
public/
.github/
  workflows/
    deploy-pages.yml
```

---

## 9. 页面结构

首版采用 4 个一级页面：
1. 首页 `/`
2. 账本页 `/ledger`
3. 决策页 `/decision`
4. 设置页 `/settings`

推荐移动端底部导航：
- 首页
- 账本
- 决策
- 设置

---

## 10. 页面详细说明

### 10.1 首页 `/`

#### 页面目标
让用户一打开就知道：
- 本月还剩几天
- 本月还能花多少
- 哪类花销更高
- 奶茶还剩几杯
- 当前是否适合买东西

#### 首页模块
1. 顶部欢迎区
   - 当前月份
   - 一句轻量文案
2. 月度倒计时卡片
   - 本月剩余天数
   - 时间进度条
   - 颜色随月底临近变化
3. 预算总览卡片
   - 月预算
   - 本月已花
   - 本月剩余可花
4. 分类统计卡片
   - 生活必需
   - 娱乐
5. 奶茶额度卡片
   - 总杯数
   - 已使用
   - 剩余杯数
   - 快速“喝一杯”按钮
   - 快速“🚴 +1”按钮
6. 快速操作区
   - 记一笔
   - 帮我决定

#### 首页交互要求
- 首屏必须展示核心信息
- 两个主 CTA 明显突出
- 支持单手操作
- 卡片出现、数字变化、抽屉弹出应有轻量动画

### 10.2 账本页 `/ledger`

#### 页面目标
快速记录、查看和修改支出。

#### 默认分类
- 生活必需
- 娱乐

#### 页面模块
1. 分类切换 Tabs
2. 本月分类合计
3. 记录列表
4. 新增记录按钮
5. 编辑 / 删除操作

#### 新增记录交互
采用底部抽屉或弹层：
- 输入金额
- 选择分类
- 选择 emoji
- 点击保存

#### 设计原则
- 尽量点选
- 不要求长文本输入
- 一笔记录应在约 3 秒内完成

### 10.3 决策页 `/decision`

#### 页面目标
在用户纠结时，给出轻量建议。

#### 输入方式（MVP）
- 可选输入金额
- 可选选择分类
- 不要求复杂描述

#### 输出结果
给出以下三类建议之一：
- 可以买
- 再等等
- 今天先别买

#### 决策逻辑（首版）
根据以下因素组合给建议：
1. 用户是否输入金额
2. 金额是否超过剩余额度的某个比例
3. 当前分类是否花得偏多
4. 是否接近月底

#### 文案要求
不能机械冷硬，要有一点情绪价值。

示例：
- “可以买，但这个月娱乐额度会肉眼可见地变瘦。”
- “再等等，三天后你可能会更确定。”
- “今天先别买，你本月预算已经很努力了。”

### 10.4 设置页 `/settings`

#### 页面目标
完成所有基础规则配置。

#### 模块
1. 月预算设置
2. 预算模式切换（固定 / 每月手动输入）
3. 奶茶默认杯数设置
4. 奶茶手动加杯
5. 奖励动作记录
6. 数据导出
7. 数据导入
8. 清空本地数据
9. 动画等级设置（完整 / 降低）

#### 设置要求
- 所有设置项都要简单直白
- 不允许企业后台式复杂表单
- 每个设置块尽量使用独立卡片

---

## 11. 统一设计系统（必须落实）

### 11.1 品牌关键词
- 轻松
- 多巴胺
- 温和克制
- 有趣但不幼稚
- 情绪友好
- 轻陪伴感

### 11.2 设计原则
1. **先可读，再好看。**
2. **先统一，再丰富。**
3. **先移动端，再桌面端。**
4. **动画服务信息层级，不是为了炫。**
5. **每页只保留一个最强主动作。**
6. **色彩和 emoji 参与表达，但不能造成噪音。**

### 11.3 颜色策略
不要使用默认白底黑字后台风格。
建议采用：
- 主色：偏明亮、偏活力的暖色或果冻色
- 辅色：薄荷绿 / 天蓝 / 奶油黄 / 桃粉其中 2~3 个
- 中性色：带一点暖灰，不要死黑
- 危险色：保留但不刺眼

建议做成设计 token，例如：
- `--color-bg`
- `--color-surface`
- `--color-primary`
- `--color-accent`
- `--color-fun`
- `--color-essential`
- `--color-border-soft`
- `--color-text-main`
- `--color-text-muted`

### 11.4 圆角与边框
- 卡片圆角统一使用中大圆角
- 重要卡片可使用更大圆角
- 边框采用柔和线条，不要过粗
- 阴影轻，不要厚重悬浮感

### 11.5 字体层级
建议建立统一字号层级：
- Display：大数字、剩余金额
- H1：页面主标题
- H2：卡片标题
- Body：正文
- Caption：提示说明

### 11.6 Emoji 使用规范
emoji 必须用于信息表达，不是随机点缀。

推荐映射：
- 🥬 生活必需
- 💸 娱乐
- ☕ 奶茶额度
- 🚴 运动加杯
- ⏳ 月末倒计时
- 💡 决策建议

### 11.7 布局规范
- 页面最大宽度控制在移动端舒适阅读范围
- 使用卡片堆叠而不是复杂表格
- 页面留白要一致
- 不允许同页出现过多颜色抢焦点
- 顶部信息、核心卡片、CTA、底部导航要形成稳定节奏

---

## 12. 动画规范（必须实现，但保持克制）

### 12.1 动画目标
动画的作用是：
- 帮用户理解状态变化
- 强化操作反馈
- 让产品更有陪伴感
- 让转场更顺滑，而不是堆砌花哨效果

### 12.2 必做动画场景
1. 页面进入时的轻量淡入上移
2. 卡片加载或切换时的层级过渡
3. 底部抽屉 / 弹层的滑入滑出
4. 保存记录后的轻反馈动画
5. 奶茶喝一杯 / 加一杯时的数字变化反馈
6. 决策结果卡片的出现动画
7. Tabs 切换和底部导航高亮过渡

### 12.3 动画约束
- 时长以短中动效为主，不拖沓
- 默认优先使用淡入、位移、缩放、布局过渡
- 禁止大面积持续旋转、闪烁、粒子轰炸
- 不要让动画影响数据录入速度
- 必须支持 reduced motion 开关

### 12.4 Motion 实现建议
优先使用：
- `AnimatePresence`
- `layout`
- `layoutId`
- 局部 spring 动效
- 列表 stagger 适度使用

### 12.5 体验要求
用户应该感觉“顺滑、轻快、统一”，而不是“炫、乱、晕”。

---

## 13. UI / UX 规范

### 13.1 交互原则
1. 常用功能一步到达
2. 录入流程尽量不超过 1 个弹层
3. 所有高频操作可单手完成
4. 减少手动输入，优先选择器和快捷按钮
5. 出错提示简短明确
6. 删除操作必须二次确认

### 13.2 表单规范
- 金额输入为核心字段，必须突出
- 分类默认给快捷选择
- emoji 选择应轻量，不做复杂面板
- 设置页中的数字输入要给出默认值和说明

### 13.3 文案风格
- 友好
- 不说教
- 不过度卖萌
- 不企业化
- 不冷冰冰

### 13.4 反馈规范
- 成功：轻提示，不打断
- 失败：明确指出原因
- 危险操作：使用确认弹层
- 初次使用：有轻引导，但不啰嗦

### 13.5 可访问性底线
- 颜色对比要足够
- 触控目标不能太小
- 动画可降低
- 关键按钮文案明确

---

## 14. 计算逻辑

### 14.1 本月已花
```ts
monthSpent = sum(all ledger_entries where monthKey === currentMonth)
```

### 14.2 本月剩余额度
```ts
remainingBudget = monthlyBudget - monthSpent
```

### 14.3 分类合计
```ts
essentialSpent = sum(entries where category === 'essential')
funSpent = sum(entries where category === 'fun')
```

### 14.4 奶茶剩余杯数
```ts
remainingCups = totalCups + bonusCups - usedCups
```

### 14.5 决策建议（MVP）
推荐写成纯函数，例如：

```ts
getDecisionSuggestion({
  amount,
  category,
  remainingBudget,
  funSpent,
  essentialSpent,
  daysLeftInMonth,
})
```

---

## 15. 导出 / 导入要求

### 15.1 导出
导出一个 JSON 文件，包含：
- ledger_entries
- monthly_budget
- milk_tea_quota
- reward_logs
- app_settings
- schemaVersion
- exportedAt

### 15.2 导入
- 导入前进行 Zod schema 校验
- 导入失败要提示原因
- 支持覆盖现有数据
- 合并导入可留到 P1

---

## 16. GitHub Actions 工作流要求

Codex 必须生成 `.github/workflows/deploy-pages.yml`。

### 16.1 工作流目标
- 在 push 到主分支时触发
- 安装依赖
- 构建静态站点
- 上传 Pages artifact
- 发布到 GitHub Pages

### 16.2 工作流要求
- 使用 `pnpm`
- 包含缓存
- 包含 `actions/configure-pages`
- 包含 `actions/upload-pages-artifact`
- 包含 `actions/deploy-pages`
- 生成后应能在 GitHub Pages 的 Actions 模式下工作

### 16.3 README 说明要求
Codex 还必须在 `README.md` 中写清楚：
1. 本地运行方法
2. GitHub Pages 部署步骤
3. 如何配置仓库名路径
4. 如何启用 Pages 的 GitHub Actions 发布源

---

## 17. 工程实现要求

### 17.1 编码要求
- 全程使用 TypeScript
- 避免 any 泛滥
- 组件拆分适中
- 优先可维护性
- 保持命名清晰

### 17.2 状态管理要求
- 页面共享状态使用 Zustand
- 业务持久数据使用 Dexie
- 不要把所有业务数据硬塞进 Zustand 持久化

### 17.3 代码组织要求
- 数据层、UI 层、工具层分离
- 决策逻辑写在独立 util 中
- Dexie schema 独立文件管理
- 主题 token 与动画参数集中管理

### 17.4 静态导出兼容要求
- 不使用依赖服务器运行时的功能
- 不使用必须在线计算的接口
- 遇到不兼容静态导出的写法，优先退回纯客户端实现

---

## 18. 开发优先级

### 阶段 1：骨架与主题
1. 初始化项目
2. 建立目录结构
3. 建立主题 token
4. 建立全局样式
5. 建立导航骨架
6. 完成首页静态原型

### 阶段 2：本地数据层
1. 建立 Dexie schema
2. 建立 repository 层
3. 建立 Zustand UI store
4. 准备 seed / demo 数据
5. 验证首页读写流程

### 阶段 3：核心业务页面
1. 完成账本页
2. 完成快速记账抽屉
3. 完成决策页
4. 完成设置页
5. 完成奶茶额度流程

### 阶段 4：体验打磨
1. 统一动画
2. 完善文案
3. 完善错误提示
4. 完善导出导入
5. 做静态导出兼容检查

### 阶段 5：部署与交付
1. 配置 GitHub Actions
2. 适配 GitHub Pages 路径
3. 补 README
4. 本地自测
5. 输出部署说明

---

## 19. 给 Codex 的工作规则

1. 严格按本文档实现，不随意改技术栈。
2. 如果出现“是否要上后端”的分歧，默认不上后端。
3. 如果出现“是否要使用 Vercel”的分歧，默认不用。
4. 如果出现“功能要不要复杂化”的分歧，默认选择更简单方案。
5. 优先保证移动端体验。
6. 每完成一个阶段，都输出：
   - 已完成内容
   - 新增 / 修改文件
   - 下一步计划
7. 不要生成企业后台风格 UI。
8. 不要让动画喧宾夺主。
9. 不要把本地单机版做成依赖联网的伪离线应用。

---

## 20. 第一轮交付目标

Codex 第一轮必须完成：
1. 初始化 Next.js + TypeScript + Tailwind 项目
2. 集成 shadcn/ui
3. 集成 Motion for React
4. 集成 Dexie 与基础 schema
5. 建立统一主题 token 和全局样式
6. 建立底部导航
7. 完成首页原型
8. 完成快速记账抽屉原型
9. 实现示例数据读写
10. 配置静态导出与 GitHub Pages 发布所需基础配置

---

## 21. 最终判断标准

这个 MVP 是否成功，不看功能堆多少，而看四件事：
1. 用户能不能 3 秒记一笔
2. 用户能不能 5 秒判断该不该买
3. 用户会不会反复打开看“这个月还能花多少”
4. 项目是否能稳定导出为静态站点并发布到 GitHub Pages
