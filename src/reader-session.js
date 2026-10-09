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
