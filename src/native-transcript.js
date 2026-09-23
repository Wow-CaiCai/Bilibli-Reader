function startNativeTranscriptPanelObserver() {
  if (state.nativeTranscriptObserver || !document.body) {
    return;
  }

  state.nativeTranscriptObserver = new MutationObserver(() => {
    scheduleNativeTranscriptPanelSync();
  });
  state.nativeTranscriptObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  window.addEventListener("resize", () => scheduleNativeTranscriptPanelSync(60), {
    passive: true
  });
  startNativeTranscriptPlaybackSync();
  scheduleNativeTranscriptPanelSync(0);
}

function scheduleNativeTranscriptPanelSync(delayMs = 120) {
  if (state.nativeTranscriptSyncTimer) {
    return;
  }
  state.nativeTranscriptSyncTimer = window.setTimeout(() => {
    state.nativeTranscriptSyncTimer = 0;
    ensureNativeTranscriptPanel();
  }, Math.max(0, Number(delayMs) || 0));
}

function shouldShowNativeTranscriptPanel() {
  return Boolean(extractBvid(location.href)) && !isReaderMode() && !state.readingViewOpen;
}

function findNativeTranscriptAnchor() {
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
    existing?.remove();
    state.nativeTranscriptRenderedKey = "";
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
    panel.innerHTML = `
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
    `;
    bindNativeTranscriptPanelEvents(panel);
  }

  if (panel.parentElement !== anchor.parentElement || panel.nextElementSibling !== anchor) {
    anchor.insertAdjacentElement("beforebegin", panel);
  }

  panel.classList.toggle(
    "is-collaboration-layout",
    anchor.matches(".up-panel-container") && Boolean(anchor.querySelector(".members-info-container"))
  );

  setNativeTranscriptExpanded(panel, state.nativeTranscriptOpen);
  bindNativeTranscriptPanelResize();
  syncNativeTranscriptPanelAlignment();
  syncNativeTranscriptPanelHeight();
  renderNativeTranscriptPanel({ force: created });
  ensureNativeTranscriptLoaded();
  return panel;
}

