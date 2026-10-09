// YouTube uses its native player and shares transcript data with the reader.
function isYouTubePage(url = location.href) {
  try { return ["www.youtube.com", "youtube.com"].includes(new URL(url).hostname); }
  catch { return false; }
}

function extractYouTubeVideoId(url = location.href) {
  try {
    const parsed = new URL(url);
    const id = parsed.searchParams.get("v") || "";
    return isYouTubePage(url) && parsed.pathname === "/watch" && /^[\w-]{11}$/.test(id) ? id : "";
  } catch { return ""; }
}

function isSupportedTranscriptPage(url = location.href) {
  return Boolean(extractYouTubeVideoId(url) || (!isYouTubePage(url) && extractBvid(url)));
}

function getYouTubePageWindow() {
  return typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
}

function readYouTubePlayerResponse(videoId) {
  const page = getYouTubePageWindow();
  const player = page.document.getElementById("movie_player");
  const watch = page.document.querySelector("ytd-watch-flexy");
  const candidates = [];
  try { candidates.push(player?.getPlayerResponse?.()); } catch {}
  candidates.push(watch?.playerData, page.ytInitialPlayerResponse);
  const matching = candidates.filter((item) => item?.videoDetails?.videoId === videoId);
  // A transient player response must not mask the complete watch-page data.
  return matching.find((item) => item.captions?.playerCaptionsTracklistRenderer?.captionTracks?.length) ||
    matching.find((item) => item.playabilityStatus?.status === "OK") || matching[0] || null;
}

function youtubeText(value) {
  if (typeof value === "string") return value;
  return value?.simpleText || value?.content || (value?.runs || []).map((item) => item.text || "").join("");
}

function mapYouTubeCaptionTracks(response, videoId) {
  const list = response?.captions?.playerCaptionsTracklistRenderer;
  const tracks = list?.captionTracks || [];
  const defaultIndex = list?.audioTracks?.[list.defaultAudioTrackIndex || 0]?.defaultCaptionTrackIndex ?? 0;
  return tracks.flatMap((track, index) => {
    if (track.kind === "asr" || String(track.vssId || "").startsWith("a.")) return [];
    try {
      const url = new URL(track.baseUrl);
      if (url.protocol !== "https:" || !isYouTubePage(url.origin) ||
          url.pathname !== "/api/timedtext" || url.searchParams.get("v") !== videoId) return [];
      url.searchParams.set("fmt", "json3");
      const label = youtubeText(track.name) || track.languageCode || "字幕";
      return [{
        id: `youtube:${videoId}:${track.vssId || `${track.languageCode}:${index}`}`,
        lan: track.languageCode || "und",
        lanDoc: label,
        subtitleUrl: url.toString(),
        nativeDefault: index === defaultIndex,
        nativeLabel: youtubeText(track.name),
        nativeTrackCount: tracks.length,
        source: "youtube"
      }];
    } catch { return []; }
  });
}

function parseYouTubeChapterTimestamp(value) {
  const text = String(value || "").trim();
  if (!/^\d{1,3}:\d{2}(?::\d{2})?$/.test(text)) return NaN;
  const parts = text.split(":").map(Number);
  if (parts.at(-1) >= 60 || (parts.length === 3 && parts[1] >= 60)) return NaN;
  return parts.reduce((seconds, part) => seconds * 60 + part, 0);
}

function normalizeYouTubeChapters(chapters, duration = 0) {
  const sorted = chapters.filter((item) => item.title && Number.isFinite(item.from) &&
    item.from >= 0 && (!duration || item.from < duration)).sort((a, b) => a.from - b.from);
  const unique = sorted.filter((item, index) => index === 0 || item.from !== sorted[index - 1].from);
  return unique.map((item, index) => ({
    title: item.title.trim(), from: item.from,
    to: unique[index + 1]?.from ?? (duration > item.from ? duration : 0), source: "youtube"
  }));
}

