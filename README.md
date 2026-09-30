# 个人主页

全新创建的中文个人主页，使用原生 HTML、CSS、JavaScript，无需构建或安装依赖。

## 本地预览

用浏览器打开 `index.html`，或使用任意静态文件服务器。

## 修改内容

- `index.html`：姓名、介绍、项目卡片与兴趣内容。
- `style.css`：颜色、字体和响应式布局。
- `app.js`：项目详情、手机导航与导航高亮。

当前姓名、个人介绍与项目为示例内容，发布后可随时替换。页面不含真实联系方式、表单、跟踪脚本或外部资源。

## Cloudflare Pages

连接 GitHub 仓库后，框架预设选择 None，构建命令留空，输出目录填写 `.`，生产分支为 `main`。使用免费 `pages.dev` 子域名，不需要购买域名。

## GitHub Pages 备选

在仓库 Settings → Pages 中选择 Deploy from a branch，分支 `main`，目录 `/ (root)`。
