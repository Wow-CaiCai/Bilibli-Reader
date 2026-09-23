
function shouldForceNormalPageState(url = location.href) {
  return !isReaderMode(url) && !state.readingViewOpen;
}

function enforceNormalPageStateIfNeeded(url = location.href) {
  if (!shouldForceNormalPageState(url)) {
    return;
  }
  clearReaderModePageState();
}

function bindNormalPageStateGuard() {
  if (state.normalPageStateGuardBound) {
    return;
  }
  state.normalPageStateGuardBound = true;

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
  state.normalPageStateObserver = observer;
  enforceNormalPageStateIfNeeded();
}

function bindRuntimeEvents() {
  if (state.runtimeEventsBound) {
    return;
  }
  state.runtimeEventsBound = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") {
      return false;
    }

    if (message.type === "popup-get-state") {
      sendResponse({ ok: true, payload: getPopupPayload() });
      return false;
    }

    if (message.type === "popup-refresh") {
      refreshClip()
        .then(() => sendResponse({ ok: true, payload: getPopupPayload() }))
        .catch((error) =>
          sendResponse({ ok: false, error: getErrorMessage(error), payload: getPopupPayload() })
        );
      return true;
    }

    if (message.type === "popup-select-subtitle") {
      const url = String(message.url || "").trim();
      const lang = String(message.lang || "unknown");
      const subtitleId = String(message.subtitleId || "");
      if (!url) {
        sendResponse({ ok: false, error: "Missing subtitle URL", payload: getPopupPayload() });
        return false;
      }
      loadSubtitle(url, lang, state.fetchRunId, subtitleId)
        .then(() => {
          setStatus("字幕切换完成。");
          renderSubtitleSelect();
          sendResponse({ ok: true, payload: getPopupPayload() });
        })
        .catch((error) =>
          sendResponse({ ok: false, error: getErrorMessage(error), payload: getPopupPayload() })
        );
      return true;
    }

    if (message.type === "popup-send-obsidian") {
      sendToObsidian()
        .then(() => sendResponse({ ok: true, payload: getPopupPayload() }))
        .catch((error) =>
          sendResponse({ ok: false, error: getErrorMessage(error), payload: getPopupPayload() })
        );
      return true;
    }

    if (message.type === "popup-trigger-reading-view") {
      state.playerAiQuickActionSuppressedUntil = Date.now() + 2500;
      removePlayerAiQuickActionButton();
      ensureUiReady();
      const readerUrl = String(message.readerUrl || "").trim();
      if (readerUrl) {
        replaceReaderModeUrl(readerUrl);
        document.documentElement.setAttribute("data-blr-reader-mode", "1");
        document.body.setAttribute("data-blr-reader-mode", "1");
      }
      if (!state.readingViewOpen) {
        enterReaderMode().catch((error) => {
          logWarn("[BOC] reading mode trigger failed", error);
        });
      }
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === "sidepanel-get-context") {
      const settings = state.settings || DEFAULT_SETTINGS;
      const body = state.subtitleBody || [];
      let subtitleMarkdown = "";
      try {
        subtitleMarkdown = body.length
          ? buildMarkdown(state, body, { ...settings, includeHotCommentsInNote: false })
          : "";
      } catch (e) {
        subtitleMarkdown = "";
        logWarn("[BOC] sidepanel-get-context: buildMarkdown failed", e);
      }
      sendResponse({
        ok: true,
        payload: {
          url: location.href,
          title: state.title || "",
          author: state.author || "",
          uploadDate: state.uploadDate || "",
          bvid: state.bvid || "",
          cid: state.cid || "",
          aid: state.aid || "",
          pageIndex: Number(state.pageIndex) > 0 ? Number(state.pageIndex) : 1,
          pageCount: Number(state.pageCount) > 0 ? Number(state.pageCount) : 0,
          pageTitle: state.pageTitle || "",
          subtitleBody: body,
          subtitleMarkdown,
          subtitleLang: state.selectedSubtitleLang || "",
          selectedSubtitleId: state.selectedSubtitleId || "",
          selectedSubtitleUrl: state.selectedSubtitleUrl || "",
          subtitleOptions: state.subtitles || [],
          hotComments: []
        }
      });
      return false;
    }

    if (message.type === "sidepanel-get-hot-comments") {
      const count = 20; // 固定取前 20 条热门评论
      if (!count) {
        sendResponse({ ok: true, comments: [] });
        return false;
      }

      if (!getCurrentAid()) {
        state.hotComments = [];
        sendResponse({ ok: true, comments: [], note: "无法获取视频 aid" });
        return false;
      }

      fetchHotComments(count)
        .then((hotComments) => {
          state.hotComments = hotComments;
          sendResponse({ ok: true, comments: hotComments });
        })
        .catch((error) => {
          state.hotComments = [];
          sendResponse({ ok: true, comments: [], note: String(error?.message || error) });
        });
      return true;
    }

    if (message.type === "sidepanel-seek-video-time") {
      const seconds = Number(message.seconds);
      const video = getRuntimeVideoElement();
      if (!video) {
        sendResponse({ ok: false, error: "当前页面没有找到可联动的视频播放器。" });
        return false;
      }
      const nextTime = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
      const wasPaused = Boolean(video.paused);
      video.currentTime = nextTime;
      if (!wasPaused) {
        video.play().catch(() => {});
      }
      if (state.readingViewOpen) {
        state.readingManualScrollPauseUntil = 0;
        state.readingNextScrollBehavior = "auto";
        updateReaderFollowState();
        syncReadingViewPlayback(true);
      }
      sendResponse({ ok: true, currentTime: nextTime });
      return false;
    }

    return false;
  });
}

