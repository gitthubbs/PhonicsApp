PhonicsApp Android 调试规范化流程
前置条件

安装 Android Studio 和 Android SDK，确保 ANDROID_HOME 环境变量正确指向 SDK 路径。

已安装 Node.js 与 npm，并可在终端使用 npm 命令。

项目使用 Capacitor 集成 Android（不是 Cordova），已在项目根目录初始化 Capacitor。

Android 模拟器已创建并可启动。

1. 确保本地前端代码可用

在项目根目录运行：

# 安装依赖（如果没安装过）
npm install

# 启动前端开发服务
npm run dev


确保浏览器可以访问 http://localhost:5173/ 并正常显示应用界面。

2. 构建前端生产代码

每次需要同步到安卓时，都应该生成最新前端静态资源：

npm run build


Vue 会生成 dist/ 目录（或你在 vite.config.js 中设置的输出目录）。

Capacitor 会读取这个目录来更新 Android 项目。

3. 同步前端到安卓项目

在项目根目录
D:\AndroidStudioProjects\PhonicsApp\phonics-web>
执行：

npx cap sync android


说明：

sync 会执行：

npx cap copy android → 拷贝前端静态资源到 Android 项目。

npx cap update android → 更新 Capacitor 配置（插件、依赖等）。

如果 Android 平台还没添加（第一次运行），需要先执行：

npx cap add android

4. 打开 Android Studio 或命令行运行
   方法一：通过 Android Studio

运行：

npx cap open android


Android Studio 会打开 android/ 工程，检查 SDK、Gradle 等配置。

选择模拟器设备，点击 Run，即可在模拟器调试。

方法二：命令行运行

启动模拟器（假设已有 AVD）：

emulator -avd <你的模拟器名称>


在项目 Android 目录下执行：

./gradlew assembleDebug
./gradlew installDebug


assembleDebug → 编译 APK

installDebug → 安装到模拟器

5. 更新调试时的快捷步骤

每次修改 Vue 前端后，只需：

npm run build
npx cap copy android
npx cap open android


在 Android Studio 中点击 Run 即可快速刷新模拟器。

6. 注意事项

如果修改了 Capacitor 插件配置或者 capacitor.config.ts/js，要用 npx cap update android 代替 copy。

安卓 SDK / JDK 版本要匹配 Gradle 与 Android Gradle Plugin 版本，否则可能报错。

可以在 package.json 加个 script 快捷命令：

"scripts": {
"android": "npm run build && npx cap sync android && npx cap open android"
}


以后只需运行：

npm run android


即可完成一条龙同步和打开 Android Studio。