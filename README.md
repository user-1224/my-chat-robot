# AI 对话助手

一个基于 Vue 3 的 AI 对话应用，支持多会话管理和流式响应。

## 功能特性

- ✅ 大模型对话功能
- ✅ 创建、切换、删除会话
- ✅ 流式响应显示
- ✅ 会话历史记录
- ✅ 响应式界面设计
- ✅ 思考模式（可开关）
- ✅ 停止生成按钮
- ✅ 输入框自动聚焦
- ✅ 输入框自适应高度

## 技术栈

- Vue 3 + TypeScript
- Vue Router
- Pinia (状态管理)
- Axios (HTTP 请求)
- Vite (构建工具)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置大模型 API

项目使用环境变量管理大模型配置，确保敏感信息安全。

**步骤 1**: 复制环境变量示例文件作为模板

```bash
# Linux / macOS
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Windows (CMD)
copy .env.example .env
```

**步骤 2**: 编辑 `.env` 文件，填入您的实际配置

```bash
# API 基础地址（根据您使用的大模型服务修改）
VITE_API_BASE_URL=https://api.openai.com/v1

# API 密钥（替换为您自己的密钥）
VITE_API_KEY=sk-your-api-key-here

# 模型名称
VITE_API_MODEL=gpt-3.5-turbo

# 最大 Token 数（控制响应长度）
VITE_API_MAX_TOKENS=2000

# 温度参数 (0-2，越高越随机)
VITE_API_TEMPERATURE=0.7

# 系统提示词（定义 AI 的角色和行为）
VITE_API_SYSTEM_PROMPT=你是一个有帮助的AI助手。
```

**支持的配置项**:

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | API 基础地址 | https://api.openai.com/v1 |
| `VITE_API_KEY` | API 密钥 | sk-xxx |
| `VITE_API_MODEL` | 模型名称 | gpt-3.5-turbo |
| `VITE_API_MAX_TOKENS` | 最大生成令牌数 | 2000 |
| `VITE_API_TEMPERATURE` | 温度参数 (0-2) | 0.7 |
| `VITE_API_SYSTEM_PROMPT` | 系统提示词 | 你是一个有帮助的AI助手 |

**配置模板说明**:

- `.env.example` 是配置模板文件，包含所有必需的配置项和注释说明
- 该文件会被提交到 GitHub，供其他使用者参考
- `.env` 是实际配置文件，包含敏感信息，**不会**被提交到版本控制
- 每次新增配置项时，需要同步更新 `.env.example` 文件

**安全提示**:
- `.env` 文件已添加到 `.gitignore`，确保敏感信息不会泄露
- 请勿将 API 密钥硬编码到代码中
- 定期轮换您的 API 密钥

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
my-chat-robot/
├── src/
│   ├── api/              # API 调用封装
│   │   └── chat.ts       # 聊天 API（流式响应处理）
│   ├── components/       # Vue 组件
│   │   ├── ConversationList.vue  # 会话列表
│   │   ├── MessageInput.vue      # 消息输入框（自适应高度）
│   │   └── MessageList.vue       # 消息列表（含思考模式）
│   ├── config/           # 配置文件
│   │   └── ai-config.ts  # 大模型配置（从环境变量读取）
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   │   └── chat.ts       # 会话状态管理
│   ├── views/            # 页面组件
│   │   └── ChatView.vue  # 对话页面
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── style.css         # 全局样式
├── .env                  # 环境变量配置（包含敏感信息）
├── .env.example          # 环境变量示例（安全提交）
├── .gitignore            # Git 忽略配置
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 配置
```

## 使用说明

1. **创建新对话**: 点击左侧"新建对话"按钮
2. **发送消息**: 在底部输入框输入消息，按 Enter 或点击"发送"按钮
3. **切换会话**: 点击左侧会话列表中的会话项
4. **删除会话**: 将鼠标悬停在会话项上，点击出现的删除按钮

## 支持的大模型服务

本项目支持所有兼容 OpenAI API 格式的大模型服务，包括但不限于：

- OpenAI (GPT-3.5, GPT-4)
- Claude (通过兼容接口)
- 国产大模型 (通义千问、文心一言等，需使用兼容接口)
- 本地部署的大模型 (如 Ollama)

只需修改 `ai-config.ts` 中的配置即可切换不同的模型服务。

## 注意事项

- 请妥善保管您的 API Key，不要提交到版本控制系统
- 流式响应需要服务端支持 SSE (Server-Sent Events)
- 建议在生产环境中使用环境变量管理敏感配置
# AI对话助手项目（第六小组作业）
## 一、项目简介
本项目是一个前端AI对话网页应用，在原有对话基础上拓展AI绘图生成功能，实现文字输入生成AI图片、图片预览、本地下载与历史记录查看功能。

## 二、功能清单
1. 文本对话交互
2. 输入文字提示词，调用AI接口生成图片
3. 页面展示生成的AI图片
4. 图片本地下载功能
5. 历史生成记录保存与查看


## 三、使用说明
1. 在输入框输入文字描述（绘图提示词）
2. 点击生成按钮，等待AI生成图片
3. 生成完成后在页面查看图片
4. 点击下载按钮保存图片到电脑
5. 在历史记录区域查看过往生成记录

## 四、小组组员
组员1：李美树
组员2：赵叶凡
组员3：曹婧婧
组员4：王予婷
组员5：张久爱