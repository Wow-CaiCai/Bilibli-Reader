
function syncReadingViewPlayback(forceScroll = false) {
  if (!state.readingViewOpen) {
    return;
  }

  if (state.readingNativePageMode) {
    layoutReaderPlayerHost();
  }

  const runtimeVideo = getRuntimeVideoElement();
  const runtimeHost = findReaderPlayerHost(runtimeVideo);
  if (runtimeVideo && runtimeHost) {
    const playerChanged =
      runtimeVideo !== state.readingVideoEl || runtimeHost !== state.readingPlayerHost;
    if (playerChanged) {
      queueEnsureReaderPlayerMounted();
    }
  }

  const video = bindReadingViewVideo(runtimeVideo || state.readingVideoEl);
  if (!video) {
    renderReadingStatus("当前页面没有找到可联动的视频播放器。");
    return;
  }

  const currentTime = Number(video.currentTime || 0) || 0;
  const subtitleIndex = findActiveSubtitleIndex(currentTime);
  const chapterIndex = findActiveChapterIndex(currentTime);
  const changed =
    subtitleIndex !== state.readingActiveSubtitleIndex ||
    chapterIndex !== state.readingActiveChapterIndex;

  setActiveReadingItems(subtitleIndex, chapterIndex, forceScroll || changed);
  updateReaderFollowState();
  renderReadingStatus(`当前进度 ${formatCompactTimestamp(currentTime, currentTime >= 3600)}`);
}

function findActiveSubtitleIndex(currentTime) {
  const items = Array.isArray(state.subtitleBody) ? state.subtitleBody : [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const from = Number(item?.from || 0) || 0;
    const rawTo = Number(item?.to || 0) || 0;
    const to = rawTo > from ? rawTo : from + 2;
    if (currentTime >= from && currentTime < to) {
      return index;
    }
  }
  return -1;
}

function findActiveChapterIndex(currentTime) {
  const chapters = normalizeChapters(state.chapters || []);
  for (let index = 0; index < chapters.length; index += 1) {
    const item = chapters[index];
    const from = Number(item?.from || 0) || 0;
    const next = chapters[index + 1];
    const explicitTo = Number(item?.to || 0) || 0;
    const fallbackTo = next && Number(next.from) > from ? Number(next.from) : explicitTo;
    const to = fallbackTo > from ? fallbackTo : Number.POSITIVE_INFINITY;
    if (currentTime >= from && currentTime < to) {
      return index;
    }
  }
  return -1;
}

function setActiveReadingItems(subtitleIndex, chapterIndex, shouldScroll = false) {
  const transcriptList = byId(ids.readingTranscriptList);
  const chapterList = byId(ids.readingChapterList);
  const nextTranscript = transcriptList.querySelector(`[data-index="${subtitleIndex}"]`);
  const nextChapter = chapterList.querySelector(`[data-index="${chapterIndex}"]`);
  const currentTranscript = transcriptList.querySelector(".blr-reading-complete-segment.is-active");
  const currentChapter = chapterList.querySelector(".blr-reading-chapter.is-active");

  if (currentTranscript && currentTranscript !== nextTranscript) {
    currentTranscript.classList.remove("is-active");
  }
  if (currentChapter && currentChapter !== nextChapter) {
    currentChapter.classList.remove("is-active");
  }
  if (nextTranscript) {
    nextTranscript.classList.add("is-active");
  }
  if (nextChapter) {
    nextChapter.classList.add("is-active");
  }

  if (shouldScroll && state.readingAutoScroll) {
    if (Date.now() < state.readingManualScrollPauseUntil) {
      updateReaderFollowState();
      state.readingActiveSubtitleIndex = subtitleIndex;
      state.readingActiveChapterIndex = chapterIndex;
      return;
    }
    if (nextTranscript) {
      scrollReadingTranscriptItemIntoView(nextTranscript);
    }
    if (nextChapter) {
      scrollReadingRailItemIntoView(nextChapter);
    }
  }

  state.readingActiveSubtitleIndex = subtitleIndex;
  state.readingActiveChapterIndex = chapterIndex;
}

function scrollReadingRailItemIntoView(node) {
  if (!node) {
    return;
  }
  state.readingProgrammaticScrollUntil = Date.now() + 600;
  node.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest"
  });
}

