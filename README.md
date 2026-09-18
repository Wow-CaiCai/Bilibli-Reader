# Bilibili Reader Userscript

供脚本猫、Tampermonkey 等用户脚本管理器使用的 B 站阅读模式。

## 安装

安装项目根目录中的 `Bilibli-Reader.user.js`，或安装 `release` 文件夹中的最新 `.user.js` 文件。

更新时需要允许以下网络访问权限：

- `api.bilibili.com`
- `aisubtitle.hdslb.com`

安装或更新后刷新已经打开的 B 站视频页面。

## 使用

1. 打开 B 站视频页面。
2. 点击视频标题区域右侧的“阅读”按钮；也可以从脚本菜单选择“进入阅读模式”。
3. 点击阅读视图右上角的关闭按钮，或从脚本菜单选择“退出阅读模式”。

## 构建

运行 `scripts/build_userscript.py`，生成的脚本会写入项目根目录和 `release` 文件夹。
