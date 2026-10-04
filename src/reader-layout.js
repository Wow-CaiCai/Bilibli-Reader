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
  const hasChapterRail = isDesktop && readerPreferences.chapterVisible &&
    getCachedReadingChapters().length > 0;
  // Only visible chapters reserve space below the video.
  const bottomSpace = hasChapterRail ? 148 : 0;
  let playerBottomLimit = window.innerHeight - bottomSpace;
  if (isDesktop && readerPreferences.transcriptVisible) {
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

function layoutReaderPlayerHost() {
  if (!readerSessionState.open || !isReaderMode()) {
    return;
  }

  if (readerSessionState.transition?.phase === "animating") {
    readerSessionState.layoutDirty = true;
    return;
  }
  readerSessionState.layoutDirty = false;
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
