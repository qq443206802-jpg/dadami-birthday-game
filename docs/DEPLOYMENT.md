# dadami birthday game

制作人：Moon。中文封面：今天，给达大米过生日。

这是完整的静态网页游戏。发布后由 GitHub Pages 提供 HTML、JavaScript 和素材；不使用本地服务器、后端或运行时 AI。

## 构建与部署

1. `npm ci`
2. `npm test`
3. `npm run build`
4. `node scripts/audit-build.mjs`
5. 将 `dist` 发布到 GitHub Pages。

仓库 Settings → Pages → Source 选择 GitHub Actions。`.github/workflows/deploy.yml` 会在 main 更新后测试、构建和部署。

Vite 使用相对 base，动态加载的图片和蛋糕弹窗使用同一 base，支持 `https://账号.github.io/dadami-birthday-game/` 子目录。CSS资源由Vite改写为相对路径。

## 文件范围

公开代码、压缩游戏素材和第三方许可证保存在仓库。原始参考照片、生成中间文件、本地缓存、内部制作记录和试玩截图保留在本地，不属于发布所需文件。

## 测试

自动化规则检查与浏览器实际操作分别记录。性能页面添加 `?perf=1` 可查看当前浏览器的游戏更新帧率、P95帧间隔、超过50ms的帧和浏览器长任务。采样只留在当前页面；正式访问不显示性能面板。

公网测试应包含：全新访问、角色与场景加载、手机横屏、关卡交互、蛋糕弹窗与晚安衔接；关闭本地试玩服务后再次访问公网网址。实际结果见 PERFORMANCE.md。

官方配置参考：https://vite.dev/guide/static-deploy.html#github-pages
