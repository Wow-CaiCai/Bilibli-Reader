const readingTranscriptLanguageCache = new WeakMap();
function shouldForceNormalPageState(url = location.href) {
  return !isReaderMode(url) && !readerSessionState.open;
}

function enforceNormalPageStateIfNeeded(url = location.href) {
  if (!shouldForceNormalPageState(url)) {
    return;
  }
  clearReaderModePageState();
}

function bindNormalPageStateGuard() {
  if (uiState.normalPageStateGuardBound) {
    return;
  }
  uiState.normalPageStateGuardBound = true;

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
  uiState.normalPageStateObserver = observer;
  enforceNormalPageStateIfNeeded();
}

function bindRuntimeEvents() {
  if (uiState.runtimeEventsBound) {
    return;
  }
  uiState.runtimeEventsBound = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") {
      return false;
    }

    if (message.type === "popup-trigger-reading-view") {
      ensureUiReady();
      const readerUrl = String(message.readerUrl || "").trim();
      if (readerUrl) {
        replaceReaderModeUrl(readerUrl);
        document.documentElement.setAttribute("data-blr-reader-mode", "1");
        document.body.setAttribute("data-blr-reader-mode", "1");
      }
      if (!readerSessionState.open) {
        enterReaderMode().catch((error) => {
          logWarn("[BOC] reading mode trigger failed", error);
        });
      }
      sendResponse({ ok: true });
      return true;
    }

    return false;
  });
}

function bindSettingsWatcher() {
  if (uiState.settingsWatcherBound || !chrome.storage?.onChanged) {
    return;
  }
  uiState.settingsWatcherBound = true;

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" && areaName !== "local") {
      return;
    }
    if (
      !changes.readerTheme &&
      !changes.readerFontScale &&
      !changes.readerFontWeight &&
      !changes.readerLetterSpacing &&
      !changes.readerLineHeight &&
      !changes.readerContentWidth &&
      !changes.readerChapterWidthPx &&
      !changes.readerTranscriptWidthPx &&
      !changes.readerTranscriptVisible &&
      !changes.nativeTranscriptTheme &&
      !changes.nativeTranscriptFontSize &&
      !changes.nativeTranscriptFontWeight
    ) {
      return;
    }

    getSettings()
      .then(async (settings) => {
        const transition = readerSessionState.transition;
        if (transition) {
          // Storage echoes must not reflow the live target during its motion.
          await transition.finished.catch(() => {});
          settings = await getSettings();
        }
        const scrollAnchor = captureTranscriptScrollAnchor(
          document.getElementById("blr-reading-inline-host"), ".blr-reading-complete-segment"
        );
        const activeLayout = readerSessionState.open
          ? {
              chapterWidth: readerPreferences.chapterWidthPx,
              transcriptWidth: readerPreferences.transcriptWidthPx
            }
          : null;
        readerPreferences.settings = settings;
        hydrateReaderStateFromSettings(settings);
        hydrateNativeTranscriptSettings(settings);
        // The open reader owns its live drag state. Storage notifications can
        // arrive out of order when two resize handles are used in quick
        // succession, so they must not restore an older column or video size.
        if (activeLayout) {
          readerPreferences.chapterWidthPx = activeLayout.chapterWidth;
          readerPreferences.transcriptWidthPx = activeLayout.transcriptWidth;
          readerPreferences.settings = {
            ...readerPreferences.settings,
            readerChapterWidthPx: activeLayout.chapterWidth,
            readerTranscriptWidthPx: activeLayout.transcriptWidth
          };
        }
        applyReadingViewPresentation();
        scheduleReaderLayout();
        restoreTranscriptScrollAnchor(scrollAnchor);
      })
      .catch((error) => {
        logWarn("[BOC] failed to refresh settings after storage change", error);
      });
  });
}