function scrollReadingTranscriptItemIntoView(node) {
  if (!node) {
    return;
  }

  const transcriptList = byId(ids.readingTranscriptList);
  const inlineHost = document.getElementById("blr-reading-inline-host");
  const listRect = transcriptList.getBoundingClientRect();
  const itemRect = node.getBoundingClientRect();
  if (!(listRect.height > 0) || !(itemRect.height > 0)) {
    scrollReadingRailItemIntoView(node);
    return;
  }

  const behavior = state.readingNextScrollBehavior === "auto" ? "auto" : "smooth";
  state.readingProgrammaticScrollUntil = Date.now() + (behavior === "auto" ? 120 : 800);
  state.readingNextScrollBehavior = "smooth";
  if (state.readingNativePageMode && inlineHost && inlineHost.scrollHeight > inlineHost.clientHeight + 8) {
    const hostRect = inlineHost.getBoundingClientRect();
    const computed = window.getComputedStyle(node);
    const lineHeight = Number.parseFloat(computed.lineHeight) || itemRect.height || 32;
    const heading = document.getElementById("blr-reading-transcript-heading");
    const headingHeight = heading?.getBoundingClientRect?.().height || 38;
    const anchorRect = node.getBoundingClientRect();
    const desiredOffset = headingHeight + 8 + lineHeight * 2;
    const targetScrollTop =
      inlineHost.scrollTop + (anchorRect.top - hostRect.top) - desiredOffset;
    inlineHost.scrollTo({
      top: Math.max(0, Math.round(targetScrollTop)),
      behavior
    });
    return;
  }
  if (state.readingNativePageMode || transcriptList.scrollHeight <= transcriptList.clientHeight + 8) {
    const desiredTop = listRect.top + Math.max(72, Math.min(listRect.height * 0.24, 220));
    const nextTop = window.scrollY + itemRect.top - desiredTop;
    window.scrollTo({
      top: Math.max(0, Math.round(nextTop)),
      behavior
    });
    return;
  }

  const targetScrollTop =
    transcriptList.scrollTop + (itemRect.top - listRect.top) - Math.max(48, Math.min(listRect.height * 0.24, 180));
  transcriptList.scrollTo({
    top: Math.max(0, Math.round(targetScrollTop)),
    behavior
  });
}

function jumpReadingTarget(seconds) {
  const video = bindReadingViewVideo();
  if (!video) {
    renderReadingStatus("当前页面没有找到可联动的视频播放器。");
    return;
  }

  const nextTime = Math.max(0, Number(seconds || 0) || 0);
  state.readingManualScrollPauseUntil = 0;
  state.readingNextScrollBehavior = "auto";
  updateReaderFollowState();
  video.currentTime = nextTime;
  if (video.paused) {
    video.play().catch(() => {});
  }
  syncReadingViewPlayback(true);
}

function onReadingChapterClick(event) {
  const target = event.target.closest(".blr-reading-chapter");
  if (!target) {
    return;
  }
  jumpReadingTarget(target.dataset.seconds);
}

async function onReadingCollectionClick(event) {
  const target = event.target.closest(".blr-reading-collection-item");
  if (!target || target.classList.contains("is-active") || state.readingCollectionSwitchInFlight) {
    return;
  }
  const bvid = String(target.dataset.bvid || "").trim();
  if (!/^BV[0-9A-Za-z]+$/.test(bvid)) {
    renderReadingStatus("无法读取这一集的视频地址。");
    return;
  }

  const pageIndex = Number(target.dataset.page || 0);
  const targetIndex = Number(target.dataset.index);
  const currentIndex = Number(state.collection?.currentIndex);
  const expectedSignature = [bvid, pageIndex > 0 ? pageIndex : 1].join("|");
  state.readingCollectionSwitchInFlight = true;
  target.setAttribute("aria-busy", "true");
  renderReadingStatus("正在使用播放器原生逻辑切换选集...");

  try {
    const nativeTriggered = triggerNativeCollectionSwitch({
      currentIndex,
      targetIndex,
      bvid,
      pageIndex,
      cid: String(state.collection?.episodes?.[targetIndex]?.cid || "")
    });
    if (nativeTriggered && (await waitForClipSignature(expectedSignature, 4500))) {
      return;
    }

    renderReadingStatus("原生切集未响应，正在使用兼容方式切换...");
    setReadingViewReady(false);
    const nextUrl = new URL(`https://www.bilibili.com/video/${bvid}/`);
    if (pageIndex > 1) {
      nextUrl.searchParams.set("p", String(pageIndex));
    }
    nextUrl.searchParams.set("bilibli_reader", "1");
    location.assign(nextUrl.toString());
  } finally {
    state.readingCollectionSwitchInFlight = false;
    target.removeAttribute("aria-busy");
  }
}