function readYouTubeChapters(videoId, response = readYouTubePlayerResponse(videoId)) {
  if (!videoId || videoId !== extractYouTubeVideoId()) return [];
  const page = getYouTubePageWindow();
  const watch = page.document.querySelector("ytd-watch-flexy");
  const duration = Number(response?.videoDetails?.lengthSeconds) || clipState.videoDuration;
  const roots = [response];
  if (watch?.getAttribute("video-id") === videoId) roots.push(watch.data);
  // Initial data can belong to the first video after a YouTube SPA navigation.
  if (page.ytInitialPlayerResponse?.videoDetails?.videoId === videoId) roots.push(page.ytInitialData);
  const chapters = [];
  const markers = [];
  roots.forEach((root) => walkYouTubeData(root, (item) => {
    const chapter = item.chapterRenderer;
    if (chapter?.timeRangeStartMillis !== undefined) chapters.push({
      title: youtubeText(chapter.title), from: Number(chapter.timeRangeStartMillis) / 1000
    });
    const marker = item.macroMarkersListItemRenderer;
    if (!marker) return;
    const endpoint = marker.onTap?.watchEndpoint || marker.onTap?.innertubeCommand?.watchEndpoint;
    if (endpoint?.videoId && endpoint.videoId !== videoId) return;
    markers.push({ title: youtubeText(marker.title), from: endpoint?.startTimeSeconds !== undefined
      ? Number(endpoint.startTimeSeconds) : parseYouTubeChapterTimestamp(youtubeText(marker.timeDescription)) });
  }));
  const structuredChapters = normalizeYouTubeChapters(chapters, duration);
  const structured = structuredChapters.length ? structuredChapters : normalizeYouTubeChapters(markers, duration);
  if (structured.length) return structured;

  // Chapter cards may arrive after player metadata. Read their native titles
  // and timestamps without opening the chapter panel or changing playback.
  const domChapters = [];
  if (watch?.getAttribute("video-id") === videoId) {
    watch.querySelectorAll("ytd-macro-markers-list-item-renderer").forEach((node) => {
      const link = node.querySelector("a[href]");
      try {
        const url = new URL(link?.getAttribute("href") || "", location.origin);
        if (extractYouTubeVideoId(url.toString()) !== videoId) return;
      } catch { return; }
      domChapters.push({
        title: node.querySelector("h3:not([hidden]), h3")?.textContent?.trim() || "",
        from: parseYouTubeChapterTimestamp(node.querySelector("#time")?.textContent)
      });
    });
  }
  const nativeChapters = normalizeYouTubeChapters(domChapters, duration);
  if (nativeChapters.length) return nativeChapters;

  // Fall back to the creator's timestamp list when native cards are not mounted.
  const descriptionChapters = String(response?.videoDetails?.shortDescription || "")
    .split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*(\d{1,3}:\d{2}(?::\d{2})?)\s+(.+?)\s*$/);
      return match ? [{ from: parseYouTubeChapterTimestamp(match[1]), title: match[2] }] : [];
    });
  const isChapterList = descriptionChapters.length >= 3 && descriptionChapters[0].from === 0 &&
    descriptionChapters.every((item, index) => Number.isFinite(item.from) &&
      (index === 0 || item.from > descriptionChapters[index - 1].from));
  return isChapterList ? normalizeYouTubeChapters(descriptionChapters, duration) : [];
}

function syncYouTubeReadingChapters() {
  if (!isYouTubePage() || !readerSessionState.open ||
      clipState.fetchClipSignature !== computeCurrentClipSignature()) return;
  const chapters = readYouTubeChapters(extractYouTubeVideoId());
  // Do not erase a valid list while YouTube replaces its watch-page nodes.
  if (!chapters.length || (chapters.length === clipState.chapters.length &&
      chapters.every((item, index) => item.title === clipState.chapters[index].title &&
        item.from === clipState.chapters[index].from && item.to === clipState.chapters[index].to))) return;
  clipState.chapters = chapters;
  renderReadingView();
  scheduleReaderLayout();
}

