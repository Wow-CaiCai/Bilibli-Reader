# Bilibili Reader

## 让视频，也能读。

一段课程，一场访谈，一次分享。值得细看的内容，也值得慢慢读。

Bilibili Reader 为 B 站与 YouTube 带来阅读模式。把视频里的字幕展开成连续全文，让画面、文字和章节随播放联动。先浏览，再细看，或回到刚才那句话。按你的节奏来。

[安装到脚本猫](https://scriptcat.org/zh-CN/script-show-page/8038) · [安装到 Greasy Fork](https://greasyfork.org/zh-CN/scripts/596599-bilibili-reader-%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E9%98%85%E8%AF%BB%E6%A8%A1%E5%BC%8F) · [GitHub](https://github.com/Wow-CaiCai/Bilibli-Reader)

<!-- 配图 01A：哔哩哔哩阅读模式全景，展示原生播放器、连续字幕和当前播放高亮。 -->
**哔哩哔哩**

![哔哩哔哩阅读模式全景截图](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/reader-bilibili.png)

<!-- 配图 01B：YouTube 阅读模式全景，展示原生播放器、连续字幕和已有章节。 -->
**YouTube**

![YouTube 阅读模式全景截图](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/reader-youtube.png)

## 打开视频。文字就在旁边。

熟悉的播放页，多了一栏可以直接阅读的字幕。

在 B 站，字幕面板位于弹幕列表上方；在 YouTube，位于推荐视频上方。展开就能浏览全文，收起便能继续看视频。点击「字幕」右侧的书本按钮，即可进入阅读模式。

<!-- 配图 02A：哔哩哔哩普通播放页，展示弹幕列表上方的字幕面板、书本入口和工具栏。 -->
**哔哩哔哩**

![哔哩哔哩普通播放页与字幕面板截图](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/native-page-bilibili.png)

<!-- 配图 02B：YouTube 普通播放页，展示推荐视频上方的字幕面板、书本入口和工具栏。 -->
**YouTube**

![YouTube 普通播放页与字幕面板截图](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/native-page-youtube.png)

## 字幕工具栏，随手就会。

哔哩哔哩与 YouTube 使用相同的控件排列。工具栏从左到右，依次是「字幕」、书本、定位、主题、语言、字号和字重；普通播放页的最右侧还有展开或收起按钮。

下图以哔哩哔哩为例，将普通播放页的工具栏单独放大，1–8 的编号与说明表逐项对应。把鼠标停在图标上，也能查看按钮名称。

<!-- 配图 03A：裁出哔哩哔哩字幕工具栏，按从左到右的控件顺序添加 1–8 编号。 -->
**哔哩哔哩**

![哔哩哔哩字幕工具栏控件编号说明](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/subtitle-controls-bilibili.png)

| 编号 | 控件 | 如何识别 | 用途 |
| --- | --- | --- | --- |
| 1 | **字幕** | 工具栏左侧的「字幕」文字 | 在普通播放页点击，可展开或收起字幕面板；阅读模式中作为标题显示。 |
| 2 | **阅读模式** | 打开的书本图标 | 点击进入阅读模式；在阅读模式中再次点击，返回普通播放页。 |
| 3 | **回到当前字幕** | 圆形定位图标 | 回到正在播放的那句话，并恢复自动跟随。普通播放页的字幕已收起时，也会展开面板。 |
| 4 | **主题** | 太阳图标 | 每次点击，依次切换浅色、深色和纸张主题。 |
| 5 | **字幕语言** | 显示语言名称的下拉框 | 选择当前视频提供的字幕语言，切换后显示对应全文。可选语言取决于视频本身。 |
| 6 | **字号** | 显示字号数字的下拉框 | 调整字幕文字大小。选择更大的数字，文字会更大。 |
| 7 | **字重** | 显示 300～700 的下拉框 | 调整字幕文字的粗细。数值越大，文字越粗。 |
| 8 | **展开 / 收起** | 普通播放页最右侧的箭头 | 展开全文，或收起字幕面板，为页面留出更多空间。 |

阅读视图右上角的「×」也能退出阅读模式。刷新页面后会回到普通播放页，想继续阅读，再点一次书本按钮即可。

## 看得连贯。读得完整。

字幕以连续全文呈现，方便快速浏览内容，也方便回看前后的解释。播放到哪里，文字就高亮到哪里；在阅读模式中，当前字幕还会以下划线标记。

读到想听的地方，点击那句话，视频便会跳转到对应时刻。手动滚动字幕时，自动跟随会暂时暂停；点击「回到当前字幕」，就能回到正在播放的位置。

<!-- 配图 04A：哔哩哔哩阅读模式中的字幕区域，展示连续全文、当前句下划线及「回到当前字幕」按钮。 -->
**哔哩哔哩**

![哔哩哔哩连续字幕与当前句高亮特写](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/playback-follow-bilibili.png)

## 长视频，也有清晰的脉络。

视频已有的章节显示在播放器下方，当前章节随播放高亮。点击章节，直接抵达想看的部分。

B 站的多分集合集还会在阅读视图顶部显示分集列表，让一整套课程或系列视频接着看、接着读。

<!-- 配图 05A：从阅读模式截图中分别裁出顶部合集与底部章节栏，上下排列展示。 -->
**哔哩哔哩**

上方为合集选集，下方为章节导航，当前分集与章节以蓝色标记。

![哔哩哔哩合集选集与章节导航特写](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/chapters-bilibili.png)

<!-- 配图 05B：裁出 YouTube 章节栏，展示时间戳、章节标题及当前章节高亮。 -->
**YouTube**

![YouTube 章节导航与当前章节高亮特写](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/chapters-youtube.png)

## 给画面和文字，恰好的空间。

宽屏下，视频与字幕并排呈现。拖动中间的分隔条，就能调整两侧宽度，让画面或文字多一点空间。视频保持原始比例，章节区域也随视频宽度调整。

YouTube 在窄屏窗口中会按视频、章节、字幕的顺序排列。从并排观看，到上下阅读，随窗口宽度自然变化。

下图以哔哩哔哩为例，放大了视频与字幕之间的分隔区域，蓝色标注指向可拖动的位置。

<!-- 配图 06A：裁出视频与字幕之间的分隔区域，蓝色箭头与虚线为说明标注。 -->
**哔哩哔哩**

![哔哩哔哩视频与字幕之间的分隔区域标注](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/layout-bilibili.png)

## 读起来，合你的习惯。

浅色、深色、纸张，三种主题随时切换。字号与字重也能在字幕工具栏中调整，让文字更适合当前的屏幕和阅读习惯。

视频提供多种字幕时，可以直接切换语言。浏览课程内容、回顾访谈观点，或配合视频整理学习笔记，都从这里开始。

下图以哔哩哔哩为例，展示浅色主题下的字幕样式，示例字号为 19、字重为 600。主题、语言、字号和字重都可在上方工具栏中调整。

<!-- 配图 07A：裁出阅读模式的浅色字幕面板，展示字号 19、字重 600 与语言选择。 -->
**哔哩哔哩**

![哔哩哔哩浅色字幕样式与语言、字号、字重控件特写](https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/docs/images/reading-style-bilibili.png)

## 几步安装，就能开始。

1. 在浏览器中安装 **脚本猫（ScriptCat）** 或 **Tampermonkey（篡改猴）** 扩展。
2. 打开 Bilibili Reader 的[脚本猫页面](https://scriptcat.org/zh-CN/script-show-page/8038)或 [Greasy Fork 页面](https://greasyfork.org/zh-CN/scripts/596599-bilibili-reader-%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E9%98%85%E8%AF%BB%E6%A8%A1%E5%BC%8F)，点击「安装脚本」。
3. 在脚本管理器中确认安装。
4. 打开或刷新 B 站、桌面版 YouTube 的视频播放页，等待字幕面板加载。

也可以在脚本管理器中安装仓库里的 [Bilibli-Reader.user.js](https://github.com/Wow-CaiCai/Bilibli-Reader/blob/main/Bilibli-Reader.user.js)。脚本更新后，刷新视频页面即可加载。

## 关于字幕与支持范围。

支持 B 站视频播放页、稍后再看播放页，以及桌面版 YouTube 视频播放页。站内切换视频时，字幕与章节会随当前视频更新。

- **B 站字幕**：读取当前视频可用的字幕轨道。
- **YouTube 字幕**：仅使用视频提供的非自动生成字幕。只有自动生成字幕的视频会提示「当前视频无字幕」。
- **字幕语言**：可选语言取决于视频本身提供的字幕。
- **没有字幕**：普通播放页的字幕面板会自动收起，仍可进入阅读模式，使用视频已有的章节。
- **没有章节**：阅读模式保留视频与字幕，不显示章节区域。
- **加载失败**：普通播放页的字幕面板提供「重试」入口。

章节与合集同样取决于视频本身是否提供。离开 YouTube 视频播放页时，会自动退出阅读布局。
