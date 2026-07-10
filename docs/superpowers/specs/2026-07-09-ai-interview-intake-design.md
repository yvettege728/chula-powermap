# AI 对话式取证功能 — 设计文档

**日期：** 2026-07-09
**项目：** Chula Powermap
**功能：** 在 `submit.html` 中嵌入一个对话式 AI 助手，将贡献者的自由讲述转化为结构化证据条目
**状态：** 已通过用户批准（brainstorming 阶段），实施计划见 `docs/superpowers/plans/2026-07-09-ai-interview-intake-plan.md`

---

## 1. 背景与动机

`contribute.html` 和 `submit.html` 已经建立了一套明确的伦理承诺：匿名友好、许可优先、志愿者两周内人工审核、绝不未经同意发布。现有的 `submit.html` 是纯前端 demo，用下拉菜单（kind、site）加一个自由文本框（description）收集材料，且没有真正的提交后端。

问题在于：下拉菜单式的表单会让贡献者只回答"你问到的"问题。口述历史研究里一个反复验证的发现是，让人自由讲述比让人回答固定字段能挖出更多、更有层次的信息——尤其是这类项目最需要的"archival gap"，也就是档案没想到要问的细节。这正是本功能要解决的问题：用对话式的追问，替代死板的表单字段，同时把 AI 生成的内容始终交给贡献者本人确认，不越权替人下判断。

**这次改动影响谁：**
- **潜在贡献者**（社区居民、活动人士、市场摊贩后代等）——体验从"填表格"变成"讲故事"，降低参与门槛，尤其对不熟悉网络表单的年长受访者更友好。
- **志愿者审核者**——仍然是最终把关人，工作量不变（AI 只是把原始材料整理得更好读，不会绕过人工审核）。
- **Yvette / 项目本身**——需要承担起一个新的、小的后端运维责任（此前项目完全无后端）。

---

## 2. 架构总览

```
浏览器（submit.html）
  │
  │  用户选择"跟 AI 聊聊"
  ▼
对话式 UI 组件（新增，纯前端）
  │
  │  三个固定问题依次问完
  ▼
POST /api/followup   ──────▶  Cloudflare Pages Function ──▶ Claude API（一次调用）
  │  返回：{ followup_question: string | null }
  ▼
（如果有追问）再问一题
  │
  ▼
POST /api/synthesize ──────▶  Cloudflare Pages Function ──▶ Claude API（一次调用）
  │  返回：{ kind, site, description }
  ▼
可编辑的确认卡片（复用现有表单字段 UI）
  │  用户确认 / 修改 + 选择可见度（private / public-anon / public-named）+ 可选联系方式
  ▼
POST /api/submit ───────────▶  Cloudflare Pages Function ──▶ Airtable（写入一行）
  │
  ▼
成功提示（复用现有 form-success 样式）
```

**关键原则：** 每次对话最多触发两次 Claude API 调用（一次判断追问、一次整理成卡片），不做逐句实时生成的自由多轮对话。这个上限是安全和成本的核心护栏——详见第 5 节。

---

## 3. 前端组件

### 3.1 入口切换
`submit.html` 顶部（现有 `submit-shell` 内、表单之前）加一个双选切换条：

- 「直接填写表单」→ 显示现有的 `<form id="submitForm">`，行为不变。
- 「跟 AI 聊聊」→ 显示新的 `<div id="interviewFlow">`，隐藏静态表单。

两条路径最终都汇聚到同一个"确认卡片 + 隐私选择 + 提交"区块（见 3.3），避免重复实现可见度/联系方式/隐私提示这些已经写好的部分。

### 3.2 对话组件 `interview.js`（新文件）
- 复用 `contribute.html` 里已经存在的 stepper 交互节奏（一次一题、答完自动推进），保持视觉和交互一致性——不引入聊天气泡/头像这类"AI 感"很重的通用聊天 UI 组件，维持项目现有的 Forensic Architecture / Bureau d'études 式高对比度排版语言。
- 三个固定问题（硬编码在 `interview.js` 里，你可以随时改措辞，不需要碰后端）：
  1. "发生了什么？"
  2. "大概是什么时间、什么地点？"
  3. "还有没有别人经历或目睹（不需要说出名字）？"
- 每题限制输入长度（建议 2000 字符），避免异常超长输入拖慢/搞乱后续 AI 处理。
- 三题答完后调用 `/api/followup`；如果返回了追问，展示追问、收集第四个回答；否则跳过。
- 调用 `/api/synthesize`，展示 loading 状态（复用 `dither.js` 现有的视觉语言做一个简单的处理中提示，而不是通用 spinner）。
- 收到结构化结果后，把 `{kind, site, description}` 填入 3.3 的确认卡片。
- 任何一步 API 请求失败（超时/网络错误），显示"AI 助手暂时无法使用，要不我们直接用表单？"并把已收集的答案自动拼接进表单的 description 字段，不丢用户已经输入的内容。