async function refreshYouTubeClipData(videoId, request) {
  if (!videoId) throw new Error("请在 YouTube 视频播放页使用字幕功能。");
  let response = null;
  const deadline = Date.now() + 6000;
  do {
    ensureSubtitleRequestActive(request);
    response = readYouTubePlayerResponse(videoId);
    if (response) break;
    await sleep(150);
  } while (Date.now() < deadline);
  ensureSubtitleRequestActive(request);
  if (!response) throw new Error("YouTube 播放器尚未就绪，请重试。");
  const details = response.videoDetails;
  clipState.bvid = `youtube:${videoId}`;
  clipState.cid = videoId;
  clipState.cidSource = "youtube-player";
  clipState.title = details.title || "YouTube 字幕";
  clipState.author = details.author || "";
  clipState.videoDuration = Number(details.lengthSeconds) || readRuntimeVideoDuration();
  clipState.pageCount = 1;
  clipState.pageIndex = 1;
  clipState.collection = null;
  clipState.chapters = readYouTubeChapters(videoId, response);
  clipState.subtitles = normalizeSubtitleTracks(mapYouTubeCaptionTracks(response, videoId));
  const preferred = pickPreferredSubtitle(clipState.subtitles);
  if (!preferred) {
    if (response.captions?.playerCaptionsTracklistRenderer?.captionTracks?.some((track) =>
      track.kind !== "asr" && !String(track.vssId || "").startsWith("a."))) {
      throw new Error("YouTube 字幕轨道暂时无法读取，请重试。");
    }
    await finishNoSubtitleLoad(request);
    return;
  }
  await tryLoadSubtitleCandidates(buildSubtitleCandidates(clipState.subtitles, preferred),
    request.runId, true, request);
  ensureSubtitleRequestActive(request);
}

function normalizeYouTubeCues(cues, duration = 0) {
  const sorted = cues.filter((cue) => Number.isFinite(cue.from) && cue.from >= 0 && cue.content?.trim())
    .sort((a, b) => a.from - b.from);
  return sorted.map((cue, index) => {
    const next = sorted[index + 1]?.from;
    const end = Number.isFinite(cue.to) && cue.to > cue.from ? cue.to :
      next ?? (duration > cue.from ? duration : cue.from + 5);
    return { from: cue.from, to: next > cue.from ? Math.min(end, next) : end, content: cue.content.trim() };
  });
}

function parseYouTubeTimedText(text, duration = 0) {
  if (!String(text || "").trim()) return [];
  if (String(text).trimStart().startsWith("{")) {
    const data = JSON.parse(text);
    if (!Array.isArray(data.events)) throw new Error("YouTube 字幕格式无效。");
    const cues = [];
    for (const event of data.events) {
      if (!Array.isArray(event.segs) || event.tStartMs === undefined) continue;
      const content = event.segs.map((segment) => segment.utf8 || "").join("");
      const from = Number(event.tStartMs) / 1000;
      const to = from + Number(event.dDurationMs || 0) / 1000;
      if (event.aAppend && cues.length) {
        cues[cues.length - 1].content += content;
        cues[cues.length - 1].to = Math.max(cues[cues.length - 1].to, to);
      } else cues.push({ from, to, content });
    }
    return normalizeYouTubeCues(cues, duration);
  }
  const xml = new DOMParser().parseFromString(readerHtml(text), "text/xml");
  if (xml.querySelector("parsererror") || !["transcript", "timedtext"].includes(xml.documentElement.tagName)) {
    throw new Error("YouTube 字幕格式无效。");
  }
  const cues = [...xml.querySelectorAll("text, body > p")].map((node) => {
    const milliseconds = node.tagName === "p";
    const scale = milliseconds ? 1000 : 1;
    const from = Number(node.getAttribute(milliseconds ? "t" : "start")) / scale;
    return { from, to: from + Number(node.getAttribute(milliseconds ? "d" : "dur")) / scale,
      content: node.textContent };
  });
  return normalizeYouTubeCues(cues, duration);
}