function buildUiHtml() {
  return `
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
              <strong class="blr-reading-title">${escapeHtml(clipState.title || "B站字幕阅读")}</strong>
              <div id="${ids.readingMeta}" class="blr-reading-meta">bilibili.com</div>
            </div>
            <div class="blr-reading-actions">
              <button id="${ids.readingCloseBtn}" type="button" class="blr-reading-icon-btn" title="退出" aria-label="退出阅读视图">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </header>

          <p id="${ids.readingStatus}" class="blr-reading-status">使用页面原生播放器联动章节和字幕。</p>

          <section class="blr-reading-main">
            <div id="${ids.readingTranscriptList}" class="blr-reading-transcript"></div>
          </section>
        </section>
      </div>
      <div id="${ids.readingTranscriptResizeHandle}" class="blr-reading-resize-handle blr-reading-resize-handle-right" role="separator" aria-label="调整视频、章节和字幕宽度" aria-orientation="vertical" aria-valuemin="280" aria-valuemax="720"></div>
    </section>
  `;
}

function bindUiEvents() {
  const readingView = byId(ids.readingView);
  const readingCloseBtn = byId(ids.readingCloseBtn);
  const readingCollectionList = byId(ids.readingCollectionList);
  const chapterList = byId(ids.readingChapterList);
  const transcriptList = byId(ids.readingTranscriptList);

  readingCloseBtn.addEventListener("click", () => {
    exitReaderMode().catch((error) => {
      logWarn("[Bilibili Reader] reader exit failed", error);
    });
  });
  bindReaderResizeHandle(byId(ids.readingTranscriptResizeHandle));

  const handleReaderManualScroll = () => {
    if (Date.now() <= readerSessionState.programmaticScrollUntil) {
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
    if (!readerSessionState.open) {
      stopReadingViewSync();
    }
  });
}

function startUrlWatcher() {
  if (uiState.urlWatcherStarted) {
    return;
  }
  uiState.urlWatcherStarted = true;

  const checkCurrentClip = () => {
    let nextUrl = location.href;
    const nextSignature = computeCurrentClipSignature();
    if (nextSignature === clipState.currentClipSignature) {
      return;
    }

    // YouTube also navigates to home/search without replacing the document.
    if (isYouTubePage(nextUrl) && !extractYouTubeVideoId(nextUrl) && readerSessionState.open) {
      readerSessionState.transition?.cancel();
      replaceReaderModeUrl(stripReaderModeUrl(nextUrl));
      closeReadingView();
      nextUrl = location.href;
    }

    // Native episode navigation can drop the reader query. Keep an open
    // reader session active across clip changes before starting its new run.
    if (readerSessionState.open && !isReaderMode(nextUrl)) {
      const readerUrl = new URL(nextUrl);
      readerUrl.searchParams.set("bilibli_reader", "1");
      replaceReaderModeUrl(readerUrl.toString());
      nextUrl = location.href;
    }

    clipState.currentClipSignature = nextSignature;
    refreshReaderPageScopes();
    enforceNormalPageStateIfNeeded(nextUrl);
    ensureUiReady();
    resetClipState({ preserveReadingContent: readerSessionState.open && isReaderMode(nextUrl) });
    scheduleNativeTranscriptPanelSync(0);
    const shouldEnterReaderMode = isReaderMode(nextUrl);
    if (!readerSessionState.open && shouldEnterReaderMode) {
      document.documentElement.setAttribute("data-blr-reader-mode", "1");
      document.body.setAttribute("data-blr-reader-mode", "1");
      renderReadingStatus("检测到阅读视图跳转，正在打开阅读模式...");
      enterReaderMode().catch((error) => {
        renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
      });
      return;
    }
    if (readerSessionState.open || shouldEnterReaderMode) {
      renderReadingStatus("检测到视频变化，正在自动刷新字幕...");
      const changeRunId = clipState.fetchRunId;
      const sessionId = readerSessionState.id;
      waitForVideoMetadata().then(() => {
        if (!isReaderSessionActive(sessionId) || changeRunId !== clipState.fetchRunId || computeCurrentClipSignature() !== nextSignature) {
          return;
        }
        refreshClip().catch((error) => {
          if (!isStaleRunError(error)) {
            renderReadingStatus(`自动刷新失败：${getErrorMessage(error)}`);
          }
        });
      });
      return;
    }

    ensureNativeTranscriptLoaded({ force: true });
  };
  window.addEventListener("popstate", checkCurrentClip);
  window.addEventListener("yt-navigate-finish", () => {
    checkCurrentClip();
    scheduleNativeTranscriptPanelSync(0);
    if (readerSessionState.open) {
      queueEnsureReaderPlayerMounted();
      applyReaderPageFocus();
    }
  });
  window.setInterval(checkCurrentClip, 250);
}

