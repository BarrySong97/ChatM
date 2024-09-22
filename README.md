## 目录

rm -rf node*modules/electron/dist && node node_modules/electron/install.js
*🚨 默认情况下, `electron` 文件夹下的文件将会被构建到 `dist-electron`\_

```tree
├── electron                                 Electron 源码文件夹
│   ├── main                                 Main-process 源码
│   └── preload                              Preload-scripts 源码
│
├── release                                  构建后生成程序目录
│   └── {version}
│       ├── {os}-{os_arch}                   未打包的程序(绿色运行版)
│       └── {app_name}_{version}.{ext}       应用安装文件
│
├── public                                   同 Vite 模板的 public
└── src                                      渲染进程源码、React代码
```

<!--
## 🚨 这需要留神2

默认情况下，该模板在渲染进程中集成了 Node.js，如果你不需要它，你只需要删除下面的选项. [因为它会修改 Vite 默认的配置](https://github.com/electron-vite/vite-plugin-electron-renderer#config-presets-opinionated).

```diff
# vite.config.ts

export default {
  plugins: [
    ...
-   // Use Node.js API in the Renderer-process
-   renderer({
-     nodeIntegration: true,
-   }),
    ...
  ],
}
```
-->

### 开发

可以把包管理工具换成对应 npm，yarn

electron postinstall 已配置镜像，如果安装缓慢可以考虑检查镜像是否正常，镜像配置在`.npmrc` `electron_mirror`

## Usage

```bash
pnpm i

pnpm drizzle-kit generate:sqlite

npm run dev
```

```bash
pnpm i
```

```bash

pnpm run dev
```

### 构建

```bash
pnpm run build:mac # 构建mac mac只能在mac的机器上打包
pnpm run build:win # 构建windows
pnpm run build:linux # 构建linux
```

只构建代码正在运行的平台，如果当前使用 macos 只会构建 macos 的安装包，此命令可以用于快速检验打包之后的运行结果。

```bash
pnpm run build
```

版本好在`package.json`中配置，打包时会根据版本号生成安装包。

### 项目结构

`.env` 配置环境变量中有 `VITE_SERVE_URL`用来配置接口访问地址

`/api` http 请求接口

`/api/core/OpenAPI` 接口全局配置，包括接口地址和请求头

`/assets` 资源文件

`/components` 组件

'route.tsx' 路由配置

`/pages` 页面

`service` 和 electron 通信的接口，主要用来控制原生窗口的操作

### 项目技术栈

- electron
- react
- typescript
- electron-builder
- taiwindcss
- react-router
- next-ui
- antd 主要是用 table
