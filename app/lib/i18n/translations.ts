type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

// 所有界面文本的翻译
export const translations: Translations = {
  // 导航和标题
  "app.name": {
    "zh-CN": "小说AI",
    "en-US": "NovelAI"
  },
  "nav.features": {
    "zh-CN": "功能",
    "en-US": "Features"
  },
  "nav.pricing": {
    "zh-CN": "价格",
    "en-US": "Pricing"
  },
  "nav.login": {
    "zh-CN": "登录",
    "en-US": "Login"
  },
  "nav.signup": {
    "zh-CN": "注册",
    "en-US": "Sign Up"
  },
  "nav.projects": {
    "zh-CN": "项目",
    "en-US": "Projects"
  },
  "nav.worlds": {
    "zh-CN": "世界",
    "en-US": "Worlds"
  },
  "nav.entries": {
    "zh-CN": "条目",
    "en-US": "Entries"
  },
  "nav.templates": {
    "zh-CN": "模板",
    "en-US": "Templates"
  },
  "nav.analysis": {
    "zh-CN": "分析",
    "en-US": "Analysis"
  },
  "nav.back": {
    "zh-CN": "返回",
    "en-US": "Back"
  },
  "editor.title": {
    "zh-CN": "小说编辑器",
    "en-US": "Novel Editor"
  },
  
  // 项目状态
  "status.draft": {
    "zh-CN": "草稿",
    "en-US": "Draft"
  },
  "status.in_progress": {
    "zh-CN": "进行中",
    "en-US": "In Progress"
  },
  "status.completed": {
    "zh-CN": "已完成",
    "en-US": "Completed"
  },
  "status.published": {
    "zh-CN": "已发布",
    "en-US": "Published"
  },
  "status.unknown": {
    "zh-CN": "未知",
    "en-US": "Unknown"
  },
  
  // 仪表盘页面
  "dashboard.new_project": {
    "zh-CN": "新建项目",
    "en-US": "New Project"
  },
  "dashboard.edit_project": {
    "zh-CN": "编辑项目",
    "en-US": "Edit Project"
  },
  "dashboard.create_project": {
    "zh-CN": "创建新项目",
    "en-US": "Create New Project"
  },
  "dashboard.confirm.delete": {
    "zh-CN": "确定要删除这个项目吗？此操作不可恢复。",
    "en-US": "Are you sure you want to delete this project? This action cannot be undone."
  },
  
  // 世界页面
  "worlds.title": {
    "zh-CN": "世界构建",
    "en-US": "World Building"
  },
  "worlds.create": {
    "zh-CN": "新建世界观",
    "en-US": "New World"
  },
  "worlds.loading": {
    "zh-CN": "加载中...",
    "en-US": "Loading..."
  },
  "worlds.edit": {
    "zh-CN": "编辑",
    "en-US": "Edit"
  },
  "worlds.delete": {
    "zh-CN": "删除",
    "en-US": "Delete"
  },
  "worlds.modal.create": {
    "zh-CN": "创建新世界观",
    "en-US": "Create New World"
  },
  "worlds.modal.edit": {
    "zh-CN": "编辑世界观",
    "en-US": "Edit World"
  },
  "worlds.modal.delete.title": {
    "zh-CN": "删除世界观",
    "en-US": "Delete World"
  },
  "worlds.modal.delete.message": {
    "zh-CN": "您确定要删除世界观 \"{name}\" 吗？此操作无法撤销。",
    "en-US": "Are you sure you want to delete the world \"{name}\"? This action cannot be undone."
  },
  "worlds.modal.cancel": {
    "zh-CN": "取消",
    "en-US": "Cancel"
  },
  "worlds.modal.confirm.delete": {
    "zh-CN": "删除",
    "en-US": "Delete"
  },
  "worlds.success.create": {
    "zh-CN": "世界观创建成功",
    "en-US": "World created successfully"
  },
  "worlds.success.update": {
    "zh-CN": "世界观更新成功",
    "en-US": "World updated successfully"
  },
  "worlds.success.delete": {
    "zh-CN": "世界观删除成功",
    "en-US": "World deleted successfully"
  },
  "error.load": {
    "zh-CN": "加载失败",
    "en-US": "Failed to load"
  },
  "error.save": {
    "zh-CN": "保存失败",
    "en-US": "Failed to save"
  },
  "error.delete": {
    "zh-CN": "删除失败",
    "en-US": "Failed to delete"
  },
  
  // 主页相关
  "home.hero.title": {
    "zh-CN": "使用AI助手创作您的小说",
    "en-US": "Craft Your Novel with AI Assistant"
  },
  "home.hero.description": {
    "zh-CN": "通过我们的AI驱动的小说编辑器改变您的写作流程。开发角色，构建世界，撰写引人入胜的故事。",
    "en-US": "Transform your writing process with our AI-powered novel editor. Develop characters, build worlds, and write engaging stories."
  },
  "home.cta.start": {
    "zh-CN": "开始使用",
    "en-US": "Get Started"
  },
  "home.cta.demo": {
    "zh-CN": "观看演示",
    "en-US": "Watch Demo"
  },
  
  // 站点元数据
  "site.title": {
    "zh-CN": "小说AI - AI小说编辑器",
    "en-US": "NovelAI - AI Novel Editor"
  },
  "site.description": {
    "zh-CN": "一个AI驱动的小说写作和编辑平台",
    "en-US": "An AI-powered novel writing and editing platform"
  },
  
  // 底部信息
  "footer.rights": {
    "zh-CN": "© 2023 小说AI。保留所有权利。",
    "en-US": "© 2023 NovelAI. All rights reserved."
  },
  "footer.terms": {
    "zh-CN": "条款",
    "en-US": "Terms"
  },
  "footer.privacy": {
    "zh-CN": "隐私",
    "en-US": "Privacy"
  },
  
  // 语言切换
  "language.switch": {
    "zh-CN": "English",
    "en-US": "中文"
  },
  
  // 用户相关
  "user.account": {
    "zh-CN": "账户",
    "en-US": "Account"
  },
  "user.theme": {
    "zh-CN": "切换主题",
    "en-US": "Toggle theme"
  },
  "user.name": {
    "zh-CN": "张三",
    "en-US": "John Doe"
  },
  
  // 项目页面
  "project.tab.write": {
    "zh-CN": "写作",
    "en-US": "Write"
  },
  "project.tab.chapters": {
    "zh-CN": "章节",
    "en-US": "Chapters"
  },
  "project.tab.characters": {
    "zh-CN": "角色",
    "en-US": "Characters"
  },
  "project.tab.plots": {
    "zh-CN": "情节",
    "en-US": "Plots"
  },
  "project.tab.outline": {
    "zh-CN": "大纲",
    "en-US": "Outline"
  },
  "project.tab.draft": {
    "zh-CN": "草稿",
    "en-US": "Draft"
  },
  "project.tab.map": {
    "zh-CN": "地图",
    "en-US": "Map"
  },
  "project.chapter.title": {
    "zh-CN": "章节管理",
    "en-US": "Chapter Management"
  },
  "project.chapter.add": {
    "zh-CN": "添加章节",
    "en-US": "Add Chapter"
  },
  "project.chapter.edit": {
    "zh-CN": "编辑",
    "en-US": "Edit"
  },
  "project.chapter.delete": {
    "zh-CN": "删除",
    "en-US": "Delete"
  },
  "project.chapter.status.completed": {
    "zh-CN": "已完成",
    "en-US": "Completed"
  },
  "project.chapter.status.in_progress": {
    "zh-CN": "进行中",
    "en-US": "In Progress"
  },
  "project.chapter.status.draft": {
    "zh-CN": "草稿",
    "en-US": "Draft"
  },
  "project.chapter.status.edited": {
    "zh-CN": "已编辑",
    "en-US": "Edited"
  },
  "project.chapter.word_count": {
    "zh-CN": "字数",
    "en-US": "Word Count"
  },
  "project.chapter.auto_expand": {
    "zh-CN": "自动扩展章节",
    "en-US": "Auto-Expand Chapters"
  },
  "project.chapter.batch_delete": {
    "zh-CN": "批量删除",
    "en-US": "Batch Delete"
  },
  "project.character.title": {
    "zh-CN": "角色管理",
    "en-US": "Character Management"
  },
  "project.character.add": {
    "zh-CN": "添加角色",
    "en-US": "Add Character"
  },
  "project.character.edit": {
    "zh-CN": "编辑",
    "en-US": "Edit"
  },
  "project.character.delete": {
    "zh-CN": "删除",
    "en-US": "Delete"
  },
  "project.plot.title": {
    "zh-CN": "情节管理",
    "en-US": "Plot Management"
  },
  "project.plot.add": {
    "zh-CN": "添加情节",
    "en-US": "Add Plot"
  },
  "project.plot.edit": {
    "zh-CN": "编辑",
    "en-US": "Edit"
  },
  "project.plot.delete": {
    "zh-CN": "删除",
    "en-US": "Delete"
  },
  "project.plot.auto_expand": {
    "zh-CN": "自动扩展情节",
    "en-US": "Auto-Expand Plots"
  },
  "project.plot.batch_delete": {
    "zh-CN": "批量删除",
    "en-US": "Batch Delete"
  },
  "project.plot.count": {
    "zh-CN": "个情节",
    "en-US": "plots"
  },
  "project.plot.related_characters": {
    "zh-CN": "关联角色",
    "en-US": "Related Characters"
  },
  "project.plot.related_entries": {
    "zh-CN": "关联条目",
    "en-US": "Related Entries"
  },
  "project.plot.related_characters_count": {
    "zh-CN": "关联角色: {count} 个",
    "en-US": "Related Characters: {count}"
  },
  "project.plot.related_entries_count": {
    "zh-CN": "关联条目: {count} 个",
    "en-US": "Related Entries: {count}"
  },
  "project.outline.title": {
    "zh-CN": "故事大纲",
    "en-US": "Story Outline"
  },
  "project.outline.add": {
    "zh-CN": "添加节点",
    "en-US": "Add Node"
  },
  "project.outline.edit": {
    "zh-CN": "编辑",
    "en-US": "Edit"
  },
  "project.outline.delete": {
    "zh-CN": "删除",
    "en-US": "Delete"
  },
  "project.outline.auto_expand": {
    "zh-CN": "自动扩展大纲",
    "en-US": "Auto-Expand Outline"
  },
  "project.outline.batch_delete": {
    "zh-CN": "批量删除",
    "en-US": "Batch Delete"
  },
  "common.refresh": {
    "zh-CN": "刷新",
    "en-US": "Refresh"
  },
  "common.loading": {
    "zh-CN": "加载中...",
    "en-US": "Loading..."
  },
  "common.error.load": {
    "zh-CN": "加载失败",
    "en-US": "Failed to load"
  }
}; 