function resetClipState({ preserveReadingContent = false } = {}) {
  // 切换时立即使旧请求失效，不能等新请求开始后才递增编号。
  clipState.fetchRunId += 1;
  if (readerSessionState.open) invalidateReaderSession();
  clipState.fetchClipSignature = "";
  clipState.bvid = "";
  clipState.aid = "";
  clipState.cid = "";
  clipState.cidSource = "";
  clipState.videoDuration = 0;
  if (!preserveReadingContent) {
    clipState.pageIndex = 1;
    clipState.pageCount = 0;
    clipState.pageTitle = "";
    clipState.collection = null;
    clipState.title = "";
    clipState.author = "";
    clipState.uploadDate = "";
  }
  // 保留阅读视图布局和合集信息时，也必须清空上一集的字幕与章节。
  clearSubtitleContent({ clearTracks: true, clearChapters: true, fetchState: "loading" });
  clipState.currentClipSignature = computeCurrentClipSignature();
  stopReadingViewSync();
  nativeTranscriptState.loadedSignature = "";
  nativeTranscriptState.loadPromise = null;
  nativeTranscriptState.loadSignature = "";
  nativeTranscriptState.open = true;
  nativeTranscriptState.manualScrollPauseUntil = 0;
  readerPlayerState.videoEl = null;
  stopReaderPlayerObserver();

  renderNativeTranscriptPanel();
  if (readerSessionState.open) {
    renderReadingView();
    renderReadingStatus("正在切换选集并加载新字幕...");
  }
}

function clearSubtitleContent({
  clearTracks = false,
  clearChapters = false,
  fetchState = clipState.subtitleFetchState
} = {}) {
  if (clearTracks) clipState.subtitles = [];
  if (clearChapters) clipState.chapters = [];
  clipState.selectedSubtitleId = "";
  clipState.selectedSubtitleUrl = "";
  clipState.selectedSubtitleLang = "";
  clipState.subtitleBody = [];
  clipState.subtitleRevision += 1;
  clipState.subtitleFetchState = fetchState;
  readerSessionState.activeSubtitleIndex = -1;
  readerSessionState.activeChapterIndex = -1;
  nativeTranscriptState.activeIndex = -1;
}

async function finishNoSubtitleLoad(request) {
  ensureSubtitleRequestActive(request);
  applyNoSubtitleState();

  await refreshOpenReadingView("当前视频无可用字幕。", request.runId, request);
  ensureSubtitleRequestActive(request);
}

let clipRefreshTask = null;

function refreshClip() {
  const signature = computeCurrentClipSignature();
  if (clipRefreshTask?.signature === signature &&
      clipRefreshTask.runId === clipState.fetchRunId &&
      clipRefreshTask.requestId === subtitleRequestId) {
    return clipRefreshTask.promise;
  }
  const promise = refreshClipData();
  const task = { signature, runId: clipState.fetchRunId, requestId: subtitleRequestId, promise };
  clipRefreshTask = task;
  const release = () => {
    if (clipRefreshTask === task) clipRefreshTask = null;
  };
  promise.then(release, release);
  return promise;
}

