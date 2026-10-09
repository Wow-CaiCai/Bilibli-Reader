(() => {
if (globalThis.__BILIBLI_READER_CONTENT_SCRIPT_BOOTSTRAPPED__) {
  return;
}
globalThis.__BILIBLI_READER_CONTENT_SCRIPT_BOOTSTRAPPED__ = true;

const DEFAULT_SETTINGS = {
  enableDebugLogs: false,
  readerTheme: "light",
  readerFontScale: "xl",
  readerFontWeight: "bold",
  readerLetterSpacing: "loose",
  readerLineHeight: "loose",
  readerContentWidth: "medium",
  readerChapterWidthPx: 220,
  readerTranscriptWidthPx: 440,
  readerTranscriptVisible: true,
  nativeTranscriptTheme: "light",
  nativeTranscriptFontSize: 14,
  nativeTranscriptFontWeight: 500,
  readerDefaultsVersion: 3
};

const READER_VERSION = "0.0.10-alpha.19";
const CACHE_KEY_PREFIX = "bilibli_reader_subtitle_cache_";
globalThis.__BILIBLI_READER_CONTENT_SCRIPT_LOADED__ = READER_VERSION;
// Data and request identity for the current video.
const clipState = {
  fetchRunId: 0,
  fetchClipSignature: "",
  bvid: "",
  aid: "",
  cid: "",
  cidSource: "",
  pageIndex: 1,
  pageCount: 0,
  pageTitle: "",
  collection: null,
  videoDuration: 0,
  title: "",
  author: "",
  uploadDate: "",
  subtitles: [],
  selectedSubtitleId: "",
  selectedSubtitleUrl: "",
  selectedSubtitleLang: "",
  subtitleBody: [],
  subtitleRevision: 0,
  subtitleFetchState: "idle",
  chapters: [],
  currentClipSignature: ""
};

// Transient reader lifecycle, playback following, and layout scheduling.
const readerSessionState = {
  open: false,
  id: 0,
  mountTask: null,
  layoutFrame: 0,
  layoutDirty: false,
  resizeObserver: null,
  observedPlayer: null,
  resizeCleanup: null,
  transition: null,
  closing: false,
  transcriptAutoWidth: false,
  activeSubtitleIndex: -1,
  activeChapterIndex: -1,
  nextScrollBehavior: "smooth",
  syncTimer: 0,
  playerMountTimer: 0,
  playerRetryTimer: 0,
  manualScrollPauseUntil: 0,
  programmaticScrollUntil: 0,
  collectionSwitchInFlight: false,
  ready: false
};

// Persisted settings and their normalized presentation values.
const readerPreferences = {
  autoScroll: true,
  theme: "light",
  fontScale: "m",
  fontWeight: "normal",
  letterSpacing: "normal",
  lineHeight: "tight",
  contentWidth: "medium",
  chapterWidthPx: 220,
  transcriptWidthPx: 440,
  chapterVisible: true,
  transcriptVisible: true,
  nativeTheme: "light",
  nativeFontSize: 14,
  nativeFontWeight: 500,
  settings: { ...DEFAULT_SETTINGS }
};

// Native player references and compatibility resources owned by the reader.
const readerPlayerState = {
  videoEl: null,
  host: null,
  adjustedNodes: [],
  observer: null,
  miniDismissTimer: 0,
  controlsHideTimer: 0,
  controlsRecoveryTimer: 0,
  controlsRecoveryInFlight: false,
  controlsLastRecoverAt: 0,
  controlsHoverHost: null,
  videoEventsBound: false,
  layoutBound: false
};

// Normal-page transcript panel lifecycle and playback following.
const nativeTranscriptState = {
  observer: null,
  syncTimer: 0,
  resizeObserver: null,
  observedPlayer: null,
  playbackTimer: 0,
  loadPromise: null,
  loadSignature: "",
  loadedSignature: "",
  displaySignature: "",
  open: true,
  activeIndex: -1,
  manualScrollPauseUntil: 0,
  programmaticScrollUntil: 0
};

// Page-level bindings, entry controls, and the reader DOM presentation.
const uiState = {
  mainOriginalParent: null,
  mainOriginalNextSibling: null,
  headerHoverHost: null,
  headerHideTimer: 0,
  uiEventsBound: false,
  runtimeEventsBound: false,
  settingsWatcherBound: false,
  normalPageStateGuardBound: false,
  urlWatcherStarted: false,
  normalPageStateObserver: null,
  collectionSnapshot: null
};

function formatLocalDate(value = Date.now()) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isReaderMode(url = location.href) {
  if (isYouTubePage(url) && !extractYouTubeVideoId(url)) return false;
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
    clipState.currentClipSignature = computeCurrentClipSignature(location.href);
    refreshReaderPageScopes();
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

function shouldDebugLog() {
  return Boolean(readerPreferences.settings?.enableDebugLogs);
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
  readingView: "blr-reading-view",
  readingPageTitle: "blr-reading-page-title",
  readingEpisodeTitle: "blr-reading-episode-title",
  readingCollectionNav: "blr-reading-collection-nav",
  readingCollectionList: "blr-reading-collection-list",
  readingStatus: "blr-reading-status",
  readingCloseBtn: "blr-reading-close-btn",
  readingTranscriptResizeHandle: "blr-reading-transcript-resize-handle",
  readingMeta: "blr-reading-meta",
  readingChapterList: "blr-reading-chapters",
  readingTranscriptList: "blr-reading-transcript",
  readingTranscriptTailSpacer: "blr-reading-tail-spacer",
  readingTranscriptReaderButton: "blr-reading-transcript-reader",
  readingTranscriptReturnButton: "blr-reading-transcript-return",
  readingTranscriptThemeButton: "blr-reading-transcript-theme",
  readingTranscriptQuickSubtitleSelect: "blr-reading-transcript-language",
  readingTranscriptQuickFontSizeSelect: "blr-reading-transcript-font-size",
  readingTranscriptQuickFontWeightSelect: "blr-reading-transcript-font-weight",
  nativeTranscriptPanel: "blr-native-transcript-panel",
  nativeTranscriptHeader: "blr-native-transcript-header",
  nativeTranscriptBody: "blr-native-transcript-body",
  nativeTranscriptControls: "blr-native-transcript-controls",
  nativeTranscriptReaderButton: "blr-native-transcript-reader",
  nativeTranscriptReturnButton: "blr-native-transcript-return",
  nativeTranscriptThemeButton: "blr-native-transcript-theme",
  nativeTranscriptSelect: "blr-native-transcript-select",
  nativeTranscriptFontSizeSelect: "blr-native-transcript-font-size",
  nativeTranscriptFontWeightSelect: "blr-native-transcript-font-weight",
  nativeTranscriptList: "blr-native-transcript-list"
};


function init() {
  // document-idle 不代表 B 站已完成异步挂载；提前插入节点会破坏 Vue 的 SSR hydration。
  // 等待服务端渲染标记移除后再初始化，也兼容没有 SSR 标记的稍后再看页面。
  if (
    document.readyState === "loading" ||
    !document.body ||
    document.querySelector(
      '#app[data-server-rendered="true"], #video-page-app[data-server-rendered="true"]'
    )
  ) {
    window.setTimeout(init, 50);
    return;
  }

  // A full reload starts in the native view. Preserve other query parameters,
  // the hash and history state, without navigating or restoring a reader session.
  if (isReaderMode() && performance.getEntriesByType("navigation")[0]?.type === "reload") {
    history.replaceState(history.state, "", stripReaderModeUrl());
  }

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

  startNativeTranscriptPanelObserver();
  startUrlWatcher();
  getSettings().then((settings) => {
    readerPreferences.settings = settings;
    hydrateReaderStateFromSettings(settings);
    hydrateNativeTranscriptSettings(settings);
    applyReadingViewPresentation();

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
    uiState.uiEventsBound = false;
  }

  let root = document.getElementById(ids.root);
  if (!root) {
    root = document.createElement("div");
    root.id = ids.root;
    root.innerHTML = readerHtml(buildUiHtml());
    document.body.appendChild(root);
    uiState.uiEventsBound = false;
  }

  if (!uiState.uiEventsBound) {
    bindUiEvents();
    uiState.uiEventsBound = true;
  }
}

function clearReaderPresentationAttributes() {
  const attributes = [
    "mode", "platform", "theme", "font-scale", "font-weight", "letter-spacing", "line-height",
    "content-width", "chapter-visibility", "has-chapters", "transcript-visible",
    "timestamp-visible", "transcript-mode", "resizing"
  ];
  [document.documentElement, document.body].forEach((node) => {
    attributes.forEach((name) => node.removeAttribute(`data-blr-reader-${name}`));
  });
  document.body.removeAttribute("data-blr-reading-active");
}

function clearReaderModePageState() {
  clearReaderPresentationAttributes();
}

function onTranscriptReaderEntryClick(event) {
  event.preventDefault();
  event.stopPropagation();
  if (readerSessionState.open) {
    return;
  }

  const button = event.currentTarget;
  button.disabled = true;
  button.classList.add("is-loading");
  ensureUiReady();

  enterReaderMode({ animate: true }).catch((error) => {
    if (readerSessionState.open) {
      readerSessionState.transition?.cancel();
      replaceReaderModeUrl(stripReaderModeUrl());
      closeReadingView();
    }
    button.disabled = false;
    button.classList.remove("is-loading");
    logWarn("[Bilibili Reader] transcript entry failed", error);
    renderReadingStatus(`阅读视图启动失败：${getErrorMessage(error)}`);
  });
}