function bindSettingsWatcher() {
  if (state.settingsWatcherBound || !chrome.storage?.onChanged) {
    return;
  }
  state.settingsWatcherBound = true;

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" && areaName !== "local") {
      return;
    }
    if (
      !changes.enablePlayerAiQuickAction &&
      !changes.playerAiQuickPrompt &&
      !changes.readerTheme &&
      !changes.readerFontScale &&
      !changes.readerFontWeight &&
      !changes.readerLetterSpacing &&
      !changes.readerLineHeight &&
      !changes.readerContentWidth &&
      !changes.readerChapterWidthPx &&
      !changes.readerTranscriptWidthPx &&
      !changes.readerVideoHeightPx &&
      !changes.readerChapterVisibility &&
      !changes.readerTranscriptVisible &&
      !changes.readerTimestampVisible &&
      !changes.nativeTranscriptTheme &&
      !changes.nativeTranscriptFontSize &&
      !changes.nativeTranscriptFontWeight
    ) {
      return;
    }

    getSettings()
      .then((settings) => {
        const activeLayout = state.readingViewOpen
          ? {
              chapterWidth: state.readingChapterWidthPx,
              transcriptWidth: state.readingTranscriptWidthPx,
              videoHeight: state.readingVideoHeightPx
            }
          : null;
        state.settings = settings;
        hydrateReaderStateFromSettings(settings);
        hydrateNativeTranscriptSettings(settings);
        // The open reader owns its live drag state. Storage notifications can
        // arrive out of order when two resize handles are used in quick
        // succession, so they must not restore an older column or video size.
        if (activeLayout) {
          state.readingChapterWidthPx = activeLayout.chapterWidth;
          state.readingTranscriptWidthPx = activeLayout.transcriptWidth;
          state.readingVideoHeightPx = activeLayout.videoHeight;
          state.settings = {
            ...state.settings,
            readerChapterWidthPx: activeLayout.chapterWidth,
            readerTranscriptWidthPx: activeLayout.transcriptWidth,
            readerVideoHeightPx: activeLayout.videoHeight
          };
        }
        applyReadingViewPresentation();
        schedulePlayerAiQuickActionSync();
      })
      .catch((error) => {
        logWarn("[BOC] failed to refresh settings after storage change", error);
      });
  });
}

function buildUiHtml() {
  return `
    <aside id="${ids.panel}" aria-hidden="true">
      <header class="blr-header">
        <strong>Default</strong>
        <div class="blr-header-actions">
          <button id="${ids.settingsBtn}" type="button" title="插件设置">设置</button>
          <button id="${ids.closeBtn}" type="button" title="关闭">关闭</button>
        </div>
      </header>

      <p id="${ids.status}" class="blr-status">准备就绪，点击“刷新抓取”开始。</p>
      <div class="blr-props-head">属性</div>
      <div id="${ids.meta}" class="blr-meta"></div>

      <label class="blr-label" for="${ids.subtitleSelect}">字幕语言</label>
      <select id="${ids.subtitleSelect}" disabled>
        <option value="">暂无字幕</option>
      </select>

      <label class="blr-label" for="${ids.preview}">字幕预览</label>
      <textarea id="${ids.preview}" readonly></textarea>

      <div class="blr-actions">
        <button id="${ids.refreshBtn}" type="button">刷新抓取</button>
        <button id="${ids.copyBtn}" type="button">复制完整 Markdown</button>
        <button id="${ids.downloadBtn}" type="button">下载字幕</button>
        <button id="${ids.sendBtn}" type="button">发送到 Obsidian</button>
      </div>
      <p id="${ids.message}" class="blr-message"></p>
    </aside>

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
              <strong class="blr-reading-title">${escapeHtml(state.title || "B站字幕阅读")}</strong>
              <div id="${ids.readingMeta}" class="blr-reading-meta">bilibili.com</div>
            </div>
            <div class="blr-reading-actions">
              <button id="${ids.readingCloseBtn}" type="button" class="blr-reading-icon-btn" title="退出" aria-label="退出阅读视图">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </header>

          <p id="${ids.readingStatus}" class="blr-reading-status">使用页面原生播放器联动章节和字幕。</p>

          <div class="blr-reading-player-shell">
            <div id="${ids.readingPlayerSlot}" class="blr-reading-player-slot"></div>
          </div>

          <section class="blr-reading-main">
            <div id="${ids.readingTranscriptList}" class="blr-reading-transcript"></div>
          </section>
        </section>
      </div>
      <div id="${ids.readingChapterResizeHandle}" class="blr-reading-resize-handle blr-reading-resize-handle-left" role="separator" aria-label="上下拖动调整视频高度" aria-orientation="horizontal" aria-valuemin="240" aria-valuemax="900"></div>
      <div id="${ids.readingTranscriptResizeHandle}" class="blr-reading-resize-handle blr-reading-resize-handle-right" role="separator" aria-label="调整视频和字幕宽度" aria-orientation="vertical" aria-valuemin="280" aria-valuemax="720"></div>
    </section>
  `;
}

