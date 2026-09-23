(() => {
if (globalThis.__BILIBLI_READER_CONTENT_SCRIPT_BOOTSTRAPPED__) {
  return;
}
globalThis.__BILIBLI_READER_CONTENT_SCRIPT_BOOTSTRAPPED__ = true;

const DEFAULT_SETTINGS = {
  noteFolder: "Clippings/Bilibili",
  obsidianApiBaseUrl: "http://127.0.0.1:27123",
  obsidianApiKey: "",
  tags: "clippings,bilibili",
  downloadFormat: "srt",
  includeDateInFilename: true,
  includeHotCommentsInNote: false,
  enablePlayerAiQuickAction: false,
  playerAiQuickPrompt: "整理这期视频的内容，输出结构化总结：主题、核心观点、关键细节、结论与可执行启发。",
  includeTimestampInBody: true,
  enableDebugLogs: false,
  readerTheme: "light",
  readerFontScale: "xl",
  readerFontWeight: "bold",
  readerLetterSpacing: "loose",
  readerLineHeight: "loose",
  readerContentWidth: "medium",
  readerChapterWidthPx: 220,
  readerTranscriptWidthPx: 440,
  readerVideoHeightPx: 0,
  readerChapterVisibility: "show",
  readerTranscriptVisible: true,
  readerTimestampVisible: true,
  nativeTranscriptTheme: "light",
  nativeTranscriptFontSize: 14,
  nativeTranscriptFontWeight: 500,
  readerDefaultsVersion: 3,
  frontmatterFields: [
    "title",
    "url",
    "bvid",
    "cid",
    "author",
    "upload_date",
    "subtitle_lang",
    "created",
    "tags"
  ],
  fixedFrontmatterProperties: [],
  notePlaceholderSections: []
};
const PLAYER_AI_ICON_VARIANT = "badge";

const READER_VERSION = "0.0.6-alpha.4";
const CACHE_KEY_PREFIX = "bilibli_reader_subtitle_cache_";
globalThis.__BILIBLI_READER_CONTENT_SCRIPT_LOADED__ = READER_VERSION;
const state = {
  currentUrl: location.href,
  fetchRunId: 0,
  bvid: "",
  aid: "",
  cid: "",
  cidSource: "",
  pageIndex: 1,
  pageCount: 0,
  pageTitle: "",
  collection: null,
  videoDuration: 0,
  description: "",
  title: "",
  author: "",
  uploadDate: "",
  subtitles: [],
  selectedSubtitleId: "",
  selectedSubtitleUrl: "",
  selectedSubtitleLang: "",
  subtitleBody: [],
  subtitleFetchState: "idle",
  chapters: [],
  hotComments: [],
  markdown: "",
  srt: "",
  txt: "",
  readingViewOpen: false,
  readingNativePageMode: false,
  readingAutoScroll: true,
  readingTheme: "light",
  readingFontScale: "m",
  readingFontWeight: "normal",
  readingLetterSpacing: "normal",
  readingLineHeight: "tight",
  readingContentWidth: "medium",
  readingChapterWidthPx: 220,
  readingTranscriptWidthPx: 440,
  readingVideoHeightPx: 0,
  readingChapterVisible: true,
  readingTranscriptVisible: true,
  readingTimestampVisible: true,
  readingActiveSubtitleIndex: -1,
  readingActiveChapterIndex: -1,
  readingNextScrollBehavior: "smooth",
  readingSyncTimer: 0,
  currentClipSignature: "",
  readingVideoEl: null,
  readingPlayerHost: null,
  readingMainOriginalParent: null,
  readingMainOriginalNextSibling: null,
  readingPlayerAdjustedNodes: [],
  readingPlayerObserver: null,
  readingPlayerMountTimer: 0,
  readingPlayerRetryTimer: 0,
  readingMiniDismissTimer: 0,
  readingControlsHideTimer: 0,
  readingControlsRecoveryTimer: 0,
  readingControlsRecoveryInFlight: false,
  readingControlsLastRecoverAt: 0,
  readingControlsHoverHost: null,
  readingHeaderHoverHost: null,
  readingHeaderHideTimer: 0,
  readingVideoEventsBound: false,
  readingLayoutBound: false,
  uiEventsBound: false,
  runtimeEventsBound: false,
  settingsWatcherBound: false,
  normalPageStateGuardBound: false,
  urlWatcherStarted: false,
  playerAiQuickActionObserver: null,
  playerAiQuickActionLayoutBound: false,
  playerAiQuickActionSyncTimer: 0,
  playerAiQuickActionRevealTimer: 0,
  playerAiQuickActionHideTimer: 0,
  playerAiQuickActionCursorHideTimer: 0,
  playerAiQuickActionSubmitting: false,
  playerAiQuickActionSuppressedUntil: 0,
  pageReaderEntryObserver: null,
  pageReaderEntrySyncTimer: 0,
  nativeTranscriptObserver: null,
  nativeTranscriptSyncTimer: 0,
  nativeTranscriptResizeObserver: null,
  nativeTranscriptObservedPlayer: null,
  nativeTranscriptPlaybackTimer: 0,
  nativeTranscriptLoadPromise: null,
  nativeTranscriptLoadSignature: "",
  nativeTranscriptLoadedSignature: "",
  nativeTranscriptDisplaySignature: "",
  nativeTranscriptAutoFoldedSignature: "",
  nativeTranscriptRenderedKey: "",
  nativeTranscriptOpen: true,
  nativeTranscriptTheme: "light",
  nativeTranscriptFontSize: 14,
  nativeTranscriptFontWeight: 500,
  nativeTranscriptActiveIndex: -1,
  nativeTranscriptManualScrollPauseUntil: 0,
  nativeTranscriptProgrammaticScrollUntil: 0,
  normalPageStateObserver: null,
  readingManualScrollPauseUntil: 0,
  readingProgrammaticScrollUntil: 0,
  readingCollectionSwitchInFlight: false,
  readingViewReady: false,
  statusText: "准备就绪，点击“刷新抓取”开始。",
  messageText: "",
  settings: { ...DEFAULT_SETTINGS }
};

function formatLocalDate(value = Date.now()) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isReaderMode(url = location.href) {
  try {
    return new URL(url).searchParams.get("bilibli_reader") === "1";
  } catch {
    return false;
  }
}

function stripReaderModeUrl(url = location.href) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("bilibli_reader");
    return parsed.toString();
  } catch {
    return url;
  }
}

