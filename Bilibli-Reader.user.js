// ==UserScript==
// @name         Bilibili Reader｜哔哩哔哩阅读模式
// @namespace    https://github.com/bilibli-reader
// @version      0.0.3
// @description  将 B 站视频切换为视频、章节与字幕联动的阅读视图
// @author       Local
// @license      MIT
// @homepageURL  https://github.com/Wow-CaiCai/Bilibli-Reader
// @source       https://github.com/Wow-CaiCai/Bilibli-Reader
// @supportURL   https://github.com/Wow-CaiCai/Bilibli-Reader/issues
// @updateURL    https://raw.githubusercontent.com/Wow-CaiCai/Bilibli-Reader/main/Bilibli-Reader.user.js
// @downloadURL  https://raw.githubusercontent.com/Wow-CaiCai/Bilibli-Reader/main/Bilibli-Reader.user.js
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/list/watchlater
// @match        https://www.bilibili.com/list/watchlater/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACY0lEQVR4nO2ZvW4TQRCAv3XARqEjDYQgQYdISYeQEBQgpUPKG/ASeYd0eYS00FIBEj+CnhIkxI/AliKRJiRyHMeXYnbu9s6XxNnbbHzkPml91v3MzuzM7O3NQkPD+cY4/1sl56aRxGkp0650GSb9sdwArgEXA3ZywR6HAWXuAV3gt3tyEfhI3j3T3D5YnTHADPAKeAi8BDbt+VyMebJsjy8CyFKd5oAl4A3wBKCDuLgXoJMiu7aFpgfsAx2N0RYwssdZJM6qJLaOlsq4RHWvJkh+7iC6GsiSzDgd9KmedEVl+2TGtD1lDpBR14HJGaCEiPujSKgeUjkdiwacJglwBVhBRnJmwueGiJ5ryPQ5RscK14shjNJwGdim3MZ/6nzgyOnac52YHjDAL+Ap+QQ/Dp1cPiNe2y/eEMsDIZYrqlvqgdYRN9eC2Ek8DzwnS8xJ2EPm/2fAl+LFmAYAXAbueT47R8k0HzuJvwM3OVkS6709RN/cSza2B4bAzwrPj+lb+ySOaUCChM8A2CabYo9rW/Z4l5I1Wu09EDuJf+C/GoWSJG484NHfdfyn0VGZwFgkwC3gq+fz95HCQ47YHtgGPuG3lPjLIZ+lzWr0LIkdQrPAY/w+aN4iL7Uxmk/KE7ABrOL3Uf+NrH6Vo9ZJXFT2tMvshmqFLZWRogZonBmkDBiqtKiEKC22yUqL6QaHGqCZPgL+VeikiCrcDyRvFxmINBd0dfcOeISU1w9943mgNZz1ALLc8vpV4DXOynQR2TQ4642LSdt74I5apSwgZY86bDH9sS3lv9jkM06bZtxQamg49xwAEzUXatUrVPQAAAAASUVORK5CYII=
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
// ==/UserScript==

