# 🐱 Cat Focus - 猫咪专注计时器

一个可爱的番茄钟专注计时器。完成专注任务可以获得鱼干奖励，并查看累计专注时间与近 7 天趋势。

## 功能

- 自定义专注时长与倒计时
- 完成专注后获得鱼干奖励
- 总专注时长、累计鱼干和近 7 天趋势统计
- 响应式界面
- 浏览器本地数据持久化
- Electron 桌面应用支持
- Windows、macOS、Linux 自动构建

## 直接使用网页版

直接打开 `cat-focus.html` 即可使用，无需安装依赖。

应用数据通过浏览器 `localStorage` 保存在本机。

## 桌面应用

项目现在提供 Electron 桌面壳，并继续复用现有 `cat-focus.html`，因此不需要重写应用逻辑。

### 本地运行

需要 Node.js 22 或兼容版本。

```bash
npm install
npm run desktop
```

### 构建安装包

```bash
npm install
npm run desktop:build
```

构建产物位于 `release/`：

- Windows：NSIS 安装包与 Portable 版本
- macOS：DMG 与 ZIP
- Linux：AppImage 与 DEB

也可以在 GitHub Actions 的 `Desktop Build` 工作流中自动构建三个平台的安装包。

## 桌面版数据存储

桌面版使用固定的 Electron persistent session：`persist:cat-focus`。

现有应用使用的 `localStorage` 会因此持久化到 Electron 的本地 `userData` 数据目录，而不是只存在于应用运行期间。因此正常关闭应用、重新启动应用以及重新启动电脑后，专注记录、鱼干和统计数据仍会保留。

数据不会主动上传到远程服务器。

注意：如果用户主动清除应用数据，或者卸载程序时同时删除用户数据目录，本地记录可能被删除。后续可以进一步增加 JSON 导出、导入和自动备份功能。

## 项目检查

```bash
npm run check
```

该命令会检查桌面入口、HTML 主文件和项目配置是否存在且基本一致。

## 项目结构

```text
Cat-Focus/
├── .github/workflows/desktop-build.yml
├── desktop/
│   ├── main.cjs
│   └── preload.cjs
├── scripts/
│   └── check-project.mjs
├── cat-focus.html
├── package.json
├── vite.svg
└── README.md
```

## 桌面安全配置

Electron renderer 默认不开放 Node.js 权限：

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- 外部 HTTP/HTTPS 链接交给系统浏览器打开

如果以后需要文件导入导出、系统通知、托盘等桌面能力，应通过 `preload.cjs` 暴露最小化 API，而不是直接给页面 Node.js 权限。

## 技术栈

- React 19.2.0
- React DOM
- Vite 构建产物
- Electron
- electron-builder
- localStorage / Electron persistent session

## 后续适合继续做的优化

当前仓库中的 React 应用仍然是一个已经打包完成的 `cat-focus.html`。为了方便长期维护，下一阶段建议恢复为标准源码工程，例如 `src/`、`public/`、`vite.config.*`，再由 Vite 分别输出 Web 和 Electron renderer 产物。

在此基础上，可以继续加入：

- 专注历史明细
- 数据导出 / 导入 / 自动备份
- 系统通知与完成提醒
- 系统托盘和最小化到托盘
- 开机启动
- 深色模式
- 自定义桌面图标
- GitHub Release 自动发布安装包
- 自动更新

## License

MIT