function replaceReaderModeUrl(nextUrl) {
  const targetUrl = String(nextUrl || "").trim();
  if (!targetUrl || targetUrl === location.href) {
    return;
  }

  try {
    history.replaceState(history.state, "", targetUrl);
    state.currentUrl = location.href;
    state.currentClipSignature = computeCurrentClipSignature(location.href);
  } catch (error) {
    logWarn("[BOC] failed to replace reader mode url", error);
  }
}

function isWatchlaterPage(url = location.href) {
  try {
    return new URL(url).pathname.replace(/\/+$/, "") === "/list/watchlater";
  } catch {
    return false;
  }
}

function getReaderContentMaxPx() {
  if (state.readingContentWidth === "compact") {
    return 720;
  }
  if (state.readingContentWidth === "narrow") {
    return 820;
  }
  if (state.readingContentWidth === "wide") {
    return 1120;
  }
  if (state.readingContentWidth === "full") {
    return 1280;
  }
  return 980;
}

function getReaderPagePaddingPx() {
  return Math.min(32, Math.max(16, window.innerWidth * 0.028));
}

function getReaderMainWidthLimit() {
  const pagePadding = getReaderPagePaddingPx();
  if (window.innerWidth > 1180) {
    const { transcriptWidth } = getEffectiveReaderColumnWidths();
    const gap = Math.min(24, Math.max(16, window.innerWidth * 0.014));
    const availableWidth = window.innerWidth - pagePadding * 2 - transcriptWidth - gap;
    const heightLimitedWidth = Math.max(420, (window.innerHeight - 190) * (16 / 9));
    return Math.max(420, Math.min(availableWidth, heightLimitedWidth));
  }
  return Math.max(320, Math.min(getReaderContentMaxPx(), window.innerWidth - pagePadding * 2));
}

function normalizeReaderColumnWidth(value, fallback, min, max) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(Math.min(max, Math.max(min, parsed))) : fallback;
}

function normalizeReaderVideoHeight(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(Math.min(900, Math.max(240, parsed)));
}

function getEffectiveReaderColumnWidths() {
  const pagePadding = getReaderPagePaddingPx();
  const gap = Math.min(24, Math.max(16, window.innerWidth * 0.014));
  const minChapterWidth = 140;
  const minTranscriptWidth = 280;
  const minVideoWidth = 420;
  const chapterWidth = normalizeReaderColumnWidth(state.readingChapterWidthPx, 220, minChapterWidth, 360);
  let transcriptWidth = normalizeReaderColumnWidth(state.readingTranscriptWidthPx, 440, minTranscriptWidth, 720);
  const availableForTranscript = Math.max(
    minTranscriptWidth,
    window.innerWidth - pagePadding * 2 - gap - minVideoWidth
  );
  transcriptWidth = Math.min(transcriptWidth, availableForTranscript);

  return {
    chapterWidth: Math.round(chapterWidth),
    transcriptWidth: Math.round(transcriptWidth),
    gap
  };
}

