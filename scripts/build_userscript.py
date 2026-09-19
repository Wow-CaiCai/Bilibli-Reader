from __future__ import annotations

import base64
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CONTENT_PATH = ROOT / "content.js"
CSS_PATH = ROOT / "content.css"
ICON_PATH = ROOT / "icons" / "icon48.png"
OUTPUT_PATH = ROOT / "Bilibli-Reader.user.js"
RELEASE_PATH = ROOT / "release" / "bilibli-reader-v0.0.3.user.js"


def main() -> None:
    content = CONTENT_PATH.read_text(encoding="utf-8")
    css_literal = json.dumps(CSS_PATH.read_text(encoding="utf-8"), ensure_ascii=False)
    icon_data = base64.b64encode(ICON_PATH.read_bytes()).decode("ascii")

    header = f"""// ==UserScript==
// @name         Bilibili Reader｜B站阅读模式
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
// @icon         data:image/png;base64,{icon_data}
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

(() => {{
  "use strict";

  const USERSCRIPT_SETTINGS_KEY = "bilibli-reader-settings";
  const runtimeListeners = [];
  const storageListeners = [];

  GM_addStyle({css_literal});

  const chrome = {{
    runtime: {{
      lastError: null,
      onMessage: {{
        addListener(listener) {{
          runtimeListeners.push(listener);
        }},
        removeListener(listener) {{
          const index = runtimeListeners.indexOf(listener);
          if (index >= 0) runtimeListeners.splice(index, 1);
        }}
      }},
      sendMessage(message, callback) {{
        handleBackgroundMessage(message)
          .then((response) => callback?.(response))
          .catch((error) => callback?.({{ ok: false, error: String(error?.message || error) }}));
      }}
    }},
    storage: {{
      onChanged: {{
        addListener(listener) {{
          storageListeners.push(listener);
        }},
        removeListener(listener) {{
          const index = storageListeners.indexOf(listener);
          if (index >= 0) storageListeners.splice(index, 1);
        }}
      }},
      local: {{
        async get(keys) {{
          if (typeof keys === "string") {{
            return {{ [keys]: await Promise.resolve(GM_getValue(keys, undefined)) }};
          }}
          const result = {{}};
          for (const key of Array.isArray(keys) ? keys : Object.keys(keys || {{}})) {{
            result[key] = await Promise.resolve(GM_getValue(key, keys?.[key]));
          }}
          return result;
        }},
        async set(values) {{
          for (const [key, value] of Object.entries(values || {{}})) {{
            await Promise.resolve(GM_setValue(key, value));
          }}
        }},
        async remove(keys) {{
          for (const key of Array.isArray(keys) ? keys : [keys]) {{
            await Promise.resolve(GM_deleteValue(key));
          }}
        }}
      }}
    }}
  }};

  async function handleBackgroundMessage(message) {{
    if (message?.type === "get-settings") {{
      const settings = await Promise.resolve(GM_getValue(USERSCRIPT_SETTINGS_KEY, {{}}));
      return {{ ok: true, settings: settings && typeof settings === "object" ? settings : {{}} }};
    }}
    if (message?.type === "save-settings") {{
      const previous = await Promise.resolve(GM_getValue(USERSCRIPT_SETTINGS_KEY, {{}}));
      const settings = message.settings && typeof message.settings === "object" ? message.settings : {{}};
      await Promise.resolve(GM_setValue(USERSCRIPT_SETTINGS_KEY, settings));
      const changes = {{}};
      for (const key of new Set([...Object.keys(previous || {{}}), ...Object.keys(settings)])) {{
        if (previous?.[key] !== settings[key]) {{
          changes[key] = {{ oldValue: previous?.[key], newValue: settings[key] }};
        }}
      }}
      storageListeners.forEach((listener) => listener(changes, "sync"));
      return {{ ok: true }};
    }}
    if (message?.type === "fetch-json") {{
      return {{ ok: true, data: await requestJson(String(message.url || "")) }};
    }}
    return {{ ok: false, error: "此功能在独立阅读脚本中不可用" }};
  }}

  async function requestJson(url) {{
    if (!url) throw new Error("缺少请求地址");
    const normalizedUrl = url.startsWith("//") ? `https:${{url}}` : url;
    let directError = null;
    try {{
      const pageFetch =
        typeof unsafeWindow !== "undefined" && typeof unsafeWindow.fetch === "function"
          ? unsafeWindow.fetch.bind(unsafeWindow)
          : fetch;
      const response = await pageFetch(normalizedUrl, {{
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {{ Accept: "application/json, text/plain, */*" }}
      }});
      if (response.ok) return await response.json();
      directError = new Error(`页面请求 HTTP ${{response.status}}`);
    }} catch (error) {{
      directError = error;
    }}

    return requestJsonWithUserscriptApi(normalizedUrl, directError);
  }}

  function requestJsonWithUserscriptApi(url, directError = null) {{
    return new Promise((resolve, reject) => {{
      let settled = false;
      const finish = (handler, value) => {{
        if (settled) return;
        settled = true;
        handler(value);
      }};
      const onload = (response) => {{
        if (response.status < 200 || response.status >= 300) {{
          finish(reject, new Error(`HTTP ${{response.status}}`));
          return;
        }}
        try {{
          const payload =
            response.response && typeof response.response === "object"
              ? response.response
              : JSON.parse(response.responseText || response.response || "");
          finish(resolve, payload);
        }} catch {{
          finish(reject, new Error("返回内容不是有效 JSON"));
        }}
      }};
      const onerror = (error) =>
        finish(
          reject,
          new Error(
            error?.error ||
              `网络请求失败${{directError?.message ? `（${{directError.message}}）` : ""}}`
          )
        );
      const requestOptions = {{
        method: "GET",
        url,
        headers: {{
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          Referer: "https://www.bilibili.com/"
        }},
        responseType: "text",
        anonymous: false,
        withCredentials: true,
        timeout: 20000,
        onload,
        ontimeout() {{ finish(reject, new Error("请求超时")); }},
        onerror
      }};
      const requestApi =
        typeof GM_xmlhttpRequest === "function"
          ? GM_xmlhttpRequest
          : typeof GM !== "undefined" && typeof GM.xmlHttpRequest === "function"
            ? GM.xmlHttpRequest.bind(GM)
            : null;
      if (!requestApi) {{
        finish(reject, new Error("脚本管理器未提供跨域请求权限"));
        return;
      }}
      try {{
        const request = requestApi(requestOptions);
        if (request && typeof request.then === "function") {{
          request.then(onload).catch(onerror);
        }}
      }} catch (error) {{
        onerror(error);
      }}
    }});
  }}

  function dispatchRuntimeMessage(message) {{
    return new Promise((resolve) => {{
      let settled = false;
      const respond = (response) => {{
        if (settled) return;
        settled = true;
        resolve(response);
      }};
      for (const listener of runtimeListeners) {{
        const keepChannelOpen = listener(message, null, respond);
        if (settled) return;
        if (keepChannelOpen === true) {{
          window.setTimeout(() => respond({{ ok: false, error: "操作超时" }}), 5000);
          return;
        }}
      }}
      respond({{ ok: false, error: "阅读脚本尚未就绪" }});
    }});
  }}

  GM_registerMenuCommand("进入阅读模式", () => {{
    const readerUrl = new URL(location.href);
    readerUrl.searchParams.set("bilibli_reader", "1");
    dispatchRuntimeMessage({{
      type: "popup-trigger-reading-view",
      readerUrl: readerUrl.toString()
    }});
  }});

  GM_registerMenuCommand("退出阅读模式", () => {{
    const closeButton = document.getElementById("blr-reading-close-btn");
    if (closeButton) closeButton.click();
  }});

"""

    output = header + content + "\n})();\n"
    OUTPUT_PATH.write_text(output, encoding="utf-8", newline="\n")
    RELEASE_PATH.parent.mkdir(exist_ok=True)
    RELEASE_PATH.write_text(output, encoding="utf-8", newline="\n")
    print(OUTPUT_PATH)
    print(RELEASE_PATH)


if __name__ == "__main__":
    main()