function bindUiEvents() {
  const panel = byId(ids.panel);
  const closeBtn = byId(ids.closeBtn);
  const refreshBtn = byId(ids.refreshBtn);
  const select = byId(ids.subtitleSelect);
  const copyBtn = byId(ids.copyBtn);
  const downloadBtn = byId(ids.downloadBtn);
  const sendBtn = byId(ids.sendBtn);
  const settingsBtn = byId(ids.settingsBtn);
  const readingView = byId(ids.readingView);
  const readingCloseBtn = byId(ids.readingCloseBtn);
  const readingCollectionList = byId(ids.readingCollectionList);
  const chapterList = byId(ids.readingChapterList);
  const transcriptList = byId(ids.readingTranscriptList);

  closeBtn.addEventListener("click", () => panel.classList.remove("open"));
  refreshBtn.addEventListener("click", refreshClip);
  select.addEventListener("change", onSubtitleChange);
  copyBtn.addEventListener("click", copyMarkdown);
  downloadBtn.addEventListener("click", downloadSubtitle);
  sendBtn.addEventListener("click", sendToObsidian);
  settingsBtn.addEventListener("click", requestOpenOptions);
  readingCloseBtn.addEventListener("click", () => {
    if (isReaderMode()) {
      replaceReaderModeUrl(stripReaderModeUrl(location.href));
    }
    closeReadingView();
  });
  bindReaderResizeHandle(byId(ids.readingChapterResizeHandle), "chapter");
  bindReaderResizeHandle(byId(ids.readingTranscriptResizeHandle), "transcript");

  const handleReaderManualScroll = () => {
    if (Date.now() <= state.readingProgrammaticScrollUntil) {
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
    if (!state.readingViewOpen) {
      stopReadingViewSync();
    }
  });
}

function startUrlWatcher() {
  if (state.urlWatcherStarted) {
    return;
  }
  state.urlWatcherStarted = true;

  window.setInterval(() => {
    const nextUrl = location.href;
    const nextSignature = computeCurrentClipSignature();
    if (nextSignature === state.currentClipSignature) {
      return;
    }

    state.currentUrl = nextUrl;
    state.currentClipSignature = nextSignature;
    enforceNormalPageStateIfNeeded(nextUrl);
    ensureUiReady();
    resetClipState({ preserveReadingContent: state.readingViewOpen && isReaderMode(nextUrl) });
    scheduleNativeTranscriptPanelSync(0);
    const shouldEnterReaderMode = isReaderMode(nextUrl);
    if (!state.readingViewOpen && shouldEnterReaderMode) {
      document.documentElement.setAttribute("data-blr-reader-mode", "1");
      document.body.setAttribute("data-blr-reader-mode", "1");
      renderReadingStatus("检测到阅读视图跳转，正在打开阅读模式...");
      enterReaderMode().catch((error) => {
        renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
      });
      return;
    }
    if (state.readingViewOpen || shouldEnterReaderMode) {
      renderReadingStatus("检测到视频变化，正在自动刷新字幕...");
      waitForVideoMetadata().then(() => {
        refreshClip().catch((error) => {
          if (!isStaleRunError(error)) {
            renderReadingStatus(`自动刷新失败：${getErrorMessage(error)}`);
          }
        });
      });
      return;
    }
    setStatus("检测到页面变化，正在自动加载当前视频字幕...");
    ensureNativeTranscriptLoaded({ force: true });
  }, 1200);
}

