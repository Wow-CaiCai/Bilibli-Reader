
// Data commits replace arrays. WeakMap entries disappear with old clip data.
const readingSubtitleCache = new WeakMap();
const readingChapterCache = new WeakMap();
const readerNodeCache = new WeakMap();
const readerContainerNodeCache = new WeakMap();

function invalidateReaderNodeCache(container) {
  if (!container) return;
  const entries = readerContainerNodeCache.get(container);
  entries?.forEach((cache) => { cache.invalidated = true; });
  readerContainerNodeCache.delete(container);
}

function getReaderNodeCache(container, selector, indexAttribute = "data-index") {
  if (!container) return null;
  const key = `${selector}|${indexAttribute}`;
  let containerEntries = readerContainerNodeCache.get(container);
  const existing = containerEntries?.get(key);
  if (existing && !existing.invalidated && existing.first.isConnected &&
      container.contains(existing.first) && existing.childCount === existing.root.childElementCount) return existing;
  const first = container?.querySelector(selector);
  if (!first) return null;
  const root = first.parentElement;
  let entries = readerNodeCache.get(root);
  if (!entries) {
    entries = new Map();
    readerNodeCache.set(root, entries);
  }
  let cached = entries.get(key);
  if (!cached || cached.invalidated || cached.first !== first || cached.childCount !== root.childElementCount) {
    const nodes = root.querySelectorAll(selector);
    const byIndex = new Map();
    let activeNode = null;
    for (const node of nodes) {
      const index = Number(node.getAttribute(indexAttribute));
      if (!byIndex.has(index)) byIndex.set(index, node);
      if (node.classList.contains("is-active")) activeNode = node;
    }
    cached = { root, first, nodes, byIndex, activeNode, childCount: root.childElementCount, invalidated: false };
    entries.set(key, cached);
  }
  if (!containerEntries) {
    containerEntries = new Map();
    readerContainerNodeCache.set(container, containerEntries);
  }
  containerEntries.set(key, cached);
  return cached;
}

function setCachedReaderActiveNode(cache, next) {
  if (!cache || cache.activeNode === next) return;
  cache.activeNode?.classList.remove("is-active");
  next?.classList.add("is-active");
  cache.activeNode = next;
}

function getCachedSubtitleData(body = clipState.subtitleBody) {
  if (!Array.isArray(body)) return { intervals: [], items: [], canBinarySearch: true, hasHourTimestamp: false };
  let cached = readingSubtitleCache.get(body);
  if (cached) return cached;
  const intervals = body.map((item, index) => {
    const from = Number(item?.from || 0) || 0;
    const rawTo = Number(item?.to || 0) || 0;
    return { index, from, rawTo, to: rawTo > from ? rawTo : from + 2 };
  });
  // Arbitrary ordering and overlaps must keep the original first-match rule.
  const canBinarySearch = intervals.every((item, index) =>
    Number.isFinite(item.from) && Number.isFinite(item.to) &&
    item.rawTo > item.from && (index === 0 || intervals[index - 1].to <= item.from)
  );
  const items = body.map((item, index) => ({
    index,
    from: Number(item?.from || 0) || 0,
    to: Number(item?.to || 0) || 0,
    content: String(item?.content || "").trim()
  })).filter((item) => item.content);
  const hasHourTimestamp = intervals.some((item) => Number.isFinite(item.rawTo) && item.rawTo >= 3600);
  cached = { intervals, items, canBinarySearch, hasHourTimestamp };
  readingSubtitleCache.set(body, cached);
  return cached;
}

function getCachedReadingTranscriptItems(body = clipState.subtitleBody) {
  return getCachedSubtitleData(body).items;
}

function getCachedReadingChapters(chapters = clipState.chapters) {
  if (!Array.isArray(chapters)) return [];
  let cached = readingChapterCache.get(chapters);
  if (!cached) {
    cached = normalizeChapters(chapters);
    readingChapterCache.set(chapters, cached);
  }
  return cached;
}

function stopTranscriptScroll(container) {
  if (!container) return;
  const until = Date.now() + 120;
  readerSessionState.programmaticScrollUntil = Math.max(readerSessionState.programmaticScrollUntil, until);
  nativeTranscriptState.programmaticScrollUntil = Math.max(nativeTranscriptState.programmaticScrollUntil, until);
  container.scrollTo({ top: container.scrollTop, left: container.scrollLeft, behavior: "instant" });
}