// Both the older transcript renderer and the modern inline-timestamp view
// are delivered by YouTube's own engagement panel loader.
function walkYouTubeData(root, visit) {
  const seen = new Set();
  const walk = (item, depth) => {
    if (!item || typeof item !== "object" || depth > 35 || seen.has(item)) return;
    seen.add(item);
    visit(item);
    Object.values(item).forEach((value) => walk(value, depth + 1));
  };
  walk(root, 0);
}

function parseYouTubeTranscriptData(data, duration = 0) {
  const cues = [];
  walkYouTubeData(data, (item) => {
    const legacy = item.transcriptSegmentRenderer;
    if (legacy?.startMs !== undefined) cues.push({
      from: Number(legacy.startMs) / 1000,
      to: legacy.endMs === undefined ? NaN : Number(legacy.endMs) / 1000,
      content: youtubeText(legacy.snippet)
    });
    const modern = item.transcriptSegmentViewModel;
    if (modern && /^\d+(?::\d{1,2}){1,2}$/.test(modern.timestamp || "")) cues.push({
      from: modern.timestamp.split(":").reduce((seconds, part) => seconds * 60 + Number(part), 0),
      to: NaN, content: youtubeText(modern.simpleText)
    });
    const cue = item.transcriptCueRenderer;
    if (cue?.startOffsetMs !== undefined) cues.push({
      from: Number(cue.startOffsetMs) / 1000,
      to: (Number(cue.startOffsetMs) + Number(cue.durationMs || 0)) / 1000,
      content: youtubeText(cue.cue)
    });
  });
  return normalizeYouTubeCues(cues, duration);
}

function isYouTubeNativeTranscriptLanguageMatch(data, track, requestedLanguage = false) {
  let matches = false;
  let hasSelection = false;
  walkYouTubeData(data, (item) => {
    if ((item.selected === true || item.isSelected === true) && (item.title || item.languageCode)) {
      hasSelection = true;
      if (youtubeText(item.title) === track.nativeLabel || item.languageCode === track.lan) matches = true;
    }
  });
  return hasSelection ? matches : requestedLanguage || (track.nativeTrackCount === 1 && track.nativeDefault);
}

function isYouTubeNativeTranscriptForVideo(data, videoId) {
  const owners = new Set();
  walkYouTubeData(data, (item) => {
    const id = item.transcriptSegmentRenderer?.targetId;
    const match = typeof id === "string" ? id.match(/^([\w-]{11})\./) : null;
    if (match) owners.add(match[1]);
    const endpointId = item.watchEndpoint?.videoId;
    if (typeof endpointId === "string" && /^[\w-]{11}$/.test(endpointId)) owners.add(endpointId);
  });
  return owners.size === 1 && owners.has(videoId);
}

function readCachedYouTubeNativeTranscript(track) {
  const page = getYouTubePageWindow();
  const watch = page.document.querySelector("ytd-watch-flexy");
  const videoId = extractYouTubeVideoId();
  if (watch?.getAttribute("video-id") !== videoId ||
      watch.data?.currentVideoEndpoint?.watchEndpoint?.videoId !== videoId) return [];
  // Both panel versions may retain text while hidden. Modern panels without
  // cue owner IDs are fetched again rather than risking stale text.
  for (const cachedPanel of page.document.querySelectorAll(
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"], ' +
    'ytd-engagement-panel-section-list-renderer[target-id="PAmodern_transcript_view"]'
  )) {
    const cachedData = cachedPanel.data;
    if (isYouTubeNativeTranscriptForVideo(cachedData, videoId) &&
        isYouTubeNativeTranscriptLanguageMatch(cachedData, track)) {
      const body = parseYouTubeTranscriptData(cachedData, clipState.videoDuration);
      if (body.length) return body;
    }
  }
  return [];
}