### 3.3 确认卡片（表单路径和 AI 路径共用）
这其实就是现有 `submit.html` 表单的下半部分（kind 下拉、site 下拉、description 文本框、contact 可选、visibility 单选、privacy-note、提交按钮）。**实施计划里做了一个简化：** 不新建一套平行的确认卡片 UI，而是让 AI 路径在整理完成后，直接把结果回填进现有的 `#submitForm` 字段里、揭示（reveal）这个表单供用户核对/编辑，标注"AI 辅助整理草稿"。两条路径最终点击的是同一个提交按钮，走同一个提交逻辑（见 4.3）。这个简化 100% 复用现有 markup/CSS/提交处理逻辑，避免了重复实现。

---

## 4. 后端：三个 Cloudflare Pages Functions

选择 Cloudflare Pages Functions 的原因：免费额度对学生项目完全够用，且和纯静态站点的部署方式无缝衔接，不需要额外的服务器或容器。Anthropic API key 存在 Cloudflare 的环境变量里，浏览器端 JS 永远不会看到它。

### 4.1 `POST /api/followup`
**输入：** `{ answers: [q1, q2, q3] }`（三个固定问题的回答原文）
**处理：** 调用 Claude API 一次，system prompt 严格限定为："你是一个档案征集助手。基于以下三段回答，判断是否缺少一个关键事实（具体地点、大致年份、或者提供者是亲历者/目击者/听说三种身份中的哪一种）。如果缺，返回一个简短、中性、不带预设立场的追问；否则返回 null。禁止编造、禁止索要姓名或联系方式。"
**输出：** `{ followup_question: string | null }`

### 4.2 `POST /api/synthesize`
**输入：** `{ answers: [...], followup_answer?: string }`
**处理：** 调用 Claude API 一次，把所有回答整理成结构化字段。System prompt 明确要求："只整理和重组用户已经说过的内容，不得添加任何用户没有提到的事实、人名、地点或细节。用第一人称保留用户原本的语气。"
**输出：** `{ kind, site, description }` — `kind` 和 `site` 从 `submit.html` 现有下拉选项里选最匹配的一项（匹配不上就返回 `"other"` / `"unclear"`，交给用户手动改），`description` 是整理后的叙述文本。

### 4.3 `POST /api/submit`
**输入：** 确认卡片的最终版本（kind、site、description、contact、visibility、来源标记 `source: "form" | "ai-interview"`）
**处理：** 写入 Airtable 一行记录，包含时间戳。不做任何发布相关的自动化——这一步只是把内容放进志愿者的审核队列。
**输出：** `{ ok: true }`

---

## 5. 安全与伦理护栏

这是面向公众、涉及正在进行的诉讼案件（PMCU 诉 Penprapa Ployseesuay）的真实上线工具，护栏不是锦上添花，是必须项：

- **两次调用上限**：从架构上杜绝了"无限追问"的可能性，也就杜绝了成本失控和大部分的滥用面。
- **System prompt 硬约束**：不得索要真实姓名/联系方式；不得提出预设立场或带引导性的问题；不得编造用户没说过的内容。
- **速率限制**：通过 Cloudflare 控制台的 Rate Limiting Rules 按 IP 限流（比如每小时每 IP 最多 10 次请求），防止脚本化滥用——这是部署配置而非代码逻辑。
- **透明提示**：对话界面固定显示一行字——"这段对话由 AI 协助整理，发布前一定会有志愿者人工审核"。
- **人工把关不可绕过**：AI 生成的草稿永远是"草稿"，提交前必须经过用户本人确认/编辑，提交后仍然进入现有的人工审核队列，不自动发布。

---

## 6. 数据存储：Airtable

字段设计：

| 字段 | 说明 |
|---|---|
| Timestamp | 提交时间 |
| Kind | 材料类型 |
| Site | 关联地点 |
| Description | 整理后的叙述文本 |
| Contact | 可选，联系方式 |
| Visibility | private / public-anon / public-named |
| Source | form / ai-interview |
| Status | 志愿者手动维护：待读 / 已读 / 已发布 / 已拒绝 |

---

## 7. 测试计划

- 手动跑三种典型场景：一段第一人称证词、一份文件描述、一个"这个我不想回答"的边界情况，确认 AI 追问和整理都不会跑偏或编造内容。
- 抽查整理结果，确认 description 里没有出现三段回答里没提到过的事实。
- 确认 visibility 选择"private"或"public-anon"时，contact 字段绝不会出现在任何公开展示的地方。
- 断网/超时场景下确认能优雅降级回表单，且已输入内容不丢失。

---

## 8. 尚未覆盖、留到下一阶段的部分

- 语音输入（浏览器原生 Web Speech API）
- 志愿者审核界面/工作流的自动化
- 泰语/潮州话的对话式追问