function captureTranscriptScrollAnchor(container, selector) {
  if (!container?.isConnected) return null;
  stopTranscriptScroll(container);
  const bounds = container.getBoundingClientRect();
  const headingHeight = container.querySelector(".blr-reading-transcript-heading")?.getBoundingClientRect().height || 0;
  const indexAttribute = selector === ".blr-native-transcript-segment"
    ? "data-native-transcript-index" : "data-index";
  const nodes = getReaderNodeCache(container, selector, indexAttribute)?.nodes;
  let node = null;
  if (nodes?.length) {
    // Both transcript templates use inline segments in document order. Their
    // bottom edges are monotonic even when one segment wraps onto several lines.
    const visibleTop = bounds.top + headingHeight;
    let low = 0;
    let high = nodes.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (nodes[mid].getBoundingClientRect().bottom <= visibleTop) low = mid + 1;
      else high = mid;
    }
    const candidate = nodes[low];
    const rect = candidate?.getBoundingClientRect();
    if (rect && rect.bottom > visibleTop && rect.top < bounds.bottom) node = candidate;
  }
  return {
    container, node, headingHeight,
    offset: node ? node.getBoundingClientRect().top - bounds.top : 0,
    scrollTop: container.scrollTop
  };
}

function transferTranscriptScrollAnchor(anchor, container, indexAttribute) {
  if (!anchor?.node || !container) return;
  const index = Number(anchor.node.dataset.index ?? anchor.node.dataset.nativeTranscriptIndex);
  if (!Number.isInteger(index) || index < 0) return;
  const selector = indexAttribute === "data-native-transcript-index"
    ? ".blr-native-transcript-segment" : ".blr-reading-complete-segment";
  const node = getReaderNodeCache(container, selector, indexAttribute)?.byIndex.get(index);
  if (!node) return;
  const headingHeight = container.querySelector(".blr-reading-transcript-heading")?.getBoundingClientRect().height || 0;
  restoreTranscriptScrollAnchor({
    container, node, scrollTop: container.scrollTop,
    offset: headingHeight + Math.max(0, anchor.offset - anchor.headingHeight)
  });
}

function restoreTranscriptScrollAnchor(anchor) {
  if (!anchor?.container.isConnected) return;
  const { container, node, offset, scrollTop } = anchor;
  const top = node?.isConnected && container.contains(node)
    ? container.scrollTop + node.getBoundingClientRect().top - container.getBoundingClientRect().top - offset
    : scrollTop;
  stopTranscriptScroll(container);
  container.scrollTo({ top: Math.max(0, top), behavior: "instant" });
}

function syncReadingViewPlayback(forceScroll = false) {
  if (!readerSessionState.open || readerSessionState.transition?.phase === "animating") {
    return;
  }

  const runtimeVideo = getRuntimeVideoElement();
  const runtimeHost = findReaderPlayerHost(runtimeVideo);
  if (runtimeVideo && runtimeHost) {
    const playerChanged =
      runtimeVideo !== readerPlayerState.videoEl || runtimeHost !== readerPlayerState.host;
    if (playerChanged) {
      queueEnsureReaderPlayerMounted();
    }
  }

  const video = bindReadingViewVideo(runtimeVideo || readerPlayerState.videoEl);
  if (!video) {
    renderReadingStatus("当前页面没有找到可联动的视频播放器。");
    return;
  }

  const currentTime = Number(video.currentTime || 0) || 0;
  const subtitleIndex = findActiveSubtitleIndex(currentTime);
  const chapterIndex = findActiveChapterIndex(currentTime);
  const changed =
    subtitleIndex !== readerSessionState.activeSubtitleIndex ||
    chapterIndex !== readerSessionState.activeChapterIndex;

  setActiveReadingItems(subtitleIndex, chapterIndex, forceScroll || changed);
  updateReaderFollowState();
  renderReadingStatus(`当前进度 ${formatCompactTimestamp(currentTime, currentTime >= 3600)}`);
}

function findActiveSubtitleIndex(currentTime) {
  const { intervals, canBinarySearch } = getCachedSubtitleData();
  if (canBinarySearch) {
    let low = 0;
    let high = intervals.length - 1;
    while (low <= high) {
      const mid = (low + high) >>> 1;
      const item = intervals[mid];
      if (currentTime < item.from) high = mid - 1;
      else if (currentTime >= item.to) low = mid + 1;
      else return currentTime >= item.from && currentTime < item.to ? item.index : -1;
    }
    return -1;
  }
  for (const item of intervals) {
    if (currentTime >= item.from && currentTime < item.to) return item.index;
  }
  return -1;
}