function resetClipState({ preserveReadingContent = false } = {}) {
  state.bvid = "";
  state.aid = "";
  state.cid = "";
  state.cidSource = "";
  state.videoDuration = 0;
  if (!preserveReadingContent) {
    state.pageIndex = 1;
    state.pageCount = 0;
    state.pageTitle = "";
    state.collection = null;
    state.description = "";
    state.title = "";
    state.author = "";
    state.uploadDate = "";
    state.subtitles = [];
    state.selectedSubtitleId = "";
    state.selectedSubtitleUrl = "";
    state.selectedSubtitleLang = "";
    state.subtitleBody = [];
    state.chapters = [];
  }
  state.subtitleFetchState = preserveReadingContent ? "loading" : "idle";
  state.hotComments = [];
  state.markdown = "";
  state.srt = "";
  state.txt = "";
  state.currentClipSignature = computeCurrentClipSignature();
  stopReadingViewSync();
  state.readingActiveSubtitleIndex = -1;
  state.readingActiveChapterIndex = -1;
  state.nativeTranscriptLoadedSignature = "";
  state.nativeTranscriptAutoFoldedSignature = "";
  state.nativeTranscriptRenderedKey = "";
  state.nativeTranscriptOpen = true;
  state.nativeTranscriptActiveIndex = -1;
  state.nativeTranscriptManualScrollPauseUntil = 0;
  state.readingVideoEl = null;
  stopReaderPlayerObserver();

  renderMeta();
  if (!preserveReadingContent) {
    renderSubtitleSelect();
    byId(ids.preview).value = "";
  }
  setMessage("");
  renderNativeTranscriptPanel();
  if (state.readingViewOpen && !preserveReadingContent) {
    renderReadingView();
    renderReadingStatus("请先点击“刷新抓取”加载当前视频字幕。");
  } else if (state.readingViewOpen) {
    renderReadingStatus("正在切换选集并加载新字幕...");
  }
}

function clearSubtitleContentAfterFetchError() {
  state.selectedSubtitleId = "";
  state.selectedSubtitleUrl = "";
  state.selectedSubtitleLang = "";
  state.subtitleBody = [];
  state.hotComments = [];
  state.markdown = "";
  state.srt = "";
  state.txt = "";
  state.readingActiveSubtitleIndex = -1;

  renderMeta();
  renderSubtitleSelect();
  byId(ids.preview).value = "";
  setMessage("");
}

