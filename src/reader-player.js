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
