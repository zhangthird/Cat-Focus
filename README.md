# 🐱 Cat Focus · 猫咪番茄时钟

和猫咪一起专注，完成计时获得鱼干，解锁猫咪与小屋装饰。

## 功能

- 默认中文、25 分钟专注，可设置 1–999 分钟，支持暂停与继续。
- 完成专注后获得鱼干奖励，可在商店购买猫咪和椅子，在图鉴中查看收藏。
- 查看总专注时长、当前鱼干余额和近 7 天专注趋势。
- 支持三种主题及中英文切换。
- 进度、收藏和设置保存在当前浏览器，可导出和导入 JSON 备份。
- 猫猫专注提示使用本地固定规则，不需要 API 密钥，也不调用大模型。

计时结束后需要手动休息，目前没有自动休息计时。正在进行的计时不会在刷新或关闭页面后恢复。

## 直接使用

下载并用浏览器打开根目录的 `cat-focus.html`，无需安装依赖。应用代码和样式已包含在文件中；在线字体不可用时使用系统字体。

浏览器本地存储不会自动跨设备、跨浏览器或在不同访问地址间同步。迁移进度时，请先在“设置 → 本机数据与备份”中导出 JSON，再到新环境导入。清理浏览器数据前请先备份。

## 开发

需要 Node.js 22.12 或更高版本，以及 npm。

```bash
npm ci
npm run dev
```

运行后，在浏览器中打开终端显示的本地地址。修改 `src/` 中的源码即可更新页面。

## 构建

生成常规网页文件到 `dist/`：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

根据当前源码重新生成可直接打开的单文件版本：

```bash
npm run build:single
```

这个命令会更新根目录的 `cat-focus.html`。开发时应修改 `src/`，然后重新构建，避免直接修改打包后的 HTML。

## 目录结构

```text
Cat-Focus/
├── src/
│   ├── App.jsx                 # 主界面、计时、商店、统计和备份交互
│   ├── main.jsx                # React 入口
│   ├── styles.css              # 应用样式
│   ├── components/
│   │   └── Artwork.jsx         # 猫咪、小屋家具等 SVG 插画
│   ├── data/
│   │   ├── translations.js     # 中英文文案
│   │   ├── themes.js           # 主题配置
│   │   └── catalog.js          # 猫咪、椅子和价格
│   ├── hooks/
│   │   └── useLocalStorage.js  # 浏览器本地存储
│   └── utils/
│       └── date.js             # 本地日期格式化
├── public/
│   └── favicon.svg            # 应用图标
├── scripts/
│   └── build-single.mjs       # 生成单文件成品
├── index.html                 # 开发与构建入口
├── vite.config.js             # 构建配置
├── package.json
├── package-lock.json          # 锁定依赖版本
├── cat-focus.html             # 可直接打开的单文件成品
└── README.md
```

## 源码说明

此目录工程根据已有单文件 HTML 提取并整理，恢复了可编辑的 JSX、模块和构建流程，不是从原始开发工程直接导出的源码。样式保留了原有生成结果，直接作为 CSS 使用，不依赖 Tailwind 编译。

技术栈为 React、React DOM、Lucide React 和 Vite。既有的本地存储键及备份字段保持兼容，原有存档可继续使用。

## 已修复的问题

- 暂停后剩余时间被重置。
- 完成弹窗中的鱼干奖励与实际奖励不一致。
- UTC 日期导致本地专注统计日期偏移。
- 无效备份和超出范围的自定义时长缺少校验。

欢迎通过 Issue 或 Pull Request 提出建议和改进。

## 许可证

本项目采用 MIT 许可证。