async function refreshClip() {
  const runId = ++state.fetchRunId;
  try {
    setBusyState(true);
    setMessage("");
    setStatus("正在抓取视频信息...");
    state.subtitleFetchState = "loading";
    renderNativeTranscriptPanel();
    if (state.readingViewOpen) {
      renderReadingView();
    }
    state.settings = await getSettings();
    ensureRunActive(runId);

    state.bvid = extractBvid(location.href);
    if (!state.bvid) {
      throw new Error("当前页面不是标准 BV 视频地址，无法抓取字幕。");
    }

    const pageIndex = extractPageIndex(location.href);
    const oid = extractOid(location.href);
    const hasPageParam = hasExplicitPageParam(location.href);
    const meta = await retryAsync(() => fetchVideoMeta(state.bvid), 2, 250);
    ensureRunActive(runId);

    // 调试：打印 API 返回的原始数据
    logInfo("[BOC] raw meta data", {
      meta,
      defaultCid: meta.defaultCid,
      pagesCount: (meta.pages || []).length
    });

    state.aid = meta.aid || "";
    state.title = meta.title || readVideoTitle();
    state.author = meta.author || readVideoAuthor();
    state.uploadDate = meta.uploadDate || readUploadDate();
    state.description = meta.description || readVideoDescription();
    state.pageCount = Array.isArray(meta.pages) ? meta.pages.length : 0;
    state.currentClipSignature = computeCurrentClipSignature();
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
    state.pageIndex = resolvedPageIndex;
    state.pageTitle = currentPage?.part || "";
    state.collection = resolveVideoCollectionCurrent(meta.collection, {
      bvid: state.bvid,
      aid: state.aid,
      pageIndex: resolvedPageIndex
    });
    state.cid = currentPage?.cid || pickCidFromPages(meta.pages, resolvedPageIndex, meta.defaultCid);
    state.cidSource = "meta-pages";
    state.videoDuration = pickDurationFromPages(meta.pages, resolvedPageIndex, meta.defaultDuration);
    if (!(state.videoDuration > 0)) {
      state.videoDuration = readRuntimeVideoDuration();
    }
    if (!(state.videoDuration > 0)) {
      throw new Error("无法获取当前视频时长，已停止抓取以避免串到错误字幕。");
    }

    logInfo("[BOC] resolved video ids", {
      url: location.href,
      aid: state.aid,
      bvid: state.bvid,
      cid: state.cid,
      cidSource: state.cidSource,
      pageIndex: resolvedPageIndex,
      videoDuration: state.videoDuration
    });

    setStatus("正在获取可用字幕...");
    let subtitleBundle = await retryAsync(
      () => fetchSubtitleBundle(state.bvid, state.cid, state.aid),
      3,
      500
    );
    ensureRunActive(runId);
    state.subtitles = normalizeSubtitleTracks(subtitleBundle.tracks);
    state.chapters = normalizeChapters(subtitleBundle.chapters);
    logInfo(
      "[BOC] chapters",
      state.chapters.map((item) => ({
        from: item.from,
        to: item.to,
        title: item.title
      }))
    );
    logInfo(
      "[BOC] subtitle tracks",
      state.subtitles.map((item) => ({
        id: item.id,
        lan: item.lan,
        lanDoc: item.lanDoc,
        url: item.subtitleUrl
      }))
    );

    // 无字幕时也允许进入阅读视图，只是字幕区域保持空态。
    if (state.subtitles.length === 0) {
      applyNoSubtitleState();
      renderMeta();
      renderSubtitleSelect();
      await refreshOpenReadingView("当前视频无字幕。", runId);
      setStatus("当前视频无字幕。");
      return;
    }

    // 显式点击“刷新抓取”时默认走网络，避免命中历史缓存导致字幕错位。
    const forceRefresh = true;

    const preferred = pickPreferredSubtitle(state.subtitles, {
      previousId: state.selectedSubtitleId,
      previousUrl: state.selectedSubtitleUrl,
      previousLang: state.selectedSubtitleLang
    });

    if (!preferred) {
      applyNoSubtitleState();
      renderMeta();
      renderSubtitleSelect();
      await refreshOpenReadingView("当前视频无字幕。", runId);
      setStatus("当前视频无字幕。");
      return;
    }

    const candidates = buildSubtitleCandidates(state.subtitles, preferred);
    let selected = null;

    try {
      selected = await tryLoadSubtitleCandidates(candidates, runId, forceRefresh);
    } catch (error) {
      const message = getErrorMessage(error, "");
      if (!message.includes("HTTP") && error?.code !== "SUBTITLE_DURATION_MISMATCH") {
        throw error;
      }

      // Retry because subtitle signed URLs may expire quickly or hit rate limit.
      subtitleBundle = await retryAsync(
        () => fetchSubtitleBundle(state.bvid, state.cid, state.aid),
        2,
        500
      );
      ensureRunActive(runId);
      state.subtitles = normalizeSubtitleTracks(subtitleBundle.tracks);
      state.chapters = normalizeChapters(subtitleBundle.chapters);
      const retryPreferred = pickPreferredSubtitle(state.subtitles, {
        previousId: preferred.id,
        previousUrl: preferred.subtitleUrl,
        previousLang: preferred.lanDoc || preferred.lan || ""
      });
      if (!retryPreferred) {
        throw error;
      }
      const retryCandidates = buildSubtitleCandidates(state.subtitles, retryPreferred);
      selected = await tryLoadSubtitleCandidates(retryCandidates, runId, forceRefresh);
    }
    ensureRunActive(runId);
    if (selected) {
      logInfo("[BOC] selected subtitle track", {
        id: selected.id,
        lan: selected.lan,
        lanDoc: selected.lanDoc
      });
    }
    state.subtitleFetchState = "ready";
    renderMeta();
    renderSubtitleSelect();
    await refreshOpenReadingView("抓取完成，阅读视图已同步最新字幕。", runId);
    setStatus("抓取完成，可以复制、下载或发送到 Obsidian。");
  } catch (error) {
    if (isStaleRunError(error)) {
      return;
    }
    // 字幕正文与章节列表来自不同请求。字幕域名被拦截、网络失败或签名
    // 过期时，保留已经成功取得的章节和当前视频元数据。
    if (state.bvid && state.cid) {
      clearSubtitleContentAfterFetchError();
      state.subtitleFetchState = "error";
    } else {
      resetClipState();
      state.subtitleFetchState = "error";
    }
    await refreshOpenReadingView("字幕加载失败，请刷新重试。", runId);
    if (error?.code === "SUBTITLE_DURATION_MISMATCH") {
      setStatus("抓取失败：未找到与当前视频时长匹配的字幕轨，可能该视频无可用字幕。");
      return;
    }
    setStatus(`抓取失败：${getErrorMessage(error)}`);
  } finally {
    if (runId === state.fetchRunId) {
      setBusyState(false);
      renderNativeTranscriptPanel();
    }
  }
}

async function onSubtitleChange(event) {
  const value = event.target.value;
  const option = event.target.options[event.target.selectedIndex];
  const lang = option?.dataset.lang || "unknown";
  const subtitleId = option?.dataset.id || "";
  if (!value) {
    return;
  }

  try {
    setBusyState(true);
    setStatus(`正在切换字幕：${lang}`);
    setMessage("");
    await loadSubtitle(value, lang, state.fetchRunId, subtitleId);
    setStatus("字幕切换完成。");
  } catch (error) {
    if (isStaleRunError(error)) {
      return;
    }
    setStatus(`切换字幕失败：${getErrorMessage(error)}`);
  } finally {
    setBusyState(false);
  }
}