function triggerNativeCollectionSwitch({ currentIndex, targetIndex, bvid, pageIndex, cid }) {
  const offset = targetIndex - currentIndex;
  if (Math.abs(offset) === 1) {
    const control = findNativePlayerEpisodeControl(offset < 0 ? "previous" : "next");
    if (activateNativeCollectionTarget(control)) {
      return true;
    }
  }

  const episodeTarget = findNativeCollectionEpisodeTarget({ bvid, pageIndex, cid });
  return activateNativeCollectionTarget(episodeTarget);
}

function findNativePlayerEpisodeControl(direction) {
  const isPrevious = direction === "previous";
  const selectors = isPrevious
    ? [
        ".bpx-player-ctrl-prev",
        ".bpx-player-ctrl-prev-btn",
        ".bilibili-player-video-btn-prev",
        "[aria-label*='上一集']",
        "[title*='上一集']",
        "[data-text*='上一集']"
      ]
    : [
        ".bpx-player-ctrl-next",
        ".bpx-player-ctrl-next-btn",
        ".bilibili-player-video-btn-next",
        "[aria-label*='下一集']",
        "[title*='下一集']",
        "[data-text*='下一集']"
      ];
  const roots = [getReaderControlsRoot(), getReaderPlayerWrapNode(), state.readingPlayerHost, document].filter(
    Boolean
  );

  for (const root of roots) {
    for (const selector of selectors) {
      const node = root.querySelector?.(selector);
      if (isUsableNativeCollectionTarget(node)) {
        return node;
      }
    }
  }
  return null;
}

function findNativeCollectionEpisodeTarget({ bvid, pageIndex = 0, cid = "" }) {
  const safeBvid = String(bvid || "").trim();
  const safeCid = String(cid || "").trim();
  const safePageIndex = Number(pageIndex || 0);
  const candidates = Array.from(
    document.querySelectorAll("a[href], [data-page], [data-p], [data-cid]")
  ).filter((node) => !node.closest(`#${ids.root}`));

  const byCid = safeCid
    ? candidates.find(
        (node) => String(node.dataset?.cid || node.getAttribute("data-cid") || "").trim() === safeCid
      )
    : null;
  if (byCid) {
    return byCid;
  }

  const byHref = candidates.find((node) => {
      const href = String(node.getAttribute("href") || "").trim();
      if (!href) {
        return false;
      }
      try {
        const url = new URL(href, location.href);
        const hrefBvid = extractBvid(url.toString());
        const hrefPage = extractPageIndex(url.toString());
        return hrefBvid === safeBvid && (!safePageIndex || hrefPage === safePageIndex);
      } catch {
        return false;
      }
    });
  if (byHref) {
    return byHref;
  }

  if (safePageIndex <= 0) {
    return null;
  }
  return (
    candidates.find((node) => {
      const inNativeEpisodeList = node.closest?.(
        ".video-pod, .multi-page, .cur-list, [class*='video-pod'], [class*='multi-page'], [class*='part-list']"
      );
      const nodePage = Number(node.dataset?.page || node.dataset?.p || 0);
      return Boolean(inNativeEpisodeList) && nodePage === safePageIndex;
    }) || null
  );
}

function isUsableNativeCollectionTarget(node) {
  if (!node || !node.isConnected || node.closest?.(`#${ids.root}`)) {
    return false;
  }
  return !(
    node.disabled ||
    node.getAttribute?.("aria-disabled") === "true" ||
    node.classList?.contains("disabled") ||
    node.classList?.contains("is-disabled")
  );
}

function activateNativeCollectionTarget(node) {
  if (!isUsableNativeCollectionTarget(node)) {
    return false;
  }
  try {
    node.click();
    return true;
  } catch (error) {
    logWarn("[BOC] native collection switch failed", error);
    return false;
  }
}

async function waitForClipSignature(expectedSignature, timeoutMs = 4500) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (computeCurrentClipSignature() === expectedSignature) {
      return true;
    }
    await sleep(100);
  }
  return false;
}

function onReadingTranscriptClick(event) {
  const target = event.target.closest(".blr-reading-complete-segment");
  if (!target) {
    return;
  }
  // Don't jump if user is selecting text
  if (window.getSelection()?.toString().trim()) {
    return;
  }
  jumpReadingTarget(target.dataset.seconds);
}

function noteManualReaderInteraction(durationMs = 3000) {
  if (!state.readingAutoScroll) {
    updateReaderFollowState();
    return;
  }
  state.readingManualScrollPauseUntil = Date.now() + durationMs;
  updateReaderFollowState();
}

function updateReaderFollowState() {
  const readingView = document.getElementById(ids.readingView);
  if (!readingView) {
    return;
  }
  const mode =
    !state.readingAutoScroll ? "off" : Date.now() < state.readingManualScrollPauseUntil ? "manual" : "auto";
  readingView.setAttribute("data-blr-reader-follow", mode);
}