function isYouTubeTranscriptDataEmpty(data) {
  let empty = false;
  walkYouTubeData(data, (item) => {
    const list = item.transcriptSegmentListRenderer;
    if (Array.isArray(list?.initialSegments) && list.initialSegments.length === 0 &&
        !list.continuations?.length) empty = true;
    // Generic section lists and loading renderers are not evidence of an
    // empty transcript: the modern panel uses them before its cues arrive.
  });
  return empty;
}

async function fetchYouTubeTranscriptData(command, track, request, signal) {
  const page = getYouTubePageWindow();
  const endpoint = command.showEngagementPanelEndpoint;
  const context = page.ytcfg?.get?.("INNERTUBE_CONTEXT");
  if (!context?.client || typeof page.fetch !== "function") {
    throw new Error("YouTube 文字记录请求尚未就绪，请重试。");
  }
  ensureSubtitleRequestActive(request);
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) cancel();
  const timeout = setTimeout(cancel, 8000);
  try {
    const url = new URL("/youtubei/v1/get_panel", page.location.origin);
    url.searchParams.set("prettyPrint", "false");
    const apiKey = page.ytcfg.get("INNERTUBE_API_KEY");
    if (apiKey) url.searchParams.set("key", apiKey);
    const requestContext = JSON.parse(JSON.stringify(context));
    // The modern transcript selects its caption language from the client
    // locale. Always request the selected manual track, not the UI language.
    requestContext.client.hl = track.lan;
    if (command.clickTrackingParams) {
      requestContext.clickTracking = { clickTrackingParams: command.clickTrackingParams };
    }
    // The modern panel's request builder sends panelId and the opaque params
    // from globalConfiguration. These params cannot be used with get_transcript.
    const response = await page.fetch(url.toString(), {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-YouTube-Client-Name": String(page.ytcfg.get("INNERTUBE_CONTEXT_CLIENT_NAME") || 1),
        "X-YouTube-Client-Version": String(requestContext.client.clientVersion || "")
      },
      body: JSON.stringify({
        context: requestContext,
        panelId: endpoint.panelIdentifier || endpoint.identifier.tag,
        params: endpoint.globalConfiguration.params
      })
    });
    ensureSubtitleRequestActive(request);
    if (!response.ok) throw new Error(`YouTube 文字记录请求失败（${response.status}）。`);
    const data = await response.json();
    ensureSubtitleRequestActive(request);
    if (data.error) throw new Error("YouTube 文字记录请求失败，请重试。");
    return data;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}

function buildYouTubeModernTranscriptCommand(videoId) {
  // Modern get_panel params: field 149 wraps videoId (field 1) and the
  // inline transcript presentation (field 3, value 2). IDs are 11 ASCII bytes.
  // Legacy watch pages may expose only the failing get_transcript endpoint.
  const params = getYouTubePageWindow().btoa(
    String.fromCharCode(0xaa, 0x09, 0x0f, 0x0a, 0x0b) + videoId + String.fromCharCode(0x18, 0x02)
  );
  return { showEngagementPanelEndpoint: {
    identifier: { tag: "PAmodern_transcript_view" }, globalConfiguration: { params }
  } };
}

async function fetchYouTubeTranscriptPanel(command, track, request, signal) {
  const data = await fetchYouTubeTranscriptData(command, track, request, signal);
  // Modern responses may omit language menus. The requested client locale
  // identifies their language; any explicit selection must still match.
  if (!isYouTubeNativeTranscriptLanguageMatch(data, track, true)) {
    throw new Error("YouTube 返回的文字记录语言不匹配，请重试。");
  }
  const body = parseYouTubeTranscriptData(data, clipState.videoDuration);
  if (body.length) return { body, state: "ready" };
  return { body: [], state: isYouTubeTranscriptDataEmpty(data) ? "empty" : "pending" };
}