async function loadSubtitle(url, lang, runId = state.fetchRunId, subtitleId = "", forceRefresh = false) {
  if (!url) {
    throw new Error("字幕 URL 为空。");
  }

  const cacheKey = getSubtitleCacheKey({
    bvid: state.bvid,
    cid: state.cid,
    subtitleId,
    subtitleUrl: url,
    lang
  });

  // 尝试从缓存读取
  if (!forceRefresh) {
    const cachedBody = await loadSubtitleFromCache(cacheKey);
    if (cachedBody && Array.isArray(cachedBody) && cachedBody.length > 0) {
      const cachedCheck = validateSubtitleByDuration(cachedBody, state.videoDuration);
      if (!cachedCheck.ok) {
        logWarn("[BOC] cached subtitle duration mismatch, clearing cache", {
          cacheKey,
          reason: cachedCheck.reason
        });
        await clearSubtitleCacheByKey(cacheKey);
      } else {
        logInfo("[BOC] using cached subtitle", { cacheKey, itemCount: cachedBody.length });
        ensureRunActive(runId);
        state.selectedSubtitleId = subtitleId ? String(subtitleId) : state.selectedSubtitleId;
        state.selectedSubtitleUrl = url;
        state.selectedSubtitleLang = lang;
        state.subtitleBody = cachedBody;
        state.subtitleFetchState = "ready";
        await refreshDerivedContent();
        if (state.readingViewOpen) {
          renderReadingView();
          syncReadingViewPlayback(true);
        }
        renderNativeTranscriptPanel();
        return;
      }
    }
  }

  // 从网络获取
  const subtitle = await fetchSubtitleBody(url);
  ensureRunActive(runId);
  const body = Array.isArray(subtitle.body) ? subtitle.body : [];
  if (body.length === 0) {
    throw new Error("字幕文件为空。");
  }
  const durationCheck = validateSubtitleByDuration(body, state.videoDuration);
  if (!durationCheck.ok) {
    const mismatchError = new Error("字幕时长与当前视频不匹配。");
    mismatchError.code = "SUBTITLE_DURATION_MISMATCH";
    mismatchError.details = durationCheck;
    throw mismatchError;
  }

  // 存入缓存
  await saveSubtitleToCache(cacheKey, body);

  state.selectedSubtitleId = subtitleId ? String(subtitleId) : state.selectedSubtitleId;
  state.selectedSubtitleUrl = url;
  state.selectedSubtitleLang = lang;
  state.subtitleBody = body;
  state.subtitleFetchState = "ready";
  await refreshDerivedContent();
  if (state.readingViewOpen) {
    renderReadingView();
    syncReadingViewPlayback(true);
  }
  renderNativeTranscriptPanel();
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

function renderMeta() {
  const meta = byId(ids.meta);
  if (!state.bvid) {
    meta.innerHTML = '<div class="blr-meta-item">尚未抓取视频信息</div>';
    return;
  }

  const subtitleCount = state.subtitles.length;
  meta.innerHTML = `
    <div class="blr-meta-item"><strong>标题：</strong>${escapeHtml(state.title)}</div>
    <div class="blr-meta-item"><strong>URL：</strong>${escapeHtml(cleanVideoUrl())}</div>
    <div class="blr-meta-item"><strong>作者：</strong>${escapeHtml(state.author || "未知")}</div>
    <div class="blr-meta-item"><strong>日期：</strong>${escapeHtml(state.uploadDate || "未知")}</div>
    <div class="blr-meta-item"><strong>字幕轨：</strong>${subtitleCount}</div>
  `;
}

function renderSubtitleSelect() {
  const select = byId(ids.subtitleSelect);
  const subtitles = state.subtitles || [];

  if (subtitles.length === 0) {
    select.innerHTML = '<option value="">暂无字幕</option>';
    select.disabled = true;
    syncReadingTranscriptHeaderControls();
    return;
  }

  select.innerHTML = subtitles
    .map((item) => {
      const selectedById =
        state.selectedSubtitleId && String(item.id) === String(state.selectedSubtitleId);
      const selectedByUrl = item.subtitleUrl === state.selectedSubtitleUrl;
      const selected = selectedById || selectedByUrl ? "selected" : "";
      const label = item.lanDoc || item.lan || "unknown";
      const isAi = isAiSubtitle(item);
      const aiTag = isAi ? " [AI自动]" : "";
      const optionLabel = `${label}${aiTag}`;
      return `<option value="${escapeHtml(item.subtitleUrl)}" data-lang="${escapeHtml(
        label
      )}" data-id="${escapeHtml(String(item.id || ""))}" data-isai="${isAi}" ${selected}>${escapeHtml(
        optionLabel
      )}</option>`;
    })
    .join("");
  select.disabled = false;
}

function buildReadingTranscriptHeadingHtml() {
  return `
    <span class="blr-reading-transcript-heading-title">字幕</span>
    <div class="blr-reading-transcript-heading-controls">
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
    const label = `切换字幕主题，当前：${labels[state.readingTheme] || "浅色"}`;
    themeButton.title = label;
    themeButton.setAttribute("aria-label", label);
  }
  const fontSizeSelect = heading.querySelector(`#${ids.readingTranscriptQuickFontSizeSelect}`);
  const fontWeightSelect = heading.querySelector(`#${ids.readingTranscriptQuickFontWeightSelect}`);
  if (fontSizeSelect) {
    fontSizeSelect.value = state.readingFontScale;
  }
  if (fontWeightSelect) {
    fontWeightSelect.value = state.readingFontWeight;
  }
  const languageSelect = heading.querySelector(`#${ids.readingTranscriptQuickSubtitleSelect}`);
  if (!languageSelect) {
    return;
  }
  const selectedUrlKey = normalizeSubtitleUrlForCache(state.selectedSubtitleUrl);
  const languageRenderKey = JSON.stringify([
    state.selectedSubtitleId,
    selectedUrlKey,
    state.subtitles.map((item) => [item.id, item.subtitleUrl, item.lanDoc, item.lan])
  ]);
  if (languageSelect.dataset.renderKey !== languageRenderKey) {
    languageSelect.innerHTML = state.subtitles.length
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
    languageSelect.dataset.renderKey = languageRenderKey;
  }
  languageSelect.disabled = state.subtitles.length === 0 || state.subtitleFetchState === "loading";
}

function returnReadingTranscriptToCurrent() {
  state.readingManualScrollPauseUntil = 0;
  const video = getRuntimeVideoElement();
  const transcriptList = document.getElementById(ids.readingTranscriptList);
  if (!video || !transcriptList) {
    return;
  }
  const subtitleIndex = findActiveSubtitleIndex(Number(video.currentTime || 0) || 0);
  const target = transcriptList.querySelector(`[data-index="${subtitleIndex}"]`);
  if (target) {
    state.readingNextScrollBehavior = "smooth";
    scrollReadingTranscriptItemIntoView(target);
  }
  syncReadingViewPlayback(false);
  updateReaderFollowState();
}

function bindReadingTranscriptHeaderControls(heading) {
  if (!heading || heading.dataset.blrControlsBound === "1") {
    return;
  }
  heading.querySelector(`#${ids.readingTranscriptReturnButton}`)?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    returnReadingTranscriptToCurrent();
    button.classList.add("is-active");
    window.setTimeout(() => button.classList.remove("is-active"), 300);
  });
  heading.querySelector(`#${ids.readingTranscriptThemeButton}`)?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const themes = ["light", "dark", "paper"];
    const nextIndex = (themes.indexOf(state.readingTheme) + 1) % themes.length;
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
      select.disabled = true;
      loadSubtitle(
        url,
        String(option.dataset.lang || "unknown"),
        state.fetchRunId,
        String(option.dataset.id || "")
      )
        .then(() => {
          renderReadingView();
          syncReadingViewPlayback(true);
        })
        .catch((error) => {
          logWarn("[BOC] failed to switch subtitle in reading transcript header", error);
          syncReadingTranscriptHeaderControls();
        });
    });
  heading.dataset.blrControlsBound = "1";
}

