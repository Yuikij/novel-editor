# AI Novel Editor

一个基于AI的小说编辑与创作平台，提供角色管理、世界构建、情节分析等功能。

## 技术栈

- **前端框架**: [Next.js](https://nextjs.org/) (React框架)
- **类型系统**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) (实用工具优先的CSS框架)
- **UI组件**: [Shadcn UI](https://ui.shadcn.com/) (基于Radix UI的组件集合)
- **状态管理**: React Hooks
- **图表可视化**: [D3.js](https://d3js.org/) (用于角色关系图等可视化)
- **表单验证**: [Zod](https://zod.dev/) (TypeScript优先的表单验证库)

## 功能特点

### 1. 项目管理
- 创建、保存、切换多个小说项目
- 存储元数据、角色、章节等

### 2. 小说元数据
- 小说取名：AI根据类型、情节生成标题
- 小说类型：选择预定义类型或自定义
- 写作风格：选择通俗、文艺或模仿特定作者

### 3. 角色管理
- 角色信息：姓名、性格、背景、目标
- AI生成建议：根据简短描述生成详细小传
- 角色关系：可视化关系图，定义人物关系

### 4. 世界构建
- 存储设定（如江南水乡的烟雨氛围、修炼体系）
- 检索外部知识，生成真实细节

### 5. 大纲与情节
- 大纲主线：分层编辑器，规划章节、场景和关键事件
- 小说爆点：AI建议高潮或转折

### 6. 章节管理
- 章节组织：添加、删除、重排序章节，记录每章摘要
- 备忘录：用户添加笔记
- 上下文：存储前文摘要和伏笔，生成新章节时参考

### 7. 分析优化
- 利用节奏和情感分析完善小说

## 如何运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 启动生产版本
npm start
```

## 项目结构

```
novel-editor/
├── app/                   # 应用主目录
│   ├── components/        # 组件目录
│   │   ├── ui/            # UI基础组件
│   │   ├── novel-editor/  # 小说编辑器组件
│   │   └── layout/        # 布局组件
│   ├── dashboard/         # 仪表板相关页面
│   ├── lib/               # 工具函数库
│   ├── hooks/             # 自定义React Hooks
│   └── types/             # TypeScript类型定义
├── public/                # 静态资源
│   └── icons/             # SVG图标
└── ...                    # 其他配置文件
``` 