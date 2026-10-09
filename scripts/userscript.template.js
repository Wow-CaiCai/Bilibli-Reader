// ==UserScript==
// @name         Bilibili Reader｜哔哩哔哩阅读模式
// @namespace    https://github.com/bilibli-reader
// @version      __BLR_VERSION__
// @description  B 站与 YouTube 阅读模式，支持连续字幕、章节联动、点击跳转与语言切换
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
// @icon         data:image/png;base64,__BLR_ICON__
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

  GM_addStyle(__BLR_CSS__);

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
    if (message?.type === "fetch-text") {
      return { ok: true, data: await requestResource(String(message.url || ""), true) };
    }
    return { ok: false, error: "此功能在独立阅读脚本中不可用" };
  }

  async function requestJson(url) {
    return requestResource(url);
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