function getPopupPayload() {
  const subtitleOptions = (state.subtitles || []).map((item) => {
    const label = item.lanDoc || item.lan || "unknown";
    const isAi = isAiSubtitle(item);
    const selectedById =
      state.selectedSubtitleId && String(item.id) === String(state.selectedSubtitleId);
    const selectedByUrl = item.subtitleUrl === state.selectedSubtitleUrl;
    return {
      id: String(item.id || ""),
      url: item.subtitleUrl,
      lang: label,
      isAi,
      selected: selectedById || selectedByUrl
    };
  });

  return {
    contentVersion: READER_VERSION,
    url: cleanVideoUrl(),
    title: state.title || "",
    author: state.author || "",
    uploadDate: state.uploadDate || "",
    tags: String(state.settings?.tags || ""),
    status: state.statusText || "",
    message: state.messageText || "",
    subtitlePreview: buildSubtitlePreview(state.subtitleBody || [], state.settings || DEFAULT_SETTINGS),
    markdown: state.markdown || "",
    srt: state.srt || "",
    txt: state.txt || "",
    downloadFormat: normalizeDownloadFormat(state.settings?.downloadFormat),
    subtitleOptions
  };
}

async function copyMarkdown() {
  state.settings = await getSettings();
  await refreshDerivedContent();
  if (!state.markdown) {
    setMessage("没有可复制的内容，请先刷新抓取。");
    return;
  }

  try {
    await navigator.clipboard.writeText(state.markdown);
    setMessage("Markdown 已复制到剪贴板。");
  } catch (error) {
    setMessage(`复制失败：${getErrorMessage(error)}`);
  }
}

async function downloadSubtitle() {
  state.settings = await getSettings();
  rebuildDerivedContent();
  const format = normalizeDownloadFormat(state.settings?.downloadFormat);
  const content = format === "txt" ? state.txt : state.srt;
  if (!content) {
    setMessage("没有可下载的字幕，请先刷新抓取。");
    return;
  }

  const safeTitle = sanitizeFileName(state.title || state.bvid || "bilibili-subtitle");
  const langSuffix = sanitizeFileName(state.selectedSubtitleLang || "subtitle") || "subtitle";
  const filename = `${safeTitle}.${langSuffix}.${format}`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  setMessage(`已下载：${filename}`);
}