async function refreshClipData() {
  const clipUrl = location.href;
  const clipSignature = computeCurrentClipSignature(clipUrl);
  if (clipState.currentClipSignature !== clipSignature) {
    resetClipState({ preserveReadingContent: readerSessionState.open && isReaderMode(clipUrl) });
  }
  const runId = ++clipState.fetchRunId;
  clipState.fetchClipSignature = clipSignature;
  const request = beginSubtitleRequest(runId);
  try {
    clipState.subtitleFetchState = "loading";
    renderNativeTranscriptPanel();
    if (readerSessionState.open) {
      renderReadingView();
    }
    const settings = await getSettings();
    ensureSubtitleRequestActive(request);
    readerPreferences.settings = settings;

    if (isYouTubePage(clipUrl)) {
      await refreshYouTubeClipData(extractYouTubeVideoId(clipUrl), request);
      ensureSubtitleRequestActive(request);
      await refreshOpenReadingView("抓取完成，阅读视图已同步最新字幕。", runId, request);
      return;
    }

    const bvid = extractBvid(clipUrl);
    clipState.bvid = bvid;
    if (!clipState.bvid) {
      throw new Error("当前页面不是标准 BV 视频地址，无法抓取字幕。");
    }

    const pageIndex = extractPageIndex(clipUrl);
    const oid = extractOid(clipUrl);
    const hasPageParam = hasExplicitPageParam(clipUrl);
    const meta = await retryAsync(() => {
      ensureSubtitleRequestActive(request);
      return fetchVideoMeta(bvid);
    }, 2, 250);
    ensureSubtitleRequestActive(request);

    // 调试：打印 API 返回的原始数据
    logInfo("[BOC] raw meta data", {
      meta,
      defaultCid: meta.defaultCid,
      pagesCount: (meta.pages || []).length
    });

    clipState.aid = meta.aid || "";
    clipState.title = meta.title || readVideoTitle();
    clipState.author = meta.author || readVideoAuthor();
    clipState.uploadDate = meta.uploadDate || readUploadDate();
    clipState.pageCount = Array.isArray(meta.pages) ? meta.pages.length : 0;
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
    clipState.pageIndex = resolvedPageIndex;
    clipState.pageTitle = currentPage?.part || "";
    clipState.collection = resolveVideoCollectionCurrent(meta.collection, {
      bvid: clipState.bvid,
      aid: clipState.aid,
      pageIndex: resolvedPageIndex
    });
    clipState.cid = currentPage?.cid || pickCidFromPages(meta.pages, resolvedPageIndex, meta.defaultCid);
    clipState.cidSource = "meta-pages";
    clipState.videoDuration = pickDurationFromPages(meta.pages, resolvedPageIndex, meta.defaultDuration);
    if (!(clipState.videoDuration > 0)) {
      clipState.videoDuration = readRuntimeVideoDuration();
    }
    if (!(clipState.videoDuration > 0)) {
      throw new Error("无法获取当前视频时长，已停止抓取以避免串到错误字幕。");
    }

    logInfo("[BOC] resolved video ids", {
      url: location.href,
      aid: clipState.aid,
      bvid: clipState.bvid,
      cid: clipState.cid,
      cidSource: clipState.cidSource,
      pageIndex: resolvedPageIndex,
      videoDuration: clipState.videoDuration
    });

    const cid = clipState.cid;
    const aid = clipState.aid;
    const fetchCurrentSubtitleBundle = () => {
      ensureSubtitleRequestActive(request);
      return fetchSubtitleBundle(bvid, cid, aid, meta.subtitleTracks || []);
    };
    let subtitleBundle = await retryAsync(
      fetchCurrentSubtitleBundle,
      3,
      500
    );
    ensureSubtitleRequestActive(request);
    clipState.subtitles = normalizeSubtitleTracks(subtitleBundle.tracks);
    clipState.chapters = normalizeChapters(subtitleBundle.chapters);
    logInfo(
      "[BOC] chapters",
      clipState.chapters.map((item) => ({
        from: item.from,
        to: item.to,
        title: item.title
      }))
    );
    logInfo(
      "[BOC] subtitle tracks",
      clipState.subtitles.map((item) => ({
        id: item.id,
        lan: item.lan,
        lanDoc: item.lanDoc,
        url: item.subtitleUrl
      }))
    );

    // 无字幕时也允许进入阅读视图，只是字幕区域保持空态。
    if (clipState.subtitles.length === 0) {
      await finishNoSubtitleLoad(request);
      return;
    }

    // 显式点击“刷新抓取”时默认走网络，避免命中历史缓存导致字幕错位。
    const forceRefresh = true;

    const preferred = pickPreferredSubtitle(clipState.subtitles, {
      previousId: clipState.selectedSubtitleId,
      previousUrl: clipState.selectedSubtitleUrl,
      previousLang: clipState.selectedSubtitleLang
    });

    if (!preferred) {
      await finishNoSubtitleLoad(request);
      return;
    }

    const candidates = buildSubtitleCandidates(clipState.subtitles, preferred);
    let selected = null;

    try {
      selected = await tryLoadSubtitleCandidates(candidates, runId, forceRefresh, request);
    } catch (error) {
      ensureSubtitleRequestActive(request);

      // 正文失败时先重新核对列表，空列表应收起面板，不能沿用旧错误。
      // 非空列表再用新的签名地址重试，网络故障仍保留为加载错误。
      subtitleBundle = await retryAsync(
        fetchCurrentSubtitleBundle,
        2,
        500
      );
      ensureSubtitleRequestActive(request);
      clipState.subtitles = normalizeSubtitleTracks(subtitleBundle.tracks);
      clipState.chapters = normalizeChapters(subtitleBundle.chapters);
      const retryPreferred = pickPreferredSubtitle(clipState.subtitles, {
        previousId: preferred.id,
        previousUrl: preferred.subtitleUrl,
        previousLang: preferred.lanDoc || preferred.lan || ""
      });
      if (!retryPreferred) {
        await finishNoSubtitleLoad(request);
        return;
      }
      const retryCandidates = buildSubtitleCandidates(clipState.subtitles, retryPreferred);
      selected = await tryLoadSubtitleCandidates(retryCandidates, runId, forceRefresh, request);
    }
    ensureSubtitleRequestActive(request);
    if (selected) {
      logInfo("[BOC] selected subtitle track", {
        id: selected.id,
        lan: selected.lan,
        lanDoc: selected.lanDoc
      });
    }
    clipState.subtitleFetchState = "ready";

    await refreshOpenReadingView("抓取完成，阅读视图已同步最新字幕。", runId, request);
    ensureSubtitleRequestActive(request);
  } catch (error) {
    if (isStaleRunError(error) || !isSubtitleRequestActive(request)) {
      return;
    }
    if (isUnavailableSubtitleError(error)) {
      await finishNoSubtitleLoad(request);
      return;
    }
    // 字幕正文与章节列表来自不同请求。字幕域名被拦截、网络失败或签名
    // 过期时，保留已经成功取得的章节和当前视频元数据。
    clearSubtitleContent({ fetchState: "error" });
    await refreshOpenReadingView("字幕加载失败，请刷新重试。", runId, request);
    if (!isSubtitleRequestActive(request)) {
      return;
    }
  } finally {
    if (isSubtitleRequestActive(request)) {
      renderNativeTranscriptPanel();
    }
  }
}