async function readYouTubeNativeTranscript(track, request, signal) {
  const cachedBody = readCachedYouTubeNativeTranscript(track);
  if (cachedBody.length) return { body: cachedBody, state: "ready" };
  const page = getYouTubePageWindow();
  const videoId = extractYouTubeVideoId();
  const deadline = Date.now() + 6000;
  do {
    ensureSubtitleRequestActive(request);
    if (signal?.aborted) return { body: [], state: "cancelled" };
    const watch = page.document.querySelector("ytd-watch-flexy");
    // Player captions can be ready before the watch-page model after reload
    // or SPA navigation. Wait for the current model to avoid stale commands.
    if (watch?.getAttribute("video-id") === videoId &&
        watch.data?.currentVideoEndpoint?.watchEndpoint?.videoId === videoId) {
      let command = null;
      walkYouTubeData(watch.data, (item) => {
        const show = item.showEngagementPanelEndpoint;
        if (!command && show?.identifier?.tag === "PAmodern_transcript_view" &&
            show.globalConfiguration?.params) command = item;
      });
      return fetchYouTubeTranscriptPanel(command || buildYouTubeModernTranscriptCommand(videoId),
        track, request, signal);
    }
    await sleep(150);
  } while (Date.now() < deadline);
  return { body: [], state: "pending" };
}

async function fetchYouTubeSubtitleBody(url) {
  const request = { runId: clipState.fetchRunId, id: subtitleRequestId };
  ensureSubtitleRequestActive(request);
  const track = clipState.subtitles.find((item) => item.subtitleUrl === url);
  if (!track || new URL(url).searchParams.get("v") !== extractYouTubeVideoId()) {
    throw new Error("字幕不属于当前 YouTube 视频。");
  }
  const cachedBody = readCachedYouTubeNativeTranscript(track);
  if (cachedBody.length) return cachedBody;
  const controller = new AbortController();
  const timedTextTask = (async () => {
    const response = await sendRuntimeMessage({ type: "fetch-text", url });
    ensureSubtitleRequestActive(request);
    if (!response?.ok) throw new Error(toReadableText(response?.error, "字幕请求失败"));
    const text = String(response.data || "");
    const body = parseYouTubeTimedText(text, clipState.videoDuration);
    if (body.length) return body;
    const error = new Error(text.trim() ? "字幕正文为空。" : "YouTube 暂未返回字幕正文，请重试。");
    error.code = text.trim() ? "SUBTITLE_EMPTY" : "YOUTUBE_SUBTITLE_PENDING";
    throw error;
  })();
  const nativeTask = (async () => {
    const result = await readYouTubeNativeTranscript(track, request, controller.signal);
    ensureSubtitleRequestActive(request);
    if (result.body.length) return result.body;
    const error = new Error(result.state === "empty" ? "当前视频没有可用字幕。" :
      "YouTube 文字记录暂未就绪，请重试。");
    error.code = result.state === "empty" ? "SUBTITLE_EMPTY" : "YOUTUBE_SUBTITLE_PENDING";
    throw error;
  })();
  try {
    // Start both sources immediately. A native-panel load need not wait for
    // the timedtext timeout, and the first usable body wins.
    const body = await Promise.any([timedTextTask, nativeTask]);
    ensureSubtitleRequestActive(request);
    return body;
  } catch (error) {
    ensureSubtitleRequestActive(request);
    const errors = error.errors || [error];
    console.warn(`[Bilibili Reader] YouTube 字幕来源：${JSON.stringify(errors.map((item) => getErrorMessage(item)))}`);
    if (errors.every(isUnavailableSubtitleError)) {
      const empty = new Error("当前视频没有可用字幕。");
      empty.code = "SUBTITLE_EMPTY";
      throw empty;
    }
    // Empty HTTP text, unsupported fallback paths and timeouts are not proof
    // that an advertised caption track is absent. Keep a retryable error.
    throw errors.find((item) => !isUnavailableSubtitleError(item)) || error;
  } finally {
    controller.abort();
  }
}

function expandYouTubeTranscriptPanel() {
  if (!extractYouTubeVideoId()) return;
  nativeTranscriptState.open = true;
  ensureNativeTranscriptPanel();
  return ensureNativeTranscriptLoaded();
}
