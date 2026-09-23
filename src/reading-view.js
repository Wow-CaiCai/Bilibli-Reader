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
  } else {
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
  }

  updateReaderChapterPresence(hasChapters);
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
  // The retired settings panel could persist hidden sections. Keep both visible now that
  // the only reader controls live in the transcript header.
  state.readingChapterVisible = true;
  state.readingTranscriptVisible = true;
  state.readingTimestampVisible = true;
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
  document.documentElement.dataset.blrReaderTheme = state.readingTheme;
  document.documentElement.dataset.blrReaderFontScale = state.readingFontScale;
  document.documentElement.dataset.blrReaderFontWeight = state.readingFontWeight;
  document.documentElement.dataset.blrReaderLetterSpacing = state.readingLetterSpacing;
  document.documentElement.dataset.blrReaderLineHeight = state.readingLineHeight;
  document.documentElement.dataset.blrReaderContentWidth = state.readingContentWidth;
  document.documentElement.dataset.blrReaderChapterVisibility = state.readingChapterVisible ? "auto" : "hide";
  document.documentElement.dataset.blrReaderTranscriptVisible = state.readingTranscriptVisible ? "1" : "0";
  document.documentElement.dataset.blrReaderTimestampVisible = state.readingTimestampVisible ? "1" : "0";
  document.body.dataset.blrReaderTheme = state.readingTheme;
  document.body.dataset.blrReaderFontScale = state.readingFontScale;
  document.body.dataset.blrReaderFontWeight = state.readingFontWeight;
  document.body.dataset.blrReaderLetterSpacing = state.readingLetterSpacing;
  document.body.dataset.blrReaderLineHeight = state.readingLineHeight;
  document.body.dataset.blrReaderContentWidth = state.readingContentWidth;
  document.body.dataset.blrReaderChapterVisibility = state.readingChapterVisible ? "auto" : "hide";
  document.body.dataset.blrReaderTranscriptVisible = state.readingTranscriptVisible ? "1" : "0";
  document.body.dataset.blrReaderTimestampVisible = state.readingTimestampVisible ? "1" : "0";
  applyReaderColumnLayout();
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
  syncReadingTranscriptHeaderControls();
}

function updateReaderChapterPresence(hasChapters) {
  const value = hasChapters ? "1" : "0";
  const readingView = byId(ids.readingView);
  readingView.dataset.hasChapters = value;
  document.documentElement.dataset.blrReaderHasChapters = value;
  document.body.dataset.blrReaderHasChapters = value;
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
    readerTimestampVisible: state.readingTimestampVisible
  };
  applyReadingViewPresentation();
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
