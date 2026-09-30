# 个人主页

全新创建的中文个人主页，使用原生 HTML、CSS、JavaScript，无需构建或安装依赖。

## 本地预览

用浏览器打开 `index.html`，或使用任意静态文件服务器。

## 修改内容

- `index.html`：姓名、介绍、项目卡片与兴趣内容。
- `style.css`：颜色、字体和响应式布局。
- `app.js`：项目详情、手机导航与导航高亮。

当前姓名、个人介绍与项目为示例内容，发布后可随时替换。页面不含真实联系方式、表单、跟踪脚本或外部资源。

## 已发布的网站

- 正式网址：https://personal-homepage-zxzxghxq.pages.dev/
- GitHub 仓库：https://github.com/zxzxghxq/personal-homepage
- Cloudflare Pages 项目：`personal-homepage-zxzxghxq`
- 生产分支：`main`

当前采用 Cloudflare Pages Direct Upload，GitHub 用于保存源代码；推送 GitHub 不会自动重新部署。修改后，将 `index.html`、`style.css` 和 `app.js` 放进一个单独的公开文件夹，通过 Cloudflare Pages 上传，或使用已授权的 Wrangler 发布该文件夹：

```sh
wrangler pages deploy <公开文件夹> --project-name personal-homepage-zxzxghxq --branch main
```

不要把 `.git`、授权文件或本地工作文件上传为网站资源。

## GitHub 自动部署（另建项目时）

连接 GitHub 仓库后，框架预设选择 None，构建命令留空，输出目录填写 `.`，生产分支为 `main`。使用免费 `pages.dev` 子域名，不需要购买域名。

## GitHub Pages 备选

在仓库 Settings → Pages 中选择 Deploy from a branch，分支 `main`，目录 `/ (root)`。