let subtitleRequestId = 0;

function beginSubtitleRequest(runId = clipState.fetchRunId) {
  ensureRunActive(runId);
  return { runId, id: ++subtitleRequestId };
}

function isSubtitleRequestActive(request) {
  return Boolean(request) && request.id === subtitleRequestId && isRunActive(request.runId);
}

function ensureSubtitleRequestActive(request) {
  if (!isSubtitleRequestActive(request)) {
    const error = new Error("Stale subtitle request");
    error.code = "STALE_RUN";
    throw error;
  }
}

function commitSubtitle({ url, lang, subtitleId, body }, request) {
  ensureSubtitleRequestActive(request);
  clipState.selectedSubtitleId = subtitleId ? String(subtitleId) : "";
  clipState.selectedSubtitleUrl = url;
  clipState.selectedSubtitleLang = lang;
  clipState.subtitleBody = body;
  clipState.subtitleRevision += 1;
  clipState.subtitleFetchState = "ready";
  if (readerSessionState.open) {
    renderReadingView();
    syncReadingViewPlayback(true);
  }
  renderNativeTranscriptPanel();
}

async function selectSubtitle(url, lang, subtitleId = "") {
  if (!isRunActive(clipState.fetchRunId)) return;
  const request = beginSubtitleRequest();
  const previousFetchState = clipState.subtitleFetchState;
  clipState.subtitleFetchState = "loading";
  syncReadingTranscriptHeaderControls();
  const nativePanel = document.getElementById(ids.nativeTranscriptPanel);
  if (nativePanel) renderNativeTranscriptHeaderControls(nativePanel);
  try {
    await loadSubtitle(url, lang, request.runId, subtitleId, false, request);
    ensureSubtitleRequestActive(request);
  } catch (error) {
    if (isStaleRunError(error) || !isSubtitleRequestActive(request)) return;
    // A failed language switch keeps the last successful transcript usable.
    clipState.subtitleFetchState = clipState.subtitleBody.length ? "ready" :
      previousFetchState === "empty" ? "empty" : "error";
    logWarn("[Bilibili Reader] subtitle switch failed", error);
    if (readerSessionState.open) renderReadingStatus(`切换字幕失败：${getErrorMessage(error)}`);
  } finally {
    if (isSubtitleRequestActive(request)) {
      syncReadingTranscriptHeaderControls();
      renderNativeTranscriptPanel();
    }
  }
}

