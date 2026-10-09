// ==UserScript==
// @name         小书吏 ｜ 将哔哩哔哩与YouTube视频誊写为文章
// @namespace    https://github.com/bilibli-reader
// @version      0.0.10
// @description  将哔哩哔哩与 YouTube 视频字幕誊写为可阅读的文章，支持连续字幕、章节联动、点击跳转与语言切换
// @author       Wow-CaiCai
// @license      MIT
// @homepageURL  https://github.com/Wow-CaiCai/Bilibli-Reader
// @source       https://github.com/Wow-CaiCai/Bilibli-Reader
// @supportURL   https://github.com/Wow-CaiCai/Bilibli-Reader/issues
// @updateURL    https://raw.githubusercontent.com/Wow-CaiCai/Bilibli-Reader/main/Bilibli-Reader.user.js
// @downloadURL  https://raw.githubusercontent.com/Wow-CaiCai/Bilibli-Reader/main/Bilibli-Reader.user.js
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/watchlater/*
// @match        https://www.bilibili.com/list/watchlater*
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFHUlEQVR4nO2ZTWhUVxTH/+fed99MMk4+KhNrRFE0mBhdaCVYuphaBNtFa2kdqYqlqIuiCKUbwU0qFOqi0rrqQil1ozQjRdHaUig6pVCtiKT1I2mrbfzERGOcfM3Me/ecLsbRxMR0JkYHy/zg8e77POd/73nnfjygRIkSzzQ04kwsph/3pdHOTkokXmZgO2fPNKto9LiqqamReM7Mve1h4ve2RxKP26GHIwX814U8kPulZpXdZ4XQqPfkZ/tR99OwcjSq63nKzp5k36x0KsUgKlgHQaW11m0zplXvO/3D/jYAWLB07dzOW91rfM9vIOIACzAnXI7aqkrA0YAwQArie+jo7kFHfxoOPXCaRaQsEFQVFaF/alTnh4lEwuY00X27gDS9urbids/Azdgby4NTp0yGiBSmQYCM7+Ns20X89MuZAWPU20rBZjL2YNPiReWN9bOhlYY1CnVHDyMaqUbVtGnw02mYYBA3//wLx3zClWXLoFMWQgQRgesSrt/oxpGj32dCgYoprYm9PTmfnaH2n6+tletd5++sW7m8Zl7dTMH4I4n37Dtc/vFnew4QRDa/v6F804YVHgOKGHAUcObMCdi+JIxYsPVhxMIf6ENj4wKsXv8WMhYgDTADYQX5ubWDDh460h2ZHhgWTc7Dlgmke5J92rdWmJmUUnl7TQBEAKWU3rjmdfnm2x9DKY+xft0K6UmK8X0GCUOHFNKeDwbBF4CB7J4IqYyH276F12NBWoOZkQkpSfb2EYhGJJgRAgBAKwVHa1gi6AIE5PCtBYmihY11cmfAIugK9fUxHEcDTNBa3Q/NoTEMAEQErTVYA6T1vWOFR1XkqAImAiKC4ziklIBAKDwd5Efh1VsAImMly4nhiQp4GpQEFJuSgGJTElBsSgKKTdEF5Ibs4+21iy7AMQae78MxZnzPT7A/eSMCOK6Lv9va0f77OcxfvBCOGyj4PUVpARHAMQ7aT/6Ka04Ac3Z9ikt3+3Gp9Tc4xqCQaCpKC5AC2PNATUtQt3MHnMogQvUNaN+0BWBb0Dzw6QtQCpwCZmzdBjcSAQzgdVs41VWo3/0lbG8veACgPCdSxQkhC7i1EQgAyQjI0eBBAbkGpuY5iA/kOwMqzkdMWcdB9MBRRQALhJG380ARs9CoTo5j3ln0fuBxeeYFjAwhImtZxDLEt1xQTs4+roSZAa0JDxKiMLMQaYhwQXHCzGBWwiwgkH34+jABmXSKwLaiMmRIK5BW4/pESCuTzTAiuTEOVVYaMhoQLqzRmRXCBhQuNxDxK7xMelgF5DwUiFB41UcpFerd+V1rb9Mfd64xs6W810YJUFAIh9zBRbMmharDZUvcgFtpPIUyIHn51uCJc5f7e5P96XKAx1ydHiZABEFXy8WOpKLQ1FNl6bJBiBCIhi3uItp8zElsX+rP/eDEylQ6HU/1dkMpnbehoS/LZPyr29YuvnDj9IEX7vb7NPOlNac+bznZ4BozHcgOJQrpbZktyiZNRtA171zY9eLXOV+HCcipmv3e/unhyVPnG06JcP55TcQS4MDCj3g+vdtvg6+4dy90AUCmqiFSToPHjea9pNxOwAdI5103pEREhci7ffXsua9WXxm1BSaaBZuPbrVOxQ4QQaWT285+8donT8LOKAKEYrG4GvM3zxhE50Wo5nyXxOOr7NyNh7aARLXvfnMXYi06Oi9CifNd45q5xADE4zEG6MmvVwIAmkWNWn6WiMVadCzW8tg/DUuUKPE/5l84MhkVkUnJNwAAAABJRU5ErkJggg==
// @run-at       document-idle
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      api.bilibili.com
// @connect      aisubtitle.hdslb.com
// @connect      i0.hdslb.com
// @connect      i1.hdslb.com
// @connect      i2.hdslb.com
// @connect      *.hdslb.com
// @connect      www.youtube.com
// @connect      youtube.com
// ==/UserScript==

(() => {
  "use strict";

  const USERSCRIPT_SETTINGS_KEY = "bilibli-reader-settings";
  const runtimeListeners = [];
  const storageListeners = [];

  GM_addStyle("#blr-native-transcript-panel {\n  --blr-native-transcript-body-height: 439px;\n  --blr-native-transcript-font-size: 14px;\n  --blr-native-transcript-font-weight: 500;\n  --blr-native-transcript-surface: var(--bg1, #fff);\n  --blr-native-transcript-text: var(--text1, #18191c);\n  --blr-native-transcript-border: var(--line_regular, #e3e5e7);\n  --blr-native-transcript-active: rgba(0, 174, 236, 0.12);\n  width: 100%;\n  min-width: 0;\n  position: relative;\n  z-index: 20;\n  margin: 0 0 12px;\n  box-sizing: border-box;\n  isolation: isolate;\n  pointer-events: auto;\n  color: var(--text1, #18191c);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", sans-serif;\n}\n\n#blr-native-transcript-panel button,\n#blr-native-transcript-panel select,\n#blr-native-transcript-panel .blr-native-transcript-body,\n#blr-native-transcript-panel .blr-native-transcript-list {\n  pointer-events: auto;\n}\n\n.blr-native-transcript-header {\n  width: 100%;\n  height: 44px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  margin: 0;\n  padding: 0 6px 0 10px;\n  box-sizing: border-box;\n  border-radius: 6px;\n  background: var(--bg2, #f1f2f3);\n  color: var(--text1, #18191c);\n  font: inherit;\n}\n\n.blr-native-transcript-title-button {\n  -webkit-appearance: none;\n  appearance: none;\n  min-width: 32px;\n  flex: 0 0 auto;\n  align-self: stretch;\n  margin: 0;\n  padding: 0;\n  overflow: hidden;\n  border: 0;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  font-size: 15px;\n  font-weight: 500;\n  line-height: 1;\n  text-align: left;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  cursor: pointer;\n}\n\n.blr-native-transcript-controls {\n  min-width: 0;\n  display: flex;\n  flex: 1 1 auto;\n  flex-wrap: nowrap;\n  align-items: center;\n  gap: 4px;\n}\n\n.blr-native-transcript-reader-button,\n.blr-native-transcript-return-button,\n.blr-native-transcript-theme-button {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 26px;\n  height: 26px;\n  display: inline-flex;\n  flex: 0 0 26px;\n  align-items: center;\n  justify-content: center;\n  margin: 0;\n  padding: 0;\n  border: 1px solid var(--line_regular, #e3e5e7);\n  border-radius: 50%;\n  background: var(--bg1, #fff);\n  color: var(--text1, #18191c);\n  cursor: pointer;\n}\n\n.blr-native-transcript-reader-button svg,\n.blr-native-transcript-return-button svg,\n.blr-native-transcript-theme-button svg {\n  width: 17px;\n  height: 17px;\n}\n\n.blr-native-transcript-reader-button:hover,\n.blr-native-transcript-return-button:hover,\n.blr-native-transcript-return-button.is-active,\n.blr-native-transcript-theme-button:hover,\n.blr-native-transcript-theme-button.is-active {\n  border-color: var(--brand_blue, #00aeec);\n  color: var(--brand_blue, #00aeec);\n}\n\n.blr-native-transcript-reader-button:focus-visible {\n  outline: 2px solid var(--brand_blue, #00aeec);\n  outline-offset: 2px;\n}\n\n.blr-native-transcript-reader-button:disabled {\n  opacity: 0.6;\n  cursor: wait;\n}\n\n.blr-native-transcript-controls select {\n  -webkit-appearance: none;\n  appearance: none;\n  flex: 0 0 auto;\n  height: 28px;\n  min-width: 0;\n  padding: 0 25px 0 8px;\n  box-sizing: border-box;\n  border: 1px solid var(--line_regular, #e3e5e7);\n  border-radius: 5px;\n  background-color: var(--bg1, #fff);\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='m3 4.5 3 3 3-3' fill='none' stroke='%2318191c' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");\n  background-position: right 7px center;\n  background-repeat: no-repeat;\n  background-size: 12px 12px;\n  color: var(--text1, #18191c);\n  font-size: 12px;\n  outline: none;\n}\n\n.blr-native-transcript-controls select:focus {\n  border-color: var(--brand_blue, #00aeec);\n}\n\n#blr-native-transcript-select {\n  width: auto;\n  max-width: 100%;\n  flex: 1 1 auto;\n  min-width: 0;\n}\n\n#blr-native-transcript-font-size {\n  width: 52px;\n}\n\n#blr-native-transcript-font-weight {\n  width: 60px;\n}\n\n.blr-native-transcript-arrow-button {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 28px;\n  height: 28px;\n  display: inline-flex;\n  flex: 0 0 28px;\n  align-items: center;\n  justify-content: center;\n  margin: 0;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: transparent;\n  color: inherit;\n  cursor: pointer;\n}\n\n.blr-native-transcript-title-button:focus-visible,\n.blr-native-transcript-return-button:focus-visible,\n.blr-native-transcript-theme-button:focus-visible,\n.blr-native-transcript-arrow-button:focus-visible {\n  outline: 2px solid var(--brand_blue, #00aeec);\n  outline-offset: 1px;\n}\n\n.blr-native-transcript-arrow-button:hover {\n  background: rgba(0, 0, 0, 0.06);\n}\n\n.blr-native-transcript-arrow {\n  width: 16px;\n  height: 16px;\n  flex: 0 0 auto;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.6;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n  transform: rotate(90deg);\n  transition: transform 0.18s ease;\n}\n\n#blr-native-transcript-panel.is-folded .blr-native-transcript-arrow {\n  transform: rotate(0deg);\n}\n\n.blr-native-transcript-empty-notice {\n  position: absolute;\n  top: calc(100% - 4px);\n  left: 50%;\n  z-index: 1;\n  transform: translateX(-50%);\n  padding: 4px 8px;\n  border-radius: 8px;\n  background: var(--bg1, #fff);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);\n  color: #00aeec;\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 20px;\n  white-space: nowrap;\n  pointer-events: none;\n  animation: blr-native-transcript-notice-fade 2.2s ease-out forwards;\n}\n\n@keyframes blr-native-transcript-notice-fade {\n  0% { opacity: 0; }\n  8%, 65% { opacity: 1; }\n  100% { opacity: 0; }\n}\n\n.blr-native-transcript-body {\n  height: var(--blr-native-transcript-body-height);\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n  margin-top: 12px;\n  overflow: hidden;\n  box-sizing: border-box;\n  border: 1px solid var(--blr-native-transcript-border);\n  border-radius: 6px;\n  background: var(--blr-native-transcript-surface);\n  color: var(--blr-native-transcript-text);\n}\n\n#blr-native-transcript-panel[data-theme=\"dark\"] {\n  --blr-native-transcript-surface: #0f172a;\n  --blr-native-transcript-text: #e5eefb;\n  --blr-native-transcript-border: rgba(148, 163, 184, 0.28);\n  --blr-native-transcript-active: rgba(0, 174, 236, 0.16);\n}\n\n#blr-native-transcript-panel[data-theme=\"paper\"] {\n  --blr-native-transcript-surface: #f4eddc;\n  --blr-native-transcript-text: #3b3124;\n  --blr-native-transcript-border: rgba(180, 155, 112, 0.34);\n  --blr-native-transcript-active: rgba(0, 174, 236, 0.14);\n}\n\n.blr-native-transcript-body[hidden] {\n  display: none !important;\n}\n\n.blr-native-transcript-list {\n  overflow-anchor: none;\n  scroll-behavior: auto;\n  min-height: 0;\n  flex: 1 1 auto;\n  overflow-x: hidden;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(148, 153, 160, 0.72) transparent;\n}\n\n.blr-native-transcript-list::-webkit-scrollbar {\n  width: 6px;\n}\n\n.blr-native-transcript-list::-webkit-scrollbar-track {\n  background: transparent;\n}\n\n.blr-native-transcript-list::-webkit-scrollbar-thumb {\n  border-radius: 999px;\n  background: rgba(148, 153, 160, 0.72);\n}\n\n.blr-native-transcript-complete {\n  padding: 12px 14px 36px;\n  color: var(--blr-native-transcript-text);\n  font-size: var(--blr-native-transcript-font-size);\n  font-weight: var(--blr-native-transcript-font-weight);\n  line-height: 1.8;\n  letter-spacing: 0;\n  text-align: left;\n  word-break: break-word;\n}\n\n.blr-native-transcript-segment {\n  -webkit-appearance: none;\n  appearance: none;\n  display: inline;\n  margin: 0;\n  padding: 1px 0;\n  border: 0;\n  border-radius: 2px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  letter-spacing: inherit;\n  text-align: inherit;\n  cursor: pointer;\n  user-select: text;\n  -webkit-user-select: text;\n}\n\n.blr-native-transcript-segment:hover {\n  background: rgba(0, 174, 236, 0.1);\n}\n\n.blr-native-transcript-segment.is-active {\n  background: var(--blr-native-transcript-active);\n  text-decoration-line: underline;\n  text-decoration-color: var(--brand_blue, #00aeec);\n  text-decoration-thickness: 2px;\n  text-underline-offset: 4px;\n}\n\n.blr-native-transcript-segment:focus-visible {\n  outline: 2px solid rgba(0, 174, 236, 0.42);\n  outline-offset: 1px;\n}\n\n.blr-native-transcript-state {\n  min-height: 100%;\n  display: flex;\n  flex: 1 1 auto;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n  padding: 24px;\n  box-sizing: border-box;\n  color: var(--text3, #9499a0);\n  font-size: 13px;\n  text-align: center;\n}\n\n.blr-native-transcript-state button {\n  height: 30px;\n  padding: 0 14px;\n  border: 1px solid var(--brand_blue, #00aeec);\n  border-radius: 5px;\n  background: transparent;\n  color: var(--brand_blue, #00aeec);\n  cursor: pointer;\n}\n\n.blr-native-transcript-state button:hover {\n  background: rgba(0, 174, 236, 0.08);\n}\n\n/* The YouTube panel sits above recommendations in the secondary column,\n   which also handles narrow screens and theater mode without moving the player. */\n#blr-native-transcript-panel[data-platform=\"youtube\"][data-theme=\"light\"] {\n  --blr-native-transcript-surface: var(--yt-spec-base-background, #fff);\n  --blr-native-transcript-text: var(--yt-spec-text-primary, #0f0f0f);\n  --blr-native-transcript-border: var(--yt-spec-10-percent-layer, #e5e5e5);\n  color: var(--yt-spec-text-primary, #0f0f0f);\n}\n\n#blr-native-transcript-panel[data-platform=\"youtube\"] .blr-native-transcript-header {\n  gap: 4px;\n  padding: 0 6px 0 10px;\n  background: var(--yt-spec-badge-chip-background, #f2f2f2);\n  color: var(--yt-spec-text-primary, #0f0f0f);\n  border-radius: 12px;\n}\n\n#blr-native-transcript-panel[data-platform=\"youtube\"] .blr-native-transcript-title-button {\n  flex: 0 0 auto;\n}\n\n#blr-native-transcript-panel[data-platform=\"youtube\"] .blr-native-transcript-controls {\n  flex: 1 1 auto;\n  flex-wrap: nowrap;\n  gap: 4px;\n}\n\n#blr-native-transcript-panel[data-platform=\"youtube\"] #blr-native-transcript-select {\n  width: auto;\n  max-width: 100%;\n  flex: 1 1 auto;\n  min-width: 0;\n}\n\n#blr-native-transcript-panel[data-platform=\"youtube\"] #blr-native-transcript-font-size {\n  width: 52px;\n}\n\n#blr-native-transcript-panel[data-platform=\"youtube\"] #blr-native-transcript-font-weight {\n  width: 60px;\n}\n\n#blr-native-transcript-panel[data-platform=\"youtube\"] .blr-native-transcript-body {\n  margin-top: 8px;\n  border-radius: 12px;\n}\n\n[data-blr-youtube-transcript-open] > ytd-engagement-panel-section-list-renderer[target-id=\"PAmodern_transcript_view\"],\n[data-blr-youtube-transcript-open] > ytd-engagement-panel-section-list-renderer[target-id=\"engagement-panel-searchable-transcript\"] {\n  display: none !important;\n}\n#blr-reading-view {\n  position: fixed;\n  left: 16px;\n  right: 16px;\n  bottom: 16px;\n  height: min(76vh, 860px);\n  z-index: 2147483646;\n  display: none;\n  padding: 20px 22px;\n  box-sizing: border-box;\n  background: #fff;\n  border: 1px solid #e5e7eb;\n  border-radius: 18px;\n  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.16);\n  font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Helvetica Neue\",\n    Arial, sans-serif;\n}\n\n#blr-reading-view.open {\n  display: block;\n}\n\n/* Move the player and subtitle panel together while the page dissolves. */\nhtml[data-blr-reader-transition]::view-transition {\n  pointer-events: none;\n}\n\nhtml[data-blr-reader-transition]::view-transition-image-pair(blr-reader-player),\nhtml[data-blr-reader-transition]::view-transition-image-pair(blr-reader-transcript) {\n  isolation: auto;\n}\n\nhtml[data-blr-reader-transition]::view-transition-new(blr-reader-player),\nhtml[data-blr-reader-transition]::view-transition-new(blr-reader-transcript) {\n  mix-blend-mode: normal;\n  height: 100%;\n  object-fit: fill;\n}\n\n/* Both directions share the return movement's duration and easing. */\nhtml[data-blr-reader-transition]::view-transition-group(root) {\n  animation: none;\n}\n\nhtml[data-blr-reader-transition]::view-transition-group(blr-reader-transcript) {\n  animation-duration: 300ms;\n  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n/* Translate both page templates without stretching either panel's text. The\n   fixed group accommodates both sizes while their original layouts crossfade. */\nhtml[data-blr-reader-transcript-transition]::view-transition-group(blr-reader-transcript) {\n  width: var(--blr-transcript-width) !important;\n  height: var(--blr-transcript-height) !important;\n  top: 0 !important;\n  left: 0 !important;\n  transform-origin: 0 0 !important;\n  animation-name: blr-reader-transcript-move !important;\n  animation-fill-mode: both !important;\n}\n\nhtml[data-blr-reader-transcript-transition]::view-transition-old(blr-reader-transcript) {\n  width: var(--blr-transcript-from-width) !important;\n  height: var(--blr-transcript-from-height) !important;\n  object-fit: fill;\n  mix-blend-mode: normal;\n}\n\nhtml[data-blr-reader-transcript-transition]::view-transition-new(blr-reader-transcript) {\n  width: var(--blr-transcript-to-width) !important;\n  height: var(--blr-transcript-to-height) !important;\n  object-fit: fill;\n}\n\n@keyframes blr-reader-transcript-move {\n  from { transform: translate(var(--blr-transcript-from-x), var(--blr-transcript-from-y)); }\n  to { transform: translate(var(--blr-transcript-to-x), var(--blr-transcript-to-y)); }\n}\n\n/* Use one transform on a fixed-size bitmap. The default shared-element\n   width/height animation can resize the native video surface a second time. */\nhtml[data-blr-reader-transition]::view-transition-group(blr-reader-player) {\n  width: var(--blr-transition-player-width) !important;\n  height: var(--blr-transition-player-height) !important;\n  top: 0 !important;\n  left: 0 !important;\n  transform-origin: 0 0 !important;\n  animation: blr-reader-player-move 300ms cubic-bezier(0.4, 0, 0.2, 1) both !important;\n}\n\nhtml[data-blr-reader-transition]::view-transition-image-pair(blr-reader-player) {\n  width: 100%;\n  height: 100%;\n  animation: none !important;\n}\n\n@keyframes blr-reader-player-move {\n  from {\n    transform: translate(var(--blr-transition-player-from-x), var(--blr-transition-player-from-y)) scale(1);\n  }\n  to {\n    transform: translate(var(--blr-transition-player-to-x), var(--blr-transition-player-to-y))\n      scale(var(--blr-transition-player-scale-x), var(--blr-transition-player-scale-y));\n  }\n}\n\nhtml[data-blr-reader-transition]::view-transition-old(root) {\n  animation: blr-reader-fade-out 180ms ease-in both;\n}\n\nhtml[data-blr-reader-transition]::view-transition-new(root) {\n  animation: blr-reader-fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1) both;\n}\n\n/* Move a stable captured frame. The native player's live surface can resize\n   internally during a mode switch and otherwise scale twice in the group. */\nhtml[data-blr-reader-transition]::view-transition-old(blr-reader-player) {\n  animation: none !important;\n  transform: none !important;\n  opacity: 1;\n  width: 100%;\n  height: 100%;\n  object-fit: fill;\n  mix-blend-mode: normal;\n}\n\nhtml[data-blr-reader-transition]::view-transition-new(blr-reader-player) {\n  animation: none;\n  opacity: 0;\n}\n\n/* Native layout changes must finish before the transition captures its target.\n   The shared snapshot handles motion; host-page CSS must not add another one. */\nhtml[data-blr-reader-transition] :is(\n  .left-container, .scroll-sticky, #playerWrap, .player-wrap, #bilibili-player,\n  .bpx-player-container, .bpx-player-video-area, .bpx-player-primary-area, .bpx-player-inner\n) {\n  transition: none !important;\n  animation: none !important;\n}\n\nhtml[data-blr-reader-transition]::view-transition-old(blr-reader-transcript) {\n  animation: blr-reader-fade-out 300ms cubic-bezier(0.4, 0, 0.2, 1) both;\n  mix-blend-mode: normal;\n  height: 100%;\n  object-fit: fill;\n}\n\nhtml[data-blr-reader-transition]::view-transition-new(blr-reader-transcript) {\n  animation: blr-reader-fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1) both;\n}\n\n/* Lightweight entrance on browsers without snapshot transitions. */\nhtml[data-blr-reader-entering=\"1\"] #blr-reading-inline-host,\nhtml[data-blr-reader-entering=\"1\"] #blr-reading-view[data-blr-reader-ready=\"1\"] .blr-reading-topbar {\n  animation: blr-reader-panel-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both;\n}\n\n@keyframes blr-reader-fade-in {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n@keyframes blr-reader-fade-out {\n  from { opacity: 1; }\n  to { opacity: 0; }\n}\n\n@keyframes blr-reader-panel-in {\n  from { opacity: 0; transform: translateY(8px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html[data-blr-reader-transition]::view-transition-group(*),\n  html[data-blr-reader-transition]::view-transition-old(*),\n  html[data-blr-reader-transition]::view-transition-new(*),\n  html[data-blr-reader-entering=\"1\"] #blr-reading-inline-host,\n  html[data-blr-reader-entering=\"1\"] #blr-reading-view .blr-reading-topbar {\n    animation: none !important;\n  }\n}\n\n#blr-reading-view[data-blr-reader-ready=\"0\"] {\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n}\n\n.blr-reading-layout {\n  min-height: 0;\n  height: 100%;\n  display: grid;\n  grid-template-columns: 240px minmax(0, 1fr);\n  gap: 28px;\n}\n\n.blr-reading-rail {\n  min-height: 0;\n  display: grid;\n  grid-template-rows: auto auto minmax(0, 1fr);\n  gap: 10px;\n  align-content: start;\n}\n\n.blr-reading-stage {\n  min-height: 0;\n  display: grid;\n  grid-template-rows: auto auto minmax(320px, 1fr) minmax(0, 1fr);\n  gap: 14px;\n}\n\n.blr-reading-header {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 18px;\n}\n\n.blr-reading-header-copy {\n  min-width: 0;\n}\n\n.blr-reading-eyebrow {\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  color: #9ca3af;\n  text-transform: uppercase;\n}\n\n.blr-reading-title {\n  display: block;\n  margin: 0;\n  font-size: 16px;\n  line-height: 1.15;\n  color: #0f172a;\n  word-break: break-word;\n}\n\n.blr-reading-topbar,\n.blr-reading-heading-group {\n  min-width: 0;\n}\n\n.blr-reading-page-title {\n  color: var(--blr-reader-text, #0f172a);\n  display: -webkit-box;\n  font-size: 18px;\n  font-weight: 500;\n  line-height: 1.2;\n  overflow: hidden;\n  overflow-wrap: anywhere;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 2;\n}\n\n.blr-reading-episode-title {\n  color: var(--blr-reader-muted, #64748b);\n  display: -webkit-box;\n  font-size: 14px;\n  font-weight: 600;\n  line-height: 1.3;\n  overflow: hidden;\n  overflow-wrap: anywhere;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 2;\n}\n\n.blr-reading-collection-nav {\n  align-items: flex-start;\n  display: flex;\n  gap: 10px;\n  min-width: 0;\n}\n\n.blr-reading-episode-title[hidden],\n.blr-reading-collection-nav[hidden] {\n  display: none !important;\n}\n\n.blr-reading-collection-list {\n  align-content: flex-start;\n  align-items: center;\n  display: flex;\n  flex: 1 1 auto;\n  flex-wrap: wrap;\n  gap: 6px;\n  height: 70px;\n  min-width: 0;\n  overflow-x: hidden;\n  overflow-y: auto;\n  overscroll-behavior-y: contain;\n  scrollbar-width: none;\n}\n\n.blr-reading-collection-list::-webkit-scrollbar {\n  display: none;\n}\n\n.blr-reading-collection-item {\n  align-items: center;\n  background: transparent;\n  border: 1px solid var(--blr-reader-border, #e2e8f0);\n  border-radius: 999px;\n  color: var(--blr-reader-muted, #64748b);\n  cursor: pointer;\n  display: inline-flex;\n  flex: 0 0 auto;\n  gap: 6px;\n  height: 32px;\n  max-width: 260px;\n  padding: 0 10px 0 7px;\n  font-weight: 600;\n}\n\n.blr-reading-collection-item:hover {\n  border-color: var(--blr-reader-accent, #00aeec);\n  color: var(--blr-reader-text, #0f172a);\n}\n\n.blr-reading-collection-item.is-active {\n  background: var(--blr-reader-accent-soft, rgba(0, 174, 236, 0.12));\n  border-color: var(--blr-reader-accent, #00aeec);\n  color: var(--blr-reader-accent, #00aeec);\n}\n\n.blr-reading-collection-index {\n  align-items: center;\n  background: color-mix(in srgb, currentColor 10%, transparent);\n  border-radius: 999px;\n  display: inline-flex;\n  flex: 0 0 auto;\n  font-size: 10px;\n  font-weight: 700;\n  height: 18px;\n  justify-content: center;\n  min-width: 18px;\n  padding: 0 4px;\n}\n\n.blr-reading-collection-item-title {\n  font-size: 12px;\n  font-weight: 600;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.blr-reading-meta,\n.blr-reading-status {\n  font-size: 14px;\n  line-height: 1.5;\n  color: #6b7280;\n}\n\n.blr-reading-meta {\n  margin-top: 8px;\n}\n\n.blr-reading-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  justify-content: flex-end;\n  transition: opacity 0.2s ease;\n}\n\n.blr-reading-actions[data-blr-icon-hidden=\"1\"] {\n  opacity: 0;\n  pointer-events: none;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .blr-reading-actions {\n    transition: none;\n  }\n}\n\n.blr-reading-actions button {\n  border: 1px solid #e5e7eb;\n  background: #fff;\n  border-radius: 999px;\n  min-height: 36px;\n  padding: 0 14px;\n  font-size: 13px;\n  color: #1f2937;\n  box-sizing: border-box;\n  cursor: pointer;\n}\n\n.blr-reading-icon-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 34px;\n  height: 34px;\n  border: 1px solid #e5e7eb;\n  background: #fff;\n  border-radius: 8px;\n  cursor: pointer;\n  padding: 0;\n  color: #1f2937;\n}\n\n.blr-reading-icon-btn svg {\n  width: 18px;\n  height: 18px;\n  flex: 0 0 auto;\n}\n\n.blr-reading-icon-btn:hover {\n  background: #f3f4f6;\n  border-color: #d1d5db;\n}\n\n.blr-reading-list,\n.blr-reading-transcript {\n  min-height: 0;\n  overflow: auto;\n}\n\n.blr-reading-list {\n  padding-right: 6px;\n}\n\n.blr-reading-main {\n  min-height: 0;\n  overflow: hidden;\n  display: flex;\n  justify-content: center;\n  pointer-events: auto;\n}\n\n.blr-reading-transcript {\n  width: min(100%, 960px);\n  height: 100%;\n  max-height: 100%;\n  margin: 0 auto;\n  padding: 6px 8px 12px;\n  overflow-x: hidden;\n  overflow-y: auto;\n  pointer-events: auto;\n}\n\n.blr-reading-chapter {\n  width: 100%;\n  border: 0;\n  background: transparent;\n  border-radius: 14px;\n  text-align: left;\n  cursor: pointer;\n  user-select: text;\n  -webkit-user-select: text;\n  display: grid;\n  gap: 4px;\n  padding: 8px 10px;\n  color: #4b5563;\n}\n\n.blr-reading-chapter:hover {\n  background: #f9fafb;\n}\n\n.blr-reading-chapter.is-active {\n  background: transparent;\n  box-shadow: none;\n}\n\n.blr-reading-chapter-time {\n  font-size: var(--blr-reader-transcript-font-size);\n  font-weight: 600;\n  color: var(--blr-reader-accent, #00aeec);\n  padding-top: 2px;\n  line-height: 1.4;\n}\n\n.blr-reading-chapter-title {\n  font-size: 13px;\n  line-height: 1.45;\n  color: inherit;\n}\n\n.blr-reading-chapter.is-active .blr-reading-chapter-title {\n  text-decoration-line: underline;\n  text-decoration-color: var(--blr-reader-accent, #00aeec);\n  text-decoration-thickness: 2px;\n  text-underline-offset: 3px;\n}\n\n.blr-reading-empty {\n  padding: 12px 4px;\n  font-size: 14px;\n  color: #94a3b8;\n}\n\n@media (max-width: 1100px) {\n  #blr-reading-view {\n    left: 12px;\n    right: 12px;\n    bottom: 12px;\n    padding: 18px;\n  }\n\n  .blr-reading-layout {\n    grid-template-columns: 210px minmax(0, 1fr);\n    gap: 20px;\n  }\n\n  .blr-reading-title {\n    font-size: 16px;\n  }\n}\n\n@media (max-width: 760px) {\n  #blr-reading-view {\n    top: 72px;\n    height: auto;\n  }\n\n  .blr-reading-layout {\n    grid-template-columns: 1fr;\n    gap: 18px;\n  }\n\n  .blr-reading-stage {\n    grid-template-rows: auto auto minmax(220px, auto) minmax(0, 1fr);\n  }\n\n  .blr-reading-header {\n    flex-direction: column;\n    align-items: stretch;\n  }\n\n  .blr-reading-actions {\n    justify-content: flex-start;\n  }\n\n  .blr-reading-title {\n    font-size: 16px;\n  }\n\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"] {\n  margin: 0 !important;\n  padding: 0 !important;\n  width: 100% !important;\n  min-height: 100% !important;\n  background: #fff !important;\n  overflow-x: hidden !important;\n  overflow-y: auto !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-root {\n  position: absolute;\n  inset: 0;\n  z-index: 2147483646;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view {\n  position: absolute;\n  inset: 0;\n  width: auto;\n  max-width: none;\n  height: 100vh;\n  display: none;\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n  border: 0;\n  border-radius: 0;\n  box-shadow: none;\n  background: transparent;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view.open {\n  display: block;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view[data-blr-reader-ready=\"0\"] {\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-header-copy,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-status {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #viewbox_report,\nbody[data-blr-reader-mode=\"1\"] .video-info-container,\nbody[data-blr-reader-mode=\"1\"] .video-info-title,\nbody[data-blr-reader-mode=\"1\"] .video-info-title-inner {\n  margin: 0 !important;\n  padding: 0 !important;\n  row-gap: 0 !important;\n  column-gap: 0 !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #viewbox_report,\nbody[data-blr-reader-mode=\"1\"] .video-info-container {\n  margin-bottom: 4px !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .left-container,\nbody[data-blr-reader-mode=\"1\"] .scroll-sticky {\n  row-gap: 8px !important;\n  padding-top: 0 !important;\n  overflow: visible !important;\n  transition: none !important;\n  animation: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #playerWrap,\nbody[data-blr-reader-mode=\"1\"] .player-wrap,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-rail {\n  transition: none !important;\n  animation: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .video-info-detail,\nbody[data-blr-reader-mode=\"1\"] .video-info-meta,\nbody[data-blr-reader-mode=\"1\"] .video-data {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view[data-blr-reader-follow=\"manual\"] .blr-reading-main,\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view[data-blr-reader-follow=\"manual\"] .blr-reading-rail {\n  border-color: rgba(148, 163, 184, 0.8);\n  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view[data-blr-reader-follow=\"manual\"] .blr-reading-eyebrow::after {\n  content: \"手动浏览中\";\n  display: inline-block;\n  margin-left: 8px;\n  font-size: 11px;\n  font-weight: 500;\n  color: #94a3b8;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reader-player-host {\n  background: #000 !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #playerWrap {\n  position: static !important;\n  top: auto !important;\n  z-index: auto !important;\n  background: transparent !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .player-wrap,\nbody[data-blr-reader-mode=\"1\"] .scroll-sticky {\n  position: static !important;\n  top: auto !important;\n  z-index: auto !important;\n  background: transparent !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] [data-blr-reader-player-reset=\"1\"] {\n  position: static !important;\n  inset: auto !important;\n  width: auto !important;\n  height: auto !important;\n  transform: none !important;\n  margin: 0 !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .strip-ad-inner,\nbody[data-blr-reader-mode=\"1\"] .inside-wrp,\nbody[data-blr-reader-mode=\"1\"] .inside-bg,\nbody[data-blr-reader-mode=\"1\"] .hinter-msg,\nbody[data-blr-reader-mode=\"1\"] .slide,\nbody[data-blr-reader-mode=\"1\"] .cover.b-img,\nbody[data-blr-reader-mode=\"1\"] .cover.b-img.sleepy,\nbody[data-blr-reader-mode=\"1\"] .b-img.clickable {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] [data-blr-reader-hidden=\"1\"] {\n  display: none !important;\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"],\n#blr-reading-view {\n  --blr-reader-page-bg: #f4f6f8;\n  --blr-reader-surface: #ffffff;\n  --blr-reader-surface-2: #f7f9fc;\n  --blr-reader-border: rgba(15, 23, 42, 0.1);\n  --blr-reader-text: #0f172a;\n  --blr-reader-muted: #64748b;\n  --blr-reader-accent: var(--brand_blue, #00aeec);\n  --blr-reader-accent-soft: rgba(0, 174, 236, 0.12);\n  --blr-reader-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);\n  --blr-reader-transcript-font-size: 14px;\n  --blr-reader-transcript-font-weight: 500;\n  --blr-reader-transcript-line-height: 1.5;\n  --blr-reader-letter-spacing: 0em;\n  --blr-reader-content-max: 980px;\n  color: var(--blr-reader-text);\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-theme=\"dark\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-theme=\"dark\"],\n#blr-reading-view[data-theme=\"dark\"] {\n  --blr-reader-page-bg: #09111f;\n  --blr-reader-surface: #0f172a;\n  --blr-reader-surface-2: #132038;\n  --blr-reader-border: rgba(148, 163, 184, 0.22);\n  --blr-reader-text: #e5eefb;\n  --blr-reader-muted: #9fb0c8;\n  --blr-reader-accent: var(--brand_blue, #00aeec);\n  --blr-reader-accent-soft: rgba(0, 174, 236, 0.14);\n  --blr-reader-shadow: 0 18px 42px rgba(2, 6, 23, 0.42);\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-theme=\"paper\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-theme=\"paper\"],\n#blr-reading-view[data-theme=\"paper\"] {\n  --blr-reader-page-bg: #f4eddc;\n  --blr-reader-surface: #f4eddc;\n  --blr-reader-surface-2: #f4eddc;\n  --blr-reader-border: rgba(180, 155, 112, 0.22);\n  --blr-reader-text: #3b3124;\n  --blr-reader-muted: #756653;\n  --blr-reader-accent: var(--brand_blue, #00aeec);\n  --blr-reader-accent-soft: rgba(0, 174, 236, 0.12);\n  --blr-reader-shadow: 0 18px 40px rgba(112, 93, 64, 0.12);\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"s\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"s\"],\n#blr-reading-view[data-font-scale=\"s\"] {\n  --blr-reader-transcript-font-size: 12.8px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"xs\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"xs\"],\n#blr-reading-view[data-font-scale=\"xs\"] {\n  --blr-reader-transcript-font-size: 11.6px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"l\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"l\"],\n#blr-reading-view[data-font-scale=\"l\"] {\n  --blr-reader-transcript-font-size: 16.4px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"xl\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"xl\"],\n#blr-reading-view[data-font-scale=\"xl\"] {\n  --blr-reader-transcript-font-size: 18.8px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"light\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"light\"],\n#blr-reading-view[data-font-weight=\"light\"] {\n  --blr-reader-transcript-font-weight: 300;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"regular\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"regular\"],\n#blr-reading-view[data-font-weight=\"regular\"] {\n  --blr-reader-transcript-font-weight: 400;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"semibold\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"semibold\"],\n#blr-reading-view[data-font-weight=\"semibold\"] {\n  --blr-reader-transcript-font-weight: 600;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"bold\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"bold\"],\n#blr-reading-view[data-font-weight=\"bold\"] {\n  --blr-reader-transcript-font-weight: 700;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"tighter\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"tighter\"],\n#blr-reading-view[data-letter-spacing=\"tighter\"] {\n  --blr-reader-letter-spacing: -0.072em;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"tight\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"tight\"],\n#blr-reading-view[data-letter-spacing=\"tight\"] {\n  --blr-reader-letter-spacing: -0.036em;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"relaxed\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"relaxed\"],\n#blr-reading-view[data-letter-spacing=\"relaxed\"] {\n  --blr-reader-letter-spacing: 0.036em;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"loose\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"loose\"],\n#blr-reading-view[data-letter-spacing=\"loose\"] {\n  --blr-reader-letter-spacing: 0.072em;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"compact\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"compact\"],\n#blr-reading-view[data-content-width=\"compact\"] {\n  --blr-reader-content-max: 720px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"narrow\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"narrow\"],\n#blr-reading-view[data-content-width=\"narrow\"] {\n  --blr-reader-content-max: 820px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"wide\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"wide\"],\n#blr-reading-view[data-content-width=\"wide\"] {\n  --blr-reader-content-max: 1120px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"full\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"full\"],\n#blr-reading-view[data-content-width=\"full\"] {\n  --blr-reader-content-max: 1280px;\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"] #app,\nbody[data-blr-reader-mode=\"1\"] .left-container,\nbody[data-blr-reader-mode=\"1\"] .right-container,\nbody[data-blr-reader-mode=\"1\"] .right-container-inner,\nbody[data-blr-reader-mode=\"1\"] .video-info-container,\nbody[data-blr-reader-mode=\"1\"] .video-info-detail,\nbody[data-blr-reader-mode=\"1\"] .video-sections-content-list,\nbody[data-blr-reader-mode=\"1\"] .video-container-v1,\nbody[data-blr-reader-mode=\"1\"] .video-container-v3 {\n  background: var(--blr-reader-page-bg) !important;\n  color: var(--blr-reader-text);\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"] #app {\n  min-height: 100vh !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #app {\n  min-width: 0 !important;\n  width: 100% !important;\n  max-width: none !important;\n}\n\n#blr-reading-view,\n#blr-reading-view .blr-reading-meta,\n#blr-reading-view .blr-reading-status,\n#blr-reading-view .blr-reading-chapter {\n  color: var(--blr-reader-text);\n}\n\n#blr-reading-view .blr-reading-layout {\n  gap: 22px;\n}\n\n#blr-reading-view .blr-reading-stage {\n  display: grid;\n  gap: 16px;\n}\n\n#blr-reading-view .blr-reading-header {\n  align-items: flex-start;\n}\n\n#blr-reading-view .blr-reading-title {\n  font-size: 20px;\n  color: var(--blr-reader-text);\n  margin-top: 10px;\n}\n\n#blr-reading-view .blr-reading-meta,\n#blr-reading-view .blr-reading-status {\n  font-size: 14px;\n  color: var(--blr-reader-muted);\n}\n\n#blr-reading-view .blr-reading-actions {\n  gap: 10px;\n}\n\n#blr-reading-view .blr-reading-actions button {\n  border: 1px solid var(--blr-reader-border);\n  background: var(--blr-reader-surface);\n  color: var(--blr-reader-text);\n  box-shadow: none;\n}\n\n#blr-reading-view .blr-reading-main {\n  justify-content: center;\n  background: transparent;\n}\n\n#blr-reading-view .blr-reading-transcript {\n  width: min(100%, var(--blr-reader-content-max));\n}\n\n#blr-reading-view .blr-reading-chapter:hover {\n  background: var(--blr-reader-surface-2);\n}\n\n#blr-reading-view .blr-reading-chapter.is-active {\n  background: var(--blr-reader-accent-soft);\n}\n\n#blr-reading-view .blr-reading-chapter-time {\n  color: var(--blr-reader-accent);\n}\n\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bpx-player-subtitle-wrap,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bpx-player-subtitle-panel,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bpx-player-subtitle-container,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bilibili-player-video-subtitle,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .subtitle-wrap,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host [class*=\"subtitle\"],\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bpx-player-sending-bar,\nbody[data-blr-reading-active=\"1\"] .bpx-player-sending-bar {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view {\n  background: transparent;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-header {\n  left: auto;\n  right: 24px;\n  max-width: min(1100px, calc(100vw - 48px));\n  gap: 14px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-actions {\n  pointer-events: auto;\n  justify-content: flex-end;\n}\n\n/* The native player stays in normal flow; the transcript uses its own scroll. */\nbody[data-blr-reader-mode=\"1\"] .blr-reading-layout,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-stage {\n  display: block;\n  height: auto;\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"] {\n  --blr-reader-page-padding: clamp(16px, 2.8vw, 32px);\n  --blr-reader-layout-gap: clamp(16px, 2vw, 24px);\n  --blr-reader-rail-target-width: clamp(168px, 15vw, 220px);\n  --blr-reader-main-width: min(\n    var(--blr-reader-content-max),\n    calc(100vw - (var(--blr-reader-page-padding) * 2))\n  );\n  --blr-reader-rail-width: min(\n    var(--blr-reader-rail-target-width),\n    max(\n      0px,\n      calc(\n        ((100vw - var(--blr-reader-main-width)) / 2) - var(--blr-reader-page-padding) - var(--blr-reader-layout-gap)\n      )\n    )\n  );\n  --blr-reader-transcript-line-height: 1.404;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"compact\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"compact\"],\n#blr-reading-view[data-line-height=\"compact\"] {\n  --blr-reader-transcript-line-height: 1.32;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"tight\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"tight\"],\n#blr-reading-view[data-line-height=\"tight\"] {\n  --blr-reader-transcript-line-height: 1.404;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"normal\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"normal\"],\n#blr-reading-view[data-line-height=\"normal\"] {\n  --blr-reader-transcript-line-height: 1.5;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"relaxed\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"relaxed\"],\n#blr-reading-view[data-line-height=\"relaxed\"] {\n  --blr-reader-transcript-line-height: 1.596;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"loose\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"loose\"],\n#blr-reading-view[data-line-height=\"loose\"] {\n  --blr-reader-transcript-line-height: 1.692;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-actions {\n  gap: 12px;\n  margin-right: -20px;\n  margin-top: -8px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-header {\n  position: fixed;\n  top: 18px;\n  right: var(--blr-reader-page-padding);\n  left: auto;\n  max-width: calc(100vw - (var(--blr-reader-page-padding) * 2));\n  margin-bottom: 0;\n  z-index: 2147483646;\n  pointer-events: auto;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-topbar {\n  display: grid;\n  gap: clamp(12px, 1.2vw, 20px);\n  grid-template-columns: clamp(300px, 28vw, 520px) minmax(0, 1fr);\n  height: 84px;\n  left: var(--blr-reader-page-padding);\n  min-width: 0;\n  overflow: hidden;\n  pointer-events: auto;\n  position: fixed;\n  right: 174px;\n  top: 6px;\n  z-index: 2147483646;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-heading-group {\n  align-content: center;\n  display: grid;\n  gap: 2px;\n  max-height: 84px;\n  overflow: hidden;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-page-title {\n  font-size: clamp(16px, 1.05vw, 19px);\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-collection-nav {\n  align-self: center;\n  height: 70px;\n  min-width: 0;\n  pointer-events: auto;\n  position: static;\n}\n\n@media (max-width: 1000px) {\n  body[data-blr-reader-mode=\"1\"] .blr-reading-topbar {\n    grid-template-columns: clamp(240px, 34vw, 330px) minmax(0, 1fr);\n  }\n}\n\n@media (max-width: 760px) {\n  body[data-blr-reader-mode=\"1\"] .blr-reading-topbar {\n    grid-template-columns: minmax(190px, 42vw) minmax(0, 1fr);\n    right: 150px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-page-title {\n    font-size: 15px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-episode-title {\n    font-size: 12px;\n  }\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-rail {\n  position: fixed;\n  display: grid !important;\n  left: var(--blr-reader-page-padding) !important;\n  top: 112px !important;\n  width: var(--blr-reader-rail-width) !important;\n  max-height: calc(100vh - 136px) !important;\n  padding: 12px;\n  box-sizing: border-box;\n  background: var(--blr-reader-surface);\n  border: 1px solid var(--blr-reader-border);\n  border-radius: 14px;\n  box-shadow: var(--blr-reader-shadow);\n  pointer-events: auto;\n  z-index: 2147483646;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-has-chapters=\"0\"] .blr-reading-rail,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-has-chapters=\"0\"] .blr-reading-rail,\n#blr-reading-view[data-has-chapters=\"0\"] .blr-reading-rail {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .left-container,\nbody[data-blr-reader-mode=\"1\"] .scroll-sticky,\nbody[data-blr-reader-mode=\"1\"] #playerWrap,\nbody[data-blr-reader-mode=\"1\"] .player-wrap,\nbody[data-blr-reader-mode=\"1\"] h1.video-title,\nbody[data-blr-reader-mode=\"1\"] .video-info-container,\nbody[data-blr-reader-mode=\"1\"] #viewbox_report,\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host {\n  width: min(\n    var(--blr-reader-main-width),\n    var(--blr-reader-player-rendered-width, var(--blr-reader-main-width))\n  ) !important;\n  max-width: min(\n    var(--blr-reader-main-width),\n    var(--blr-reader-player-rendered-width, var(--blr-reader-main-width))\n  ) !important;\n  margin-left: auto !important;\n  margin-right: auto !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host {\n  overflow-anchor: none;\n  scroll-behavior: auto;\n  min-height: 100vh;\n  margin-top: -1px;\n  padding: 0;\n  border: 1px solid var(--blr-reader-border);\n  border-top: 0;\n  border-radius: 0 0 20px 20px;\n  background: var(--blr-reader-surface-2);\n  box-shadow: var(--blr-reader-shadow);\n  box-sizing: border-box;\n  overflow: auto;\n  height: 100vh;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(100, 116, 139, 0.1) transparent;\n  position: relative;\n  isolation: isolate;\n}\n\nbody[data-blr-reader-mode=\"1\"] #playerWrap,\nbody[data-blr-reader-mode=\"1\"] .player-wrap {\n  border: 0;\n  border-radius: 0;\n  background: var(--blr-reader-surface);\n  box-shadow: var(--blr-reader-shadow);\n  box-sizing: border-box;\n  overflow: visible !important;\n  margin-top: -35px !important;\n  height: var(--blr-reader-player-rendered-height, auto) !important;\n  max-height: var(--blr-reader-player-rendered-height, none) !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #playerWrap > *,\nbody[data-blr-reader-mode=\"1\"] .player-wrap > *,\nbody[data-blr-reader-mode=\"1\"] #playerWrap .bpx-player-container,\nbody[data-blr-reader-mode=\"1\"] #playerWrap .bpx-player-video-area,\nbody[data-blr-reader-mode=\"1\"] #playerWrap .bpx-player-primary-area,\nbody[data-blr-reader-mode=\"1\"] #playerWrap .bpx-player-inner,\nbody[data-blr-reader-mode=\"1\"] .player-wrap .bpx-player-container,\nbody[data-blr-reader-mode=\"1\"] .player-wrap .bpx-player-video-area,\nbody[data-blr-reader-mode=\"1\"] .player-wrap .bpx-player-primary-area,\nbody[data-blr-reader-mode=\"1\"] .player-wrap .bpx-player-inner {\n  width: 100% !important;\n  max-width: 100% !important;\n  height: 100% !important;\n  max-height: 100% !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .bpx-player-video-wrap video {\n  width: 100% !important;\n  height: 100% !important;\n  object-fit: contain !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-main {\n  overflow: visible;\n  display: block;\n  width: 100%;\n  background: transparent;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-transcript,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-chapter-title,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-empty {\n  color: var(--blr-reader-text) !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-tail-spacer {\n  width: 100%;\n  min-height: 320px;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-status {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] h1.video-title {\n  display: -webkit-box !important;\n  margin-top: 8px !important;\n  color: transparent !important;\n  font-size: clamp(16px, 1.05vw, 20px) !important;\n  line-height: 1.2 !important;\n  padding: 0 !important;\n  height: auto !important;\n  max-height: 48px !important;\n  overflow: hidden !important;\n  overflow-wrap: anywhere !important;\n  pointer-events: none !important;\n  user-select: none !important;\n  visibility: hidden !important;\n  -webkit-box-orient: vertical !important;\n  -webkit-line-clamp: 2 !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host::-webkit-scrollbar {\n  width: 6px;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host::-webkit-scrollbar-track {\n  background: transparent;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host::-webkit-scrollbar-thumb {\n  background: rgba(100, 116, 139, 0.1);\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host::-webkit-scrollbar-thumb:hover {\n  background: rgba(100, 116, 139, 0.16);\n}\n\n@media (max-width: 1320px) {\n  html[data-blr-reader-mode=\"1\"],\n  body[data-blr-reader-mode=\"1\"] {\n    --blr-reader-layout-gap: clamp(12px, 1.4vw, 16px);\n    --blr-reader-rail-target-width: clamp(144px, 12vw, 168px);\n  }\n}\n\n@media (max-width: 1320px) {\n  html[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"wide\"] .blr-reading-rail,\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"wide\"] .blr-reading-rail,\n  #blr-reading-view[data-content-width=\"wide\"] .blr-reading-rail {\n    display: none !important;\n  }\n}\n\n@media (max-width: 1180px) {\n  body[data-blr-reader-mode=\"1\"] .blr-reading-rail {\n    display: none !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .left-container,\n  body[data-blr-reader-mode=\"1\"] .scroll-sticky,\n  body[data-blr-reader-mode=\"1\"] #playerWrap,\n  body[data-blr-reader-mode=\"1\"] .player-wrap,\n  body[data-blr-reader-mode=\"1\"] h1.video-title,\n  body[data-blr-reader-mode=\"1\"] .video-info-container,\n  body[data-blr-reader-mode=\"1\"] #viewbox_report,\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host {\n    margin-left: auto !important;\n    margin-right: auto !important;\n  }\n}\n\nbody[data-blr-reader-mode=\"1\"] .bpx-player-mini-warp,\nbody[data-blr-reader-mode=\"1\"] .bpx-player-mini-close,\nbody[data-blr-reader-mode=\"1\"] .bpx-player-ending-panel,\nbody[data-blr-reader-mode=\"1\"] .bpx-player-ending-related,\nbody[data-blr-reader-mode=\"1\"] .ad-report,\nbody[data-blr-reader-mode=\"1\"] [class*=\"ad-report\"],\nbody[data-blr-reader-mode=\"1\"] [class*=\"mini-player\"],\nbody[data-blr-reader-mode=\"1\"] [class*=\"picture-in-picture\"] {\n  display: none !important;\n}\n\n.blr-reading-complete {\n  padding: 12px 10px 20px;\n  font-size: var(--blr-reader-transcript-font-size);\n  font-weight: var(--blr-reader-transcript-font-weight);\n  line-height: var(--blr-reader-transcript-line-height);\n  letter-spacing: var(--blr-reader-letter-spacing);\n  color: var(--blr-reader-text);\n  text-align: left;\n}\n\n.blr-reading-complete-segment {\n  display: inline;\n  margin: 0;\n  padding: 1px 0;\n  border: 0;\n  border-radius: 2px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  letter-spacing: inherit;\n  text-align: inherit;\n  cursor: pointer;\n  user-select: text;\n  -webkit-user-select: text;\n}\n\n.blr-reading-complete-segment:hover {\n  background: rgba(0, 174, 236, 0.1);\n}\n\n.blr-reading-complete-segment.is-active {\n  background: var(--blr-reader-accent-soft);\n  box-shadow: 0 0 0 2px var(--blr-reader-accent-soft);\n  -webkit-box-decoration-break: clone;\n  box-decoration-break: clone;\n  text-decoration-line: underline;\n  text-decoration-color: var(--blr-reader-accent);\n  text-decoration-thickness: 2px;\n  text-underline-offset: 4px;\n}\n\n/* Desktop reader: title/player with chapters below | transcript. */\n@media (min-width: 1181px) {\n  html[data-blr-reader-mode=\"1\"],\n  body[data-blr-reader-mode=\"1\"] {\n    --blr-reader-three-column-gap: clamp(16px, 1.4vw, 24px);\n    --blr-reader-three-column-half-gap: clamp(8px, 0.7vw, 12px);\n    --blr-reader-rail-width: clamp(176px, 13vw, 220px);\n    --blr-reader-transcript-width: clamp(320px, 24vw, 440px);\n    --blr-reader-center-offset: clamp(-110px, -5.5vw, -72px);\n    --blr-reader-main-width: max(\n      420px,\n      calc(\n        100vw - (var(--blr-reader-page-padding) * 2) - var(--blr-reader-transcript-width) -\n          var(--blr-reader-three-column-gap)\n      )\n    );\n    overflow: hidden !important;\n  }\n\n  /* Watch Later centers its own player column; align it with the reader's fixed transcript. */\n  body[data-blr-reader-mode=\"1\"] #app.playlist-app #mirror-vdcon {\n    box-sizing: border-box;\n    justify-content: flex-start !important;\n    padding-left: var(--blr-reader-page-padding) !important;\n    padding-right: var(--blr-reader-page-padding) !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #app.playlist-app .playlist-container--left {\n    flex: 0 0 var(--blr-reader-main-width) !important;\n    min-width: 0 !important;\n    width: var(--blr-reader-main-width) !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-rail {\n    left: var(--blr-reader-player-left, var(--blr-reader-page-padding)) !important;\n    top: calc(var(--blr-reader-player-bottom, 72vh) + 12px) !important;\n    bottom: auto !important;\n    width: var(--blr-reader-player-width, var(--blr-reader-main-width)) !important;\n    height: min(112px, calc(100vh - var(--blr-reader-player-bottom, 72vh) - 36px)) !important;\n    min-height: 72px;\n    max-height: none !important;\n    grid-template-rows: auto minmax(0, 1fr);\n    gap: 6px;\n    padding: 10px 12px;\n    border-radius: 10px;\n    overflow: hidden;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-rail .blr-reading-list {\n    display: flex;\n    align-items: stretch;\n    gap: 8px;\n    min-width: 0;\n    padding: 0 0 4px;\n    overflow-x: auto;\n    overflow-y: hidden;\n    scrollbar-width: thin;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-rail .blr-reading-chapter {\n    flex: 0 0 auto;\n    width: auto;\n    min-width: 120px;\n    max-width: 190px;\n    padding: 6px 10px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .left-container,\n  body[data-blr-reader-mode=\"1\"] .scroll-sticky,\n  body[data-blr-reader-mode=\"1\"] h1.video-title,\n  body[data-blr-reader-mode=\"1\"] .video-info-container,\n  body[data-blr-reader-mode=\"1\"] #viewbox_report {\n    width: var(--blr-reader-main-width) !important;\n    max-width: var(--blr-reader-main-width) !important;\n    margin-left: auto !important;\n    margin-right: auto !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .left-container {\n    transform: translateX(var(--blr-reader-center-offset)) !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] h1.video-title {\n    margin-top: 28px !important;\n    margin-bottom: 14px !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #playerWrap,\n  body[data-blr-reader-mode=\"1\"] .player-wrap {\n    margin-top: 0 !important;\n    border: 0;\n    border-radius: 4px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host {\n    position: fixed !important;\n    top: var(--blr-reader-player-top, 98px) !important;\n    right: var(--blr-reader-page-padding) !important;\n    bottom: 24px !important;\n    left: auto !important;\n    width: var(--blr-reader-transcript-width) !important;\n    max-width: var(--blr-reader-transcript-width) !important;\n    min-height: 0 !important;\n    height: auto !important;\n    margin: 0 !important;\n    padding: 0 !important;\n    border: 1px solid var(--blr-reader-border) !important;\n    border-radius: 0 !important;\n    background: var(--blr-reader-surface-2) !important;\n    box-shadow: var(--blr-reader-shadow) !important;\n    overflow-y: auto !important;\n    scroll-padding-top: 46px;\n    z-index: 2147483645;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript-heading {\n    position: sticky;\n    top: 0;\n    display: flex;\n    align-items: center;\n    height: 38px;\n    margin: 0;\n    justify-content: space-between;\n    gap: 6px;\n    padding: 0 6px 0 10px;\n    box-sizing: border-box;\n    color: var(--blr-reader-muted);\n    background: var(--blr-reader-surface-2);\n    border-bottom: 1px solid var(--blr-reader-border);\n    font-size: 12px;\n    font-weight: 700;\n    letter-spacing: 0.08em;\n    z-index: 3;\n    pointer-events: auto;\n    user-select: none;\n  }\n\n  body[data-blr-reader-mode=\"1\"]\n    #blr-reading-inline-host\n    .blr-reading-transcript-heading-title {\n    min-width: 24px;\n    flex: 1 1 auto;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n\n  body[data-blr-reader-mode=\"1\"]\n    #blr-reading-inline-host\n    .blr-reading-transcript-heading-controls {\n    display: flex;\n    flex: 0 0 auto;\n    align-items: center;\n    gap: 4px;\n    letter-spacing: 0;\n  }\n\n  body[data-blr-reader-mode=\"1\"]\n    #blr-reading-inline-host\n    .blr-reading-transcript-tool-button {\n    -webkit-appearance: none;\n    appearance: none;\n    width: 26px;\n    height: 26px;\n    display: inline-flex;\n    flex: 0 0 26px;\n    align-items: center;\n    justify-content: center;\n    margin: 0;\n    padding: 0;\n    border: 1px solid var(--blr-reader-border);\n    border-radius: 50%;\n    background: var(--blr-reader-surface);\n    color: var(--blr-reader-text);\n    cursor: pointer;\n  }\n\n  body[data-blr-reader-mode=\"1\"]\n    #blr-reading-inline-host\n    .blr-reading-transcript-tool-button svg {\n    width: 17px;\n    height: 17px;\n  }\n\n  body[data-blr-reader-mode=\"1\"]\n    #blr-reading-inline-host\n    .blr-reading-transcript-tool-button:hover,\n  body[data-blr-reader-mode=\"1\"]\n    #blr-reading-inline-host\n    .blr-reading-transcript-tool-button.is-active {\n    border-color: var(--blr-reader-accent);\n    color: var(--blr-reader-accent);\n  }\n\n  body[data-blr-reader-mode=\"1\"]\n    #blr-reading-inline-host\n    .blr-reading-transcript-heading-controls\n    select {\n    -webkit-appearance: none;\n    appearance: none;\n    height: 26px;\n    flex: 0 0 auto;\n    padding: 0 23px 0 7px;\n    box-sizing: border-box;\n    border: 1px solid var(--blr-reader-border);\n    border-radius: 5px;\n    background-color: var(--blr-reader-surface);\n    background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='m3 4.5 3 3 3-3' fill='none' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");\n    background-position: right 6px center;\n    background-repeat: no-repeat;\n    background-size: 12px 12px;\n    color: var(--blr-reader-text);\n    font-size: 12px;\n    font-weight: 500;\n    line-height: 1;\n    outline: none;\n  }\n\n  body[data-blr-reader-mode=\"1\"]\n    #blr-reading-inline-host\n    .blr-reading-transcript-heading-controls\n    select:focus {\n    border-color: var(--blr-reader-accent);\n  }\n\n  #blr-reading-transcript-language {\n    width: 72px;\n  }\n\n  #blr-reading-transcript-font-size {\n    width: 56px;\n  }\n\n  #blr-reading-transcript-font-weight {\n    width: 64px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-main,\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript {\n    width: 100% !important;\n    max-width: none !important;\n    height: auto !important;\n    margin: 0 !important;\n    box-sizing: border-box;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript {\n    padding: 8px 10px 24px;\n    overflow: visible;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-tail-spacer {\n    min-height: 45vh;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle {\n    position: fixed;\n    top: var(--blr-reader-player-top, 88px);\n    bottom: 24px;\n    width: 14px;\n    z-index: 2147483646;\n    cursor: col-resize;\n    pointer-events: auto;\n    touch-action: none;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle::before {\n    content: \"\";\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 6px;\n    width: 2px;\n    border-radius: 999px;\n    background: transparent;\n    transition: background 0.16s ease, box-shadow 0.16s ease;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle:hover::before,\n  body[data-blr-reader-resizing] .blr-reading-resize-handle::before {\n    background: var(--blr-reader-accent);\n    box-shadow: 0 0 0 3px var(--blr-reader-accent-soft);\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle-right {\n    right: calc(\n      var(--blr-reader-page-padding) + var(--blr-reader-transcript-width) +\n        var(--blr-reader-three-column-half-gap) - 7px\n    );\n  }\n\n  body[data-blr-reader-resizing=\"transcript\"],\n  body[data-blr-reader-resizing=\"transcript\"] * {\n    cursor: col-resize !important;\n    user-select: none !important;\n  }\n\n}\n\n@media (max-width: 1180px) {\n  .blr-reading-resize-handle {\n    display: none !important;\n  }\n}\n\n/* YouTube reader: keep the native player mounted and let it own its controls. */\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] {\n  overflow: hidden !important;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] :is(\n  ytd-app, #content.ytd-app, ytd-page-manager, ytd-watch-flexy,\n  #full-bleed-container.ytd-watch-flexy, #player-full-bleed-container.ytd-watch-flexy,\n  #columns.ytd-watch-flexy,\n  #primary.ytd-watch-flexy, #primary-inner.ytd-watch-flexy,\n  #player.ytd-watch-flexy, #player-container-outer.ytd-watch-flexy,\n  #player-container-inner.ytd-watch-flexy, #player-container.ytd-watch-flexy,\n  ytd-player, #container.ytd-player\n) {\n  transform: none !important;\n  contain: none !important;\n  overflow: visible !important;\n  /* Keep the docking hosts visible without painting YouTube's theater\n     backdrop across the reader. The video keeps its own player background. */\n  background: transparent !important;\n  box-shadow: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] :is(\n  #full-bleed-container.ytd-watch-flexy, #player-full-bleed-container.ytd-watch-flexy\n)::before,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] :is(\n  #full-bleed-container.ytd-watch-flexy, #player-full-bleed-container.ytd-watch-flexy\n)::after {\n  background: transparent !important;\n  box-shadow: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] #cinematics {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] #movie_player:not(.ytp-fullscreen):not(:fullscreen):not(:fullscreen *) {\n  position: fixed !important;\n  inset: auto !important;\n  top: var(--blr-reader-player-top, 98px) !important;\n  left: var(--blr-reader-player-left, var(--blr-reader-page-padding)) !important;\n  width: var(--blr-reader-player-rendered-width) !important;\n  height: var(--blr-reader-player-rendered-height) !important;\n  max-width: none !important;\n  max-height: none !important;\n  margin: 0 !important;\n  transform: none !important;\n  z-index: 100 !important;\n}\n\n/* Fullscreen can belong to the player itself or one of YouTube's wrappers.\n   Fill that viewport instead of falling back to stale native inline sizes,\n   and paint letterboxing black rather than exposing the reader page. */\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] :is(\n  #movie_player.ytp-fullscreen, #movie_player:fullscreen, :fullscreen #movie_player\n) {\n  position: fixed !important;\n  inset: 0 !important;\n  width: 100% !important;\n  height: 100% !important;\n  max-width: none !important;\n  max-height: none !important;\n  margin: 0 !important;\n  transform: none !important;\n  background: #000 !important;\n  z-index: 100 !important;\n}\n\n/* A fullscreen docking host overrides its transparent theater background. */\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] :fullscreen:has(#movie_player),\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] :fullscreen:has(#movie_player)::backdrop,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] #movie_player:fullscreen::backdrop {\n  background: #000 !important;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"]:has(\n  #movie_player.ytp-fullscreen, #movie_player:fullscreen, :fullscreen #movie_player\n) :is(#blr-root, #blr-reading-inline-host) {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] #movie_player :is(.html5-video-container, video) {\n  width: 100% !important;\n  height: 100% !important;\n  top: 0 !important;\n  left: 0 !important;\n  object-fit: contain !important;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] #movie_player .ytp-chrome-bottom {\n  width: calc(100% - 24px) !important;\n  left: 12px !important;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-topbar {\n  grid-template-columns: minmax(0, 1fr);\n  right: 76px;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-actions {\n  margin: 0;\n  opacity: 1;\n  visibility: visible;\n  pointer-events: auto;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] #blr-reading-view[data-blr-reader-ready=\"0\"] {\n  opacity: 1;\n  visibility: visible;\n}\n\n/* Keep the title and all controls on one line, including the 280px column. */\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript-heading {\n  flex-wrap: nowrap;\n  gap: 4px;\n  padding-left: 4px;\n  padding-right: 4px;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript-heading-title {\n  flex: 0 0 auto;\n  min-width: 0;\n  overflow: visible;\n  white-space: nowrap;\n  letter-spacing: 0;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript-heading-controls {\n  display: flex;\n  flex: 1 1 0;\n  flex-wrap: nowrap;\n  min-width: 0;\n  gap: 2px;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript-tool-button {\n  flex: 0 0 26px;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript-tool-button:disabled {\n  opacity: 0.6;\n  cursor: wait;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript-heading-controls select {\n  padding-left: 5px;\n  padding-right: 20px;\n  background-position: right 5px center;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host #blr-reading-transcript-language {\n  flex: 1 1 72px;\n  width: 72px;\n  min-width: 0;\n  max-width: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host #blr-reading-transcript-font-size {\n  flex: 0 0 46px;\n  width: 46px;\n  min-width: 0;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host #blr-reading-transcript-font-weight {\n  flex: 0 0 52px;\n  width: 52px;\n  min-width: 0;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"][data-blr-reader-has-chapters=\"1\"] .blr-reading-rail {\n  display: grid !important;\n  top: calc(var(--blr-reader-player-bottom) + 12px) !important;\n  left: var(--blr-reader-player-left) !important;\n  bottom: auto !important;\n  width: var(--blr-reader-player-width) !important;\n  height: 112px !important;\n  min-height: 0;\n  max-height: none !important;\n  grid-template-rows: auto minmax(0, 1fr);\n  gap: 6px;\n  padding: 10px 12px;\n  overflow: hidden;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-rail .blr-reading-list {\n  display: flex;\n  align-items: stretch;\n  gap: 8px;\n  min-width: 0;\n  overflow-x: auto;\n  overflow-y: hidden;\n}\n\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-rail .blr-reading-chapter {\n  flex: 0 0 auto;\n  width: auto;\n  min-width: 120px;\n  max-width: 190px;\n  padding: 6px 10px;\n}\n\n@media (max-width: 1180px) {\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] #blr-reading-inline-host {\n    position: fixed !important;\n    top: calc(var(--blr-reader-player-bottom, 40vh) + 16px) !important;\n    right: var(--blr-reader-page-padding) !important;\n    bottom: 16px !important;\n    left: var(--blr-reader-page-padding) !important;\n    width: auto !important;\n    max-width: none !important;\n    min-height: 0 !important;\n    height: auto !important;\n    margin: 0 !important;\n    border: 1px solid var(--blr-reader-border);\n    border-radius: 12px;\n    scroll-padding-top: 46px;\n    z-index: 2147483645;\n  }\n\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"][data-blr-reader-has-chapters=\"1\"] #blr-reading-inline-host {\n    top: calc(var(--blr-reader-player-bottom) + 144px) !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] #blr-reading-inline-host .blr-reading-transcript {\n    height: auto;\n    overflow: visible;\n  }\n\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-transcript-heading {\n    position: sticky;\n    top: 0;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    min-height: 44px;\n    padding: 6px 10px;\n    box-sizing: border-box;\n    border-bottom: 1px solid var(--blr-reader-border);\n    background: var(--blr-reader-surface-2);\n    color: var(--blr-reader-text);\n    font-size: 12px;\n    font-weight: 700;\n    z-index: 3;\n  }\n\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-transcript-heading-controls {\n    display: flex;\n    flex: 1 1 auto;\n    flex-wrap: nowrap;\n    align-items: center;\n    justify-content: flex-end;\n    gap: 4px;\n    min-width: 0;\n  }\n\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-transcript-tool-button {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 26px;\n    height: 26px;\n    padding: 0;\n    border: 1px solid var(--blr-reader-border);\n    border-radius: 50%;\n    background: var(--blr-reader-surface);\n    color: var(--blr-reader-text);\n    cursor: pointer;\n  }\n\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-transcript-tool-button svg {\n    width: 17px;\n    height: 17px;\n  }\n\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-transcript-heading-controls select {\n    height: 26px;\n    max-width: 130px;\n    border: 1px solid var(--blr-reader-border);\n    border-radius: 5px;\n    background: var(--blr-reader-surface);\n    color: var(--blr-reader-text);\n    font-size: 12px;\n  }\n\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-transcript-tool-button:hover,\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-platform=\"youtube\"] .blr-reading-transcript-tool-button:focus-visible {\n    border-color: var(--blr-reader-accent);\n    color: var(--blr-reader-accent);\n  }\n}\n");

  const chrome = {
    runtime: {
      onMessage: {
        addListener(listener) {
          runtimeListeners.push(listener);
        }
      },
      sendMessage(message, callback) {
        handleBackgroundMessage(message)
          .then((response) => callback?.(response))
          .catch((error) => callback?.({ ok: false, error: String(error?.message || error) }));
      }
    },
    storage: {
      onChanged: {
        addListener(listener) {
          storageListeners.push(listener);
        }
      },
      local: {
        async get(keys) {
          if (typeof keys === "string") {
            return { [keys]: await Promise.resolve(GM_getValue(keys, undefined)) };
          }
          const result = {};
          for (const key of Array.isArray(keys) ? keys : Object.keys(keys || {})) {
            result[key] = await Promise.resolve(GM_getValue(key, keys?.[key]));
          }
          return result;
        },
        async set(values) {
          for (const [key, value] of Object.entries(values || {})) {
            await Promise.resolve(GM_setValue(key, value));
          }
        },
        async remove(keys) {
          for (const key of Array.isArray(keys) ? keys : [keys]) {
            await Promise.resolve(GM_deleteValue(key));
          }
        }
      }
    }
  };

  async function handleBackgroundMessage(message) {
    if (message?.type === "get-settings") {
      const settings = await Promise.resolve(GM_getValue(USERSCRIPT_SETTINGS_KEY, {}));
      return { ok: true, settings: settings && typeof settings === "object" ? settings : {} };
    }
    if (message?.type === "save-settings") {
      const previous = await Promise.resolve(GM_getValue(USERSCRIPT_SETTINGS_KEY, {}));
      const settings = message.settings && typeof message.settings === "object" ? message.settings : {};
      await Promise.resolve(GM_setValue(USERSCRIPT_SETTINGS_KEY, settings));
      const changes = {};
      for (const key of new Set([...Object.keys(previous || {}), ...Object.keys(settings)])) {
        if (previous?.[key] !== settings[key]) {
          changes[key] = { oldValue: previous?.[key], newValue: settings[key] };
        }
      }
      storageListeners.forEach((listener) => listener(changes, "sync"));
      return { ok: true };
    }
    if (message?.type === "fetch-json" || message?.type === "fetch-text") {
      return { ok: true, data: await requestResource(String(message.url || ""), message.type === "fetch-text") };
    }
    return { ok: false, error: "此功能在独立阅读脚本中不可用" };
  }

  async function requestResource(url, asText = false) {
    if (!url) throw new Error("缺少请求地址");
    const normalizedUrl = url.startsWith("//") ? `https:${url}` : url;
    const parsedUrl = new URL(normalizedUrl);
    const isYouTubeSubtitle = asText && /(^|\.)youtube\.com$/.test(parsedUrl.hostname) &&
      parsedUrl.pathname === "/api/timedtext";
    const deadline = Date.now() + (isYouTubeSubtitle ? 3500 : 20000);
    const controller = new AbortController();
    let timeout = 0;
    let directError = null;
    try {
      const pageFetch =
        typeof unsafeWindow !== "undefined" && typeof unsafeWindow.fetch === "function"
          ? unsafeWindow.fetch.bind(unsafeWindow)
          : fetch;
      return await Promise.race([
        (async () => {
          const response = await pageFetch(normalizedUrl, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: { Accept: "application/json, text/plain, */*" },
            signal: controller.signal
          });
          if (!response.ok) throw new Error(`页面请求 HTTP ${response.status}`);
          return asText ? response.text() : response.json();
        })(),
        new Promise((_, reject) => {
          timeout = window.setTimeout(() => {
            reject(new Error("页面请求超时"));
            controller.abort();
          }, isYouTubeSubtitle ? 1500 : 5000);
        })
      ]);
    } catch (error) {
      directError = error;
    } finally {
      window.clearTimeout(timeout);
    }

    return requestJsonWithUserscriptApi(normalizedUrl, directError, Math.max(1, deadline - Date.now()), asText);
  }

  function requestJsonWithUserscriptApi(url, directError, timeoutMs, asText = false) {
    return new Promise((resolve, reject) => {
      let settled = false;
      let timeout = 0;
      let request = null;
      const finish = (handler, value) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        handler(value);
      };
      const onload = (response) => {
        if (response.status < 200 || response.status >= 300) {
          finish(reject, new Error(`HTTP ${response.status}`));
          return;
        }
        if (asText) {
          finish(resolve, response.responseText || response.response || "");
          return;
        }
        try {
          const payload =
            response.response && typeof response.response === "object"
              ? response.response
              : JSON.parse(response.responseText || response.response || "");
          finish(resolve, payload);
        } catch {
          finish(reject, new Error("返回内容不是有效 JSON"));
        }
      };
      const onerror = (error) =>
        finish(
          reject,
          new Error(
            error?.error ||
              `网络请求失败${directError?.message ? `（${directError.message}）` : ""}`
          )
        );
      const requestOptions = {
        method: "GET",
        url,
        headers: {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          Referer: /(^|\.)youtube\.com$/.test(new URL(url).hostname)
            ? "https://www.youtube.com/" : "https://www.bilibili.com/"
        },
        responseType: "text",
        anonymous: false,
        withCredentials: true,
        timeout: timeoutMs,
        onload,
        ontimeout() { finish(reject, new Error("请求超时")); },
        onerror
      };
      const requestApi =
        typeof GM_xmlhttpRequest === "function"
          ? GM_xmlhttpRequest
          : typeof GM !== "undefined" && typeof GM.xmlHttpRequest === "function"
            ? GM.xmlHttpRequest.bind(GM)
            : null;
      if (!requestApi) {
        finish(reject, new Error("脚本管理器未提供跨域请求权限"));
        return;
      }
      try {
        timeout = window.setTimeout(() => {
          finish(reject, new Error("请求超时"));
          try { request?.abort?.(); } catch {}
        }, timeoutMs);
        request = requestApi(requestOptions);
        if (request && typeof request.then === "function") {
          request.then(onload).catch(onerror);
        }
      } catch (error) {
        onerror(error);
      }
    });
  }

  function dispatchRuntimeMessage(message) {
    return new Promise((resolve) => {
      let settled = false;
      const respond = (response) => {
        if (settled) return;
        settled = true;
        resolve(response);
      };
      for (const listener of runtimeListeners) {
        const keepChannelOpen = listener(message, null, respond);
        if (settled) return;
        if (keepChannelOpen === true) {
          window.setTimeout(() => respond({ ok: false, error: "操作超时" }), 5000);
          return;
        }
      }
      respond({ ok: false, error: "阅读脚本尚未就绪" });
    });
  }

  const isYouTube = ["www.youtube.com", "youtube.com"].includes(location.hostname);
  GM_registerMenuCommand(isYouTube ? "展开 YouTube 字幕" : "进入阅读模式", () => {
    const readerUrl = new URL(location.href);
    readerUrl.searchParams.set("bilibli_reader", "1");
    dispatchRuntimeMessage({
      type: "popup-trigger-reading-view",
      readerUrl: readerUrl.toString()
    });
  });

  GM_registerMenuCommand(isYouTube ? "收起 YouTube 字幕" : "退出阅读模式", () => {
    if (isYouTube) {
      const panel = document.getElementById("blr-native-transcript-panel");
      if (panel && !panel.classList.contains("is-folded")) panel.querySelector("[data-native-transcript-toggle]")?.click();
      return;
    }
    const closeButton = document.getElementById("blr-reading-close-btn");
    if (closeButton) closeButton.click();
  });
(() => {
if (globalThis.__BILIBLI_READER_CONTENT_SCRIPT_BOOTSTRAPPED__) {
  return;
}
globalThis.__BILIBLI_READER_CONTENT_SCRIPT_BOOTSTRAPPED__ = true;

const DEFAULT_SETTINGS = {
  enableDebugLogs: false,
  readerTheme: "light",
  readerFontScale: "xl",
  readerFontWeight: "bold",
  readerLetterSpacing: "loose",
  readerLineHeight: "loose",
  readerContentWidth: "medium",
  readerChapterWidthPx: 220,
  readerTranscriptWidthPx: 440,
  nativeTranscriptTheme: "light",
  nativeTranscriptFontSize: 14,
  nativeTranscriptFontWeight: 500,
  readerDefaultsVersion: 3
};

const READER_VERSION = "0.0.10";
const CACHE_KEY_PREFIX = "bilibli_reader_subtitle_cache_";
globalThis.__BILIBLI_READER_CONTENT_SCRIPT_LOADED__ = READER_VERSION;
// Data and request identity for the current video.
const clipState = {
  fetchRunId: 0,
  fetchClipSignature: "",
  bvid: "",
  aid: "",
  cid: "",
  cidSource: "",
  pageIndex: 1,
  pageCount: 0,
  pageTitle: "",
  collection: null,
  videoDuration: 0,
  title: "",
  author: "",
  uploadDate: "",
  subtitles: [],
  selectedSubtitleId: "",
  selectedSubtitleUrl: "",
  selectedSubtitleLang: "",
  subtitleBody: [],
  subtitleRevision: 0,
  subtitleFetchState: "idle",
  chapters: [],
  currentClipSignature: ""
};

// Transient reader lifecycle, playback following, and layout scheduling.
const readerSessionState = {
  open: false,
  id: 0,
  mountTask: null,
  layoutFrame: 0,
  layoutDirty: false,
  resizeObserver: null,
  observedPlayer: null,
  resizeCleanup: null,
  transition: null,
  closing: false,
  transcriptAutoWidth: false,
  activeSubtitleIndex: -1,
  activeChapterIndex: -1,
  nextScrollBehavior: "smooth",
  syncTimer: 0,
  playerMountTimer: 0,
  playerRetryTimer: 0,
  manualScrollPauseUntil: 0,
  programmaticScrollUntil: 0,
  collectionSwitchInFlight: false,
  ready: false
};

// Persisted settings and their normalized presentation values.
const readerPreferences = {
  theme: "light",
  fontScale: "m",
  fontWeight: "normal",
  letterSpacing: "normal",
  lineHeight: "tight",
  contentWidth: "medium",
  chapterWidthPx: 220,
  transcriptWidthPx: 440,
  nativeTheme: "light",
  nativeFontSize: 14,
  nativeFontWeight: 500,
  settings: { ...DEFAULT_SETTINGS }
};

// Native player references and compatibility resources owned by the reader.
const readerPlayerState = {
  videoEl: null,
  host: null,
  adjustedNodes: [],
  observer: null,
  miniDismissTimer: 0,
  controlsHideTimer: 0,
  controlsRecoveryTimer: 0,
  controlsRecoveryInFlight: false,
  controlsLastRecoverAt: 0,
  controlsHoverHost: null,
  videoEventsBound: false,
  layoutBound: false
};

// Normal-page transcript panel lifecycle and playback following.
const nativeTranscriptState = {
  observer: null,
  syncTimer: 0,
  resizeObserver: null,
  observedPlayer: null,
  playbackTimer: 0,
  loadPromise: null,
  loadSignature: "",
  loadedSignature: "",
  displaySignature: "",
  open: true,
  activeIndex: -1,
  manualScrollPauseUntil: 0,
  programmaticScrollUntil: 0
};

// Page-level bindings, entry controls, and the reader DOM presentation.
const uiState = {
  mainOriginalParent: null,
  mainOriginalNextSibling: null,
  headerHoverHost: null,
  headerHideTimer: 0,
  uiEventsBound: false,
  runtimeEventsBound: false,
  settingsWatcherBound: false,
  normalPageStateGuardBound: false,
  urlWatcherStarted: false,
  collectionSnapshot: null
};

function formatLocalDate(value = Date.now()) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isReaderMode(url = location.href) {
  if (isYouTubePage(url) && !extractYouTubeVideoId(url)) return false;
  try {
    return new URL(url).searchParams.get("bilibli_reader") === "1";
  } catch {
    return false;
  }
}

function stripReaderModeUrl(url = location.href) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("bilibli_reader");
    return parsed.toString();
  } catch {
    return url;
  }
}

function replaceReaderModeUrl(nextUrl) {
  const targetUrl = String(nextUrl || "").trim();
  if (!targetUrl || targetUrl === location.href) {
    return;
  }

  try {
    history.replaceState(history.state, "", targetUrl);
    clipState.currentClipSignature = computeCurrentClipSignature(location.href);
    refreshReaderPageScopes();
  } catch (error) {
    logWarn("[BOC] failed to replace reader mode url", error);
  }
}

function isWatchlaterPage(url = location.href) {
  try {
    return new URL(url).pathname.replace(/\/+$/, "") === "/list/watchlater";
  } catch {
    return false;
  }
}

function normalizeReaderTheme(value) {
  return value === "dark" || value === "paper" ? value : "light";
}

function normalizeReaderFontScale(value) {
  return ["xs", "s", "m", "l", "xl"].includes(value) ? value : "xl";
}

function normalizeReaderFontWeight(value) {
  return ["light", "regular", "normal", "semibold", "bold"].includes(value) ? value : "bold";
}

function normalizeNativeTranscriptFontSize(value) {
  const size = Number(value);
  return [12, 14, 16, 18, 20, 22].includes(size) ? size : 14;
}

function normalizeNativeTranscriptFontWeight(value) {
  const weight = Number(value);
  return [300, 400, 500, 600, 700].includes(weight) ? weight : 500;
}

function normalizeReaderLetterSpacing(value) {
  return ["tighter", "tight", "normal", "relaxed", "loose"].includes(value) ? value : "loose";
}

function normalizeReaderLineHeight(value) {
  return ["compact", "tight", "normal", "relaxed", "loose"].includes(value) ? value : "loose";
}

function normalizeReaderContentWidth(value) {
  return ["compact", "narrow", "medium", "wide", "full"].includes(value) ? value : "medium";
}

function shouldDebugLog() {
  return Boolean(readerPreferences.settings?.enableDebugLogs);
}

function logInfo(...args) {
  if (shouldDebugLog()) {
    console.info(...args);
  }
}

function logWarn(...args) {
  if (shouldDebugLog()) {
    console.warn(...args);
  }
}

function installReaderDebugHelpers() {
  const snapshotReader = (label = "manual") => createReaderDebugSnapshot(label);
  globalThis.__BILIBLI_READER_DEBUG_SNAPSHOT__ = snapshotReader;
  globalThis.__BILIBLI_READER_DEBUG__ = {
    ...(globalThis.__BILIBLI_READER_DEBUG__ || {}),
    snapshotReader
  };
}

const ids = {
  root: "blr-root",
  readingView: "blr-reading-view",
  readingPageTitle: "blr-reading-page-title",
  readingEpisodeTitle: "blr-reading-episode-title",
  readingCollectionNav: "blr-reading-collection-nav",
  readingCollectionList: "blr-reading-collection-list",
  readingStatus: "blr-reading-status",
  readingCloseBtn: "blr-reading-close-btn",
  readingTranscriptResizeHandle: "blr-reading-transcript-resize-handle",
  readingMeta: "blr-reading-meta",
  readingChapterList: "blr-reading-chapters",
  readingTranscriptList: "blr-reading-transcript",
  readingTranscriptTailSpacer: "blr-reading-tail-spacer",
  readingTranscriptReaderButton: "blr-reading-transcript-reader",
  readingTranscriptReturnButton: "blr-reading-transcript-return",
  readingTranscriptThemeButton: "blr-reading-transcript-theme",
  readingTranscriptQuickSubtitleSelect: "blr-reading-transcript-language",
  readingTranscriptQuickFontSizeSelect: "blr-reading-transcript-font-size",
  readingTranscriptQuickFontWeightSelect: "blr-reading-transcript-font-weight",
  nativeTranscriptPanel: "blr-native-transcript-panel",
  nativeTranscriptHeader: "blr-native-transcript-header",
  nativeTranscriptBody: "blr-native-transcript-body",
  nativeTranscriptControls: "blr-native-transcript-controls",
  nativeTranscriptReaderButton: "blr-native-transcript-reader",
  nativeTranscriptReturnButton: "blr-native-transcript-return",
  nativeTranscriptThemeButton: "blr-native-transcript-theme",
  nativeTranscriptSelect: "blr-native-transcript-select",
  nativeTranscriptFontSizeSelect: "blr-native-transcript-font-size",
  nativeTranscriptFontWeightSelect: "blr-native-transcript-font-weight",
  nativeTranscriptList: "blr-native-transcript-list"
};


function init() {
  // document-idle 不代表 B 站已完成异步挂载；提前插入节点会破坏 Vue 的 SSR hydration。
  // 等待服务端渲染标记移除后再初始化，也兼容没有 SSR 标记的稍后再看页面。
  if (
    document.readyState === "loading" ||
    !document.body ||
    document.querySelector(
      '#app[data-server-rendered="true"], #video-page-app[data-server-rendered="true"]'
    )
  ) {
    window.setTimeout(init, 50);
    return;
  }

  // A full reload starts in the native view. Preserve other query parameters,
  // the hash and history state, without navigating or restoring a reader session.
  if (isReaderMode() && performance.getEntriesByType("navigation")[0]?.type === "reload") {
    history.replaceState(history.state, "", stripReaderModeUrl());
  }

  logInfo(`[Bilibili Reader] content script loaded, version=${READER_VERSION}`);
  ensureUiReady({ forceRecreate: true });
  installReaderDebugHelpers();

  const shouldEnterReaderMode = isReaderMode();
  if (shouldEnterReaderMode) {
    document.documentElement.setAttribute("data-blr-reader-mode", "1");
    document.body.setAttribute("data-blr-reader-mode", "1");
  } else {
    clearReaderPresentationAttributes();
  }

  bindRuntimeEvents();
  bindSettingsWatcher();
  bindNormalPageStateGuard();

  startNativeTranscriptPanelObserver();
  startUrlWatcher();
  getSettings().then((settings) => {
    readerPreferences.settings = settings;
    hydrateReaderStateFromSettings(settings);
    hydrateNativeTranscriptSettings(settings);
    applyReadingViewPresentation();

    scheduleNativeTranscriptPanelSync(0);
    if (shouldEnterReaderMode) {
      enterReaderMode().catch((error) => {
        renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
      });
    }
  });
}

function ensureUiReady({ forceRecreate = false } = {}) {
  const existingRoot = document.getElementById(ids.root);
  if (existingRoot && forceRecreate) {
    existingRoot.remove();
    uiState.uiEventsBound = false;
  }

  let root = document.getElementById(ids.root);
  if (!root) {
    root = document.createElement("div");
    root.id = ids.root;
    root.innerHTML = readerHtml(buildUiHtml());
    document.body.appendChild(root);
    uiState.uiEventsBound = false;
  }

  if (!uiState.uiEventsBound) {
    bindUiEvents();
    uiState.uiEventsBound = true;
  }
}

function clearReaderPresentationAttributes() {
  const attributes = [
    "mode", "platform", "theme", "font-scale", "font-weight", "letter-spacing", "line-height",
    "content-width", "has-chapters", "resizing"
  ];
  [document.documentElement, document.body].forEach((node) => {
    attributes.forEach((name) => node.removeAttribute(`data-blr-reader-${name}`));
  });
  document.body.removeAttribute("data-blr-reading-active");
}

function onTranscriptReaderEntryClick(event) {
  event.preventDefault();
  event.stopPropagation();
  if (readerSessionState.open) {
    return;
  }

  const button = event.currentTarget;
  button.disabled = true;
  button.classList.add("is-loading");
  ensureUiReady();

  enterReaderMode({ animate: true }).catch((error) => {
    if (readerSessionState.open) {
      readerSessionState.transition?.cancel();
      replaceReaderModeUrl(stripReaderModeUrl());
      closeReadingView();
    }
    button.disabled = false;
    button.classList.remove("is-loading");
    logWarn("[Bilibili Reader] transcript entry failed", error);
    renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
  });
}
// YouTube uses its native player and shares transcript data with the reader.
function isYouTubePage(url = location.href) {
  try { return ["www.youtube.com", "youtube.com"].includes(new URL(url).hostname); }
  catch { return false; }
}

function extractYouTubeVideoId(url = location.href) {
  try {
    const parsed = new URL(url);
    const id = parsed.searchParams.get("v") || "";
    return isYouTubePage(url) && parsed.pathname === "/watch" && /^[\w-]{11}$/.test(id) ? id : "";
  } catch { return ""; }
}

function isSupportedTranscriptPage(url = location.href) {
  return Boolean(extractYouTubeVideoId(url) || (!isYouTubePage(url) && extractBvid(url)));
}

function getYouTubePageWindow() {
  return typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
}

function readYouTubePlayerResponse(videoId) {
  const page = getYouTubePageWindow();
  const player = page.document.getElementById("movie_player");
  const watch = page.document.querySelector("ytd-watch-flexy");
  const candidates = [];
  try { candidates.push(player?.getPlayerResponse?.()); } catch {}
  candidates.push(watch?.playerData, page.ytInitialPlayerResponse);
  const matching = candidates.filter((item) => item?.videoDetails?.videoId === videoId);
  // A transient player response must not mask the complete watch-page data.
  return matching.find((item) => item.captions?.playerCaptionsTracklistRenderer?.captionTracks?.length) ||
    matching.find((item) => item.playabilityStatus?.status === "OK") || matching[0] || null;
}

function youtubeText(value) {
  if (typeof value === "string") return value;
  return value?.simpleText || value?.content || (value?.runs || []).map((item) => item.text || "").join("");
}

function mapYouTubeCaptionTracks(response, videoId) {
  const list = response?.captions?.playerCaptionsTracklistRenderer;
  const tracks = list?.captionTracks || [];
  const defaultIndex = list?.audioTracks?.[list.defaultAudioTrackIndex || 0]?.defaultCaptionTrackIndex ?? 0;
  return tracks.flatMap((track, index) => {
    if (track.kind === "asr" || String(track.vssId || "").startsWith("a.")) return [];
    try {
      const url = new URL(track.baseUrl);
      if (url.protocol !== "https:" || !isYouTubePage(url.origin) ||
          url.pathname !== "/api/timedtext" || url.searchParams.get("v") !== videoId) return [];
      url.searchParams.set("fmt", "json3");
      const label = youtubeText(track.name) || track.languageCode || "字幕";
      return [{
        id: `youtube:${videoId}:${track.vssId || `${track.languageCode}:${index}`}`,
        lan: track.languageCode || "und",
        lanDoc: label,
        subtitleUrl: url.toString(),
        nativeDefault: index === defaultIndex,
        nativeLabel: youtubeText(track.name),
        nativeTrackCount: tracks.length,
        source: "youtube"
      }];
    } catch { return []; }
  });
}

function parseYouTubeChapterTimestamp(value) {
  const text = String(value || "").trim();
  if (!/^\d{1,3}:\d{2}(?::\d{2})?$/.test(text)) return NaN;
  const parts = text.split(":").map(Number);
  if (parts.at(-1) >= 60 || (parts.length === 3 && parts[1] >= 60)) return NaN;
  return parts.reduce((seconds, part) => seconds * 60 + part, 0);
}

function normalizeYouTubeChapters(chapters, duration = 0) {
  const sorted = chapters.filter((item) => item.title && Number.isFinite(item.from) &&
    item.from >= 0 && (!duration || item.from < duration)).sort((a, b) => a.from - b.from);
  const unique = sorted.filter((item, index) => index === 0 || item.from !== sorted[index - 1].from);
  return unique.map((item, index) => ({
    title: item.title.trim(), from: item.from,
    to: unique[index + 1]?.from ?? (duration > item.from ? duration : 0), source: "youtube"
  }));
}

function readYouTubeChapters(videoId, response = readYouTubePlayerResponse(videoId)) {
  if (!videoId || videoId !== extractYouTubeVideoId()) return [];
  const page = getYouTubePageWindow();
  const watch = page.document.querySelector("ytd-watch-flexy");
  const duration = Number(response?.videoDetails?.lengthSeconds) || clipState.videoDuration;
  const roots = [response];
  if (watch?.getAttribute("video-id") === videoId) roots.push(watch.data);
  // Initial data can belong to the first video after a YouTube SPA navigation.
  if (page.ytInitialPlayerResponse?.videoDetails?.videoId === videoId) roots.push(page.ytInitialData);
  const chapters = [];
  const markers = [];
  roots.forEach((root) => walkYouTubeData(root, (item) => {
    const chapter = item.chapterRenderer;
    if (chapter?.timeRangeStartMillis !== undefined) chapters.push({
      title: youtubeText(chapter.title), from: Number(chapter.timeRangeStartMillis) / 1000
    });
    const marker = item.macroMarkersListItemRenderer;
    if (!marker) return;
    const endpoint = marker.onTap?.watchEndpoint || marker.onTap?.innertubeCommand?.watchEndpoint;
    if (endpoint?.videoId && endpoint.videoId !== videoId) return;
    markers.push({ title: youtubeText(marker.title), from: endpoint?.startTimeSeconds !== undefined
      ? Number(endpoint.startTimeSeconds) : parseYouTubeChapterTimestamp(youtubeText(marker.timeDescription)) });
  }));
  const structuredChapters = normalizeYouTubeChapters(chapters, duration);
  const structured = structuredChapters.length ? structuredChapters : normalizeYouTubeChapters(markers, duration);
  if (structured.length) return structured;

  // Chapter cards may arrive after player metadata. Read their native titles
  // and timestamps without opening the chapter panel or changing playback.
  const domChapters = [];
  if (watch?.getAttribute("video-id") === videoId) {
    watch.querySelectorAll("ytd-macro-markers-list-item-renderer").forEach((node) => {
      const link = node.querySelector("a[href]");
      try {
        const url = new URL(link?.getAttribute("href") || "", location.origin);
        if (extractYouTubeVideoId(url.toString()) !== videoId) return;
      } catch { return; }
      domChapters.push({
        title: node.querySelector("h3:not([hidden]), h3")?.textContent?.trim() || "",
        from: parseYouTubeChapterTimestamp(node.querySelector("#time")?.textContent)
      });
    });
  }
  const nativeChapters = normalizeYouTubeChapters(domChapters, duration);
  if (nativeChapters.length) return nativeChapters;

  // Fall back to the creator's timestamp list when native cards are not mounted.
  const descriptionChapters = String(response?.videoDetails?.shortDescription || "")
    .split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*(\d{1,3}:\d{2}(?::\d{2})?)\s+(.+?)\s*$/);
      return match ? [{ from: parseYouTubeChapterTimestamp(match[1]), title: match[2] }] : [];
    });
  const isChapterList = descriptionChapters.length >= 3 && descriptionChapters[0].from === 0 &&
    descriptionChapters.every((item, index) => Number.isFinite(item.from) &&
      (index === 0 || item.from > descriptionChapters[index - 1].from));
  return isChapterList ? normalizeYouTubeChapters(descriptionChapters, duration) : [];
}

function syncYouTubeReadingChapters() {
  if (!isYouTubePage() || !readerSessionState.open ||
      clipState.fetchClipSignature !== computeCurrentClipSignature()) return;
  const chapters = readYouTubeChapters(extractYouTubeVideoId());
  // Do not erase a valid list while YouTube replaces its watch-page nodes.
  if (!chapters.length || (chapters.length === clipState.chapters.length &&
      chapters.every((item, index) => item.title === clipState.chapters[index].title &&
        item.from === clipState.chapters[index].from && item.to === clipState.chapters[index].to))) return;
  clipState.chapters = chapters;
  renderReadingView();
  scheduleReaderLayout();
}

async function refreshYouTubeClipData(videoId, request) {
  if (!videoId) throw new Error("请在 YouTube 视频播放页使用字幕功能。");
  let response = null;
  const deadline = Date.now() + 6000;
  do {
    ensureSubtitleRequestActive(request);
    response = readYouTubePlayerResponse(videoId);
    if (response) break;
    await sleep(150);
  } while (Date.now() < deadline);
  ensureSubtitleRequestActive(request);
  if (!response) throw new Error("YouTube 播放器尚未就绪，请重试。");
  const details = response.videoDetails;
  clipState.bvid = `youtube:${videoId}`;
  clipState.cid = videoId;
  clipState.cidSource = "youtube-player";
  clipState.title = details.title || "YouTube 字幕";
  clipState.author = details.author || "";
  clipState.videoDuration = Number(details.lengthSeconds) || readRuntimeVideoDuration();
  clipState.pageCount = 1;
  clipState.pageIndex = 1;
  clipState.collection = null;
  clipState.chapters = readYouTubeChapters(videoId, response);
  clipState.subtitles = normalizeSubtitleTracks(mapYouTubeCaptionTracks(response, videoId));
  const preferred = pickPreferredSubtitle(clipState.subtitles);
  if (!preferred) {
    if (response.captions?.playerCaptionsTracklistRenderer?.captionTracks?.some((track) =>
      track.kind !== "asr" && !String(track.vssId || "").startsWith("a."))) {
      throw new Error("YouTube 字幕轨道暂时无法读取，请重试。");
    }
    await finishNoSubtitleLoad(request);
    return;
  }
  await tryLoadSubtitleCandidates(buildSubtitleCandidates(clipState.subtitles, preferred),
    request.runId, true, request);
  ensureSubtitleRequestActive(request);
}

function normalizeYouTubeCues(cues, duration = 0) {
  const sorted = cues.filter((cue) => Number.isFinite(cue.from) && cue.from >= 0 && cue.content?.trim())
    .sort((a, b) => a.from - b.from);
  return sorted.map((cue, index) => {
    const next = sorted[index + 1]?.from;
    const end = Number.isFinite(cue.to) && cue.to > cue.from ? cue.to :
      next ?? (duration > cue.from ? duration : cue.from + 5);
    return { from: cue.from, to: next > cue.from ? Math.min(end, next) : end, content: cue.content.trim() };
  });
}

function parseYouTubeTimedText(text, duration = 0) {
  if (!String(text || "").trim()) return [];
  if (String(text).trimStart().startsWith("{")) {
    const data = JSON.parse(text);
    if (!Array.isArray(data.events)) throw new Error("YouTube 字幕格式无效。");
    const cues = [];
    for (const event of data.events) {
      if (!Array.isArray(event.segs) || event.tStartMs === undefined) continue;
      const content = event.segs.map((segment) => segment.utf8 || "").join("");
      const from = Number(event.tStartMs) / 1000;
      const to = from + Number(event.dDurationMs || 0) / 1000;
      if (event.aAppend && cues.length) {
        cues[cues.length - 1].content += content;
        cues[cues.length - 1].to = Math.max(cues[cues.length - 1].to, to);
      } else cues.push({ from, to, content });
    }
    return normalizeYouTubeCues(cues, duration);
  }
  const xml = new DOMParser().parseFromString(readerHtml(text), "text/xml");
  if (xml.querySelector("parsererror") || !["transcript", "timedtext"].includes(xml.documentElement.tagName)) {
    throw new Error("YouTube 字幕格式无效。");
  }
  const cues = [...xml.querySelectorAll("text, body > p")].map((node) => {
    const milliseconds = node.tagName === "p";
    const scale = milliseconds ? 1000 : 1;
    const from = Number(node.getAttribute(milliseconds ? "t" : "start")) / scale;
    return { from, to: from + Number(node.getAttribute(milliseconds ? "d" : "dur")) / scale,
      content: node.textContent };
  });
  return normalizeYouTubeCues(cues, duration);
}

// Both the older transcript renderer and the modern inline-timestamp view
// are delivered by YouTube's own engagement panel loader.
function walkYouTubeData(root, visit) {
  const seen = new Set();
  const walk = (item, depth) => {
    if (!item || typeof item !== "object" || depth > 35 || seen.has(item)) return;
    seen.add(item);
    visit(item);
    Object.values(item).forEach((value) => walk(value, depth + 1));
  };
  walk(root, 0);
}

function parseYouTubeTranscriptData(data, duration = 0) {
  const cues = [];
  walkYouTubeData(data, (item) => {
    const legacy = item.transcriptSegmentRenderer;
    if (legacy?.startMs !== undefined) cues.push({
      from: Number(legacy.startMs) / 1000,
      to: legacy.endMs === undefined ? NaN : Number(legacy.endMs) / 1000,
      content: youtubeText(legacy.snippet)
    });
    const modern = item.transcriptSegmentViewModel;
    if (modern && /^\d+(?::\d{1,2}){1,2}$/.test(modern.timestamp || "")) cues.push({
      from: modern.timestamp.split(":").reduce((seconds, part) => seconds * 60 + Number(part), 0),
      to: NaN, content: youtubeText(modern.simpleText)
    });
    const cue = item.transcriptCueRenderer;
    if (cue?.startOffsetMs !== undefined) cues.push({
      from: Number(cue.startOffsetMs) / 1000,
      to: (Number(cue.startOffsetMs) + Number(cue.durationMs || 0)) / 1000,
      content: youtubeText(cue.cue)
    });
  });
  return normalizeYouTubeCues(cues, duration);
}

function isYouTubeNativeTranscriptLanguageMatch(data, track, requestedLanguage = false) {
  let matches = false;
  let hasSelection = false;
  walkYouTubeData(data, (item) => {
    if ((item.selected === true || item.isSelected === true) && (item.title || item.languageCode)) {
      hasSelection = true;
      if (youtubeText(item.title) === track.nativeLabel || item.languageCode === track.lan) matches = true;
    }
  });
  return hasSelection ? matches : requestedLanguage || (track.nativeTrackCount === 1 && track.nativeDefault);
}

function isYouTubeNativeTranscriptForVideo(data, videoId) {
  const owners = new Set();
  walkYouTubeData(data, (item) => {
    const id = item.transcriptSegmentRenderer?.targetId;
    const match = typeof id === "string" ? id.match(/^([\w-]{11})\./) : null;
    if (match) owners.add(match[1]);
    const endpointId = item.watchEndpoint?.videoId;
    if (typeof endpointId === "string" && /^[\w-]{11}$/.test(endpointId)) owners.add(endpointId);
  });
  return owners.size === 1 && owners.has(videoId);
}

function readCachedYouTubeNativeTranscript(track) {
  const page = getYouTubePageWindow();
  const watch = page.document.querySelector("ytd-watch-flexy");
  const videoId = extractYouTubeVideoId();
  if (watch?.getAttribute("video-id") !== videoId ||
      watch.data?.currentVideoEndpoint?.watchEndpoint?.videoId !== videoId) return [];
  // Both panel versions may retain text while hidden. Modern panels without
  // cue owner IDs are fetched again rather than risking stale text.
  for (const cachedPanel of page.document.querySelectorAll(
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"], ' +
    'ytd-engagement-panel-section-list-renderer[target-id="PAmodern_transcript_view"]'
  )) {
    const cachedData = cachedPanel.data;
    if (isYouTubeNativeTranscriptForVideo(cachedData, videoId) &&
        isYouTubeNativeTranscriptLanguageMatch(cachedData, track)) {
      const body = parseYouTubeTranscriptData(cachedData, clipState.videoDuration);
      if (body.length) return body;
    }
  }
  return [];
}

function isYouTubeTranscriptDataEmpty(data) {
  let empty = false;
  walkYouTubeData(data, (item) => {
    const list = item.transcriptSegmentListRenderer;
    if (Array.isArray(list?.initialSegments) && list.initialSegments.length === 0 &&
        !list.continuations?.length) empty = true;
    // Generic section lists and loading renderers are not evidence of an
    // empty transcript: the modern panel uses them before its cues arrive.
  });
  return empty;
}

async function fetchYouTubeTranscriptData(command, track, request, signal) {
  const page = getYouTubePageWindow();
  const endpoint = command.showEngagementPanelEndpoint;
  const context = page.ytcfg?.get?.("INNERTUBE_CONTEXT");
  if (!context?.client || typeof page.fetch !== "function") {
    throw new Error("YouTube 文字记录请求尚未就绪，请重试。");
  }
  ensureSubtitleRequestActive(request);
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) cancel();
  const timeout = setTimeout(cancel, 8000);
  try {
    const url = new URL("/youtubei/v1/get_panel", page.location.origin);
    url.searchParams.set("prettyPrint", "false");
    const apiKey = page.ytcfg.get("INNERTUBE_API_KEY");
    if (apiKey) url.searchParams.set("key", apiKey);
    const requestContext = JSON.parse(JSON.stringify(context));
    // The modern transcript selects its caption language from the client
    // locale. Always request the selected manual track, not the UI language.
    requestContext.client.hl = track.lan;
    if (command.clickTrackingParams) {
      requestContext.clickTracking = { clickTrackingParams: command.clickTrackingParams };
    }
    // The modern panel's request builder sends panelId and the opaque params
    // from globalConfiguration. These params cannot be used with get_transcript.
    const response = await page.fetch(url.toString(), {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-YouTube-Client-Name": String(page.ytcfg.get("INNERTUBE_CONTEXT_CLIENT_NAME") || 1),
        "X-YouTube-Client-Version": String(requestContext.client.clientVersion || "")
      },
      body: JSON.stringify({
        context: requestContext,
        panelId: endpoint.panelIdentifier || endpoint.identifier.tag,
        params: endpoint.globalConfiguration.params
      })
    });
    ensureSubtitleRequestActive(request);
    if (!response.ok) throw new Error(`YouTube 文字记录请求失败（${response.status}）。`);
    const data = await response.json();
    ensureSubtitleRequestActive(request);
    if (data.error) throw new Error("YouTube 文字记录请求失败，请重试。");
    return data;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}

function buildYouTubeModernTranscriptCommand(videoId) {
  // Modern get_panel params: field 149 wraps videoId (field 1) and the
  // inline transcript presentation (field 3, value 2). IDs are 11 ASCII bytes.
  // Legacy watch pages may expose only the failing get_transcript endpoint.
  const params = getYouTubePageWindow().btoa(
    String.fromCharCode(0xaa, 0x09, 0x0f, 0x0a, 0x0b) + videoId + String.fromCharCode(0x18, 0x02)
  );
  return { showEngagementPanelEndpoint: {
    identifier: { tag: "PAmodern_transcript_view" }, globalConfiguration: { params }
  } };
}

async function fetchYouTubeTranscriptPanel(command, track, request, signal) {
  const data = await fetchYouTubeTranscriptData(command, track, request, signal);
  // Modern responses may omit language menus. The requested client locale
  // identifies their language; any explicit selection must still match.
  if (!isYouTubeNativeTranscriptLanguageMatch(data, track, true)) {
    throw new Error("YouTube 返回的文字记录语言不匹配，请重试。");
  }
  const body = parseYouTubeTranscriptData(data, clipState.videoDuration);
  if (body.length) return { body, state: "ready" };
  return { body: [], state: isYouTubeTranscriptDataEmpty(data) ? "empty" : "pending" };
}

async function readYouTubeNativeTranscript(track, request, signal) {
  const cachedBody = readCachedYouTubeNativeTranscript(track);
  if (cachedBody.length) return { body: cachedBody, state: "ready" };
  const page = getYouTubePageWindow();
  const videoId = extractYouTubeVideoId();
  const deadline = Date.now() + 6000;
  do {
    ensureSubtitleRequestActive(request);
    if (signal?.aborted) return { body: [], state: "cancelled" };
    const watch = page.document.querySelector("ytd-watch-flexy");
    // Player captions can be ready before the watch-page model after reload
    // or SPA navigation. Wait for the current model to avoid stale commands.
    if (watch?.getAttribute("video-id") === videoId &&
        watch.data?.currentVideoEndpoint?.watchEndpoint?.videoId === videoId) {
      let command = null;
      walkYouTubeData(watch.data, (item) => {
        const show = item.showEngagementPanelEndpoint;
        if (!command && show?.identifier?.tag === "PAmodern_transcript_view" &&
            show.globalConfiguration?.params) command = item;
      });
      return fetchYouTubeTranscriptPanel(command || buildYouTubeModernTranscriptCommand(videoId),
        track, request, signal);
    }
    await sleep(150);
  } while (Date.now() < deadline);
  return { body: [], state: "pending" };
}

async function fetchYouTubeSubtitleBody(url) {
  const request = { runId: clipState.fetchRunId, id: subtitleRequestId };
  ensureSubtitleRequestActive(request);
  const track = clipState.subtitles.find((item) => item.subtitleUrl === url);
  if (!track || new URL(url).searchParams.get("v") !== extractYouTubeVideoId()) {
    throw new Error("字幕不属于当前 YouTube 视频。");
  }
  const cachedBody = readCachedYouTubeNativeTranscript(track);
  if (cachedBody.length) return cachedBody;
  const controller = new AbortController();
  const timedTextTask = (async () => {
    const response = await sendRuntimeMessage({ type: "fetch-text", url });
    ensureSubtitleRequestActive(request);
    if (!response?.ok) throw new Error(toReadableText(response?.error, "字幕请求失败"));
    const text = String(response.data || "");
    const body = parseYouTubeTimedText(text, clipState.videoDuration);
    if (body.length) return body;
    const error = new Error(text.trim() ? "字幕正文为空。" : "YouTube 暂未返回字幕正文，请重试。");
    error.code = text.trim() ? "SUBTITLE_EMPTY" : "YOUTUBE_SUBTITLE_PENDING";
    throw error;
  })();
  const nativeTask = (async () => {
    const result = await readYouTubeNativeTranscript(track, request, controller.signal);
    ensureSubtitleRequestActive(request);
    if (result.body.length) return result.body;
    const error = new Error(result.state === "empty" ? "当前视频没有可用字幕。" :
      "YouTube 文字记录暂未就绪，请重试。");
    error.code = result.state === "empty" ? "SUBTITLE_EMPTY" : "YOUTUBE_SUBTITLE_PENDING";
    throw error;
  })();
  try {
    // Start both sources immediately. A native-panel load need not wait for
    // the timedtext timeout, and the first usable body wins.
    const body = await Promise.any([timedTextTask, nativeTask]);
    ensureSubtitleRequestActive(request);
    return body;
  } catch (error) {
    ensureSubtitleRequestActive(request);
    const errors = error.errors || [error];
    console.warn(`[Bilibili Reader] YouTube 字幕来源：${JSON.stringify(errors.map((item) => getErrorMessage(item)))}`);
    if (errors.every(isUnavailableSubtitleError)) {
      const empty = new Error("当前视频没有可用字幕。");
      empty.code = "SUBTITLE_EMPTY";
      throw empty;
    }
    // Empty HTTP text, unsupported fallback paths and timeouts are not proof
    // that an advertised caption track is absent. Keep a retryable error.
    throw errors.find((item) => !isUnavailableSubtitleError(item)) || error;
  } finally {
    controller.abort();
  }
}
// One observer for the site's integration points. Ancestors are watched only
// for direct replacements; comments and recommendation subtrees are excluded.
const readerPageSubscriptions = new Set();
const readerPageScopes = {
  native: {
    roots: "#danmukuBox, .danmaku-box, .up-panel-container, #playerWrap, #bilibili-player, .bpx-player-container",
    required: "#danmukuBox, .danmaku-box",
    changes: "#danmukuBox, .danmaku-box, .up-panel-container, .members-info-container, #blr-native-transcript-panel, video, #playerWrap, #bilibili-player, .bpx-player-container",
    subtree: false
  },
  player: {
    roots: "#playerWrap, #bilibili-player, .bpx-player-container, .bpx-player-mini-warp",
    changes: "video, #playerWrap, #bilibili-player, .bpx-player-container, .bpx-player-video-area, .bpx-player-control-wrap, .bpx-player-mini-close, .bpx-player-mini-warp",
    subtree: true
  }
};
let readerPageObserver = null;
let readerPageDiscoveryTimer = 0;
let readerPageRefreshQueued = false;
let readerPageObservedTargets = new Map();
let readerPageMissingScopes = new Set();
let readerPageEnabledScopes = new Set();

if (isYouTubePage()) {
  readerPageScopes.player = {
    roots: "ytd-watch-flexy #player, #movie_player",
    changes: "ytd-watch-flexy, #player, #movie_player, video",
    subtree: true
  };
  readerPageScopes.native = {
    roots: "ytd-watch-flexy #secondary-inner, #movie_player",
    required: "ytd-watch-flexy #secondary-inner #related",
    changes: "#secondary-inner, #related, #movie_player, video, #blr-native-transcript-panel",
    subtree: false
  };
}

function subscribeReaderPageChanges(scope, callback) {
  const subscription = { scope, callback };
  readerPageSubscriptions.add(subscription);
  if (!readerPageObserver) readerPageObserver = new MutationObserver(handleReaderPageChanges);
  refreshReaderPageScopes();
  return () => {
    readerPageSubscriptions.delete(subscription);
    refreshReaderPageScopes();
  };
}

function readerMutationTouches(record, selector) {
  const target = record.target instanceof Element ? record.target : record.target.parentElement;
  // Own content renders must not feed back into repair. An external removal
  // still has a site-owned parent and matches the removed integration node.
  if (target?.closest("#blr-root, #blr-reading-inline-host, [data-blr-extension-node]")) return false;
  for (const nodes of [record.addedNodes, record.removedNodes]) {
    for (const node of nodes) {
      if (node instanceof Element && (node.matches(selector) || node.querySelector(selector))) return true;
    }
  }
  return false;
}

function isReaderPageScopeEnabled(scope) {
  if (scope === "player") return isReaderMode();
  if (scope === "native") return isSupportedTranscriptPage() && !isReaderMode();
  return false;
}

function hasDetachedReaderPageTarget() {
  for (const node of readerPageObservedTargets.keys()) {
    if (!node.isConnected) return true;
  }
  return false;
}

function handleReaderPageChanges(records) {
  const changedScopes = new Set();
  let topologyChanged = hasDetachedReaderPageTarget();
  for (const subscription of readerPageSubscriptions) {
    if (!isReaderPageScopeEnabled(subscription.scope)) continue;
    if (changedScopes.has(subscription.scope)) continue;
    if (records.some((record) => readerMutationTouches(record, readerPageScopes[subscription.scope].changes))) {
      changedScopes.add(subscription.scope);
    }
    if (!topologyChanged && records.some((record) =>
      readerMutationTouches(record, readerPageScopes[subscription.scope].roots))) topologyChanged = true;
  }
  for (const subscription of readerPageSubscriptions) {
    if (changedScopes.has(subscription.scope)) subscription.callback();
  }
  // A control or subtitle content update does not change the observed roots.
  // Removed ancestors contain those roots, or disconnect an observed target,
  // so unknown site wrappers still take the repair/rebind path.
  if (topologyChanged && !readerPageRefreshQueued) {
    readerPageRefreshQueued = true;
    queueMicrotask(() => {
      readerPageRefreshQueued = false;
      refreshReaderPageScopes();
    });
  }
}

function scheduleReaderPageDiscovery() {
  if (readerPageDiscoveryTimer || !readerPageMissingScopes.size) return;
  readerPageDiscoveryTimer = window.setTimeout(() => {
    readerPageDiscoveryTimer = 0;
    const discovered = new Set();
    let enabledChanged = false;
    for (const scope of readerPageEnabledScopes) {
      if (!isReaderPageScopeEnabled(scope)) enabledChanged = true;
    }
    // Existing roots and their ancestors remain observed while we only search
    // for hosts that have not arrived yet.
    for (const scope of readerPageMissingScopes) {
      if (!isReaderPageScopeEnabled(scope)) continue;
      const config = readerPageScopes[scope];
      if (document.querySelector(config.required || config.roots)) discovered.add(scope);
    }
    const detached = hasDetachedReaderPageTarget();
    if (discovered.size || detached || enabledChanged) refreshReaderPageScopes();
    else scheduleReaderPageDiscovery();
    for (const subscription of readerPageSubscriptions) {
      if (discovered.has(subscription.scope) && isReaderPageScopeEnabled(subscription.scope)) subscription.callback();
    }
  }, 1500);
}

function refreshReaderPageScopes() {
  readerPageObserver?.disconnect();
  window.clearTimeout(readerPageDiscoveryTimer);
  readerPageDiscoveryTimer = 0;
  readerPageObservedTargets = new Map();
  readerPageMissingScopes = new Set();
  readerPageEnabledScopes = new Set();
  if (!readerPageObserver || !readerPageSubscriptions.size || !document.body) return;
  const targets = new Map();
  const scopes = new Set([...readerPageSubscriptions].map((item) => item.scope).filter(isReaderPageScopeEnabled));
  const missingScopes = new Set();
  const watch = (node, subtree = false) => {
    if (node) targets.set(node, Boolean(targets.get(node) || subtree));
  };
  watch(document.body);
  document.querySelectorAll("#app, #video-page-app, #biliMain, #mirror-vdcon, .video-container-v1, .left-container, .right-container-inner")
    .forEach((node) => watch(node));
  for (const scope of scopes) {
    const config = readerPageScopes[scope];
    const roots = document.querySelectorAll(config.roots);
    if (!document.querySelector(config.required || config.roots)) missingScopes.add(scope);
    for (const root of roots) {
      watch(root, config.subtree || root.matches(".up-panel-container, #playerWrap, #bilibili-player, .bpx-player-container"));
      for (let parent = root.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        watch(parent);
      }
    }
  }
  for (const [target, subtree] of targets) {
    readerPageObserver.observe(target, { childList: true, subtree });
  }
  readerPageObservedTargets = targets;
  readerPageMissingScopes = missingScopes;
  readerPageEnabledScopes = scopes;
  // During initial loading, a missing host can arrive below an unobserved
  // wrapper. Discovery stops as soon as every subscribed host is present.
  scheduleReaderPageDiscovery();
}
async function enterReaderMode({ animate = false } = {}) {
  if (readerSessionState.open) return;
  if (isYouTubePage() && !extractYouTubeVideoId()) return;
  readerSessionState.transition?.cancel();
  const sessionId = invalidateReaderSession();
  const open = () => {
    if (sessionId !== readerSessionState.id) return;
    const readerUrl = new URL(location.href);
    readerUrl.searchParams.set("bilibli_reader", "1");
    replaceReaderModeUrl(readerUrl.toString());
    document.documentElement.setAttribute("data-blr-reader-mode", "1");
    document.body.setAttribute("data-blr-reader-mode", "1");
    return prepareReaderMode(sessionId);
  };
  if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return open();
  }
  return transitionReaderMode(open, "enter");
}

async function exitReaderMode() {
  if (!readerSessionState.open || readerSessionState.closing) return;
  readerSessionState.closing = true;
  readerSessionState.transition?.cancel();
  invalidateReaderSession();
  document.documentElement.removeAttribute("data-blr-reader-entering");
  const close = () => {
    replaceReaderModeUrl(stripReaderModeUrl(location.href));
    closeReadingView();
  };
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      close();
    } else {
      await transitionReaderMode(close, "exit");
    }
  } catch (error) {
    close();
    throw error;
  } finally {
    readerSessionState.closing = false;
  }
}

async function transitionReaderMode(update, direction) {
  const root = document.documentElement;
  const playerHost = findReaderPlayerHost(getRuntimeVideoElement());
  // Capture the layout box, not the native player's independently resized
  // inner surface. Both snapshots must use the same coordinate system.
  const player = playerHost && (getReaderPlayerWrapNode(playerHost) || playerHost);
  const rect = player?.getBoundingClientRect();
  // Stop any in-flight smooth scroll before capturing either template.
  stopTranscriptScroll(document.getElementById("blr-reading-inline-host"));
  stopTranscriptScroll(document.getElementById(ids.nativeTranscriptList));
  // Only capture a player already on screen. Direct reader links and pages
  // still loading use the normal mounting/retry path.
  if (
    !document.startViewTransition || !rect || rect.width <= 0 || rect.height <= 0 ||
    rect.bottom <= 0 || rect.top >= window.innerHeight || document.hidden
  ) {
    if (direction === "exit") {
      const nodes = [
        document.getElementById("blr-reading-inline-host"),
        document.querySelector(".blr-reading-topbar")
      ];
      await Promise.all(nodes.filter((node) => node?.animate).map((node) => {
        const animation = node.animate(
          [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(6px)" }],
          { duration: 150, easing: "ease-in", fill: "forwards" }
        );
        return animation.finished.catch(() => {}).finally(() => animation.cancel());
      }));
      return update();
    }
    root.setAttribute("data-blr-reader-entering", "1");
    try {
      await update();
    } finally {
      window.setTimeout(() => root.removeAttribute("data-blr-reader-entering"), 320);
    }
    return;
  }

  const namedNodes = new Map();
  const transitionStyles = new Map();
  const setTransitionStyle = (name, value) => {
    if (!transitionStyles.has(name)) {
      transitionStyles.set(name, {
        value: root.style.getPropertyValue(name),
        priority: root.style.getPropertyPriority(name)
      });
    }
    root.style.setProperty(name, value);
  };
  setTransitionStyle("--blr-transition-player-width", `${rect.width}px`);
  setTransitionStyle("--blr-transition-player-height", `${rect.height}px`);
  setTransitionStyle("--blr-transition-player-from-x", `${rect.left}px`);
  setTransitionStyle("--blr-transition-player-from-y", `${rect.top}px`);
  const nameNode = (node, name) => {
    if (!node || namedNodes.has(node)) return;
    namedNodes.set(node, {
      value: node.style.getPropertyValue("view-transition-name"),
      priority: node.style.getPropertyPriority("view-transition-name")
    });
    node.style.setProperty("view-transition-name", name);
  };
  nameNode(player, "blr-reader-player");
  const sourceTranscript = document.getElementById(
    direction === "enter" ? ids.nativeTranscriptPanel : "blr-reading-inline-host"
  );
  const sourceScrollAnchor = captureTranscriptScrollAnchor(
    direction === "enter" ? document.getElementById(ids.nativeTranscriptList) : sourceTranscript,
    direction === "enter" ? ".blr-native-transcript-segment" : ".blr-reading-complete-segment"
  );
  const sourceFollowPauseUntil = direction === "enter"
    ? nativeTranscriptState.manualScrollPauseUntil : readerSessionState.manualScrollPauseUntil;
  const transcriptRect = sourceTranscript?.getBoundingClientRect();
  if (transcriptRect?.width > 0 && transcriptRect.height > 0) {
    nameNode(sourceTranscript, "blr-reader-transcript");
  }
  root.setAttribute("data-blr-reader-transition", direction);
  let cancelled = false;
  let cleanedUp = false;
  let transition;
  let timeout;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    window.clearTimeout(timeout);
    window.removeEventListener("resize", cancel);
    const pendingReadingRender = readerSessionState.transition?.cancel === cancel &&
      readerSessionState.transition.pendingReadingRender;
    namedNodes.forEach(({ value, priority }, node) => {
      if (value) node.style.setProperty("view-transition-name", value, priority);
      else node.style.removeProperty("view-transition-name");
    });
    transitionStyles.forEach(({ value, priority }, name) => {
      if (value) root.style.setProperty(name, value, priority);
      else root.style.removeProperty(name);
    });
    root.removeAttribute("data-blr-reader-transition");
    root.removeAttribute("data-blr-reader-transcript-transition");
    if (readerSessionState.transition?.cancel === cancel) readerSessionState.transition = null;
    if (readerSessionState.open && readerSessionState.layoutDirty) scheduleReaderLayout();
    if (pendingReadingRender && readerSessionState.open) {
      renderReadingView();
      syncReadingViewPlayback(true);
    }
    if (direction === "exit" && !readerSessionState.open) {
      clearReaderPageFocus();
      scheduleNativeTranscriptPanelSync(0);
      cleanupReaderFloatingArtifacts();
    }
  };
  const cancel = () => {
    cancelled = true;
    transition?.skipTransition();
    cleanup();
  };
  try {
    transition = document.startViewTransition(async () => {
      if (cancelled) return;
      await update();
      if (cancelled || (direction === "enter" && !readerSessionState.open)) return;
      // The mounting code can replace the original player on watch-later pages.
      const nextHost = direction === "enter"
        ? readerPlayerState.host
        : findReaderPlayerHost(getRuntimeVideoElement());
      const nextPlayer = nextHost && (getReaderPlayerWrapNode(nextHost) || nextHost);
      if (nextPlayer !== player) {
        player.style.removeProperty("view-transition-name");
        nameNode(nextPlayer, "blr-reader-player");
      }
      const target = nextPlayer?.getBoundingClientRect();
      if (!target || target.width <= 0 || target.height <= 0) {
        transition.skipTransition();
        return;
      }
      // Keep the captured bitmap's size constant in both directions. Only the
      // group's transform moves/scales it, without a second width animation.
      setTransitionStyle("--blr-transition-player-to-x", `${target.left}px`);
      setTransitionStyle("--blr-transition-player-to-y", `${target.top}px`);
      setTransitionStyle("--blr-transition-player-scale-x", String(target.width / rect.width));
      setTransitionStyle("--blr-transition-player-scale-y", String(target.height / rect.height));
      // Match the subtitle panels in both directions. The native panel must
      // already exist in the new snapshot instead of appearing after exit.
      sourceTranscript?.style.removeProperty("view-transition-name");
      const targetTranscript = document.getElementById(
        direction === "enter" ? "blr-reading-inline-host" : ids.nativeTranscriptPanel
      );
      const targetScrollContainer = direction === "enter"
        ? targetTranscript : document.getElementById(ids.nativeTranscriptList);
      stopTranscriptScroll(targetScrollContainer);
      transferTranscriptScrollAnchor(sourceScrollAnchor, targetScrollContainer,
        direction === "enter" ? "data-index" : "data-native-transcript-index");
      if (direction === "enter") {
        readerSessionState.manualScrollPauseUntil = Math.max(readerSessionState.manualScrollPauseUntil, sourceFollowPauseUntil);
        updateReaderFollowState();
      } else {
        nativeTranscriptState.manualScrollPauseUntil = Math.max(nativeTranscriptState.manualScrollPauseUntil, sourceFollowPauseUntil);
      }
      nameNode(targetTranscript, "blr-reader-transcript");
      const targetTranscriptRect = targetTranscript?.getBoundingClientRect();
      if (
        transcriptRect?.width > 0 && transcriptRect.height > 0 &&
        targetTranscriptRect?.width > 0 && targetTranscriptRect.height > 0
      ) {
        // Translate the two real templates along the same path. Each keeps its
        // own dimensions and typography; only their opacity changes en route.
        [
          ["from-x", transcriptRect.left], ["from-y", transcriptRect.top],
          ["to-x", targetTranscriptRect.left], ["to-y", targetTranscriptRect.top],
          ["from-width", transcriptRect.width], ["from-height", transcriptRect.height],
          ["to-width", targetTranscriptRect.width], ["to-height", targetTranscriptRect.height],
          ["width", Math.max(transcriptRect.width, targetTranscriptRect.width)],
          ["height", Math.max(transcriptRect.height, targetTranscriptRect.height)]
        ].forEach(([name, value]) => setTransitionStyle(`--blr-transcript-${name}`, `${value}px`));
        root.setAttribute("data-blr-reader-transcript-transition", "1");
      }
    });
  } catch {
    cleanup();
    return update();
  }
  readerSessionState.transition = { cancel, direction, phase: "updating", finished: transition.finished };
  window.addEventListener("resize", cancel, { once: true });
  // A slow player must not leave the old page frozen behind a snapshot.
  timeout = window.setTimeout(() => transition.skipTransition(), 900);
  transition.ready.then(() => {
    window.clearTimeout(timeout);
    if (readerSessionState.transition?.cancel === cancel) {
      readerSessionState.transition.phase = "animating";
    }
  }, () => {});
  transition.finished.then(cleanup, cleanup);
  // Skipped animations still perform the update; never mount a second time.
  await transition.updateCallbackDone;
  if (direction === "exit") {
    // Keep exit guards active until all snapshots have finished animating.
    await transition.finished.catch(() => {});
  }
}

const READER_MOUNT_TIMER_KEYS = ["playerMountTimer", "playerRetryTimer"];

function clearReaderMountTimers() {
  READER_MOUNT_TIMER_KEYS.forEach((name) => {
    if (readerSessionState[name]) window.clearTimeout(readerSessionState[name]);
    readerSessionState[name] = 0;
  });
}

function invalidateReaderSession() {
  readerSessionState.id += 1;
  readerSessionState.mountTask = null;
  readerSessionState.resizeCleanup?.(false);
  if (readerSessionState.layoutFrame) window.cancelAnimationFrame(readerSessionState.layoutFrame);
  readerSessionState.layoutFrame = 0;
  readerSessionState.layoutDirty = false;
  clearReaderMountTimers();
  clearReaderPlayerTimers();
  return readerSessionState.id;
}

function isReaderSessionActive(sessionId) {
  return sessionId === readerSessionState.id && readerSessionState.open && isReaderMode();
}

async function prepareReaderMode(sessionId = readerSessionState.id) {
  const readingView = byId(ids.readingView);
  readerSessionState.open = true;
  stopNativeTranscriptPlaybackSync();
  ensureNativeTranscriptPanel();
  document.body.setAttribute("data-blr-reading-active", "1");
  hydrateReaderStateFromSettings(readerPreferences.settings);
  // Each entry gives the video its largest fitted size before allocating subtitles.
  readerSessionState.transcriptAutoWidth = true;
  applyReadingViewPresentation();
  alignReaderViewportToPlayer();
  openReaderViewShell(readingView);
  applyReaderPageFocus();
  renderReadingView();

  // Try to mount player, with more retries for slower pages (like watch later)
  const mounted = await ensureReaderPlayerMounted({ retries: 50, delayMs: 150, forceLayout: true });
  if (!isReaderSessionActive(sessionId)) return;
  if (!mounted) {
    // Don't throw - keep UI open and keep retrying in background
    renderReadingStatus("正在等待视频播放器就绪...");
    scheduleReaderPlayerRetry();
    return;
  }

  finishEnterReaderMode();
}

function scheduleReaderPlayerRetry() {
  if (readerSessionState.playerRetryTimer) {
    window.clearTimeout(readerSessionState.playerRetryTimer);
    readerSessionState.playerRetryTimer = 0;
  }
  const sessionId = readerSessionState.id;
  // Keep trying to mount player in background
  const tryMount = async () => {
    readerSessionState.playerRetryTimer = 0;
    if (!isReaderSessionActive(sessionId)) return;
    const mounted = await ensureReaderPlayerMounted({ retries: 10, delayMs: 200, forceLayout: true });
    if (!isReaderSessionActive(sessionId)) return;
    if (mounted) {
      finishEnterReaderMode();
    } else if (readerSessionState.open) {
      readerSessionState.playerRetryTimer = window.setTimeout(tryMount, 500);
    }
  };
  readerSessionState.playerRetryTimer = window.setTimeout(tryMount, 500);
}

function finishEnterReaderMode() {
  if (!readerSessionState.open || !isReaderMode()) return;

  moveReadingMainInline();
  scheduleReaderMiniPlayerDismiss();
  maybeRefreshReaderSubtitleInBackground();
  syncReaderModeAfterMount();
  settleReaderModePresentation();
  bindReaderHeaderActionsHover();
}

function openReaderViewShell(readingView = byId(ids.readingView)) {
  if (!readingView) {
    return;
  }
  readingView.classList.add("open");
  readingView.setAttribute("aria-hidden", "false");
  setReadingViewReady(false);
  renderReadingStatus("正在准备播放器和字幕...");
}

function maybeRefreshReaderSubtitleInBackground() {
  if (clipState.subtitleBody.length) {
    return;
  }
  const signature = computeCurrentClipSignature();
  const runId = clipState.fetchRunId;
  const sessionId = readerSessionState.id;
  waitForVideoMetadata().then(() => {
    if (!isReaderSessionActive(sessionId) || runId !== clipState.fetchRunId || signature !== computeCurrentClipSignature()) {
      return;
    }
    refreshClip().catch((error) => {
      if (!isStaleRunError(error)) {
        renderReadingStatus(`字幕加载失败：${getErrorMessage(error)}`);
      }
    });
  });
}

function waitForVideoMetadata(timeoutMs = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const video = getRuntimeVideoElement();
      const duration = Number(video?.duration);
      const ready = video && Number.isFinite(duration) && duration > 0;
      if (ready || Date.now() - start >= timeoutMs) {
        resolve();
        return;
      }
      window.setTimeout(check, 150);
    };
    check();
  });
}

function syncReaderModeAfterMount() {
  startReadingViewSync();
  startReaderPlayerObserver();
  layoutReaderPlayerHost();
  syncReadingViewPlayback(true);
  updateReaderFollowState();
}

function settleReaderModePresentation() {
  if (!isReaderPresentationStable()) {
    setReadingViewReady(false);
    renderReadingStatus("正在稳定播放器布局...");
    scheduleReaderPlayerRetry();
    return false;
  }
  setReadingViewReady(true);
  renderReadingStatus("阅读视图已就绪，播放视频时字幕会自动高亮。");
  return true;
}

function ensureReaderPlayerMounted(options = {}) {
  const sessionId = readerSessionState.id;
  if (!isReaderSessionActive(sessionId)) return Promise.resolve(false);
  if (readerSessionState.mountTask?.sessionId === sessionId) return readerSessionState.mountTask.promise;
  const task = { sessionId, promise: null };
  readerSessionState.mountTask = task;
  task.promise = mountReaderPlayer(options, sessionId).finally(() => {
    if (readerSessionState.mountTask === task) readerSessionState.mountTask = null;
  });
  return task.promise;
}

async function mountReaderPlayer({ retries = 1, delayMs = 100, forceLayout = false }, sessionId) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    if (!isReaderSessionActive(sessionId)) return false;
    const video = getRuntimeVideoElement();
    const playerHost = findReaderPlayerHost(video);
    if (video && playerHost) {
      if (isYouTubePage()) {
        readerPlayerState.host = playerHost;
        bindReadingViewVideo(video);
        bindReaderLayout();
        layoutReaderPlayerHost();
        return true;
      }
      const previousHost = readerPlayerState.host;
      const previousVideo = readerPlayerState.videoEl;
      video.controls = false;
      video.removeAttribute("controls");
      video.disablePictureInPicture = true;
      video.setAttribute("disablepictureinpicture", "");
      video.removeAttribute("autopictureinpicture");
      readerPlayerState.host = playerHost;
      const miniPlayerClosed = dismissReaderMiniPlayer(playerHost);
      if (miniPlayerClosed) {
        await sleep(120);
      }
      if (!isReaderSessionActive(sessionId)) return false;
      if (!video.isConnected) continue;
      const activeHost = findReaderPlayerHost(video) || playerHost;
      readerPlayerState.host = activeHost;
      normalizeReaderPlayerContainer(activeHost);
      clearNativeReaderFloatingStyles(activeHost);
      if (hasNativeReaderPlayerLayoutIssue(activeHost)) {
        normalizeReaderPlayerContainer(activeHost);
        clearNativeReaderFloatingStyles(activeHost);
      }
      if (previousHost && previousHost !== activeHost) {
        setReaderPlayerControlsVisible(false, previousHost);
        cleanupReaderPlayerHostNode(previousHost);
      }
      if (previousVideo !== video) {
        readerPlayerState.videoEventsBound = false;
      }
      activeHost.classList.add("blr-reader-player-host");
      bindReadingViewVideo(video);
      bindReaderPlayerControlsHover(activeHost);
      bindReaderLayout();
      if (
        forceLayout ||
        previousHost !== activeHost ||
        attempt > 0 ||
        miniPlayerClosed ||
        hasNativeReaderPlayerLayoutIssue(activeHost)
      ) {
        layoutReaderPlayerHost();
        if (hasNativeReaderPlayerLayoutIssue(activeHost)) {
          normalizeReaderPlayerContainer(activeHost);
          clearNativeReaderFloatingStyles(activeHost);
          layoutReaderPlayerHost();
        }
      }
      if (!isWatchlaterPage()) {
        await ensureReaderPlayerControlsRecovered(activeHost, {
          reason: attempt > 0 ? "mount-retry" : "mount"
        });
        if (!isReaderSessionActive(sessionId)) return false;
        queueEnsureReaderPlayerControlsRecovered({
          reason: attempt > 0 ? "post-mount-retry" : "post-mount",
          delayMs: 220,
          minIntervalMs: 240
        });
      }
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
      return true;
    }
    await sleep(delayMs);
  }
  return false;
}

function queueEnsureReaderPlayerMounted() {
  if (!readerSessionState.open || !isReaderMode() || readerSessionState.playerMountTimer) {
    return;
  }
  const sessionId = readerSessionState.id;
  readerSessionState.playerMountTimer = window.setTimeout(() => {
    readerSessionState.playerMountTimer = 0;
    if (!isReaderSessionActive(sessionId)) return;
    ensureReaderPlayerMounted({ retries: 12, delayMs: 120, forceLayout: true })
      .then((mounted) => {
        if (!mounted || !isReaderSessionActive(sessionId)) {
          return;
        }
        moveReadingMainInline();
        applyReaderPageFocus();
        layoutReaderPlayerHost();
        syncReadingViewPlayback(true);
        settleReaderModePresentation();
      })
      .catch((error) => {
        logWarn("[BOC] ensure reader player mounted failed", error);
      });
  }, 60);
}

function closeReadingView() {
  invalidateReaderSession();
  const deferCleanup = readerSessionState.transition?.direction === "exit";
  cleanupReaderFloatingArtifacts();
  readerSessionState.open = false;
  readerSessionState.ready = false;
  readerSessionState.manualScrollPauseUntil = 0;
  readerSessionState.programmaticScrollUntil = 0;
  readerSessionState.collectionSwitchInFlight = false;
  readerSessionState.nextScrollBehavior = "smooth";
  const readingView = byId(ids.readingView);
  readingView.classList.remove("open");
  readingView.setAttribute("aria-hidden", "true");
  readingView.setAttribute("data-blr-reader-ready", "0");
  readingView.removeAttribute("data-blr-reader-follow");
  clearReaderPresentationAttributes();
  [document.documentElement, document.body, readingView].forEach((node) => {
    node.style.removeProperty("--blr-reader-rail-width");
    node.style.removeProperty("--blr-reader-transcript-width");
    node.style.removeProperty("--blr-reader-center-offset");
    node.style.removeProperty("--blr-reader-main-width");
    node.style.removeProperty("--blr-reader-player-left");
    node.style.removeProperty("--blr-reader-player-top");
    node.style.removeProperty("--blr-reader-player-bottom");
    node.style.removeProperty("--blr-reader-player-width");
  });
  restoreReadingMainInline();
  stopReadingViewSync();
  unbindReaderLayout();
  cleanupReaderPlayerHost();
  if (!deferCleanup) clearReaderPageFocus();
  // Restore and populate the normal-page subtitles before the new snapshot.
  // Observer-driven refreshes stay deferred while the snapshots animate.
  ensureNativeTranscriptPanel();
  // Restore the sending bar together with the native layout. Hiding it for
  // 200ms changed the player's height in the middle of the exit transition.
  if (!deferCleanup) {
    window.setTimeout(() => cleanupReaderFloatingArtifacts(), 40);
    window.setTimeout(() => cleanupReaderFloatingArtifacts(), 220);
  }
}
function getReaderContentMaxPx() {
  if (readerPreferences.contentWidth === "compact") {
    return 720;
  }
  if (readerPreferences.contentWidth === "narrow") {
    return 820;
  }
  if (readerPreferences.contentWidth === "wide") {
    return 1120;
  }
  if (readerPreferences.contentWidth === "full") {
    return 1280;
  }
  return 980;
}

function getReaderPagePaddingPx() {
  return Math.min(32, Math.max(16, window.innerWidth * 0.028));
}

function getReaderMainWidthLimit(columns = null) {
  const pagePadding = getReaderPagePaddingPx();
  if (window.innerWidth > 1180) {
    const { transcriptWidth, gap } = columns || getEffectiveReaderColumnWidths();
    const availableWidth = window.innerWidth - pagePadding * 2 - transcriptWidth - gap;
    // Fit against the real video ratio and player top in layoutReaderPlayerHost.
    return Math.max(1, availableWidth);
  }
  return Math.max(320, Math.min(getReaderContentMaxPx(), window.innerWidth - pagePadding * 2));
}

function getReaderPlayerMaxHeightPx(playerTop) {
  const isDesktop = window.innerWidth > 1180;
  const hasChapterRail = isDesktop && getCachedReadingChapters().length > 0;
  // Only visible chapters reserve space below the video.
  const bottomSpace = hasChapterRail ? 148 : 0;
  let playerBottomLimit = window.innerHeight - bottomSpace;
  if (isDesktop) {
    const transcriptRect = document.getElementById("blr-reading-inline-host")?.getBoundingClientRect();
    // Before the transcript mounts, use its desktop CSS bottom inset (24px).
    const transcriptBottom = transcriptRect?.width > 0 && transcriptRect.height > 0
      ? transcriptRect.bottom
      : window.innerHeight - 24;
    playerBottomLimit = Math.min(playerBottomLimit, transcriptBottom);
  }
  return Math.max(1, playerBottomLimit - playerTop);
}

function normalizeReaderColumnWidth(value, fallback, min, max) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(Math.min(max, Math.max(min, parsed))) : fallback;
}

function getReaderVideoAspectRatio() {
  const video = readerPlayerState.videoEl || getRuntimeVideoElement();
  return Number(video?.videoWidth) > 0 && Number(video?.videoHeight) > 0
    ? Number(video.videoWidth) / Number(video.videoHeight)
    : 16 / 9;
}

function getEffectiveReaderColumnWidths() {
  const pagePadding = getReaderPagePaddingPx();
  const gap = Math.min(24, Math.max(16, window.innerWidth * 0.014));
  const minChapterWidth = 140;
  let minTranscriptWidth = 280;
  const minVideoWidth = 420;
  const chapterWidth = normalizeReaderColumnWidth(readerPreferences.chapterWidthPx, 220, minChapterWidth, 360);
  let maxTranscriptWidth = Math.max(
    minTranscriptWidth,
    window.innerWidth - pagePadding * 2 - gap - minVideoWidth
  );
  if (readerSessionState.open && window.innerWidth > 1180) {
    const video = readerPlayerState.videoEl || getRuntimeVideoElement();
    const playerHost = readerPlayerState.host || findReaderPlayerHost(video);
    const playerNode = getReaderPlayerWrapNode(playerHost) || playerHost;
    const playerTop = playerNode?.getBoundingClientRect?.().top ?? 98;
    const maxHeight = getReaderPlayerMaxHeightPx(playerTop);
    const availableWidth = window.innerWidth - pagePadding * 2 - gap;
    // Give the video its largest complete frame first, then use the remaining
    // horizontal space for subtitles instead of reserving a fixed-width panel.
    const videoWidth = Math.min(availableWidth - 280, maxHeight * getReaderVideoAspectRatio());
    minTranscriptWidth = Math.max(280, Math.ceil(availableWidth - videoWidth));
    maxTranscriptWidth = Math.max(
      minTranscriptWidth, Math.floor(availableWidth - Math.min(minVideoWidth, videoWidth))
    );
  }
  const transcriptWidth = readerSessionState.open && window.innerWidth > 1180 && readerSessionState.transcriptAutoWidth
    ? minTranscriptWidth
    : normalizeReaderColumnWidth(readerPreferences.transcriptWidthPx, 440, minTranscriptWidth, maxTranscriptWidth);

  return {
    chapterWidth: Math.round(chapterWidth),
    transcriptWidth: Math.round(transcriptWidth),
    minTranscriptWidth,
    maxTranscriptWidth,
    gap
  };
}

function setReaderStyle(node, name, value) {
  if (node && node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
}

function applyReaderColumnLayout(columns = getEffectiveReaderColumnWidths()) {
  const readingView = byId(ids.readingView);
  if (!readingView) return;
  const { chapterWidth, transcriptWidth, minTranscriptWidth, maxTranscriptWidth, gap } = columns;
  const mainWidth = getReaderMainWidthLimit(columns);
  const centerOffset = Math.round(-(transcriptWidth + gap) / 2);
  [document.documentElement, document.body, readingView].forEach((node) => {
    setReaderStyle(node, "--blr-reader-rail-width", `${chapterWidth}px`);
    setReaderStyle(node, "--blr-reader-transcript-width", `${transcriptWidth}px`);
    setReaderStyle(node, "--blr-reader-center-offset", `${centerOffset}px`);
    setReaderStyle(node, "--blr-reader-main-width", `${Math.round(mainWidth)}px`);
  });
  const resizeHandle = document.getElementById(ids.readingTranscriptResizeHandle);
  resizeHandle?.setAttribute("aria-valuenow", String(transcriptWidth));
  resizeHandle?.setAttribute("aria-valuemin", String(minTranscriptWidth));
  resizeHandle?.setAttribute("aria-valuemax", String(maxTranscriptWidth));
}

function updateReaderChapterRailPosition(rect = null) {
  const readingView = document.getElementById(ids.readingView);
  if (!readingView || window.innerWidth <= 1180) return;

  const playerNode = getReaderPlayerWrapNode() || readerPlayerState.host;
  const playerRect = rect || playerNode?.getBoundingClientRect?.();
  if (!playerRect || !(playerRect.width > 0) || !(playerRect.height > 0)) return;

  [document.documentElement, document.body, readingView].forEach((node) => {
    setReaderStyle(node, "--blr-reader-player-left", `${Math.round(playerRect.left)}px`);
    setReaderStyle(node, "--blr-reader-player-top", `${Math.round(playerRect.top)}px`);
    setReaderStyle(node, "--blr-reader-player-bottom", `${Math.round(playerRect.bottom)}px`);
    setReaderStyle(node, "--blr-reader-player-width", `${Math.round(playerRect.width)}px`);
  });
}

function bindReaderResizeHandle(node) {
  if (!node || node.dataset.blrBound === "1") return;

  node.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || window.innerWidth <= 1180 || readerSessionState.transition) return;
    readerSessionState.resizeCleanup?.(false);
    event.preventDefault();
    node.setPointerCapture?.(event.pointerId);
    document.body.dataset.blrReaderResizing = "transcript";
    noteManualReaderInteraction();
    const sessionId = readerSessionState.id;
    const scrollAnchor = captureTranscriptScrollAnchor(
      document.getElementById("blr-reading-inline-host"), ".blr-reading-complete-segment"
    );
    let frame = 0;
    let latestX = null;
    let hasMoved = false;
    let stopped = false;

    const flush = () => {
      if (latestX === null || !isReaderSessionActive(sessionId)) return;
      const { gap, minTranscriptWidth, maxTranscriptWidth } = getEffectiveReaderColumnWidths();
      readerSessionState.transcriptAutoWidth = false;
      readerPreferences.transcriptWidthPx = normalizeReaderColumnWidth(
        window.innerWidth - getReaderPagePaddingPx() - latestX - gap / 2,
        readerPreferences.transcriptWidthPx, minTranscriptWidth, maxTranscriptWidth
      );
      latestX = null;
      layoutReaderPlayerHost();
      restoreTranscriptScrollAnchor(scrollAnchor);
    };
    const move = (moveEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return;
      if (!isReaderSessionActive(sessionId)) {
        finish(false);
        return;
      }
      latestX = moveEvent.clientX;
      hasMoved = true;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        flush();
      });
    };
    const end = (endEvent) => {
      if (endEvent.pointerId !== event.pointerId) return;
      if (hasMoved && endEvent.type === "pointerup") latestX = endEvent.clientX;
      finish(true);
    };
    const finish = (persist = true) => {
      if (stopped) return;
      stopped = true;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      if (persist) flush();
      if (node.hasPointerCapture?.(event.pointerId)) node.releasePointerCapture(event.pointerId);
      document.body.removeAttribute("data-blr-reader-resizing");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (readerSessionState.resizeCleanup === finish) readerSessionState.resizeCleanup = null;
      if (!persist || !isReaderSessionActive(sessionId)) return;
      noteManualReaderInteraction();
      readerPreferences.settings = { ...readerPreferences.settings, readerTranscriptWidthPx: readerPreferences.transcriptWidthPx };
      persistReaderSettings();
    };
    readerSessionState.resizeCleanup = finish;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  });
  node.dataset.blrBound = "1";
}

function scheduleReaderLayout() {
  if (!readerSessionState.open || !isReaderMode()) return;
  readerSessionState.layoutDirty = true;
  if (readerSessionState.layoutFrame || readerSessionState.transition?.phase === "animating") return;
  const sessionId = readerSessionState.id;
  readerSessionState.layoutFrame = window.requestAnimationFrame(() => {
    readerSessionState.layoutFrame = 0;
    if (!isReaderSessionActive(sessionId)) return;
    layoutReaderPlayerHost();
  });
}

function observeReaderPlayerLayout() {
  const player = getReaderPlayerWrapNode() || readerPlayerState.host;
  if (readerSessionState.observedPlayer === player) return;
  readerSessionState.resizeObserver?.disconnect();
  readerSessionState.observedPlayer = player;
  if (!player) return;
  readerSessionState.resizeObserver = new ResizeObserver(scheduleReaderLayout);
  readerSessionState.resizeObserver.observe(player);
}

function bindReaderLayout() {
  observeReaderPlayerLayout();
  if (readerPlayerState.layoutBound) {
    return;
  }
  window.addEventListener("resize", scheduleReaderLayout);
  window.addEventListener("scroll", scheduleReaderLayout, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleReaderLayout);
  document.addEventListener("fullscreenchange", scheduleReaderLayout);
  document.addEventListener("webkitfullscreenchange", scheduleReaderLayout);
  readerPlayerState.layoutBound = true;
}

function unbindReaderLayout() {
  readerSessionState.resizeObserver?.disconnect();
  readerSessionState.resizeObserver = null;
  readerSessionState.observedPlayer = null;
  if (readerSessionState.layoutFrame) window.cancelAnimationFrame(readerSessionState.layoutFrame);
  readerSessionState.layoutFrame = 0;
  readerSessionState.layoutDirty = false;
  if (!readerPlayerState.layoutBound) {
    return;
  }
  window.removeEventListener("resize", scheduleReaderLayout);
  window.removeEventListener("scroll", scheduleReaderLayout);
  window.visualViewport?.removeEventListener("resize", scheduleReaderLayout);
  document.removeEventListener("fullscreenchange", scheduleReaderLayout);
  document.removeEventListener("webkitfullscreenchange", scheduleReaderLayout);
  readerPlayerState.layoutBound = false;
}

// Size YouTube with scoped CSS while keeping its player in the native DOM.
// Its inline dimensions and controls belong to YouTube and survive reader exit.
function layoutYouTubeReaderPlayer() {
  if (
    document.fullscreenElement || document.webkitFullscreenElement ||
    readerPlayerState.host?.classList.contains("ytp-fullscreen")
  ) return;
  const columns = getEffectiveReaderColumnWidths();
  applyReaderColumnLayout(columns);
  const padding = getReaderPagePaddingPx();
  const top = 98;
  const desktop = window.innerWidth > 1180;
  const hasChapters = getCachedReadingChapters().length > 0;
  const availableWidth = desktop
    ? window.innerWidth - padding * 2 - columns.transcriptWidth - columns.gap
    : window.innerWidth - padding * 2;
  const availableHeight = desktop
    ? window.innerHeight - top - (hasChapters ? 148 : 24)
    : Math.min(window.innerHeight * 0.4, window.innerHeight - top - 240 - (hasChapters ? 128 : 0));
  const ratio = getReaderVideoAspectRatio();
  const width = Math.max(1, Math.min(availableWidth, Math.max(1, availableHeight) * ratio));
  const height = width / ratio;
  const left = desktop ? padding : (window.innerWidth - width) / 2;
  [document.documentElement, document.body, byId(ids.readingView)].forEach((node) => {
    setReaderStyle(node, "--blr-reader-player-left", `${Math.round(left)}px`);
    setReaderStyle(node, "--blr-reader-player-top", `${top}px`);
    setReaderStyle(node, "--blr-reader-player-bottom", `${Math.round(top + height)}px`);
    setReaderStyle(node, "--blr-reader-player-width", `${width}px`);
    setReaderStyle(node, "--blr-reader-player-rendered-width", `${width}px`);
    setReaderStyle(node, "--blr-reader-player-rendered-height", `${height}px`);
  });
  updateReadingTranscriptTailSpacer();
}

function layoutReaderPlayerHost() {
  if (!readerSessionState.open || !isReaderMode()) {
    return;
  }

  if (readerSessionState.transition?.phase === "animating") {
    readerSessionState.layoutDirty = true;
    return;
  }
  readerSessionState.layoutDirty = false;
  if (isYouTubePage()) {
    layoutYouTubeReaderPlayer();
    return;
  }
  const readingView = byId(ids.readingView);
  const columns = getEffectiveReaderColumnWidths();
  applyReaderColumnLayout(columns);
  const playerHost = readerPlayerState.host;
  if (!playerHost) {
    return;
  }

  const aspectRatio = getReaderVideoAspectRatio();

  const rect = playerHost.getBoundingClientRect();
  if (!(rect.width > 0) || !(rect.height > 0)) {
    return;
  }

  const widthLimit = getReaderMainWidthLimit(columns);
  const wrapRect = getReaderPlayerWrapNode(playerHost)?.getBoundingClientRect?.();
  const layoutTop = Number.isFinite(wrapRect?.top) ? wrapRect.top : rect.top;
  const maxHeight = getReaderPlayerMaxHeightPx(layoutTop);
  // Fit the whole video, then size the player to that same aspect ratio.
  // Filling the width and height independently creates letterbox bars.
  const renderedWidth = Math.min(widthLimit, maxHeight * aspectRatio);
  const renderedHeight = renderedWidth / aspectRatio;

  clearNativeReaderFloatingStyles(playerHost);
  cleanupReaderPlayerHostNode(playerHost);
  [document.documentElement, document.body, readingView].forEach((node) => {
    setReaderStyle(node, "--blr-reader-player-rendered-width", `${renderedWidth}px`);
    setReaderStyle(node, "--blr-reader-player-rendered-height", `${renderedHeight}px`);
  });
  updateReaderChapterRailPosition();
  updateReadingTranscriptTailSpacer();
  queueEnsureReaderPlayerControlsRecovered({
    reason: "layout-native",
    delayMs: 120
  });
}
const nativeTranscriptRenderCache = new WeakMap();

function startNativeTranscriptPanelObserver() {
  if (nativeTranscriptState.observer || !document.body) {
    return;
  }

  nativeTranscriptState.observer = subscribeReaderPageChanges(
    "native", () => scheduleNativeTranscriptPanelSync()
  );
  window.addEventListener("resize", () => scheduleNativeTranscriptPanelSync(60), {
    passive: true
  });
  scheduleNativeTranscriptPanelSync(0);
}

function scheduleNativeTranscriptPanelSync(delayMs = 120) {
  if (nativeTranscriptState.syncTimer) {
    return;
  }
  nativeTranscriptState.syncTimer = window.setTimeout(() => {
    nativeTranscriptState.syncTimer = 0;
    // closeReadingView restores the panel before the exit snapshot. Keep
    // observer-driven refreshes out of the animation; completion syncs again.
    if (readerSessionState.transition?.direction === "exit") return;
    ensureNativeTranscriptPanel();
  }, Math.max(0, Number(delayMs) || 0));
}

function shouldShowNativeTranscriptPanel() {
  return isSupportedTranscriptPage() && !isReaderMode() && !readerSessionState.open;
}

function findNativeTranscriptAnchor() {
  if (isYouTubePage()) return document.querySelector("ytd-watch-flexy #secondary-inner #related");
  const danmaku = document.getElementById("danmukuBox") || document.querySelector(".danmaku-box");
  const rightContainer = danmaku?.closest(".right-container-inner");
  const collaborationPanel = rightContainer?.querySelector(
    ":scope > .up-panel-container .members-info-container"
  );
  const collaborationAnchor = collaborationPanel?.closest(".up-panel-container");
  return collaborationAnchor || danmaku;
}

function ensureNativeTranscriptPanel() {
  const existing = document.getElementById(ids.nativeTranscriptPanel);
  if (!shouldShowNativeTranscriptPanel()) {
    existing?.parentElement?.removeAttribute("data-blr-youtube-transcript-open");
    stopNativeTranscriptPlaybackSync();
    nativeTranscriptState.resizeObserver?.disconnect();
    nativeTranscriptState.observedPlayer = null;
    existing?.remove();
    return null;
  }

  const anchor = findNativeTranscriptAnchor();
  if (!anchor?.parentElement) {
    return null;
  }

  let panel = existing;
  const created = !panel;
  if (!panel) {
    panel = document.createElement("section");
    panel.id = ids.nativeTranscriptPanel;
    panel.className = "blr-native-transcript-panel";
    panel.setAttribute("data-blr-extension-node", "native-transcript");
    panel.innerHTML = readerHtml(`
      <div id="${ids.nativeTranscriptHeader}" class="blr-native-transcript-header">
        <button
          class="blr-native-transcript-title-button"
          type="button"
          data-native-transcript-toggle
          aria-controls="${ids.nativeTranscriptBody}"
          aria-expanded="true"
        >字幕</button>
        <div id="${ids.nativeTranscriptControls}" class="blr-native-transcript-controls">
          <button
            id="${ids.nativeTranscriptReaderButton}"
            class="blr-native-transcript-reader-button"
            type="button"
            title="进入阅读模式"
            aria-label="进入阅读模式"
            aria-pressed="false"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5.5C9 3.5 5.5 3.5 2.5 4.5v15c3-1 6.5-1 9.5 1 3-2 6.5-2 9.5-1v-15c-3-1-6.5-1-9.5 1Z"/><path d="M12 5.5v15M5.5 8h3M5.5 11.5h3M15.5 8h3M15.5 11.5h3"/></svg>
          </button>
          <button
            id="${ids.nativeTranscriptReturnButton}"
            class="blr-native-transcript-return-button"
            type="button"
            title="回到当前字幕"
            aria-label="回到当前字幕"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
          </button>
          <button
            id="${ids.nativeTranscriptThemeButton}"
            class="blr-native-transcript-theme-button"
            type="button"
            title="切换字幕主题"
            aria-label="切换字幕主题"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          </button>
          <select id="${ids.nativeTranscriptSelect}" aria-label="字幕语言" title="字幕语言" disabled>
            <option value="">字幕</option>
          </select>
          <select id="${ids.nativeTranscriptFontSizeSelect}" aria-label="字幕字号" title="字幕字号">
            ${[12, 14, 16, 18, 20, 22]
              .map((value) => `<option value="${value}">${value}</option>`)
              .join("")}
          </select>
          <select id="${ids.nativeTranscriptFontWeightSelect}" aria-label="字幕字重" title="字幕字重">
            ${[300, 400, 500, 600, 700]
              .map((value) => `<option value="${value}">${value}</option>`)
              .join("")}
          </select>
        </div>
        <button
          class="blr-native-transcript-arrow-button"
          type="button"
          data-native-transcript-toggle
          aria-label="折叠字幕"
          aria-controls="${ids.nativeTranscriptBody}"
          aria-expanded="true"
        >
          <svg class="blr-native-transcript-arrow" viewBox="0 0 16 16" aria-hidden="true">
            <path d="m6 3.75 4.25 4.25L6 12.25"></path>
          </svg>
        </button>
      </div>
      <div id="${ids.nativeTranscriptBody}" class="blr-native-transcript-body">
        <div class="blr-native-transcript-state">正在加载字幕...</div>
      </div>
    `);
    bindNativeTranscriptPanelEvents(panel);
  }

  if (panel.parentElement !== anchor.parentElement || panel.nextElementSibling !== anchor) {
    panel.parentElement?.removeAttribute("data-blr-youtube-transcript-open");
    anchor.insertAdjacentElement("beforebegin", panel);
  }
  panel.dataset.platform = isYouTubePage() ? "youtube" : "bilibili";

  panel.classList.toggle(
    "is-collaboration-layout",
    anchor.matches(".up-panel-container") && Boolean(anchor.querySelector(".members-info-container"))
  );

  setNativeTranscriptExpanded(panel, nativeTranscriptState.open);
  if (created && isYouTubePage()) nativeTranscriptState.observedPlayer = null;
  bindNativeTranscriptPanelResize();
  const playerRect = syncNativeTranscriptPanelAlignment();
  syncNativeTranscriptPanelHeight(playerRect);
  ensureNativeTranscriptLoaded();
  renderNativeTranscriptPanel({ force: created });
  return panel;
}

function bindNativeTranscriptPanelEvents(panel) {
  const body = panel.querySelector(`#${ids.nativeTranscriptBody}`);
  panel.querySelector(`#${ids.nativeTranscriptReaderButton}`)?.addEventListener("click", onTranscriptReaderEntryClick);
  const returnButton = panel.querySelector(`#${ids.nativeTranscriptReturnButton}`);
  const themeButton = panel.querySelector(`#${ids.nativeTranscriptThemeButton}`);
  const toggle = () => {
    if (isNativeTranscriptEmpty()) {
      autoFoldNativeTranscriptIfEmpty();
      showNativeTranscriptEmptyNotice(panel);
      return;
    }
    nativeTranscriptState.open = !nativeTranscriptState.open;
    setNativeTranscriptExpanded(panel, nativeTranscriptState.open);
    if (nativeTranscriptState.open) {
      ensureNativeTranscriptLoaded();
      syncNativeTranscriptPlayback(true);
    }
  };
  panel.querySelectorAll("[data-native-transcript-toggle]").forEach((button) => {
    button.addEventListener("click", toggle);
  });
  returnButton?.addEventListener("click", () => {
    if (isNativeTranscriptEmpty()) {
      autoFoldNativeTranscriptIfEmpty();
      showNativeTranscriptEmptyNotice(panel);
      return;
    }
    nativeTranscriptState.manualScrollPauseUntil = 0;
    if (!nativeTranscriptState.open) {
      nativeTranscriptState.open = true;
      setNativeTranscriptExpanded(panel, true);
      ensureNativeTranscriptLoaded().then(() => syncNativeTranscriptPlayback(true));
    } else {
      syncNativeTranscriptPlayback(true);
    }
    returnButton.classList.add("is-active");
    window.setTimeout(() => returnButton.classList.remove("is-active"), 300);
  });
  themeButton?.addEventListener("click", () => {
    const themes = ["light", "dark", "paper"];
    const nextIndex = (themes.indexOf(readerPreferences.nativeTheme) + 1) % themes.length;
    updateNativeTranscriptTheme(themes[nextIndex]);
    themeButton.classList.add("is-active");
    window.setTimeout(() => themeButton.classList.remove("is-active"), 300);
  });
  body?.addEventListener("click", onNativeTranscriptClick);
  panel.addEventListener("change", onNativeTranscriptChange);
  const noteManualScroll = () => {
    if (Date.now() <= nativeTranscriptState.programmaticScrollUntil) {
      return;
    }
    nativeTranscriptState.manualScrollPauseUntil = Date.now() + 3000;
  };
  body?.addEventListener("scroll", noteManualScroll, true);
  body?.addEventListener("wheel", noteManualScroll, { passive: true });
  body?.addEventListener("pointerdown", noteManualScroll, { passive: true });
}

function isNativeTranscriptEmpty() {
  return (
    clipState.fetchClipSignature === computeCurrentClipSignature() &&
    clipState.subtitleFetchState === "empty"
  );
}

function clearNativeTranscriptEmptyNotice(panel) {
  panel?.querySelector(".blr-native-transcript-empty-notice")?.remove();
}

function showNativeTranscriptEmptyNotice(panel) {
  clearNativeTranscriptEmptyNotice(panel);
  const notice = document.createElement("div");
  notice.className = "blr-native-transcript-empty-notice";
  notice.setAttribute("role", "status");
  notice.textContent = "当前视频无字幕";
  notice.addEventListener("animationend", () => notice.remove(), { once: true });
  panel.appendChild(notice);
}

function setNativeTranscriptExpanded(panel, expanded) {
  if (!panel) {
    return;
  }
  const isExpanded = Boolean(expanded) && !isNativeTranscriptEmpty();
  panel.classList.toggle("is-folded", !isExpanded);
  if (isYouTubePage()) {
    panel.parentElement?.toggleAttribute("data-blr-youtube-transcript-open", isExpanded);
  }
  panel.querySelectorAll("[data-native-transcript-toggle]").forEach((button) => {
    const value = String(isExpanded);
    if (button.getAttribute("aria-expanded") !== value) button.setAttribute("aria-expanded", value);
  });
  const arrowButton = panel.querySelector(".blr-native-transcript-arrow-button");
  const label = isExpanded ? "折叠字幕" : "展开字幕";
  if (arrowButton && arrowButton.getAttribute("aria-label") !== label) arrowButton.setAttribute("aria-label", label);
  const body = panel.querySelector(`#${ids.nativeTranscriptBody}`);
  if (body && body.hidden !== !isExpanded) {
    body.hidden = !isExpanded;
  }
  if (isExpanded) startNativeTranscriptPlaybackSync();
  else stopNativeTranscriptPlaybackSync();
}

function hydrateNativeTranscriptSettings(settings = readerPreferences.settings) {
  readerPreferences.nativeTheme = normalizeReaderTheme(settings?.nativeTranscriptTheme);
  readerPreferences.nativeFontSize = normalizeNativeTranscriptFontSize(
    settings?.nativeTranscriptFontSize
  );
  readerPreferences.nativeFontWeight = normalizeNativeTranscriptFontWeight(
    settings?.nativeTranscriptFontWeight
  );
  readerPreferences.settings = {
    ...readerPreferences.settings,
    nativeTranscriptTheme: readerPreferences.nativeTheme,
    nativeTranscriptFontSize: readerPreferences.nativeFontSize,
    nativeTranscriptFontWeight: readerPreferences.nativeFontWeight
  };
  applyNativeTranscriptTypography();
}

function applyNativeTranscriptTypography(panel = document.getElementById(ids.nativeTranscriptPanel)) {
  if (!panel) {
    return;
  }
  const typographyChanged = panel.style.getPropertyValue("--blr-native-transcript-font-size") !== `${readerPreferences.nativeFontSize}px` ||
    panel.style.getPropertyValue("--blr-native-transcript-font-weight") !== String(readerPreferences.nativeFontWeight);
  const scrollAnchor = typographyChanged ? captureTranscriptScrollAnchor(
    panel.querySelector(`#${ids.nativeTranscriptList}`), ".blr-native-transcript-segment"
  ) : null;
  setReaderDatasetValue(panel, "theme", readerPreferences.nativeTheme);
  const themeButton = panel.querySelector(`#${ids.nativeTranscriptThemeButton}`);
  if (themeButton) {
    const themeLabels = { light: "浅色", dark: "深色", paper: "纸张" };
    const label = `切换字幕主题，当前：${themeLabels[readerPreferences.nativeTheme] || "浅色"}`;
    if (themeButton.title !== label) themeButton.title = label;
    if (themeButton.getAttribute("aria-label") !== label) themeButton.setAttribute("aria-label", label);
  }
  setReaderStyle(panel,
    "--blr-native-transcript-font-size",
    `${readerPreferences.nativeFontSize}px`
  );
  setReaderStyle(panel,
    "--blr-native-transcript-font-weight",
    String(readerPreferences.nativeFontWeight)
  );
  const fontSizeSelect = panel.querySelector(`#${ids.nativeTranscriptFontSizeSelect}`);
  const fontWeightSelect = panel.querySelector(`#${ids.nativeTranscriptFontWeightSelect}`);
  if (fontSizeSelect && fontSizeSelect.value !== String(readerPreferences.nativeFontSize)) {
    fontSizeSelect.value = String(readerPreferences.nativeFontSize);
  }
  if (fontWeightSelect && fontWeightSelect.value !== String(readerPreferences.nativeFontWeight)) {
    fontWeightSelect.value = String(readerPreferences.nativeFontWeight);
  }
  restoreTranscriptScrollAnchor(scrollAnchor);
}

function updateNativeTranscriptTheme(theme) {
  readerPreferences.nativeTheme = normalizeReaderTheme(theme);
  readerPreferences.settings = {
    ...readerPreferences.settings,
    nativeTranscriptTheme: readerPreferences.nativeTheme
  };
  applyNativeTranscriptTypography();
  persistReaderSettings();
}

function updateNativeTranscriptTypography({ fontSize, fontWeight } = {}) {
  readerSessionState.transition?.cancel();
  nativeTranscriptState.manualScrollPauseUntil = Date.now() + 3000;
  readerPreferences.nativeFontSize = normalizeNativeTranscriptFontSize(
    fontSize ?? readerPreferences.nativeFontSize
  );
  readerPreferences.nativeFontWeight = normalizeNativeTranscriptFontWeight(
    fontWeight ?? readerPreferences.nativeFontWeight
  );
  readerPreferences.settings = {
    ...readerPreferences.settings,
    nativeTranscriptFontSize: readerPreferences.nativeFontSize,
    nativeTranscriptFontWeight: readerPreferences.nativeFontWeight
  };
  applyNativeTranscriptTypography();
  persistReaderSettings();
}

function renderNativeTranscriptHeaderControls(panel) {
  const languageSelect = panel.querySelector(`#${ids.nativeTranscriptSelect}`);
  syncSubtitleLanguageSelect(languageSelect);
  applyNativeTranscriptTypography(panel);
}

function getNativeTranscriptPlaceholderText() {
  if (
    clipState.fetchClipSignature !== computeCurrentClipSignature() ||
    clipState.subtitleFetchState === "loading" ||
    clipState.subtitleFetchState === "idle"
  ) {
    return "正在加载字幕...";
  }
  if (clipState.subtitleFetchState === "error") {
    return "字幕加载失败";
  }
  return "当前视频无字幕";
}

function renderNativeTranscriptPanel({ force = false } = {}) {
  if (readerSessionState.transition?.phase === "animating") return;
  const panel = document.getElementById(ids.nativeTranscriptPanel);
  const body = panel?.querySelector(`#${ids.nativeTranscriptBody}`);
  if (!panel || !body || !shouldShowNativeTranscriptPanel()) {
    return;
  }

  renderNativeTranscriptHeaderControls(panel);
  if (isNativeTranscriptEmpty()) {
    autoFoldNativeTranscriptIfEmpty();
  } else {
    clearNativeTranscriptEmptyNotice(panel);
  }

  const renderKey = [
    computeCurrentClipSignature(),
    clipState.fetchClipSignature,
    clipState.subtitleFetchState,
    clipState.selectedSubtitleId,
    normalizeSubtitleUrlForCache(clipState.selectedSubtitleUrl),
    clipState.subtitleRevision
  ].join("|");
  const previous = nativeTranscriptRenderCache.get(body);
  if (!force && previous?.key === renderKey && previous.subtitleBody === clipState.subtitleBody &&
      body.childElementCount > 0) {
    startNativeTranscriptPlaybackSync();
    return;
  }
  const transcriptItems = getReadingTranscriptItems();
  nativeTranscriptRenderCache.set(body, { key: renderKey, subtitleBody: clipState.subtitleBody });
  invalidateReaderNodeCache(document.getElementById(ids.nativeTranscriptList));
  if (transcriptItems.length === 0) {
    const retry = clipState.subtitleFetchState === "error";
    body.innerHTML = readerHtml(`
      <div class="blr-native-transcript-state${retry ? " is-error" : ""}">
        <span>${escapeHtml(getNativeTranscriptPlaceholderText())}</span>
        ${retry ? '<button type="button" data-native-transcript-retry>重试</button>' : ""}
      </div>
    `);
    nativeTranscriptState.activeIndex = -1;
    stopNativeTranscriptPlaybackSync();
    return;
  }

  const transcriptHtml = `
    <div class="blr-native-transcript-complete" role="document">
      ${transcriptItems
        .map(
          (item) => `
            <button
              type="button"
              class="blr-native-transcript-segment"
              data-native-transcript-index="${item.index}"
              data-seconds="${item.from}"
              title="${escapeHtml(formatCompactTimestamp(item.from, item.from >= 3600))}"
            >${escapeHtml(item.content)}</button>
          `
        )
        .join(" ")}
    </div>
  `;

  body.innerHTML = readerHtml(`
    <div id="${ids.nativeTranscriptList}" class="blr-native-transcript-list">
      ${transcriptHtml}
    </div>
  `);
  nativeTranscriptState.activeIndex = -1;
  startNativeTranscriptPlaybackSync();
  syncNativeTranscriptPlayback(true);
}

function ensureNativeTranscriptLoaded({ force = false } = {}) {
  if (!shouldShowNativeTranscriptPanel()) {
    return Promise.resolve();
  }

  const signature = computeCurrentClipSignature();
  if (signature !== clipState.currentClipSignature) {
    resetClipState();
  }
  initializeNativeTranscriptForSignature(signature);
  if (
    !force &&
    signature === nativeTranscriptState.loadedSignature &&
    ["ready", "empty", "error"].includes(clipState.subtitleFetchState)
  ) {
    autoFoldNativeTranscriptIfEmpty(signature);
    return Promise.resolve();
  }
  if (
    nativeTranscriptState.loadPromise &&
    nativeTranscriptState.loadSignature === signature
  ) {
    return nativeTranscriptState.loadPromise;
  }

  clipState.subtitleFetchState = "loading";
  renderNativeTranscriptPanel();
  const loadSignature = signature;
  const loadPromise = refreshClip()
    .catch((error) => {
      logWarn("[Bilibili Reader] native transcript load failed", error);
    })
    .finally(() => {
      if (isRunActive(loadRunId) && nativeTranscriptState.loadPromise === loadPromise) {
        nativeTranscriptState.loadedSignature = loadSignature;
        autoFoldNativeTranscriptIfEmpty(loadSignature);
      }
      if (nativeTranscriptState.loadPromise === loadPromise) {
        nativeTranscriptState.loadPromise = null;
        nativeTranscriptState.loadSignature = "";
      }
      if (isRunActive(loadRunId)) {
        renderNativeTranscriptPanel();
        syncNativeTranscriptPlayback(true);
      }
    });
  const loadRunId = clipState.fetchRunId;
  nativeTranscriptState.loadSignature = loadSignature;
  nativeTranscriptState.loadPromise = loadPromise;
  return loadPromise;
}

function initializeNativeTranscriptForSignature(signature = computeCurrentClipSignature()) {
  if (!signature || nativeTranscriptState.displaySignature === signature) {
    return;
  }
  nativeTranscriptState.displaySignature = signature;
  nativeTranscriptState.open = true;
  setNativeTranscriptExpanded(document.getElementById(ids.nativeTranscriptPanel), true);
}

function autoFoldNativeTranscriptIfEmpty(signature = computeCurrentClipSignature()) {
  if (
    !isNativeTranscriptEmpty() ||
    signature !== computeCurrentClipSignature()
  ) {
    return;
  }
  nativeTranscriptState.open = false;
  setNativeTranscriptExpanded(document.getElementById(ids.nativeTranscriptPanel), false);
}

function bindNativeTranscriptPanelResize() {
  const player = getNativeTranscriptPlayerNode();
  if (!player || nativeTranscriptState.observedPlayer === player) {
    return;
  }
  nativeTranscriptState.resizeObserver?.disconnect();
  nativeTranscriptState.resizeObserver = new ResizeObserver(() => {
    if (readerSessionState.transition?.phase === "animating") return;
    const scrollAnchor = captureTranscriptScrollAnchor(
      document.getElementById(ids.nativeTranscriptList), ".blr-native-transcript-segment"
    );
    const playerRect = syncNativeTranscriptPanelAlignment();
    syncNativeTranscriptPanelHeight(playerRect);
    restoreTranscriptScrollAnchor(scrollAnchor);
  });
  nativeTranscriptState.resizeObserver.observe(player);
  if (isYouTubePage()) {
    const header = document.getElementById(ids.nativeTranscriptHeader);
    if (header) nativeTranscriptState.resizeObserver.observe(header);
  }
  nativeTranscriptState.observedPlayer = player;
}

function getNativeTranscriptPlayerRect() {
  const player = getNativeTranscriptPlayerNode();
  return player?.getBoundingClientRect() || null;
}

function getNativeTranscriptPlayerNode() {
  return isYouTubePage() ? document.getElementById("movie_player") :
    document.getElementById("playerWrap") || document.getElementById("bilibili-player");
}

function syncNativeTranscriptPanelAlignment() {
  const panel = document.getElementById(ids.nativeTranscriptPanel);
  if (!panel) {
    return null;
  }
  if (!panel.classList.contains("is-collaboration-layout")) {
    panel.style.removeProperty("margin-top");
    return getNativeTranscriptPlayerRect();
  }
  const player = document.getElementById("playerWrap") || document.getElementById("bilibili-player");
  if (!player) {
    return null;
  }
  setReaderStyle(panel, "margin-top", "0px");
  const panelTop = panel.getBoundingClientRect().top;
  const playerRect = player.getBoundingClientRect();
  const playerTop = playerRect.top;
  if (!Number.isFinite(panelTop) || !Number.isFinite(playerTop)) {
    return playerRect;
  }
  setReaderStyle(panel, "margin-top", `${Math.max(0, Math.round(playerTop - panelTop))}px`);
  return playerRect;
}

function syncNativeTranscriptPanelHeight(playerRect = getNativeTranscriptPlayerRect()) {
  const panel = document.getElementById(ids.nativeTranscriptPanel);
  if (!panel || !playerRect) {
    return;
  }
  const playerHeight = playerRect.height;
  if (!(playerHeight > 120)) {
    return;
  }
  const headerHeight = isYouTubePage()
    ? (panel.querySelector(`#${ids.nativeTranscriptHeader}`)?.getBoundingClientRect().height || 44) + 8
    : 56;
  setReaderStyle(panel,
    "--blr-native-transcript-body-height",
    `${Math.max(0, Math.round(playerHeight - headerHeight))}px`
  );
}

function startNativeTranscriptPlaybackSync() {
  if (nativeTranscriptState.playbackTimer || !shouldShowNativeTranscriptPanel() ||
      !nativeTranscriptState.open || !clipState.subtitleBody.length ||
      !document.getElementById(ids.nativeTranscriptList)) {
    return;
  }
  nativeTranscriptState.playbackTimer = window.setInterval(() => {
    syncNativeTranscriptPlayback();
  }, 250);
}

function stopNativeTranscriptPlaybackSync() {
  if (!nativeTranscriptState.playbackTimer) return;
  window.clearInterval(nativeTranscriptState.playbackTimer);
  nativeTranscriptState.playbackTimer = 0;
}

function syncNativeTranscriptPlayback(forceScroll = false) {
  if (readerSessionState.transition &&
    (readerSessionState.transition.phase === "animating" || !forceScroll)) return;
  if (!shouldShowNativeTranscriptPanel() || !nativeTranscriptState.open || !clipState.subtitleBody.length) {
    stopNativeTranscriptPlaybackSync();
    return;
  }
  const list = document.getElementById(ids.nativeTranscriptList);
  if (!list) {
    stopNativeTranscriptPlaybackSync();
    return;
  }
  const video = getRuntimeVideoElement();
  if (!video) {
    return;
  }
  const nextIndex = findActiveSubtitleIndex(Number(video.currentTime || 0) || 0);
  const changed = nextIndex !== nativeTranscriptState.activeIndex;
  if (!changed && !forceScroll) return;
  const cache = getReaderNodeCache(list, ".blr-native-transcript-segment", "data-native-transcript-index");
  const next = cache?.byIndex.get(nextIndex) || null;
  if (changed) setCachedReaderActiveNode(cache, next);
  nativeTranscriptState.activeIndex = nextIndex;
  if (
    next &&
    (changed || forceScroll) &&
    Date.now() >= nativeTranscriptState.manualScrollPauseUntil
  ) {
    scrollNativeTranscriptItemIntoView(next, list, forceScroll ? "auto" : "smooth");
  }
}

function scrollNativeTranscriptItemIntoView(node, list, behavior = "smooth") {
  const listRect = list.getBoundingClientRect();
  const itemRect = node.getBoundingClientRect();
  if (!(listRect.height > 0) || !(itemRect.height > 0)) {
    return;
  }
  const padding = Math.max(32, Math.min(listRect.height * 0.22, 96));
  const target = list.scrollTop + itemRect.top - listRect.top - padding;
  if (behavior === "auto") behavior = "instant";
  nativeTranscriptState.programmaticScrollUntil = Date.now() + (behavior === "instant" ? 120 : 700);
  list.scrollTo({ top: Math.max(0, Math.round(target)), behavior });
}

function onNativeTranscriptClick(event) {
  const retry = event.target.closest("[data-native-transcript-retry]");
  if (retry) {
    nativeTranscriptState.loadedSignature = "";
    ensureNativeTranscriptLoaded({ force: true });
    return;
  }
  const target = event.target.closest("[data-native-transcript-index]");
  if (!target || window.getSelection()?.toString().trim()) {
    return;
  }
  const video = getRuntimeVideoElement();
  if (!video) {
    return;
  }
  nativeTranscriptState.manualScrollPauseUntil = 0;
  video.currentTime = Math.max(0, Number(target.dataset.seconds || 0) || 0);
  if (video.paused) {
    video.play().catch(() => {});
  }
  syncNativeTranscriptPlayback(true);
}

function onNativeTranscriptChange(event) {
  const fontSizeSelect = event.target.closest(`#${ids.nativeTranscriptFontSizeSelect}`);
  if (fontSizeSelect) {
    updateNativeTranscriptTypography({ fontSize: fontSizeSelect.value });
    return;
  }
  const fontWeightSelect = event.target.closest(`#${ids.nativeTranscriptFontWeightSelect}`);
  if (fontWeightSelect) {
    updateNativeTranscriptTypography({ fontWeight: fontWeightSelect.value });
    return;
  }
  const select = event.target.closest(`#${ids.nativeTranscriptSelect}`);
  if (!select) {
    return;
  }
  const option = select.options[select.selectedIndex];
  const url = String(option?.value || "");
  if (!url) {
    return;
  }
  select.disabled = true;
  selectSubtitle(
    url,
    String(option.dataset.lang || "unknown"),
    String(option.dataset.id || "")
  );
}
function shouldForceNormalPageState(url = location.href) {
  return !isReaderMode(url) && !readerSessionState.open;
}

function enforceNormalPageStateIfNeeded(url = location.href) {
  if (!shouldForceNormalPageState(url)) {
    return;
  }
  clearReaderPresentationAttributes();
}

function bindNormalPageStateGuard() {
  if (uiState.normalPageStateGuardBound) {
    return;
  }
  uiState.normalPageStateGuardBound = true;

  const observer = new MutationObserver(() => {
    enforceNormalPageStateIfNeeded();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [
      "data-blr-reader-mode",
      "data-blr-reader-line-height",
      "data-blr-reader-theme",
      "data-blr-reader-font-scale",
      "data-blr-reader-letter-spacing",
      "data-blr-reader-content-width",
      "data-blr-reader-has-chapters"
    ]
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-blr-reader-mode", "data-blr-reader-line-height", "data-blr-reading-active"]
  });
  enforceNormalPageStateIfNeeded();
}

function bindRuntimeEvents() {
  if (uiState.runtimeEventsBound) {
    return;
  }
  uiState.runtimeEventsBound = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") {
      return false;
    }

    if (message.type === "popup-trigger-reading-view") {
      ensureUiReady();
      const readerUrl = String(message.readerUrl || "").trim();
      if (readerUrl) {
        replaceReaderModeUrl(readerUrl);
        document.documentElement.setAttribute("data-blr-reader-mode", "1");
        document.body.setAttribute("data-blr-reader-mode", "1");
      }
      if (!readerSessionState.open) {
        enterReaderMode().catch((error) => {
          logWarn("[BOC] reading mode trigger failed", error);
        });
      }
      sendResponse({ ok: true });
      return true;
    }

    return false;
  });
}

function bindSettingsWatcher() {
  if (uiState.settingsWatcherBound || !chrome.storage?.onChanged) {
    return;
  }
  uiState.settingsWatcherBound = true;

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" && areaName !== "local") {
      return;
    }
    if (
      !changes.readerTheme &&
      !changes.readerFontScale &&
      !changes.readerFontWeight &&
      !changes.readerLetterSpacing &&
      !changes.readerLineHeight &&
      !changes.readerContentWidth &&
      !changes.readerChapterWidthPx &&
      !changes.readerTranscriptWidthPx &&
      !changes.nativeTranscriptTheme &&
      !changes.nativeTranscriptFontSize &&
      !changes.nativeTranscriptFontWeight
    ) {
      return;
    }

    getSettings()
      .then(async (settings) => {
        const transition = readerSessionState.transition;
        if (transition) {
          // Storage echoes must not reflow the live target during its motion.
          await transition.finished.catch(() => {});
          settings = await getSettings();
        }
        const scrollAnchor = captureTranscriptScrollAnchor(
          document.getElementById("blr-reading-inline-host"), ".blr-reading-complete-segment"
        );
        const activeLayout = readerSessionState.open
          ? {
              chapterWidth: readerPreferences.chapterWidthPx,
              transcriptWidth: readerPreferences.transcriptWidthPx
            }
          : null;
        readerPreferences.settings = settings;
        hydrateReaderStateFromSettings(settings);
        hydrateNativeTranscriptSettings(settings);
        // The open reader owns its live drag state. Storage notifications can
        // arrive out of order when two resize handles are used in quick
        // succession, so they must not restore an older column or video size.
        if (activeLayout) {
          readerPreferences.chapterWidthPx = activeLayout.chapterWidth;
          readerPreferences.transcriptWidthPx = activeLayout.transcriptWidth;
          readerPreferences.settings = {
            ...readerPreferences.settings,
            readerChapterWidthPx: activeLayout.chapterWidth,
            readerTranscriptWidthPx: activeLayout.transcriptWidth
          };
        }
        applyReadingViewPresentation();
        scheduleReaderLayout();
        restoreTranscriptScrollAnchor(scrollAnchor);
      })
      .catch((error) => {
        logWarn("[BOC] failed to refresh settings after storage change", error);
      });
  });
}

function buildUiHtml() {
  return `
    <section id="${ids.readingView}" aria-hidden="true" data-blr-reader-ready="0" aria-busy="true">
      <div class="blr-reading-topbar">
        <div class="blr-reading-heading-group">
          <strong id="${ids.readingPageTitle}" class="blr-reading-page-title"></strong>
          <div id="${ids.readingEpisodeTitle}" class="blr-reading-episode-title" hidden></div>
        </div>
        <nav id="${ids.readingCollectionNav}" class="blr-reading-collection-nav" aria-label="合集选集" hidden>
          <div id="${ids.readingCollectionList}" class="blr-reading-collection-list"></div>
        </nav>
      </div>
      <div class="blr-reading-layout">
        <aside class="blr-reading-rail">
          <div class="blr-reading-eyebrow">章节</div>
          <div id="${ids.readingChapterList}" class="blr-reading-list"></div>
        </aside>

        <section class="blr-reading-stage">
          <header class="blr-reading-header">
            <div class="blr-reading-header-copy">
              <strong class="blr-reading-title">${escapeHtml(clipState.title || "B站字幕阅读")}</strong>
              <div id="${ids.readingMeta}" class="blr-reading-meta">bilibili.com</div>
            </div>
            <div class="blr-reading-actions">
              <button id="${ids.readingCloseBtn}" type="button" class="blr-reading-icon-btn" title="退出" aria-label="退出阅读视图">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </header>

          <p id="${ids.readingStatus}" class="blr-reading-status">使用页面原生播放器联动章节和字幕。</p>

          <section class="blr-reading-main">
            <div id="${ids.readingTranscriptList}" class="blr-reading-transcript"></div>
          </section>
        </section>
      </div>
      <div id="${ids.readingTranscriptResizeHandle}" class="blr-reading-resize-handle blr-reading-resize-handle-right" role="separator" aria-label="调整视频、章节和字幕宽度" aria-orientation="vertical" aria-valuemin="280" aria-valuemax="720"></div>
    </section>
  `;
}

function bindUiEvents() {
  const readingView = byId(ids.readingView);
  const readingCloseBtn = byId(ids.readingCloseBtn);
  const readingCollectionList = byId(ids.readingCollectionList);
  const chapterList = byId(ids.readingChapterList);
  const transcriptList = byId(ids.readingTranscriptList);

  readingCloseBtn.addEventListener("click", () => {
    exitReaderMode().catch((error) => {
      logWarn("[Bilibili Reader] reader exit failed", error);
    });
  });
  bindReaderResizeHandle(byId(ids.readingTranscriptResizeHandle));

  const handleReaderManualScroll = () => {
    if (Date.now() <= readerSessionState.programmaticScrollUntil) {
      return;
    }
    noteManualReaderInteraction();
  };
  transcriptList.addEventListener("scroll", handleReaderManualScroll);
  transcriptList.addEventListener("wheel", handleReaderManualScroll, { passive: true });
  chapterList.addEventListener("wheel", handleReaderManualScroll, { passive: true });
  chapterList.addEventListener("pointerdown", () => noteManualReaderInteraction(3500));
  transcriptList.addEventListener("pointerdown", () => noteManualReaderInteraction(3500));
  chapterList.addEventListener("click", onReadingChapterClick);
  readingCollectionList.addEventListener("click", onReadingCollectionClick);
  transcriptList.addEventListener("click", onReadingTranscriptClick);
  readingView.addEventListener("transitionend", () => {
    if (!readerSessionState.open) {
      stopReadingViewSync();
    }
  });
}

function startUrlWatcher() {
  if (uiState.urlWatcherStarted) {
    return;
  }
  uiState.urlWatcherStarted = true;

  const checkCurrentClip = () => {
    let nextUrl = location.href;
    const nextSignature = computeCurrentClipSignature();
    if (nextSignature === clipState.currentClipSignature) {
      return;
    }

    // YouTube also navigates to home/search without replacing the document.
    if (isYouTubePage(nextUrl) && !extractYouTubeVideoId(nextUrl) && readerSessionState.open) {
      readerSessionState.transition?.cancel();
      replaceReaderModeUrl(stripReaderModeUrl(nextUrl));
      closeReadingView();
      nextUrl = location.href;
    }

    // Native episode navigation can drop the reader query. Keep an open
    // reader session active across clip changes before starting its new run.
    if (readerSessionState.open && !isReaderMode(nextUrl)) {
      const readerUrl = new URL(nextUrl);
      readerUrl.searchParams.set("bilibli_reader", "1");
      replaceReaderModeUrl(readerUrl.toString());
      nextUrl = location.href;
    }

    clipState.currentClipSignature = nextSignature;
    refreshReaderPageScopes();
    enforceNormalPageStateIfNeeded(nextUrl);
    ensureUiReady();
    resetClipState({ preserveReadingContent: readerSessionState.open && isReaderMode(nextUrl) });
    scheduleNativeTranscriptPanelSync(0);
    const shouldEnterReaderMode = isReaderMode(nextUrl);
    if (!readerSessionState.open && shouldEnterReaderMode) {
      document.documentElement.setAttribute("data-blr-reader-mode", "1");
      document.body.setAttribute("data-blr-reader-mode", "1");
      renderReadingStatus("检测到阅读视图跳转，正在打开阅读模式...");
      enterReaderMode().catch((error) => {
        renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
      });
      return;
    }
    if (readerSessionState.open || shouldEnterReaderMode) {
      renderReadingStatus("检测到视频变化，正在自动刷新字幕...");
      const changeRunId = clipState.fetchRunId;
      const sessionId = readerSessionState.id;
      waitForVideoMetadata().then(() => {
        if (!isReaderSessionActive(sessionId) || changeRunId !== clipState.fetchRunId || computeCurrentClipSignature() !== nextSignature) {
          return;
        }
        refreshClip().catch((error) => {
          if (!isStaleRunError(error)) {
            renderReadingStatus(`自动刷新失败：${getErrorMessage(error)}`);
          }
        });
      });
      return;
    }

    ensureNativeTranscriptLoaded({ force: true });
  };
  window.addEventListener("popstate", checkCurrentClip);
  window.addEventListener("yt-navigate-finish", () => {
    checkCurrentClip();
    scheduleNativeTranscriptPanelSync(0);
    if (readerSessionState.open) {
      queueEnsureReaderPlayerMounted();
      applyReaderPageFocus();
    }
  });
  window.setInterval(checkCurrentClip, 250);
}

function resetClipState({ preserveReadingContent = false } = {}) {
  // 切换时立即使旧请求失效，不能等新请求开始后才递增编号。
  clipState.fetchRunId += 1;
  if (readerSessionState.open) invalidateReaderSession();
  clipState.fetchClipSignature = "";
  clipState.bvid = "";
  clipState.aid = "";
  clipState.cid = "";
  clipState.cidSource = "";
  clipState.videoDuration = 0;
  if (!preserveReadingContent) {
    clipState.pageIndex = 1;
    clipState.pageCount = 0;
    clipState.pageTitle = "";
    clipState.collection = null;
    clipState.title = "";
    clipState.author = "";
    clipState.uploadDate = "";
  }
  // 保留阅读视图布局和合集信息时，也必须清空上一集的字幕与章节。
  clearSubtitleContent({ clearTracks: true, clearChapters: true, fetchState: "loading" });
  clipState.currentClipSignature = computeCurrentClipSignature();
  stopReadingViewSync();
  nativeTranscriptState.loadedSignature = "";
  nativeTranscriptState.loadPromise = null;
  nativeTranscriptState.loadSignature = "";
  nativeTranscriptState.open = true;
  nativeTranscriptState.manualScrollPauseUntil = 0;
  readerPlayerState.videoEl = null;
  stopReaderPlayerObserver();

  renderNativeTranscriptPanel();
  if (readerSessionState.open) {
    renderReadingView();
    renderReadingStatus("正在切换选集并加载新字幕...");
  }
}

function clearSubtitleContent({
  clearTracks = false,
  clearChapters = false,
  fetchState = clipState.subtitleFetchState
} = {}) {
  if (clearTracks) clipState.subtitles = [];
  if (clearChapters) clipState.chapters = [];
  clipState.selectedSubtitleId = "";
  clipState.selectedSubtitleUrl = "";
  clipState.selectedSubtitleLang = "";
  clipState.subtitleBody = [];
  clipState.subtitleRevision += 1;
  clipState.subtitleFetchState = fetchState;
  readerSessionState.activeSubtitleIndex = -1;
  readerSessionState.activeChapterIndex = -1;
  nativeTranscriptState.activeIndex = -1;
}

async function finishNoSubtitleLoad(request) {
  ensureSubtitleRequestActive(request);
  clearSubtitleContent({ clearTracks: true, fetchState: "empty" });

  await refreshOpenReadingView("当前视频无可用字幕。", request.runId, request);
  ensureSubtitleRequestActive(request);
}

let clipRefreshTask = null;

function refreshClip() {
  const signature = computeCurrentClipSignature();
  if (clipRefreshTask?.signature === signature &&
      clipRefreshTask.runId === clipState.fetchRunId &&
      clipRefreshTask.requestId === subtitleRequestId) {
    return clipRefreshTask.promise;
  }
  const promise = refreshClipData();
  const task = { signature, runId: clipState.fetchRunId, requestId: subtitleRequestId, promise };
  clipRefreshTask = task;
  const release = () => {
    if (clipRefreshTask === task) clipRefreshTask = null;
  };
  promise.then(release, release);
  return promise;
}

async function refreshClipData() {
  const clipUrl = location.href;
  const clipSignature = computeCurrentClipSignature(clipUrl);
  if (clipState.currentClipSignature !== clipSignature) {
    resetClipState({ preserveReadingContent: readerSessionState.open && isReaderMode(clipUrl) });
  }
  const runId = ++clipState.fetchRunId;
  clipState.fetchClipSignature = clipSignature;
  const request = beginSubtitleRequest(runId);
  try {
    clipState.subtitleFetchState = "loading";
    renderNativeTranscriptPanel();
    if (readerSessionState.open) {
      renderReadingView();
    }
    const settings = await getSettings();
    ensureSubtitleRequestActive(request);
    readerPreferences.settings = settings;

    if (isYouTubePage(clipUrl)) {
      await refreshYouTubeClipData(extractYouTubeVideoId(clipUrl), request);
      ensureSubtitleRequestActive(request);
      await refreshOpenReadingView("抓取完成，阅读视图已同步最新字幕。", runId, request);
      return;
    }

    const bvid = extractBvid(clipUrl);
    clipState.bvid = bvid;
    if (!clipState.bvid) {
      throw new Error("当前页面不是标准 BV 视频地址，无法抓取字幕。");
    }

    const pageIndex = extractPageIndex(clipUrl);
    const oid = extractOid(clipUrl);
    const hasPageParam = hasExplicitPageParam(clipUrl);
    const meta = await retryAsync(() => {
      ensureSubtitleRequestActive(request);
      return fetchVideoMeta(bvid);
    }, 2, 250);
    ensureSubtitleRequestActive(request);

    // 调试：打印 API 返回的原始数据
    logInfo("[BOC] raw meta data", {
      meta,
      defaultCid: meta.defaultCid,
      pagesCount: (meta.pages || []).length
    });

    clipState.aid = meta.aid || "";
    clipState.title = meta.title || readVideoTitle();
    clipState.author = meta.author || readVideoAuthor();
    clipState.uploadDate = meta.uploadDate || readUploadDate();
    clipState.pageCount = Array.isArray(meta.pages) ? meta.pages.length : 0;
    let resolvedPageIndex = pageIndex;
    if ((meta.pages || []).length > 1 && !hasPageParam) {
      const pageIndexFromOid = pickPageIndexFromOid(meta.pages, oid);
      if (pageIndexFromOid > 0) {
        resolvedPageIndex = pageIndexFromOid;
        logInfo("[BOC] resolved page index from oid", {
          oid,
          resolvedPageIndex
        });
      } else {
        // B 站多分P中，P1 常见为无 ?p= 参数；watchlater 等页面可能改用 oid 标识当前分P。
        resolvedPageIndex = 1;
        logInfo("[BOC] multi-page video without p param or valid oid, fallback to P1", {
          oid
        });
      }
    }

    const currentPage = pickPageFromPages(meta.pages, resolvedPageIndex);
    clipState.pageIndex = resolvedPageIndex;
    clipState.pageTitle = currentPage?.part || "";
    clipState.collection = resolveVideoCollectionCurrent(meta.collection, {
      bvid: clipState.bvid,
      aid: clipState.aid,
      pageIndex: resolvedPageIndex
    });
    clipState.cid = currentPage?.cid || pickCidFromPages(meta.pages, resolvedPageIndex, meta.defaultCid);
    clipState.cidSource = "meta-pages";
    clipState.videoDuration = pickDurationFromPages(meta.pages, resolvedPageIndex, meta.defaultDuration);
    if (!(clipState.videoDuration > 0)) {
      clipState.videoDuration = readRuntimeVideoDuration();
    }
    if (!(clipState.videoDuration > 0)) {
      throw new Error("无法获取当前视频时长，已停止抓取以避免串到错误字幕。");
    }

    logInfo("[BOC] resolved video ids", {
      url: location.href,
      aid: clipState.aid,
      bvid: clipState.bvid,
      cid: clipState.cid,
      cidSource: clipState.cidSource,
      pageIndex: resolvedPageIndex,
      videoDuration: clipState.videoDuration
    });

    const cid = clipState.cid;
    const aid = clipState.aid;
    const fetchCurrentSubtitleBundle = () => {
      ensureSubtitleRequestActive(request);
      return fetchSubtitleBundle(bvid, cid, aid, meta.subtitleTracks || []);
    };
    let subtitleBundle = await retryAsync(
      fetchCurrentSubtitleBundle,
      3,
      500
    );
    ensureSubtitleRequestActive(request);
    clipState.subtitles = normalizeSubtitleTracks(subtitleBundle.tracks);
    clipState.chapters = normalizeChapters(subtitleBundle.chapters);
    logInfo(
      "[BOC] chapters",
      clipState.chapters.map((item) => ({
        from: item.from,
        to: item.to,
        title: item.title
      }))
    );
    logInfo(
      "[BOC] subtitle tracks",
      clipState.subtitles.map((item) => ({
        id: item.id,
        lan: item.lan,
        lanDoc: item.lanDoc,
        url: item.subtitleUrl
      }))
    );

    // 无字幕时也允许进入阅读视图，只是字幕区域保持空态。
    if (clipState.subtitles.length === 0) {
      await finishNoSubtitleLoad(request);
      return;
    }

    // 显式点击“刷新抓取”时默认走网络，避免命中历史缓存导致字幕错位。
    const forceRefresh = true;

    const preferred = pickPreferredSubtitle(clipState.subtitles, {
      previousId: clipState.selectedSubtitleId,
      previousUrl: clipState.selectedSubtitleUrl,
      previousLang: clipState.selectedSubtitleLang
    });

    if (!preferred) {
      await finishNoSubtitleLoad(request);
      return;
    }

    const candidates = buildSubtitleCandidates(clipState.subtitles, preferred);
    let selected = null;

    try {
      selected = await tryLoadSubtitleCandidates(candidates, runId, forceRefresh, request);
    } catch (error) {
      ensureSubtitleRequestActive(request);

      // 正文失败时先重新核对列表，空列表应收起面板，不能沿用旧错误。
      // 非空列表再用新的签名地址重试，网络故障仍保留为加载错误。
      subtitleBundle = await retryAsync(
        fetchCurrentSubtitleBundle,
        2,
        500
      );
      ensureSubtitleRequestActive(request);
      clipState.subtitles = normalizeSubtitleTracks(subtitleBundle.tracks);
      clipState.chapters = normalizeChapters(subtitleBundle.chapters);
      const retryPreferred = pickPreferredSubtitle(clipState.subtitles, {
        previousId: preferred.id,
        previousUrl: preferred.subtitleUrl,
        previousLang: preferred.lanDoc || preferred.lan || ""
      });
      if (!retryPreferred) {
        await finishNoSubtitleLoad(request);
        return;
      }
      const retryCandidates = buildSubtitleCandidates(clipState.subtitles, retryPreferred);
      selected = await tryLoadSubtitleCandidates(retryCandidates, runId, forceRefresh, request);
    }
    ensureSubtitleRequestActive(request);
    if (selected) {
      logInfo("[BOC] selected subtitle track", {
        id: selected.id,
        lan: selected.lan,
        lanDoc: selected.lanDoc
      });
    }
    clipState.subtitleFetchState = "ready";

    await refreshOpenReadingView("抓取完成，阅读视图已同步最新字幕。", runId, request);
    ensureSubtitleRequestActive(request);
  } catch (error) {
    if (isStaleRunError(error) || !isSubtitleRequestActive(request)) {
      return;
    }
    if (isUnavailableSubtitleError(error)) {
      await finishNoSubtitleLoad(request);
      return;
    }
    // 字幕正文与章节列表来自不同请求。字幕域名被拦截、网络失败或签名
    // 过期时，保留已经成功取得的章节和当前视频元数据。
    clearSubtitleContent({ fetchState: "error" });
    await refreshOpenReadingView("字幕加载失败，请刷新重试。", runId, request);
    if (!isSubtitleRequestActive(request)) {
      return;
    }
  } finally {
    if (isSubtitleRequestActive(request)) {
      renderNativeTranscriptPanel();
    }
  }
}

let subtitleRequestId = 0;

function beginSubtitleRequest(runId = clipState.fetchRunId) {
  ensureRunActive(runId);
  return { runId, id: ++subtitleRequestId };
}

function isSubtitleRequestActive(request) {
  return Boolean(request) && request.id === subtitleRequestId && isRunActive(request.runId);
}

function ensureSubtitleRequestActive(request) {
  if (!isSubtitleRequestActive(request)) {
    const error = new Error("Stale subtitle request");
    error.code = "STALE_RUN";
    throw error;
  }
}

function commitSubtitle({ url, lang, subtitleId, body }, request) {
  ensureSubtitleRequestActive(request);
  clipState.selectedSubtitleId = subtitleId ? String(subtitleId) : "";
  clipState.selectedSubtitleUrl = url;
  clipState.selectedSubtitleLang = lang;
  clipState.subtitleBody = body;
  clipState.subtitleRevision += 1;
  clipState.subtitleFetchState = "ready";
  if (readerSessionState.open) {
    renderReadingView();
    syncReadingViewPlayback(true);
  }
  renderNativeTranscriptPanel();
}

async function selectSubtitle(url, lang, subtitleId = "") {
  if (!isRunActive(clipState.fetchRunId)) return;
  const request = beginSubtitleRequest();
  const previousFetchState = clipState.subtitleFetchState;
  clipState.subtitleFetchState = "loading";
  syncReadingTranscriptHeaderControls();
  const nativePanel = document.getElementById(ids.nativeTranscriptPanel);
  if (nativePanel) renderNativeTranscriptHeaderControls(nativePanel);
  try {
    await loadSubtitle(url, lang, request.runId, subtitleId, false, request);
    ensureSubtitleRequestActive(request);
  } catch (error) {
    if (isStaleRunError(error) || !isSubtitleRequestActive(request)) return;
    // A failed language switch keeps the last successful transcript usable.
    clipState.subtitleFetchState = clipState.subtitleBody.length ? "ready" :
      previousFetchState === "empty" ? "empty" : "error";
    logWarn("[Bilibili Reader] subtitle switch failed", error);
    if (readerSessionState.open) renderReadingStatus(`切换字幕失败：${getErrorMessage(error)}`);
  } finally {
    if (isSubtitleRequestActive(request)) {
      syncReadingTranscriptHeaderControls();
      renderNativeTranscriptPanel();
    }
  }
}

async function loadSubtitle(
  url, lang, runId = clipState.fetchRunId, subtitleId = "", forceRefresh = false,
  request = beginSubtitleRequest(runId)
) {
  ensureSubtitleRequestActive(request);
  if (!url) throw new Error("字幕 URL 为空。");
  const cacheKey = getSubtitleCacheKey({
    bvid: clipState.bvid, cid: clipState.cid, subtitleId, subtitleUrl: url, lang
  });

  if (!forceRefresh) {
    const cachedBody = await loadSubtitleFromCache(cacheKey);
    ensureSubtitleRequestActive(request);
    if (Array.isArray(cachedBody) && cachedBody.length > 0) {
      const cachedCheck = validateSubtitleByDuration(cachedBody, clipState.videoDuration);
      if (cachedCheck.ok) {
        logInfo("[Bilibili Reader] using cached subtitle", { cacheKey, itemCount: cachedBody.length });
        commitSubtitle({ url, lang, subtitleId, body: cachedBody }, request);
        return;
      }
      logWarn("[Bilibili Reader] cached subtitle duration mismatch", { cacheKey, reason: cachedCheck.reason });
      await clearSubtitleCacheByKey(cacheKey);
      ensureSubtitleRequestActive(request);
    }
  }

  const subtitle = await fetchSubtitleBody(url);
  ensureSubtitleRequestActive(request);
  const body = Array.isArray(subtitle?.body)
    ? subtitle.body.filter((item) => String(item?.content || "").trim()) : [];
  if (body.length === 0) {
    const error = new Error("字幕文件为空。");
    error.code = "SUBTITLE_EMPTY";
    throw error;
  }
  const durationCheck = validateSubtitleByDuration(body, clipState.videoDuration);
  if (!durationCheck.ok) {
    const error = new Error("字幕时长与当前视频不匹配。");
    error.code = "SUBTITLE_DURATION_MISMATCH";
    error.details = durationCheck;
    throw error;
  }
  await saveSubtitleToCache(cacheKey, body);
  ensureSubtitleRequestActive(request);
  commitSubtitle({ url, lang, subtitleId, body }, request);
}

function getSubtitleCacheKey({ bvid, cid, subtitleId = "", subtitleUrl = "", lang = "" }) {
  const sourceKey = buildSubtitleSourceKey(subtitleId, subtitleUrl, lang);
  return `${CACHE_KEY_PREFIX}${bvid}_${cid}_${sourceKey}`;
}

function buildSubtitleSourceKey(subtitleId, subtitleUrl, lang) {
  const id = String(subtitleId || "").trim();
  if (id) {
    return `id_${id}`;
  }

  const normalizedUrl = normalizeSubtitleUrlForCache(subtitleUrl);
  if (normalizedUrl) {
    return `url_${normalizedUrl}`;
  }

  return `lang_${String(lang || "").trim().toLowerCase() || "unknown"}`;
}

function normalizeSubtitleUrlForCache(url) {
  const text = String(url || "").trim();
  if (!text) {
    return "";
  }

  try {
    const parsed = new URL(text);
    if (parsed.pathname === "/api/timedtext" && isYouTubePage(parsed.origin)) {
      // YouTube languages share a path; keep their stable identity while
      // excluding expiring signatures and proof-of-origin tokens.
      return `${parsed.hostname}${parsed.pathname}?${new URLSearchParams(
        ["v", "lang", "kind", "name", "tlang"].map((key) => [key, parsed.searchParams.get(key) || ""])
      )}`;
    }
    const path = parsed.pathname.replace(/[^\w/.-]+/g, "_");
    return `${parsed.hostname}${path}`;
  } catch {
    return text.replace(/[^\w/.-]+/g, "_");
  }
}

async function loadSubtitleFromCache(cacheKey) {
  try {
    const result = await chrome.storage.local.get(cacheKey);
    return result[cacheKey]?.body || null;
  } catch {
    return null;
  }
}

async function saveSubtitleToCache(cacheKey, body) {
  try {
    await chrome.storage.local.set({
      [cacheKey]: {
        body,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logWarn("[BOC] failed to save subtitle cache", error);
  }
}

async function clearSubtitleCacheByKey(cacheKey) {
  try {
    await chrome.storage.local.remove(cacheKey);
  } catch (error) {
    logWarn("[BOC] failed to clear subtitle cache by key", { cacheKey, error });
  }
}

function buildReadingTranscriptHeadingHtml() {
  return `
    <span class="blr-reading-transcript-heading-title">字幕</span>
    <div class="blr-reading-transcript-heading-controls">
      <button id="${ids.readingTranscriptReaderButton}" class="blr-reading-transcript-tool-button is-active" type="button" title="返回普通模式" aria-label="切换到普通模式" aria-pressed="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5.5C9 3.5 5.5 3.5 2.5 4.5v15c3-1 6.5-1 9.5 1 3-2 6.5-2 9.5-1v-15c-3-1-6.5-1-9.5 1Z"/><path d="M12 5.5v15M5.5 8h3M5.5 11.5h3M15.5 8h3M15.5 11.5h3"/></svg>
      </button>
      <button id="${ids.readingTranscriptReturnButton}" class="blr-reading-transcript-tool-button" type="button" title="回到当前字幕" aria-label="回到当前字幕">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
      </button>
      <button id="${ids.readingTranscriptThemeButton}" class="blr-reading-transcript-tool-button" type="button" title="切换字幕主题" aria-label="切换字幕主题">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      </button>
      <select id="${ids.readingTranscriptQuickSubtitleSelect}" aria-label="字幕语言" title="字幕语言" disabled><option value="">字幕</option></select>
      <select id="${ids.readingTranscriptQuickFontSizeSelect}" aria-label="字幕字号" title="字幕字号">
        <option value="xs">12</option><option value="s">13</option><option value="m">14</option><option value="l">16</option><option value="xl">19</option>
      </select>
      <select id="${ids.readingTranscriptQuickFontWeightSelect}" aria-label="字幕字重" title="字幕字重">
        <option value="light">300</option><option value="regular">400</option><option value="normal">500</option><option value="semibold">600</option><option value="bold">700</option>
      </select>
    </div>
  `;
}

function syncReadingTranscriptHeaderControls() {
  const heading = document.getElementById("blr-reading-transcript-heading");
  if (!heading) {
    return;
  }
  const themeButton = heading.querySelector(`#${ids.readingTranscriptThemeButton}`);
  if (themeButton) {
    const labels = { light: "浅色", dark: "深色", paper: "纸张" };
    const label = `切换字幕主题，当前：${labels[readerPreferences.theme] || "浅色"}`;
    themeButton.title = label;
    themeButton.setAttribute("aria-label", label);
  }
  const fontSizeSelect = heading.querySelector(`#${ids.readingTranscriptQuickFontSizeSelect}`);
  const fontWeightSelect = heading.querySelector(`#${ids.readingTranscriptQuickFontWeightSelect}`);
  if (fontSizeSelect) {
    fontSizeSelect.value = readerPreferences.fontScale;
  }
  if (fontWeightSelect) {
    fontWeightSelect.value = readerPreferences.fontWeight;
  }
  const languageSelect = heading.querySelector(`#${ids.readingTranscriptQuickSubtitleSelect}`);
  syncSubtitleLanguageSelect(languageSelect);
}

function returnReadingTranscriptToCurrent() {
  readerSessionState.manualScrollPauseUntil = 0;
  const video = getRuntimeVideoElement();
  const transcriptList = document.getElementById(ids.readingTranscriptList);
  if (!video || !transcriptList) {
    return;
  }
  const subtitleIndex = findActiveSubtitleIndex(Number(video.currentTime || 0) || 0);
  const target = transcriptList.querySelector(`[data-index="${subtitleIndex}"]`);
  if (target) {
    readerSessionState.nextScrollBehavior = "smooth";
    scrollReadingTranscriptItemIntoView(target);
  }
  syncReadingViewPlayback(false);
  updateReaderFollowState();
}

function bindReadingTranscriptHeaderControls(heading) {
  if (!heading || heading.dataset.blrControlsBound === "1") {
    return;
  }
  heading.querySelector(`#${ids.readingTranscriptReaderButton}`)?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    if (readerSessionState.closing) return;
    button.disabled = true;
    exitReaderMode().catch((error) => {
      logWarn("[Bilibili Reader] transcript mode switch failed", error);
    }).finally(() => {
      if (button.isConnected) button.disabled = false;
    });
  });
  heading.querySelector(`#${ids.readingTranscriptReturnButton}`)?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    returnReadingTranscriptToCurrent();
    button.classList.add("is-active");
    window.setTimeout(() => button.classList.remove("is-active"), 300);
  });
  heading.querySelector(`#${ids.readingTranscriptThemeButton}`)?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const themes = ["light", "dark", "paper"];
    const nextIndex = (themes.indexOf(readerPreferences.theme) + 1) % themes.length;
    updateReaderPreferences({ readerTheme: themes[nextIndex] }, { persist: true });
    button.classList.add("is-active");
    window.setTimeout(() => button.classList.remove("is-active"), 300);
  });
  heading
    .querySelector(`#${ids.readingTranscriptQuickFontSizeSelect}`)
    ?.addEventListener("change", (event) => {
      updateReaderPreferences({ readerFontScale: event.target.value }, { persist: true });
    });
  heading
    .querySelector(`#${ids.readingTranscriptQuickFontWeightSelect}`)
    ?.addEventListener("change", (event) => {
      updateReaderPreferences({ readerFontWeight: event.target.value }, { persist: true });
    });
  heading
    .querySelector(`#${ids.readingTranscriptQuickSubtitleSelect}`)
    ?.addEventListener("change", (event) => {
      const select = event.target;
      const option = select.options[select.selectedIndex];
      const url = String(option?.value || "");
      if (!url) {
        return;
      }
      selectSubtitle(
        url,
        String(option.dataset.lang || "unknown"),
        String(option.dataset.id || "")
      );
    });
  heading.dataset.blrControlsBound = "1";
}
const readingSectionSnapshots = new WeakMap();

function hasReadingSectionChanged(container, snapshot) {
  const previous = readingSectionSnapshots.get(container);
  if (previous && container.childElementCount > 0 &&
      Object.keys(snapshot).every((key) => snapshot[key] === previous[key])) return false;
  readingSectionSnapshots.set(container, snapshot);
  return true;
}

function renderReadingView() {
  if (readerSessionState.transition?.phase === "animating") {
    readerSessionState.transition.pendingReadingRender = true;
    return;
  }
  const titleNode = document.querySelector(".blr-reading-title");
  const pageTitleNode = byId(ids.readingPageTitle);
  const metaNode = byId(ids.readingMeta);
  const chapterList = byId(ids.readingChapterList);
  const transcriptList = byId(ids.readingTranscriptList);
  const chapters = getCachedReadingChapters();
  const body = Array.isArray(clipState.subtitleBody) ? clipState.subtitleBody : [];
  const clip = computeCurrentClipSignature();
  const transcriptItems = getReadingTranscriptItems(body);
  const withHours = Number(clipState.videoDuration) >= 3600 ||
    getCachedSubtitleData(body).hasHourTimestamp ||
    chapters.some((item) => Math.max(Number(item.from) || 0, Number(item.to) || 0) >= 3600);
  updateReaderChapterPresence(chapters.length > 0);

  const title = clipState.title || (isYouTubePage() ? "YouTube 字幕阅读" : "B站字幕阅读");
  if (titleNode && titleNode.textContent !== title) titleNode.textContent = title;
  if (pageTitleNode) {
    if (pageTitleNode.textContent !== title) pageTitleNode.textContent = title;
    if (pageTitleNode.title !== title) pageTitleNode.title = title;
  }
  const meta = buildReadingMetaLine();
  if (metaNode && metaNode.textContent !== meta) metaNode.textContent = meta;
  renderReadingCollection();

  const chaptersChanged = hasReadingSectionChanged(chapterList, {
    chapters: clipState.chapters, withHours, clip
  });
  if (chaptersChanged) {
    invalidateReaderNodeCache(chapterList);
    chapterList.innerHTML = readerHtml(chapters.length === 0
      ? '<div class="blr-reading-empty">当前视频没有章节。</div>'
      : chapters.map((item, index) => `
          <button type="button" class="blr-reading-chapter" data-index="${index}"
            data-seconds="${Number(item.from || 0) || 0}">
            <span class="blr-reading-chapter-time">${escapeHtml(formatCompactTimestamp(item.from, withHours))}</span>
            <span class="blr-reading-chapter-title">${escapeHtml(item.title)}</span>
          </button>
        `).join(""));
    readerSessionState.activeChapterIndex = -1;
  }

  const placeholder = transcriptItems.length === 0 ? getReadingTranscriptPlaceholderText() : "";
  const transcriptChanged = hasReadingSectionChanged(transcriptList, {
    body, revision: clipState.subtitleRevision, withHours, placeholder,
    clip, fetchedClip: clipState.fetchClipSignature
  });
  if (transcriptChanged) {
    invalidateReaderNodeCache(transcriptList);
    if (transcriptItems.length === 0) {
      transcriptList.innerHTML = readerHtml(`<div class="blr-reading-empty">${escapeHtml(placeholder)}</div>`);
    } else {
      transcriptList.innerHTML = readerHtml(`
        <div class="blr-reading-complete" role="document">
          ${transcriptItems.map((item) => `
              <button type="button" class="blr-reading-complete-segment"
                data-index="${item.index}" data-seconds="${item.from}"
                aria-label="${escapeHtml(formatCompactTimestamp(item.from, withHours))} ${escapeHtml(item.content)}"
              >${escapeHtml(item.content)}</button>
            `).join(" ")}
        </div>
        <div id="${ids.readingTranscriptTailSpacer}" class="blr-reading-tail-spacer" aria-hidden="true"></div>
      `);
    }
    readerSessionState.activeSubtitleIndex = -1;
    // Only newly created text needs an immediate initial position.
    readerSessionState.nextScrollBehavior = "auto";
  }

  if (!chaptersChanged && !transcriptChanged) {
    syncReadingTranscriptHeaderControls();
    return;
  }
  applyReadingViewPresentation();
  updateReadingTranscriptTailSpacer();
}

function renderReadingCollection() {
  const episodeTitle = byId(ids.readingEpisodeTitle);
  const collectionNav = byId(ids.readingCollectionNav);
  const collectionList = byId(ids.readingCollectionList);
  const collection = clipState.collection;
  const snapshot = { collectionList, collection, currentIndex: collection?.currentIndex,
    title: clipState.title, pageTitle: clipState.pageTitle };
  const previous = uiState.collectionSnapshot;
  if (previous && Object.keys(snapshot).every((key) => snapshot[key] === previous[key])) return;
  uiState.collectionSnapshot = snapshot;
  const episodes = Array.isArray(collection?.episodes) ? collection.episodes : [];
  const hasCollection = episodes.length > 1;

  if (!hasCollection) {
    episodeTitle.hidden = true;
    episodeTitle.textContent = "";
    episodeTitle.removeAttribute("title");
    collectionNav.hidden = true;
    collectionList.replaceChildren();
    return;
  }

  const currentIndex = Number(collection.currentIndex);
  const currentEpisode = currentIndex >= 0 ? episodes[currentIndex] : null;
  episodeTitle.textContent = currentEpisode?.title || clipState.pageTitle || clipState.title || "";
  episodeTitle.hidden = !episodeTitle.textContent;
  episodeTitle.title = episodeTitle.textContent;
  collectionList.innerHTML = readerHtml(episodes
    .map((episode, index) => {
      const isCurrent = index === currentIndex;
      const label = episode.title || `第 ${index + 1} 集`;
      return `
        <button
          type="button"
          class="blr-reading-collection-item${isCurrent ? " is-active" : ""}"
          data-index="${index}"
          data-bvid="${escapeHtml(episode.bvid)}"
          data-page="${Number(episode.page || 0) || ""}"
          title="${escapeHtml(label)}"
          aria-label="第 ${Number(episode.page || 0) || index + 1} 集：${escapeHtml(label)}"
          ${isCurrent ? 'aria-current="true"' : ""}
        >
          <span class="blr-reading-collection-index">${Number(episode.page || 0) || index + 1}</span>
          <span class="blr-reading-collection-item-title">${escapeHtml(label)}</span>
        </button>
      `;
    })
    .join(""));

  collectionNav.hidden = false;
  const sessionId = readerSessionState.id;
  window.requestAnimationFrame(() => {
    if (!isReaderSessionActive(sessionId) || uiState.collectionSnapshot !== snapshot) return;
    collectionList.querySelector(".is-active")?.scrollIntoView({
      behavior: "auto",
      block: "center",
      inline: "nearest"
    });
  });
}

function getReadingTranscriptPlaceholderText() {
  if (
    clipState.fetchClipSignature !== computeCurrentClipSignature() ||
    clipState.subtitleFetchState === "loading"
  ) {
    return "正在加载字幕...";
  }
  if (clipState.subtitleFetchState === "error") {
    return "字幕加载失败，请刷新重试。";
  }
  return "当前视频无字幕。";
}

function getReadingTranscriptItems(body = clipState.subtitleBody) {
  if (clipState.fetchClipSignature !== computeCurrentClipSignature()) {
    return [];
  }
  return getCachedReadingTranscriptItems(body);
}

function updateReadingTranscriptTailSpacer() {
  const spacer = document.getElementById(ids.readingTranscriptTailSpacer);
  if (!spacer) {
    return;
  }
  const inlineHost = document.getElementById("blr-reading-inline-host");
  const transcriptList = document.getElementById(ids.readingTranscriptList);
  const hostHeight = inlineHost?.clientHeight || transcriptList?.clientHeight || 0;
  const spacerHeight = Math.max(hostHeight, Math.round(window.innerHeight * 0.92), 320);
  setReaderStyle(spacer, "height", `${spacerHeight}px`);
}

function hydrateReaderStateFromSettings(settings = readerPreferences.settings) {
  readerPreferences.theme = normalizeReaderTheme(settings?.readerTheme);
  readerPreferences.fontScale = normalizeReaderFontScale(settings?.readerFontScale);
  readerPreferences.fontWeight = normalizeReaderFontWeight(settings?.readerFontWeight);
  readerPreferences.letterSpacing = normalizeReaderLetterSpacing(settings?.readerLetterSpacing ?? settings?.readerLineHeight);
  readerPreferences.lineHeight = normalizeReaderLineHeight(settings?.readerLineHeight);
  readerPreferences.contentWidth = normalizeReaderContentWidth(settings?.readerContentWidth);
  readerPreferences.chapterWidthPx = normalizeReaderColumnWidth(settings?.readerChapterWidthPx, 220, 140, 360);
  readerPreferences.transcriptWidthPx = normalizeReaderColumnWidth(settings?.readerTranscriptWidthPx, 440, 280, 720);
}

function setReaderDatasetValue(node, key, value) {
  if (node.dataset[key] !== value) node.dataset[key] = value;
}

function applyReaderRootPresentation(node) {
  if (!node) return;
  const values = {
    Theme: readerPreferences.theme,
    FontScale: readerPreferences.fontScale,
    FontWeight: readerPreferences.fontWeight,
    LetterSpacing: readerPreferences.letterSpacing,
    LineHeight: readerPreferences.lineHeight,
    ContentWidth: readerPreferences.contentWidth
  };
  Object.entries(values).forEach(([name, value]) => setReaderDatasetValue(node, `blrReader${name}`, value));
}

function applyReadingViewPresentation() {
  const readingView = byId(ids.readingView);
  setReaderDatasetValue(readingView, "theme", readerPreferences.theme);
  setReaderDatasetValue(readingView, "fontScale", readerPreferences.fontScale);
  setReaderDatasetValue(readingView, "fontWeight", readerPreferences.fontWeight);
  setReaderDatasetValue(readingView, "letterSpacing", readerPreferences.letterSpacing);
  setReaderDatasetValue(readingView, "lineHeight", readerPreferences.lineHeight);
  setReaderDatasetValue(readingView, "contentWidth", readerPreferences.contentWidth);
  applyReaderRootPresentation(document.documentElement);
  applyReaderRootPresentation(document.body);
  [document.documentElement, document.body].forEach((node) => {
    setReaderDatasetValue(node, "blrReaderPlatform", isYouTubePage() ? "youtube" : "bilibili");
  });
  applyReaderColumnLayout();
  syncReadingTranscriptHeaderControls();
}

function updateReaderChapterPresence(hasChapters) {
  const value = hasChapters ? "1" : "0";
  const readingView = byId(ids.readingView);
  setReaderDatasetValue(readingView, "hasChapters", value);
  setReaderDatasetValue(document.documentElement, "blrReaderHasChapters", value);
  setReaderDatasetValue(document.body, "blrReaderHasChapters", value);
}

function updateReaderPreferences(next, { persist = true } = {}) {
  readerSessionState.transition?.cancel();
  noteManualReaderInteraction();
  const scrollAnchor = captureTranscriptScrollAnchor(
    document.getElementById("blr-reading-inline-host") || byId(ids.readingTranscriptList),
    ".blr-reading-complete-segment"
  );
  readerPreferences.theme = normalizeReaderTheme(next.readerTheme ?? readerPreferences.theme);
  readerPreferences.fontScale = normalizeReaderFontScale(next.readerFontScale ?? readerPreferences.fontScale);
  readerPreferences.fontWeight = normalizeReaderFontWeight(next.readerFontWeight ?? readerPreferences.fontWeight);
  readerPreferences.letterSpacing = normalizeReaderLetterSpacing(
    next.readerLetterSpacing ?? readerPreferences.letterSpacing
  );
  readerPreferences.lineHeight = normalizeReaderLineHeight(next.readerLineHeight ?? readerPreferences.lineHeight);
  readerPreferences.contentWidth = normalizeReaderContentWidth(next.readerContentWidth ?? readerPreferences.contentWidth);
  readerPreferences.settings = {
    ...readerPreferences.settings,
    readerTheme: readerPreferences.theme,
    readerFontScale: readerPreferences.fontScale,
    readerFontWeight: readerPreferences.fontWeight,
    readerLetterSpacing: readerPreferences.letterSpacing,
    readerLineHeight: readerPreferences.lineHeight,
    readerContentWidth: readerPreferences.contentWidth
  };
  applyReadingViewPresentation();
  updateReadingTranscriptTailSpacer();
  restoreTranscriptScrollAnchor(scrollAnchor);
  scheduleReaderLayout();
  if (persist) {
    persistReaderSettings();
  }
}

function persistReaderSettings() {
  sendRuntimeMessage({ type: "save-settings", settings: readerPreferences.settings }).catch((error) => {
    logWarn("[BOC] failed to persist reader settings", error);
  });
}

function buildReadingMetaLine() {
  const parts = [];
  if (clipState.author) {
    parts.push(clipState.author);
  }
  if (clipState.uploadDate) {
    parts.push(clipState.uploadDate);
  }
  parts.push(isYouTubePage() ? "youtube.com" : "bilibili.com");
  if (Number(clipState.pageCount) > 1) {
    const pageParts = [`P${Number(clipState.pageIndex) > 0 ? Number(clipState.pageIndex) : 1}`];
    if (clipState.pageTitle) {
      pageParts.push(clipState.pageTitle);
    }
    parts.push(pageParts.join(" "));
  }
  if (clipState.selectedSubtitleLang) {
    parts.push(`字幕：${clipState.selectedSubtitleLang}`);
  }
  return parts.join(" · ");
}

function renderReadingStatus(text) {
  const node = byId(ids.readingStatus);
  const value = String(text || "");
  if (node.textContent !== value) node.textContent = value;
}

function setReadingViewReady(ready) {
  readerSessionState.ready = Boolean(ready);
  const readingView = document.getElementById(ids.readingView);
  if (!readingView) {
    return;
  }
  readingView.setAttribute("data-blr-reader-ready", readerSessionState.ready ? "1" : "0");
  readingView.setAttribute("aria-busy", readerSessionState.ready ? "false" : "true");
}

function createReaderDebugSnapshot(label = "manual") {
  const pickNodeSnapshot = (selector) => {
    const node = document.querySelector(selector);
    if (!node) {
      return null;
    }
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    return {
      selector,
      tag: node.tagName,
      id: node.id || "",
      className: typeof node.className === "string" ? node.className : "",
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height)
      },
      style: {
        display: style.display,
        position: style.position,
        width: style.width,
        height: style.height,
        maxWidth: style.maxWidth,
        maxHeight: style.maxHeight,
        top: style.top,
        left: style.left,
        transform: style.transform,
        overflow: style.overflow,
        zIndex: style.zIndex
      },
      attrs: {
        readerKeep: node.getAttribute("data-blr-reader-keep"),
        readerHidden: node.getAttribute("data-blr-reader-hidden"),
        readerReset: node.getAttribute("data-blr-reader-player-reset")
      }
    };
  };

  const playerHost = readerPlayerState.host || findReaderPlayerHost(getRuntimeVideoElement());
  const wrapNode = getReaderPlayerWrapNode(playerHost);
  const video = readerPlayerState.videoEl || getRuntimeVideoElement();
  const hostChain = [];
  let current = playerHost;
  let depth = 0;
  while (current && depth < 8) {
    const rect = current.getBoundingClientRect();
    const style = window.getComputedStyle(current);
    hostChain.push({
      tag: current.tagName,
      id: current.id || "",
      className: typeof current.className === "string" ? current.className : "",
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height)
      },
      style: {
        position: style.position,
        width: style.width,
        height: style.height,
        top: style.top,
        left: style.left,
        transform: style.transform,
        overflow: style.overflow,
        zIndex: style.zIndex
      },
      readerReset: current.getAttribute("data-blr-reader-player-reset")
    });
    current = current.parentElement;
    depth += 1;
  }

  return {
    label: String(label || "manual"),
    url: cleanVideoUrl(),
    readerMode: document.documentElement.getAttribute("data-blr-reader-mode"),
    readingActive: document.body.getAttribute("data-blr-reading-active"),
    readingViewOpen: readerSessionState.open,
    readingViewReady: readerSessionState.ready,
    readyStable: isReaderPresentationStable(playerHost),
    hasLayoutIssue: hasNativeReaderPlayerLayoutIssue(playerHost),
    hasRoot: Boolean(document.getElementById(ids.root)),
    hasReadingView: Boolean(document.getElementById(ids.readingView)),
    playerHost: playerHost
      ? {
          tag: playerHost.tagName,
          id: playerHost.id || "",
          className: typeof playerHost.className === "string" ? playerHost.className : ""
        }
      : null,
    wrapNode: wrapNode
      ? {
          tag: wrapNode.tagName,
          id: wrapNode.id || "",
          className: typeof wrapNode.className === "string" ? wrapNode.className : ""
        }
      : null,
    video: video
      ? {
          currentTime: Number(video.currentTime || 0) || 0,
          paused: Boolean(video.paused),
          videoWidth: Number(video.videoWidth || 0) || 0,
          videoHeight: Number(video.videoHeight || 0) || 0
        }
      : null,
    nodes: [
      "#app",
      "#playerWrap",
      ".player-wrap",
      "#bilibili-player",
      ".bpx-player-container",
      ".bpx-player-video-area",
      ".bpx-player-primary-area",
      "#blr-reading-inline-host",
      "#blr-reading-view"
    ]
      .map((selector) => pickNodeSnapshot(selector))
      .filter(Boolean),
    hostChain
  };
}

function startReadingViewSync() {
  if (readerSessionState.syncTimer) {
    window.clearInterval(readerSessionState.syncTimer);
  }
  readerSessionState.syncTimer = window.setInterval(() => {
    syncYouTubeReadingChapters();
    syncReadingViewPlayback();
    scheduleReaderLayout();
  }, 1500);
}

function stopReadingViewSync() {
  if (readerSessionState.syncTimer) {
    window.clearInterval(readerSessionState.syncTimer);
    readerSessionState.syncTimer = 0;
  }
  clearReaderMountTimers();
  clearReaderPlayerTimers();
  stopReaderPlayerObserver();
  unbindReaderPlayerControlsHover();
  unbindReadingViewVideo();
}

function applyReaderPageFocus() {
  clearReaderPageFocus();

  const root = byId(ids.root);
  const video = getRuntimeVideoElement();
  const playerHost = findReaderPlayerHost(video);
  const titleNode = isYouTubePage() ? null : findReaderTitleContainer();
  const inlineHost = document.getElementById("blr-reading-inline-host");
  const keepRoots = [root, inlineHost, playerHost, titleNode].filter(Boolean);

  keepRoots.forEach((node) => {
    markReaderKeepSubtree(node);
    markReaderKeepPath(node);
  });

  if (isYouTubePage()) {
    // YouTube moves the same player between these hosts when theater mode
    // changes. Keep both paths available before it moves into the empty host.
    document.querySelectorAll(
      "ytd-watch-flexy #player, ytd-watch-flexy #player-container-outer, " +
      "ytd-watch-flexy #player-container-inner, ytd-watch-flexy #full-bleed-container, " +
      "ytd-watch-flexy #player-full-bleed-container"
    ).forEach(markReaderKeepPath);
  }

  const keepNodes = Array.from(document.querySelectorAll("[data-blr-reader-keep='1']"));
  keepNodes.forEach((parent) => {
    Array.from(parent.children || []).forEach((child) => {
      if (child.id === ids.root) {
        return;
      }
      if (!child.hasAttribute("data-blr-reader-keep")) {
        child.setAttribute("data-blr-reader-hidden", "1");
      }
    });
  });

  pruneReaderNonKeepBranches(document.body);
  hideReaderNoiseNodes(keepRoots);
}

function clearReaderPageFocus() {
  document.querySelectorAll("[data-blr-reader-keep]").forEach((node) => {
    node.removeAttribute("data-blr-reader-keep");
  });
  document.querySelectorAll("[data-blr-reader-hidden]").forEach((node) => {
    node.removeAttribute("data-blr-reader-hidden");
  });
}

function moveReadingMainInline() {
  if (!isReaderMode()) {
    return;
  }

  const readingMain = document.querySelector(".blr-reading-main");
  if (!readingMain) {
    return;
  }

  if (!uiState.mainOriginalParent) {
    uiState.mainOriginalParent = readingMain.parentElement;
    uiState.mainOriginalNextSibling = readingMain.nextSibling;
  }
  const playerWrap =
    document.getElementById("playerWrap") ||
    readerPlayerState.host?.closest?.("#playerWrap") ||
    readerPlayerState.host;
  if (!playerWrap) {
    return;
  }

  let inlineHost = document.getElementById("blr-reading-inline-host");
  if (!inlineHost) {
    inlineHost = document.createElement("div");
    inlineHost.id = "blr-reading-inline-host";
  }

  // Keep the transcript outside Bilibili's transformed layout containers.
  // A transformed ancestor changes the containing block of position: fixed and
  // makes the right column overlap the player instead of hugging the viewport.
  if (inlineHost.parentElement !== document.body) {
    document.body.appendChild(inlineHost);
  }
  inlineHost.removeAttribute("data-blr-reader-hidden");
  markReaderKeepSubtree(inlineHost);
  markReaderKeepPath(inlineHost);

  let transcriptHeading = document.getElementById("blr-reading-transcript-heading");
  if (!transcriptHeading) {
    transcriptHeading = document.createElement("div");
    transcriptHeading.id = "blr-reading-transcript-heading";
    transcriptHeading.className = "blr-reading-transcript-heading";
    transcriptHeading.setAttribute("role", "heading");
    transcriptHeading.setAttribute("aria-level", "2");
    transcriptHeading.innerHTML = readerHtml(buildReadingTranscriptHeadingHtml());
  } else if (!transcriptHeading.querySelector(".blr-reading-transcript-heading-controls")) {
    transcriptHeading.innerHTML = readerHtml(buildReadingTranscriptHeadingHtml());
  }
  if (transcriptHeading.parentElement !== inlineHost || inlineHost.firstElementChild !== transcriptHeading) {
    inlineHost.prepend(transcriptHeading);
  }
  bindReadingTranscriptHeaderControls(transcriptHeading);
  syncReadingTranscriptHeaderControls();

  if (!inlineHost.dataset.blrScrollBound) {
    const handleInlineHostManualScroll = () => {
      if (Date.now() <= readerSessionState.programmaticScrollUntil) {
        return;
      }
      noteManualReaderInteraction();
    };
    inlineHost.addEventListener("scroll", handleInlineHostManualScroll);
    inlineHost.addEventListener("wheel", handleInlineHostManualScroll, { passive: true });
    inlineHost.dataset.blrScrollBound = "1";
  }

  if (readingMain.parentElement !== inlineHost) {
    inlineHost.appendChild(readingMain);
  }
  updateReadingTranscriptTailSpacer();
}

function restoreReadingMainInline() {
  const readingMain = document.querySelector(".blr-reading-main");
  const inlineHost = document.getElementById("blr-reading-inline-host");
  if (readingMain && uiState.mainOriginalParent) {
    if (uiState.mainOriginalNextSibling?.parentNode === uiState.mainOriginalParent) {
      uiState.mainOriginalParent.insertBefore(readingMain, uiState.mainOriginalNextSibling);
    } else {
      uiState.mainOriginalParent.appendChild(readingMain);
    }
  }
  inlineHost?.remove();
  uiState.mainOriginalParent = null;
  uiState.mainOriginalNextSibling = null;
}

function pruneReaderNonKeepBranches(node) {
  if (!node?.children?.length) {
    return;
  }

  Array.from(node.children).forEach((child) => {
    if (child.id === ids.root) {
      return;
    }
    const childHasKeep = child.hasAttribute("data-blr-reader-keep");
    const childContainsKeep = Boolean(child.querySelector?.("[data-blr-reader-keep='1']"));
    if (!childHasKeep && !childContainsKeep) {
      child.setAttribute("data-blr-reader-hidden", "1");
      return;
    }
    pruneReaderNonKeepBranches(child);
  });
}

function hideReaderNoiseNodes(keepRoots = []) {
  const keepSet = new Set(keepRoots.filter(Boolean));
  const selectors = [
    ".strip-ad-inner",
    ".inside-wrp",
    ".inside-bg",
    ".hinter-msg",
    ".slide",
    ".cover.b-img",
    ".cover.b-img.sleepy",
    ".b-img.clickable",
    "[class*='activity']",
    "[class*='adcard']"
  ];

  document.querySelectorAll(selectors.join(",")).forEach((node) => {
    if (Array.from(keepSet).some((keepNode) => keepNode === node || node.contains(keepNode))) {
      return;
    }
    if (
      node.closest(
        "#movie_player, #bilibili-player, .bpx-player-container, .bpx-player-video-area, .bpx-player-primary-area, #blr-root, h1.video-title, .video-info-detail, .video-info-meta, .video-data"
      )
    ) {
      return;
    }
    node.setAttribute("data-blr-reader-hidden", "1");
    const card = node.closest("article, li, .card-box, .video-page-card-small, .video-page-special-card-small, .feed-card, .bili-video-card");
    if (card && !card.closest("#bilibili-player, .bpx-player-container, .bpx-player-video-area, .bpx-player-primary-area, #blr-root")) {
      card.setAttribute("data-blr-reader-hidden", "1");
    }
  });
}

function markReaderKeepSubtree(node) {
  if (!node) {
    return;
  }
  node.setAttribute("data-blr-reader-keep", "1");
  node.querySelectorAll("*").forEach((child) => {
    child.setAttribute("data-blr-reader-keep", "1");
  });
}

function markReaderKeepPath(node) {
  let current = node;
  while (current && current !== document.body) {
    current.setAttribute("data-blr-reader-keep", "1");
    current = current.parentElement;
  }
  document.body.setAttribute("data-blr-reader-keep", "1");
}

function findReaderTitleContainer() {
  const title =
    document.querySelector("h1.video-title") ||
    document.querySelector("h1") ||
    document.querySelector("[data-title]");
  if (!title) {
    return null;
  }
  return title;
}

function setReaderHeaderActionsVisible(visible) {
  const actions = document.querySelector(".blr-reading-actions");
  if (!actions) {
    return;
  }
  if (visible) {
    actions.removeAttribute("data-blr-icon-hidden");
    return;
  }
  actions.setAttribute("data-blr-icon-hidden", "1");
}

function scheduleReaderHeaderActionsHide(delayMs = 10000) {
  if (uiState.headerHideTimer) {
    window.clearTimeout(uiState.headerHideTimer);
    uiState.headerHideTimer = 0;
  }
  uiState.headerHideTimer = window.setTimeout(() => {
    uiState.headerHideTimer = 0;
    if (!readerSessionState.open) {
      return;
    }
    setReaderHeaderActionsVisible(false);
  }, delayMs);
}

function bindReaderHeaderActionsHover() {
  if (!readerSessionState.open) {
    return;
  }
  const header = document.querySelector(".blr-reading-header");
  if (!header || header.__blrReaderHeaderHoverBound) {
    uiState.headerHoverHost = header || null;
    return;
  }

  const showActions = () => {
    if (!readerSessionState.open) {
      return;
    }
    if (uiState.headerHideTimer) {
      window.clearTimeout(uiState.headerHideTimer);
      uiState.headerHideTimer = 0;
    }
    setReaderHeaderActionsVisible(true);
  };
  const hideActionsLater = () => {
    if (!readerSessionState.open) {
      return;
    }
    scheduleReaderHeaderActionsHide();
  };

  header.addEventListener("mouseenter", showActions, true);
  header.addEventListener("mouseleave", hideActionsLater, true);
  header.__blrReaderHeaderHoverBound = { showActions, hideActionsLater };
  uiState.headerHoverHost = header;
  setReaderHeaderActionsVisible(true);
  scheduleReaderHeaderActionsHide();
}

function unbindReaderHeaderActionsHover() {
  const header = uiState.headerHoverHost;
  if (uiState.headerHideTimer) {
    window.clearTimeout(uiState.headerHideTimer);
    uiState.headerHideTimer = 0;
  }
  if (!header?.__blrReaderHeaderHoverBound) {
    uiState.headerHoverHost = null;
    return;
  }
  const { showActions, hideActionsLater } = header.__blrReaderHeaderHoverBound;
  header.removeEventListener("mouseenter", showActions, true);
  header.removeEventListener("mouseleave", hideActionsLater, true);
  delete header.__blrReaderHeaderHoverBound;
  uiState.headerHoverHost = null;
  setReaderHeaderActionsVisible(true);
}
// Native Bilibili player discovery, layout repair, controls, and cleanup.
const ignoredReaderVideoSelector = [
  "[data-blr-reader-hidden='1']",
  ".bpx-player-mini-warp",
  ".bpx-player-mini-close",
  ".bpx-player-ending-panel",
  ".bpx-player-ending-related",
  "[class*='mini-player']",
  "[class*='picture-in-picture']",
  "[class*='adcard']",
  ".ad-report",
  "[class*='ad-report']",
  ".video-page-card-small",
  ".video-page-special-card-small",
  ".feed-card",
  ".bili-video-card"
].join(", ");

function clearNativeReaderFloatingStyles(playerHost = readerPlayerState.host) {
  if (!readerSessionState.open || !playerHost) {
    return;
  }

  const targets = [];
  let current = playerHost;
  let depth = 0;
  while (current && current !== document.body && depth < 8) {
    if (
      current.matches?.(
        ".bpx-player-container, .bpx-docker, .bpx-player-video-area, .bpx-player-primary-area, #bilibili-player, #playerWrap, .player-wrap"
      )
    ) {
      targets.push(current);
    }
    if (current.id === "playerWrap") {
      break;
    }
    current = current.parentElement;
    depth += 1;
  }

  targets.forEach((node) => {
    node.style.removeProperty("position");
    node.style.removeProperty("inset");
    node.style.removeProperty("left");
    node.style.removeProperty("top");
    node.style.removeProperty("right");
    node.style.removeProperty("bottom");
    node.style.removeProperty("transform");
    node.style.removeProperty("width");
    node.style.removeProperty("height");
    node.style.removeProperty("max-width");
    node.style.removeProperty("max-height");
    node.style.removeProperty("margin");
    node.style.removeProperty("z-index");
  });
}

function getReaderPlayerWrapNode(playerHost = readerPlayerState.host) {
  if (isYouTubePage()) return playerHost || document.getElementById("movie_player");
  return (
    playerHost?.closest?.("#playerWrap") ||
    playerHost?.closest?.(".player-wrap") ||
    document.getElementById("playerWrap") ||
    document.querySelector(".player-wrap")
  );
}

function hasNativeReaderPlayerLayoutIssue(playerHost = readerPlayerState.host) {
  if (isYouTubePage()) return false;
  if (!readerSessionState.open || !playerHost) {
    return false;
  }

  const playerStyle = window.getComputedStyle(playerHost);
  if (playerStyle.position === "fixed" || playerStyle.position === "sticky") {
    return true;
  }

  const playerRect = playerHost.getBoundingClientRect();
  const wrapNode = getReaderPlayerWrapNode(playerHost);
  if (!wrapNode) {
    return false;
  }

  const wrapRect = wrapNode.getBoundingClientRect();
  return wrapRect.height <= 8 && playerRect.height > 120;
}

function isReaderPresentationStable(playerHost = readerPlayerState.host) {
  if (!readerSessionState.open || !playerHost?.isConnected) {
    return false;
  }
  const rect = playerHost.getBoundingClientRect();
  if (!(rect.width > 240) || !(rect.height > 120)) {
    return false;
  }
  return !hasNativeReaderPlayerLayoutIssue(playerHost);
}

function cleanupReaderPlayerHostNode(playerHost) {
  if (!playerHost) {
    return;
  }
  playerHost.classList.remove("blr-reader-player-host");
  playerHost.style.removeProperty("position");
  playerHost.style.removeProperty("inset");
  playerHost.style.removeProperty("left");
  playerHost.style.removeProperty("top");
  playerHost.style.removeProperty("right");
  playerHost.style.removeProperty("bottom");
  playerHost.style.removeProperty("transform");
  playerHost.style.removeProperty("width");
  playerHost.style.removeProperty("height");
  playerHost.style.removeProperty("margin");
  playerHost.style.removeProperty("z-index");
  playerHost.style.removeProperty("max-width");
  playerHost.style.removeProperty("max-height");
}

const READER_PLAYER_TIMER_KEYS = ["miniDismissTimer", "controlsHideTimer", "controlsRecoveryTimer"];

function clearReaderPlayerTimers() {
  READER_PLAYER_TIMER_KEYS.forEach((name) => {
    if (readerPlayerState[name]) window.clearTimeout(readerPlayerState[name]);
    readerPlayerState[name] = 0;
  });
  readerPlayerState.controlsRecoveryInFlight = false;
}

function cleanupReaderPlayerHost() {
  unbindReaderPlayerControlsHover();
  unbindReaderHeaderActionsHover();
  clearReaderPlayerTimers();
  const readingView = byId(ids.readingView);
  [document.documentElement, document.body, readingView].filter(Boolean).forEach((node) => {
    node.style.removeProperty("--blr-reader-player-rendered-width");
    node.style.removeProperty("--blr-reader-player-rendered-height");
    node.style.removeProperty("--blr-reader-player-left");
    node.style.removeProperty("--blr-reader-player-top");
    node.style.removeProperty("--blr-reader-player-bottom");
    node.style.removeProperty("--blr-reader-player-width");
  });
  const playerHost = readerPlayerState.host;
  if (playerHost && !isYouTubePage()) {
    setReaderPlayerControlsVisible(false, playerHost);
    cleanupReaderPlayerHostNode(playerHost);
  }
  // Restore native dimensions last so cleanup cannot erase them again.
  restoreReaderPlayerContainer();
  readerPlayerState.host = null;
}

function startReaderPlayerObserver() {
  if (!isReaderMode() || readerPlayerState.observer || !document.body) {
    return;
  }
  readerPlayerState.observer = subscribeReaderPageChanges("player", () => {
    if (!readerSessionState.open) return;
    const nextVideo = getRuntimeVideoElement();
    const nextHost = findReaderPlayerHost(nextVideo);
    if (nextVideo && nextHost && (nextVideo !== readerPlayerState.videoEl || nextHost !== readerPlayerState.host)) {
      queueEnsureReaderPlayerMounted();
    }
    if (isYouTubePage()) {
      // Theater/fullscreen switches can reparent an unchanged player. Refresh
      // its keep path even when neither the video nor the player was replaced.
      applyReaderPageFocus();
      scheduleReaderLayout();
      return;
    }
    if (document.querySelector(".bpx-player-mini-close, .bpx-player-mini-warp")) {
      scheduleReaderMiniPlayerDismiss();
    }
  });
}

function stopReaderPlayerObserver() {
  readerPlayerState.observer?.();
  readerPlayerState.observer = null;
}

const READING_VIDEO_SYNC_EVENTS = ["timeupdate", "seeked", "loadedmetadata", "resize"];

function unbindReadingViewVideo(video = readerPlayerState.videoEl) {
  const handler = video?.__blrReadingSyncHandler;
  if (handler) {
    READING_VIDEO_SYNC_EVENTS.forEach((event) => video.removeEventListener(event, handler));
    delete video.__blrReadingSyncHandler;
  }
  if (video === readerPlayerState.videoEl) readerPlayerState.videoEventsBound = false;
}

function bindReadingViewVideo(video = getRuntimeVideoElement()) {
  if (!video) {
    unbindReadingViewVideo();
    readerPlayerState.videoEl = null;
    readerPlayerState.videoEventsBound = false;
    return null;
  }

  if (readerPlayerState.videoEl === video && readerPlayerState.videoEventsBound) {
    return video;
  }

  unbindReadingViewVideo();

  const syncHandler = (event) => {
    if (readerSessionState.open) {
      if (event?.type === "loadedmetadata" || event?.type === "resize") {
        scheduleReaderLayout();
      }
      if (event?.type === "seeked") {
        readerSessionState.nextScrollBehavior = "auto";
        queueEnsureReaderPlayerControlsRecovered({
          reason: "seeked",
          delayMs: 140,
          minIntervalMs: 320
        });
      }
      const latestHost = findReaderPlayerHost(video);
      if (latestHost && latestHost !== readerPlayerState.host) {
        queueEnsureReaderPlayerMounted();
      }
      syncReadingViewPlayback();
    }
  };
  READING_VIDEO_SYNC_EVENTS.forEach((event) => video.addEventListener(event, syncHandler));
  video.__blrReadingSyncHandler = syncHandler;
  readerPlayerState.videoEl = video;
  readerPlayerState.host = findReaderPlayerHost(video) || readerPlayerState.host;
  readerPlayerState.videoEventsBound = true;
  return video;
}

function getRuntimeVideoElement() {
  if (isYouTubePage()) return document.querySelector("#movie_player video");
  if (readerPlayerState.videoEl?.isConnected) {
    const currentHost = findReaderPlayerHost(readerPlayerState.videoEl);
    const currentRect = readerPlayerState.videoEl.getBoundingClientRect();
    if (
      currentHost?.isConnected &&
      currentRect.width > 120 &&
      currentRect.height > 68 &&
      !isIgnoredReaderVideoCandidate(readerPlayerState.videoEl, currentHost)
    ) {
      return readerPlayerState.videoEl;
    }
  }

  let fallback = null;
  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const video of document.querySelectorAll("video")) {
    if (!video.isConnected) continue;
    const host = findReaderPlayerHost(video);
    if (isIgnoredReaderVideoCandidate(video, host)) continue;
    if (!fallback) fallback = video;
    const rect = video.getBoundingClientRect();
    if (!(rect.width > 240 && rect.height > 120)) continue;
    const inPlayer = Boolean(host &&
      (host.matches?.("#bilibili-player, .bpx-player-container, .bpx-player-video-area") ||
        host.querySelector?.(".bpx-player-video-area")));
    const score = Math.max(0, rect.width) * Math.max(0, rect.height) +
      (inPlayer ? 1000000 : 0) +
      (!video.paused ? 20000 : 0) +
      Number(video.readyState || 0) * 2000 +
      (video.currentSrc ? 10000 : 0) +
      (video === readerPlayerState.videoEl ? 500 : 0);
    // Strict comparison keeps the first DOM candidate when scores tie,
    // matching the previous stable sort without allocating score arrays.
    if (!best || score > bestScore) {
      best = video;
      bestScore = score;
    }
  }
  return best || fallback;
}

function isIgnoredReaderVideoCandidate(video, host = findReaderPlayerHost(video)) {
  if (!video) {
    return true;
  }
  return Boolean(video.closest(ignoredReaderVideoSelector) || host?.closest?.(ignoredReaderVideoSelector));
}

function dismissReaderMiniPlayer(playerHost = readerPlayerState.host) {
  if (isYouTubePage()) return false;
  const explicitClose = Array.from(document.querySelectorAll(".bpx-player-mini-close")).find(isVisibleReaderControl);
  if (explicitClose) {
    explicitClose.click();
    return true;
  }

  if (!playerHost) {
    return false;
  }

  const computed = window.getComputedStyle(playerHost);
  const fixedLike = computed.position === "fixed" || /mini|picture|float|fixed-player/i.test(playerHost.className || "");
  if (!fixedLike) {
    return false;
  }

  const roots = Array.from(
    new Set([
      playerHost,
      playerHost.parentElement,
      playerHost.closest("#playerWrap"),
      playerHost.closest("#bilibili-player")
    ].filter(Boolean))
  );

  const selectors = [
    ".bpx-player-mini-close",
    "[class*='mini'][class*='close']",
    "[class*='close']",
    "button[aria-label*='关闭']",
    "button[title*='关闭']",
    "[role='button'][aria-label*='关闭']",
    "[role='button'][title*='关闭']"
  ];

  for (const root of roots) {
    for (const selector of selectors) {
      const candidates = Array.from(root.querySelectorAll(selector)).filter(isVisibleReaderControl);
      const button = candidates.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.width * rectA.height - rectB.width * rectB.height;
      })[0];
      if (button) {
        button.click();
        return true;
      }
    }
  }

  const playerRect = playerHost.getBoundingClientRect();
  for (const root of roots) {
    const fallback = Array.from(root.querySelectorAll("button, [role='button'], [tabindex], div, span"))
      .filter((node) => {
        if (!isVisibleReaderControl(node)) {
          return false;
        }
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        const nearTopRight =
          rect.width <= 48 &&
          rect.height <= 48 &&
          rect.left >= playerRect.right - 96 &&
          rect.top <= playerRect.top + 96;
        return nearTopRight && (style.cursor === "pointer" || node.hasAttribute("role") || node.hasAttribute("tabindex"));
      })
      .sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.top + (playerRect.right - rectA.right) - (rectB.top + (playerRect.right - rectB.right));
      })[0];

    if (fallback) {
      fallback.click();
      return true;
    }
  }

  return false;
}

function scheduleReaderMiniPlayerDismiss(maxAttempts = 12, delayMs = 180) {
  if (isYouTubePage()) return;
  if (!readerSessionState.open) {
    return;
  }
  if (readerPlayerState.miniDismissTimer) {
    window.clearTimeout(readerPlayerState.miniDismissTimer);
    readerPlayerState.miniDismissTimer = 0;
  }

  let attempts = 0;
  const run = () => {
    if (!readerSessionState.open) {
      readerPlayerState.miniDismissTimer = 0;
      return;
    }

    const closed = dismissReaderMiniPlayer();
    const host = findReaderPlayerHost(getRuntimeVideoElement());
    if (host) {
      readerPlayerState.host = host;
      normalizeReaderPlayerContainer(host);
      layoutReaderPlayerHost();
    }

    attempts += 1;
    const miniExists = Boolean(document.querySelector(".bpx-player-mini-close, .bpx-player-mini-warp"));
    const hostFixed = Boolean(host && window.getComputedStyle(host).position === "fixed");
    if (attempts < maxAttempts && (miniExists || hostFixed || closed)) {
      readerPlayerState.miniDismissTimer = window.setTimeout(run, delayMs);
      return;
    }
    readerPlayerState.miniDismissTimer = 0;
  };

  readerPlayerState.miniDismissTimer = window.setTimeout(run, 40);
}

function getReaderControlsRoot(playerHost = readerPlayerState.host) {
  return (
    playerHost?.closest?.("#playerWrap") ||
    playerHost?.closest?.("#bilibili-player") ||
    playerHost ||
    document.getElementById("playerWrap") ||
    document.getElementById("bilibili-player")
  );
}

function getReaderPlayerControlsState(playerHost = readerPlayerState.host) {
  const controlRoot = getReaderControlsRoot(playerHost);
  const nodes = [".bpx-player-control-wrap", ".bpx-player-control-mask", ".bpx-player-control-entity"].map(
    (selector) => {
      const node = controlRoot?.querySelector(selector) || null;
      return {
        selector,
        exists: Boolean(node),
        visible: isVisibleReaderControl(node)
      };
    }
  );

  return {
    controlRootFound: Boolean(controlRoot),
    hostHasNoCursor: Boolean(playerHost?.classList.contains("bpx-state-no-cursor")),
    anyPresent: nodes.some((item) => item.exists),
    anyHidden: nodes.some((item) => item.exists && !item.visible),
    nodes
  };
}

function hasReaderPlayerControlsIssue(playerHost = readerPlayerState.host) {
  if (!readerSessionState.open || !playerHost || isWatchlaterPage()) {
    return false;
  }

  const snapshot = getReaderPlayerControlsState(playerHost);
  return snapshot.hostHasNoCursor || (snapshot.anyPresent && snapshot.anyHidden);
}

function queueEnsureReaderPlayerControlsRecovered({
  reason = "unknown",
  delayMs = 120,
  minIntervalMs = 480
} = {}) {
  if (!readerSessionState.open || isWatchlaterPage() || isYouTubePage()) {
    return;
  }
  const playerHost = readerPlayerState.host;
  if (!playerHost?.isConnected || readerPlayerState.controlsRecoveryInFlight) {
    return;
  }

  const now = Date.now();
  if (readerPlayerState.controlsRecoveryTimer) {
    return;
  }
  if (now - readerPlayerState.controlsLastRecoverAt < minIntervalMs) {
    return;
  }

  const sessionId = readerSessionState.id;
  readerPlayerState.controlsRecoveryTimer = window.setTimeout(() => {
    readerPlayerState.controlsRecoveryTimer = 0;
    if (!isReaderSessionActive(sessionId) || isWatchlaterPage()) {
      return;
    }
    const activeHost = readerPlayerState.host;
    if (!activeHost?.isConnected || !hasReaderPlayerControlsIssue(activeHost)) {
      return;
    }

    readerPlayerState.controlsRecoveryInFlight = true;
    readerPlayerState.controlsLastRecoverAt = Date.now();
    ensureReaderPlayerControlsRecovered(activeHost, {
      reason,
      retryDelayMs: 120
    })
      .catch((error) => {
        logWarn("[BOC] queued reader controls recovery failed", { reason, error });
      })
      .finally(() => {
        if (sessionId === readerSessionState.id) readerPlayerState.controlsRecoveryInFlight = false;
      });
  }, delayMs);
}

function setReaderPlayerControlsVisible(visible, playerHost = readerPlayerState.host) {
  if (!readerSessionState.open || !playerHost) {
    return;
  }

  const controlRoot = getReaderControlsRoot(playerHost);
  if (!controlRoot) {
    return;
  }

  const displayMap = new Map([
    [".bpx-player-control-wrap", "block"],
    [".bpx-player-control-mask", "block"],
    [".bpx-player-control-entity", "block"]
  ]);

  displayMap.forEach((displayValue, selector) => {
    const node = controlRoot.querySelector(selector);
    if (!node) {
      return;
    }

    if (visible) {
      node.style.setProperty("display", displayValue, "important");
      node.setAttribute("data-blr-reader-controls-forced", "1");
      return;
    }

    if (node.getAttribute("data-blr-reader-controls-forced") === "1") {
      node.style.removeProperty("display");
      node.removeAttribute("data-blr-reader-controls-forced");
    }
  });

  if (visible) {
    if (playerHost.classList.contains("bpx-state-no-cursor")) {
      playerHost.classList.remove("bpx-state-no-cursor");
      playerHost.setAttribute("data-blr-reader-no-cursor-cleared", "1");
    }
    return;
  }

  if (playerHost.getAttribute("data-blr-reader-no-cursor-cleared") === "1") {
    playerHost.classList.add("bpx-state-no-cursor");
    playerHost.removeAttribute("data-blr-reader-no-cursor-cleared");
  }
}

async function ensureReaderPlayerControlsRecovered(
  playerHost = readerPlayerState.host,
  { reason = "unknown", retryDelayMs = 90 } = {}
) {
  const sessionId = readerSessionState.id;
  if (!isReaderSessionActive(sessionId) || !playerHost || isWatchlaterPage()) {
    return false;
  }

  const before = getReaderPlayerControlsState(playerHost);
  logInfo("[BOC] reader controls check", {
    reason,
    hostClassName: typeof playerHost.className === "string" ? playerHost.className : "",
    hostHasNoCursor: before.hostHasNoCursor,
    controlRootFound: before.controlRootFound,
    controls: before.nodes
  });

  if (!hasReaderPlayerControlsIssue(playerHost)) {
    return false;
  }

  logInfo("[BOC] recovering normal reader controls", {
    reason,
    hostClassName: typeof playerHost.className === "string" ? playerHost.className : ""
  });
  setReaderPlayerControlsVisible(true, playerHost);
  layoutReaderPlayerHost();

  let after = getReaderPlayerControlsState(playerHost);
  logInfo("[BOC] reader controls after recovery", {
    reason,
    hostClassName: typeof playerHost.className === "string" ? playerHost.className : "",
    hostHasNoCursor: after.hostHasNoCursor,
    controls: after.nodes,
    retried: false
  });
  if (!hasReaderPlayerControlsIssue(playerHost)) {
    return true;
  }

  await sleep(retryDelayMs);
  if (!isReaderSessionActive(sessionId) || readerPlayerState.host !== playerHost || !playerHost.isConnected) return false;
  logInfo("[BOC] retrying normal reader controls recovery", {
    reason,
    hostClassName: typeof playerHost.className === "string" ? playerHost.className : ""
  });
  setReaderPlayerControlsVisible(true, playerHost);
  layoutReaderPlayerHost();
  after = getReaderPlayerControlsState(playerHost);
  logInfo("[BOC] reader controls after retry", {
    reason,
    hostClassName: typeof playerHost.className === "string" ? playerHost.className : "",
    hostHasNoCursor: after.hostHasNoCursor,
    controls: after.nodes,
    retried: true
  });
  return !hasReaderPlayerControlsIssue(playerHost);
}

function scheduleReaderPlayerControlsHide(playerHost = readerPlayerState.controlsHoverHost || readerPlayerState.host) {
  if (readerPlayerState.controlsHideTimer) {
    window.clearTimeout(readerPlayerState.controlsHideTimer);
  }
  readerPlayerState.controlsHideTimer = window.setTimeout(() => {
    readerPlayerState.controlsHideTimer = 0;
    if (!readerSessionState.open) {
      return;
    }
    setReaderPlayerControlsVisible(false, playerHost);
  }, 1200);
}

function bindReaderPlayerControlsHover(playerHost = readerPlayerState.host) {
  if (!readerSessionState.open || !isWatchlaterPage() || !playerHost) {
    return;
  }

  if (readerPlayerState.controlsHoverHost && readerPlayerState.controlsHoverHost !== playerHost) {
    unbindReaderPlayerControlsHover();
  }
  if (playerHost.__blrReaderControlsHoverBound) {
    readerPlayerState.controlsHoverHost = playerHost;
    return;
  }

  const showControls = () => {
    if (!readerSessionState.open) {
      return;
    }
    setReaderPlayerControlsVisible(true, playerHost);
    scheduleReaderPlayerControlsHide(playerHost);
  };
  const hideControls = () => {
    if (readerPlayerState.controlsHideTimer) {
      window.clearTimeout(readerPlayerState.controlsHideTimer);
      readerPlayerState.controlsHideTimer = 0;
    }
    setReaderPlayerControlsVisible(false, playerHost);
  };

  playerHost.addEventListener("mouseenter", showControls, true);
  playerHost.addEventListener("mousemove", showControls, true);
  playerHost.addEventListener("mouseleave", hideControls, true);
  playerHost.__blrReaderControlsHoverBound = { showControls, hideControls };
  readerPlayerState.controlsHoverHost = playerHost;
}

function unbindReaderPlayerControlsHover() {
  const playerHost = readerPlayerState.controlsHoverHost;
  if (readerPlayerState.controlsHideTimer) {
    window.clearTimeout(readerPlayerState.controlsHideTimer);
    readerPlayerState.controlsHideTimer = 0;
  }
  if (!playerHost?.__blrReaderControlsHoverBound) {
    readerPlayerState.controlsHoverHost = null;
    return;
  }

  const { showControls, hideControls } = playerHost.__blrReaderControlsHoverBound;
  playerHost.removeEventListener("mouseenter", showControls, true);
  playerHost.removeEventListener("mousemove", showControls, true);
  playerHost.removeEventListener("mouseleave", hideControls, true);
  delete playerHost.__blrReaderControlsHoverBound;
  setReaderPlayerControlsVisible(false, playerHost);
  readerPlayerState.controlsHoverHost = null;
}

function isVisibleReaderControl(node) {
  if (!node || typeof node.getBoundingClientRect !== "function") {
    return false;
  }
  const rect = node.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }
  const style = window.getComputedStyle(node);
  return style.display !== "none" && style.visibility !== "hidden" && style.pointerEvents !== "none";
}

function normalizeReaderPlayerContainer(playerHost = readerPlayerState.host) {
  if (!readerSessionState.open || !playerHost) {
    return;
  }

  restoreReaderPlayerContainer();
  const adjusted = [];
  let current = playerHost;
  let depth = 0;

  while (current && current !== document.body && depth < 12) {
    const computed = window.getComputedStyle(current);
    const className = typeof current.className === "string" ? current.className : "";
    const isPlayerLayoutNode = current.matches?.(
      ".bpx-player-container, .bpx-player-video-area, .bpx-player-primary-area, .bpx-player-inner, .scroll-sticky, .player-wrap, #playerWrap, #bilibili-player"
    );
    const isExplicitMiniNode = current.matches?.(
      ".bpx-player-mini-warp, .bpx-player-mini-close, [class*='mini-player'], [class*='picture-in-picture']"
    );
    const hasFloatingPosition = computed.position === "fixed" || computed.position === "sticky";
    const isMiniLike =
      hasFloatingPosition ||
      /mini|picture|float|fixed-player/i.test(className) ||
      current.matches?.(".bpx-player-mini-warp, .bpx-player-mini-close");
    const shouldReset = isExplicitMiniNode || (isPlayerLayoutNode && isMiniLike);

    if (shouldReset) {
      adjusted.push({
        node: current,
        position: current.style.position,
        left: current.style.left,
        top: current.style.top,
        right: current.style.right,
        bottom: current.style.bottom,
        width: current.style.width,
        height: current.style.height,
        transform: current.style.transform,
        margin: current.style.margin,
        zIndex: current.style.zIndex
      });
      current.setAttribute("data-blr-reader-player-reset", "1");
      current.style.setProperty("position", "static", "important");
      current.style.setProperty("left", "auto", "important");
      current.style.setProperty("top", "auto", "important");
      current.style.setProperty("right", "auto", "important");
      current.style.setProperty("bottom", "auto", "important");
      current.style.setProperty("transform", "none", "important");
      current.style.setProperty("margin", "0", "important");
      current.style.setProperty("z-index", "auto", "important");
      if (current !== playerHost) {
        current.style.removeProperty("width");
        current.style.removeProperty("height");
      }
    }

    current = current.parentElement;
    depth += 1;
  }

  readerPlayerState.adjustedNodes = adjusted;
}

function restoreReaderPlayerContainer() {
  const adjusted = Array.isArray(readerPlayerState.adjustedNodes) ? readerPlayerState.adjustedNodes : [];
  adjusted.forEach((item) => {
    const node = item?.node;
    if (!node?.isConnected) {
      return;
    }
    node.style.position = item.position || "";
    node.style.left = item.left || "";
    node.style.top = item.top || "";
    node.style.right = item.right || "";
    node.style.bottom = item.bottom || "";
    node.style.width = item.width || "";
    node.style.height = item.height || "";
    node.style.transform = item.transform || "";
    node.style.margin = item.margin || "";
    node.style.zIndex = item.zIndex || "";
    node.removeAttribute("data-blr-reader-player-reset");
  });
  readerPlayerState.adjustedNodes = [];
}

function alignReaderViewportToPlayer() {
  if (!isReaderMode()) {
    return;
  }

  // Bilibili may enable smooth scrolling on the document. Repeatedly aligning
  // to a moving title/player anchor made the whole reader drift upward during
  // its first seconds. Reset once, synchronously, before locking the layout.
  const root = document.documentElement;
  const previousScrollBehavior = root.style.getPropertyValue("scroll-behavior");
  const previousPriority = root.style.getPropertyPriority("scroll-behavior");
  root.style.setProperty("scroll-behavior", "auto", "important");
  root.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
  window.requestAnimationFrame(() => {
    if (previousScrollBehavior) {
      root.style.setProperty("scroll-behavior", previousScrollBehavior, previousPriority);
    } else {
      root.style.removeProperty("scroll-behavior");
    }
    if (readerSessionState.open && isReaderMode()) {
      layoutReaderPlayerHost();
    }
  });
}

function cleanupReaderFloatingArtifacts(playerHost = readerPlayerState.host) {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().catch(() => {});
  }
  dismissReaderMiniPlayer(playerHost);
  const runtimeHost = findReaderPlayerHost(getRuntimeVideoElement());
  if (runtimeHost && runtimeHost !== playerHost) {
    dismissReaderMiniPlayer(runtimeHost);
  }
}

function findReaderPlayerHost(video) {
  if (!video) {
    return null;
  }
  if (isYouTubePage()) return video.closest("#movie_player");

  return (
    video.closest(".bpx-player-container") ||
    video.closest(".bpx-player-video-area") ||
    video.closest("#bilibili-player") ||
    video.parentElement
  );
}

// Data commits replace arrays. WeakMap entries disappear with old clip data.
const readingSubtitleCache = new WeakMap();
const readingChapterCache = new WeakMap();
const readerNodeCache = new WeakMap();
const readerContainerNodeCache = new WeakMap();

function invalidateReaderNodeCache(container) {
  if (!container) return;
  const entries = readerContainerNodeCache.get(container);
  entries?.forEach((cache) => { cache.invalidated = true; });
  readerContainerNodeCache.delete(container);
}

function getReaderNodeCache(container, selector, indexAttribute = "data-index") {
  if (!container) return null;
  const key = `${selector}|${indexAttribute}`;
  let containerEntries = readerContainerNodeCache.get(container);
  const existing = containerEntries?.get(key);
  if (existing && !existing.invalidated && existing.first.isConnected &&
      container.contains(existing.first) && existing.childCount === existing.root.childElementCount) return existing;
  const first = container?.querySelector(selector);
  if (!first) return null;
  const root = first.parentElement;
  let entries = readerNodeCache.get(root);
  if (!entries) {
    entries = new Map();
    readerNodeCache.set(root, entries);
  }
  let cached = entries.get(key);
  if (!cached || cached.invalidated || cached.first !== first || cached.childCount !== root.childElementCount) {
    const nodes = root.querySelectorAll(selector);
    const byIndex = new Map();
    let activeNode = null;
    for (const node of nodes) {
      const index = Number(node.getAttribute(indexAttribute));
      if (!byIndex.has(index)) byIndex.set(index, node);
      if (node.classList.contains("is-active")) activeNode = node;
    }
    cached = { root, first, nodes, byIndex, activeNode, childCount: root.childElementCount, invalidated: false };
    entries.set(key, cached);
  }
  if (!containerEntries) {
    containerEntries = new Map();
    readerContainerNodeCache.set(container, containerEntries);
  }
  containerEntries.set(key, cached);
  return cached;
}

function setCachedReaderActiveNode(cache, next) {
  if (!cache || cache.activeNode === next) return;
  cache.activeNode?.classList.remove("is-active");
  next?.classList.add("is-active");
  cache.activeNode = next;
}

function getCachedSubtitleData(body = clipState.subtitleBody) {
  if (!Array.isArray(body)) return { intervals: [], items: [], canBinarySearch: true, hasHourTimestamp: false };
  let cached = readingSubtitleCache.get(body);
  if (cached) return cached;
  const intervals = body.map((item, index) => {
    const from = Number(item?.from || 0) || 0;
    const rawTo = Number(item?.to || 0) || 0;
    return { index, from, rawTo, to: rawTo > from ? rawTo : from + 2 };
  });
  // Arbitrary ordering and overlaps must keep the original first-match rule.
  const canBinarySearch = intervals.every((item, index) =>
    Number.isFinite(item.from) && Number.isFinite(item.to) &&
    item.rawTo > item.from && (index === 0 || intervals[index - 1].to <= item.from)
  );
  const items = body.map((item, index) => ({
    index,
    from: Number(item?.from || 0) || 0,
    to: Number(item?.to || 0) || 0,
    content: String(item?.content || "").trim()
  })).filter((item) => item.content);
  const hasHourTimestamp = intervals.some((item) => Number.isFinite(item.rawTo) && item.rawTo >= 3600);
  cached = { intervals, items, canBinarySearch, hasHourTimestamp };
  readingSubtitleCache.set(body, cached);
  return cached;
}

function getCachedReadingTranscriptItems(body = clipState.subtitleBody) {
  return getCachedSubtitleData(body).items;
}

function getCachedReadingChapters(chapters = clipState.chapters) {
  if (!Array.isArray(chapters)) return [];
  let cached = readingChapterCache.get(chapters);
  if (!cached) {
    cached = normalizeChapters(chapters);
    readingChapterCache.set(chapters, cached);
  }
  return cached;
}

function stopTranscriptScroll(container) {
  if (!container) return;
  const until = Date.now() + 120;
  readerSessionState.programmaticScrollUntil = Math.max(readerSessionState.programmaticScrollUntil, until);
  nativeTranscriptState.programmaticScrollUntil = Math.max(nativeTranscriptState.programmaticScrollUntil, until);
  container.scrollTo({ top: container.scrollTop, left: container.scrollLeft, behavior: "instant" });
}

function captureTranscriptScrollAnchor(container, selector) {
  if (!container?.isConnected) return null;
  stopTranscriptScroll(container);
  const bounds = container.getBoundingClientRect();
  const headingHeight = container.querySelector(".blr-reading-transcript-heading")?.getBoundingClientRect().height || 0;
  const indexAttribute = selector === ".blr-native-transcript-segment"
    ? "data-native-transcript-index" : "data-index";
  const nodes = getReaderNodeCache(container, selector, indexAttribute)?.nodes;
  let node = null;
  if (nodes?.length) {
    // Both transcript templates use inline segments in document order. Their
    // bottom edges are monotonic even when one segment wraps onto several lines.
    const visibleTop = bounds.top + headingHeight;
    let low = 0;
    let high = nodes.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (nodes[mid].getBoundingClientRect().bottom <= visibleTop) low = mid + 1;
      else high = mid;
    }
    const candidate = nodes[low];
    const rect = candidate?.getBoundingClientRect();
    if (rect && rect.bottom > visibleTop && rect.top < bounds.bottom) node = candidate;
  }
  return {
    container, node, headingHeight,
    offset: node ? node.getBoundingClientRect().top - bounds.top : 0,
    scrollTop: container.scrollTop
  };
}

function transferTranscriptScrollAnchor(anchor, container, indexAttribute) {
  if (!anchor?.node || !container) return;
  const index = Number(anchor.node.dataset.index ?? anchor.node.dataset.nativeTranscriptIndex);
  if (!Number.isInteger(index) || index < 0) return;
  const selector = indexAttribute === "data-native-transcript-index"
    ? ".blr-native-transcript-segment" : ".blr-reading-complete-segment";
  const node = getReaderNodeCache(container, selector, indexAttribute)?.byIndex.get(index);
  if (!node) return;
  const headingHeight = container.querySelector(".blr-reading-transcript-heading")?.getBoundingClientRect().height || 0;
  restoreTranscriptScrollAnchor({
    container, node, scrollTop: container.scrollTop,
    offset: headingHeight + Math.max(0, anchor.offset - anchor.headingHeight)
  });
}

function restoreTranscriptScrollAnchor(anchor) {
  if (!anchor?.container.isConnected) return;
  const { container, node, offset, scrollTop } = anchor;
  const top = node?.isConnected && container.contains(node)
    ? container.scrollTop + node.getBoundingClientRect().top - container.getBoundingClientRect().top - offset
    : scrollTop;
  stopTranscriptScroll(container);
  container.scrollTo({ top: Math.max(0, top), behavior: "instant" });
}

function syncReadingViewPlayback(forceScroll = false) {
  if (!readerSessionState.open || readerSessionState.transition?.phase === "animating") {
    return;
  }

  const runtimeVideo = getRuntimeVideoElement();
  const runtimeHost = findReaderPlayerHost(runtimeVideo);
  if (runtimeVideo && runtimeHost) {
    const playerChanged =
      runtimeVideo !== readerPlayerState.videoEl || runtimeHost !== readerPlayerState.host;
    if (playerChanged) {
      queueEnsureReaderPlayerMounted();
    }
  }

  const video = bindReadingViewVideo(runtimeVideo || readerPlayerState.videoEl);
  if (!video) {
    renderReadingStatus("当前页面没有找到可联动的视频播放器。");
    return;
  }

  const currentTime = Number(video.currentTime || 0) || 0;
  const subtitleIndex = findActiveSubtitleIndex(currentTime);
  const chapterIndex = findActiveChapterIndex(currentTime);
  const changed =
    subtitleIndex !== readerSessionState.activeSubtitleIndex ||
    chapterIndex !== readerSessionState.activeChapterIndex;

  setActiveReadingItems(subtitleIndex, chapterIndex, forceScroll || changed);
  updateReaderFollowState();
  renderReadingStatus(`当前进度 ${formatCompactTimestamp(currentTime, currentTime >= 3600)}`);
}

function findActiveSubtitleIndex(currentTime) {
  const { intervals, canBinarySearch } = getCachedSubtitleData();
  if (canBinarySearch) {
    let low = 0;
    let high = intervals.length - 1;
    while (low <= high) {
      const mid = (low + high) >>> 1;
      const item = intervals[mid];
      if (currentTime < item.from) high = mid - 1;
      else if (currentTime >= item.to) low = mid + 1;
      else return currentTime >= item.from && currentTime < item.to ? item.index : -1;
    }
    return -1;
  }
  for (const item of intervals) {
    if (currentTime >= item.from && currentTime < item.to) return item.index;
  }
  return -1;
}

function findActiveChapterIndex(currentTime) {
  const chapters = getCachedReadingChapters();
  for (let index = 0; index < chapters.length; index += 1) {
    const item = chapters[index];
    const from = Number(item?.from || 0) || 0;
    const next = chapters[index + 1];
    const explicitTo = Number(item?.to || 0) || 0;
    const fallbackTo = next && Number(next.from) > from ? Number(next.from) : explicitTo;
    const to = fallbackTo > from ? fallbackTo : Number.POSITIVE_INFINITY;
    if (currentTime >= from && currentTime < to) {
      return index;
    }
  }
  return -1;
}

function setActiveReadingItems(subtitleIndex, chapterIndex, shouldScroll = false) {
  const transcriptChanged = subtitleIndex !== readerSessionState.activeSubtitleIndex;
  const chapterChanged = chapterIndex !== readerSessionState.activeChapterIndex;
  if (!transcriptChanged && !chapterChanged && !shouldScroll) return;
  const transcriptList = byId(ids.readingTranscriptList);
  const chapterList = byId(ids.readingChapterList);
  const transcriptCache = getReaderNodeCache(transcriptList, ".blr-reading-complete-segment");
  const chapterCache = getReaderNodeCache(chapterList, ".blr-reading-chapter");
  const nextTranscript = transcriptChanged || shouldScroll
    ? transcriptCache?.byIndex.get(subtitleIndex) || null : null;
  const nextChapter = chapterChanged || shouldScroll
    ? chapterCache?.byIndex.get(chapterIndex) || null : null;
  if (transcriptChanged) setCachedReaderActiveNode(transcriptCache, nextTranscript);
  if (chapterChanged) setCachedReaderActiveNode(chapterCache, nextChapter);

  if (shouldScroll) {
    if (document.body.hasAttribute("data-blr-reader-resizing") || Date.now() < readerSessionState.manualScrollPauseUntil) {
      updateReaderFollowState();
      readerSessionState.activeSubtitleIndex = subtitleIndex;
      readerSessionState.activeChapterIndex = chapterIndex;
      return;
    }
    const behavior = getReadingScrollBehavior();
    if (nextTranscript) {
      scrollReadingTranscriptItemIntoView(nextTranscript, behavior);
    }
    if (nextChapter) {
      scrollReadingRailItemIntoView(nextChapter, behavior);
    }
  }

  readerSessionState.activeSubtitleIndex = subtitleIndex;
  readerSessionState.activeChapterIndex = chapterIndex;
}

function getReadingScrollBehavior() {
  // "instant" also overrides smooth scrolling inherited from the host page.
  return readerSessionState.nextScrollBehavior === "auto" || !readerSessionState.ready ||
    readerSessionState.transition?.direction === "enter" ? "instant" : "smooth";
}

function scrollReadingRailItemIntoView(node, behavior = getReadingScrollBehavior()) {
  if (!node) {
    return;
  }
  readerSessionState.programmaticScrollUntil = Date.now() + (behavior === "instant" ? 120 : 600);
  node.scrollIntoView({
    behavior,
    block: "nearest",
    inline: "nearest"
  });
}

function scrollReadingTranscriptItemIntoView(node, behavior = getReadingScrollBehavior()) {
  if (!readerSessionState.open || !node) {
    return;
  }

  const transcriptList = byId(ids.readingTranscriptList);
  const inlineHost = document.getElementById("blr-reading-inline-host");
  const listRect = transcriptList.getBoundingClientRect();
  const itemRect = node.getBoundingClientRect();
  if (!(listRect.height > 0) || !(itemRect.height > 0)) {
    scrollReadingRailItemIntoView(node, behavior);
    return;
  }

  readerSessionState.programmaticScrollUntil = Date.now() + (behavior === "instant" ? 120 : 800);
  readerSessionState.nextScrollBehavior = "smooth";
  if (inlineHost && inlineHost.scrollHeight > inlineHost.clientHeight + 8) {
    const hostRect = inlineHost.getBoundingClientRect();
    const computed = window.getComputedStyle(node);
    const lineHeight = Number.parseFloat(computed.lineHeight) || itemRect.height || 32;
    const heading = document.getElementById("blr-reading-transcript-heading");
    const headingHeight = heading?.getBoundingClientRect?.().height || 38;
    const anchorRect = node.getBoundingClientRect();
    const desiredOffset = headingHeight + 8 + lineHeight * 2;
    const targetScrollTop =
      inlineHost.scrollTop + (anchorRect.top - hostRect.top) - desiredOffset;
    inlineHost.scrollTo({
      top: Math.max(0, Math.round(targetScrollTop)),
      behavior
    });
    return;
  }
  const desiredTop = listRect.top + Math.max(72, Math.min(listRect.height * 0.24, 220));
  const nextTop = window.scrollY + itemRect.top - desiredTop;
  window.scrollTo({
    top: Math.max(0, Math.round(nextTop)),
    behavior
  });
}

function jumpReadingTarget(seconds) {
  const video = bindReadingViewVideo();
  if (!video) {
    renderReadingStatus("当前页面没有找到可联动的视频播放器。");
    return;
  }

  const nextTime = Math.max(0, Number(seconds || 0) || 0);
  readerSessionState.manualScrollPauseUntil = 0;
  readerSessionState.nextScrollBehavior = "auto";
  updateReaderFollowState();
  video.currentTime = nextTime;
  if (video.paused) {
    video.play().catch(() => {});
  }
  syncReadingViewPlayback(true);
}

function onReadingChapterClick(event) {
  const target = event.target.closest(".blr-reading-chapter");
  if (!target) {
    return;
  }
  jumpReadingTarget(target.dataset.seconds);
}

async function onReadingCollectionClick(event) {
  const target = event.target.closest(".blr-reading-collection-item");
  if (!target || target.classList.contains("is-active") || readerSessionState.collectionSwitchInFlight) {
    return;
  }
  const bvid = String(target.dataset.bvid || "").trim();
  if (!/^BV[0-9A-Za-z]+$/.test(bvid)) {
    renderReadingStatus("无法读取这一集的视频地址。");
    return;
  }

  const pageIndex = Number(target.dataset.page || 0);
  const targetIndex = Number(target.dataset.index);
  const currentIndex = Number(clipState.collection?.currentIndex);
  const expectedSignature = [bvid, pageIndex > 0 ? pageIndex : 1].join("|");
  readerSessionState.collectionSwitchInFlight = true;
  target.setAttribute("aria-busy", "true");
  renderReadingStatus("正在使用播放器原生逻辑切换选集...");

  try {
    const nativeTriggered = triggerNativeCollectionSwitch({
      currentIndex,
      targetIndex,
      bvid,
      pageIndex,
      cid: String(clipState.collection?.episodes?.[targetIndex]?.cid || "")
    });
    if (nativeTriggered && (await waitForClipSignature(expectedSignature, 4500))) {
      return;
    }

    renderReadingStatus("原生切集未响应，正在使用兼容方式切换...");
    setReadingViewReady(false);
    const nextUrl = new URL(`https://www.bilibili.com/video/${bvid}/`);
    if (pageIndex > 1) {
      nextUrl.searchParams.set("p", String(pageIndex));
    }
    nextUrl.searchParams.set("bilibli_reader", "1");
    location.assign(nextUrl.toString());
  } finally {
    readerSessionState.collectionSwitchInFlight = false;
    target.removeAttribute("aria-busy");
  }
}

function triggerNativeCollectionSwitch({ currentIndex, targetIndex, bvid, pageIndex, cid }) {
  const offset = targetIndex - currentIndex;
  if (Math.abs(offset) === 1) {
    const control = findNativePlayerEpisodeControl(offset < 0 ? "previous" : "next");
    if (activateNativeCollectionTarget(control)) {
      return true;
    }
  }

  const episodeTarget = findNativeCollectionEpisodeTarget({ bvid, pageIndex, cid });
  return activateNativeCollectionTarget(episodeTarget);
}

function findNativePlayerEpisodeControl(direction) {
  const isPrevious = direction === "previous";
  const selectors = isPrevious
    ? [
        ".bpx-player-ctrl-prev",
        ".bpx-player-ctrl-prev-btn",
        ".bilibili-player-video-btn-prev",
        "[aria-label*='上一集']",
        "[title*='上一集']",
        "[data-text*='上一集']"
      ]
    : [
        ".bpx-player-ctrl-next",
        ".bpx-player-ctrl-next-btn",
        ".bilibili-player-video-btn-next",
        "[aria-label*='下一集']",
        "[title*='下一集']",
        "[data-text*='下一集']"
      ];
  const roots = [getReaderControlsRoot(), getReaderPlayerWrapNode(), readerPlayerState.host, document].filter(
    Boolean
  );

  for (const root of roots) {
    for (const selector of selectors) {
      const node = root.querySelector?.(selector);
      if (isUsableNativeCollectionTarget(node)) {
        return node;
      }
    }
  }
  return null;
}

function findNativeCollectionEpisodeTarget({ bvid, pageIndex = 0, cid = "" }) {
  const safeBvid = String(bvid || "").trim();
  const safeCid = String(cid || "").trim();
  const safePageIndex = Number(pageIndex || 0);
  const candidates = Array.from(
    document.querySelectorAll("a[href], [data-page], [data-p], [data-cid]")
  ).filter((node) => !node.closest(`#${ids.root}`));

  const byCid = safeCid
    ? candidates.find(
        (node) => String(node.dataset?.cid || node.getAttribute("data-cid") || "").trim() === safeCid
      )
    : null;
  if (byCid) {
    return byCid;
  }

  const byHref = candidates.find((node) => {
      const href = String(node.getAttribute("href") || "").trim();
      if (!href) {
        return false;
      }
      try {
        const url = new URL(href, location.href);
        const hrefBvid = extractBvid(url.toString());
        const hrefPage = extractPageIndex(url.toString());
        return hrefBvid === safeBvid && (!safePageIndex || hrefPage === safePageIndex);
      } catch {
        return false;
      }
    });
  if (byHref) {
    return byHref;
  }

  if (safePageIndex <= 0) {
    return null;
  }
  return (
    candidates.find((node) => {
      const inNativeEpisodeList = node.closest?.(
        ".video-pod, .multi-page, .cur-list, [class*='video-pod'], [class*='multi-page'], [class*='part-list']"
      );
      const nodePage = Number(node.dataset?.page || node.dataset?.p || 0);
      return Boolean(inNativeEpisodeList) && nodePage === safePageIndex;
    }) || null
  );
}

function isUsableNativeCollectionTarget(node) {
  if (!node || !node.isConnected || node.closest?.(`#${ids.root}`)) {
    return false;
  }
  return !(
    node.disabled ||
    node.getAttribute?.("aria-disabled") === "true" ||
    node.classList?.contains("disabled") ||
    node.classList?.contains("is-disabled")
  );
}

function activateNativeCollectionTarget(node) {
  if (!isUsableNativeCollectionTarget(node)) {
    return false;
  }
  try {
    node.click();
    return true;
  } catch (error) {
    logWarn("[BOC] native collection switch failed", error);
    return false;
  }
}

async function waitForClipSignature(expectedSignature, timeoutMs = 4500) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (computeCurrentClipSignature() === expectedSignature) {
      return true;
    }
    await sleep(100);
  }
  return false;
}

function onReadingTranscriptClick(event) {
  const target = event.target.closest(".blr-reading-complete-segment");
  if (!target) {
    return;
  }
  // Don't jump if user is selecting text
  if (window.getSelection()?.toString().trim()) {
    return;
  }
  jumpReadingTarget(target.dataset.seconds);
}

function noteManualReaderInteraction(durationMs = 3000) {
  readerSessionState.manualScrollPauseUntil = Date.now() + durationMs;
  updateReaderFollowState();
}

function updateReaderFollowState() {
  const readingView = document.getElementById(ids.readingView);
  if (!readingView) {
    return;
  }
  const mode = Date.now() < readerSessionState.manualScrollPauseUntil ? "manual" : "auto";
  readingView.setAttribute("data-blr-reader-follow", mode);
}

function computeCurrentClipSignature(url = location.href) {
  if (isYouTubePage(url)) return `youtube|${extractYouTubeVideoId(url)}`;
  const bvid = extractBvid(url);
  const page = extractPageIndex(url);
  return [bvid, page].map((item) => String(item || "").trim()).join("|");
}

function toReadableText(value, fallback = "") {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (!text || text === "[object Object]") {
      return fallback;
    }
    return text;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    const json = JSON.stringify(value);
    if (json && json !== "{}") {
      return json;
    }
  } catch {
    // ignore
  }
  const text = String(value);
  if (!text || text === "[object Object]") {
    return fallback;
  }
  return text;
}

function getErrorMessage(error, fallback = "未知错误") {
  const code = toReadableText(error?.code, "");
  const message = toReadableText(error?.message, "");
  if (message) {
    return code ? `${message} (code: ${code})` : message;
  }
  if (code) {
    return `code: ${code}`;
  }
  return toReadableText(error, fallback);
}

function sendRuntimeMessage(message) {
  return new Promise((resolve) => chrome.runtime.sendMessage(message, resolve));
}

async function getSettings() {
  try {
    const response = await sendRuntimeMessage({ type: "get-settings" });
    if (!response?.ok) {
      return { ...DEFAULT_SETTINGS };
    }
    const migration = migrateReaderDefaults(response.settings || {});
    if (migration.changed) {
      await sendRuntimeMessage({ type: "save-settings", settings: migration.settings }).catch(() => {});
    }
    return migration.settings;
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
}

async function refreshOpenReadingView(statusText, runId = clipState.fetchRunId, request = null) {
  const sessionId = readerSessionState.id;
  if ((request && !isSubtitleRequestActive(request)) || !isRunActive(runId) || !isReaderSessionActive(sessionId)) {
    return;
  }

  // Updating subtitle data does not make an already stable player unready.
  // Hiding the shell here made a direct-reader reload flash a second time.
  if (!isReaderPresentationStable()) setReadingViewReady(false);
  const readingView = document.getElementById(ids.readingView);
  if (!readingView?.classList.contains("open")) openReaderViewShell(readingView);
  let mounted = false;
  try {
    mounted = await ensureReaderPlayerMounted({ retries: 24, delayMs: 120, forceLayout: true });
  } catch (error) {
    if (!isReaderSessionActive(sessionId) || !isRunActive(runId) ||
      (request && !isSubtitleRequestActive(request))) return;
    logWarn("[BOC] failed to remount reader after clip change", error);
  }
  if ((request && !isSubtitleRequestActive(request)) || !isRunActive(runId) || !isReaderSessionActive(sessionId)) {
    return;
  }

  moveReadingMainInline();
  applyReaderPageFocus();
  renderReadingView();
  renderReadingStatus(statusText);
  startReadingViewSync();
  startReaderPlayerObserver();
  if (mounted) {
    layoutReaderPlayerHost();
    settleReaderModePresentation();
  } else {
    scheduleReaderPlayerRetry();
  }
  syncReadingViewPlayback(true);
}

function migrateReaderDefaults(savedSettings) {
  const saved = savedSettings && typeof savedSettings === "object" ? savedSettings : {};
  const merged = { ...DEFAULT_SETTINGS, ...saved };
  let removedLegacySettings = false;
  for (const key of [
    "readerTranscriptMode", "readerVideoHeightPx", "readerChapterVisibility",
    "readerTimestampVisible", "readerChapterVisible", "readerTranscriptVisible",
    "enablePlayerAiQuickAction", "playerAiQuickPrompt"
  ]) {
    if (Object.hasOwn(merged, key)) {
      delete merged[key];
      removedLegacySettings = true;
    }
  }
  const savedDefaultsVersion = Number(saved.readerDefaultsVersion || 0);
  if (savedDefaultsVersion >= 3) {
    return { settings: merged, changed: removedLegacySettings };
  }

  const legacyDefaults = {
    readerFontScale: "m",
    readerFontWeight: "normal",
    readerLetterSpacing: "normal",
    readerLineHeight: "tight"
  };
  const keys = Object.keys(legacyDefaults);
  const usesLegacyDefaults = keys.every(
    (key) => saved[key] === undefined || saved[key] === legacyDefaults[key]
  );

  if (savedDefaultsVersion < 2 && usesLegacyDefaults) {
    merged.readerFontScale = DEFAULT_SETTINGS.readerFontScale;
    merged.readerFontWeight = DEFAULT_SETTINGS.readerFontWeight;
    merged.readerLetterSpacing = DEFAULT_SETTINGS.readerLetterSpacing;
    merged.readerLineHeight = DEFAULT_SETTINGS.readerLineHeight;
  }

  merged.readerDefaultsVersion = 3;
  return { settings: merged, changed: true };
}

function byId(id) {
  const node = document.getElementById(id);
  if (!node) {
    throw new Error(`Missing node: ${id}`);
  }
  return node;
}

function extractBvid(url) {
  const match = url.match(/\/video\/(BV[0-9A-Za-z]+)/);
  if (match?.[1]) {
    return match[1];
  }

  try {
    const parsed = new URL(url);
    const fromQuery = String(parsed.searchParams.get("bvid") || "").trim();
    if (/^BV[0-9A-Za-z]+$/.test(fromQuery)) {
      return fromQuery;
    }
  } catch {
    // ignore invalid URL
  }

  return "";
}

function cleanVideoUrl(href = location.href) {
  try {
    const parsed = new URL(href);
    if (parsed.hostname !== "www.bilibili.com") {
      return href;
    }

    if (parsed.pathname === "/list/watchlater" || parsed.pathname === "/list/watchlater/") {
      const bvid = extractBvid(href);
      if (bvid) {
        return `https://www.bilibili.com/video/${bvid}/`;
      }
      return href;
    }

    const bvid = extractBvid(href);
    if (!bvid) {
      return href;
    }
    const p = parsed.searchParams.get("p");
    const qs = p ? `?p=${encodeURIComponent(p)}` : "";
    return `https://www.bilibili.com/video/${bvid}/${qs}`;
  } catch {
    return href;
  }
}

function extractPageIndex(url) {
  try {
    const page = Number(new URL(url).searchParams.get("p") || "1");
    if (!Number.isFinite(page) || page <= 0) {
      return 1;
    }
    return page;
  } catch {
    return 1;
  }
}

function hasExplicitPageParam(url) {
  try {
    return new URL(url).searchParams.has("p");
  } catch {
    return false;
  }
}

function extractOid(url) {
  try {
    return String(new URL(url).searchParams.get("oid") || "").trim();
  } catch {
    return "";
  }
}

function isRunActive(runId) {
  return (
    runId === clipState.fetchRunId &&
    clipState.fetchClipSignature === computeCurrentClipSignature()
  );
}

function ensureRunActive(runId) {
  if (!isRunActive(runId)) {
    const error = new Error("Stale refresh run");
    error.code = "STALE_RUN";
    throw error;
  }
}

function isStaleRunError(error) {
  return error?.code === "STALE_RUN";
}

async function retryAsync(task, retries = 1, delayMs = 180) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      // 如果不是网络错误也不是可重试的业务错误，立即抛出
      const isNetworkError = isRetryableNetworkError(error);
      const isRetryable = error?.retryable === true;
      if (!isNetworkError && !isRetryable) {
        throw error;
      }
      if (attempt >= retries) {
        throw error;
      }
      // 指数退避：delayMs * 2^(attempt-1)，最多等待 5 秒
      const backoffDelay = Math.min(delayMs * Math.pow(2, attempt - 1), 5000);
      logInfo(`[BOC] retrying after ${backoffDelay}ms, attempt ${attempt + 1}/${retries}`, {
        error: getErrorMessage(error),
        code: error.code
      });
      await sleep(backoffDelay);
    }
  }
  throw lastError || new Error("Unknown retry error");
}

function isRetryableNetworkError(error) {
  const message = getErrorMessage(error, "").toLowerCase();
  if (!message) {
    return false;
  }

  if (message.includes("http ")) {
    return true;
  }

  return (
    message.includes("请求失败") ||
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("networkerror") ||
    message.includes("net::") ||
    message.includes("background fetch failed") ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

async function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchVideoMeta(bvid) {
  const url = `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`;
  logInfo("[BOC] fetch video meta", { url, bvid });
  const payload = await fetchJson(url);
  if (payload.code !== 0) {
    throw new Error(toReadableText(payload?.message, "无法获取视频信息"));
  }

  const data = payload.data || {};
  const pubdate = Number(data.pubdate || 0);
  const uploadDate = pubdate > 0 ? formatLocalDate(pubdate * 1000) : "";
  const pages = Array.isArray(data.pages) ? data.pages : [];

  return {
    aid: data.aid ? String(data.aid) : "",
    title: String(data.title || ""),
    author: String(data.owner?.name || ""),
    uploadDate,
    defaultCid: data.cid ? String(data.cid) : "",
    defaultDuration: Number(data.duration || 0) || 0,
    subtitleTracks: mapSubtitleTracks(data.subtitle?.list || [], "video-meta").map((track) => ({
      ...track,
      cid: track.cid || String(data.cid || "")
    })),
    collection: mapVideoCollection(data, bvid),
    pages: pages.map((item) => ({
      cid: String(item.cid || ""),
      page: Number(item.page || 0) || 0,
      part: String(item.part || "").trim(),
      duration: Number(item.duration || 0) || 0
    }))
  };
}

function mapVideoCollection(data, currentBvid = "") {
  const pages = Array.isArray(data?.pages) ? data.pages : [];
  if (pages.length > 1) {
    return {
      id: String(currentBvid || ""),
      type: "pages",
      title: String(data?.title || "选集").trim() || "选集",
      currentIndex: -1,
      episodes: pages.map((page, index) => ({
        aid: String(data?.aid || ""),
        bvid: String(currentBvid || "").trim(),
        cid: String(page?.cid || ""),
        page: Number(page?.page || 0) || index + 1,
        title: String(page?.part || "").trim()
      }))
    };
  }

  const rawCollection = data?.ugc_season;
  const sections = Array.isArray(rawCollection?.sections) ? rawCollection.sections : [];
  const episodes = sections
    .flatMap((section) => (Array.isArray(section?.episodes) ? section.episodes : []))
    .map((episode) => ({
      aid: String(episode?.aid || episode?.arc?.aid || ""),
      bvid: String(episode?.bvid || episode?.arc?.bvid || "").trim(),
      cid: String(episode?.cid || episode?.arc?.cid || ""),
      page: 0,
      title: String(episode?.title || episode?.arc?.title || "").trim()
    }))
    .filter((episode) => /^BV[0-9A-Za-z]+$/.test(episode.bvid));

  if (episodes.length <= 1) {
    return null;
  }

  return {
    id: String(rawCollection?.id || ""),
    type: "ugc-season",
    title: String(rawCollection?.title || "合集").trim() || "合集",
    currentIndex: -1,
    episodes
  };
}

function resolveVideoCollectionCurrent(collection, { bvid = "", aid = "", pageIndex = 1 } = {}) {
  const episodes = Array.isArray(collection?.episodes) ? collection.episodes : [];
  if (episodes.length <= 1) {
    return null;
  }

  const safeBvid = String(bvid || "").trim();
  const safeAid = String(aid || "").trim();
  const currentIndex = episodes.findIndex((episode) => {
    if (collection.type === "pages") {
      return Number(episode.page) === Number(pageIndex);
    }
    return episode.bvid === safeBvid || (safeAid && episode.aid === safeAid);
  });

  return { ...collection, currentIndex };
}

function pickPageFromPages(pages, pageIndex) {
  const safePageIndex = Number(pageIndex) > 0 ? Number(pageIndex) : 1;
  const safePages = Array.isArray(pages) ? pages : [];
  const pageByIndex = safePages[safePageIndex - 1];
  if (pageByIndex?.cid) {
    return pageByIndex;
  }

  const pageByNo = safePages.find((item) => Number(item.page) === safePageIndex);
  if (pageByNo?.cid) {
    return pageByNo;
  }

  return null;
}

function pickCidFromPages(pages, pageIndex, fallbackCid = "") {
  const matchedPage = pickPageFromPages(pages, pageIndex);
  if (matchedPage?.cid) {
    return String(matchedPage.cid);
  }

  const safePages = Array.isArray(pages) ? pages : [];
  if (safePages[0]?.cid) {
    return String(safePages[0].cid);
  }

  if (fallbackCid) {
    return String(fallbackCid);
  }

  throw new Error("没有找到当前分P的 CID。");
}

function pickPageIndexFromOid(pages, oid) {
  const safeOid = String(oid || "").trim();
  if (!safeOid) {
    return 0;
  }

  const safePages = Array.isArray(pages) ? pages : [];
  const pageByCid = safePages.find((item) => String(item?.cid || "") === safeOid);
  if (pageByCid?.page) {
    return Number(pageByCid.page) || 0;
  }

  return 0;
}

function pickDurationFromPages(pages, pageIndex, fallbackDuration = 0) {
  const matchedPage = pickPageFromPages(pages, pageIndex);
  if (Number(matchedPage?.duration) > 0) {
    return Number(matchedPage.duration);
  }

  const safePages = Array.isArray(pages) ? pages : [];
  if (Number(safePages[0]?.duration) > 0) {
    return Number(safePages[0].duration);
  }

  return Number(fallbackDuration || 0) || 0;
}

function readVideoTitle() {
  const h1 = document.querySelector("h1.video-title");
  if (h1?.textContent?.trim()) {
    return h1.textContent.trim();
  }

  const metaTitle = document.querySelector('meta[property="og:title"]');
  if (metaTitle?.getAttribute("content")) {
    return metaTitle.getAttribute("content").trim();
  }

  return document.title.replace(/_哔哩哔哩_bilibili/i, "").trim();
}

function readVideoAuthor() {
  const owner = document.querySelector(".up-name");
  if (owner?.textContent?.trim()) {
    return owner.textContent.trim();
  }

  const author = document.querySelector('meta[name="author"]');
  return author?.getAttribute("content")?.trim() || "";
}

function readUploadDate() {
  const publishNode = document.querySelector('meta[itemprop="uploadDate"]');
  if (publishNode?.getAttribute("content")) {
    return publishNode.getAttribute("content").trim();
  }

  const dateText = document.querySelector(".pubdate-ip-text")?.textContent?.trim();
  if (dateText) {
    return dateText;
  }

  return formatLocalDate();
}

async function fetchSubtitleBundle(bvid, cid, aid = "", knownTracks = []) {
  const requests = buildSubtitleInfoRequests({ bvid, cid, aid });
  const fetchByRequest = async (request, requireVerifiedOwner = false) => {
    logInfo("[BOC] fetch subtitles list", {
      source: request.source,
      url: request.url,
      bvid,
      cid,
      aid
    });

    const payload = await fetchJson(request.url);
    logInfo("[BOC] subtitles API raw response", { source: request.source, payload });
    if (payload.code !== 0) {
      throw buildBiliApiError(payload, "无法获取字幕列表");
    }
    validateSubtitleResponseIdentity(payload.data, { bvid, cid, aid });

    const chapters = mapChaptersFromPlayerData(payload.data);
    const subtitles = mapSubtitleTracks(payload.data?.subtitle?.subtitles || [], request.source);
    const withUrl = subtitles.filter((item) => {
      if (!item.subtitleUrl) {
        return false;
      }
      if (!isSubtitleTrackForVideo(item, { aid, cid, knownTracks, requireVerifiedOwner })) {
        logWarn("[BOC] rejected subtitle track without matching video ownership", {
          source: request.source,
          subtitleId: item.id,
          bvid,
          cid
        });
        return false;
      }
      return true;
    });
    return { source: request.source, chapters, withUrl };
  };

  if (requests.length === 0) {
    return { tracks: [], chapters: [] };
  }

  const primaryRequest = requests[0];
  try {
    const primaryResult = await fetchByRequest(primaryRequest);
    if (primaryResult.withUrl.length === 0 && requests.length > 1) {
      // 主接口为空时，只接受能从轨道路径或视频元数据验证归属的备用字幕。
      // 备用接口失败不能把已经成功返回的空结果变成“加载错误”。
      try {
        const secondaryResult = await fetchByRequest(requests[1], true);
        if (secondaryResult.withUrl.length > 0) {
          return {
            tracks: secondaryResult.withUrl,
            chapters: primaryResult.chapters.length ? primaryResult.chapters : secondaryResult.chapters
          };
        }
      } catch (error) {
        logWarn("[BOC] fallback subtitle verification failed after empty primary", {
          source: requests[1].source,
          message: getErrorMessage(error)
        });
      }
    }
    return { tracks: primaryResult.withUrl, chapters: primaryResult.chapters };
  } catch (primaryError) {
    logWarn("[BOC] subtitles API request failed", {
      source: primaryRequest.source,
      message: getErrorMessage(primaryError)
    });

    // 仅当主来源请求失败时才尝试次来源。
    if (requests.length > 1) {
      const secondaryRequest = requests[1];
      try {
        const secondaryResult = await fetchByRequest(secondaryRequest, true);
        if (secondaryResult.withUrl.length > 0) {
          logWarn("[BOC] primary subtitles source failed, using fallback source", {
            primary: primaryRequest.source,
            fallback: secondaryRequest.source
          });
          return { tracks: secondaryResult.withUrl, chapters: secondaryResult.chapters };
        }
        return { tracks: [], chapters: secondaryResult.chapters };
      } catch (secondaryError) {
        logWarn("[BOC] fallback subtitles source failed", {
          source: secondaryRequest.source,
          message: getErrorMessage(secondaryError)
        });
        throw secondaryError;
      }
    }

    throw primaryError;
  }
}

function validateSubtitleResponseIdentity(data, { bvid, cid, aid }) {
  const expected = { bvid, cid, aid };
  const invalid = !data || !data.cid ||
    Object.entries(expected).some(([key, value]) => {
      return value && data[key] !== undefined && String(data[key]) !== String(value);
    });
  if (invalid) {
    const error = new Error("字幕接口返回的视频身份不匹配。");
    error.code = "SUBTITLE_RESPONSE_IDENTITY_MISMATCH";
    error.retryable = true;
    throw error;
  }
}

function isSubtitleTrackForVideo(track, { aid, cid, knownTracks = [], requireVerifiedOwner = false }) {
  try {
    const path = new URL(track.subtitleUrl).pathname;
    // 已观察到的 prod AI 字幕路径以 aid+cid 开头；其他路径不作格式假设。
    const match = path.match(/^\/bfs\/ai_subtitle\/prod\/(\d{16,})/);
    if (match && aid && cid) {
      return match[1].startsWith(`${aid}${cid}`);
    }
  } catch {
    return false;
  }
  if (knownTracks.some((known) => {
    if (known.cid !== String(cid)) {
      return false;
    }
    return (track.id && known.id === track.id) ||
      (known.subtitleUrl &&
        normalizeSubtitleUrlForCache(known.subtitleUrl) === normalizeSubtitleUrlForCache(track.subtitleUrl));
  })) {
    return true;
  }
  return !requireVerifiedOwner;
}

function buildSubtitleInfoRequests({ bvid, cid, aid }) {
  const safeBvid = encodeURIComponent(String(bvid || ""));
  const safeCid = encodeURIComponent(String(cid || ""));
  const safeAid = encodeURIComponent(String(aid || ""));
  const requests = [];

  // 参考 SubBatch：优先用 aid+cid 的 wbi 接口作为主来源。
  if (aid) {
    requests.push({
      source: "player-wbi-v2",
      url:
        "https://api.bilibili.com/x/player/wbi/v2" +
        `?aid=${safeAid}` +
        `&cid=${safeCid}` +
        (bvid ? `&bvid=${safeBvid}` : "")
    });
  }

  // 仅在主来源不可用时再回退到 player-v2。
  requests.push({
    source: "player-v2",
    url:
      "https://api.bilibili.com/x/player/v2" +
      (bvid ? `?bvid=${safeBvid}` : "?") +
      `${bvid ? "&" : ""}cid=${safeCid}` +
      (aid ? `&aid=${safeAid}` : "")
  });

  return requests;
}

function buildBiliApiError(payload, fallbackMessage) {
  const msg = toReadableText(payload?.message, fallbackMessage);
  const error = new Error(msg);
  error.code = payload?.code;
  error.retryable = isRetryableError(payload?.code);
  return error;
}

function mapSubtitleTracks(subtitles, source = "unknown") {
  return (subtitles || []).map((item) => ({
    id: String(item?.id_str || item?.id || ""),
    cid: String(item?.cid || ""),
    lan: item?.lan || "",
    lanDoc: item?.lan_doc || "",
    subtitleUrl: normalizeSubtitleUrl(item?.subtitle_url || ""),
    source
  }));
}

function mapChaptersFromPlayerData(data) {
  const raw = Array.isArray(data?.view_points) ? data.view_points : [];
  return normalizeChapters(
    raw.map((item) => ({
      title: String(item?.content || item?.title || item?.label || "").trim(),
      from: normalizeChapterTime(item?.from ?? item?.start ?? item?.start_time),
      to: normalizeChapterTime(item?.to ?? item?.end ?? item?.end_time),
      source: "player-view-points"
    }))
  );
}

function normalizeChapterTime(value) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return 0;
  }

  // 某些接口会返回毫秒级时间戳，这里统一转换成秒。
  return num > 60 * 60 * 24 ? num / 1000 : num;
}

function normalizeChapters(chapters) {
  const normalized = (chapters || [])
    .map((item) => ({
      title: String(item?.title || "").trim(),
      from: Number(item?.from || 0) || 0,
      to: Number(item?.to || 0) || 0,
      source: String(item?.source || "")
    }))
    .filter((item) => item.title && item.from >= 0)
    .sort((a, b) => a.from - b.from);

  const unique = [];
  const seen = new Set();
  normalized.forEach((item) => {
    const key = `${Math.floor(item.from * 10)}|${item.title.toLowerCase()}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    unique.push(item);
  });

  return unique;
}

function isRetryableError(code) {
  // -509: 请求过于频繁
  // -3: 参数错误（可能是临时性的）
  // 其他负数错误码也可能是临时性的
  return code === -509 || code === -3 || code < 0;
}

function normalizeSubtitleTracks(subtitles) {
  return [...(subtitles || [])].sort((a, b) => {
    const p = subtitlePriority(a) - subtitlePriority(b);
    if (p !== 0) {
      return p;
    }

    const lanA = String(a.lanDoc || a.lan || "").toLowerCase();
    const lanB = String(b.lanDoc || b.lan || "").toLowerCase();
    if (lanA < lanB) {
      return -1;
    }
    if (lanA > lanB) {
      return 1;
    }

    const idA = Number.parseInt(String(a.id || "0"), 10);
    const idB = Number.parseInt(String(b.id || "0"), 10);
    if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) {
      return idA - idB;
    }

    return String(a.subtitleUrl).localeCompare(String(b.subtitleUrl));
  });
}

function pickPreferredSubtitle(
  subtitles,
  { previousId = "", previousUrl = "", previousLang = "" } = {}
) {
  const tracks = subtitles || [];
  if (tracks.length === 0) {
    return null;
  }

  // 先按轨道 id 复用，最稳定
  if (previousId) {
    const byId = tracks.find((item) => String(item.id || "") === String(previousId));
    if (byId) {
      return byId;
    }
  }

  // 其次按 URL 路径复用（忽略 auth_key 等动态参数）
  const prevUrlKey = normalizeSubtitleUrlForCache(previousUrl);
  if (prevUrlKey) {
    const byUrl = tracks.find(
      (item) => normalizeSubtitleUrlForCache(item.subtitleUrl) === prevUrlKey
    );
    if (byUrl) {
      return byUrl;
    }
  }

  const normalizedPrevLang = String(previousLang || "").trim().toLowerCase();
  if (normalizedPrevLang) {
    const byLang = tracks.find((item) => {
      const label = String(item.lanDoc || item.lan || "").trim().toLowerCase();
      return label === normalizedPrevLang;
    });
    if (byLang) {
      return byLang;
    }
  }

  // 默认直接拿排序后的第一条：中文优先，其次英文。
  return tracks[0];
}

function buildSubtitleCandidates(subtitles, preferred) {
  const tracks = subtitles || [];
  const seen = new Set();
  const list = [];

  const pushUnique = (item) => {
    if (!item) {
      return;
    }
    const key =
      `${String(item.id || "").trim()}|` +
      `${normalizeSubtitleUrlForCache(item.subtitleUrl)}|` +
      `${String(item.lan || "").trim().toLowerCase()}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    list.push(item);
  };

  pushUnique(preferred);
  for (const item of tracks) {
    pushUnique(item);
  }
  return list;
}

async function tryLoadSubtitleCandidates(candidates, runId, forceRefresh, request) {
  let lastError = null;
  let lastLoadError = null;
  for (const item of candidates || []) {
    ensureSubtitleRequestActive(request);
    try {
      logInfo("[BOC] try subtitle track", {
        id: item.id,
        lan: item.lan,
        lanDoc: item.lanDoc,
        url: item.subtitleUrl
      });
      await loadSubtitle(
        item.subtitleUrl,
        item.lanDoc || item.lan || "unknown",
        runId,
        item.id,
        forceRefresh,
        request
      );
      ensureSubtitleRequestActive(request);
      return item;
    } catch (error) {
      ensureSubtitleRequestActive(request);
      lastError = error;
      if (!isUnavailableSubtitleError(error)) {
        lastLoadError = error;
      }
      const reasonCode = toReadableText(error?.code, "");
      const reasonMessage = getErrorMessage(error, "unknown");
      const meta = {
        id: item.id,
        lan: item.lan,
        lanDoc: item.lanDoc,
        reason: reasonCode || reasonMessage
      };
      if (reasonCode === "SUBTITLE_DURATION_MISMATCH") {
        logInfo(`[BOC] subtitle track skipped ${JSON.stringify(meta)}`);
      } else {
        logWarn(`[BOC] subtitle track rejected ${JSON.stringify(meta)}`);
      }
      continue;
    }
  }

  if (lastLoadError) {
    throw lastLoadError;
  }
  const error = new Error("当前视频没有可用字幕。");
  error.code = "NO_USABLE_SUBTITLE";
  error.cause = lastError;
  throw error;
}

function isUnavailableSubtitleError(error) {
  return ["SUBTITLE_EMPTY", "SUBTITLE_DURATION_MISMATCH", "NO_USABLE_SUBTITLE"].includes(error?.code);
}

function subtitlePriority(item) {
  const lan = String(item?.lan || "").toLowerCase();
  const label = String(item?.lanDoc || "").toLowerCase();

  // 优先级：中文（包含 AI 中文）-> 英文 -> 其他
  if (lan === "zh-cn" || lan === "zh-hans") {
    return 0;
  }
  if (lan === "zh") {
    return 1;
  }
  if (lan.includes("zh")) {
    return 2;
  }
  if (label.includes("中文")) {
    return 3;
  }

  if (lan === "en" || lan === "en-us" || lan === "en-gb") {
    return 10;
  }
  if (lan.includes("en")) {
    return 11;
  }
  if (label.includes("英文") || label.includes("英语") || label.includes("english")) {
    return 12;
  }

  return 50;
}

function validateSubtitleByDuration(body, videoDuration) {
  const duration = Number(videoDuration || 0);
  if (!Array.isArray(body) || body.length === 0) {
    return { ok: false, reason: "empty", videoDuration: duration, maxTo: 0 };
  }

  let maxTo = 0;
  for (const item of body) {
    const to = Number(item?.to);
    const from = Number(item?.from);
    if (Number.isFinite(to) && to > maxTo) {
      maxTo = to;
    }
    if (Number.isFinite(from) && from > maxTo) {
      maxTo = from;
    }
  }

  if (!(duration > 0)) {
    return { ok: true, reason: "skip-no-video-duration", videoDuration: duration, maxTo };
  }

  const upperTolerance = Math.max(12, duration * 0.15);
  if (maxTo > duration + upperTolerance) {
    return { ok: false, reason: "too-long", videoDuration: duration, maxTo };
  }

  let minCoverageRatio = 0;
  if (duration >= 600) {
    minCoverageRatio = 0.18;
  } else if (duration >= 300) {
    minCoverageRatio = 0.22;
  } else if (duration >= 180) {
    minCoverageRatio = 0.25;
  }

  if (minCoverageRatio > 0 && maxTo < duration * minCoverageRatio) {
    return { ok: false, reason: "too-short", videoDuration: duration, maxTo };
  }

  return { ok: true, reason: "ok", videoDuration: duration, maxTo };
}

function readRuntimeVideoDuration() {
  const video = getRuntimeVideoElement();
  const duration = Number(video?.duration);
  if (Number.isFinite(duration) && duration > 0) {
    return duration;
  }
  return 0;
}

async function fetchSubtitleBody(url) {
  if (isYouTubePage()) return { body: await fetchYouTubeSubtitleBody(url) };
  logInfo("[BOC] fetch subtitle body", { url });
  return fetchJson(url);
}

async function fetchJson(url) {
  const response = await sendRuntimeMessage({ type: "fetch-json", url });
  if (!response?.ok) {
    throw new Error(toReadableText(response?.error, "网络请求失败"));
  }
  return response.data;
}
let readerHtmlPolicy = null;

function readerHtml(html) {
  // YouTube enforces Trusted Types. Keep this policy private to the reader;
  // generated markup still escapes every video/subtitle-derived string.
  const types = isYouTubePage() ? getYouTubePageWindow().trustedTypes : null;
  if (!types) return html;
  if (!readerHtmlPolicy) readerHtmlPolicy = types.createPolicy("bilibli-reader", {
    createHTML: (value) => value
  });
  return readerHtmlPolicy.createHTML(html);
}

function normalizeSubtitleUrl(url) {
  if (!url) {
    return "";
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url.replace(/^\/+/, "")}`;
}

function formatCompactTimestamp(seconds, withHours) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const hour = Math.floor(safe / 3600);
  const minute = Math.floor((safe % 3600) / 60);
  const second = safe % 60;

  if (withHours) {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(
      second
    ).padStart(2, "0")}`;
  }

  const totalMinutes = Math.floor(safe / 60);
  return `${String(totalMinutes).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

const subtitleLanguageSelectCache = new WeakMap();

function syncSubtitleLanguageSelect(select) {
  if (!select) return;
  const selectedUrlKey = normalizeSubtitleUrlForCache(clipState.selectedSubtitleUrl);
  const previous = subtitleLanguageSelectCache.get(select);
  if (!previous || previous.tracks !== clipState.subtitles ||
      previous.selectedId !== clipState.selectedSubtitleId || previous.selectedUrl !== selectedUrlKey) {
    select.innerHTML = readerHtml(clipState.subtitles.length
      ? clipState.subtitles.map((item) => {
          const selected =
            (clipState.selectedSubtitleId && String(item.id) === String(clipState.selectedSubtitleId)) ||
            normalizeSubtitleUrlForCache(item.subtitleUrl) === selectedUrlKey;
          return `<option value="${escapeHtml(item.subtitleUrl)}" data-id="${escapeHtml(
            item.id
          )}" data-lang="${escapeHtml(item.lanDoc || item.lan || "unknown")}"${
            selected ? " selected" : ""
          }>${escapeHtml(item.lanDoc || item.lan || "字幕")}</option>`;
        }).join("")
      : '<option value="">字幕</option>');
    subtitleLanguageSelectCache.set(select, {
      tracks: clipState.subtitles, selectedId: clipState.selectedSubtitleId, selectedUrl: selectedUrlKey
    });
  }
  const disabled = clipState.subtitles.length === 0 || clipState.subtitleFetchState === "loading";
  if (select.disabled !== disabled) select.disabled = disabled;
  syncSubtitleSelection(select);
}

// A failed request keeps the last committed language. Restore the control
// separately from its options cache; user selection does not change attributes.
function syncSubtitleSelection(select) {
  if (clipState.subtitleFetchState === "loading") return;
  const option = select.querySelector("option[selected]");
  const index = option?.index ?? 0;
  if (select.selectedIndex !== index) select.selectedIndex = index;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

init();

})();

})();
