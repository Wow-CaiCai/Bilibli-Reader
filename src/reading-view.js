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

  const title = clipState.title || "B站字幕阅读";
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
    chapterList.innerHTML = chapters.length === 0
      ? '<div class="blr-reading-empty">当前视频没有章节。</div>'
      : chapters.map((item, index) => `
          <button type="button" class="blr-reading-chapter" data-index="${index}"
            data-seconds="${Number(item.from || 0) || 0}">
            <span class="blr-reading-chapter-time">${escapeHtml(formatCompactTimestamp(item.from, withHours))}</span>
            <span class="blr-reading-chapter-title">${escapeHtml(item.title)}</span>
          </button>
        `).join("");
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
      transcriptList.innerHTML = `<div class="blr-reading-empty">${escapeHtml(placeholder)}</div>`;
    } else {
      transcriptList.innerHTML = `
        <div class="blr-reading-complete" role="document">
          ${transcriptItems.map((item) => `
              <button type="button" class="blr-reading-complete-segment"
                data-index="${item.index}" data-seconds="${item.from}"
                aria-label="${escapeHtml(formatCompactTimestamp(item.from, withHours))} ${escapeHtml(item.content)}"
              >${escapeHtml(item.content)}</button>
            `).join(" ")}
        </div>
        <div id="${ids.readingTranscriptTailSpacer}" class="blr-reading-tail-spacer" aria-hidden="true"></div>
      `;
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
    collectionList.innerHTML = "";
    return;
  }

  const currentIndex = Number(collection.currentIndex);
  const currentEpisode = currentIndex >= 0 ? episodes[currentIndex] : null;
  episodeTitle.textContent = currentEpisode?.title || clipState.pageTitle || clipState.title || "";
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
  // The retired settings panel could persist hidden sections. Keep both visible now that
  // the only reader controls live in the transcript header.
  readerPreferences.chapterVisible = true;
  readerPreferences.transcriptVisible = true;
}

function setReaderDatasetValue(node, key, value) {
  if (node.dataset[key] !== value) node.dataset[key] = value;
}

function applyReadingViewPresentation() {
  const readingView = byId(ids.readingView);
  setReaderDatasetValue(readingView, "theme", readerPreferences.theme);
  setReaderDatasetValue(readingView, "fontScale", readerPreferences.fontScale);
  setReaderDatasetValue(readingView, "fontWeight", readerPreferences.fontWeight);
  setReaderDatasetValue(readingView, "letterSpacing", readerPreferences.letterSpacing);
  setReaderDatasetValue(readingView, "lineHeight", readerPreferences.lineHeight);
  setReaderDatasetValue(readingView, "contentWidth", readerPreferences.contentWidth);
  setReaderDatasetValue(readingView, "chapterVisibility", readerPreferences.chapterVisible ? "auto" : "hide");
  setReaderDatasetValue(readingView, "transcriptVisible", readerPreferences.transcriptVisible ? "1" : "0");
  setReaderDatasetValue(document.documentElement, "blrReaderTheme", readerPreferences.theme);
  setReaderDatasetValue(document.documentElement, "blrReaderFontScale", readerPreferences.fontScale);
  setReaderDatasetValue(document.documentElement, "blrReaderFontWeight", readerPreferences.fontWeight);
  setReaderDatasetValue(document.documentElement, "blrReaderLetterSpacing", readerPreferences.letterSpacing);
  setReaderDatasetValue(document.documentElement, "blrReaderLineHeight", readerPreferences.lineHeight);
  setReaderDatasetValue(document.documentElement, "blrReaderContentWidth", readerPreferences.contentWidth);
  setReaderDatasetValue(document.documentElement, "blrReaderChapterVisibility", readerPreferences.chapterVisible ? "auto" : "hide");
  setReaderDatasetValue(document.documentElement, "blrReaderTranscriptVisible", readerPreferences.transcriptVisible ? "1" : "0");
  setReaderDatasetValue(document.body, "blrReaderTheme", readerPreferences.theme);
  setReaderDatasetValue(document.body, "blrReaderFontScale", readerPreferences.fontScale);
  setReaderDatasetValue(document.body, "blrReaderFontWeight", readerPreferences.fontWeight);
  setReaderDatasetValue(document.body, "blrReaderLetterSpacing", readerPreferences.letterSpacing);
  setReaderDatasetValue(document.body, "blrReaderLineHeight", readerPreferences.lineHeight);
  setReaderDatasetValue(document.body, "blrReaderContentWidth", readerPreferences.contentWidth);
  setReaderDatasetValue(document.body, "blrReaderChapterVisibility", readerPreferences.chapterVisible ? "auto" : "hide");
  setReaderDatasetValue(document.body, "blrReaderTranscriptVisible", readerPreferences.transcriptVisible ? "1" : "0");
  applyReaderColumnLayout();
  const main = document.querySelector(".blr-reading-main");
  if (main) {
    main.style.display = readerPreferences.transcriptVisible ? "" : "none";
  }
  const inlineHost = document.getElementById("blr-reading-inline-host");
  if (inlineHost) {
    if (readerPreferences.transcriptVisible) {
      inlineHost.style.border = "";
      inlineHost.style.background = "";
      inlineHost.style.marginTop = "";
      inlineHost.style.boxShadow = "";
      inlineHost.style.borderRadius = "";
    } else {
      const leftContainer = document.querySelector(".left-container");
      const bgColor = leftContainer ? getComputedStyle(leftContainer).backgroundColor : "";
      inlineHost.style.border = "none";
      inlineHost.style.background = bgColor;
      inlineHost.style.marginTop = "0";
      inlineHost.style.boxShadow = "none";
      inlineHost.style.borderRadius = "0";
    }
  }
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
  readerPreferences.chapterVisible = next.readerChapterVisible !== undefined ? Boolean(next.readerChapterVisible) : readerPreferences.chapterVisible;
  readerPreferences.transcriptVisible = normalizeReaderTranscriptVisible(
    next.readerTranscriptVisible ?? readerPreferences.transcriptVisible
  );
  readerPreferences.settings = {
    ...readerPreferences.settings,
    readerTheme: readerPreferences.theme,
    readerFontScale: readerPreferences.fontScale,
    readerFontWeight: readerPreferences.fontWeight,
    readerLetterSpacing: readerPreferences.letterSpacing,
    readerLineHeight: readerPreferences.lineHeight,
    readerContentWidth: readerPreferences.contentWidth,
    readerChapterVisible: readerPreferences.chapterVisible,
    readerTranscriptVisible: readerPreferences.transcriptVisible
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
  parts.push("bilibili.com");
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
    transcriptHeading.innerHTML = buildReadingTranscriptHeadingHtml();
  } else if (!transcriptHeading.querySelector(".blr-reading-transcript-heading-controls")) {
    transcriptHeading.innerHTML = buildReadingTranscriptHeadingHtml();
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
  const leftContainer = document.querySelector(".left-container");
  const bgColor = leftContainer ? getComputedStyle(leftContainer).backgroundColor : "";
  if (readerPreferences.transcriptVisible) {
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