(() => {
  "use strict";

  const USERSCRIPT_SETTINGS_KEY = "bilibli-reader-settings";
  const runtimeListeners = [];
  const storageListeners = [];

  GM_addStyle("#viewbox_report.blr-page-reader-entry-host,\n.video-info-container.blr-page-reader-entry-host,\n.video-info-title.blr-page-reader-entry-host {\n  position: relative !important;\n}\n\n#viewbox_report.blr-page-reader-entry-host h1.video-title,\n.video-info-container.blr-page-reader-entry-host h1.video-title {\n  padding-right: 108px !important;\n  box-sizing: border-box;\n}\n\n#blr-page-reader-entry {\n  -webkit-appearance: none;\n  appearance: none;\n  position: absolute;\n  top: auto;\n  right: 2px;\n  bottom: 4px;\n  z-index: 20;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  min-width: 82px;\n  height: 34px;\n  margin: 0;\n  padding: 0 14px;\n  box-sizing: border-box;\n  border: 1px solid rgba(0, 174, 236, 0.42);\n  border-radius: 9px;\n  background: rgba(255, 255, 255, 0.96);\n  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.08);\n  color: #18191c;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", sans-serif;\n  font-size: 14px;\n  font-weight: 600;\n  line-height: 1;\n  cursor: pointer;\n  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease,\n    transform 0.16s ease, box-shadow 0.16s ease;\n}\n\n#blr-page-reader-entry svg {\n  width: 17px;\n  height: 17px;\n  flex: 0 0 auto;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.8;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n\n#blr-page-reader-entry:hover {\n  border-color: #00aeec;\n  background: #00aeec;\n  color: #fff;\n  box-shadow: 0 7px 20px rgba(0, 174, 236, 0.22);\n  transform: translateY(-1px);\n}\n\n#blr-page-reader-entry:active {\n  transform: translateY(0);\n}\n\n#blr-page-reader-entry:focus-visible {\n  outline: 2px solid rgba(0, 174, 236, 0.42);\n  outline-offset: 2px;\n}\n\n#blr-page-reader-entry:disabled,\n#blr-page-reader-entry.is-loading {\n  cursor: wait;\n  opacity: 0.68;\n  transform: none;\n}\n\nhtml[data-blr-reader-mode=\"1\"] #blr-page-reader-entry,\nbody[data-blr-reader-mode=\"1\"] #blr-page-reader-entry {\n  display: none !important;\n}\n\n@media (max-width: 760px) {\n  #viewbox_report.blr-page-reader-entry-host h1.video-title,\n  .video-info-container.blr-page-reader-entry-host h1.video-title {\n    padding-right: 0 !important;\n  }\n\n  #blr-page-reader-entry {\n    position: relative;\n    top: auto;\n    right: auto;\n    bottom: auto;\n    margin-top: 8px;\n  }\n}\n\n#blr-panel {\n  position: fixed;\n  right: 16px;\n  top: 72px;\n  width: min(420px, calc(100vw - 24px));\n  height: min(820px, calc(100vh - 88px));\n  z-index: 2147483647;\n  background: #f1f1f1;\n  border: 1px solid #d8d8d8;\n  border-radius: 14px;\n  box-shadow: 0 24px 46px rgba(0, 0, 0, 0.24);\n  padding: 12px;\n  box-sizing: border-box;\n  display: none;\n  flex-direction: column;\n  gap: 8px;\n  font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Helvetica Neue\",\n    Arial, sans-serif;\n}\n\n#blr-panel.open {\n  display: flex;\n}\n\n.blr-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0 0 4px;\n}\n\n.blr-header strong {\n  font-size: 17px;\n  font-weight: 600;\n  letter-spacing: 0.01em;\n  color: #3d3d3d;\n}\n\n.blr-header-actions {\n  display: flex;\n  gap: 6px;\n}\n\n.blr-header button {\n  border: 1px solid #cfcfcf;\n  background: #f8f8f8;\n  border-radius: 10px;\n  padding: 7px 10px;\n  cursor: pointer;\n  color: #4a4a4a;\n}\n\n.blr-status {\n  margin: 0;\n  font-size: 12px;\n  color: #555;\n  background: #e8e8e8;\n  border-radius: 8px;\n  padding: 7px 8px;\n}\n\n.blr-props-head {\n  font-size: 15px;\n  font-weight: 600;\n  color: #4a4a4a;\n  margin-top: 0;\n}\n\n.blr-meta {\n  border: 1px solid #d5d5d5;\n  border-radius: 10px;\n  padding: 8px 10px;\n  background: #f7f7f7;\n  display: grid;\n  gap: 6px;\n  font-size: 13px;\n  color: #3f3f3f;\n}\n\n.blr-meta-item {\n  word-break: break-word;\n}\n\n.blr-label {\n  font-size: 12px;\n  font-weight: 600;\n  color: #4d4d4d;\n  margin-top: 2px;\n}\n\n#blr-subtitle-select {\n  height: 36px;\n  border: 1px solid #cfcfcf;\n  border-radius: 8px;\n  padding: 0 10px;\n  background: #fff;\n  color: #2d2d2d;\n}\n\n.blr-player-ai-wrap {\n  align-items: center;\n  background: rgba(20, 24, 32, 0.68);\n  border: 1px solid rgba(255, 255, 255, 0.18);\n  border-radius: 999px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);\n  display: inline-flex;\n  flex: 0 0 var(--blr-player-ai-action-hit-size, 28px);\n  height: var(--blr-player-ai-action-hit-size, 28px);\n  justify-content: center;\n  margin: 0;\n  min-width: var(--blr-player-ai-action-hit-size, 28px);\n  opacity: 0;\n  overflow: hidden;\n  pointer-events: none;\n  position: absolute;\n  right: 14px;\n  top: 50%;\n  transform: translate(8px, -50%);\n  transition: opacity 0.18s ease, background-color 0.18s ease, transform 0.18s ease;\n  width: var(--blr-player-ai-action-hit-size, 28px);\n  z-index: 30;\n}\n\n.blr-player-ai-wrap.is-active,\n.blr-player-ai-wrap:hover,\n.blr-player-ai-wrap:focus-within {\n  background: rgba(20, 24, 32, 0.78);\n  opacity: 1;\n  pointer-events: auto;\n  transform: translate(0, -50%);\n}\n\n#blr-player-ai-quick-action {\n  -webkit-appearance: none;\n  appearance: none;\n  align-items: center;\n  align-self: center;\n  background: transparent;\n  border: 0;\n  border-radius: 0;\n  box-sizing: border-box;\n  color: var(--blr-player-ai-action-color, currentColor);\n  display: inline-flex;\n  flex: 0 0 auto;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  cursor: pointer;\n  line-height: 0;\n  margin-bottom: 0;\n  margin-top: 0;\n  min-width: 0;\n  overflow: hidden;\n  padding: 0;\n  position: relative;\n  top: 0;\n  vertical-align: top;\n  transition: transform 0.16s ease, color 0.16s ease, opacity 0.16s ease;\n}\n\n#blr-player-ai-quick-action svg {\n  width: var(--blr-player-ai-action-icon-size, 24px);\n  height: var(--blr-player-ai-action-icon-size, 24px);\n  display: block;\n  flex: 0 0 auto;\n  stroke: currentColor;\n  fill: none;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n\n#blr-player-ai-quick-action:hover {\n  color: var(--blr-player-ai-action-hover-color, var(--blr-player-ai-action-color, currentColor));\n}\n\n#blr-player-ai-quick-action:disabled {\n  opacity: 0.62;\n  cursor: wait;\n  transform: none;\n}\n\n.blr-confirm-overlay {\n  align-items: center;\n  background: rgba(17, 24, 39, 0.28);\n  display: flex;\n  inset: 0;\n  justify-content: center;\n  padding: 18px;\n  position: fixed;\n  z-index: 2147483647;\n}\n\n.blr-confirm-dialog {\n  background: #ffffff;\n  border: 1px solid #e5e7eb;\n  border-radius: 16px;\n  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);\n  color: #111827;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;\n  max-width: 360px;\n  padding: 18px;\n  width: calc(100vw - 36px);\n}\n\n.blr-confirm-title {\n  font-size: 15px;\n  font-weight: 700;\n  margin-bottom: 8px;\n}\n\n.blr-confirm-body {\n  color: #4b5563;\n  font-size: 13px;\n  margin-bottom: 8px;\n}\n\n.blr-confirm-path {\n  background: #f7f8fb;\n  border: 1px solid #edf0f4;\n  border-radius: 10px;\n  color: #374151;\n  font-size: 12px;\n  line-height: 1.45;\n  max-height: 96px;\n  overflow: auto;\n  padding: 9px 10px;\n  word-break: break-all;\n}\n\n.blr-confirm-actions {\n  display: flex;\n  gap: 8px;\n  justify-content: flex-end;\n  margin-top: 14px;\n}\n\n.blr-confirm-actions button {\n  border: 1px solid #d9dee7;\n  border-radius: 10px;\n  cursor: pointer;\n  font-size: 13px;\n  height: 34px;\n  padding: 0 14px;\n}\n\n.blr-confirm-cancel {\n  background: #ffffff;\n  color: #374151;\n}\n\n.blr-confirm-primary {\n  background: #111827;\n  border-color: #111827 !important;\n  color: #ffffff;\n}\n\n#blr-preview {\n  width: 100%;\n  flex: 1;\n  min-height: 180px;\n  box-sizing: border-box;\n  border: 1px solid #d0d0d0;\n  border-radius: 10px;\n  padding: 10px;\n  resize: vertical;\n  font-size: 13px;\n  line-height: 1.55;\n  background: #fff;\n  color: #2f2f2f;\n  font-family: \"SF Mono\", \"JetBrains Mono\", \"PingFang SC\", Menlo, Monaco, Consolas, monospace;\n}\n\n.blr-actions {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 8px;\n  margin-top: 0;\n}\n\n.blr-actions button {\n  border: 1px solid #cfcfcf;\n  background: #f8f8f8;\n  border-radius: 9px;\n  padding: 8px 8px;\n  cursor: pointer;\n  color: #3d3d3d;\n  font-size: 13px;\n}\n\n#blr-send-btn {\n  grid-column: span 2;\n  border: 1px solid #a88fff;\n  background: linear-gradient(180deg, #9c82ff 0%, #8f75ef 100%);\n  color: #fff;\n  font-weight: 600;\n}\n\n.blr-actions button:disabled {\n  cursor: not-allowed;\n  opacity: 0.55;\n}\n\n.blr-message {\n  margin: 0;\n  font-size: 12px;\n  color: #0f766e;\n  min-height: 18px;\n  padding: 0 2px;\n}\n\n#blr-reading-view {\n  position: fixed;\n  left: 16px;\n  right: 16px;\n  bottom: 16px;\n  height: min(76vh, 860px);\n  z-index: 2147483646;\n  display: none;\n  padding: 20px 22px;\n  box-sizing: border-box;\n  background: #fff;\n  border: 1px solid #e5e7eb;\n  border-radius: 18px;\n  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.16);\n  font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Helvetica Neue\",\n    Arial, sans-serif;\n}\n\n#blr-reading-view.open {\n  display: block;\n}\n\n#blr-reading-view[data-blr-reader-ready=\"0\"] {\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n}\n\n.blr-reading-layout {\n  min-height: 0;\n  height: 100%;\n  display: grid;\n  grid-template-columns: 240px minmax(0, 1fr);\n  gap: 28px;\n}\n\n.blr-reading-rail {\n  min-height: 0;\n  display: grid;\n  grid-template-rows: auto auto minmax(0, 1fr);\n  gap: 10px;\n  align-content: start;\n}\n\n.blr-reading-stage {\n  min-height: 0;\n  display: grid;\n  grid-template-rows: auto auto minmax(320px, 1fr) minmax(0, 1fr);\n  gap: 14px;\n}\n\n.blr-reading-header {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 18px;\n}\n\n.blr-reading-header-copy {\n  min-width: 0;\n}\n\n.blr-reading-eyebrow {\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  color: #9ca3af;\n  text-transform: uppercase;\n}\n\n.blr-reading-title {\n  display: block;\n  margin: 0;\n  font-size: 16px;\n  line-height: 1.15;\n  color: #0f172a;\n  word-break: break-word;\n}\n\n.blr-reading-topbar,\n.blr-reading-heading-group {\n  min-width: 0;\n}\n\n.blr-reading-page-title {\n  color: var(--blr-reader-text, #0f172a);\n  display: -webkit-box;\n  font-size: 18px;\n  font-weight: 500;\n  line-height: 1.2;\n  overflow: hidden;\n  overflow-wrap: anywhere;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 2;\n}\n\n.blr-reading-episode-title {\n  color: var(--blr-reader-muted, #64748b);\n  display: -webkit-box;\n  font-size: 14px;\n  font-weight: 600;\n  line-height: 1.3;\n  overflow: hidden;\n  overflow-wrap: anywhere;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 2;\n}\n\n.blr-reading-collection-nav {\n  align-items: flex-start;\n  display: flex;\n  gap: 10px;\n  min-width: 0;\n}\n\n.blr-reading-episode-title[hidden],\n.blr-reading-collection-nav[hidden] {\n  display: none !important;\n}\n\n.blr-reading-collection-list {\n  align-content: flex-start;\n  align-items: center;\n  display: flex;\n  flex: 1 1 auto;\n  flex-wrap: wrap;\n  gap: 6px;\n  height: 70px;\n  min-width: 0;\n  overflow-x: hidden;\n  overflow-y: auto;\n  overscroll-behavior-y: contain;\n  scrollbar-width: none;\n}\n\n.blr-reading-collection-list::-webkit-scrollbar {\n  display: none;\n}\n\n.blr-reading-collection-item {\n  align-items: center;\n  background: transparent;\n  border: 1px solid var(--blr-reader-border, #e2e8f0);\n  border-radius: 999px;\n  color: var(--blr-reader-muted, #64748b);\n  cursor: pointer;\n  display: inline-flex;\n  flex: 0 0 auto;\n  gap: 6px;\n  height: 32px;\n  max-width: 260px;\n  padding: 0 10px 0 7px;\n  font-weight: 600;\n}\n\n.blr-reading-collection-item:hover {\n  border-color: var(--blr-reader-accent, #22c55e);\n  color: var(--blr-reader-text, #0f172a);\n}\n\n.blr-reading-collection-item.is-active {\n  background: var(--blr-reader-accent-soft, #ecfdf5);\n  border-color: var(--blr-reader-accent, #22c55e);\n  color: var(--blr-reader-accent, #16a34a);\n}\n\n.blr-reading-collection-index {\n  align-items: center;\n  background: color-mix(in srgb, currentColor 10%, transparent);\n  border-radius: 999px;\n  display: inline-flex;\n  flex: 0 0 auto;\n  font-size: 10px;\n  font-weight: 700;\n  height: 18px;\n  justify-content: center;\n  min-width: 18px;\n  padding: 0 4px;\n}\n\n.blr-reading-collection-item-title {\n  font-size: 12px;\n  font-weight: 600;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.blr-reading-meta,\n.blr-reading-status {\n  font-size: 14px;\n  line-height: 1.5;\n  color: #6b7280;\n}\n\n.blr-reading-meta {\n  margin-top: 8px;\n}\n\n.blr-reading-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  justify-content: flex-end;\n  transition: opacity 0.2s ease;\n}\n\n.blr-reading-actions[data-blr-icon-hidden=\"1\"] {\n  opacity: 0;\n  pointer-events: none;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .blr-reading-actions {\n    transition: none;\n  }\n}\n\n.blr-reading-actions button,\n.blr-reading-toggle {\n  border: 1px solid #e5e7eb;\n  background: #fff;\n  border-radius: 999px;\n  min-height: 36px;\n  padding: 0 14px;\n  font-size: 13px;\n  color: #1f2937;\n  box-sizing: border-box;\n}\n\n.blr-reading-actions button {\n  cursor: pointer;\n}\n\n.blr-reading-toggle {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.blr-reading-toggle input {\n  margin: 0;\n}\n\n.blr-reading-icon-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 34px;\n  height: 34px;\n  border: 1px solid #e5e7eb;\n  background: #fff;\n  border-radius: 8px;\n  cursor: pointer;\n  padding: 0;\n  color: #1f2937;\n}\n\n.blr-reading-icon-btn svg {\n  width: 18px;\n  height: 18px;\n  flex: 0 0 auto;\n}\n\n.blr-reading-icon-btn:hover {\n  background: #f3f4f6;\n  border-color: #d1d5db;\n}\n\n.blr-reading-icon-btn.is-active {\n  background: #eff6ff;\n  border-color: #2563eb;\n  color: #2563eb;\n}\n\n.blr-reading-panel-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n\n.blr-reading-inline-label {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 12px;\n  color: #6b7280;\n}\n\n.blr-reading-inline-label span {\n  white-space: nowrap;\n}\n\n.blr-reading-select-sm {\n  min-height: 28px;\n  padding: 0 6px;\n  font-size: 12px;\n  border-radius: 6px;\n  border: 1px solid #e5e7eb;\n  background: #fff;\n  color: #1f2937;\n  cursor: pointer;\n}\n\n.blr-reading-select-sm:focus {\n  outline: none;\n  border-color: #2563eb;\n  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);\n}\n\n.blr-reading-list,\n.blr-reading-transcript {\n  min-height: 0;\n  overflow: auto;\n}\n\n.blr-reading-list {\n  padding-right: 6px;\n}\n\n.blr-reading-player-shell {\n  min-height: 0;\n  display: flex;\n  justify-content: center;\n  align-items: flex-start;\n  pointer-events: none;\n}\n\n.blr-reading-player-slot {\n  width: min(100%, 960px);\n  aspect-ratio: 16 / 9;\n  max-height: 100%;\n  min-height: 0;\n  overflow: hidden;\n  background: #fff;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  pointer-events: none;\n}\n\n.blr-reading-player-slot > * {\n  width: 100% !important;\n  max-width: 100% !important;\n  height: 100% !important;\n}\n\n.blr-reading-player-slot > video {\n  width: 100% !important;\n  height: 100% !important;\n  display: block;\n  background: #000;\n  object-fit: contain;\n}\n\n.blr-reading-player-slot #bilibili-player,\n.blr-reading-player-slot .bpx-player-container,\n.blr-reading-player-slot .bpx-player-video-area,\n.blr-reading-player-slot .bpx-player-primary-area,\n.blr-reading-player-slot .bpx-player-inner {\n  width: 100% !important;\n  height: 100% !important;\n}\n\n.blr-reading-main {\n  min-height: 0;\n  overflow: hidden;\n  display: flex;\n  justify-content: center;\n  pointer-events: auto;\n}\n\n.blr-reading-transcript {\n  width: min(100%, 960px);\n  height: 100%;\n  max-height: 100%;\n  margin: 0 auto;\n  padding: 6px 8px 12px;\n  overflow-x: hidden;\n  overflow-y: auto;\n  pointer-events: auto;\n}\n\n.blr-reading-chapter,\n.blr-reading-item {\n  width: 100%;\n  border: 0;\n  background: transparent;\n  border-radius: 14px;\n  text-align: left;\n  cursor: pointer;\n  user-select: text;\n  -webkit-user-select: text;\n}\n\n.blr-reading-chapter {\n  display: grid;\n  gap: 4px;\n  padding: 8px 10px;\n  color: #4b5563;\n}\n\n.blr-reading-item {\n  display: grid;\n  grid-template-columns: 64px minmax(0, 1fr);\n  gap: 10px;\n  align-items: start;\n  padding: 6px 8px;\n  color: #111827;\n  position: relative;\n}\n\n.blr-reading-chapter:hover {\n  background: #f9fafb;\n}\n\n.blr-reading-chapter.is-active,\n.blr-reading-item.is-active {\n  background: transparent;\n  box-shadow: none;\n}\n\n.blr-reading-chapter-time,\n.blr-reading-time {\n  font-size: var(--blr-reader-transcript-font-size);\n  font-weight: 600;\n  color: #16a34a;\n  padding-top: 2px;\n  line-height: 1.4;\n}\n\n.blr-reading-chapter-title {\n  font-size: 13px;\n  line-height: 1.45;\n  color: inherit;\n}\n\n.blr-reading-chapter.is-active .blr-reading-chapter-title,\n.blr-reading-item.is-active .blr-reading-text {\n  text-decoration-line: underline;\n  text-decoration-color: #22c55e;\n  text-decoration-thickness: 2px;\n  text-underline-offset: 3px;\n}\n\n.blr-reading-text {\n  font-size: 12px;\n  line-height: 1.5;\n  color: inherit;\n}\n\n.blr-reading-empty {\n  padding: 12px 4px;\n  font-size: 14px;\n  color: #94a3b8;\n}\n\n@media (max-width: 1100px) {\n  #blr-reading-view {\n    left: 12px;\n    right: 12px;\n    bottom: 12px;\n    padding: 18px;\n  }\n\n  .blr-reading-layout {\n    grid-template-columns: 210px minmax(0, 1fr);\n    gap: 20px;\n  }\n\n  .blr-reading-title {\n    font-size: 16px;\n  }\n}\n\n@media (max-width: 760px) {\n  #blr-reading-view {\n    top: 72px;\n    height: auto;\n  }\n\n  .blr-reading-layout {\n    grid-template-columns: 1fr;\n    gap: 18px;\n  }\n\n  .blr-reading-stage {\n    grid-template-rows: auto auto minmax(220px, auto) minmax(0, 1fr);\n  }\n\n  .blr-reading-header {\n    flex-direction: column;\n    align-items: stretch;\n  }\n\n  .blr-reading-actions {\n    justify-content: flex-start;\n  }\n\n  .blr-reading-title {\n    font-size: 16px;\n  }\n\n  .blr-reading-item {\n    grid-template-columns: 56px minmax(0, 1fr);\n    gap: 10px;\n  }\n\n  .blr-reading-text {\n    font-size: 13px;\n  }\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"] {\n  margin: 0 !important;\n  padding: 0 !important;\n  width: 100% !important;\n  min-height: 100% !important;\n  background: #fff !important;\n  overflow-x: hidden !important;\n  overflow-y: auto !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-root {\n  position: absolute;\n  inset: 0;\n  z-index: 2147483646;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-panel {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view {\n  position: absolute;\n  inset: 0;\n  width: auto;\n  max-width: none;\n  height: 100vh;\n  display: none;\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n  border: 0;\n  border-radius: 0;\n  box-shadow: none;\n  background: transparent;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view.open {\n  display: block;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view[data-blr-reader-ready=\"0\"] {\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-header-copy,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-status {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #viewbox_report,\nbody[data-blr-reader-mode=\"1\"] .video-info-container,\nbody[data-blr-reader-mode=\"1\"] .video-info-title,\nbody[data-blr-reader-mode=\"1\"] .video-info-title-inner {\n  margin: 0 !important;\n  padding: 0 !important;\n  row-gap: 0 !important;\n  column-gap: 0 !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #viewbox_report,\nbody[data-blr-reader-mode=\"1\"] .video-info-container {\n  margin-bottom: 4px !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .left-container,\nbody[data-blr-reader-mode=\"1\"] .scroll-sticky {\n  row-gap: 8px !important;\n  padding-top: 0 !important;\n  overflow: visible !important;\n  transition: none !important;\n  animation: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #playerWrap,\nbody[data-blr-reader-mode=\"1\"] .player-wrap,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-rail {\n  transition: none !important;\n  animation: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .video-info-detail,\nbody[data-blr-reader-mode=\"1\"] .video-info-meta,\nbody[data-blr-reader-mode=\"1\"] .video-data {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view[data-blr-reader-follow=\"manual\"] .blr-reading-main,\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view[data-blr-reader-follow=\"manual\"] .blr-reading-rail {\n  border-color: rgba(148, 163, 184, 0.8);\n  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view[data-blr-reader-follow=\"manual\"] .blr-reading-eyebrow::after {\n  content: \"手动浏览中\";\n  display: inline-block;\n  margin-left: 8px;\n  font-size: 11px;\n  font-weight: 500;\n  color: #94a3b8;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reader-player-host {\n  background: #000 !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #playerWrap {\n  position: static !important;\n  top: auto !important;\n  z-index: auto !important;\n  background: transparent !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .player-wrap,\nbody[data-blr-reader-mode=\"1\"] .scroll-sticky {\n  position: static !important;\n  top: auto !important;\n  z-index: auto !important;\n  background: transparent !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] [data-blr-reader-player-reset=\"1\"] {\n  position: static !important;\n  inset: auto !important;\n  width: auto !important;\n  height: auto !important;\n  transform: none !important;\n  margin: 0 !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .strip-ad-inner,\nbody[data-blr-reader-mode=\"1\"] .inside-wrp,\nbody[data-blr-reader-mode=\"1\"] .inside-bg,\nbody[data-blr-reader-mode=\"1\"] .hinter-msg,\nbody[data-blr-reader-mode=\"1\"] .slide,\nbody[data-blr-reader-mode=\"1\"] .cover.b-img,\nbody[data-blr-reader-mode=\"1\"] .cover.b-img.sleepy,\nbody[data-blr-reader-mode=\"1\"] .b-img.clickable {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] [data-blr-reader-hidden=\"1\"] {\n  display: none !important;\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"],\n#blr-reading-view {\n  --blr-reader-page-bg: #f4f6f8;\n  --blr-reader-surface: #ffffff;\n  --blr-reader-surface-2: #f7f9fc;\n  --blr-reader-surface-3: #edf2f7;\n  --blr-reader-border: rgba(15, 23, 42, 0.1);\n  --blr-reader-text: #0f172a;\n  --blr-reader-muted: #64748b;\n  --blr-reader-accent: #16a34a;\n  --blr-reader-accent-soft: rgba(34, 197, 94, 0.12);\n  --blr-reader-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);\n  --blr-reader-transcript-font-size: 14px;\n  --blr-reader-transcript-font-weight: 500;\n  --blr-reader-transcript-line-height: 1.5;\n  --blr-reader-letter-spacing: 0em;\n  --blr-reader-content-max: 980px;\n  color: var(--blr-reader-text);\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-theme=\"dark\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-theme=\"dark\"],\n#blr-reading-view[data-theme=\"dark\"] {\n  --blr-reader-page-bg: #09111f;\n  --blr-reader-surface: #0f172a;\n  --blr-reader-surface-2: #132038;\n  --blr-reader-surface-3: #1a2a46;\n  --blr-reader-border: rgba(148, 163, 184, 0.22);\n  --blr-reader-text: #e5eefb;\n  --blr-reader-muted: #9fb0c8;\n  --blr-reader-accent: #4ade80;\n  --blr-reader-accent-soft: rgba(74, 222, 128, 0.14);\n  --blr-reader-shadow: 0 18px 42px rgba(2, 6, 23, 0.42);\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-theme=\"paper\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-theme=\"paper\"],\n#blr-reading-view[data-theme=\"paper\"] {\n  --blr-reader-page-bg: #f4eddc;\n  --blr-reader-surface: #f4eddc;\n  --blr-reader-surface-2: #f4eddc;\n  --blr-reader-surface-3: #f4eddc;\n  --blr-reader-border: rgba(180, 155, 112, 0.22);\n  --blr-reader-text: #3b3124;\n  --blr-reader-muted: #756653;\n  --blr-reader-accent: #2f9e44;\n  --blr-reader-accent-soft: rgba(47, 158, 68, 0.12);\n  --blr-reader-shadow: 0 18px 40px rgba(112, 93, 64, 0.12);\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"s\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"s\"],\n#blr-reading-view[data-font-scale=\"s\"] {\n  --blr-reader-transcript-font-size: 12.8px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"xs\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"xs\"],\n#blr-reading-view[data-font-scale=\"xs\"] {\n  --blr-reader-transcript-font-size: 11.6px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"l\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"l\"],\n#blr-reading-view[data-font-scale=\"l\"] {\n  --blr-reader-transcript-font-size: 16.4px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"xl\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-scale=\"xl\"],\n#blr-reading-view[data-font-scale=\"xl\"] {\n  --blr-reader-transcript-font-size: 18.8px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"light\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"light\"],\n#blr-reading-view[data-font-weight=\"light\"] {\n  --blr-reader-transcript-font-weight: 300;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"regular\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"regular\"],\n#blr-reading-view[data-font-weight=\"regular\"] {\n  --blr-reader-transcript-font-weight: 400;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"semibold\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"semibold\"],\n#blr-reading-view[data-font-weight=\"semibold\"] {\n  --blr-reader-transcript-font-weight: 600;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"bold\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-font-weight=\"bold\"],\n#blr-reading-view[data-font-weight=\"bold\"] {\n  --blr-reader-transcript-font-weight: 700;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"tighter\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"tighter\"],\n#blr-reading-view[data-letter-spacing=\"tighter\"] {\n  --blr-reader-letter-spacing: -0.072em;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"tight\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"tight\"],\n#blr-reading-view[data-letter-spacing=\"tight\"] {\n  --blr-reader-letter-spacing: -0.036em;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"relaxed\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"relaxed\"],\n#blr-reading-view[data-letter-spacing=\"relaxed\"] {\n  --blr-reader-letter-spacing: 0.036em;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"loose\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-letter-spacing=\"loose\"],\n#blr-reading-view[data-letter-spacing=\"loose\"] {\n  --blr-reader-letter-spacing: 0.072em;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"compact\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"compact\"],\n#blr-reading-view[data-content-width=\"compact\"] {\n  --blr-reader-content-max: 720px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"narrow\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"narrow\"],\n#blr-reading-view[data-content-width=\"narrow\"] {\n  --blr-reader-content-max: 820px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"wide\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"wide\"],\n#blr-reading-view[data-content-width=\"wide\"] {\n  --blr-reader-content-max: 1120px;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"full\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"full\"],\n#blr-reading-view[data-content-width=\"full\"] {\n  --blr-reader-content-max: 1280px;\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"] #app,\nbody[data-blr-reader-mode=\"1\"] .left-container,\nbody[data-blr-reader-mode=\"1\"] .right-container,\nbody[data-blr-reader-mode=\"1\"] .right-container-inner,\nbody[data-blr-reader-mode=\"1\"] .video-info-container,\nbody[data-blr-reader-mode=\"1\"] .video-info-detail,\nbody[data-blr-reader-mode=\"1\"] .video-sections-content-list,\nbody[data-blr-reader-mode=\"1\"] .video-container-v1,\nbody[data-blr-reader-mode=\"1\"] .video-container-v3 {\n  background: var(--blr-reader-page-bg) !important;\n  color: var(--blr-reader-text);\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"] #app {\n  min-height: 100vh !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #app {\n  min-width: 0 !important;\n  width: 100% !important;\n  max-width: none !important;\n}\n\n#blr-reading-view,\n#blr-reading-view .blr-reading-meta,\n#blr-reading-view .blr-reading-status,\n#blr-reading-view .blr-reading-chapter,\n#blr-reading-view .blr-reading-item,\n#blr-reading-view .blr-reading-panel,\n#blr-reading-view .blr-reading-select {\n  color: var(--blr-reader-text);\n}\n\n#blr-reading-view .blr-reading-layout {\n  gap: 22px;\n}\n\n#blr-reading-view .blr-reading-stage {\n  display: grid;\n  gap: 16px;\n}\n\n#blr-reading-view .blr-reading-header {\n  align-items: flex-start;\n}\n\n#blr-reading-view .blr-reading-title {\n  font-size: 20px;\n  color: var(--blr-reader-text);\n  margin-top: 10px;\n}\n\n#blr-reading-view .blr-reading-meta,\n#blr-reading-view .blr-reading-status,\n#blr-reading-view .blr-reading-panel-grid label,\n#blr-reading-view .blr-reading-info-label {\n  font-size: 14px;\n  color: var(--blr-reader-muted);\n}\n\n#blr-reading-view .blr-reading-actions {\n  gap: 10px;\n}\n\n#blr-reading-view .blr-reading-actions button,\n#blr-reading-view .blr-reading-toggle,\n#blr-reading-view .blr-reading-select {\n  border: 1px solid var(--blr-reader-border);\n  background: var(--blr-reader-surface);\n  color: var(--blr-reader-text);\n  box-shadow: none;\n}\n\n#blr-reading-view .blr-reading-actions button.is-active,\n#blr-reading-view .blr-reading-toggle.is-active,\n#blr-reading-view .blr-reading-select:focus {\n  background: var(--blr-reader-accent-soft);\n  color: var(--blr-reader-accent);\n}\n\n#blr-reading-view .blr-reading-select {\n  min-height: 36px;\n  border-radius: 999px;\n  padding: 0 12px;\n  width: auto;\n  margin: 0;\n}\n\n#blr-reading-view .blr-reading-panel {\n  border-radius: 18px;\n  padding: 14px 16px;\n  pointer-events: auto;\n  background: var(--blr-reader-surface);\n  border: 1px solid var(--blr-reader-border);\n  box-shadow: var(--blr-reader-shadow);\n}\n\n#blr-reading-view .blr-reading-panel-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 12px;\n}\n\n#blr-reading-view .blr-reading-panel-grid label,\n#blr-reading-view .blr-reading-info-group {\n  display: grid;\n  gap: 6px;\n  font-size: 13px;\n}\n\n#blr-reading-view .blr-reading-info-panel,\n#blr-reading-view .blr-reading-info-list {\n  display: grid;\n  gap: 6px;\n}\n\n#blr-reading-view .blr-reading-info-panel {\n  gap: 16px;\n}\n\n#blr-reading-view .blr-reading-info-item {\n  display: grid;\n  grid-template-columns: auto minmax(0, 1fr);\n  gap: 12px;\n  align-items: start;\n}\n\n#blr-reading-view .blr-reading-info-value,\n#blr-reading-view .blr-reading-info-copy {\n  font-size: 14px;\n  line-height: 1.45;\n  color: var(--blr-reader-text);\n  word-break: break-word;\n}\n\n#blr-reading-view .blr-reading-control-field {\n  display: grid;\n  gap: 4px;\n  font-size: 13px;\n  color: var(--blr-reader-muted);\n}\n\n#blr-reading-view .blr-reading-text-btn {\n  border: 0;\n  background: transparent;\n  color: var(--blr-reader-accent);\n  padding: 0;\n  cursor: pointer;\n  width: fit-content;\n  font-size: 13px;\n}\n\n#blr-reading-view .blr-reading-main {\n  justify-content: center;\n  background: transparent;\n}\n\n#blr-reading-view .blr-reading-transcript {\n  width: min(100%, var(--blr-reader-content-max));\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-transcript-visible=\"0\"] #blr-reading-view .blr-reading-main,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-transcript-visible=\"0\"] #blr-reading-view .blr-reading-main,\n#blr-reading-view[data-transcript-visible=\"0\"] .blr-reading-main {\n  display: none !important;\n}\n\n#blr-reading-view[data-transcript-visible=\"0\"] #blr-reading-inline-host {\n  border: none;\n  background: transparent;\n}\n\n#blr-reading-view .blr-reading-item {\n  grid-template-columns: 70px minmax(0, 1fr);\n  gap: 12px;\n  padding: 10px 12px;\n  border-radius: 18px;\n  background: transparent;\n}\n\n#blr-reading-view .blr-reading-chapter:hover {\n  background: var(--blr-reader-surface-2);\n}\n\n#blr-reading-view .blr-reading-item.is-active,\n#blr-reading-view .blr-reading-chapter.is-active {\n  background: var(--blr-reader-accent-soft);\n}\n\n#blr-reading-view .blr-reading-time,\n#blr-reading-view .blr-reading-chapter-time {\n  color: var(--blr-reader-accent);\n}\n\n#blr-reading-view .blr-reading-text {\n  font-size: var(--blr-reader-transcript-font-size);\n  font-weight: var(--blr-reader-transcript-font-weight);\n  line-height: var(--blr-reader-transcript-line-height);\n  letter-spacing: var(--blr-reader-letter-spacing);\n  color: var(--blr-reader-text);\n}\n\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bpx-player-subtitle-wrap,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bpx-player-subtitle-panel,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bpx-player-subtitle-container,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bilibili-player-video-subtitle,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .subtitle-wrap,\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host [class*=\"subtitle\"],\nbody[data-blr-reading-active=\"1\"] .blr-reader-player-host .bpx-player-sending-bar,\nbody[data-blr-reading-active=\"1\"] .bpx-player-sending-bar {\n  display: none !important;\n}\n\nbody[data-blr-reading-active=\"1\"] [data-blr-reader-fading] {\n  visibility: hidden !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-view {\n  background: transparent;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-header {\n  left: auto;\n  right: 24px;\n  max-width: min(1100px, calc(100vw - 48px));\n  gap: 14px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-actions {\n  pointer-events: auto;\n  justify-content: flex-end;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-panel {\n  position: fixed;\n  right: 24px;\n  top: 76px;\n  width: min(380px, calc(100vw - 48px));\n  z-index: 2147483646;\n  background: var(--blr-reader-surface-2);\n}\n\n/* Simplified reader layout: player in normal flow, transcript box below with its own scroll. */\nbody[data-blr-reader-mode=\"1\"] .blr-reading-player-shell {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-layout,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-stage {\n  display: block;\n  height: auto;\n}\n\nhtml[data-blr-reader-mode=\"1\"],\nbody[data-blr-reader-mode=\"1\"] {\n  --blr-reader-page-padding: clamp(16px, 2.8vw, 32px);\n  --blr-reader-layout-gap: clamp(16px, 2vw, 24px);\n  --blr-reader-rail-target-width: clamp(168px, 15vw, 220px);\n  --blr-reader-main-width: min(\n    var(--blr-reader-content-max),\n    calc(100vw - (var(--blr-reader-page-padding) * 2))\n  );\n  --blr-reader-rail-width: min(\n    var(--blr-reader-rail-target-width),\n    max(\n      0px,\n      calc(\n        ((100vw - var(--blr-reader-main-width)) / 2) - var(--blr-reader-page-padding) - var(--blr-reader-layout-gap)\n      )\n    )\n  );\n  --blr-reader-transcript-line-height: 1.404;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"compact\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"compact\"],\n#blr-reading-view[data-line-height=\"compact\"] {\n  --blr-reader-transcript-line-height: 1.32;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"tight\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"tight\"],\n#blr-reading-view[data-line-height=\"tight\"] {\n  --blr-reader-transcript-line-height: 1.404;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"normal\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"normal\"],\n#blr-reading-view[data-line-height=\"normal\"] {\n  --blr-reader-transcript-line-height: 1.5;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"relaxed\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"relaxed\"],\n#blr-reading-view[data-line-height=\"relaxed\"] {\n  --blr-reader-transcript-line-height: 1.596;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"loose\"],\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-line-height=\"loose\"],\n#blr-reading-view[data-line-height=\"loose\"] {\n  --blr-reader-transcript-line-height: 1.692;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-actions {\n  gap: 12px;\n  margin-right: -20px;\n  margin-top: -8px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-header {\n  position: fixed;\n  top: 18px;\n  right: var(--blr-reader-page-padding);\n  left: auto;\n  max-width: calc(100vw - (var(--blr-reader-page-padding) * 2));\n  margin-bottom: 0;\n  z-index: 2147483646;\n  pointer-events: auto;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-topbar {\n  display: grid;\n  gap: clamp(12px, 1.2vw, 20px);\n  grid-template-columns: clamp(300px, 28vw, 520px) minmax(0, 1fr);\n  height: 84px;\n  left: var(--blr-reader-page-padding);\n  min-width: 0;\n  overflow: hidden;\n  pointer-events: auto;\n  position: fixed;\n  right: 174px;\n  top: 6px;\n  z-index: 2147483646;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-heading-group {\n  align-content: center;\n  display: grid;\n  gap: 2px;\n  max-height: 84px;\n  overflow: hidden;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-page-title {\n  font-size: clamp(16px, 1.05vw, 19px);\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-collection-nav {\n  align-self: center;\n  height: 70px;\n  min-width: 0;\n  pointer-events: auto;\n  position: static;\n}\n\n@media (max-width: 1000px) {\n  body[data-blr-reader-mode=\"1\"] .blr-reading-topbar {\n    grid-template-columns: clamp(240px, 34vw, 330px) minmax(0, 1fr);\n  }\n}\n\n@media (max-width: 760px) {\n  body[data-blr-reader-mode=\"1\"] .blr-reading-topbar {\n    grid-template-columns: minmax(190px, 42vw) minmax(0, 1fr);\n    right: 150px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-page-title {\n    font-size: 15px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-episode-title {\n    font-size: 12px;\n  }\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel {\n  position: fixed;\n  right: var(--blr-reader-page-padding);\n  top: 72px;\n  width: min(286px, calc(100vw - (var(--blr-reader-page-padding) * 2)));\n  max-height: calc(100vh - 96px);\n  overflow: auto;\n  display: grid;\n  gap: 10px;\n  background: var(--blr-reader-surface-2);\n}\n\n.blr-reading-stepper-list {\n  display: grid;\n  gap: 7px;\n}\n\n.blr-reading-stepper {\n  align-items: center;\n  display: grid;\n  grid-template-columns: 56px minmax(0, 1fr);\n  gap: 8px;\n}\n\n.blr-reading-stepper-title {\n  min-width: 0;\n  color: var(--blr-reader-text);\n  font-size: 12px;\n  font-weight: 600;\n  white-space: nowrap;\n}\n\n.blr-reading-stepper-buttons {\n  display: grid;\n  grid-template-columns: repeat(5, minmax(0, 1fr));\n  border: 1px solid var(--blr-reader-border);\n  border-radius: 12px;\n  overflow: hidden;\n  background: var(--blr-reader-surface);\n}\n\n.blr-reading-stepper-btn {\n  min-height: 28px;\n  border: 0;\n  border-right: 1px solid var(--blr-reader-border);\n  background: transparent;\n  color: var(--blr-reader-muted);\n  font-size: 11px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.18s ease, color 0.18s ease;\n}\n\n.blr-reading-stepper-btn:last-child {\n  border-right: 0;\n}\n\n.blr-reading-stepper-btn:hover {\n  background: var(--blr-reader-accent-soft);\n  color: var(--blr-reader-accent);\n}\n\n.blr-reading-stepper-btn.is-active {\n  background: var(--blr-reader-accent-soft);\n  color: var(--blr-reader-accent);\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-group {\n  display: grid;\n  gap: 6px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-group + .blr-reading-settings-group {\n  border-top: 1px solid var(--blr-reader-border);\n  padding-top: 10px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-info-group-chapters {\n  display: grid;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-controls {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-controls .blr-reading-select {\n  min-width: 118px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-control-field .blr-reading-select {\n  min-width: 118px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-secondary-btn {\n  border: 1px solid var(--blr-reader-border);\n  background: var(--blr-reader-surface);\n  color: var(--blr-reader-text);\n  min-height: 32px;\n  padding: 0 12px;\n  border-radius: 999px;\n  cursor: pointer;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-toggle-inline {\n  width: fit-content;\n  background: var(--blr-reader-surface);\n  color: var(--blr-reader-text);\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-eyebrow {\n  font-size: 10px;\n  letter-spacing: 0.06em;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-toggle,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-select {\n  min-height: 32px;\n  padding: 0 11px;\n  font-size: 12px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-toggle {\n  gap: 6px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-info-list {\n  gap: 4px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-info-item {\n  gap: 8px;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-info-label,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-info-value,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-info-copy,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-empty,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-text-btn {\n  font-size: 12px;\n  line-height: 1.42;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-info-copy {\n  white-space: pre-wrap;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-settings-panel .blr-reading-info-copy.is-collapsed {\n  display: -webkit-box;\n  overflow: hidden;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 5;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-rail {\n  position: fixed;\n  display: grid !important;\n  left: var(--blr-reader-page-padding) !important;\n  top: 112px !important;\n  width: var(--blr-reader-rail-width) !important;\n  max-height: calc(100vh - 136px) !important;\n  padding: 12px;\n  box-sizing: border-box;\n  background: var(--blr-reader-surface);\n  border: 1px solid var(--blr-reader-border);\n  border-radius: 14px;\n  box-shadow: var(--blr-reader-shadow);\n  pointer-events: auto;\n  z-index: 2147483646;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-chapter-visibility=\"hide\"] .blr-reading-rail,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-chapter-visibility=\"hide\"] .blr-reading-rail,\n#blr-reading-view[data-chapter-visibility=\"hide\"] .blr-reading-rail,\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-chapter-visibility=\"auto\"][data-blr-reader-has-chapters=\"0\"] .blr-reading-rail,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-chapter-visibility=\"auto\"][data-blr-reader-has-chapters=\"0\"] .blr-reading-rail,\n#blr-reading-view[data-chapter-visibility=\"auto\"][data-has-chapters=\"0\"] .blr-reading-rail {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .left-container,\nbody[data-blr-reader-mode=\"1\"] .scroll-sticky,\nbody[data-blr-reader-mode=\"1\"] #playerWrap,\nbody[data-blr-reader-mode=\"1\"] .player-wrap,\nbody[data-blr-reader-mode=\"1\"] h1.video-title,\nbody[data-blr-reader-mode=\"1\"] .video-info-container,\nbody[data-blr-reader-mode=\"1\"] #viewbox_report,\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host {\n  width: min(\n    var(--blr-reader-main-width),\n    var(--blr-reader-player-rendered-width, var(--blr-reader-main-width))\n  ) !important;\n  max-width: min(\n    var(--blr-reader-main-width),\n    var(--blr-reader-player-rendered-width, var(--blr-reader-main-width))\n  ) !important;\n  margin-left: auto !important;\n  margin-right: auto !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host {\n  min-height: 100vh;\n  margin-top: -1px;\n  padding: 0;\n  border: 1px solid var(--blr-reader-border);\n  border-top: 0;\n  border-radius: 0 0 20px 20px;\n  background: var(--blr-reader-surface-2);\n  box-shadow: var(--blr-reader-shadow);\n  box-sizing: border-box;\n  overflow: auto;\n  height: 100vh;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(100, 116, 139, 0.1) transparent;\n  position: relative;\n  isolation: isolate;\n}\n\nbody[data-blr-reader-mode=\"1\"] #playerWrap,\nbody[data-blr-reader-mode=\"1\"] .player-wrap {\n  border: 1px solid var(--blr-reader-border);\n  border-bottom: 0;\n  border-radius: 0;\n  background: var(--blr-reader-surface);\n  box-shadow: var(--blr-reader-shadow);\n  box-sizing: border-box;\n  overflow: visible !important;\n  margin-top: -35px !important;\n  height: var(--blr-reader-player-rendered-height, auto) !important;\n  max-height: var(--blr-reader-player-rendered-height, none) !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #playerWrap > *,\nbody[data-blr-reader-mode=\"1\"] .player-wrap > *,\nbody[data-blr-reader-mode=\"1\"] #playerWrap .bpx-player-container,\nbody[data-blr-reader-mode=\"1\"] #playerWrap .bpx-player-video-area,\nbody[data-blr-reader-mode=\"1\"] #playerWrap .bpx-player-primary-area,\nbody[data-blr-reader-mode=\"1\"] #playerWrap .bpx-player-inner,\nbody[data-blr-reader-mode=\"1\"] .player-wrap .bpx-player-container,\nbody[data-blr-reader-mode=\"1\"] .player-wrap .bpx-player-video-area,\nbody[data-blr-reader-mode=\"1\"] .player-wrap .bpx-player-primary-area,\nbody[data-blr-reader-mode=\"1\"] .player-wrap .bpx-player-inner {\n  width: 100% !important;\n  max-width: 100% !important;\n  height: 100% !important;\n  max-height: 100% !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-main {\n  overflow: visible;\n  display: block;\n  width: 100%;\n  background: transparent;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-transcript,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-item,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-item .blr-reading-text,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-time,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-chapter-title,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-empty,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-info-value,\nbody[data-blr-reader-mode=\"1\"] .blr-reading-info-copy {\n  color: var(--blr-reader-text) !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-item .blr-reading-text {\n  font-size: var(--blr-reader-transcript-font-size) !important;\n  font-weight: var(--blr-reader-transcript-font-weight) !important;\n  line-height: var(--blr-reader-transcript-line-height) !important;\n  letter-spacing: var(--blr-reader-letter-spacing) !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-tail-spacer {\n  width: 100%;\n  min-height: 320px;\n  pointer-events: none;\n}\n\nbody[data-blr-reader-mode=\"1\"] .blr-reading-status {\n  display: none !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] h1.video-title {\n  display: -webkit-box !important;\n  margin-top: 8px !important;\n  color: transparent !important;\n  font-size: clamp(16px, 1.05vw, 20px) !important;\n  line-height: 1.2 !important;\n  padding: 0 !important;\n  height: auto !important;\n  max-height: 48px !important;\n  overflow: hidden !important;\n  overflow-wrap: anywhere !important;\n  pointer-events: none !important;\n  user-select: none !important;\n  visibility: hidden !important;\n  -webkit-box-orient: vertical !important;\n  -webkit-line-clamp: 2 !important;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host::-webkit-scrollbar {\n  width: 6px;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host::-webkit-scrollbar-track {\n  background: transparent;\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host::-webkit-scrollbar-thumb {\n  background: rgba(100, 116, 139, 0.1);\n}\n\nbody[data-blr-reader-mode=\"1\"] #blr-reading-inline-host::-webkit-scrollbar-thumb:hover {\n  background: rgba(100, 116, 139, 0.16);\n}\n\n@media (max-width: 1320px) {\n  html[data-blr-reader-mode=\"1\"],\n  body[data-blr-reader-mode=\"1\"] {\n    --blr-reader-layout-gap: clamp(12px, 1.4vw, 16px);\n    --blr-reader-rail-target-width: clamp(144px, 12vw, 168px);\n  }\n}\n\n@media (max-width: 1320px) {\n  html[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"wide\"] .blr-reading-rail,\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-content-width=\"wide\"] .blr-reading-rail,\n  #blr-reading-view[data-content-width=\"wide\"] .blr-reading-rail {\n    display: none !important;\n  }\n}\n\n@media (max-width: 1180px) {\n  body[data-blr-reader-mode=\"1\"] .blr-reading-rail {\n    display: none !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .left-container,\n  body[data-blr-reader-mode=\"1\"] .scroll-sticky,\n  body[data-blr-reader-mode=\"1\"] #playerWrap,\n  body[data-blr-reader-mode=\"1\"] .player-wrap,\n  body[data-blr-reader-mode=\"1\"] h1.video-title,\n  body[data-blr-reader-mode=\"1\"] .video-info-container,\n  body[data-blr-reader-mode=\"1\"] #viewbox_report,\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host {\n    margin-left: auto !important;\n    margin-right: auto !important;\n  }\n}\n\nbody[data-blr-reader-mode=\"1\"] .bpx-player-mini-warp,\nbody[data-blr-reader-mode=\"1\"] .bpx-player-mini-close,\nbody[data-blr-reader-mode=\"1\"] .bpx-player-ending-panel,\nbody[data-blr-reader-mode=\"1\"] .bpx-player-ending-related,\nbody[data-blr-reader-mode=\"1\"] .ad-report,\nbody[data-blr-reader-mode=\"1\"] [class*=\"ad-report\"],\nbody[data-blr-reader-mode=\"1\"] [class*=\"mini-player\"],\nbody[data-blr-reader-mode=\"1\"] [class*=\"picture-in-picture\"] {\n  display: none !important;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-timestamp-visible=\"0\"] .blr-reading-time,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-timestamp-visible=\"0\"] .blr-reading-time,\n#blr-reading-view[data-timestamp-visible=\"0\"] .blr-reading-time {\n  display: none !important;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-timestamp-visible=\"0\"] .blr-reading-item,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-timestamp-visible=\"0\"] .blr-reading-item,\n#blr-reading-view[data-timestamp-visible=\"0\"] .blr-reading-item {\n  grid-template-columns: minmax(0, 1fr);\n}\n\n.blr-reading-complete {\n  padding: 12px 10px 20px;\n  font-size: var(--blr-reader-transcript-font-size);\n  font-weight: var(--blr-reader-transcript-font-weight);\n  line-height: var(--blr-reader-transcript-line-height);\n  letter-spacing: var(--blr-reader-letter-spacing);\n  color: var(--blr-reader-text);\n  text-align: left;\n}\n\n.blr-reading-complete-segment {\n  display: inline;\n  margin: 0;\n  padding: 1px 0;\n  border: 0;\n  border-radius: 2px;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  letter-spacing: inherit;\n  text-align: inherit;\n  cursor: pointer;\n  user-select: text;\n  -webkit-user-select: text;\n}\n\n.blr-reading-complete-segment:hover {\n  background: var(--blr-reader-accent-soft);\n}\n\n.blr-reading-complete-segment.is-active {\n  text-decoration-line: underline;\n  text-decoration-color: var(--blr-reader-accent);\n  text-decoration-thickness: 2px;\n  text-underline-offset: 4px;\n}\n\n/* Desktop reader: title/player with chapters below | transcript. */\n@media (min-width: 1181px) {\n  html[data-blr-reader-mode=\"1\"],\n  body[data-blr-reader-mode=\"1\"] {\n    --blr-reader-three-column-gap: clamp(16px, 1.4vw, 24px);\n    --blr-reader-three-column-half-gap: clamp(8px, 0.7vw, 12px);\n    --blr-reader-rail-width: clamp(176px, 13vw, 220px);\n    --blr-reader-transcript-width: clamp(320px, 24vw, 440px);\n    --blr-reader-center-offset: clamp(-110px, -5.5vw, -72px);\n    --blr-reader-main-width: max(\n      420px,\n      calc(\n        100vw - (var(--blr-reader-page-padding) * 2) - var(--blr-reader-transcript-width) -\n          var(--blr-reader-three-column-gap)\n      )\n    );\n    overflow: hidden !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-rail {\n    left: var(--blr-reader-player-left, var(--blr-reader-page-padding)) !important;\n    top: calc(var(--blr-reader-player-bottom, 72vh) + 12px) !important;\n    bottom: auto !important;\n    width: var(--blr-reader-player-width, var(--blr-reader-main-width)) !important;\n    height: min(112px, calc(100vh - var(--blr-reader-player-bottom, 72vh) - 36px)) !important;\n    min-height: 72px;\n    max-height: none !important;\n    grid-template-rows: auto minmax(0, 1fr);\n    gap: 6px;\n    padding: 10px 12px;\n    border-radius: 10px;\n    overflow: hidden;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-rail .blr-reading-list {\n    display: flex;\n    align-items: stretch;\n    gap: 8px;\n    min-width: 0;\n    padding: 0 0 4px;\n    overflow-x: auto;\n    overflow-y: hidden;\n    scrollbar-width: thin;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-rail .blr-reading-chapter {\n    flex: 0 0 auto;\n    width: auto;\n    min-width: 120px;\n    max-width: 190px;\n    padding: 6px 10px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .left-container,\n  body[data-blr-reader-mode=\"1\"] .scroll-sticky,\n  body[data-blr-reader-mode=\"1\"] #playerWrap,\n  body[data-blr-reader-mode=\"1\"] .player-wrap,\n  body[data-blr-reader-mode=\"1\"] h1.video-title,\n  body[data-blr-reader-mode=\"1\"] .video-info-container,\n  body[data-blr-reader-mode=\"1\"] #viewbox_report {\n    width: var(--blr-reader-main-width) !important;\n    max-width: var(--blr-reader-main-width) !important;\n    margin-left: auto !important;\n    margin-right: auto !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .left-container {\n    transform: translateX(var(--blr-reader-center-offset)) !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] h1.video-title {\n    margin-top: 28px !important;\n    margin-bottom: 14px !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #playerWrap,\n  body[data-blr-reader-mode=\"1\"] .player-wrap {\n    margin-top: 0 !important;\n    border: 1px solid var(--blr-reader-border);\n    border-radius: 4px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host {\n    position: fixed !important;\n    top: var(--blr-reader-player-top, 98px) !important;\n    right: var(--blr-reader-page-padding) !important;\n    bottom: 24px !important;\n    left: auto !important;\n    width: var(--blr-reader-transcript-width) !important;\n    max-width: var(--blr-reader-transcript-width) !important;\n    min-height: 0 !important;\n    height: auto !important;\n    margin: 0 !important;\n    padding: 0 !important;\n    border: 1px solid var(--blr-reader-border) !important;\n    border-radius: 0 !important;\n    background: var(--blr-reader-surface-2) !important;\n    box-shadow: var(--blr-reader-shadow) !important;\n    overflow-y: auto !important;\n    scroll-padding-top: 46px;\n    z-index: 2147483645;\n  }\n\n  html[data-blr-reader-mode=\"1\"][data-blr-reader-transcript-visible=\"0\"]\n    #blr-reading-inline-host,\n  body[data-blr-reader-mode=\"1\"][data-blr-reader-transcript-visible=\"0\"]\n    #blr-reading-inline-host {\n    display: none !important;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript-heading {\n    position: sticky;\n    top: 0;\n    display: flex;\n    align-items: center;\n    height: 38px;\n    margin: 0;\n    padding: 0 14px;\n    box-sizing: border-box;\n    color: var(--blr-reader-muted);\n    background: var(--blr-reader-surface-2);\n    border-bottom: 1px solid var(--blr-reader-border);\n    font-size: 12px;\n    font-weight: 700;\n    letter-spacing: 0.08em;\n    z-index: 3;\n    pointer-events: auto;\n    user-select: none;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-main,\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript {\n    width: 100% !important;\n    max-width: none !important;\n    height: auto !important;\n    margin: 0 !important;\n    box-sizing: border-box;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-transcript {\n    padding: 8px 10px 24px;\n    overflow: visible;\n  }\n\n  body[data-blr-reader-mode=\"1\"] #blr-reading-inline-host .blr-reading-item {\n    grid-template-columns: 52px minmax(0, 1fr);\n    gap: 8px;\n    padding: 7px 8px;\n    border-radius: 10px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-tail-spacer {\n    min-height: 45vh;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle {\n    position: fixed;\n    top: var(--blr-reader-player-top, 88px);\n    bottom: 24px;\n    width: 14px;\n    z-index: 2147483646;\n    cursor: col-resize;\n    pointer-events: auto;\n    touch-action: none;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle::before {\n    content: \"\";\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 6px;\n    width: 2px;\n    border-radius: 999px;\n    background: transparent;\n    transition: background 0.16s ease, box-shadow 0.16s ease;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle:hover::before,\n  body[data-blr-reader-resizing] .blr-reading-resize-handle::before {\n    background: var(--blr-reader-accent);\n    box-shadow: 0 0 0 3px var(--blr-reader-accent-soft);\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle-left {\n    display: block !important;\n    left: var(--blr-reader-player-left, var(--blr-reader-page-padding)) !important;\n    right: auto !important;\n    top: calc(var(--blr-reader-player-bottom, 72vh) + 1px) !important;\n    bottom: auto !important;\n    width: var(--blr-reader-player-width, var(--blr-reader-main-width)) !important;\n    height: 10px;\n    cursor: row-resize;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle-left::before {\n    top: 4px;\n    right: 0;\n    bottom: auto;\n    left: 0;\n    width: auto;\n    height: 2px;\n  }\n\n  body[data-blr-reader-mode=\"1\"] .blr-reading-resize-handle-right {\n    right: calc(\n      var(--blr-reader-page-padding) + var(--blr-reader-transcript-width) +\n        var(--blr-reader-three-column-half-gap) - 7px\n    );\n  }\n\n  body[data-blr-reader-resizing=\"transcript\"],\n  body[data-blr-reader-resizing=\"transcript\"] * {\n    cursor: col-resize !important;\n    user-select: none !important;\n  }\n\n  body[data-blr-reader-resizing=\"chapter\"],\n  body[data-blr-reader-resizing=\"chapter\"] * {\n    cursor: row-resize !important;\n    user-select: none !important;\n  }\n\n  body[data-blr-reader-transcript-visible=\"0\"] .blr-reading-resize-handle-right {\n    display: none !important;\n  }\n}\n\n@media (max-width: 1180px) {\n  .blr-reading-resize-handle {\n    display: none !important;\n  }\n}\n\n/* Timestamp-free transcript rows must not retain the desktop time column. */\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-timestamp-visible=\"0\"]\n  .blr-reading-item,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-timestamp-visible=\"0\"]\n  .blr-reading-item,\n#blr-reading-view[data-timestamp-visible=\"0\"] .blr-reading-item {\n  grid-template-columns: minmax(0, 1fr) !important;\n}\n\nhtml[data-blr-reader-mode=\"1\"][data-blr-reader-timestamp-visible=\"0\"]\n  .blr-reading-item\n  .blr-reading-text,\nbody[data-blr-reader-mode=\"1\"][data-blr-reader-timestamp-visible=\"0\"]\n  .blr-reading-item\n  .blr-reading-text,\n#blr-reading-view[data-timestamp-visible=\"0\"] .blr-reading-item .blr-reading-text {\n  grid-column: 1 / -1;\n  min-width: 0;\n}\n");

  const chrome = {
    runtime: {
      lastError: null,
      onMessage: {
        addListener(listener) {
          runtimeListeners.push(listener);
        },
        removeListener(listener) {
          const index = runtimeListeners.indexOf(listener);
          if (index >= 0) runtimeListeners.splice(index, 1);
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
        },
        removeListener(listener) {
          const index = storageListeners.indexOf(listener);
          if (index >= 0) storageListeners.splice(index, 1);
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
    if (message?.type === "fetch-json") {
      return { ok: true, data: await requestJson(String(message.url || "")) };
    }
    return { ok: false, error: "此功能在独立阅读脚本中不可用" };
  }

  async function requestJson(url) {
    if (!url) throw new Error("缺少请求地址");
    const normalizedUrl = url.startsWith("//") ? `https:${url}` : url;
    let directError = null;
    try {
      const pageFetch =
        typeof unsafeWindow !== "undefined" && typeof unsafeWindow.fetch === "function"
          ? unsafeWindow.fetch.bind(unsafeWindow)
          : fetch;
      const response = await pageFetch(normalizedUrl, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json, text/plain, */*" }
      });
      if (response.ok) return await response.json();
      directError = new Error(`页面请求 HTTP ${response.status}`);
    } catch (error) {
      directError = error;
    }

    return requestJsonWithUserscriptApi(normalizedUrl, directError);
  }

  function requestJsonWithUserscriptApi(url, directError = null) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (handler, value) => {
        if (settled) return;
        settled = true;
        handler(value);
      };
      const onload = (response) => {
        if (response.status < 200 || response.status >= 300) {
          finish(reject, new Error(`HTTP ${response.status}`));
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
          Referer: "https://www.bilibili.com/"
        },
        responseType: "text",
        anonymous: false,
        withCredentials: true,
        timeout: 20000,
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
        const request = requestApi(requestOptions);
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

  GM_registerMenuCommand("进入阅读模式", () => {
    const readerUrl = new URL(location.href);
    readerUrl.searchParams.set("bilibli_reader", "1");
    dispatchRuntimeMessage({
      type: "popup-trigger-reading-view",
      readerUrl: readerUrl.toString()
    });
  });

  GM_registerMenuCommand("退出阅读模式", () => {
    const closeButton = document.getElementById("blr-reading-close-btn");
    if (closeButton) closeButton.click();
  });

(() => {
if (globalThis.__BILIBLI_READER_CONTENT_SCRIPT_BOOTSTRAPPED__) {
  return;
}
globalThis.__BILIBLI_READER_CONTENT_SCRIPT_BOOTSTRAPPED__ = true;

const DEFAULT_SETTINGS = {
  noteFolder: "Clippings/Bilibili",
  obsidianApiBaseUrl: "http://127.0.0.1:27123",
  obsidianApiKey: "",
  tags: "clippings,bilibili",
  downloadFormat: "srt",
  includeDateInFilename: true,
  includeHotCommentsInNote: false,
  enablePlayerAiQuickAction: false,
  playerAiQuickPrompt: "整理这期视频的内容，输出结构化总结：主题、核心观点、关键细节、结论与可执行启发。",
  includeTimestampInBody: true,
  enableDebugLogs: false,
  readerTheme: "light",
  readerFontScale: "xl",
  readerFontWeight: "bold",
  readerLetterSpacing: "loose",
  readerLineHeight: "loose",
  readerContentWidth: "medium",
  readerChapterWidthPx: 220,
  readerTranscriptWidthPx: 440,
  readerVideoHeightPx: 0,
  readerChapterVisibility: "show",
  readerTranscriptVisible: true,
  readerTimestampVisible: true,
  readerTranscriptMode: "complete",
  readerDefaultsVersion: 3,
  frontmatterFields: [
    "title",
    "url",
    "bvid",
    "cid",
    "author",
    "upload_date",
    "subtitle_lang",
    "created",
    "tags"
  ],
  fixedFrontmatterProperties: [],
  notePlaceholderSections: []
};
const PLAYER_AI_ICON_VARIANT = "badge";

const READER_VERSION = "0.0.3";
const CACHE_KEY_PREFIX = "bilibli_reader_subtitle_cache_";
globalThis.__BILIBLI_READER_CONTENT_SCRIPT_LOADED__ = READER_VERSION;
const state = {
  currentUrl: location.href,
  fetchRunId: 0,
  bvid: "",
  aid: "",
  cid: "",
  cidSource: "",
  pageIndex: 1,
  pageCount: 0,
  pageTitle: "",
  collection: null,
  videoDuration: 0,
  description: "",
  title: "",
  author: "",
  uploadDate: "",
  subtitles: [],
  selectedSubtitleId: "",
  selectedSubtitleUrl: "",
  selectedSubtitleLang: "",
  subtitleBody: [],
  subtitleFetchState: "idle",
  chapters: [],
  hotComments: [],
  markdown: "",
  srt: "",
  txt: "",
  readingViewOpen: false,
  readingNativePageMode: false,
  readingRootOriginalParent: null,
  readingAutoScroll: true,
  readingTheme: "light",
  readingFontScale: "m",
  readingFontWeight: "normal",
  readingLetterSpacing: "normal",
  readingLineHeight: "tight",
  readingContentWidth: "medium",
  readingChapterWidthPx: 220,
  readingTranscriptWidthPx: 440,
  readingVideoHeightPx: 0,
  readingChapterVisible: true,
  readingTranscriptVisible: true,
  readingTimestampVisible: true,
  readingTranscriptMode: "fragmented",
  readingSettingsExpanded: false,
  readingDescriptionExpanded: false,
  readingActiveSubtitleIndex: -1,
  readingActiveChapterIndex: -1,
  readingNextScrollBehavior: "smooth",
  readingSyncTimer: 0,
  currentClipSignature: "",
  readingVideoEl: null,
  readingPlayerHost: null,
  readingMainOriginalParent: null,
  readingMainOriginalNextSibling: null,
  readingPlayerAdjustedNodes: [],
  readingPlayerObserver: null,
  readingPlayerMountTimer: 0,
  readingPlayerRetryTimer: 0,
  readingMiniDismissTimer: 0,
  readingControlsHideTimer: 0,
  readingControlsRecoveryTimer: 0,
  readingControlsRecoveryInFlight: false,
  readingControlsLastRecoverAt: 0,
  readingControlsHoverHost: null,
  readingHeaderHoverHost: null,
  readingHeaderHideTimer: 0,
  readingVideoEventsBound: false,
  readingLayoutBound: false,
  uiEventsBound: false,
  runtimeEventsBound: false,
  settingsWatcherBound: false,
  normalPageStateGuardBound: false,
  urlWatcherStarted: false,
  playerAiQuickActionObserver: null,
  playerAiQuickActionLayoutBound: false,
  playerAiQuickActionSyncTimer: 0,
  playerAiQuickActionRevealTimer: 0,
  playerAiQuickActionHideTimer: 0,
  playerAiQuickActionCursorHideTimer: 0,
  playerAiQuickActionSubmitting: false,
  playerAiQuickActionSuppressedUntil: 0,
  pageReaderEntryObserver: null,
  pageReaderEntrySyncTimer: 0,
  normalPageStateObserver: null,
  readingDocumentClickBound: false,
  readingManualScrollPauseUntil: 0,
  readingProgrammaticScrollUntil: 0,
  readingCollectionSwitchInFlight: false,
  readingViewReady: false,
  statusText: "准备就绪，点击“刷新抓取”开始。",
  messageText: "",
  settings: { ...DEFAULT_SETTINGS }
};

function formatLocalDate(value = Date.now()) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isReaderMode(url = location.href) {
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
    state.currentUrl = location.href;
    state.currentClipSignature = computeCurrentClipSignature(location.href);
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

function getReaderContentMaxPx() {
  if (state.readingContentWidth === "compact") {
    return 720;
  }
  if (state.readingContentWidth === "narrow") {
    return 820;
  }
  if (state.readingContentWidth === "wide") {
    return 1120;
  }
  if (state.readingContentWidth === "full") {
    return 1280;
  }
  return 980;
}

function getReaderPagePaddingPx() {
  return Math.min(32, Math.max(16, window.innerWidth * 0.028));
}

function getReaderMainWidthLimit() {
  const pagePadding = getReaderPagePaddingPx();
  if (window.innerWidth > 1180) {
    const { transcriptWidth } = getEffectiveReaderColumnWidths();
    const gap = Math.min(24, Math.max(16, window.innerWidth * 0.014));
    const availableWidth = window.innerWidth - pagePadding * 2 - transcriptWidth - gap;
    const heightLimitedWidth = Math.max(420, (window.innerHeight - 190) * (16 / 9));
    return Math.max(420, Math.min(availableWidth, heightLimitedWidth));
  }
  return Math.max(320, Math.min(getReaderContentMaxPx(), window.innerWidth - pagePadding * 2));
}

function normalizeReaderColumnWidth(value, fallback, min, max) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(Math.min(max, Math.max(min, parsed))) : fallback;
}

function normalizeReaderVideoHeight(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(Math.min(900, Math.max(240, parsed)));
}

function getEffectiveReaderColumnWidths() {
  const pagePadding = getReaderPagePaddingPx();
  const gap = Math.min(24, Math.max(16, window.innerWidth * 0.014));
  const minChapterWidth = 140;
  const minTranscriptWidth = 280;
  const minVideoWidth = 420;
  const chapterWidth = normalizeReaderColumnWidth(state.readingChapterWidthPx, 220, minChapterWidth, 360);
  let transcriptWidth = normalizeReaderColumnWidth(state.readingTranscriptWidthPx, 440, minTranscriptWidth, 720);
  const availableForTranscript = Math.max(
    minTranscriptWidth,
    window.innerWidth - pagePadding * 2 - gap - minVideoWidth
  );
  transcriptWidth = Math.min(transcriptWidth, availableForTranscript);

  return {
    chapterWidth: Math.round(chapterWidth),
    transcriptWidth: Math.round(transcriptWidth),
    gap
  };
}

function applyReaderColumnLayout() {
  const readingView = byId(ids.readingView);
  if (!readingView) return;
  const { chapterWidth, transcriptWidth, gap } = getEffectiveReaderColumnWidths();
  const mainWidth = getReaderMainWidthLimit();
  const centerOffset = Math.round(-(transcriptWidth + gap) / 2);
  [document.documentElement, document.body, readingView].forEach((node) => {
    node.style.setProperty("--blr-reader-rail-width", `${chapterWidth}px`);
    node.style.setProperty("--blr-reader-transcript-width", `${transcriptWidth}px`);
    node.style.setProperty("--blr-reader-center-offset", `${centerOffset}px`);
    node.style.setProperty("--blr-reader-main-width", `${Math.round(mainWidth)}px`);
    if (state.readingVideoHeightPx > 0) {
      node.style.setProperty(
        "--blr-reader-player-rendered-height",
        `${Math.round(state.readingVideoHeightPx)}px`
      );
    }
  });
  document
    .getElementById(ids.readingChapterResizeHandle)
    ?.setAttribute("aria-valuenow", String(state.readingVideoHeightPx || 0));
  document.getElementById(ids.readingTranscriptResizeHandle)?.setAttribute("aria-valuenow", String(transcriptWidth));
}

function updateReaderChapterRailPosition(rect = null) {
  const readingView = document.getElementById(ids.readingView);
  if (!readingView || window.innerWidth <= 1180) return;

  const playerNode = getReaderPlayerWrapNode() || state.readingPlayerHost;
  const playerRect = rect || playerNode?.getBoundingClientRect?.();
  if (!playerRect || !(playerRect.width > 0) || !(playerRect.height > 0)) return;

  [document.documentElement, document.body, readingView].forEach((node) => {
    node.style.setProperty("--blr-reader-player-left", `${Math.round(playerRect.left)}px`);
    node.style.setProperty("--blr-reader-player-top", `${Math.round(playerRect.top)}px`);
    node.style.setProperty("--blr-reader-player-bottom", `${Math.round(playerRect.bottom)}px`);
    node.style.setProperty("--blr-reader-player-width", `${Math.round(playerRect.width)}px`);
  });
  document
    .getElementById(ids.readingChapterResizeHandle)
    ?.setAttribute("aria-valuenow", String(Math.round(playerRect.height)));
}

function clearNativeReaderFloatingStyles(playerHost = state.readingPlayerHost) {
  if (!state.readingNativePageMode || !playerHost) {
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

function getReaderPlayerWrapNode(playerHost = state.readingPlayerHost) {
  return (
    playerHost?.closest?.("#playerWrap") ||
    playerHost?.closest?.(".player-wrap") ||
    document.getElementById("playerWrap") ||
    document.querySelector(".player-wrap")
  );
}

function hasNativeReaderPlayerLayoutIssue(playerHost = state.readingPlayerHost) {
  if (!state.readingNativePageMode || !playerHost) {
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

function normalizeReaderTheme(value) {
  return value === "dark" || value === "paper" ? value : "light";
}

function normalizeReaderFontScale(value) {
  return ["xs", "s", "m", "l", "xl"].includes(value) ? value : "xl";
}

function normalizeReaderFontWeight(value) {
  return ["light", "regular", "normal", "semibold", "bold"].includes(value) ? value : "bold";
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

function normalizeReaderChapterVisibility(value) {
  return value === "hide" || value === "auto" ? value : "show";
}

function normalizeReaderTranscriptVisible(value) {
  return value !== false;
}

function normalizeReaderTimestampVisible(value) {
  return value !== false;
}

function normalizeReaderTranscriptMode(value) {
  return value === "fragmented" ? "fragmented" : "complete";
}

function shouldDebugLog() {
  return Boolean(state.settings?.enableDebugLogs);
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
  panel: "blr-panel",
  status: "blr-status",
  meta: "blr-meta",
  subtitleSelect: "blr-subtitle-select",
  preview: "blr-preview",
  message: "blr-message",
  copyBtn: "blr-copy-btn",
  downloadBtn: "blr-download-btn",
  sendBtn: "blr-send-btn",
  refreshBtn: "blr-refresh-btn",
  closeBtn: "blr-close-btn",
  settingsBtn: "blr-settings-btn",
  readingView: "blr-reading-view",
  readingPageTitle: "blr-reading-page-title",
  readingEpisodeTitle: "blr-reading-episode-title",
  readingCollectionNav: "blr-reading-collection-nav",
  readingCollectionList: "blr-reading-collection-list",
  readingPlayerSlot: "blr-reading-player-slot",
  readingStatus: "blr-reading-status",
  readingCloseBtn: "blr-reading-close-btn",
  readingRefreshBtn: "blr-reading-refresh-btn",
  readingAutoScroll: "blr-reading-autoscroll",
  readingTranscriptVisible: "blr-reading-transcript-visible",
  readingTimestampVisible: "blr-reading-timestamp-visible",
  readingThemeSelect: "blr-reading-theme-select",
  readingSettingsBtn: "blr-reading-settings-btn",
  readingSettingsPanel: "blr-reading-settings-panel",
  readingFontScaleSelect: "blr-reading-font-scale-select",
  readingFontWeightSelect: "blr-reading-font-weight-select",
  readingLetterSpacingSelect: "blr-reading-letter-spacing-select",
  readingLineHeightSelect: "blr-reading-line-height-select",
  readingChapterResizeHandle: "blr-reading-chapter-resize-handle",
  readingTranscriptResizeHandle: "blr-reading-transcript-resize-handle",
  readingChapterVisibilitySelect: "blr-reading-chapter-visibility-select",
  readingChapterVisible: "blr-reading-chapter-visible",
  readingSubtitleSelect: "blr-reading-subtitle-select",
  readingTranscriptModeSelect: "blr-reading-transcript-mode-select",
  readingInfoSummary: "blr-reading-info-summary",
  readingInfoDescription: "blr-reading-info-description",
  readingDescriptionBtn: "blr-reading-description-btn",
  readingMeta: "blr-reading-meta",
  readingChapterList: "blr-reading-chapters",
  readingTranscriptList: "blr-reading-transcript",
  readingTranscriptTailSpacer: "blr-reading-tail-spacer"
};

init();

function init() {
  logInfo(`[Bilibili Reader] content script loaded, version=${READER_VERSION}`);
  ensureUiReady({ forceRecreate: true });
  installReaderDebugHelpers();

  const shouldEnterReaderMode = isReaderMode();
  if (shouldEnterReaderMode) {
    document.documentElement.setAttribute("data-blr-reader-mode", "1");
    document.body.setAttribute("data-blr-reader-mode", "1");
  } else {
    clearReaderModePageState();
  }

  bindRuntimeEvents();
  bindSettingsWatcher();
  bindNormalPageStateGuard();
  bindPlayerAiQuickActionLayoutEvents();
  startPageReaderEntryObserver();
  startUrlWatcher();
  getSettings().then((settings) => {
    state.settings = settings;
    hydrateReaderStateFromSettings(settings);
    applyReadingViewPresentation();
    startPlayerAiQuickActionObserver();
    schedulePlayerAiQuickActionSync();
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
    state.uiEventsBound = false;
  }

  let root = document.getElementById(ids.root);
  if (!root) {
    root = document.createElement("div");
    root.id = ids.root;
    root.innerHTML = buildUiHtml();
    document.body.appendChild(root);
    state.uiEventsBound = false;
  }

  if (!state.uiEventsBound) {
    bindUiEvents();
    state.uiEventsBound = true;
  }
}

function clearReaderModePageState() {
  document.documentElement.removeAttribute("data-blr-reader-mode");
  document.documentElement.removeAttribute("data-blr-reader-line-height");
  document.documentElement.removeAttribute("data-blr-reader-theme");
  document.documentElement.removeAttribute("data-blr-reader-font-scale");
  document.documentElement.removeAttribute("data-blr-reader-font-weight");
  document.documentElement.removeAttribute("data-blr-reader-letter-spacing");
  document.documentElement.removeAttribute("data-blr-reader-content-width");
  document.documentElement.removeAttribute("data-blr-reader-chapter-visibility");
  document.documentElement.removeAttribute("data-blr-reader-has-chapters");
  document.documentElement.removeAttribute("data-blr-reader-transcript-visible");
  document.documentElement.removeAttribute("data-blr-reader-timestamp-visible");
  document.documentElement.removeAttribute("data-blr-reader-transcript-mode");
  document.body.removeAttribute("data-blr-reader-mode");
  document.body.removeAttribute("data-blr-reader-line-height");
  document.body.removeAttribute("data-blr-reader-font-weight");
  document.body.removeAttribute("data-blr-reader-transcript-visible");
  document.body.removeAttribute("data-blr-reader-timestamp-visible");
  document.body.removeAttribute("data-blr-reader-transcript-mode");
  document.body.removeAttribute("data-blr-reading-active");
}

function startPageReaderEntryObserver() {
  ensurePageReaderEntryButton();
  if (state.pageReaderEntryObserver) {
    return;
  }

  state.pageReaderEntryObserver = new MutationObserver(() => {
    schedulePageReaderEntrySync();
  });
  state.pageReaderEntryObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function schedulePageReaderEntrySync(delayMs = 120) {
  if (state.pageReaderEntrySyncTimer) {
    return;
  }
  state.pageReaderEntrySyncTimer = window.setTimeout(() => {
    state.pageReaderEntrySyncTimer = 0;
    ensurePageReaderEntryButton();
  }, delayMs);
}

function ensurePageReaderEntryButton() {
  if (!extractBvid(location.href) && !isWatchlaterPage()) {
    return;
  }

  const host = document.querySelector(
    "#viewbox_report, .video-info-container, .video-info-title"
  );
  if (!host) {
    return;
  }

  let button = document.getElementById("blr-page-reader-entry");
  if (button && button.parentElement === host) {
    return;
  }
  if (button) {
    button.parentElement?.classList.remove("blr-page-reader-entry-host");
    button.remove();
  }

  host.classList.add("blr-page-reader-entry-host");
  button = document.createElement("button");
  button.id = "blr-page-reader-entry";
  button.type = "button";
  button.title = "进入 Bilibili Reader 阅读模式";
  button.setAttribute("aria-label", "进入阅读模式");
  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h4a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H7a2.5 2.5 0 0 0-2.5 2.5z"></path>
      <path d="M19.5 5.5A2.5 2.5 0 0 0 17 3h-1"></path>
      <path d="M19.5 5.5v13A2.5 2.5 0 0 0 17 16h-1"></path>
    </svg>
    <span>阅读</span>
  `;
  button.addEventListener("click", onPageReaderEntryClick);
  host.appendChild(button);
}

function onPageReaderEntryClick(event) {
  event.preventDefault();
  event.stopPropagation();
  if (state.readingViewOpen) {
    return;
  }

  const button = event.currentTarget;
  button.disabled = true;
  button.classList.add("is-loading");
  const readerUrl = new URL(location.href);
  readerUrl.searchParams.set("bilibli_reader", "1");
  replaceReaderModeUrl(readerUrl.toString());
  document.documentElement.setAttribute("data-blr-reader-mode", "1");
  document.body.setAttribute("data-blr-reader-mode", "1");
  state.playerAiQuickActionSuppressedUntil = Date.now() + 2500;
  removePlayerAiQuickActionButton();
  ensureUiReady();

  enterReaderMode().catch((error) => {
    button.disabled = false;
    button.classList.remove("is-loading");
    logWarn("[Bilibili Reader] page entry failed", error);
    renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
  });
}

function shouldForceNormalPageState(url = location.href) {
  return !isReaderMode(url) && !state.readingViewOpen;
}

function enforceNormalPageStateIfNeeded(url = location.href) {
  if (!shouldForceNormalPageState(url)) {
    return;
  }
  clearReaderModePageState();
}

function bindNormalPageStateGuard() {
  if (state.normalPageStateGuardBound) {
    return;
  }
  state.normalPageStateGuardBound = true;

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
      "data-blr-reader-chapter-visibility",
      "data-blr-reader-has-chapters",
      "data-blr-reader-transcript-visible"
    ]
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-blr-reader-mode", "data-blr-reader-line-height", "data-blr-reading-active"]
  });
  state.normalPageStateObserver = observer;
  enforceNormalPageStateIfNeeded();
}

function bindRuntimeEvents() {
  if (state.runtimeEventsBound) {
    return;
  }
  state.runtimeEventsBound = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") {
      return false;
    }

    if (message.type === "popup-get-state") {
      sendResponse({ ok: true, payload: getPopupPayload() });
      return false;
    }

    if (message.type === "popup-refresh") {
      refreshClip()
        .then(() => sendResponse({ ok: true, payload: getPopupPayload() }))
        .catch((error) =>
          sendResponse({ ok: false, error: getErrorMessage(error), payload: getPopupPayload() })
        );
      return true;
    }

    if (message.type === "popup-select-subtitle") {
      const url = String(message.url || "").trim();
      const lang = String(message.lang || "unknown");
      const subtitleId = String(message.subtitleId || "");
      if (!url) {
        sendResponse({ ok: false, error: "Missing subtitle URL", payload: getPopupPayload() });
        return false;
      }
      loadSubtitle(url, lang, state.fetchRunId, subtitleId)
        .then(() => {
          setStatus("字幕切换完成。");
          renderSubtitleSelect();
          sendResponse({ ok: true, payload: getPopupPayload() });
        })
        .catch((error) =>
          sendResponse({ ok: false, error: getErrorMessage(error), payload: getPopupPayload() })
        );
      return true;
    }

    if (message.type === "popup-send-obsidian") {
      sendToObsidian()
        .then(() => sendResponse({ ok: true, payload: getPopupPayload() }))
        .catch((error) =>
          sendResponse({ ok: false, error: getErrorMessage(error), payload: getPopupPayload() })
        );
      return true;
    }

    if (message.type === "popup-trigger-reading-view") {
      state.playerAiQuickActionSuppressedUntil = Date.now() + 2500;
      removePlayerAiQuickActionButton();
      ensureUiReady();
      const readerUrl = String(message.readerUrl || "").trim();
      if (readerUrl) {
        replaceReaderModeUrl(readerUrl);
        document.documentElement.setAttribute("data-blr-reader-mode", "1");
        document.body.setAttribute("data-blr-reader-mode", "1");
      }
      if (!state.readingViewOpen) {
        enterReaderMode().catch((error) => {
          logWarn("[BOC] reading mode trigger failed", error);
        });
      }
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === "sidepanel-get-context") {
      const settings = state.settings || DEFAULT_SETTINGS;
      const body = state.subtitleBody || [];
      let subtitleMarkdown = "";
      try {
        subtitleMarkdown = body.length
          ? buildMarkdown(state, body, { ...settings, includeHotCommentsInNote: false })
          : "";
      } catch (e) {
        subtitleMarkdown = "";
        logWarn("[BOC] sidepanel-get-context: buildMarkdown failed", e);
      }
      sendResponse({
        ok: true,
        payload: {
          url: location.href,
          title: state.title || "",
          author: state.author || "",
          uploadDate: state.uploadDate || "",
          bvid: state.bvid || "",
          cid: state.cid || "",
          aid: state.aid || "",
          pageIndex: Number(state.pageIndex) > 0 ? Number(state.pageIndex) : 1,
          pageCount: Number(state.pageCount) > 0 ? Number(state.pageCount) : 0,
          pageTitle: state.pageTitle || "",
          subtitleBody: body,
          subtitleMarkdown,
          subtitleLang: state.selectedSubtitleLang || "",
          selectedSubtitleId: state.selectedSubtitleId || "",
          selectedSubtitleUrl: state.selectedSubtitleUrl || "",
          subtitleOptions: state.subtitles || [],
          hotComments: []
        }
      });
      return false;
    }

    if (message.type === "sidepanel-get-hot-comments") {
      const count = 20; // 固定取前 20 条热门评论
      if (!count) {
        sendResponse({ ok: true, comments: [] });
        return false;
      }

      if (!getCurrentAid()) {
        state.hotComments = [];
        sendResponse({ ok: true, comments: [], note: "无法获取视频 aid" });
        return false;
      }

      fetchHotComments(count)
        .then((hotComments) => {
          state.hotComments = hotComments;
          sendResponse({ ok: true, comments: hotComments });
        })
        .catch((error) => {
          state.hotComments = [];
          sendResponse({ ok: true, comments: [], note: String(error?.message || error) });
        });
      return true;
    }

    if (message.type === "sidepanel-seek-video-time") {
      const seconds = Number(message.seconds);
      const video = getRuntimeVideoElement();
      if (!video) {
        sendResponse({ ok: false, error: "当前页面没有找到可联动的视频播放器。" });
        return false;
      }
      const nextTime = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
      const wasPaused = Boolean(video.paused);
      video.currentTime = nextTime;
      if (!wasPaused) {
        video.play().catch(() => {});
      }
      if (state.readingViewOpen) {
        state.readingManualScrollPauseUntil = 0;
        state.readingNextScrollBehavior = "auto";
        updateReaderFollowState();
        syncReadingViewPlayback(true);
      }
      sendResponse({ ok: true, currentTime: nextTime });
      return false;
    }

    return false;
  });
}

function bindSettingsWatcher() {
  if (state.settingsWatcherBound || !chrome.storage?.onChanged) {
    return;
  }
  state.settingsWatcherBound = true;

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" && areaName !== "local") {
      return;
    }
    if (
      !changes.enablePlayerAiQuickAction &&
      !changes.playerAiQuickPrompt &&
      !changes.readerTheme &&
      !changes.readerFontScale &&
      !changes.readerFontWeight &&
      !changes.readerLetterSpacing &&
      !changes.readerLineHeight &&
      !changes.readerContentWidth &&
      !changes.readerChapterWidthPx &&
      !changes.readerTranscriptWidthPx &&
      !changes.readerVideoHeightPx &&
      !changes.readerChapterVisibility &&
      !changes.readerTranscriptVisible &&
      !changes.readerTimestampVisible &&
      !changes.readerTranscriptMode
    ) {
      return;
    }

    getSettings()
      .then((settings) => {
        const activeLayout = state.readingViewOpen
          ? {
              chapterWidth: state.readingChapterWidthPx,
              transcriptWidth: state.readingTranscriptWidthPx,
              videoHeight: state.readingVideoHeightPx
            }
          : null;
        state.settings = settings;
        hydrateReaderStateFromSettings(settings);
        // The open reader owns its live drag state. Storage notifications can
        // arrive out of order when two resize handles are used in quick
        // succession, so they must not restore an older column or video size.
        if (activeLayout) {
          state.readingChapterWidthPx = activeLayout.chapterWidth;
          state.readingTranscriptWidthPx = activeLayout.transcriptWidth;
          state.readingVideoHeightPx = activeLayout.videoHeight;
          state.settings = {
            ...state.settings,
            readerChapterWidthPx: activeLayout.chapterWidth,
            readerTranscriptWidthPx: activeLayout.transcriptWidth,
            readerVideoHeightPx: activeLayout.videoHeight
          };
        }
        applyReadingViewPresentation();
        schedulePlayerAiQuickActionSync();
      })
      .catch((error) => {
        logWarn("[BOC] failed to refresh settings after storage change", error);
      });
  });
}

function buildUiHtml() {
  return `
    <aside id="${ids.panel}" aria-hidden="true">
      <header class="blr-header">
        <strong>Default</strong>
        <div class="blr-header-actions">
          <button id="${ids.settingsBtn}" type="button" title="插件设置">设置</button>
          <button id="${ids.closeBtn}" type="button" title="关闭">关闭</button>
        </div>
      </header>

      <p id="${ids.status}" class="blr-status">准备就绪，点击“刷新抓取”开始。</p>
      <div class="blr-props-head">属性</div>
      <div id="${ids.meta}" class="blr-meta"></div>

      <label class="blr-label" for="${ids.subtitleSelect}">字幕语言</label>
      <select id="${ids.subtitleSelect}" disabled>
        <option value="">暂无字幕</option>
      </select>

      <label class="blr-label" for="${ids.preview}">字幕预览</label>
      <textarea id="${ids.preview}" readonly></textarea>

      <div class="blr-actions">
        <button id="${ids.refreshBtn}" type="button">刷新抓取</button>
        <button id="${ids.copyBtn}" type="button">复制完整 Markdown</button>
        <button id="${ids.downloadBtn}" type="button">下载字幕</button>
        <button id="${ids.sendBtn}" type="button">发送到 Obsidian</button>
      </div>
      <p id="${ids.message}" class="blr-message"></p>
    </aside>

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
              <strong class="blr-reading-title">${escapeHtml(state.title || "B站字幕阅读")}</strong>
              <div id="${ids.readingMeta}" class="blr-reading-meta">bilibili.com</div>
            </div>
            <div class="blr-reading-actions">
              <button id="${ids.readingThemeSelect}" type="button" class="blr-reading-icon-btn" title="主题" aria-label="切换主题">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              </button>
              <button id="${ids.readingSettingsBtn}" type="button" class="blr-reading-icon-btn" title="设置" aria-label="设置">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button id="${ids.readingCloseBtn}" type="button" class="blr-reading-icon-btn" title="退出" aria-label="退出阅读视图">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </header>

          <section id="${ids.readingSettingsPanel}" class="blr-reading-panel blr-reading-settings-panel" hidden>
            <section class="blr-reading-settings-group">
              <div class="blr-reading-eyebrow">排版</div>
              <div class="blr-reading-stepper-list">
                ${buildReaderStepperControl({
                  id: ids.readingFontScaleSelect,
                  title: "字号",
                  settingKey: "readerFontScale"
                })}
                ${buildReaderStepperControl({
                  id: ids.readingFontWeightSelect,
                  title: "字重",
                  settingKey: "readerFontWeight"
                })}
                ${buildReaderStepperControl({
                  id: ids.readingLetterSpacingSelect,
                  title: "字间距",
                  settingKey: "readerLetterSpacing"
                })}
                ${buildReaderStepperControl({
                  id: ids.readingLineHeightSelect,
                  title: "行间距",
                  settingKey: "readerLineHeight"
                })}
              </div>
            </section>

            <section class="blr-reading-settings-group">
              <div class="blr-reading-controls">
                <label class="blr-reading-toggle blr-reading-toggle-inline">
                  <input id="${ids.readingAutoScroll}" type="checkbox" checked />
                  <span>滚动</span>
                </label>
                <label class="blr-reading-toggle blr-reading-toggle-inline">
                  <input id="${ids.readingTranscriptVisible}" type="checkbox" checked />
                  <span>字幕</span>
                </label>
                <label class="blr-reading-toggle blr-reading-toggle-inline">
                  <input id="${ids.readingChapterVisible}" type="checkbox" checked />
                  <span>章节</span>
                </label>
                <label class="blr-reading-toggle blr-reading-toggle-inline">
                  <input id="${ids.readingTimestampVisible}" type="checkbox" checked />
                  <span>时间戳</span>
                </label>
              </div>
            </section>

            <section class="blr-reading-settings-group">
              <div class="blr-reading-eyebrow">字幕展示</div>
              <div class="blr-reading-controls">
                <select id="${ids.readingTranscriptModeSelect}" class="blr-reading-select blr-reading-select-sm" aria-label="字幕展示方式">
                  <option value="fragmented">零碎</option>
                  <option value="complete">完整</option>
                </select>
                <select id="${ids.readingSubtitleSelect}" class="blr-reading-select blr-reading-select-sm" aria-label="字幕语言">
                </select>
              </div>
            </section>

            <section class="blr-reading-settings-group blr-reading-info-group">
              <div class="blr-reading-eyebrow">视频摘要</div>
              <div id="${ids.readingInfoSummary}" class="blr-reading-info-list"></div>
            </section>
            <section class="blr-reading-settings-group blr-reading-info-group">
              <div class="blr-reading-eyebrow">视频简介</div>
              <div id="${ids.readingInfoDescription}" class="blr-reading-info-copy"></div>
              <button id="${ids.readingDescriptionBtn}" type="button" class="blr-reading-text-btn">展开简介</button>
            </section>
          </section>

          <p id="${ids.readingStatus}" class="blr-reading-status">使用页面原生播放器联动章节和字幕。</p>

          <div class="blr-reading-player-shell">
            <div id="${ids.readingPlayerSlot}" class="blr-reading-player-slot"></div>
          </div>

          <section class="blr-reading-main">
            <div id="${ids.readingTranscriptList}" class="blr-reading-transcript"></div>
          </section>
        </section>
      </div>
      <div id="${ids.readingChapterResizeHandle}" class="blr-reading-resize-handle blr-reading-resize-handle-left" role="separator" aria-label="上下拖动调整视频高度" aria-orientation="horizontal" aria-valuemin="240" aria-valuemax="900"></div>
      <div id="${ids.readingTranscriptResizeHandle}" class="blr-reading-resize-handle blr-reading-resize-handle-right" role="separator" aria-label="调整视频和字幕宽度" aria-orientation="vertical" aria-valuemin="280" aria-valuemax="720"></div>
    </section>
  `;
}

function bindUiEvents() {
  const panel = byId(ids.panel);
  const closeBtn = byId(ids.closeBtn);
  const refreshBtn = byId(ids.refreshBtn);
  const select = byId(ids.subtitleSelect);
  const copyBtn = byId(ids.copyBtn);
  const downloadBtn = byId(ids.downloadBtn);
  const sendBtn = byId(ids.sendBtn);
  const settingsBtn = byId(ids.settingsBtn);
  const readingView = byId(ids.readingView);
  const readingCloseBtn = byId(ids.readingCloseBtn);
  const readingAutoScroll = byId(ids.readingAutoScroll);
  const readingTranscriptVisible = byId(ids.readingTranscriptVisible);
  const readingTimestampVisible = byId(ids.readingTimestampVisible);
  const readingThemeSelect = byId(ids.readingThemeSelect);
  const readingSettingsToggleBtn = byId(ids.readingSettingsBtn);
  const readingFontScaleSelect = byId(ids.readingFontScaleSelect);
  const readingFontWeightSelect = byId(ids.readingFontWeightSelect);
  const readingLetterSpacingSelect = byId(ids.readingLetterSpacingSelect);
  const readingLineHeightSelect = byId(ids.readingLineHeightSelect);
  const readingDescriptionBtn = byId(ids.readingDescriptionBtn);
  const readingCollectionList = byId(ids.readingCollectionList);
  const chapterList = byId(ids.readingChapterList);
  const transcriptList = byId(ids.readingTranscriptList);

  closeBtn.addEventListener("click", () => panel.classList.remove("open"));
  refreshBtn.addEventListener("click", refreshClip);
  select.addEventListener("change", onSubtitleChange);
  copyBtn.addEventListener("click", copyMarkdown);
  downloadBtn.addEventListener("click", downloadSubtitle);
  sendBtn.addEventListener("click", sendToObsidian);
  settingsBtn.addEventListener("click", requestOpenOptions);
  readingCloseBtn.addEventListener("click", () => {
    if (isReaderMode()) {
      replaceReaderModeUrl(stripReaderModeUrl(location.href));
    }
    closeReadingView();
  });
  readingAutoScroll.addEventListener("change", (event) => {
    state.readingAutoScroll = Boolean(event.target.checked);
    if (state.readingAutoScroll) {
      state.readingManualScrollPauseUntil = 0;
      syncReadingViewPlayback(true);
    }
    updateReaderFollowState();
  });
  readingTranscriptVisible.addEventListener("change", (event) => {
    updateReaderPreferences({ readerTranscriptVisible: Boolean(event.target.checked) }, { persist: true });
    const main = document.querySelector(".blr-reading-main");
    if (main) {
      main.style.display = event.target.checked ? "" : "none";
    }
  });
  readingTimestampVisible.addEventListener("change", (event) => {
    updateReaderPreferences({ readerTimestampVisible: Boolean(event.target.checked) }, { persist: true });
  });
  const readingChapterVisible = byId(ids.readingChapterVisible);
  if (readingChapterVisible) {
    readingChapterVisible.addEventListener("change", (event) => {
      updateReaderPreferences({ readerChapterVisible: Boolean(event.target.checked) }, { persist: true });
    });
  }
  readingThemeSelect.addEventListener("click", () => {
    const themes = ["light", "dark", "paper"];
    const current = state.readingTheme || "light";
    const nextIndex = (themes.indexOf(current) + 1) % themes.length;
    updateReaderPreferences({ readerTheme: themes[nextIndex] }, { persist: true });
    readingThemeSelect.classList.add("is-active");
    setTimeout(() => readingThemeSelect.classList.remove("is-active"), 300);
  });
  readingSettingsToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    state.readingSettingsExpanded = !state.readingSettingsExpanded;
    renderReaderPanels();
  });
  readingDescriptionBtn.addEventListener("click", () => {
    state.readingDescriptionExpanded = !state.readingDescriptionExpanded;
    renderReadingInfoPanel();
  });
  bindReaderStepperControl(readingFontScaleSelect, "readerFontScale");
  bindReaderStepperControl(readingFontWeightSelect, "readerFontWeight");
  bindReaderStepperControl(readingLetterSpacingSelect, "readerLetterSpacing");
  bindReaderStepperControl(readingLineHeightSelect, "readerLineHeight");
  bindReaderResizeHandle(byId(ids.readingChapterResizeHandle), "chapter");
  bindReaderResizeHandle(byId(ids.readingTranscriptResizeHandle), "transcript");

  const readingSubtitleSelect = byId(ids.readingSubtitleSelect);
  const readingTranscriptModeSelect = byId(ids.readingTranscriptModeSelect);
  readingTranscriptModeSelect.addEventListener("change", (event) => {
    updateReaderPreferences({ readerTranscriptMode: event.target.value }, { persist: true });
    renderReadingView();
    syncReadingViewPlayback(true);
  });
  readingSubtitleSelect.addEventListener("change", (event) => {
    const option = event.target.options[event.target.selectedIndex];
    const url = String(option?.value || "");
    if (!url) return;
    loadSubtitle(url, String(option.dataset.lang || "unknown"), state.fetchRunId, String(option.dataset.id || ""))
      .then(() => {
        renderReadingView();
        syncReadingViewPlayback(true);
      })
      .catch((error) => {
        logWarn("[BOC] failed to switch subtitle in reading view", error);
      });
  });

  // Click outside settings panel to close
  if (!state.readingDocumentClickBound) {
    document.addEventListener("click", (e) => {
      if (!state.readingSettingsExpanded) return;
      const settingsPanel = document.getElementById(ids.readingSettingsPanel);
      const settingsBtnEl = document.getElementById(ids.readingSettingsBtn);
      if (!settingsPanel || !settingsBtnEl) {
        return;
      }
      if (!settingsPanel.contains(e.target) && !settingsBtnEl.contains(e.target)) {
        state.readingSettingsExpanded = false;
        renderReaderPanels();
      }
    });
    state.readingDocumentClickBound = true;
  }

  const handleReaderManualScroll = () => {
    if (Date.now() <= state.readingProgrammaticScrollUntil) {
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
    if (!state.readingViewOpen) {
      stopReadingViewSync();
    }
  });
}

function startUrlWatcher() {
  if (state.urlWatcherStarted) {
    return;
  }
  state.urlWatcherStarted = true;

  window.setInterval(() => {
    const nextUrl = location.href;
    const nextSignature = computeCurrentClipSignature();
    if (nextSignature === state.currentClipSignature) {
      return;
    }

    state.currentUrl = nextUrl;
    state.currentClipSignature = nextSignature;
    enforceNormalPageStateIfNeeded(nextUrl);
    ensureUiReady();
    resetClipState({ preserveReadingContent: state.readingViewOpen && isReaderMode(nextUrl) });
    const shouldEnterReaderMode = isReaderMode(nextUrl);
    if (!state.readingViewOpen && shouldEnterReaderMode) {
      document.documentElement.setAttribute("data-blr-reader-mode", "1");
      document.body.setAttribute("data-blr-reader-mode", "1");
      renderReadingStatus("检测到阅读视图跳转，正在打开阅读模式...");
      enterReaderMode().catch((error) => {
        renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
      });
      return;
    }
    if (state.readingViewOpen || shouldEnterReaderMode) {
      renderReadingStatus("检测到视频变化，正在自动刷新字幕...");
      waitForVideoMetadata().then(() => {
        refreshClip().catch((error) => {
          if (!isStaleRunError(error)) {
            renderReadingStatus(`自动刷新失败：${getErrorMessage(error)}`);
          }
        });
      });
      return;
    }
    setStatus("检测到页面变化，请点击“刷新抓取”加载当前视频字幕。");
  }, 1200);
}

function resetClipState({ preserveReadingContent = false } = {}) {
  state.bvid = "";
  state.aid = "";
  state.cid = "";
  state.cidSource = "";
  state.videoDuration = 0;
  if (!preserveReadingContent) {
    state.pageIndex = 1;
    state.pageCount = 0;
    state.pageTitle = "";
    state.collection = null;
    state.description = "";
    state.title = "";
    state.author = "";
    state.uploadDate = "";
    state.subtitles = [];
    state.selectedSubtitleId = "";
    state.selectedSubtitleUrl = "";
    state.selectedSubtitleLang = "";
    state.subtitleBody = [];
    state.chapters = [];
  }
  state.subtitleFetchState = preserveReadingContent ? "loading" : "idle";
  state.hotComments = [];
  state.markdown = "";
  state.srt = "";
  state.txt = "";
  state.currentClipSignature = computeCurrentClipSignature();
  stopReadingViewSync();
  state.readingActiveSubtitleIndex = -1;
  state.readingActiveChapterIndex = -1;
  state.readingVideoEl = null;
  stopReaderPlayerObserver();

  renderMeta();
  if (!preserveReadingContent) {
    renderSubtitleSelect();
    byId(ids.preview).value = "";
  }
  setMessage("");
  if (state.readingViewOpen && !preserveReadingContent) {
    renderReadingView();
    renderReadingStatus("请先点击“刷新抓取”加载当前视频字幕。");
  } else if (state.readingViewOpen) {
    renderReadingStatus("正在切换选集并加载新字幕...");
  }
}

function clearSubtitleContentAfterFetchError() {
  state.selectedSubtitleId = "";
  state.selectedSubtitleUrl = "";
  state.selectedSubtitleLang = "";
  state.subtitleBody = [];
  state.hotComments = [];
  state.markdown = "";
  state.srt = "";
  state.txt = "";
  state.readingActiveSubtitleIndex = -1;

  renderMeta();
  renderSubtitleSelect();
  byId(ids.preview).value = "";
  setMessage("");
}

async function refreshClip() {
  const runId = ++state.fetchRunId;
  try {
    setBusyState(true);
    setMessage("");
    setStatus("正在抓取视频信息...");
    state.subtitleFetchState = "loading";
    if (state.readingViewOpen) {
      renderReadingView();
    }
    state.settings = await getSettings();
    ensureRunActive(runId);

    state.bvid = extractBvid(location.href);
    if (!state.bvid) {
      throw new Error("当前页面不是标准 BV 视频地址，无法抓取字幕。");
    }

    const pageIndex = extractPageIndex(location.href);
    const oid = extractOid(location.href);
    const hasPageParam = hasExplicitPageParam(location.href);
    const meta = await retryAsync(() => fetchVideoMeta(state.bvid), 2, 250);
    ensureRunActive(runId);

    // 调试：打印 API 返回的原始数据
    logInfo("[BOC] raw meta data", {
      meta,
      defaultCid: meta.defaultCid,
      pagesCount: (meta.pages || []).length
    });

    state.aid = meta.aid || "";
    state.title = meta.title || readVideoTitle();
    state.author = meta.author || readVideoAuthor();
    state.uploadDate = meta.uploadDate || readUploadDate();
    state.description = meta.description || readVideoDescription();
    state.pageCount = Array.isArray(meta.pages) ? meta.pages.length : 0;
    state.currentClipSignature = computeCurrentClipSignature();
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
    state.pageIndex = resolvedPageIndex;
    state.pageTitle = currentPage?.part || "";
    state.collection = resolveVideoCollectionCurrent(meta.collection, {
      bvid: state.bvid,
      aid: state.aid,
      pageIndex: resolvedPageIndex
    });
    state.cid = currentPage?.cid || pickCidFromPages(meta.pages, resolvedPageIndex, meta.defaultCid);
    state.cidSource = "meta-pages";
    state.videoDuration = pickDurationFromPages(meta.pages, resolvedPageIndex, meta.defaultDuration);
    if (!(state.videoDuration > 0)) {
      state.videoDuration = readRuntimeVideoDuration();
    }
    if (!(state.videoDuration > 0)) {
      throw new Error("无法获取当前视频时长，已停止抓取以避免串到错误字幕。");
    }

    logInfo("[BOC] resolved video ids", {
      url: location.href,
      aid: state.aid,
      bvid: state.bvid,
      cid: state.cid,
      cidSource: state.cidSource,
      pageIndex: resolvedPageIndex,
      videoDuration: state.videoDuration
    });

    setStatus("正在获取可用字幕...");
    let subtitleBundle = await retryAsync(
      () => fetchSubtitleBundle(state.bvid, state.cid, state.aid),
      3,
      500
    );
    ensureRunActive(runId);
    state.subtitles = normalizeSubtitleTracks(subtitleBundle.tracks);
    state.chapters = normalizeChapters(subtitleBundle.chapters);
    logInfo(
      "[BOC] chapters",
      state.chapters.map((item) => ({
        from: item.from,
        to: item.to,
        title: item.title
      }))
    );
    logInfo(
      "[BOC] subtitle tracks",
      state.subtitles.map((item) => ({
        id: item.id,
        lan: item.lan,
        lanDoc: item.lanDoc,
        url: item.subtitleUrl
      }))
    );

    // 无字幕时也允许进入阅读视图，只是字幕区域保持空态。
    if (state.subtitles.length === 0) {
      applyNoSubtitleState();
      renderMeta();
      renderSubtitleSelect();
      await refreshOpenReadingView("当前视频无字幕。", runId);
      setStatus("当前视频无字幕。");
      return;
    }

    // 显式点击“刷新抓取”时默认走网络，避免命中历史缓存导致字幕错位。
    const forceRefresh = true;

    const preferred = pickPreferredSubtitle(state.subtitles, {
      previousId: state.selectedSubtitleId,
      previousUrl: state.selectedSubtitleUrl,
      previousLang: state.selectedSubtitleLang
    });

    if (!preferred) {
      applyNoSubtitleState();
      renderMeta();
      renderSubtitleSelect();
      await refreshOpenReadingView("当前视频无字幕。", runId);
      setStatus("当前视频无字幕。");
      return;
    }

    const candidates = buildSubtitleCandidates(state.subtitles, preferred);
    let selected = null;

    try {
      selected = await tryLoadSubtitleCandidates(candidates, runId, forceRefresh);
    } catch (error) {
      const message = getErrorMessage(error, "");
      if (!message.includes("HTTP") && error?.code !== "SUBTITLE_DURATION_MISMATCH") {
        throw error;
      }

      // Retry because subtitle signed URLs may expire quickly or hit rate limit.
      subtitleBundle = await retryAsync(
        () => fetchSubtitleBundle(state.bvid, state.cid, state.aid),
        2,
        500
      );
      ensureRunActive(runId);
      state.subtitles = normalizeSubtitleTracks(subtitleBundle.tracks);
      state.chapters = normalizeChapters(subtitleBundle.chapters);
      const retryPreferred = pickPreferredSubtitle(state.subtitles, {
        previousId: preferred.id,
        previousUrl: preferred.subtitleUrl,
        previousLang: preferred.lanDoc || preferred.lan || ""
      });
      if (!retryPreferred) {
        throw error;
      }
      const retryCandidates = buildSubtitleCandidates(state.subtitles, retryPreferred);
      selected = await tryLoadSubtitleCandidates(retryCandidates, runId, forceRefresh);
    }
    ensureRunActive(runId);
    if (selected) {
      logInfo("[BOC] selected subtitle track", {
        id: selected.id,
        lan: selected.lan,
        lanDoc: selected.lanDoc
      });
    }
    state.subtitleFetchState = "ready";
    renderMeta();
    renderSubtitleSelect();
    await refreshOpenReadingView("抓取完成，阅读视图已同步最新字幕。", runId);
    setStatus("抓取完成，可以复制、下载或发送到 Obsidian。");
  } catch (error) {
    if (isStaleRunError(error)) {
      return;
    }
    // 字幕正文与章节列表来自不同请求。字幕域名被拦截、网络失败或签名
    // 过期时，保留已经成功取得的章节和当前视频元数据。
    if (state.bvid && state.cid) {
      clearSubtitleContentAfterFetchError();
      state.subtitleFetchState = "error";
    } else {
      resetClipState();
      state.subtitleFetchState = "error";
    }
    await refreshOpenReadingView("字幕加载失败，请刷新重试。", runId);
    if (error?.code === "SUBTITLE_DURATION_MISMATCH") {
      setStatus("抓取失败：未找到与当前视频时长匹配的字幕轨，可能该视频无可用字幕。");
      return;
    }
    setStatus(`抓取失败：${getErrorMessage(error)}`);
  } finally {
    if (runId === state.fetchRunId) {
      setBusyState(false);
    }
  }
}

async function onSubtitleChange(event) {
  const value = event.target.value;
  const option = event.target.options[event.target.selectedIndex];
  const lang = option?.dataset.lang || "unknown";
  const subtitleId = option?.dataset.id || "";
  if (!value) {
    return;
  }

  try {
    setBusyState(true);
    setStatus(`正在切换字幕：${lang}`);
    setMessage("");
    await loadSubtitle(value, lang, state.fetchRunId, subtitleId);
    setStatus("字幕切换完成。");
  } catch (error) {
    if (isStaleRunError(error)) {
      return;
    }
    setStatus(`切换字幕失败：${getErrorMessage(error)}`);
  } finally {
    setBusyState(false);
  }
}

async function loadSubtitle(url, lang, runId = state.fetchRunId, subtitleId = "", forceRefresh = false) {
  if (!url) {
    throw new Error("字幕 URL 为空。");
  }

  const cacheKey = getSubtitleCacheKey({
    bvid: state.bvid,
    cid: state.cid,
    subtitleId,
    subtitleUrl: url,
    lang
  });

  // 尝试从缓存读取
  if (!forceRefresh) {
    const cachedBody = await loadSubtitleFromCache(cacheKey);
    if (cachedBody && Array.isArray(cachedBody) && cachedBody.length > 0) {
      const cachedCheck = validateSubtitleByDuration(cachedBody, state.videoDuration);
      if (!cachedCheck.ok) {
        logWarn("[BOC] cached subtitle duration mismatch, clearing cache", {
          cacheKey,
          reason: cachedCheck.reason
        });
        await clearSubtitleCacheByKey(cacheKey);
      } else {
        logInfo("[BOC] using cached subtitle", { cacheKey, itemCount: cachedBody.length });
        ensureRunActive(runId);
        state.selectedSubtitleId = subtitleId ? String(subtitleId) : state.selectedSubtitleId;
        state.selectedSubtitleUrl = url;
        state.selectedSubtitleLang = lang;
        state.subtitleBody = cachedBody;
        state.subtitleFetchState = "ready";
        await refreshDerivedContent();
        if (state.readingViewOpen) {
          renderReadingView();
          syncReadingViewPlayback(true);
        }
        return;
      }
    }
  }

  // 从网络获取
  const subtitle = await fetchSubtitleBody(url);
  ensureRunActive(runId);
  const body = Array.isArray(subtitle.body) ? subtitle.body : [];
  if (body.length === 0) {
    throw new Error("字幕文件为空。");
  }
  const durationCheck = validateSubtitleByDuration(body, state.videoDuration);
  if (!durationCheck.ok) {
    const mismatchError = new Error("字幕时长与当前视频不匹配。");
    mismatchError.code = "SUBTITLE_DURATION_MISMATCH";
    mismatchError.details = durationCheck;
    throw mismatchError;
  }

  // 存入缓存
  await saveSubtitleToCache(cacheKey, body);

  state.selectedSubtitleId = subtitleId ? String(subtitleId) : state.selectedSubtitleId;
  state.selectedSubtitleUrl = url;
  state.selectedSubtitleLang = lang;
  state.subtitleBody = body;
  state.subtitleFetchState = "ready";
  await refreshDerivedContent();
  if (state.readingViewOpen) {
    renderReadingView();
    syncReadingViewPlayback(true);
  }
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

async function clearSubtitleCache(bvid, cid, lang) {
  const cacheKey = getSubtitleCacheKey({ bvid, cid, lang });
  try {
    await chrome.storage.local.remove(cacheKey);
    logInfo("[BOC] cleared subtitle cache", { cacheKey });
  } catch (error) {
    logWarn("[BOC] failed to clear subtitle cache", error);
  }
}

function renderMeta() {
  const meta = byId(ids.meta);
  if (!state.bvid) {
    meta.innerHTML = '<div class="blr-meta-item">尚未抓取视频信息</div>';
    return;
  }

  const subtitleCount = state.subtitles.length;
  meta.innerHTML = `
    <div class="blr-meta-item"><strong>标题：</strong>${escapeHtml(state.title)}</div>
    <div class="blr-meta-item"><strong>URL：</strong>${escapeHtml(cleanVideoUrl())}</div>
    <div class="blr-meta-item"><strong>作者：</strong>${escapeHtml(state.author || "未知")}</div>
    <div class="blr-meta-item"><strong>日期：</strong>${escapeHtml(state.uploadDate || "未知")}</div>
    <div class="blr-meta-item"><strong>字幕轨：</strong>${subtitleCount}</div>
  `;
}

function renderSubtitleSelect() {
  const select = byId(ids.subtitleSelect);
  const subtitles = state.subtitles || [];

  if (subtitles.length === 0) {
    select.innerHTML = '<option value="">暂无字幕</option>';
    select.disabled = true;
    return;
  }

  select.innerHTML = subtitles
    .map((item) => {
      const selectedById =
        state.selectedSubtitleId && String(item.id) === String(state.selectedSubtitleId);
      const selectedByUrl = item.subtitleUrl === state.selectedSubtitleUrl;
      const selected = selectedById || selectedByUrl ? "selected" : "";
      const label = item.lanDoc || item.lan || "unknown";
      const isAi = isAiSubtitle(item);
      const aiTag = isAi ? " [AI自动]" : "";
      const optionLabel = `${label}${aiTag}`;
      return `<option value="${escapeHtml(item.subtitleUrl)}" data-lang="${escapeHtml(
        label
      )}" data-id="${escapeHtml(String(item.id || ""))}" data-isai="${isAi}" ${selected}>${escapeHtml(
        optionLabel
      )}</option>`;
    })
    .join("");
  select.disabled = false;
}

function renderReadingSubtitleSelect() {
  const select = byId(ids.readingSubtitleSelect);
  const subtitles = state.subtitles || [];

  if (subtitles.length === 0) {
    select.innerHTML = '<option value="">暂无字幕</option>';
    select.disabled = true;
    return;
  }

  select.innerHTML = subtitles
    .map((item) => {
      const selectedById =
        state.selectedSubtitleId && String(item.id) === String(state.selectedSubtitleId);
      const selectedByUrl = item.subtitleUrl === state.selectedSubtitleUrl;
      const selected = selectedById || selectedByUrl ? "selected" : "";
      const label = item.lanDoc || item.lan || "unknown";
      const isAi = isAiSubtitle(item);
      const aiTag = isAi ? " [AI]" : "";
      const optionLabel = `${label}${aiTag}`;
      return `<option value="${escapeHtml(item.subtitleUrl)}" data-lang="${escapeHtml(
        label
      )}" data-id="${escapeHtml(String(item.id || ""))}" data-isai="${isAi}" ${selected}>${escapeHtml(
        optionLabel
      )}</option>`;
    })
    .join("");
  select.disabled = false;
}

function getPopupPayload() {
  const subtitleOptions = (state.subtitles || []).map((item) => {
    const label = item.lanDoc || item.lan || "unknown";
    const isAi = isAiSubtitle(item);
    const selectedById =
      state.selectedSubtitleId && String(item.id) === String(state.selectedSubtitleId);
    const selectedByUrl = item.subtitleUrl === state.selectedSubtitleUrl;
    return {
      id: String(item.id || ""),
      url: item.subtitleUrl,
      lang: label,
      isAi,
      selected: selectedById || selectedByUrl
    };
  });

  return {
    contentVersion: READER_VERSION,
    url: cleanVideoUrl(),
    title: state.title || "",
    author: state.author || "",
    uploadDate: state.uploadDate || "",
    tags: String(state.settings?.tags || ""),
    status: state.statusText || "",
    message: state.messageText || "",
    subtitlePreview: buildSubtitlePreview(state.subtitleBody || [], state.settings || DEFAULT_SETTINGS),
    markdown: state.markdown || "",
    srt: state.srt || "",
    txt: state.txt || "",
    downloadFormat: normalizeDownloadFormat(state.settings?.downloadFormat),
    subtitleOptions
  };
}

async function copyMarkdown() {
  state.settings = await getSettings();
  await refreshDerivedContent();
  if (!state.markdown) {
    setMessage("没有可复制的内容，请先刷新抓取。");
    return;
  }

  try {
    await navigator.clipboard.writeText(state.markdown);
    setMessage("Markdown 已复制到剪贴板。");
  } catch (error) {
    setMessage(`复制失败：${getErrorMessage(error)}`);
  }
}

async function downloadSubtitle() {
  state.settings = await getSettings();
  rebuildDerivedContent();
  const format = normalizeDownloadFormat(state.settings?.downloadFormat);
  const content = format === "txt" ? state.txt : state.srt;
  if (!content) {
    setMessage("没有可下载的字幕，请先刷新抓取。");
    return;
  }

  const safeTitle = sanitizeFileName(state.title || state.bvid || "bilibili-subtitle");
  const langSuffix = sanitizeFileName(state.selectedSubtitleLang || "subtitle") || "subtitle";
  const filename = `${safeTitle}.${langSuffix}.${format}`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  setMessage(`已下载：${filename}`);
}

async function sendToObsidian() {
  state.settings = await getSettings();
  await refreshDerivedContent();
  if (!state.markdown) {
    setMessage("没有可发送内容，请先刷新抓取。");
    return;
  }

  const filename = buildNoteFilename(state);
  const folder = resolveFolderTemplate(state.settings.noteFolder || "", state);
  const filepath = folder ? `${folder}/${filename}` : filename;
  const baseUrl = String(state.settings.obsidianApiBaseUrl || "").trim();
  const apiKey = String(state.settings.obsidianApiKey || "").trim();
  if (!baseUrl || !apiKey) {
    setMessage("请先在设置中填写 Obsidian Local REST API 地址和 API Key。");
    requestOpenOptions();
    return;
  }

  try {
    const exists = await checkObsidianNoteExists(baseUrl, apiKey, filepath);
    if (exists) {
      const shouldOverwrite = await confirmOverwriteNote(filepath);
      if (!shouldOverwrite) {
        setMessage("已取消保存，原笔记未被覆盖。");
        return;
      }
    }
    await writeNoteByLocalApi(baseUrl, apiKey, filepath, state.markdown);
    setMessage(`已写入 Obsidian：${filepath}`);
  } catch (error) {
    if (isExtensionContextInvalidated(error)) {
      setMessage("扩展刚刚更新，请刷新当前页面后重试。");
      return;
    }
    setMessage(`写入失败：${getErrorMessage(error)}`);
  }
}

async function checkObsidianNoteExists(baseUrl, apiKey, filepath) {
  const resp = await sendRuntimeMessage({
    type: "obsidian-note-exists",
    baseUrl,
    apiKey,
    filepath
  });
  if (!resp?.ok) {
    throw new Error(toReadableText(resp?.error, "Local API 检查失败"));
  }
  return Boolean(resp.exists);
}

async function writeNoteByLocalApi(baseUrl, apiKey, filepath, content) {
  const resp = await sendRuntimeMessage({
    type: "write-obsidian-note",
    baseUrl,
    apiKey,
    filepath,
    content
  });
  if (!resp?.ok) {
    throw new Error(toReadableText(resp?.error, "Local API 写入失败"));
  }
}

function confirmOverwriteNote(filepath) {
  return new Promise((resolve) => {
    const existing = document.querySelector(".blr-confirm-overlay");
    if (existing) {
      existing.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "blr-confirm-overlay";
    overlay.innerHTML = `
      <div class="blr-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="blrConfirmTitle">
        <div id="blrConfirmTitle" class="blr-confirm-title">该笔记已存在</div>
        <div class="blr-confirm-body">继续会覆盖原内容：</div>
        <div class="blr-confirm-path"></div>
        <div class="blr-confirm-actions">
          <button type="button" class="blr-confirm-cancel">取消</button>
          <button type="button" class="blr-confirm-primary">覆盖</button>
        </div>
      </div>
    `;
    overlay.querySelector(".blr-confirm-path").textContent = String(filepath || "");

    const cleanup = (value) => {
      overlay.remove();
      document.removeEventListener("keydown", onKeydown, true);
      resolve(value);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cleanup(false);
      }
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        cleanup(false);
      }
    });
    overlay.querySelector(".blr-confirm-cancel")?.addEventListener("click", () => cleanup(false));
    overlay.querySelector(".blr-confirm-primary")?.addEventListener("click", () => cleanup(true));
    document.addEventListener("keydown", onKeydown, true);
    document.body.appendChild(overlay);
    overlay.querySelector(".blr-confirm-primary")?.focus();
  });
}

function setBusyState(disabled) {
  byId(ids.copyBtn).disabled = disabled;
  byId(ids.downloadBtn).disabled = disabled;
  byId(ids.sendBtn).disabled = disabled;
  byId(ids.refreshBtn).disabled = disabled;
  byId(ids.settingsBtn).disabled = disabled;
  byId(ids.subtitleSelect).disabled = disabled || state.subtitles.length === 0;
}

function setStatus(text) {
  state.statusText = String(text || "");
  byId(ids.status).textContent = state.statusText;
}

function setMessage(text) {
  state.messageText = String(text || "");
  byId(ids.message).textContent = state.messageText;
}

function applyNoSubtitleState() {
  state.selectedSubtitleId = "";
  state.selectedSubtitleUrl = "";
  state.selectedSubtitleLang = "";
  state.subtitleBody = [];
  state.subtitleFetchState = "empty";
  state.hotComments = [];
  state.markdown = "";
  state.srt = "";
  state.txt = "";
  byId(ids.preview).value = "";
}

function cleanupReaderFloatingArtifacts(playerHost = state.readingPlayerHost) {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().catch(() => {});
  }
  dismissReaderMiniPlayer(playerHost);
  const runtimeHost = findReaderPlayerHost(getRuntimeVideoElement());
  if (runtimeHost && runtimeHost !== playerHost) {
    dismissReaderMiniPlayer(runtimeHost);
  }
}

async function enterReaderMode() {
  const readingView = byId(ids.readingView);
  state.readingViewOpen = true;
  state.readingNativePageMode = true;
  document.body.setAttribute("data-blr-reading-active", "1");
  hydrateReaderStateFromSettings(state.settings);
  applyReadingViewPresentation();
  alignReaderViewportToPlayer();
  await sleep(0);
  openReaderViewShell(readingView);
  applyReaderPageFocus();
  renderReadingView();

  const earlyPlayerHost = findReaderPlayerHost(getRuntimeVideoElement());
  if (earlyPlayerHost) {
    earlyPlayerHost.setAttribute("data-blr-reader-fading", "1");
  }

  await sleep(0);

  // Try to mount player, with more retries for slower pages (like watch later)
  const mounted = await ensureReaderPlayerMounted({ retries: 50, delayMs: 150, forceLayout: true });
  const mountedPlayerHost = state.readingPlayerHost || earlyPlayerHost;
  if (mountedPlayerHost) {
    mountedPlayerHost.removeAttribute("data-blr-reader-fading");
  }
  if (!mounted) {
    // Don't throw - keep UI open and keep retrying in background
    renderReadingStatus("正在等待视频播放器就绪...");
    scheduleReaderPlayerRetry();
    return;
  }

  finishEnterReaderMode();
}

function scheduleReaderPlayerRetry() {
  if (state.readingPlayerRetryTimer) {
    window.clearTimeout(state.readingPlayerRetryTimer);
    state.readingPlayerRetryTimer = 0;
  }
  // Keep trying to mount player in background
  const tryMount = async () => {
    state.readingPlayerRetryTimer = 0;
    if (!state.readingViewOpen || !isReaderMode()) return;
    const mounted = await ensureReaderPlayerMounted({ retries: 10, delayMs: 200, forceLayout: true });
    const retryHost = state.readingPlayerHost;
    if (retryHost) {
      retryHost.removeAttribute("data-blr-reader-fading");
    }
    if (mounted) {
      finishEnterReaderMode();
    } else if (state.readingViewOpen) {
      state.readingPlayerRetryTimer = window.setTimeout(tryMount, 500);
    }
  };
  state.readingPlayerRetryTimer = window.setTimeout(tryMount, 500);
}

function finishEnterReaderMode() {
  if (!state.readingViewOpen || !isReaderMode()) return;

  alignReaderViewportToPlayer();
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
  readingView.classList.add("open", "reader-page");
  readingView.setAttribute("aria-hidden", "false");
  setReadingViewReady(false);
  renderReadingStatus("正在准备播放器和字幕...");
}

function maybeRefreshReaderSubtitleInBackground() {
  if (state.subtitleBody.length) {
    return;
  }
  waitForVideoMetadata().then(() => {
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

async function ensureReaderPlayerMounted({ retries = 1, delayMs = 100, forceLayout = false } = {}) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const video = getRuntimeVideoElement();
    const playerHost = findReaderPlayerHost(video);
    if (video && playerHost) {
      const previousHost = state.readingPlayerHost;
      const previousVideo = state.readingVideoEl;
      video.controls = false;
      video.removeAttribute("controls");
      video.disablePictureInPicture = true;
      video.setAttribute("disablepictureinpicture", "");
      video.removeAttribute("autopictureinpicture");
      state.readingPlayerHost = playerHost;
      const miniPlayerClosed = dismissReaderMiniPlayer(playerHost);
      if (miniPlayerClosed) {
        await sleep(120);
      }
      const activeHost = findReaderPlayerHost(video) || playerHost;
      state.readingPlayerHost = activeHost;
      normalizeReaderPlayerContainer(activeHost);
      if (state.readingNativePageMode) {
        clearNativeReaderFloatingStyles(activeHost);
        if (hasNativeReaderPlayerLayoutIssue(activeHost)) {
          normalizeReaderPlayerContainer(activeHost);
          clearNativeReaderFloatingStyles(activeHost);
        }
      }
      if (previousHost && previousHost !== activeHost) {
        setReaderPlayerControlsVisible(false, previousHost);
        cleanupReaderPlayerHostNode(previousHost);
      }
      if (previousVideo !== video) {
        state.readingVideoEventsBound = false;
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
        (state.readingNativePageMode && hasNativeReaderPlayerLayoutIssue(activeHost))
      ) {
        layoutReaderPlayerHost();
        if (state.readingNativePageMode && hasNativeReaderPlayerLayoutIssue(activeHost)) {
          normalizeReaderPlayerContainer(activeHost);
          clearNativeReaderFloatingStyles(activeHost);
          layoutReaderPlayerHost();
        }
      }
      if (state.readingNativePageMode && !isWatchlaterPage()) {
        await ensureReaderPlayerControlsRecovered(activeHost, {
          reason: attempt > 0 ? "mount-retry" : "mount"
        });
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
  if (!state.readingViewOpen || !isReaderMode() || state.readingPlayerMountTimer) {
    return;
  }
  state.readingPlayerMountTimer = window.setTimeout(() => {
    state.readingPlayerMountTimer = 0;
    ensureReaderPlayerMounted({ retries: 12, delayMs: 120, forceLayout: true })
      .then((mounted) => {
        if (!mounted || !state.readingViewOpen || !isReaderMode()) {
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

function findReaderPlayerHost(video) {
  if (!video) {
    return null;
  }

  return (
    video.closest(".bpx-player-container") ||
    video.closest(".bpx-player-video-area") ||
    video.closest("#bilibili-player") ||
    video.parentElement
  );
}

function closeReadingView() {
  cleanupReaderFloatingArtifacts();
  state.readingViewOpen = false;
  state.readingNativePageMode = false;
  state.readingViewReady = false;
  state.readingSettingsExpanded = false;
  state.readingManualScrollPauseUntil = 0;
  state.readingProgrammaticScrollUntil = 0;
  state.readingCollectionSwitchInFlight = false;
  state.readingNextScrollBehavior = "smooth";
  if (state.readingPlayerRetryTimer) {
    window.clearTimeout(state.readingPlayerRetryTimer);
    state.readingPlayerRetryTimer = 0;
  }
  const readingView = byId(ids.readingView);
  readingView.classList.remove("open", "reader-page");
  readingView.setAttribute("aria-hidden", "true");
  readingView.setAttribute("data-blr-reader-ready", "0");
  readingView.removeAttribute("data-blr-reader-follow");
  document.body.removeAttribute("data-blr-reading-active");
  document.documentElement.removeAttribute("data-blr-reader-mode");
  document.body.removeAttribute("data-blr-reader-mode");
  document.documentElement.removeAttribute("data-blr-reader-theme");
  document.documentElement.removeAttribute("data-blr-reader-font-scale");
  document.documentElement.removeAttribute("data-blr-reader-font-weight");
  document.documentElement.removeAttribute("data-blr-reader-letter-spacing");
  document.documentElement.removeAttribute("data-blr-reader-line-height");
  document.documentElement.removeAttribute("data-blr-reader-content-width");
  document.documentElement.removeAttribute("data-blr-reader-chapter-visibility");
  document.documentElement.removeAttribute("data-blr-reader-has-chapters");
  document.documentElement.removeAttribute("data-blr-reader-transcript-visible");
  document.documentElement.removeAttribute("data-blr-reader-timestamp-visible");
  document.documentElement.removeAttribute("data-blr-reader-transcript-mode");
  document.body.removeAttribute("data-blr-reader-theme");
  document.body.removeAttribute("data-blr-reader-font-scale");
  document.body.removeAttribute("data-blr-reader-font-weight");
  document.body.removeAttribute("data-blr-reader-letter-spacing");
  document.body.removeAttribute("data-blr-reader-line-height");
  document.body.removeAttribute("data-blr-reader-content-width");
  document.body.removeAttribute("data-blr-reader-chapter-visibility");
  document.body.removeAttribute("data-blr-reader-has-chapters");
  document.body.removeAttribute("data-blr-reader-transcript-visible");
  document.body.removeAttribute("data-blr-reader-timestamp-visible");
  document.body.removeAttribute("data-blr-reader-transcript-mode");
  document.body.removeAttribute("data-blr-reader-resizing");
  const pageReaderEntry = document.getElementById("blr-page-reader-entry");
  if (pageReaderEntry) {
    pageReaderEntry.disabled = false;
    pageReaderEntry.classList.remove("is-loading");
  }
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
  clearReaderPageFocus();
  const sendingBar = document.querySelector(".bpx-player-sending-bar");
  if (sendingBar) {
    sendingBar.setAttribute("data-blr-reader-hide-sending-bar", "1");
    sendingBar.style.setProperty("display", "none", "important");
    window.setTimeout(() => {
      sendingBar.style.removeProperty("display");
      sendingBar.removeAttribute("data-blr-reader-hide-sending-bar");
    }, 200);
  }
  window.setTimeout(() => cleanupReaderFloatingArtifacts(), 40);
  window.setTimeout(() => cleanupReaderFloatingArtifacts(), 220);
}

function renderReadingView() {
  const titleNode = document.querySelector(".blr-reading-title");
  const pageTitleNode = byId(ids.readingPageTitle);
  const metaNode = byId(ids.readingMeta);
  const chapterList = byId(ids.readingChapterList);
  const transcriptList = byId(ids.readingTranscriptList);
  const chapters = normalizeChapters(state.chapters || []);
  const body = Array.isArray(state.subtitleBody) ? state.subtitleBody : [];
  const transcriptItems = getReadingTranscriptItems();
  const withHours = shouldShowHoursInNote(state, body);
  const hasChapters = chapters.length > 0;

  if (titleNode) {
    titleNode.textContent = state.title || "B站字幕阅读";
  }
  if (pageTitleNode) {
    pageTitleNode.textContent = state.title || "B站字幕阅读";
    pageTitleNode.title = pageTitleNode.textContent;
  }
  if (metaNode) {
    metaNode.textContent = buildReadingMetaLine();
  }
  renderReadingCollection();

  if (chapters.length === 0) {
    chapterList.innerHTML = '<div class="blr-reading-empty">当前视频没有章节。</div>';
  } else {
    chapterList.innerHTML = chapters
      .map(
        (item, index) => `
          <button
            type="button"
            class="blr-reading-chapter"
            data-index="${index}"
            data-seconds="${Number(item.from || 0) || 0}"
          >
            <span class="blr-reading-chapter-time">${escapeHtml(
              formatCompactTimestamp(item.from, withHours)
            )}</span>
            <span class="blr-reading-chapter-title">${escapeHtml(item.title)}</span>
          </button>
        `
      )
      .join("");
  }

  if (transcriptItems.length === 0) {
    transcriptList.innerHTML = `<div class="blr-reading-empty">${escapeHtml(
      getReadingTranscriptPlaceholderText()
    )}</div>`;
  } else if (state.readingTranscriptMode === "complete") {
    transcriptList.innerHTML = `
      <div class="blr-reading-complete" role="document">
        ${transcriptItems
          .map(
            (item) => `
              <button
                type="button"
                class="blr-reading-complete-segment"
                data-index="${item.index}"
                data-seconds="${item.from}"
                aria-label="${escapeHtml(formatCompactTimestamp(item.from, withHours))} ${escapeHtml(item.content)}"
              >${escapeHtml(item.content)}</button>
            `
          )
          .join(" ")}
      </div>
    `;
    transcriptList.insertAdjacentHTML(
      "beforeend",
      `<div id="${ids.readingTranscriptTailSpacer}" class="blr-reading-tail-spacer" aria-hidden="true"></div>`
    );
  } else {
    transcriptList.innerHTML = transcriptItems
      .map(
        (item) => `
          <button
            type="button"
            class="blr-reading-item"
            data-index="${item.index}"
            data-seconds="${item.from}"
          >
            <span class="blr-reading-time">${escapeHtml(
              formatCompactTimestamp(item.from, withHours)
            )}</span>
            <span class="blr-reading-text">${escapeHtml(item.content)}</span>
          </button>
        `
      )
      .join("");
    transcriptList.insertAdjacentHTML(
      "beforeend",
      `<div id="${ids.readingTranscriptTailSpacer}" class="blr-reading-tail-spacer" aria-hidden="true"></div>`
    );
  }

  updateReaderChapterPresence(hasChapters);
  renderReadingInfoPanel();
  renderReadingSubtitleSelect();
  renderReaderPanels();
  applyReadingViewPresentation();
  updateReadingTranscriptTailSpacer();
  state.readingActiveSubtitleIndex = -1;
  state.readingActiveChapterIndex = -1;
}

function renderReadingCollection() {
  const episodeTitle = byId(ids.readingEpisodeTitle);
  const collectionNav = byId(ids.readingCollectionNav);
  const collectionList = byId(ids.readingCollectionList);
  const collection = state.collection;
  const episodes = Array.isArray(collection?.episodes) ? collection.episodes : [];
  const hasCollection = episodes.length > 1;

  if (!hasCollection) {
    episodeTitle.hidden = true;
    episodeTitle.textContent = "";
    episodeTitle.removeAttribute("title");
    collectionNav.hidden = true;
    collectionList.innerHTML = "";
    return;
  }

  const currentIndex = Number(collection.currentIndex);
  const currentEpisode = currentIndex >= 0 ? episodes[currentIndex] : null;
  episodeTitle.textContent = currentEpisode?.title || state.pageTitle || state.title || "";
  episodeTitle.hidden = !episodeTitle.textContent;
  episodeTitle.title = episodeTitle.textContent;
  collectionList.innerHTML = episodes
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
    .join("");

  collectionNav.hidden = false;
  window.requestAnimationFrame(() => {
    collectionList.querySelector(".is-active")?.scrollIntoView({
      behavior: "auto",
      block: "center",
      inline: "nearest"
    });
  });
}

function getReadingTranscriptPlaceholderText() {
  if (state.subtitleFetchState === "loading") {
    return "正在加载字幕...";
  }
  if (state.subtitleFetchState === "error") {
    return "字幕加载失败，请刷新重试。";
  }
  return "当前视频无字幕。";
}

function getReadingTranscriptItems(body = state.subtitleBody) {
  return (Array.isArray(body) ? body : [])
    .map((item, index) => ({
      index,
      from: Number(item?.from || 0) || 0,
      to: Number(item?.to || 0) || 0,
      content: String(item?.content || "").trim()
    }))
    .filter((item) => item.content);
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
  spacer.style.height = `${spacerHeight}px`;
}

function hydrateReaderStateFromSettings(settings = state.settings) {
  state.readingTheme = normalizeReaderTheme(settings?.readerTheme);
  state.readingFontScale = normalizeReaderFontScale(settings?.readerFontScale);
  state.readingFontWeight = normalizeReaderFontWeight(settings?.readerFontWeight);
  state.readingLetterSpacing = normalizeReaderLetterSpacing(settings?.readerLetterSpacing ?? settings?.readerLineHeight);
  state.readingLineHeight = normalizeReaderLineHeight(settings?.readerLineHeight);
  state.readingContentWidth = normalizeReaderContentWidth(settings?.readerContentWidth);
  state.readingChapterWidthPx = normalizeReaderColumnWidth(settings?.readerChapterWidthPx, 220, 140, 360);
  state.readingTranscriptWidthPx = normalizeReaderColumnWidth(settings?.readerTranscriptWidthPx, 440, 280, 720);
  state.readingVideoHeightPx = normalizeReaderVideoHeight(settings?.readerVideoHeightPx);
  state.readingChapterVisible = settings?.readerChapterVisible !== undefined ? Boolean(settings.readerChapterVisible) : true;
  state.readingTranscriptVisible = normalizeReaderTranscriptVisible(settings?.readerTranscriptVisible);
  state.readingTimestampVisible = normalizeReaderTimestampVisible(settings?.readerTimestampVisible);
  state.readingTranscriptMode = normalizeReaderTranscriptMode(settings?.readerTranscriptMode);
}

function applyReadingViewPresentation() {
  const readingView = byId(ids.readingView);
  readingView.dataset.theme = state.readingTheme;
  readingView.dataset.fontScale = state.readingFontScale;
  readingView.dataset.fontWeight = state.readingFontWeight;
  readingView.dataset.letterSpacing = state.readingLetterSpacing;
  readingView.dataset.lineHeight = state.readingLineHeight;
  readingView.dataset.contentWidth = state.readingContentWidth;
  readingView.dataset.chapterVisibility = state.readingChapterVisible ? "auto" : "hide";
  readingView.dataset.transcriptVisible = state.readingTranscriptVisible ? "1" : "0";
  readingView.dataset.timestampVisible = state.readingTimestampVisible ? "1" : "0";
  readingView.dataset.transcriptMode = state.readingTranscriptMode;
  document.documentElement.dataset.blrReaderTheme = state.readingTheme;
  document.documentElement.dataset.blrReaderFontScale = state.readingFontScale;
  document.documentElement.dataset.blrReaderFontWeight = state.readingFontWeight;
  document.documentElement.dataset.blrReaderLetterSpacing = state.readingLetterSpacing;
  document.documentElement.dataset.blrReaderLineHeight = state.readingLineHeight;
  document.documentElement.dataset.blrReaderContentWidth = state.readingContentWidth;
  document.documentElement.dataset.blrReaderChapterVisibility = state.readingChapterVisible ? "auto" : "hide";
  document.documentElement.dataset.blrReaderTranscriptVisible = state.readingTranscriptVisible ? "1" : "0";
  document.documentElement.dataset.blrReaderTimestampVisible = state.readingTimestampVisible ? "1" : "0";
  document.documentElement.dataset.blrReaderTranscriptMode = state.readingTranscriptMode;
  document.body.dataset.blrReaderTheme = state.readingTheme;
  document.body.dataset.blrReaderFontScale = state.readingFontScale;
  document.body.dataset.blrReaderFontWeight = state.readingFontWeight;
  document.body.dataset.blrReaderLetterSpacing = state.readingLetterSpacing;
  document.body.dataset.blrReaderLineHeight = state.readingLineHeight;
  document.body.dataset.blrReaderContentWidth = state.readingContentWidth;
  document.body.dataset.blrReaderChapterVisibility = state.readingChapterVisible ? "auto" : "hide";
  document.body.dataset.blrReaderTranscriptVisible = state.readingTranscriptVisible ? "1" : "0";
  document.body.dataset.blrReaderTimestampVisible = state.readingTimestampVisible ? "1" : "0";
  document.body.dataset.blrReaderTranscriptMode = state.readingTranscriptMode;
  applyReaderColumnLayout();
  const readingChapterVisibleEl = byId(ids.readingChapterVisible);
  if (readingChapterVisibleEl) {
    readingChapterVisibleEl.checked = state.readingChapterVisible;
  }
  const main = document.querySelector(".blr-reading-main");
  if (main) {
    main.style.display = state.readingTranscriptVisible ? "" : "none";
  }
  const inlineHost = document.getElementById("blr-reading-inline-host");
  if (inlineHost) {
    const leftContainer = document.querySelector(".left-container");
    const bgColor = leftContainer ? getComputedStyle(leftContainer).backgroundColor : "";
    if (state.readingTranscriptVisible) {
      inlineHost.style.border = "";
      inlineHost.style.background = "";
      inlineHost.style.marginTop = "";
      inlineHost.style.boxShadow = "";
      inlineHost.style.borderRadius = "";
    } else {
      inlineHost.style.border = "none";
      inlineHost.style.background = bgColor;
      inlineHost.style.marginTop = "0";
      inlineHost.style.boxShadow = "none";
      inlineHost.style.borderRadius = "0";
    }
  }
}

function updateReaderChapterPresence(hasChapters) {
  const value = hasChapters ? "1" : "0";
  const readingView = byId(ids.readingView);
  readingView.dataset.hasChapters = value;
  document.documentElement.dataset.blrReaderHasChapters = value;
  document.body.dataset.blrReaderHasChapters = value;
}

function getToggleLabel(key, value) {
  const labels = {
    fontScale: { xs: "最小", s: "偏小", m: "标准", l: "偏大", xl: "最大" },
    fontWeight: { light: "最细", regular: "偏细", normal: "标准", semibold: "偏粗", bold: "最粗" },
    letterSpacing: { tighter: "最紧", tight: "偏紧", normal: "标准", relaxed: "偏松", loose: "最松" },
    lineHeight: { compact: "最紧", tight: "偏紧", normal: "标准", relaxed: "偏松", loose: "最松" },
    contentWidth: { compact: "最窄", narrow: "偏窄", medium: "标准", wide: "偏宽", full: "最宽" }
  };
  return labels[key]?.[value] || "标准";
}

function getReaderStepperConfig(settingKey) {
  const configs = {
    readerFontScale: {
      options: ["xs", "s", "m", "l", "xl"],
      labelKey: "fontScale",
      getCurrent: () => state.readingFontScale,
      buildPayload: (value) => ({ readerFontScale: value })
    },
    readerFontWeight: {
      options: ["light", "regular", "normal", "semibold", "bold"],
      labelKey: "fontWeight",
      getCurrent: () => state.readingFontWeight,
      buildPayload: (value) => ({ readerFontWeight: value })
    },
    readerLetterSpacing: {
      options: ["tighter", "tight", "normal", "relaxed", "loose"],
      labelKey: "letterSpacing",
      getCurrent: () => state.readingLetterSpacing,
      buildPayload: (value) => ({ readerLetterSpacing: value })
    },
    readerLineHeight: {
      options: ["compact", "tight", "normal", "relaxed", "loose"],
      labelKey: "lineHeight",
      getCurrent: () => state.readingLineHeight,
      buildPayload: (value) => ({ readerLineHeight: value })
    },
    readerContentWidth: {
      options: ["compact", "narrow", "medium", "wide", "full"],
      labelKey: "contentWidth",
      getCurrent: () => state.readingContentWidth,
      buildPayload: (value) => ({ readerContentWidth: value })
    }
  };
  return configs[settingKey] || null;
}

function buildReaderStepperControl({
  id,
  title,
  settingKey
}) {
  const config = getReaderStepperConfig(settingKey);
  if (!config) {
    return "";
  }
  return `
    <div id="${id}" class="blr-reading-stepper" data-reader-setting-id="${id}">
      <span class="blr-reading-stepper-title">${escapeHtml(title)}</span>
      <div class="blr-reading-stepper-buttons" role="group" aria-label="${escapeHtml(title)}">
        ${config.options
          .map(
            (option, index) => `
          <button
            type="button"
            class="blr-reading-stepper-btn"
            data-value="${escapeHtml(option)}"
            aria-label="${escapeHtml(title)} ${escapeHtml(getToggleLabel(config.labelKey, option))}"
            title="${escapeHtml(getToggleLabel(config.labelKey, option))}"
          >${index + 1}</button>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function bindReaderStepperControl(node, settingKey) {
  if (!node || node.dataset.blrBound === "1") {
    return;
  }

  node.addEventListener("click", (event) => {
    const button = event.target.closest("[data-value]");
    if (!button) {
      return;
    }
    setReaderPreference(settingKey, button.dataset.value || "");
  });
  node.dataset.blrBound = "1";
}

function bindReaderResizeHandle(node, side) {
  if (!node || node.dataset.blrBound === "1") return;

  node.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || window.innerWidth <= 1180) return;
    event.preventDefault();
    node.setPointerCapture?.(event.pointerId);
    document.body.dataset.blrReaderResizing = side;
    const playerRect = getReaderPlayerWrapNode()?.getBoundingClientRect?.();

    const move = (moveEvent) => {
      const pagePadding = getReaderPagePaddingPx();
      const halfGap = Math.min(24, Math.max(16, window.innerWidth * 0.014)) / 2;
      if (side === "chapter") {
        if (!playerRect) return;
        const maxHeight = Math.max(240, window.innerHeight - playerRect.top - 148);
        state.readingVideoHeightPx = Math.round(
          Math.min(maxHeight, Math.max(240, moveEvent.clientY - playerRect.top))
        );
      } else {
        state.readingTranscriptWidthPx = normalizeReaderColumnWidth(
          window.innerWidth - pagePadding - moveEvent.clientX - halfGap,
          state.readingTranscriptWidthPx,
          280,
          720
        );
      }
      applyReaderColumnLayout();
      layoutReaderPlayerHost();
    };

    const stop = () => {
      node.releasePointerCapture?.(event.pointerId);
      document.body.removeAttribute("data-blr-reader-resizing");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      state.settings = {
        ...state.settings,
        readerChapterWidthPx: state.readingChapterWidthPx,
        readerTranscriptWidthPx: state.readingTranscriptWidthPx,
        readerVideoHeightPx: state.readingVideoHeightPx
      };
      persistReaderSettings();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  });
  node.dataset.blrBound = "1";
}

function setReaderPreference(settingKey, nextValue) {
  const config = getReaderStepperConfig(settingKey);
  if (!config) {
    return;
  }

  const current = config.getCurrent();
  if (!config.options.includes(nextValue) || nextValue === current) {
    return;
  }
  updateReaderPreferences(config.buildPayload(nextValue), { persist: true });
}

function renderReaderStepperState(node, settingKey) {
  const config = getReaderStepperConfig(settingKey);
  if (!node || !config) {
    return;
  }

  const current = config.getCurrent();
  node.querySelectorAll("[data-value]").forEach((button) => {
    const isActive = button.dataset.value === current;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderReaderPanels() {
  const settingsPanel = byId(ids.readingSettingsPanel);
  const settingsBtn = byId(ids.readingSettingsBtn);
  settingsPanel.hidden = !state.readingSettingsExpanded;
  settingsBtn.classList.toggle("is-active", state.readingSettingsExpanded);
  byId(ids.readingAutoScroll).checked = state.readingAutoScroll;
  byId(ids.readingTranscriptVisible).checked = state.readingTranscriptVisible;
  byId(ids.readingTimestampVisible).checked = state.readingTimestampVisible;
  byId(ids.readingTranscriptModeSelect).value = state.readingTranscriptMode;
  renderReaderStepperState(byId(ids.readingFontScaleSelect), "readerFontScale");
  renderReaderStepperState(byId(ids.readingFontWeightSelect), "readerFontWeight");
  renderReaderStepperState(byId(ids.readingLetterSpacingSelect), "readerLetterSpacing");
  renderReaderStepperState(byId(ids.readingLineHeightSelect), "readerLineHeight");
}

function renderReadingInfoPanel() {
  const summaryNode = byId(ids.readingInfoSummary);
  const descriptionNode = byId(ids.readingInfoDescription);
  const descriptionBtn = byId(ids.readingDescriptionBtn);
  const summaryItems = buildReadingSummaryItems();
  const description = String(state.description || "").trim();

  summaryNode.innerHTML =
    summaryItems.length === 0
      ? '<div class="blr-reading-empty">当前视频信息还未就绪。</div>'
      : summaryItems
          .map(
            (item) => `
              <div class="blr-reading-info-item">
                <span class="blr-reading-info-label">${escapeHtml(item.label)}</span>
                <span class="blr-reading-info-value">${escapeHtml(item.value)}</span>
              </div>
            `
          )
          .join("");

  if (!description) {
    descriptionNode.innerHTML = '<div class="blr-reading-empty">当前视频没有简介。</div>';
    descriptionNode.classList.remove("is-collapsed");
    descriptionBtn.hidden = true;
  } else {
    descriptionNode.textContent = description;
    const fullScrollHeight = descriptionNode.scrollHeight;
    descriptionNode.classList.add("is-collapsed");
    const clampedClientHeight = descriptionNode.clientHeight;
    descriptionNode.classList.toggle("is-collapsed", !state.readingDescriptionExpanded);
    const hasOverflow = fullScrollHeight > clampedClientHeight + 2;
    if (!hasOverflow) {
      descriptionNode.classList.remove("is-collapsed");
      descriptionBtn.hidden = true;
      return;
    }
    descriptionBtn.hidden = false;
    descriptionBtn.textContent = state.readingDescriptionExpanded ? "收起简介" : "查看更多";
  }
}

function buildReadingSummaryItems() {
  const items = [];
  if (state.title) {
    items.push({ label: "标题", value: state.title });
  }
  if (state.author) {
    items.push({ label: "作者", value: state.author });
  }
  if (state.uploadDate) {
    items.push({ label: "日期", value: state.uploadDate });
  }
  if (Number(state.pageCount) > 1) {
    const pageParts = [`P${Number(state.pageIndex) > 0 ? Number(state.pageIndex) : 1}`];
    if (state.pageTitle) {
      pageParts.push(state.pageTitle);
    }
    items.push({ label: "分P", value: pageParts.join(" ") });
  }
  return items;
}

function updateReaderPreferences(next, { persist = true } = {}) {
  state.readingTheme = normalizeReaderTheme(next.readerTheme ?? state.readingTheme);
  state.readingFontScale = normalizeReaderFontScale(next.readerFontScale ?? state.readingFontScale);
  state.readingFontWeight = normalizeReaderFontWeight(next.readerFontWeight ?? state.readingFontWeight);
  state.readingLetterSpacing = normalizeReaderLetterSpacing(
    next.readerLetterSpacing ?? state.readingLetterSpacing
  );
  state.readingLineHeight = normalizeReaderLineHeight(next.readerLineHeight ?? state.readingLineHeight);
  state.readingContentWidth = normalizeReaderContentWidth(next.readerContentWidth ?? state.readingContentWidth);
  state.readingChapterVisible = next.readerChapterVisible !== undefined ? Boolean(next.readerChapterVisible) : state.readingChapterVisible;
  state.readingTranscriptVisible = normalizeReaderTranscriptVisible(
    next.readerTranscriptVisible ?? state.readingTranscriptVisible
  );
  state.readingTimestampVisible = normalizeReaderTimestampVisible(
    next.readerTimestampVisible ?? state.readingTimestampVisible
  );
  state.readingTranscriptMode = normalizeReaderTranscriptMode(
    next.readerTranscriptMode ?? state.readingTranscriptMode
  );
  state.settings = {
    ...state.settings,
    readerTheme: state.readingTheme,
    readerFontScale: state.readingFontScale,
    readerFontWeight: state.readingFontWeight,
    readerLetterSpacing: state.readingLetterSpacing,
    readerLineHeight: state.readingLineHeight,
    readerContentWidth: state.readingContentWidth,
    readerChapterVisible: state.readingChapterVisible,
    readerTranscriptVisible: state.readingTranscriptVisible,
    readerTimestampVisible: state.readingTimestampVisible,
    readerTranscriptMode: state.readingTranscriptMode
  };
  applyReadingViewPresentation();
  renderReaderPanels();
  if (persist) {
    persistReaderSettings();
  }
}

function persistReaderSettings() {
  sendRuntimeMessage({ type: "save-settings", settings: state.settings }).catch((error) => {
    logWarn("[BOC] failed to persist reader settings", error);
  });
}

function buildReadingMetaLine() {
  const parts = [];
  if (state.author) {
    parts.push(state.author);
  }
  if (state.uploadDate) {
    parts.push(state.uploadDate);
  }
  parts.push("bilibili.com");
  if (Number(state.pageCount) > 1) {
    const pageParts = [`P${Number(state.pageIndex) > 0 ? Number(state.pageIndex) : 1}`];
    if (state.pageTitle) {
      pageParts.push(state.pageTitle);
    }
    parts.push(pageParts.join(" "));
  }
  if (state.selectedSubtitleLang) {
    parts.push(`字幕：${state.selectedSubtitleLang}`);
  }
  return parts.join(" · ");
}

function renderReadingStatus(text) {
  byId(ids.readingStatus).textContent = String(text || "");
}

function setReadingViewReady(ready) {
  state.readingViewReady = Boolean(ready);
  const readingView = document.getElementById(ids.readingView);
  if (!readingView) {
    return;
  }
  readingView.setAttribute("data-blr-reader-ready", state.readingViewReady ? "1" : "0");
  readingView.setAttribute("aria-busy", state.readingViewReady ? "false" : "true");
}

function isReaderPresentationStable(playerHost = state.readingPlayerHost) {
  if (!state.readingViewOpen || !playerHost?.isConnected) {
    return false;
  }
  const rect = playerHost.getBoundingClientRect();
  if (!(rect.width > 240) || !(rect.height > 120)) {
    return false;
  }
  if (!state.readingNativePageMode) {
    return true;
  }
  return !hasNativeReaderPlayerLayoutIssue(playerHost);
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

  const playerHost = state.readingPlayerHost || findReaderPlayerHost(getRuntimeVideoElement());
  const wrapNode = getReaderPlayerWrapNode(playerHost);
  const video = state.readingVideoEl || getRuntimeVideoElement();
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
    readingViewOpen: state.readingViewOpen,
    readingNativePageMode: state.readingNativePageMode,
    readingViewReady: state.readingViewReady,
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

function bindReaderLayout() {
  if (state.readingLayoutBound) {
    return;
  }
  window.addEventListener("resize", layoutReaderPlayerHost);
  window.addEventListener("scroll", layoutReaderPlayerHost, { passive: true });
  document.addEventListener("fullscreenchange", layoutReaderPlayerHost);
  document.addEventListener("webkitfullscreenchange", layoutReaderPlayerHost);
  state.readingLayoutBound = true;
}

function unbindReaderLayout() {
  if (!state.readingLayoutBound) {
    return;
  }
  window.removeEventListener("resize", layoutReaderPlayerHost);
  window.removeEventListener("scroll", layoutReaderPlayerHost);
  document.removeEventListener("fullscreenchange", layoutReaderPlayerHost);
  document.removeEventListener("webkitfullscreenchange", layoutReaderPlayerHost);
  state.readingLayoutBound = false;
}

function layoutReaderPlayerHost() {
  if (!state.readingViewOpen || !isReaderMode()) {
    return;
  }

  const readingView = byId(ids.readingView);
  applyReaderColumnLayout();
  const playerHost = state.readingPlayerHost;
  const slot = byId(ids.readingPlayerSlot);
  if (!playerHost) {
    return;
  }

  if (state.readingNativePageMode) {
    const rect = playerHost.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) {
      return;
    }

    const widthLimit = getReaderMainWidthLimit();
    const wrapRect = getReaderPlayerWrapNode(playerHost)?.getBoundingClientRect?.();
    const layoutTop = Number.isFinite(wrapRect?.top) ? wrapRect.top : rect.top;
    const maxHeight = Math.max(240, window.innerHeight - layoutTop - 148);
    let renderedWidth = widthLimit;
    let renderedHeight = maxHeight;
    if (state.readingVideoHeightPx > 0) {
      renderedHeight = Math.min(maxHeight, Math.max(240, state.readingVideoHeightPx));
    }

    clearNativeReaderFloatingStyles(playerHost);
    cleanupReaderPlayerHostNode(playerHost);
    [document.documentElement, document.body, readingView].forEach((node) => {
      node.style.setProperty("--blr-reader-player-rendered-width", `${Math.round(renderedWidth)}px`);
      node.style.setProperty("--blr-reader-player-rendered-height", `${Math.round(renderedHeight)}px`);
    });
    updateReaderChapterRailPosition();
    updateReadingTranscriptTailSpacer();
    queueEnsureReaderPlayerControlsRecovered({
      reason: "layout-native",
      delayMs: 120
    });
    return;
  }

  if (!slot) {
    return;
  }

  const rect = slot.getBoundingClientRect();
  if (!(rect.width > 0) || !(rect.height > 0)) {
    return;
  }

  const video = state.readingVideoEl;
  const aspectRatio =
    Number(video?.videoWidth) > 0 && Number(video?.videoHeight) > 0
      ? Number(video.videoWidth) / Number(video.videoHeight)
      : 16 / 9;
  const targetHeight = rect.height;
  const targetWidth = Math.min(rect.width, targetHeight * aspectRatio);
  const left = rect.left + (rect.width - targetWidth) / 2;

  [document.documentElement, document.body, readingView].forEach((node) => {
    node.style.setProperty("--blr-reader-player-rendered-width", `${Math.round(targetWidth)}px`);
    node.style.setProperty("--blr-reader-player-rendered-height", `${Math.round(targetHeight)}px`);
  });
  playerHost.style.setProperty("position", "fixed", "important");
  playerHost.style.setProperty("left", `${Math.round(left)}px`, "important");
  playerHost.style.setProperty("top", `${Math.round(rect.top)}px`, "important");
  playerHost.style.setProperty("width", `${Math.round(targetWidth)}px`, "important");
  playerHost.style.setProperty("height", `${Math.round(targetHeight)}px`, "important");
  playerHost.style.setProperty("margin", "0", "important");
  playerHost.style.setProperty("z-index", "2147483647", "important");
  playerHost.style.setProperty("max-width", "none", "important");
  playerHost.style.setProperty("max-height", "none", "important");
  updateReaderChapterRailPosition({
    left,
    bottom: rect.top + targetHeight,
    width: targetWidth,
    height: targetHeight
  });
  updateReadingTranscriptTailSpacer();
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

function cleanupReaderPlayerHost() {
  restoreReaderPlayerContainer();
  unbindReaderPlayerControlsHover();
  unbindReaderHeaderActionsHover();
  if (state.readingControlsRecoveryTimer) {
    window.clearTimeout(state.readingControlsRecoveryTimer);
    state.readingControlsRecoveryTimer = 0;
  }
  state.readingControlsRecoveryInFlight = false;
  const readingView = byId(ids.readingView);
  [document.documentElement, document.body, readingView].filter(Boolean).forEach((node) => {
    node.style.removeProperty("--blr-reader-player-rendered-width");
    node.style.removeProperty("--blr-reader-player-rendered-height");
    node.style.removeProperty("--blr-reader-player-left");
    node.style.removeProperty("--blr-reader-player-top");
    node.style.removeProperty("--blr-reader-player-bottom");
    node.style.removeProperty("--blr-reader-player-width");
  });
  const playerHost = state.readingPlayerHost;
  if (!playerHost) {
    return;
  }
  setReaderPlayerControlsVisible(false, playerHost);
  cleanupReaderPlayerHostNode(playerHost);
  state.readingPlayerHost = null;
}

function startReadingViewSync() {
  if (state.readingSyncTimer) {
    window.clearInterval(state.readingSyncTimer);
  }
  state.readingSyncTimer = window.setInterval(() => {
    syncReadingViewPlayback();
  }, 250);
}

function stopReadingViewSync() {
  if (state.readingSyncTimer) {
    window.clearInterval(state.readingSyncTimer);
    state.readingSyncTimer = 0;
  }
  if (state.readingMiniDismissTimer) {
    window.clearTimeout(state.readingMiniDismissTimer);
    state.readingMiniDismissTimer = 0;
  }
  if (state.readingControlsHideTimer) {
    window.clearTimeout(state.readingControlsHideTimer);
    state.readingControlsHideTimer = 0;
  }
  if (state.readingControlsRecoveryTimer) {
    window.clearTimeout(state.readingControlsRecoveryTimer);
    state.readingControlsRecoveryTimer = 0;
  }
  state.readingControlsRecoveryInFlight = false;
  if (state.readingPlayerMountTimer) {
    window.clearTimeout(state.readingPlayerMountTimer);
    state.readingPlayerMountTimer = 0;
  }
  if (state.readingPlayerRetryTimer) {
    window.clearTimeout(state.readingPlayerRetryTimer);
    state.readingPlayerRetryTimer = 0;
  }
  stopReaderPlayerObserver();
  unbindReaderPlayerControlsHover();
  if (state.readingVideoEl && state.readingVideoEl.__blrReadingSyncHandler) {
    const video = state.readingVideoEl;
    video.removeEventListener("timeupdate", video.__blrReadingSyncHandler);
    video.removeEventListener("seeked", video.__blrReadingSyncHandler);
    video.removeEventListener("loadedmetadata", video.__blrReadingSyncHandler);
    delete video.__blrReadingSyncHandler;
  }
  state.readingVideoEventsBound = false;
}

function startReaderPlayerObserver() {
  if (!isReaderMode() || state.readingPlayerObserver || !document.body) {
    return;
  }
  const observer = new MutationObserver(() => {
    if (!state.readingViewOpen) {
      return;
    }
    const nextVideo = getRuntimeVideoElement();
    const nextHost = findReaderPlayerHost(nextVideo);
    if (nextVideo && nextHost && (nextVideo !== state.readingVideoEl || nextHost !== state.readingPlayerHost)) {
      queueEnsureReaderPlayerMounted();
    }
    if (document.querySelector(".bpx-player-mini-close, .bpx-player-mini-warp")) {
      scheduleReaderMiniPlayerDismiss();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  state.readingPlayerObserver = observer;
}

function stopReaderPlayerObserver() {
  if (state.readingPlayerObserver) {
    state.readingPlayerObserver.disconnect();
    state.readingPlayerObserver = null;
  }
}

function bindReadingViewVideo(video = getRuntimeVideoElement()) {
  if (!video) {
    if (state.readingVideoEl && state.readingVideoEl.__blrReadingSyncHandler) {
      const prev = state.readingVideoEl;
      prev.removeEventListener("timeupdate", prev.__blrReadingSyncHandler);
      prev.removeEventListener("seeked", prev.__blrReadingSyncHandler);
      prev.removeEventListener("loadedmetadata", prev.__blrReadingSyncHandler);
      delete prev.__blrReadingSyncHandler;
    }
    state.readingVideoEl = null;
    state.readingVideoEventsBound = false;
    return null;
  }

  if (state.readingVideoEl === video && state.readingVideoEventsBound) {
    return video;
  }

  if (state.readingVideoEl && state.readingVideoEl.__blrReadingSyncHandler) {
    const prev = state.readingVideoEl;
    prev.removeEventListener("timeupdate", prev.__blrReadingSyncHandler);
    prev.removeEventListener("seeked", prev.__blrReadingSyncHandler);
    prev.removeEventListener("loadedmetadata", prev.__blrReadingSyncHandler);
  }

  const syncHandler = (event) => {
    if (state.readingViewOpen) {
      if (event?.type === "loadedmetadata") {
        layoutReaderPlayerHost();
      }
      if (event?.type === "seeked") {
        state.readingNextScrollBehavior = "auto";
        queueEnsureReaderPlayerControlsRecovered({
          reason: "seeked",
          delayMs: 140,
          minIntervalMs: 320
        });
      }
      const latestHost = findReaderPlayerHost(video);
      if (latestHost && latestHost !== state.readingPlayerHost) {
        queueEnsureReaderPlayerMounted();
      }
      syncReadingViewPlayback();
    }
  };
  video.addEventListener("timeupdate", syncHandler);
  video.addEventListener("seeked", syncHandler);
  video.addEventListener("loadedmetadata", syncHandler);
  video.__blrReadingSyncHandler = syncHandler;
  state.readingVideoEl = video;
  state.readingPlayerHost = findReaderPlayerHost(video) || state.readingPlayerHost;
  state.readingVideoEventsBound = true;
  return video;
}

function getRuntimeVideoElement() {
  if (state.readingVideoEl?.isConnected) {
    const currentHost = findReaderPlayerHost(state.readingVideoEl);
    const currentRect = state.readingVideoEl.getBoundingClientRect();
    if (
      currentHost?.isConnected &&
      currentRect.width > 120 &&
      currentRect.height > 68 &&
      !isIgnoredReaderVideoCandidate(state.readingVideoEl)
    ) {
      return state.readingVideoEl;
    }
  }

  const candidates = Array.from(document.querySelectorAll("video")).filter(
    (item) => item.isConnected && !isIgnoredReaderVideoCandidate(item)
  );
  if (candidates.length === 0) {
    return null;
  }

  const visible = candidates
    .map((item) => {
      const rect = item.getBoundingClientRect();
      const host = findReaderPlayerHost(item);
      const inPlayer = Boolean(
        host &&
          (host.matches?.("#bilibili-player, .bpx-player-container, .bpx-player-video-area") ||
            host.querySelector?.(".bpx-player-video-area"))
      );
      const area = Math.max(0, rect.width) * Math.max(0, rect.height);
      const score =
        area +
        (inPlayer ? 1000000 : 0) +
        (!item.paused ? 20000 : 0) +
        Number(item.readyState || 0) * 2000 +
        (item.currentSrc ? 10000 : 0) +
        (item === state.readingVideoEl ? 500 : 0);
      return { item, rect, score };
    })
    .filter(({ rect }) => rect.width > 240 && rect.height > 120)
    .sort((a, b) => b.score - a.score)[0];

  return visible?.item || candidates[0] || null;
}

function isIgnoredReaderVideoCandidate(video) {
  if (!video) {
    return true;
  }
  const host = findReaderPlayerHost(video);
  const blockedSelector = [
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
  return Boolean(video.closest(blockedSelector) || host?.closest?.(blockedSelector));
}

function applyReaderPageFocus() {
  clearReaderPageFocus();

  const root = byId(ids.root);
  const video = getRuntimeVideoElement();
  const playerHost = findReaderPlayerHost(video);
  const titleNode = findReaderTitleContainer();
  const inlineHost = document.getElementById("blr-reading-inline-host");
  const keepRoots = [root, inlineHost, playerHost, titleNode].filter(Boolean);

  keepRoots.forEach((node) => {
    markReaderKeepSubtree(node);
    markReaderKeepPath(node);
  });

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

  if (!state.readingMainOriginalParent) {
    state.readingMainOriginalParent = readingMain.parentElement;
    state.readingMainOriginalNextSibling = readingMain.nextSibling;
  }
  const playerWrap =
    document.getElementById("playerWrap") ||
    state.readingPlayerHost?.closest?.("#playerWrap") ||
    state.readingPlayerHost;
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
    transcriptHeading.textContent = "字幕";
  }
  if (transcriptHeading.parentElement !== inlineHost || inlineHost.firstElementChild !== transcriptHeading) {
    inlineHost.prepend(transcriptHeading);
  }

  if (!inlineHost.dataset.blrScrollBound) {
    const handleInlineHostManualScroll = () => {
      if (Date.now() <= state.readingProgrammaticScrollUntil) {
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
  const leftContainer = document.querySelector(".left-container");
  const bgColor = leftContainer ? getComputedStyle(leftContainer).backgroundColor : "";
  if (state.readingTranscriptVisible) {
    inlineHost.style.border = "";
    inlineHost.style.background = "";
    inlineHost.style.marginTop = "";
    inlineHost.style.boxShadow = "";
    inlineHost.style.borderRadius = "";
  } else {
    inlineHost.style.border = "none";
    inlineHost.style.background = bgColor;
    inlineHost.style.marginTop = "0";
    inlineHost.style.boxShadow = "none";
    inlineHost.style.borderRadius = "0";
  }
  updateReadingTranscriptTailSpacer();
}

function restoreReadingMainInline() {
  const readingMain = document.querySelector(".blr-reading-main");
  const inlineHost = document.getElementById("blr-reading-inline-host");
  if (readingMain && state.readingMainOriginalParent) {
    if (state.readingMainOriginalNextSibling?.parentNode === state.readingMainOriginalParent) {
      state.readingMainOriginalParent.insertBefore(readingMain, state.readingMainOriginalNextSibling);
    } else {
      state.readingMainOriginalParent.appendChild(readingMain);
    }
  }
  inlineHost?.remove();
  state.readingMainOriginalParent = null;
  state.readingMainOriginalNextSibling = null;
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
        "#bilibili-player, .bpx-player-container, .bpx-player-video-area, .bpx-player-primary-area, #blr-root, h1.video-title, .video-info-detail, .video-info-meta, .video-data"
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

function findReaderMetaContainer(titleNode = findReaderTitleContainer()) {
  const title = titleNode?.matches?.("h1, [data-title]") ? titleNode : titleNode?.querySelector?.("h1, [data-title]");
  if (!title) {
    return null;
  }

  const candidates = [
    title.nextElementSibling,
    title.parentElement?.nextElementSibling,
    title.parentElement,
    title.parentElement?.parentElement,
    ...(Array.from(title.parentElement?.parentElement?.children || []).slice(0, 6))
  ].filter(Boolean);

  for (const node of candidates) {
    if (node.matches?.(".video-data, .video-info-detail, .video-info-meta")) {
      return node;
    }
    if (node.querySelector?.(".view-text")) {
      return node;
    }
  }

  return null;
}

function findReaderContentHost(playerHost = state.readingPlayerHost, titleNode = findReaderTitleContainer()) {
  if (!playerHost && !titleNode) {
    return null;
  }

  let current = titleNode || playerHost;
  while (current && current !== document.body) {
    const containsPlayer = playerHost ? current.contains(playerHost) : true;
    const containsTitle = titleNode ? current.contains(titleNode) : true;
    if (containsPlayer && containsTitle) {
      return current;
    }
    current = current.parentElement;
  }

  return playerHost?.parentElement || titleNode?.parentElement || null;
}

function moveRootToReaderContentHost() {
  return;
}

function restoreRootMount() {
  return;
}

function dismissReaderMiniPlayer(playerHost = state.readingPlayerHost) {
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
  if (!state.readingViewOpen) {
    return;
  }
  if (state.readingMiniDismissTimer) {
    window.clearTimeout(state.readingMiniDismissTimer);
    state.readingMiniDismissTimer = 0;
  }

  let attempts = 0;
  const run = () => {
    if (!state.readingViewOpen) {
      state.readingMiniDismissTimer = 0;
      return;
    }

    const closed = dismissReaderMiniPlayer();
    const host = findReaderPlayerHost(getRuntimeVideoElement());
    if (host) {
      state.readingPlayerHost = host;
      normalizeReaderPlayerContainer(host);
      layoutReaderPlayerHost();
    }

    attempts += 1;
    const miniExists = Boolean(document.querySelector(".bpx-player-mini-close, .bpx-player-mini-warp"));
    const hostFixed = Boolean(host && window.getComputedStyle(host).position === "fixed");
    if (attempts < maxAttempts && (miniExists || hostFixed || closed)) {
      state.readingMiniDismissTimer = window.setTimeout(run, delayMs);
      return;
    }
    state.readingMiniDismissTimer = 0;
  };

  state.readingMiniDismissTimer = window.setTimeout(run, 40);
}

function getReaderControlsRoot(playerHost = state.readingPlayerHost) {
  return (
    playerHost?.closest?.("#playerWrap") ||
    playerHost?.closest?.("#bilibili-player") ||
    playerHost ||
    document.getElementById("playerWrap") ||
    document.getElementById("bilibili-player")
  );
}

function getReaderPlayerControlsState(playerHost = state.readingPlayerHost) {
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

function hasReaderPlayerControlsIssue(playerHost = state.readingPlayerHost) {
  if (!state.readingNativePageMode || !playerHost || isWatchlaterPage()) {
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
  if (!state.readingViewOpen || !state.readingNativePageMode || isWatchlaterPage()) {
    return;
  }
  const playerHost = state.readingPlayerHost;
  if (!playerHost?.isConnected || state.readingControlsRecoveryInFlight) {
    return;
  }

  const now = Date.now();
  if (state.readingControlsRecoveryTimer) {
    return;
  }
  if (now - state.readingControlsLastRecoverAt < minIntervalMs) {
    return;
  }

  state.readingControlsRecoveryTimer = window.setTimeout(() => {
    state.readingControlsRecoveryTimer = 0;
    if (!state.readingViewOpen || !state.readingNativePageMode || isWatchlaterPage()) {
      return;
    }
    const activeHost = state.readingPlayerHost;
    if (!activeHost?.isConnected || !hasReaderPlayerControlsIssue(activeHost)) {
      return;
    }

    state.readingControlsRecoveryInFlight = true;
    state.readingControlsLastRecoverAt = Date.now();
    ensureReaderPlayerControlsRecovered(activeHost, {
      reason,
      retryDelayMs: 120
    })
      .catch((error) => {
        logWarn("[BOC] queued reader controls recovery failed", { reason, error });
      })
      .finally(() => {
        state.readingControlsRecoveryInFlight = false;
      });
  }, delayMs);
}

function setReaderPlayerControlsVisible(visible, playerHost = state.readingPlayerHost) {
  if (!state.readingNativePageMode || !playerHost) {
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
  playerHost = state.readingPlayerHost,
  { reason = "unknown", retryDelayMs = 90 } = {}
) {
  if (!state.readingNativePageMode || !playerHost || isWatchlaterPage()) {
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

function scheduleReaderPlayerControlsHide(playerHost = state.readingControlsHoverHost || state.readingPlayerHost) {
  if (state.readingControlsHideTimer) {
    window.clearTimeout(state.readingControlsHideTimer);
  }
  state.readingControlsHideTimer = window.setTimeout(() => {
    state.readingControlsHideTimer = 0;
    if (!state.readingViewOpen) {
      return;
    }
    setReaderPlayerControlsVisible(false, playerHost);
  }, 1200);
}

function bindReaderPlayerControlsHover(playerHost = state.readingPlayerHost) {
  if (!state.readingNativePageMode || !isWatchlaterPage() || !playerHost) {
    return;
  }

  if (state.readingControlsHoverHost && state.readingControlsHoverHost !== playerHost) {
    unbindReaderPlayerControlsHover();
  }
  if (playerHost.__blrReaderControlsHoverBound) {
    state.readingControlsHoverHost = playerHost;
    return;
  }

  const showControls = () => {
    if (!state.readingViewOpen) {
      return;
    }
    setReaderPlayerControlsVisible(true, playerHost);
    scheduleReaderPlayerControlsHide(playerHost);
  };
  const hideControls = () => {
    if (state.readingControlsHideTimer) {
      window.clearTimeout(state.readingControlsHideTimer);
      state.readingControlsHideTimer = 0;
    }
    setReaderPlayerControlsVisible(false, playerHost);
  };

  playerHost.addEventListener("mouseenter", showControls, true);
  playerHost.addEventListener("mousemove", showControls, true);
  playerHost.addEventListener("mouseleave", hideControls, true);
  playerHost.__blrReaderControlsHoverBound = { showControls, hideControls };
  state.readingControlsHoverHost = playerHost;
}

function unbindReaderPlayerControlsHover() {
  const playerHost = state.readingControlsHoverHost;
  if (state.readingControlsHideTimer) {
    window.clearTimeout(state.readingControlsHideTimer);
    state.readingControlsHideTimer = 0;
  }
  if (!playerHost?.__blrReaderControlsHoverBound) {
    state.readingControlsHoverHost = null;
    return;
  }

  const { showControls, hideControls } = playerHost.__blrReaderControlsHoverBound;
  playerHost.removeEventListener("mouseenter", showControls, true);
  playerHost.removeEventListener("mousemove", showControls, true);
  playerHost.removeEventListener("mouseleave", hideControls, true);
  delete playerHost.__blrReaderControlsHoverBound;
  setReaderPlayerControlsVisible(false, playerHost);
  state.readingControlsHoverHost = null;
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
  if (state.readingHeaderHideTimer) {
    window.clearTimeout(state.readingHeaderHideTimer);
    state.readingHeaderHideTimer = 0;
  }
  state.readingHeaderHideTimer = window.setTimeout(() => {
    state.readingHeaderHideTimer = 0;
    if (!state.readingViewOpen) {
      return;
    }
    setReaderHeaderActionsVisible(false);
  }, delayMs);
}

function bindReaderHeaderActionsHover() {
  if (!state.readingViewOpen) {
    return;
  }
  const header = document.querySelector(".blr-reading-header");
  if (!header || header.__blrReaderHeaderHoverBound) {
    state.readingHeaderHoverHost = header || null;
    return;
  }

  const showActions = () => {
    if (!state.readingViewOpen) {
      return;
    }
    if (state.readingHeaderHideTimer) {
      window.clearTimeout(state.readingHeaderHideTimer);
      state.readingHeaderHideTimer = 0;
    }
    setReaderHeaderActionsVisible(true);
  };
  const hideActionsLater = () => {
    if (!state.readingViewOpen) {
      return;
    }
    scheduleReaderHeaderActionsHide();
  };

  header.addEventListener("mouseenter", showActions, true);
  header.addEventListener("mouseleave", hideActionsLater, true);
  header.__blrReaderHeaderHoverBound = { showActions, hideActionsLater };
  state.readingHeaderHoverHost = header;
  setReaderHeaderActionsVisible(true);
  scheduleReaderHeaderActionsHide();
}

function unbindReaderHeaderActionsHover() {
  const header = state.readingHeaderHoverHost;
  if (state.readingHeaderHideTimer) {
    window.clearTimeout(state.readingHeaderHideTimer);
    state.readingHeaderHideTimer = 0;
  }
  if (!header?.__blrReaderHeaderHoverBound) {
    state.readingHeaderHoverHost = null;
    return;
  }
  const { showActions, hideActionsLater } = header.__blrReaderHeaderHoverBound;
  header.removeEventListener("mouseenter", showActions, true);
  header.removeEventListener("mouseleave", hideActionsLater, true);
  delete header.__blrReaderHeaderHoverBound;
  state.readingHeaderHoverHost = null;
  setReaderHeaderActionsVisible(true);
}

function startPlayerAiQuickActionObserver() {
  if (state.playerAiQuickActionObserver || !document.body) {
    return;
  }

  const observer = new MutationObserver(() => {
    schedulePlayerAiQuickActionSync();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  state.playerAiQuickActionObserver = observer;
}

function bindPlayerAiQuickActionLayoutEvents() {
  if (state.playerAiQuickActionLayoutBound) {
    return;
  }
  const schedule = () => schedulePlayerAiQuickActionSync(80);
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("pageshow", schedule, { passive: true });
  document.addEventListener("fullscreenchange", schedule);
  document.addEventListener("webkitfullscreenchange", schedule);
  window.visualViewport?.addEventListener?.("resize", schedule, { passive: true });
  state.playerAiQuickActionLayoutBound = true;
}

function schedulePlayerAiQuickActionSync(delayMs = 120) {
  if (state.playerAiQuickActionSyncTimer) {
    window.clearTimeout(state.playerAiQuickActionSyncTimer);
  }
  state.playerAiQuickActionSyncTimer = window.setTimeout(() => {
    state.playerAiQuickActionSyncTimer = 0;
    syncPlayerAiQuickActionButton();
  }, delayMs);
}

function syncPlayerAiQuickActionButton() {
  const existing = document.getElementById("blr-player-ai-quick-action");
  const existingWrap = existing?.closest(".blr-player-ai-wrap");
  if (!state.settings?.enablePlayerAiQuickAction || state.readingViewOpen || isReaderMode()) {
    removePlayerAiQuickActionButton();
    return;
  }

  if (!hasPlayerSubtitleControl()) {
    removePlayerAiQuickActionButton();
    return;
  }

  const playerHost = findPlayerAiQuickActionHost();
  if (!playerHost) {
    if (!existingWrap?.isConnected) {
      existingWrap?.remove();
      existing?.remove();
    } else {
      schedulePlayerAiQuickActionSync(260);
    }
    return;
  }

  let button = existing;
  let wrap = existingWrap instanceof HTMLElement ? existingWrap : null;
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "blr-player-ai-wrap";
    wrap.setAttribute("data-blr-extension-node", "ai-quick-action");
  }
  if (!button) {
    button = document.createElement("button");
    button.id = "blr-player-ai-quick-action";
    button.type = "button";
    button.className = "blr-player-ai-quick-action";
    button.title = "用 AI 分析这期视频";
    button.setAttribute("aria-label", "用 AI 分析这期视频");
    button.innerHTML = buildPlayerAiQuickActionIconSvg();
    button.addEventListener("click", handlePlayerAiQuickActionClick, true);
  }

  if (button.parentElement !== wrap) {
    wrap.replaceChildren(button);
  }
  if (wrap.parentElement !== playerHost) {
    playerHost.appendChild(wrap);
  }
  bindPlayerAiQuickActionCursorSync(wrap);
  syncPlayerAiQuickActionVisuals(button);
}

function removePlayerAiQuickActionButton() {
  if (state.playerAiQuickActionRevealTimer) {
    window.clearTimeout(state.playerAiQuickActionRevealTimer);
    state.playerAiQuickActionRevealTimer = 0;
  }
  if (state.playerAiQuickActionHideTimer) {
    window.clearTimeout(state.playerAiQuickActionHideTimer);
    state.playerAiQuickActionHideTimer = 0;
  }
  if (state.playerAiQuickActionCursorHideTimer) {
    window.clearTimeout(state.playerAiQuickActionCursorHideTimer);
    state.playerAiQuickActionCursorHideTimer = 0;
  }
  document.getElementById("blr-player-ai-quick-action")?.closest(".blr-player-ai-wrap")?.remove();
}

function bindPlayerAiQuickActionCursorSync(wrap) {
  if (!(wrap instanceof HTMLElement)) {
    return;
  }
  const host = wrap.parentElement instanceof HTMLElement ? wrap.parentElement : null;
  if (!host || wrap.__blrPlayerAiCursorHost === host) {
    return;
  }
  const hideForIdle = () => {
    state.playerAiQuickActionCursorHideTimer = 0;
    wrap.classList.remove("is-active");
  };
  const showForCursorActivity = () => {
    if (!wrap.isConnected || state.readingViewOpen || isReaderMode()) {
      wrap.classList.remove("is-active");
      return;
    }
    wrap.classList.add("is-active");
    if (state.playerAiQuickActionCursorHideTimer) {
      window.clearTimeout(state.playerAiQuickActionCursorHideTimer);
    }
    state.playerAiQuickActionCursorHideTimer = window.setTimeout(hideForIdle, 1900);
  };
  const hideImmediately = () => {
    if (state.playerAiQuickActionCursorHideTimer) {
      window.clearTimeout(state.playerAiQuickActionCursorHideTimer);
      state.playerAiQuickActionCursorHideTimer = 0;
    }
    wrap.classList.remove("is-active");
  };
  host.addEventListener("mousemove", showForCursorActivity, { passive: true });
  host.addEventListener("mouseenter", showForCursorActivity, { passive: true });
  host.addEventListener("mouseleave", hideImmediately, { passive: true });
  host.addEventListener("pointermove", showForCursorActivity, { passive: true });
  wrap.__blrPlayerAiCursorHost = host;
}

function hasPlayerSubtitleControl() {
  return Boolean(findPlayerSubtitleControlNode());
}

function findPlayerSubtitleControlNode() {
  const controlRoots = Array.from(
    document.querySelectorAll(
      "#bilibili-player .bpx-player-control-wrap, #playerWrap .bpx-player-control-wrap, .bpx-player-container .bpx-player-control-wrap, #bilibili-player, #playerWrap, .bpx-player-container"
    )
  );

  for (const root of controlRoots) {
    const candidates = Array.from(
      root.querySelectorAll(
        "[aria-label*='字幕'], [title*='字幕'], [data-text*='字幕'], [class*='subtitle'], [class*='caption'], button, [role='button']"
      )
    );
    const matched = candidates.find((node) => isPlayerSubtitleControlNode(node));
    if (matched) {
      return matched;
    }
  }

  return null;
}

function isPlayerSubtitleControlNode(node) {
  if (!(node instanceof Element)) {
    return false;
  }
  const text = [
    node.getAttribute("aria-label"),
    node.getAttribute("title"),
    node.getAttribute("data-text"),
    node.textContent,
    typeof node.className === "string" ? node.className : ""
  ]
    .filter((item) => typeof item === "string" && item.trim())
    .join(" ");
  return /字幕|subtitle/i.test(text);
}

function findPlayerAiQuickActionHost() {
  const candidates = [
    document.querySelector(".bpx-player-container"),
    document.querySelector(".bpx-player-video-area"),
    document.getElementById("bilibili-player"),
    document.getElementById("playerWrap")
  ];
  return candidates.find((node) => node instanceof HTMLElement && isVisibleReaderControl(node)) || null;
}

function buildPlayerAiQuickActionIconSvg() {
  const variants = {
    badge: `
      <svg viewBox="0 0 132 132" focusable="false" aria-hidden="true" data-ai-icon="badge">
        <path stroke-width="8.25" d="M22 90.7494C22 99.8618 29.3873 107.249 38.5 107.249C38.5 114.843 44.6561 120.999 52.25 120.999C59.8438 120.999 66 114.843 66 107.249C66 114.843 72.1562 120.999 79.75 120.999C87.3438 120.999 93.5 114.843 93.5 107.249C102.613 107.249 110 99.8613 110 90.7489C110 87.621 109.13 84.6967 107.618 82.2046C115.24 80.7466 121 74.0454 121 65.9989C121 57.9518 115.24 51.2507 107.618 49.7929C109.13 47.3006 110 44.3763 110 41.2487C110 32.1359 102.613 24.7487 93.5 24.7487C93.5 17.1547 87.3438 10.9987 79.75 10.9987C72.1562 10.9987 66 17.1552 66 24.7492C66 17.1552 59.8438 10.9992 52.25 10.9992C44.6561 10.9992 38.5 17.1552 38.5 24.7492C29.3873 24.7492 22 32.1365 22 41.2492C22 44.3768 22.8702 47.3012 24.3817 49.7934C16.76 51.2512 11 57.9524 11 65.9994C11 74.0459 16.76 80.7471 24.3817 82.2052C22.8702 84.6972 22 87.6216 22 90.7494Z"></path>
        <path stroke-width="8.25" d="M41.25 79.7494L51.3804 49.3582C51.8997 47.8002 53.3577 46.7493 55 46.7493C56.6423 46.7493 58.1004 47.8002 58.6196 49.3582L68.75 79.7494M85.25 46.7493V79.7494M46.75 68.7494H63.25"></path>
      </svg>
    `,
    sparkles: `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" data-ai-icon="sparkles">
        <path stroke-width="1.8" d="M12 3.6l1.84 4.96 4.96 1.84-4.96 1.84L12 17.2l-1.84-4.96L5.2 10.4l4.96-1.84L12 3.6z"></path>
        <path stroke-width="1.8" d="M18.2 3.8l.64 1.72 1.72.64-1.72.64-.64 1.72-.64-1.72-1.72-.64 1.72-.64.64-1.72z"></path>
        <path stroke-width="1.8" d="M18 14.2l.48 1.28 1.28.48-1.28.48-.48 1.28-.48-1.28-1.28-.48 1.28-.48.48-1.28z"></path>
      </svg>
    `,
    nodes: `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" data-ai-icon="nodes">
        <circle stroke-width="1.8" cx="7" cy="8" r="2.1"></circle>
        <circle stroke-width="1.8" cx="17" cy="7" r="2.1"></circle>
        <circle stroke-width="1.8" cx="12" cy="16.8" r="2.1"></circle>
        <path stroke-width="1.8" d="M8.8 8.7l2.4 5.2"></path>
        <path stroke-width="1.8" d="M15.2 7.8l-2.2 5.8"></path>
        <path stroke-width="1.8" d="M8.9 8.1h5.9"></path>
      </svg>
    `,
    chip: `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" data-ai-icon="chip">
        <rect stroke-width="1.8" x="7.2" y="7.2" width="9.6" height="9.6" rx="2.1"></rect>
        <path stroke-width="1.8" d="M10 10h4"></path>
        <path stroke-width="1.8" d="M10 12h4"></path>
        <path stroke-width="1.8" d="M10 14h2.8"></path>
        <path stroke-width="1.8" d="M9 4.8v2"></path>
        <path stroke-width="1.8" d="M12 4.8v2"></path>
        <path stroke-width="1.8" d="M15 4.8v2"></path>
        <path stroke-width="1.8" d="M9 17.2v2"></path>
        <path stroke-width="1.8" d="M12 17.2v2"></path>
        <path stroke-width="1.8" d="M15 17.2v2"></path>
        <path stroke-width="1.8" d="M4.8 9h2"></path>
        <path stroke-width="1.8" d="M4.8 12h2"></path>
        <path stroke-width="1.8" d="M4.8 15h2"></path>
        <path stroke-width="1.8" d="M17.2 9h2"></path>
        <path stroke-width="1.8" d="M17.2 12h2"></path>
        <path stroke-width="1.8" d="M17.2 15h2"></path>
      </svg>
    `
  };
  return variants[PLAYER_AI_ICON_VARIANT] || variants.badge;
}

function syncPlayerAiQuickActionVisuals(button) {
  if (!(button instanceof HTMLElement)) {
    return;
  }
  const wrap = button.parentElement instanceof HTMLElement ? button.parentElement : null;
  const hitSize = 36;
  const iconSize = 24;
  const baseColor = "#f6f7f8";
  [wrap, button].filter(Boolean).forEach((node) => {
    node.style.setProperty("--blr-player-ai-action-hit-size", `${hitSize}px`);
    node.style.setProperty("--blr-player-ai-action-color", baseColor);
    node.style.setProperty("--blr-player-ai-action-hover-color", baseColor);
  });
  button.style.setProperty("--blr-player-ai-action-icon-size", `${iconSize}px`);
}

async function handlePlayerAiQuickActionClick(event) {
  event.preventDefault();
  event.stopPropagation();
  if (
    state.playerAiQuickActionSubmitting ||
    state.readingViewOpen ||
    isReaderMode() ||
    Date.now() < state.playerAiQuickActionSuppressedUntil
  ) {
    return;
  }

  state.playerAiQuickActionSubmitting = true;
  const button = event.currentTarget instanceof HTMLButtonElement ? event.currentTarget : null;
  if (button) {
    button.disabled = true;
  }

  try {
    state.settings = await getSettings();
    if (!state.settings?.enablePlayerAiQuickAction) {
      throw new Error("AI 按钮未开启");
    }
    const resp = await sendRuntimeMessage({ type: "player-ai-quick-action" });
    if (!resp?.ok) {
      throw new Error(resp?.error || "打开 AI 侧边栏失败");
    }
    setMessage("已打开 AI 侧边栏并发送快捷提示词。");
  } catch (error) {
    setMessage(`AI 快捷操作失败：${getErrorMessage(error)}`);
  } finally {
    state.playerAiQuickActionSubmitting = false;
    if (button) {
      button.disabled = false;
    }
  }
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

function normalizeReaderPlayerContainer(playerHost = state.readingPlayerHost) {
  if (!playerHost) {
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
    const shouldReset = state.readingNativePageMode
      ? Boolean(isExplicitMiniNode || (isPlayerLayoutNode && isMiniLike))
      : isPlayerLayoutNode || isMiniLike;

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

  state.readingPlayerAdjustedNodes = adjusted;
}

function restoreReaderPlayerContainer() {
  const adjusted = Array.isArray(state.readingPlayerAdjustedNodes) ? state.readingPlayerAdjustedNodes : [];
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
  state.readingPlayerAdjustedNodes = [];
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
    if (state.readingViewOpen && isReaderMode()) {
      layoutReaderPlayerHost();
    }
  });
}

function syncReadingViewPlayback(forceScroll = false) {
  if (!state.readingViewOpen) {
    return;
  }

  if (state.readingNativePageMode) {
    layoutReaderPlayerHost();
  }

  const runtimeVideo = getRuntimeVideoElement();
  const runtimeHost = findReaderPlayerHost(runtimeVideo);
  if (runtimeVideo && runtimeHost) {
    const playerChanged =
      runtimeVideo !== state.readingVideoEl || runtimeHost !== state.readingPlayerHost;
    if (playerChanged) {
      queueEnsureReaderPlayerMounted();
    }
  }

  const video = bindReadingViewVideo(runtimeVideo || state.readingVideoEl);
  if (!video) {
    renderReadingStatus("当前页面没有找到可联动的视频播放器。");
    return;
  }

  const currentTime = Number(video.currentTime || 0) || 0;
  const subtitleIndex = findActiveSubtitleIndex(currentTime);
  const chapterIndex = findActiveChapterIndex(currentTime);
  const changed =
    subtitleIndex !== state.readingActiveSubtitleIndex ||
    chapterIndex !== state.readingActiveChapterIndex;

  setActiveReadingItems(subtitleIndex, chapterIndex, forceScroll || changed);
  updateReaderFollowState();
  renderReadingStatus(`当前进度 ${formatCompactTimestamp(currentTime, currentTime >= 3600)}`);
}

function findActiveSubtitleIndex(currentTime) {
  const items = Array.isArray(state.subtitleBody) ? state.subtitleBody : [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const from = Number(item?.from || 0) || 0;
    const rawTo = Number(item?.to || 0) || 0;
    const to = rawTo > from ? rawTo : from + 2;
    if (currentTime >= from && currentTime < to) {
      return index;
    }
  }
  return -1;
}

function findActiveChapterIndex(currentTime) {
  const chapters = normalizeChapters(state.chapters || []);
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
  const transcriptList = byId(ids.readingTranscriptList);
  const chapterList = byId(ids.readingChapterList);
  const nextTranscript = transcriptList.querySelector(`[data-index="${subtitleIndex}"]`);
  const nextChapter = chapterList.querySelector(`[data-index="${chapterIndex}"]`);
  const currentTranscript = transcriptList.querySelector(
    ".blr-reading-item.is-active, .blr-reading-complete-segment.is-active"
  );
  const currentChapter = chapterList.querySelector(".blr-reading-chapter.is-active");

  if (currentTranscript && currentTranscript !== nextTranscript) {
    currentTranscript.classList.remove("is-active");
  }
  if (currentChapter && currentChapter !== nextChapter) {
    currentChapter.classList.remove("is-active");
  }
  if (nextTranscript) {
    nextTranscript.classList.add("is-active");
  }
  if (nextChapter) {
    nextChapter.classList.add("is-active");
  }

  if (shouldScroll && state.readingAutoScroll) {
    if (Date.now() < state.readingManualScrollPauseUntil) {
      updateReaderFollowState();
      state.readingActiveSubtitleIndex = subtitleIndex;
      state.readingActiveChapterIndex = chapterIndex;
      return;
    }
    if (nextTranscript) {
      scrollReadingTranscriptItemIntoView(nextTranscript);
    }
    if (nextChapter) {
      scrollReadingRailItemIntoView(nextChapter);
    }
  }

  state.readingActiveSubtitleIndex = subtitleIndex;
  state.readingActiveChapterIndex = chapterIndex;
}

function scrollReadingRailItemIntoView(node) {
  if (!node) {
    return;
  }
  state.readingProgrammaticScrollUntil = Date.now() + 600;
  node.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest"
  });
}

function scrollReadingTranscriptItemIntoView(node) {
  if (!node) {
    return;
  }

  const transcriptList = byId(ids.readingTranscriptList);
  const inlineHost = document.getElementById("blr-reading-inline-host");
  const listRect = transcriptList.getBoundingClientRect();
  const itemRect = node.getBoundingClientRect();
  if (!(listRect.height > 0) || !(itemRect.height > 0)) {
    scrollReadingRailItemIntoView(node);
    return;
  }

  const behavior = state.readingNextScrollBehavior === "auto" ? "auto" : "smooth";
  state.readingProgrammaticScrollUntil = Date.now() + (behavior === "auto" ? 120 : 800);
  state.readingNextScrollBehavior = "smooth";
  if (state.readingNativePageMode && inlineHost && inlineHost.scrollHeight > inlineHost.clientHeight + 8) {
    const hostRect = inlineHost.getBoundingClientRect();
    const computed = window.getComputedStyle(node);
    const lineHeight = Number.parseFloat(computed.lineHeight) || itemRect.height || 32;
    const heading = document.getElementById("blr-reading-transcript-heading");
    const headingHeight = heading?.getBoundingClientRect?.().height || 38;
    let anchorNode = node;
    if (!node.classList.contains("blr-reading-complete-segment")) {
      for (let count = 0; count < 2 && anchorNode.previousElementSibling; count += 1) {
        anchorNode = anchorNode.previousElementSibling;
      }
    }
    const anchorRect = anchorNode.getBoundingClientRect();
    const isCompleteMode = node.classList.contains("blr-reading-complete-segment");
    const desiredOffset = headingHeight + 8 + (isCompleteMode ? lineHeight * 2 : 0);
    const targetScrollTop =
      inlineHost.scrollTop + (anchorRect.top - hostRect.top) - desiredOffset;
    inlineHost.scrollTo({
      top: Math.max(0, Math.round(targetScrollTop)),
      behavior
    });
    return;
  }
  if (state.readingNativePageMode || transcriptList.scrollHeight <= transcriptList.clientHeight + 8) {
    const desiredTop = listRect.top + Math.max(72, Math.min(listRect.height * 0.24, 220));
    const nextTop = window.scrollY + itemRect.top - desiredTop;
    window.scrollTo({
      top: Math.max(0, Math.round(nextTop)),
      behavior
    });
    return;
  }

  const targetScrollTop =
    transcriptList.scrollTop + (itemRect.top - listRect.top) - Math.max(48, Math.min(listRect.height * 0.24, 180));
  transcriptList.scrollTo({
    top: Math.max(0, Math.round(targetScrollTop)),
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
  state.readingManualScrollPauseUntil = 0;
  state.readingNextScrollBehavior = "auto";
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
  if (!target || target.classList.contains("is-active") || state.readingCollectionSwitchInFlight) {
    return;
  }
  const bvid = String(target.dataset.bvid || "").trim();
  if (!/^BV[0-9A-Za-z]+$/.test(bvid)) {
    renderReadingStatus("无法读取这一集的视频地址。");
    return;
  }

  const pageIndex = Number(target.dataset.page || 0);
  const targetIndex = Number(target.dataset.index);
  const currentIndex = Number(state.collection?.currentIndex);
  const expectedSignature = [bvid, pageIndex > 0 ? pageIndex : 1].join("|");
  state.readingCollectionSwitchInFlight = true;
  target.setAttribute("aria-busy", "true");
  renderReadingStatus("正在使用播放器原生逻辑切换选集...");

  try {
    const nativeTriggered = triggerNativeCollectionSwitch({
      currentIndex,
      targetIndex,
      bvid,
      pageIndex,
      cid: String(state.collection?.episodes?.[targetIndex]?.cid || "")
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
    state.readingCollectionSwitchInFlight = false;
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
  const roots = [getReaderControlsRoot(), getReaderPlayerWrapNode(), state.readingPlayerHost, document].filter(
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
  const target = event.target.closest(".blr-reading-item, .blr-reading-complete-segment");
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
  if (!state.readingAutoScroll) {
    updateReaderFollowState();
    return;
  }
  state.readingManualScrollPauseUntil = Date.now() + durationMs;
  updateReaderFollowState();
}

function updateReaderFollowState() {
  const readingView = document.getElementById(ids.readingView);
  if (!readingView) {
    return;
  }
  const mode =
    !state.readingAutoScroll ? "off" : Date.now() < state.readingManualScrollPauseUntil ? "manual" : "auto";
  readingView.setAttribute("data-blr-reader-follow", mode);
}

function computeCurrentClipSignature(url = location.href) {
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
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(resp);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function isExtensionContextInvalidated(error) {
  const msg = String(error?.message || "");
  return msg.includes("Extension context invalidated");
}

function requestOpenOptions() {
  sendRuntimeMessage({ type: "open-options" })
    .then((resp) => {
      if (!resp?.ok) {
        setMessage(`打开设置失败：${toReadableText(resp?.error, "未知错误")}`);
      }
    })
    .catch((error) => {
      if (isExtensionContextInvalidated(error)) {
        setMessage("扩展刚刚更新，请刷新当前页面后重试。");
        return;
      }
      setMessage(`打开设置失败：${getErrorMessage(error)}`);
    });
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

async function refreshOpenReadingView(statusText, runId = state.fetchRunId) {
  if (runId !== state.fetchRunId || !state.readingViewOpen || !isReaderMode()) {
    return;
  }

  setReadingViewReady(false);
  let mounted = false;
  try {
    mounted = await ensureReaderPlayerMounted({ retries: 24, delayMs: 120, forceLayout: true });
  } catch (error) {
    logWarn("[BOC] failed to remount reader after clip change", error);
  }
  if (runId !== state.fetchRunId || !state.readingViewOpen || !isReaderMode()) {
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
  const savedDefaultsVersion = Number(saved.readerDefaultsVersion || 0);
  if (savedDefaultsVersion >= 3) {
    return { settings: merged, changed: false };
  }

  const legacyDefaults = {
    readerFontScale: "m",
    readerFontWeight: "normal",
    readerLetterSpacing: "normal",
    readerLineHeight: "tight",
    readerTranscriptMode: "fragmented"
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
    merged.readerTranscriptMode = DEFAULT_SETTINGS.readerTranscriptMode;
  }

  // v3 将“未手动指定高度”的默认含义统一为当前窗口可用的最大高度。
  // 清除旧版本曾保存的固定像素值，避免它继续覆盖新的最大高度默认值。
  merged.readerVideoHeightPx = 0;
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

function ensureRunActive(runId) {
  if (runId !== state.fetchRunId) {
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
    description: String(data.desc || ""),
    uploadDate,
    defaultCid: data.cid ? String(data.cid) : "",
    defaultDuration: Number(data.duration || 0) || 0,
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

function readVideoDescription() {
  const descNode = document.querySelector(
    ".desc-info-text, .video-desc .desc-info-text, .video-info-detail .text, .basic-desc-info"
  );
  return descNode?.textContent?.trim() || "";
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

async function fetchSubtitleBundle(bvid, cid, aid = "") {
  const requests = buildSubtitleInfoRequests({ bvid, cid, aid });
  const fetchByRequest = async (request) => {
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

    const chapters = mapChaptersFromPlayerData(payload.data);
    const subtitles = mapSubtitleTracks(payload.data?.subtitle?.subtitles || [], request.source);
    const withUrl = subtitles.filter((item) => item.subtitleUrl);
    return { source: request.source, chapters, withUrl };
  };

  if (requests.length === 0) {
    return { tracks: [], chapters: [] };
  }

  const primaryRequest = requests[0];
  try {
    const primaryResult = await fetchByRequest(primaryRequest);
    if (primaryResult.withUrl.length > 0) {
      return { tracks: primaryResult.withUrl, chapters: primaryResult.chapters };
    }
    // 切集后播放器接口可能短暂返回空字幕；主来源为空时再核对一次次来源，
    // 避免把“接口尚未就绪”误判为“当前视频无字幕”。
    if (requests.length > 1) {
      const secondaryRequest = requests[1];
      try {
        const secondaryResult = await fetchByRequest(secondaryRequest);
        if (secondaryResult.withUrl.length > 0) {
          logWarn("[BOC] primary subtitles source empty, using fallback source", {
            primary: primaryRequest.source,
            fallback: secondaryRequest.source
          });
          return {
            tracks: secondaryResult.withUrl,
            chapters: primaryResult.chapters.length
              ? primaryResult.chapters
              : secondaryResult.chapters
          };
        }
      } catch (secondaryError) {
        logWarn("[BOC] fallback subtitles source failed after empty primary", {
          source: secondaryRequest.source,
          message: getErrorMessage(secondaryError)
        });
      }
    }
    return { tracks: [], chapters: primaryResult.chapters };
  } catch (primaryError) {
    logWarn("[BOC] subtitles API request failed", {
      source: primaryRequest.source,
      message: getErrorMessage(primaryError)
    });

    // 仅当主来源请求失败时才尝试次来源。
    if (requests.length > 1) {
      const secondaryRequest = requests[1];
      try {
        const secondaryResult = await fetchByRequest(secondaryRequest);
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
    id: item?.id === undefined || item?.id === null ? "" : String(item.id),
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

async function tryLoadSubtitleCandidates(candidates, runId, forceRefresh) {
  let lastError = null;
  for (const item of candidates || []) {
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
        forceRefresh
      );
      return item;
    } catch (error) {
      lastError = error;
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
      ensureRunActive(runId);
      continue;
    }
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error("这个视频暂时没有可用字幕。");
}

function isAiSubtitle(item) {
  const lan = String(item?.lan || "").toLowerCase();
  // B站 AI 自动字幕的 lan 以 "ai-" 开头
  return lan.startsWith("ai-");
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
  logInfo("[BOC] fetch subtitle body", { url });
  return fetchJsonInBackground(url);
}

async function fetchJson(url) {
  if (typeof url === "string" && url.startsWith("https://api.bilibili.com/")) {
    return fetchJsonInBackground(url);
  }

  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return response.json();
}

async function fetchJsonInBackground(url) {
  try {
    const resp = await sendRuntimeMessage({ type: "fetch-json", url });
    if (!resp?.ok) {
      throw new Error(toReadableText(resp?.error, "Background fetch failed"));
    }
    return resp.data;
  } catch (error) {
    if (isExtensionContextInvalidated(error)) {
      throw new Error("扩展刚刚更新，请刷新当前页面后重试。");
    }
    throw error;
  }
}

function normalizeHotComments(comments, limit = 20) {
  if (!Array.isArray(comments)) {
    return [];
  }

  return comments
    .map((item) => ({
      uname: String(item?.uname || "匿名").trim() || "匿名",
      like: Number(item?.like || 0) || 0,
      message: String(item?.message || "").trim().slice(0, 500)
    }))
    .filter((item) => item.message)
    .slice(0, limit);
}

function getCurrentAid() {
  let aid = Number(state.aid) || 0;
  if (!aid && typeof window !== "undefined") {
    try {
      aid = Number(window?.__INITIAL_STATE__?.aid) || 0;
    } catch {}
  }
  return aid;
}

async function fetchHotComments(count = 20) {
  const safeCount = Math.max(0, Number(count) || 0);
  if (!safeCount) {
    return [];
  }

  const aid = getCurrentAid();
  if (!aid) {
    return [];
  }

  const url = `https://api.bilibili.com/x/v2/reply/main?type=1&oid=${aid}&mode=3&ps=${safeCount}&pn=1`;
  const resp = await sendRuntimeMessage({ type: "fetch-json", url });
  if (!resp?.ok) {
    throw new Error(resp?.error || "评论接口失败");
  }

  const replies = Array.isArray(resp?.data?.data?.replies) ? resp.data.data.replies : [];
  return normalizeHotComments(
    replies.map((item) => ({
      uname: item?.member?.uname || "匿名",
      like: item?.like || 0,
      message: item?.content?.message || ""
    })),
    safeCount
  );
}

function rebuildDerivedContent() {
  const body = Array.isArray(state.subtitleBody) ? state.subtitleBody : [];
  state.markdown = body.length ? buildMarkdown(state, body, state.settings) : "";
  state.srt = body.length ? buildSrt(body) : "";
  state.txt = body.length ? buildTxt(body, state.settings) : "";
  byId(ids.preview).value = body.length ? buildSubtitlePreview(body, state.settings) : "";
}

async function refreshDerivedContent({ refreshComments = false } = {}) {
  if (state.settings?.includeHotCommentsInNote) {
    const shouldFetchComments =
      refreshComments || !Array.isArray(state.hotComments) || state.hotComments.length === 0;
    if (shouldFetchComments) {
      try {
        state.hotComments = await fetchHotComments(20);
      } catch (error) {
        state.hotComments = [];
        logWarn("[BOC] failed to fetch hot comments for note export", error);
      }
    }
  }

  rebuildDerivedContent();
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

function buildSubtitlePreview(body, settings) {
  const compactWithHours = shouldShowHoursInSubtitle(body);
  return (body || [])
    .map((item) => {
      const text = String(item?.content || "").trim();
      if (!text) {
        return "";
      }
      if (settings.includeTimestampInBody) {
        return `\`${formatCompactTimestamp(item.from, compactWithHours)}\` ${text}`;
      }
      return text;
    })
    .filter(Boolean)
    .join("\n");
}

function buildMarkdown(meta, body, settings) {
  const created = formatLocalDate();
  const tags = (settings.tags || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const tagsCsv = tags.join(", ");
  const tagsYaml =
    tags.length === 0 ? "[]" : `[${tags.map((tag) => `"${tag.replace(/"/g, '\\"')}"`).join(", ")}]`;

  const compactWithHours = shouldShowHoursInNote(meta, body);
  const chapterLines = buildChapterLines(meta.chapters || [], compactWithHours);
  const subtitleSectionLines = buildSubtitleSectionLines(
    body,
    meta.chapters || [],
    settings,
    compactWithHours
  );
  const frontMatter = buildFrontMatter(meta, settings, created, tagsCsv, tagsYaml);

  const page = extractPageIndex(location.href);
  const embedIframe = buildBilibiliEmbedIframe(meta, page);
  const intro = String(meta.description || "").trim();
  const noteSectionContext = buildNotePlaceholderTemplateContext(meta, intro);
  const noteSections = groupNotePlaceholderSections(settings, noteSectionContext);

  const lines = [];
  if (frontMatter) {
    lines.push(frontMatter, "");
  }
  lines.push(embedIframe, "");
  pushOptionalLines(lines, noteSections.before_intro);

  if (intro) {
    lines.push("## 简介", "", intro, "");
  }

  pushOptionalLines(lines, noteSections.before_chapters);

  if (chapterLines.length > 0) {
    lines.push("## 章节", "", ...chapterLines, "");
  }

  pushOptionalLines(lines, noteSections.before_subtitle);
  lines.push("## 字幕", "", ...subtitleSectionLines);

  const hotCommentLines = buildHotCommentLines(
    settings?.includeHotCommentsInNote ? meta?.hotComments || [] : []
  );
  if (hotCommentLines.length > 0) {
    lines.push("", "## 评论", "", ...hotCommentLines);
  }

  return lines.join("\n");
}

function buildHotCommentLines(comments) {
  const items = normalizeHotComments(comments, 20);
  if (items.length === 0) {
    return [];
  }

  return items.flatMap((item, index) => [
    `${index + 1}. ${item.uname}（赞 ${item.like}）`,
    item.message,
    ""
  ]).slice(0, -1);
}

function buildFrontMatter(meta, settings, created, tagsCsv, tagsYaml) {
  const enabled = getEnabledFrontmatterFields(settings);
  const fixedPropertyLines = getFixedFrontmatterPropertyLines(
    settings,
    buildFrontmatterTemplateContext(meta, created, tagsCsv, tagsYaml)
  );
  if (enabled.length === 0 && fixedPropertyLines.length === 0) {
    return "";
  }

  const fieldLines = {
    title: `title: "${escapeYaml(meta.title)}"`,
    url: `url: "${escapeYaml(cleanVideoUrl())}"`,
    bvid: `bvid: "${escapeYaml(meta.bvid)}"`,
    cid: `cid: "${escapeYaml(meta.cid)}"`,
    author: `author: "${escapeYaml(meta.author || "unknown")}"`,
    upload_date: `upload_date: "${escapeYaml(meta.uploadDate || "unknown")}"`,
    subtitle_lang: `subtitle_lang: "${escapeYaml(meta.selectedSubtitleLang || "unknown")}"`,
    created: `created: "${created}"`,
    tags: `tags: ${tagsYaml}`
  };

  const lines = enabled.map((field) => fieldLines[field]).filter(Boolean);
  lines.push(...fixedPropertyLines);
  if (lines.length === 0) {
    return "";
  }

  return ["---", ...lines, "---"].join("\n");
}

function getEnabledFrontmatterFields(settings) {
  const defaultFields = Array.isArray(DEFAULT_SETTINGS.frontmatterFields)
    ? DEFAULT_SETTINGS.frontmatterFields
    : [];
  const raw = Array.isArray(settings?.frontmatterFields) ? settings.frontmatterFields : defaultFields;
  const allowed = new Set(defaultFields);
  const unique = [];
  raw.forEach((item) => {
    const key = String(item || "").trim();
    if (!key || !allowed.has(key) || unique.includes(key)) {
      return;
    }
    unique.push(key);
  });
  return unique;
}

function getFixedFrontmatterPropertyLines(settings, templateContext = {}) {
  const customPropertyKeyPattern = /^[\p{L}\p{N}_\-\s]+$/u;
  const systemFields = new Set(
    (Array.isArray(DEFAULT_SETTINGS.frontmatterFields) ? DEFAULT_SETTINGS.frontmatterFields : []).map((field) =>
      String(field).toLowerCase()
    )
  );
  const rows = Array.isArray(settings?.fixedFrontmatterProperties) ? settings.fixedFrontmatterProperties : [];
  const seenKeys = new Set();
  const lines = [];

  rows.forEach((item) => {
    const key = String(item?.key || "").trim();
    const type = normalizeFixedPropertyType(item?.type);
    const value = item?.value;
    const lowerKey = key.toLowerCase();
    if (!key || isFixedPropertyRowEffectivelyEmpty(type, value)) {
      return;
    }
    if (!customPropertyKeyPattern.test(key)) {
      return;
    }
    if (systemFields.has(lowerKey) || seenKeys.has(lowerKey)) {
      return;
    }
    seenKeys.add(lowerKey);
    const yamlLine = formatFixedPropertyYamlLine(key, type, value, templateContext);
    if (yamlLine) {
      lines.push(yamlLine);
    }
  });

  return lines;
}

function normalizeFixedPropertyType(value) {
  const type = String(value || "").trim().toLowerCase();
  return type === "number" || type === "checkbox" || type === "list" || type === "date" ? type : "text";
}

function isFixedPropertyRowEffectivelyEmpty(type, value) {
  return !String(value || "").trim();
}

function buildFrontmatterTemplateContext(meta, created, tagsCsv, tagsYaml) {
  return {
    title: String(meta?.title || "").trim(),
    url: String(cleanVideoUrl() || "").trim(),
    bvid: String(meta?.bvid || "").trim(),
    cid: String(meta?.cid || "").trim(),
    author: String(meta?.author || "unknown").trim(),
    upload_date: String(meta?.uploadDate || "unknown").trim(),
    subtitle_lang: String(meta?.selectedSubtitleLang || "unknown").trim(),
    created: String(created || "").trim(),
    tags: String(tagsCsv || "").trim(),
    tags_csv: String(tagsCsv || "").trim(),
    tags_yaml: String(tagsYaml || "").trim()
  };
}

function sanitizeFolderTemplateValue(value) {
  return String(value || "")
    .replace(/[\/\\:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFolderTemplateContext(meta, created = formatLocalDate()) {
  return {
    created: sanitizeFolderTemplateValue(created),
    upload_date: sanitizeFolderTemplateValue(meta?.uploadDate || ""),
    author: sanitizeFolderTemplateValue(meta?.author || ""),
    bvid: sanitizeFolderTemplateValue(meta?.bvid || "")
  };
}

function resolveFolderTemplate(template, meta) {
  const normalized = normalizeFolder(template);
  if (!normalized) {
    return "";
  }

  const allowedKeys = new Set(["created", "upload_date", "author", "bvid"]);
  const context = buildFolderTemplateContext(meta);
  const resolved = String(normalized).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, rawKey) => {
    const key = String(rawKey || "").trim().toLowerCase();
    if (!allowedKeys.has(key)) {
      return "";
    }
    return context[key] || "";
  });

  return resolved
    .split("/")
    .map((segment) => sanitizeFolderTemplateValue(segment))
    .filter(Boolean)
    .join("/");
}

function buildNotePlaceholderTemplateContext(meta, description) {
  return {
    title: String(meta?.title || "").trim(),
    author: String(meta?.author || "").trim(),
    url: String(cleanVideoUrl() || "").trim(),
    upload_date: String(meta?.uploadDate || "").trim(),
    description: String(description || "").trim()
  };
}

function groupNotePlaceholderSections(settings, templateContext = {}) {
  const groups = {
    before_intro: [],
    before_chapters: [],
    before_subtitle: []
  };
  const rows = normalizeNotePlaceholderSections(settings?.notePlaceholderSections);
  rows.forEach((item) => {
    const renderedLines = buildNotePlaceholderLines(item, templateContext);
    if (!renderedLines.length) {
      return;
    }
    groups[item.position].push(...renderedLines);
  });
  return groups;
}

function buildNotePlaceholderLines(item, templateContext = {}) {
  const title = String(item?.title || "").trim();
  if (!title) {
    return [];
  }
  const content = resolveFrontmatterTemplateValue(item?.content, templateContext).trim();
  const lines = [`## ${title}`, ""];
  if (content) {
    lines.push(content, "");
  }
  return lines;
}

function pushOptionalLines(targetLines, extraLines) {
  if (!Array.isArray(extraLines) || !extraLines.length) {
    return;
  }
  targetLines.push(...extraLines);
}

function resolveFrontmatterTemplateValue(value, templateContext = {}) {
  return String(value || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, rawKey) => {
    const key = String(rawKey || "").trim().toLowerCase();
    if (!key) {
      return "";
    }
    const resolved = templateContext[key];
    return resolved == null ? "" : String(resolved);
  });
}

function isYamlDateValue(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());
}

function parseFrontmatterArrayItems(value) {
  return String(value || "")
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatFixedPropertyYamlLine(key, type, value, templateContext = {}) {
  const normalizedType = normalizeFixedPropertyType(type);
  const resolvedValue = resolveFrontmatterTemplateValue(value, templateContext).trim();

  if (!resolvedValue) {
    return "";
  }

  if (normalizedType === "number") {
    const num = Number(resolvedValue);
    if (!Number.isFinite(num)) {
      return "";
    }
    return `${key}: ${resolvedValue}`;
  }

  if (normalizedType === "checkbox") {
    const normalizedValue = resolvedValue.toLowerCase();
    if (normalizedValue !== "true" && normalizedValue !== "false") {
      return "";
    }
    return `${key}: ${normalizedValue}`;
  }

  if (normalizedType === "list") {
    const items = parseFrontmatterArrayItems(resolvedValue);
    return `${key}: [${items.map((item) => `"${escapeYaml(item)}"`).join(", ")}]`;
  }

  if (normalizedType === "date") {
    if (!isYamlDateValue(resolvedValue)) {
      return "";
    }
    return `${key}: ${resolvedValue}`;
  }

  return `${key}: "${escapeYaml(resolvedValue)}"`;
}

function normalizeNotePlaceholderSections(items) {
  const allowedPositions = new Set(["before_intro", "before_chapters", "before_subtitle"]);
  if (!Array.isArray(items)) {
    return [];
  }
  return items
    .map((item) => {
      const title = String(item?.title || "").trim();
      const position = allowedPositions.has(String(item?.position || "").trim())
        ? String(item?.position || "").trim()
        : "before_intro";
      const content = String(item?.content || "").trim();
      return {
        title,
        position,
        content
      };
    })
    .filter((item) => item.title)
    .slice(0, 5);
}

function buildSubtitleSectionLines(body, chapters, settings, withHours) {
  const subtitleItems = (body || [])
    .map((item, index) => ({
      ...item,
      _index: index,
      text: String(item?.content || "").trim()
    }))
    .filter((item) => item.text);
  if (subtitleItems.length === 0) {
    return ["（暂无字幕）"];
  }

  const chapterItems = normalizeChapters(chapters);
  if (chapterItems.length === 0) {
    return subtitleItems.map((item) => formatSubtitleLine(item, settings, withHours));
  }

  const lines = [];
  const usedIndexes = new Set();

  chapterItems.forEach((chapter, idx) => {
    const start = Number(chapter.from || 0) || 0;
    const next = chapterItems[idx + 1];
    const chapterTo = Number(chapter.to || 0) || 0;
    let end = Infinity;
    if (next && Number(next.from) > start) {
      end = Number(next.from);
    } else if (chapterTo > start) {
      end = chapterTo;
    }

    const sectionItems = subtitleItems.filter((item) => {
      const from = Number(item.from || 0) || 0;
      const inStart = from + 0.001 >= start;
      const inEnd = end === Infinity ? true : from < end;
      return inStart && inEnd;
    });

    if (sectionItems.length === 0) {
      return;
    }

    const chapterStamp = settings.includeTimestampInBody
      ? ` \`${formatCompactTimestamp(start, withHours)}\``
      : "";
    lines.push(`### ${chapter.title}${chapterStamp}`, "");
    sectionItems.forEach((item) => {
      usedIndexes.add(item._index);
      lines.push(formatSubtitleLine(item, settings, withHours));
    });
    lines.push("");
  });

  const remaining = subtitleItems.filter((item) => !usedIndexes.has(item._index));
  if (remaining.length > 0) {
    lines.push("### 其他片段", "");
    remaining.forEach((item) => {
      lines.push(formatSubtitleLine(item, settings, withHours));
    });
    lines.push("");
  }

  if (lines.length === 0) {
    return subtitleItems.map((item) => formatSubtitleLine(item, settings, withHours));
  }

  while (lines.length > 0 && !lines[lines.length - 1]) {
    lines.pop();
  }
  return lines;
}

function formatSubtitleLine(item, settings, withHours) {
  const text = String(item?.content || "").trim();
  if (!text) {
    return "";
  }
  if (!settings.includeTimestampInBody) {
    return text;
  }
  return `\`${formatCompactTimestamp(item.from, withHours)}\` ${text}`;
}

function buildChapterLines(chapters, withHours = false) {
  const chapterItems = normalizeChapters(chapters);
  if (chapterItems.length === 0) {
    return [];
  }

  return chapterItems.map((item) => {
    const fromText = formatCompactTimestamp(item.from, withHours);
    return `- \`${fromText}\` ${item.title}`;
  });
}

function buildBilibiliEmbedIframe(meta, page = 1) {
  const safeAid = encodeURIComponent(String(meta?.aid || "").trim());
  const safeBvid = encodeURIComponent(String(meta?.bvid || "").trim());
  const safeCid = encodeURIComponent(String(meta?.cid || "").trim());
  const safePage = Number(page) > 0 ? Number(page) : 1;

  return `<iframe src="https://player.bilibili.com/player.html?aid=${safeAid}&bvid=${safeBvid}&cid=${safeCid}&page=${safePage}&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allow="fullscreen; picture-in-picture" allowfullscreen="true" style="height:100%;width:100%; aspect-ratio: 16 / 9;"> </iframe>`;
}

function buildSrt(body) {
  return body
    .map((item, index) => {
      const from = formatTimestamp(item.from, true);
      const to = formatTimestamp(item.to, true);
      const text = (item.content || "").trim();
      return `${index + 1}\n${from} --> ${to}\n${text}`;
    })
    .join("\n\n");
}

function buildTxt(body, settings) {
  const withHours = shouldShowHoursInSubtitle(body);
  return (body || [])
    .map((item) => {
      const text = String(item?.content || "").trim();
      if (!text) {
        return "";
      }
      if (!settings?.includeTimestampInBody) {
        return text;
      }
      return `${formatCompactTimestamp(item.from, withHours)} ${text}`;
    })
    .filter(Boolean)
    .join("\n");
}

function shouldShowHoursInSubtitle(body) {
  const maxTo = (body || []).reduce((max, item) => {
    const to = Number(item?.to || 0);
    return Number.isFinite(to) && to > max ? to : max;
  }, 0);
  return maxTo >= 3600;
}

function shouldShowHoursInNote(meta, body) {
  const subtitleMaxTo = (body || []).reduce((max, item) => {
    const to = Number(item?.to || 0);
    return Number.isFinite(to) && to > max ? to : max;
  }, 0);
  const chapterMaxTo = normalizeChapters(meta?.chapters || []).reduce((max, item) => {
    const from = Number(item?.from || 0) || 0;
    const to = Number(item?.to || 0) || 0;
    return Math.max(max, from, to);
  }, 0);
  const duration = Number(meta?.videoDuration || 0) || 0;
  return Math.max(subtitleMaxTo, chapterMaxTo, duration) >= 3600;
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

function formatTimestamp(seconds, forSrt = false) {
  const safe = Number(seconds) || 0;
  const msTotal = Math.max(0, Math.floor(safe * 1000));
  const hour = Math.floor(msTotal / 3600000);
  const minute = Math.floor((msTotal % 3600000) / 60000);
  const second = Math.floor((msTotal % 60000) / 1000);
  const ms = msTotal % 1000;

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  const ss = String(second).padStart(2, "0");
  if (!forSrt) {
    return `${hh}:${mm}:${ss}.${String(ms).padStart(3, "0")}`;
  }

  return `${hh}:${mm}:${ss},${String(ms).padStart(3, "0")}`;
}

function sanitizeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim().slice(0, 120);
}

function normalizeDownloadFormat(value) {
  return value === "txt" ? "txt" : "srt";
}

function buildNoteFilename(meta) {
  const includeDate = state.settings?.includeDateInFilename !== false;
  const baseParts = [];

  if (includeDate) {
    baseParts.push(formatLocalDate());
  }

  baseParts.push(meta.title || meta.bvid || "bilibili-subtitle");

  if (Number(meta.pageCount) > 1) {
    baseParts.push(`P${Number(meta.pageIndex) > 0 ? Number(meta.pageIndex) : 1}`);
    const pageTitle = String(meta.pageTitle || "").trim();
    if (pageTitle) {
      baseParts.push(pageTitle);
    }
  }

  const baseName = sanitizeFileName(baseParts.filter(Boolean).join("-"));
  return `${baseName || "bilibili-subtitle"}.md`;
}

function normalizeFolder(input) {
  return String(input || "").trim().replace(/^\/+|\/+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeYaml(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

})();

})();