function findActiveChapterIndex(currentTime) {
  const chapters = getCachedReadingChapters();
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
  const transcriptChanged = subtitleIndex !== readerSessionState.activeSubtitleIndex;
  const chapterChanged = chapterIndex !== readerSessionState.activeChapterIndex;
  if (!transcriptChanged && !chapterChanged && !shouldScroll) return;
  const transcriptList = byId(ids.readingTranscriptList);
  const chapterList = byId(ids.readingChapterList);
  const transcriptCache = getReaderNodeCache(transcriptList, ".blr-reading-complete-segment");
  const chapterCache = getReaderNodeCache(chapterList, ".blr-reading-chapter");
  const nextTranscript = transcriptChanged || shouldScroll
    ? transcriptCache?.byIndex.get(subtitleIndex) || null : null;
  const nextChapter = chapterChanged || shouldScroll
    ? chapterCache?.byIndex.get(chapterIndex) || null : null;
  if (transcriptChanged) setCachedReaderActiveNode(transcriptCache, nextTranscript);
  if (chapterChanged) setCachedReaderActiveNode(chapterCache, nextChapter);

  if (shouldScroll && readerPreferences.autoScroll) {
    if (document.body.hasAttribute("data-blr-reader-resizing") || Date.now() < readerSessionState.manualScrollPauseUntil) {
      updateReaderFollowState();
      readerSessionState.activeSubtitleIndex = subtitleIndex;
      readerSessionState.activeChapterIndex = chapterIndex;
      return;
    }
    const behavior = getReadingScrollBehavior();
    if (nextTranscript) {
      scrollReadingTranscriptItemIntoView(nextTranscript, behavior);
    }
    if (nextChapter) {
      scrollReadingRailItemIntoView(nextChapter, behavior);
    }
  }

  readerSessionState.activeSubtitleIndex = subtitleIndex;
  readerSessionState.activeChapterIndex = chapterIndex;
}

function getReadingScrollBehavior() {
  // "instant" also overrides smooth scrolling inherited from the host page.
  return readerSessionState.nextScrollBehavior === "auto" || !readerSessionState.ready ||
    readerSessionState.transition?.direction === "enter" ? "instant" : "smooth";
}

function scrollReadingRailItemIntoView(node, behavior = getReadingScrollBehavior()) {
  if (!node) {
    return;
  }
  readerSessionState.programmaticScrollUntil = Date.now() + (behavior === "instant" ? 120 : 600);
  node.scrollIntoView({
    behavior,
    block: "nearest",
    inline: "nearest"
  });
}

function scrollReadingTranscriptItemIntoView(node, behavior = getReadingScrollBehavior()) {
  if (!readerSessionState.open || !node) {
    return;
  }

  const transcriptList = byId(ids.readingTranscriptList);
  const inlineHost = document.getElementById("blr-reading-inline-host");
  const listRect = transcriptList.getBoundingClientRect();
  const itemRect = node.getBoundingClientRect();
  if (!(listRect.height > 0) || !(itemRect.height > 0)) {
    scrollReadingRailItemIntoView(node, behavior);
    return;
  }

  readerSessionState.programmaticScrollUntil = Date.now() + (behavior === "instant" ? 120 : 800);
  readerSessionState.nextScrollBehavior = "smooth";
  if (inlineHost && inlineHost.scrollHeight > inlineHost.clientHeight + 8) {
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
  const desiredTop = listRect.top + Math.max(72, Math.min(listRect.height * 0.24, 220));
  const nextTop = window.scrollY + itemRect.top - desiredTop;
  window.scrollTo({
    top: Math.max(0, Math.round(nextTop)),
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
  readerSessionState.manualScrollPauseUntil = 0;
  readerSessionState.nextScrollBehavior = "auto";
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
  if (!target || target.classList.contains("is-active") || readerSessionState.collectionSwitchInFlight) {
    return;
  }
  const bvid = String(target.dataset.bvid || "").trim();
  if (!/^BV[0-9A-Za-z]+$/.test(bvid)) {
    renderReadingStatus("无法读取这一集的视频地址。");
    return;
  }

  const pageIndex = Number(target.dataset.page || 0);
  const targetIndex = Number(target.dataset.index);
  const currentIndex = Number(clipState.collection?.currentIndex);
  const expectedSignature = [bvid, pageIndex > 0 ? pageIndex : 1].join("|");
  readerSessionState.collectionSwitchInFlight = true;
  target.setAttribute("aria-busy", "true");
  renderReadingStatus("正在使用播放器原生逻辑切换选集...");

  try {
    const nativeTriggered = triggerNativeCollectionSwitch({
      currentIndex,
      targetIndex,
      bvid,
      pageIndex,
      cid: String(clipState.collection?.episodes?.[targetIndex]?.cid || "")
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
    readerSessionState.collectionSwitchInFlight = false;
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
  const roots = [getReaderControlsRoot(), getReaderPlayerWrapNode(), readerPlayerState.host, document].filter(
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
  if (!readerPreferences.autoScroll) {
    updateReaderFollowState();
    return;
  }
  readerSessionState.manualScrollPauseUntil = Date.now() + durationMs;
  updateReaderFollowState();
}

function updateReaderFollowState() {
  const readingView = document.getElementById(ids.readingView);
  if (!readingView) {
    return;
  }
  const mode =
    !readerPreferences.autoScroll ? "off" : Date.now() < readerSessionState.manualScrollPauseUntil ? "manual" : "auto";
  readingView.setAttribute("data-blr-reader-follow", mode);
}