async function sendToObsidian() {
  state.settings = await getSettings();
  await refreshDerivedContent();
  if (!state.markdown) {
    setMessage("没有可发送内容，请先刷新抓取。");
    return;
  }

  const filename = buildNoteFilename(state);
  const folder = resolveFolderTemplate(state.settings.noteFolder || "", state);
  const filepath = folder ? `${folder}/${filename}` : filename;
  const baseUrl = String(state.settings.obsidianApiBaseUrl || "").trim();
  const apiKey = String(state.settings.obsidianApiKey || "").trim();
  if (!baseUrl || !apiKey) {
    setMessage("请先在设置中填写 Obsidian Local REST API 地址和 API Key。");
    requestOpenOptions();
    return;
  }

  try {
    const exists = await checkObsidianNoteExists(baseUrl, apiKey, filepath);
    if (exists) {
      const shouldOverwrite = await confirmOverwriteNote(filepath);
      if (!shouldOverwrite) {
        setMessage("已取消保存，原笔记未被覆盖。");
        return;
      }
    }
    await writeNoteByLocalApi(baseUrl, apiKey, filepath, state.markdown);
    setMessage(`已写入 Obsidian：${filepath}`);
  } catch (error) {
    if (isExtensionContextInvalidated(error)) {
      setMessage("扩展刚刚更新，请刷新当前页面后重试。");
      return;
    }
    setMessage(`写入失败：${getErrorMessage(error)}`);
  }
}

async function checkObsidianNoteExists(baseUrl, apiKey, filepath) {
  const resp = await sendRuntimeMessage({
    type: "obsidian-note-exists",
    baseUrl,
    apiKey,
    filepath
  });
  if (!resp?.ok) {
    throw new Error(toReadableText(resp?.error, "Local API 检查失败"));
  }
  return Boolean(resp.exists);
}

async function writeNoteByLocalApi(baseUrl, apiKey, filepath, content) {
  const resp = await sendRuntimeMessage({
    type: "write-obsidian-note",
    baseUrl,
    apiKey,
    filepath,
    content
  });
  if (!resp?.ok) {
    throw new Error(toReadableText(resp?.error, "Local API 写入失败"));
  }
}

function confirmOverwriteNote(filepath) {
  return new Promise((resolve) => {
    const existing = document.querySelector(".blr-confirm-overlay");
    if (existing) {
      existing.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "blr-confirm-overlay";
    overlay.innerHTML = `
      <div class="blr-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="blrConfirmTitle">
        <div id="blrConfirmTitle" class="blr-confirm-title">该笔记已存在</div>
        <div class="blr-confirm-body">继续会覆盖原内容：</div>
        <div class="blr-confirm-path"></div>
        <div class="blr-confirm-actions">
          <button type="button" class="blr-confirm-cancel">取消</button>
          <button type="button" class="blr-confirm-primary">覆盖</button>
        </div>
      </div>
    `;
    overlay.querySelector(".blr-confirm-path").textContent = String(filepath || "");

    const cleanup = (value) => {
      overlay.remove();
      document.removeEventListener("keydown", onKeydown, true);
      resolve(value);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cleanup(false);
      }
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        cleanup(false);
      }
    });
    overlay.querySelector(".blr-confirm-cancel")?.addEventListener("click", () => cleanup(false));
    overlay.querySelector(".blr-confirm-primary")?.addEventListener("click", () => cleanup(true));
    document.addEventListener("keydown", onKeydown, true);
    document.body.appendChild(overlay);
    overlay.querySelector(".blr-confirm-primary")?.focus();
  });
}

function setBusyState(disabled) {
  byId(ids.copyBtn).disabled = disabled;
  byId(ids.downloadBtn).disabled = disabled;
  byId(ids.sendBtn).disabled = disabled;
  byId(ids.refreshBtn).disabled = disabled;
  byId(ids.settingsBtn).disabled = disabled;
  byId(ids.subtitleSelect).disabled = disabled || state.subtitles.length === 0;
}

function setStatus(text) {
  state.statusText = String(text || "");
  byId(ids.status).textContent = state.statusText;
}

function setMessage(text) {
  state.messageText = String(text || "");
  byId(ids.message).textContent = state.messageText;
}

function applyNoSubtitleState() {
  state.selectedSubtitleId = "";
  state.selectedSubtitleUrl = "";
  state.selectedSubtitleLang = "";
  state.subtitleBody = [];
  state.subtitleFetchState = "empty";
  state.hotComments = [];
  state.markdown = "";
  state.srt = "";
  state.txt = "";
  byId(ids.preview).value = "";
}
