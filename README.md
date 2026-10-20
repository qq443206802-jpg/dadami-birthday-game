# dadami birthday game

**制作人：Moon**  
中文封面：**今天，给达大米过生日。**

两只虎皮鹦鹉，在中山大学深圳校区，悄悄准备一场生日冒险。

## 在线游玩

GitHub Pages：https://qq443206802-jpg.github.io/dadami-birthday-game/

部署成功后可直接分享，不需要启动本地服务器、登录游戏或调用AI。寿星称呼、双鸟名字和祝福可通过右上角设置修改，保存在当前浏览器。

## 玩法

方向键 / A、D移动；空格跳跃，小蓝可以在空中再次扑翼；E互动；Q切换伙伴。手机横屏使用触屏按钮。掉落回到安全点；问答可重试。约10—15分钟。

路线：西南门 → 图书馆 → 药学院五楼 → 524实验室 → 细胞房 → 526休息室 → 西园五栋。

- 保安问答与通行章拼图、图书馆找不同、电梯消消乐。
- 524试剂 / 生物力学问答，以及一次箱子开门机关。
- 细胞房MSC、T细胞和上皮样细胞的形态观察与判断。
- 研究生日常九宫格、组会三题、下班整理和生日派对。
- 宿舍终点自动弹出蓝色旋转蛋糕，三根蜡烛可点亮 / 吹灭；最后两只小鸟在蛋糕前安睡。

校园与室内是艺术化游戏场景。细胞图片是合成教学示意，不是实验数据。

## 本地开发

需要Node.js 22或更新版本。

```sh
npm ci
npm run dev
npm test
npm run build
node scripts/audit-build.mjs
npm run preview
```

构建输出为dist。游戏本体需要HTTP服务器；独立的public/birthday-cake.html可直接双击打开。

## 发布与性能

GitHub Actions自动测试、构建和部署。设置见[DEPLOYMENT.md](docs/DEPLOYMENT.md)，实测结果见[PERFORMANCE.md](docs/PERFORMANCE.md)。

添加?perf=1可临时显示游戏更新帧率、帧间隔和长任务；记录只留在当前页面。

第三方代码许可见[public/licenses](public/licenses)。游戏素材为本项目绘制，原始照片与本地生成中间文件未上传。