async function loadSubtitle(
  url, lang, runId = clipState.fetchRunId, subtitleId = "", forceRefresh = false,
  request = beginSubtitleRequest(runId)
) {
  ensureSubtitleRequestActive(request);
  if (!url) throw new Error("字幕 URL 为空。");
  const cacheKey = getSubtitleCacheKey({
    bvid: clipState.bvid, cid: clipState.cid, subtitleId, subtitleUrl: url, lang
  });

  if (!forceRefresh) {
    const cachedBody = await loadSubtitleFromCache(cacheKey);
    ensureSubtitleRequestActive(request);
    if (Array.isArray(cachedBody) && cachedBody.length > 0) {
      const cachedCheck = validateSubtitleByDuration(cachedBody, clipState.videoDuration);
      if (cachedCheck.ok) {
        logInfo("[Bilibili Reader] using cached subtitle", { cacheKey, itemCount: cachedBody.length });
        commitSubtitle({ url, lang, subtitleId, body: cachedBody }, request);
        return;
      }
      logWarn("[Bilibili Reader] cached subtitle duration mismatch", { cacheKey, reason: cachedCheck.reason });
      await clearSubtitleCacheByKey(cacheKey);
      ensureSubtitleRequestActive(request);
    }
  }

  const subtitle = await fetchSubtitleBody(url);
  ensureSubtitleRequestActive(request);
  const body = Array.isArray(subtitle?.body)
    ? subtitle.body.filter((item) => String(item?.content || "").trim()) : [];
  if (body.length === 0) {
    const error = new Error("字幕文件为空。");
    error.code = "SUBTITLE_EMPTY";
    throw error;
  }
  const durationCheck = validateSubtitleByDuration(body, clipState.videoDuration);
  if (!durationCheck.ok) {
    const error = new Error("字幕时长与当前视频不匹配。");
    error.code = "SUBTITLE_DURATION_MISMATCH";
    error.details = durationCheck;
    throw error;
  }
  await saveSubtitleToCache(cacheKey, body);
  ensureSubtitleRequestActive(request);
  commitSubtitle({ url, lang, subtitleId, body }, request);
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
    if (parsed.pathname === "/api/timedtext" && isYouTubePage(parsed.origin)) {
      // YouTube languages share a path; keep their stable identity while
      // excluding expiring signatures and proof-of-origin tokens.
      return `${parsed.hostname}${parsed.pathname}?${new URLSearchParams(
        ["v", "lang", "kind", "name", "tlang"].map((key) => [key, parsed.searchParams.get(key) || ""])
      )}`;
    }
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

function buildReadingTranscriptHeadingHtml() {
  return `
    <span class="blr-reading-transcript-heading-title">字幕</span>
    <div class="blr-reading-transcript-heading-controls">
      <button id="${ids.readingTranscriptReaderButton}" class="blr-reading-transcript-tool-button is-active" type="button" title="返回普通模式" aria-label="切换到普通模式" aria-pressed="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5.5C9 3.5 5.5 3.5 2.5 4.5v15c3-1 6.5-1 9.5 1 3-2 6.5-2 9.5-1v-15c-3-1-6.5-1-9.5 1Z"/><path d="M12 5.5v15M5.5 8h3M5.5 11.5h3M15.5 8h3M15.5 11.5h3"/></svg>
      </button>
      <button id="${ids.readingTranscriptReturnButton}" class="blr-reading-transcript-tool-button" type="button" title="回到当前字幕" aria-label="回到当前字幕">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
      </button>
      <button id="${ids.readingTranscriptThemeButton}" class="blr-reading-transcript-tool-button" type="button" title="切换字幕主题" aria-label="切换字幕主题">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      </button>
      <select id="${ids.readingTranscriptQuickSubtitleSelect}" aria-label="字幕语言" title="字幕语言" disabled><option value="">字幕</option></select>
      <select id="${ids.readingTranscriptQuickFontSizeSelect}" aria-label="字幕字号" title="字幕字号">
        <option value="xs">12</option><option value="s">13</option><option value="m">14</option><option value="l">16</option><option value="xl">19</option>
      </select>
      <select id="${ids.readingTranscriptQuickFontWeightSelect}" aria-label="字幕字重" title="字幕字重">
        <option value="light">300</option><option value="regular">400</option><option value="normal">500</option><option value="semibold">600</option><option value="bold">700</option>
      </select>
    </div>
  `;
}

function syncReadingTranscriptHeaderControls() {
  const heading = document.getElementById("blr-reading-transcript-heading");
  if (!heading) {
    return;
  }
  const themeButton = heading.querySelector(`#${ids.readingTranscriptThemeButton}`);
  if (themeButton) {
    const labels = { light: "浅色", dark: "深色", paper: "纸张" };
    const label = `切换字幕主题，当前：${labels[readerPreferences.theme] || "浅色"}`;
    themeButton.title = label;
    themeButton.setAttribute("aria-label", label);
  }
  const fontSizeSelect = heading.querySelector(`#${ids.readingTranscriptQuickFontSizeSelect}`);
  const fontWeightSelect = heading.querySelector(`#${ids.readingTranscriptQuickFontWeightSelect}`);
  if (fontSizeSelect) {
    fontSizeSelect.value = readerPreferences.fontScale;
  }
  if (fontWeightSelect) {
    fontWeightSelect.value = readerPreferences.fontWeight;
  }
  const languageSelect = heading.querySelector(`#${ids.readingTranscriptQuickSubtitleSelect}`);
  if (!languageSelect) {
    return;
  }
  const selectedUrlKey = normalizeSubtitleUrlForCache(clipState.selectedSubtitleUrl);
  const previous = readingTranscriptLanguageCache.get(languageSelect);
  if (!previous || previous.tracks !== clipState.subtitles ||
      previous.selectedId !== clipState.selectedSubtitleId || previous.selectedUrl !== selectedUrlKey) {
    languageSelect.innerHTML = readerHtml(clipState.subtitles.length
      ? clipState.subtitles
          .map((item) => {
            const selected =
              (clipState.selectedSubtitleId && String(item.id) === String(clipState.selectedSubtitleId)) ||
              normalizeSubtitleUrlForCache(item.subtitleUrl) === selectedUrlKey;
            return `<option value="${escapeHtml(item.subtitleUrl)}" data-id="${escapeHtml(
              item.id
            )}" data-lang="${escapeHtml(item.lanDoc || item.lan || "unknown")}"${
              selected ? " selected" : ""
            }>${escapeHtml(item.lanDoc || item.lan || "字幕")}</option>`;
          })
          .join("")
      : '<option value="">字幕</option>');
    readingTranscriptLanguageCache.set(languageSelect, {
      tracks: clipState.subtitles, selectedId: clipState.selectedSubtitleId, selectedUrl: selectedUrlKey
    });
  }
  languageSelect.disabled = clipState.subtitles.length === 0 || clipState.subtitleFetchState === "loading";
  syncSubtitleSelection(languageSelect);
}

function returnReadingTranscriptToCurrent() {
  readerSessionState.manualScrollPauseUntil = 0;
  const video = getRuntimeVideoElement();
  const transcriptList = document.getElementById(ids.readingTranscriptList);
  if (!video || !transcriptList) {
    return;
  }
  const subtitleIndex = findActiveSubtitleIndex(Number(video.currentTime || 0) || 0);
  const target = transcriptList.querySelector(`[data-index="${subtitleIndex}"]`);
  if (target) {
    readerSessionState.nextScrollBehavior = "smooth";
    scrollReadingTranscriptItemIntoView(target);
  }
  syncReadingViewPlayback(false);
  updateReaderFollowState();
}

function bindReadingTranscriptHeaderControls(heading) {
  if (!heading || heading.dataset.blrControlsBound === "1") {
    return;
  }
  heading.querySelector(`#${ids.readingTranscriptReaderButton}`)?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    if (readerSessionState.closing) return;
    button.disabled = true;
    exitReaderMode().catch((error) => {
      logWarn("[Bilibili Reader] transcript mode switch failed", error);
    }).finally(() => {
      if (button.isConnected) button.disabled = false;
    });
  });
  heading.querySelector(`#${ids.readingTranscriptReturnButton}`)?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    returnReadingTranscriptToCurrent();
    button.classList.add("is-active");
    window.setTimeout(() => button.classList.remove("is-active"), 300);
  });
  heading.querySelector(`#${ids.readingTranscriptThemeButton}`)?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const themes = ["light", "dark", "paper"];
    const nextIndex = (themes.indexOf(readerPreferences.theme) + 1) % themes.length;
    updateReaderPreferences({ readerTheme: themes[nextIndex] }, { persist: true });
    button.classList.add("is-active");
    window.setTimeout(() => button.classList.remove("is-active"), 300);
  });
  heading
    .querySelector(`#${ids.readingTranscriptQuickFontSizeSelect}`)
    ?.addEventListener("change", (event) => {
      updateReaderPreferences({ readerFontScale: event.target.value }, { persist: true });
    });
  heading
    .querySelector(`#${ids.readingTranscriptQuickFontWeightSelect}`)
    ?.addEventListener("change", (event) => {
      updateReaderPreferences({ readerFontWeight: event.target.value }, { persist: true });
    });
  heading
    .querySelector(`#${ids.readingTranscriptQuickSubtitleSelect}`)
    ?.addEventListener("change", (event) => {
      const select = event.target;
      const option = select.options[select.selectedIndex];
      const url = String(option?.value || "");
      if (!url) {
        return;
      }
      selectSubtitle(
        url,
        String(option.dataset.lang || "unknown"),
        String(option.dataset.id || "")
      );
    });
  heading.dataset.blrControlsBound = "1";
}

function applyNoSubtitleState() {
  clearSubtitleContent({ clearTracks: true, fetchState: "empty" });
}