function bindNativeTranscriptPanelEvents(panel) {
  const body = panel.querySelector(`#${ids.nativeTranscriptBody}`);
  const returnButton = panel.querySelector(`#${ids.nativeTranscriptReturnButton}`);
  const themeButton = panel.querySelector(`#${ids.nativeTranscriptThemeButton}`);
  const toggle = () => {
    state.nativeTranscriptOpen = !state.nativeTranscriptOpen;
    setNativeTranscriptExpanded(panel, state.nativeTranscriptOpen);
    if (state.nativeTranscriptOpen) {
      ensureNativeTranscriptLoaded();
      syncNativeTranscriptPlayback(true);
    }
  };
  panel.querySelectorAll("[data-native-transcript-toggle]").forEach((button) => {
    button.addEventListener("click", toggle);
  });
  returnButton?.addEventListener("click", () => {
    state.nativeTranscriptManualScrollPauseUntil = 0;
    if (!state.nativeTranscriptOpen) {
      state.nativeTranscriptOpen = true;
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
    const nextIndex = (themes.indexOf(state.nativeTranscriptTheme) + 1) % themes.length;
    updateNativeTranscriptTheme(themes[nextIndex]);
    themeButton.classList.add("is-active");
    window.setTimeout(() => themeButton.classList.remove("is-active"), 300);
  });
  body?.addEventListener("click", onNativeTranscriptClick);
  panel.addEventListener("change", onNativeTranscriptChange);
  const noteManualScroll = () => {
    if (Date.now() <= state.nativeTranscriptProgrammaticScrollUntil) {
      return;
    }
    state.nativeTranscriptManualScrollPauseUntil = Date.now() + 3000;
  };
  body?.addEventListener("scroll", noteManualScroll, true);
  body?.addEventListener("wheel", noteManualScroll, { passive: true });
  body?.addEventListener("pointerdown", noteManualScroll, { passive: true });
}

function setNativeTranscriptExpanded(panel, expanded) {
  if (!panel) {
    return;
  }
  const isExpanded = Boolean(expanded);
  panel.classList.toggle("is-folded", !isExpanded);
  panel.querySelectorAll("[data-native-transcript-toggle]").forEach((button) => {
    button.setAttribute("aria-expanded", String(isExpanded));
  });
  const arrowButton = panel.querySelector(".blr-native-transcript-arrow-button");
  arrowButton?.setAttribute("aria-label", isExpanded ? "折叠字幕" : "展开字幕");
  const body = panel.querySelector(`#${ids.nativeTranscriptBody}`);
  if (body) {
    body.hidden = !isExpanded;
  }
}

function hydrateNativeTranscriptSettings(settings = state.settings) {
  state.nativeTranscriptTheme = normalizeNativeTranscriptTheme(settings?.nativeTranscriptTheme);
  state.nativeTranscriptFontSize = normalizeNativeTranscriptFontSize(
    settings?.nativeTranscriptFontSize
  );
  state.nativeTranscriptFontWeight = normalizeNativeTranscriptFontWeight(
    settings?.nativeTranscriptFontWeight
  );
  state.settings = {
    ...state.settings,
    nativeTranscriptTheme: state.nativeTranscriptTheme,
    nativeTranscriptFontSize: state.nativeTranscriptFontSize,
    nativeTranscriptFontWeight: state.nativeTranscriptFontWeight
  };
  applyNativeTranscriptTypography();
}

function applyNativeTranscriptTypography(panel = document.getElementById(ids.nativeTranscriptPanel)) {
  if (!panel) {
    return;
  }
  panel.dataset.theme = state.nativeTranscriptTheme;
  const themeButton = panel.querySelector(`#${ids.nativeTranscriptThemeButton}`);
  if (themeButton) {
    const themeLabels = { light: "浅色", dark: "深色", paper: "纸张" };
    const label = `切换字幕主题，当前：${themeLabels[state.nativeTranscriptTheme] || "浅色"}`;
    themeButton.title = label;
    themeButton.setAttribute("aria-label", label);
  }
  panel.style.setProperty(
    "--blr-native-transcript-font-size",
    `${state.nativeTranscriptFontSize}px`
  );
  panel.style.setProperty(
    "--blr-native-transcript-font-weight",
    String(state.nativeTranscriptFontWeight)
  );
  const fontSizeSelect = panel.querySelector(`#${ids.nativeTranscriptFontSizeSelect}`);
  const fontWeightSelect = panel.querySelector(`#${ids.nativeTranscriptFontWeightSelect}`);
  if (fontSizeSelect) {
    fontSizeSelect.value = String(state.nativeTranscriptFontSize);
  }
  if (fontWeightSelect) {
    fontWeightSelect.value = String(state.nativeTranscriptFontWeight);
  }
}

function updateNativeTranscriptTheme(theme) {
  state.nativeTranscriptTheme = normalizeNativeTranscriptTheme(theme);
  state.settings = {
    ...state.settings,
    nativeTranscriptTheme: state.nativeTranscriptTheme
  };
  applyNativeTranscriptTypography();
  persistReaderSettings();
}

function updateNativeTranscriptTypography({ fontSize, fontWeight } = {}) {
  state.nativeTranscriptFontSize = normalizeNativeTranscriptFontSize(
    fontSize ?? state.nativeTranscriptFontSize
  );
  state.nativeTranscriptFontWeight = normalizeNativeTranscriptFontWeight(
    fontWeight ?? state.nativeTranscriptFontWeight
  );
  state.settings = {
    ...state.settings,
    nativeTranscriptFontSize: state.nativeTranscriptFontSize,
    nativeTranscriptFontWeight: state.nativeTranscriptFontWeight
  };
  applyNativeTranscriptTypography();
  persistReaderSettings();
}

function renderNativeTranscriptHeaderControls(panel) {
  const languageSelect = panel.querySelector(`#${ids.nativeTranscriptSelect}`);
  if (languageSelect) {
    const selectedUrlKey = normalizeSubtitleUrlForCache(state.selectedSubtitleUrl);
    const languageRenderKey = JSON.stringify([
      state.selectedSubtitleId,
      selectedUrlKey,
      state.subtitles.map((item) => [item.id, item.subtitleUrl, item.lanDoc, item.lan])
    ]);
    const optionsHtml = state.subtitles.length
      ? state.subtitles
          .map((item) => {
            const selected =
              (state.selectedSubtitleId && String(item.id) === String(state.selectedSubtitleId)) ||
              normalizeSubtitleUrlForCache(item.subtitleUrl) === selectedUrlKey;
            return `<option value="${escapeHtml(item.subtitleUrl)}" data-id="${escapeHtml(
              item.id
            )}" data-lang="${escapeHtml(item.lanDoc || item.lan || "unknown")}"${
              selected ? " selected" : ""
            }>${escapeHtml(item.lanDoc || item.lan || "字幕")}</option>`;
          })
          .join("")
      : '<option value="">字幕</option>';
    if (languageSelect.dataset.renderKey !== languageRenderKey) {
      languageSelect.innerHTML = optionsHtml;
      languageSelect.dataset.renderKey = languageRenderKey;
    }
    languageSelect.disabled = state.subtitles.length === 0 || state.subtitleFetchState === "loading";
  }
  applyNativeTranscriptTypography(panel);
}

function getNativeTranscriptPlaceholderText() {
  if (state.subtitleFetchState === "loading" || state.subtitleFetchState === "idle") {
    return "正在加载字幕...";
  }
  if (state.subtitleFetchState === "error") {
    return "字幕加载失败";
  }
  return "当前视频无字幕";
}

function renderNativeTranscriptPanel({ force = false } = {}) {
  const panel = document.getElementById(ids.nativeTranscriptPanel);
  const body = panel?.querySelector(`#${ids.nativeTranscriptBody}`);
  if (!panel || !body || !shouldShowNativeTranscriptPanel()) {
    return;
  }

  renderNativeTranscriptHeaderControls(panel);

  const transcriptItems = getReadingTranscriptItems();
  const renderKey = [
    computeCurrentClipSignature(),
    state.subtitleFetchState,
    state.selectedSubtitleId,
    normalizeSubtitleUrlForCache(state.selectedSubtitleUrl),
    transcriptItems.length,
    state.subtitles.length
  ].join("|");
  if (!force && state.nativeTranscriptRenderedKey === renderKey && body.childElementCount > 0) {
    return;
  }
  state.nativeTranscriptRenderedKey = renderKey;
  if (transcriptItems.length === 0) {
    const retry = state.subtitleFetchState === "error";
    body.innerHTML = `
      <div class="blr-native-transcript-state${retry ? " is-error" : ""}">
        <span>${escapeHtml(getNativeTranscriptPlaceholderText())}</span>
        ${retry ? '<button type="button" data-native-transcript-retry>重试</button>' : ""}
      </div>
    `;
    state.nativeTranscriptActiveIndex = -1;
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

  body.innerHTML = `
    <div id="${ids.nativeTranscriptList}" class="blr-native-transcript-list">
      ${transcriptHtml}
    </div>
  `;
  state.nativeTranscriptActiveIndex = -1;
  syncNativeTranscriptPlayback(true);
}

function ensureNativeTranscriptLoaded({ force = false } = {}) {
  if (!shouldShowNativeTranscriptPanel()) {
    return Promise.resolve();
  }

  const signature = computeCurrentClipSignature();
  initializeNativeTranscriptForSignature(signature);
  if (
    !force &&
    signature === state.nativeTranscriptLoadedSignature &&
    ["ready", "empty", "error"].includes(state.subtitleFetchState)
  ) {
    autoFoldNativeTranscriptIfEmpty(signature);
    renderNativeTranscriptPanel();
    return Promise.resolve();
  }
  if (
    state.nativeTranscriptLoadPromise &&
    state.nativeTranscriptLoadSignature === signature
  ) {
    return state.nativeTranscriptLoadPromise;
  }

  state.subtitleFetchState = "loading";
  renderNativeTranscriptPanel();
  const loadSignature = signature;
  const loadPromise = refreshClip()
    .catch((error) => {
      logWarn("[Bilibili Reader] native transcript load failed", error);
    })
    .finally(() => {
      if (computeCurrentClipSignature() === loadSignature) {
        state.nativeTranscriptLoadedSignature = loadSignature;
        autoFoldNativeTranscriptIfEmpty(loadSignature);
      }
      if (state.nativeTranscriptLoadPromise === loadPromise) {
        state.nativeTranscriptLoadPromise = null;
        state.nativeTranscriptLoadSignature = "";
      }
      renderNativeTranscriptPanel();
      syncNativeTranscriptPlayback(true);
    });
  state.nativeTranscriptLoadSignature = loadSignature;
  state.nativeTranscriptLoadPromise = loadPromise;
  return loadPromise;
}

function initializeNativeTranscriptForSignature(signature = computeCurrentClipSignature()) {
  if (!signature || state.nativeTranscriptDisplaySignature === signature) {
    return;
  }
  state.nativeTranscriptDisplaySignature = signature;
  state.nativeTranscriptAutoFoldedSignature = "";
  state.nativeTranscriptOpen = true;
  setNativeTranscriptExpanded(document.getElementById(ids.nativeTranscriptPanel), true);
}

function autoFoldNativeTranscriptIfEmpty(signature = computeCurrentClipSignature()) {
  if (
    state.subtitleFetchState !== "empty" ||
    state.nativeTranscriptAutoFoldedSignature === signature
  ) {
    return;
  }
  state.nativeTranscriptAutoFoldedSignature = signature;
  state.nativeTranscriptOpen = false;
  setNativeTranscriptExpanded(document.getElementById(ids.nativeTranscriptPanel), false);
}

function bindNativeTranscriptPanelResize() {
  const player = document.getElementById("playerWrap") || document.getElementById("bilibili-player");
  if (!player || state.nativeTranscriptObservedPlayer === player) {
    return;
  }
  state.nativeTranscriptResizeObserver?.disconnect();
  state.nativeTranscriptResizeObserver = new ResizeObserver(() => {
    syncNativeTranscriptPanelAlignment();
    syncNativeTranscriptPanelHeight();
  });
  state.nativeTranscriptResizeObserver.observe(player);
  state.nativeTranscriptObservedPlayer = player;
}

function syncNativeTranscriptPanelAlignment() {
  const panel = document.getElementById(ids.nativeTranscriptPanel);
  if (!panel) {
    return;
  }
  if (!panel.classList.contains("is-collaboration-layout")) {
    panel.style.removeProperty("margin-top");
    return;
  }
  const player = document.getElementById("playerWrap") || document.getElementById("bilibili-player");
  if (!player) {
    return;
  }
  panel.style.setProperty("margin-top", "0px");
  const panelTop = panel.getBoundingClientRect().top;
  const playerTop = player.getBoundingClientRect().top;
  if (!Number.isFinite(panelTop) || !Number.isFinite(playerTop)) {
    return;
  }
  panel.style.setProperty("margin-top", `${Math.max(0, Math.round(playerTop - panelTop))}px`);
}

function syncNativeTranscriptPanelHeight() {
  const panel = document.getElementById(ids.nativeTranscriptPanel);
  const player = document.getElementById("playerWrap") || document.getElementById("bilibili-player");
  if (!panel || !player) {
    return;
  }
  const playerHeight = player.getBoundingClientRect().height;
  if (!(playerHeight > 120)) {
    return;
  }
  panel.style.setProperty(
    "--blr-native-transcript-body-height",
    `${Math.max(0, Math.round(playerHeight - 56))}px`
  );
}

function startNativeTranscriptPlaybackSync() {
  if (state.nativeTranscriptPlaybackTimer) {
    return;
  }
  state.nativeTranscriptPlaybackTimer = window.setInterval(() => {
    syncNativeTranscriptPlayback();
  }, 250);
}

function syncNativeTranscriptPlayback(forceScroll = false) {
  const panel = document.getElementById(ids.nativeTranscriptPanel);
  const list = panel?.querySelector(`#${ids.nativeTranscriptList}`);
  if (!panel || !list || !state.nativeTranscriptOpen || state.subtitleBody.length === 0) {
    return;
  }
  const video = getRuntimeVideoElement();
  if (!video) {
    return;
  }
  const nextIndex = findActiveSubtitleIndex(Number(video.currentTime || 0) || 0);
  const current = list.querySelector(".is-active");
  const next = list.querySelector(`[data-native-transcript-index="${nextIndex}"]`);
  if (current && current !== next) {
    current.classList.remove("is-active");
  }
  if (next) {
    next.classList.add("is-active");
  }
  const changed = nextIndex !== state.nativeTranscriptActiveIndex;
  state.nativeTranscriptActiveIndex = nextIndex;
  if (
    next &&
    (changed || forceScroll) &&
    Date.now() >= state.nativeTranscriptManualScrollPauseUntil
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
  state.nativeTranscriptProgrammaticScrollUntil = Date.now() + (behavior === "auto" ? 120 : 700);
  list.scrollTo({ top: Math.max(0, Math.round(target)), behavior });
}

function onNativeTranscriptClick(event) {
  const retry = event.target.closest("[data-native-transcript-retry]");
  if (retry) {
    state.nativeTranscriptLoadedSignature = "";
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
  state.nativeTranscriptManualScrollPauseUntil = 0;
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
  const previousFetchState = state.subtitleFetchState;
  select.disabled = true;
  loadSubtitle(
    url,
    String(option.dataset.lang || "unknown"),
    state.fetchRunId,
    String(option.dataset.id || "")
  )
    .then(() => {
      renderNativeTranscriptPanel();
      syncNativeTranscriptPlayback(true);
    })
    .catch((error) => {
      state.subtitleFetchState = previousFetchState === "ready" ? "ready" : "error";
      logWarn("[Bilibili Reader] native subtitle switch failed", error);
      renderNativeTranscriptPanel({ force: true });
    })
    .finally(() => {
      const currentSelect = document.getElementById(ids.nativeTranscriptSelect);
      if (currentSelect) {
        currentSelect.disabled = state.subtitles.length === 0;
      }
    });
}