function applyReaderColumnLayout() {
  const readingView = byId(ids.readingView);
  if (!readingView) return;
  const { chapterWidth, transcriptWidth, gap } = getEffectiveReaderColumnWidths();
  const mainWidth = getReaderMainWidthLimit();
  const centerOffset = Math.round(-(transcriptWidth + gap) / 2);
  [document.documentElement, document.body, readingView].forEach((node) => {
    node.style.setProperty("--blr-reader-rail-width", `${chapterWidth}px`);
    node.style.setProperty("--blr-reader-transcript-width", `${transcriptWidth}px`);
    node.style.setProperty("--blr-reader-center-offset", `${centerOffset}px`);
    node.style.setProperty("--blr-reader-main-width", `${Math.round(mainWidth)}px`);
    if (state.readingVideoHeightPx > 0) {
      node.style.setProperty(
        "--blr-reader-player-rendered-height",
        `${Math.round(state.readingVideoHeightPx)}px`
      );
    }
  });
  document
    .getElementById(ids.readingChapterResizeHandle)
    ?.setAttribute("aria-valuenow", String(state.readingVideoHeightPx || 0));
  document.getElementById(ids.readingTranscriptResizeHandle)?.setAttribute("aria-valuenow", String(transcriptWidth));
}

function updateReaderChapterRailPosition(rect = null) {
  const readingView = document.getElementById(ids.readingView);
  if (!readingView || window.innerWidth <= 1180) return;

  const playerNode = getReaderPlayerWrapNode() || state.readingPlayerHost;
  const playerRect = rect || playerNode?.getBoundingClientRect?.();
  if (!playerRect || !(playerRect.width > 0) || !(playerRect.height > 0)) return;

  [document.documentElement, document.body, readingView].forEach((node) => {
    node.style.setProperty("--blr-reader-player-left", `${Math.round(playerRect.left)}px`);
    node.style.setProperty("--blr-reader-player-top", `${Math.round(playerRect.top)}px`);
    node.style.setProperty("--blr-reader-player-bottom", `${Math.round(playerRect.bottom)}px`);
    node.style.setProperty("--blr-reader-player-width", `${Math.round(playerRect.width)}px`);
  });
  document
    .getElementById(ids.readingChapterResizeHandle)
    ?.setAttribute("aria-valuenow", String(Math.round(playerRect.height)));
}

