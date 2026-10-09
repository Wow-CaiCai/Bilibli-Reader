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
