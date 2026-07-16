# AIDiagnose — AI企业需求诊断智能体小程序

> **AI 驱动的企业效率诊断工具 · 微信小程序**  
> 让企业通过 AI 多轮对话，精准识别效率痛点，输出定制化 AI 解决方案。

![GitHub stars](https://img.shields.io/badge/version-1.0.0-blue)
![WeChat](https://img.shields.io/badge/WeChat-3.7.8+-07C160)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 简介

**AIDiagnose** 是一个基于微信小程序的 AI 企业需求诊断工具。它通过 AI 智能体引导的多轮对话，帮助中小型企业精准识别碎片化的效率痛点，并将其转化为系统性 AI 解决方案的定制化需求。

### 核心理念

```
碎片化AI辅助 → 系统性AI企业智能系统

不是给企业5个独立的AI工具，
而是把所有碎片化效率阻碍点串联成1个连贯的企业AI智能系统。
```

### 关键闭环

```
AI诊断（识别问题） → 技术人员决策（专业把关） → 定制化方案交付
```

---

## ✨ 功能特性

### 两端分离设计

| 维度 | 企业端（客户用） | 知晨科技端（内部用） |
|------|-----------------|-------------------|
| 主色调 | 🟦 蓝色 `#0071E3` | 🟧 橙色 `#FF9F0A` |
| 背景 | 浅灰 `#F5F5F7` | 深色 `#1D1D1F` |
| 卡片 | 白色 + 轻阴影 | 深色毛玻璃效果 |
| 氛围 | 明亮、开放、友好 | 专业、专注、功能性 |

### 企业端页面（5页）

| 页面 | 功能 |
|------|------|
| **首页** | 扫码加入项目、项目卡片列表、团队成员展示、呼吸动效按钮 |
| **对话页** | AI 多轮诊断对话、选择题/评分题/开放题多种交互形式、进度指示 |
| **团队页** | 团队成员参与进度、各成员状态追踪 |
| **报告页** | 诊断结果热力图矩阵、关键发现、严重度评分 |
| **邀请页** | 邀请团队成员、分享微信好友、生成邀请码 |

### 知晨科技端页面（6页）

| 页面 | 功能 |
|------|------|
| **项目列表** | 所有项目一览、按状态筛选（全部/进行中/已完成/评审中/已交付） |
| **项目详情** | 项目进度、成员列表、诊断结果详情 |
| **工作台** | 逐条评审痛点（可行/有条件/不可行）、5项关键决策 |
| **方案交付** | 方案名称、分阶段内容编辑、预算报价、交付范围选择 |
| **数据看板** | 平台运营概览、本周趋势图、行业分布、待处理事项 |
| **知识库** | 搜索、分类筛选、常用模板、行业报告 |

---

## 🚀 快速开始

### 前置条件

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 微信小程序 AppID

### 安装运行

```bash
# 1. 克隆项目
git clone https://github.com/your-username/AIDiagnose.git
cd AIDiagnose

# 2. 打开微信开发者工具
# 3. 导入 weapp/ 目录
# 4. 修改 project.config.json 中的 appid
# 5. 点击编译预览
```

### 切换两端

项目默认显示企业端首页。如需切换为知晨科技端：

1. 在 `app.js` 中修改 `globalData.isClient` 为 `false`
2. 或在页面中通过角色切换按钮调用 `app.setRole('opc')`

---

## 🏗 项目结构

```
weapp/
├── app.js                    # 全局逻辑
├── app.json                  # 全局配置（11个页面、7个组件）
├── app.wxss                  # 全局样式（Apple风格设计系统）
├── project.config.json       # 微信开发者工具配置
├── components/               # 7个通用组件
│   ├── tab-bar/              # 底部Tab栏（双端主题）
│   ├── project-card/         # 项目卡片
│   ├── avatar-group/         # 头像组
│   ├── chat-bubble/          # 聊天气泡
│   ├── stat-card/            # 统计卡片
│   ├── tag/                  # 标签
│   └── industry-chart/       # 行业分布图
├── pages/
│   ├── client/               # 企业端（蓝色主题）
│   │   ├── home/             # 首页
│   │   ├── chat/             # AI对话
│   │   ├── team/             # 团队
│   │   ├── report/           # 诊断报告
│   │   └── invite/           # 邀请成员
│   └── opc/                  # 知晨科技端（橙色主题）
│       ├── projects/         # 项目列表
│       ├── project-detail/   # 项目详情
│       ├── workspace/        # 评审工作台
│       ├── delivery/         # 方案交付
│       ├── dashboard/        # 数据看板
│       └── knowledge/        # 知识库
└── utils/util.js             # 工具函数
```

---

## 🎨 设计系统

### 色彩

| 名称 | 色值 | 用途 |
|------|------|------|
| 蓝色主色 | `#0071E3` | 企业端主色、按钮、链接 |
| 橙色主色 | `#FF9F0A` | 知晨科技端主色 |
| 浅灰背景 | `#F5F5F7` | 企业端背景 |
| 深色背景 | `#1D1D1F` | 知晨科技端背景 |
| 成功绿 | `#30D158` | 完成状态 |
| 错误红 | `#FF453A` | 错误状态 |

### 字体

```
中文: PingFang SC / -apple-system
英文: SF Pro / Helvetica Neue
大标题: 26px 粗体
页面标题: 17px 粗体
卡片标题: 16px 粗体
正文: 15px 常规
辅助文字: 13px 灰色
```

### 间距

```
页面左右边距: 20px
卡片圆角: 14px
按钮圆角: 12px
输入框圆角: 10px
卡片间距: 10px
```

---

## 🔧 技术栈

- **框架**: 微信小程序原生框架
- **基础库**: 3.7.8+
- **样式**: CSS Variables + 毛玻璃效果 (backdrop-filter)
- **图标**: 内联 SVG
- **数据**: 模拟数据（预留 API 接口）

---

## 📄 页面路由

### 企业端路由

| 页面 | 路径 | Tab索引 |
|------|------|---------|
| 首页 | `/pages/client/home/home` | 0 |
| 对话 | `/pages/client/chat/chat` | 1 |
| 团队 | `/pages/client/team/team` | 2 |
| 报告 | `/pages/client/report/report` | - |
| 邀请 | `/pages/client/invite/invite` | - |

### 知晨科技端路由

| 页面 | 路径 | Tab索引 |
|------|------|---------|
| 项目列表 | `/pages/opc/projects/projects` | 0 |
| 工作台 | `/pages/opc/workspace/workspace` | 1 |
| 数据看板 | `/pages/opc/dashboard/dashboard` | 2 |
| 项目详情 | `/pages/opc/project-detail/project-detail` | - |
| 方案交付 | `/pages/opc/delivery/delivery` | - |
| 知识库 | `/pages/opc/knowledge/knowledge` | - |

---

## 🔌 对接指南

### 替换模拟数据

各页面 JS 中的模拟数据已用注释标注，替换为真实 API 调用即可：

```javascript
// 示例: 替换项目列表数据
loadProjects() {
  wx.request({
    url: 'https://api.example.com/projects',
    success: (res) => {
      this.setData({ projects: res.data });
    }
  });
}
```

### AI 对话对接

`pages/client/chat/chat.js` 中的 `mockAiResponse()` 方法可替换为真实 AI 大模型接口。

### 微信登录

`app.js` 中的 `checkLogin()` 方法需接入微信登录流程。

---

## 📱 小程序审核注意事项

1. AI 对话类小程序需在用户协议中明确 AI 生成内容免责条款
2. 需提前在微信公众平台申请订阅消息模板
3. 主包控制在 2MB 以内（评审/决策/方案等重型页面放分包）
4. 对话数据隐私声明必须在用户首次使用时展示

---

## 📄 License

[MIT](LICENSE) © 2026 知晨科技

---

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request