function clearNativeReaderFloatingStyles(playerHost = state.readingPlayerHost) {
  if (!state.readingNativePageMode || !playerHost) {
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

function getReaderPlayerWrapNode(playerHost = state.readingPlayerHost) {
  return (
    playerHost?.closest?.("#playerWrap") ||
    playerHost?.closest?.(".player-wrap") ||
    document.getElementById("playerWrap") ||
    document.querySelector(".player-wrap")
  );
}

function hasNativeReaderPlayerLayoutIssue(playerHost = state.readingPlayerHost) {
  if (!state.readingNativePageMode || !playerHost) {
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

function normalizeReaderTheme(value) {
  return value === "dark" || value === "paper" ? value : "light";
}

function normalizeReaderFontScale(value) {
  return ["xs", "s", "m", "l", "xl"].includes(value) ? value : "xl";
}

function normalizeReaderFontWeight(value) {
  return ["light", "regular", "normal", "semibold", "bold"].includes(value) ? value : "bold";
}

function normalizeNativeTranscriptFontSize(value) {
  const size = Number(value);
  return [12, 14, 16, 18, 20, 22].includes(size) ? size : 14;
}

function normalizeNativeTranscriptTheme(value) {
  return ["light", "dark", "paper"].includes(value) ? value : "light";
}

function normalizeNativeTranscriptFontWeight(value) {
  const weight = Number(value);
  return [300, 400, 500, 600, 700].includes(weight) ? weight : 500;
}

function normalizeReaderLetterSpacing(value) {
  return ["tighter", "tight", "normal", "relaxed", "loose"].includes(value) ? value : "loose";
}

function normalizeReaderLineHeight(value) {
  return ["compact", "tight", "normal", "relaxed", "loose"].includes(value) ? value : "loose";
}

function normalizeReaderContentWidth(value) {
  return ["compact", "narrow", "medium", "wide", "full"].includes(value) ? value : "medium";
}

function normalizeReaderTranscriptVisible(value) {
  return value !== false;
}

function normalizeReaderTimestampVisible(value) {
  return value !== false;
}

function shouldDebugLog() {
  return Boolean(state.settings?.enableDebugLogs);
}

function logInfo(...args) {
  if (shouldDebugLog()) {
    console.info(...args);
  }
}

function logWarn(...args) {
  if (shouldDebugLog()) {
    console.warn(...args);
  }
}

function installReaderDebugHelpers() {
  const snapshotReader = (label = "manual") => createReaderDebugSnapshot(label);
  globalThis.__BILIBLI_READER_DEBUG_SNAPSHOT__ = snapshotReader;
  globalThis.__BILIBLI_READER_DEBUG__ = {
    ...(globalThis.__BILIBLI_READER_DEBUG__ || {}),
    snapshotReader
  };
}

const ids = {
  root: "blr-root",
  panel: "blr-panel",
  status: "blr-status",
  meta: "blr-meta",
  subtitleSelect: "blr-subtitle-select",
  preview: "blr-preview",
  message: "blr-message",
  copyBtn: "blr-copy-btn",
  downloadBtn: "blr-download-btn",
  sendBtn: "blr-send-btn",
  refreshBtn: "blr-refresh-btn",
  closeBtn: "blr-close-btn",
  settingsBtn: "blr-settings-btn",
  readingView: "blr-reading-view",
  readingPageTitle: "blr-reading-page-title",
  readingEpisodeTitle: "blr-reading-episode-title",
  readingCollectionNav: "blr-reading-collection-nav",
  readingCollectionList: "blr-reading-collection-list",
  readingPlayerSlot: "blr-reading-player-slot",
  readingStatus: "blr-reading-status",
  readingCloseBtn: "blr-reading-close-btn",
  readingRefreshBtn: "blr-reading-refresh-btn",
  readingChapterResizeHandle: "blr-reading-chapter-resize-handle",
  readingTranscriptResizeHandle: "blr-reading-transcript-resize-handle",
  readingMeta: "blr-reading-meta",
  readingChapterList: "blr-reading-chapters",
  readingTranscriptList: "blr-reading-transcript",
  readingTranscriptTailSpacer: "blr-reading-tail-spacer",
  readingTranscriptReturnButton: "blr-reading-transcript-return",
  readingTranscriptThemeButton: "blr-reading-transcript-theme",
  readingTranscriptQuickSubtitleSelect: "blr-reading-transcript-language",
  readingTranscriptQuickFontSizeSelect: "blr-reading-transcript-font-size",
  readingTranscriptQuickFontWeightSelect: "blr-reading-transcript-font-weight",
  nativeTranscriptPanel: "blr-native-transcript-panel",
  nativeTranscriptHeader: "blr-native-transcript-header",
  nativeTranscriptBody: "blr-native-transcript-body",
  nativeTranscriptControls: "blr-native-transcript-controls",
  nativeTranscriptReturnButton: "blr-native-transcript-return",
  nativeTranscriptThemeButton: "blr-native-transcript-theme",
  nativeTranscriptSelect: "blr-native-transcript-select",
  nativeTranscriptFontSizeSelect: "blr-native-transcript-font-size",
  nativeTranscriptFontWeightSelect: "blr-native-transcript-font-weight",
  nativeTranscriptList: "blr-native-transcript-list"
};

init();

function init() {
  logInfo(`[Bilibili Reader] content script loaded, version=${READER_VERSION}`);
  ensureUiReady({ forceRecreate: true });
  installReaderDebugHelpers();

  const shouldEnterReaderMode = isReaderMode();
  if (shouldEnterReaderMode) {
    document.documentElement.setAttribute("data-blr-reader-mode", "1");
    document.body.setAttribute("data-blr-reader-mode", "1");
  } else {
    clearReaderModePageState();
  }

  bindRuntimeEvents();
  bindSettingsWatcher();
  bindNormalPageStateGuard();
  bindPlayerAiQuickActionLayoutEvents();
  startPageReaderEntryObserver();
  startNativeTranscriptPanelObserver();
  startUrlWatcher();
  getSettings().then((settings) => {
    state.settings = settings;
    hydrateReaderStateFromSettings(settings);
    hydrateNativeTranscriptSettings(settings);
    applyReadingViewPresentation();
    startPlayerAiQuickActionObserver();
    schedulePlayerAiQuickActionSync();
    scheduleNativeTranscriptPanelSync(0);
    if (shouldEnterReaderMode) {
      enterReaderMode().catch((error) => {
        renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
      });
    }
  });
}

function ensureUiReady({ forceRecreate = false } = {}) {
  const existingRoot = document.getElementById(ids.root);
  if (existingRoot && forceRecreate) {
    existingRoot.remove();
    state.uiEventsBound = false;
  }

  let root = document.getElementById(ids.root);
  if (!root) {
    root = document.createElement("div");
    root.id = ids.root;
    root.innerHTML = buildUiHtml();
    document.body.appendChild(root);
    state.uiEventsBound = false;
  }

  if (!state.uiEventsBound) {
    bindUiEvents();
    state.uiEventsBound = true;
  }
}

function clearReaderModePageState() {
  document.documentElement.removeAttribute("data-blr-reader-mode");
  document.documentElement.removeAttribute("data-blr-reader-line-height");
  document.documentElement.removeAttribute("data-blr-reader-theme");
  document.documentElement.removeAttribute("data-blr-reader-font-scale");
  document.documentElement.removeAttribute("data-blr-reader-font-weight");
  document.documentElement.removeAttribute("data-blr-reader-letter-spacing");
  document.documentElement.removeAttribute("data-blr-reader-content-width");
  document.documentElement.removeAttribute("data-blr-reader-chapter-visibility");
  document.documentElement.removeAttribute("data-blr-reader-has-chapters");
  document.documentElement.removeAttribute("data-blr-reader-transcript-visible");
  document.documentElement.removeAttribute("data-blr-reader-timestamp-visible");
  document.documentElement.removeAttribute("data-blr-reader-transcript-mode");
  document.body.removeAttribute("data-blr-reader-mode");
  document.body.removeAttribute("data-blr-reader-line-height");
  document.body.removeAttribute("data-blr-reader-font-weight");
  document.body.removeAttribute("data-blr-reader-transcript-visible");
  document.body.removeAttribute("data-blr-reader-timestamp-visible");
  document.body.removeAttribute("data-blr-reader-transcript-mode");
  document.body.removeAttribute("data-blr-reading-active");
}

function startPageReaderEntryObserver() {
  ensurePageReaderEntryButton();
  if (state.pageReaderEntryObserver) {
    return;
  }

  state.pageReaderEntryObserver = new MutationObserver(() => {
    schedulePageReaderEntrySync();
  });
  state.pageReaderEntryObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function schedulePageReaderEntrySync(delayMs = 120) {
  if (state.pageReaderEntrySyncTimer) {
    return;
  }
  state.pageReaderEntrySyncTimer = window.setTimeout(() => {
    state.pageReaderEntrySyncTimer = 0;
    ensurePageReaderEntryButton();
  }, delayMs);
}

function ensurePageReaderEntryButton() {
  if (!extractBvid(location.href) && !isWatchlaterPage()) {
    return;
  }

  const host = document.querySelector(
    "#viewbox_report, .video-info-container, .video-info-title"
  );
  if (!host) {
    return;
  }

  let button = document.getElementById("blr-page-reader-entry");
  if (button && button.parentElement === host) {
    return;
  }
  if (button) {
    button.parentElement?.classList.remove("blr-page-reader-entry-host");
    button.remove();
  }

  host.classList.add("blr-page-reader-entry-host");
  button = document.createElement("button");
  button.id = "blr-page-reader-entry";
  button.type = "button";
  button.title = "进入 Bilibili Reader 阅读模式";
  button.setAttribute("aria-label", "进入阅读模式");
  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h4a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H7a2.5 2.5 0 0 0-2.5 2.5z"></path>
      <path d="M19.5 5.5A2.5 2.5 0 0 0 17 3h-1"></path>
      <path d="M19.5 5.5v13A2.5 2.5 0 0 0 17 16h-1"></path>
    </svg>
    <span>阅读</span>
  `;
  button.addEventListener("click", onPageReaderEntryClick);
  host.appendChild(button);
}

function onPageReaderEntryClick(event) {
  event.preventDefault();
  event.stopPropagation();
  if (state.readingViewOpen) {
    return;
  }

  const button = event.currentTarget;
  button.disabled = true;
  button.classList.add("is-loading");
  const readerUrl = new URL(location.href);
  readerUrl.searchParams.set("bilibli_reader", "1");
  replaceReaderModeUrl(readerUrl.toString());
  document.documentElement.setAttribute("data-blr-reader-mode", "1");
  document.body.setAttribute("data-blr-reader-mode", "1");
  state.playerAiQuickActionSuppressedUntil = Date.now() + 2500;
  removePlayerAiQuickActionButton();
  ensureUiReady();

  enterReaderMode().catch((error) => {
    button.disabled = false;
    button.classList.remove("is-loading");
    logWarn("[Bilibili Reader] page entry failed", error);
    renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
  });
}
