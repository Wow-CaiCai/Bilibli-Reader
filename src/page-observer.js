// One observer for the site's integration points. Ancestors are watched only
// for direct replacements; comments and recommendation subtrees are excluded.
const readerPageSubscriptions = new Set();
const readerPageScopes = {
  native: {
    roots: "#danmukuBox, .danmaku-box, .up-panel-container, #playerWrap, #bilibili-player, .bpx-player-container",
    required: "#danmukuBox, .danmaku-box",
    changes: "#danmukuBox, .danmaku-box, .up-panel-container, .members-info-container, #blr-native-transcript-panel, video, #playerWrap, #bilibili-player, .bpx-player-container",
    subtree: false
  },
  player: {
    roots: "#playerWrap, #bilibili-player, .bpx-player-container, .bpx-player-mini-warp",
    changes: "video, #playerWrap, #bilibili-player, .bpx-player-container, .bpx-player-video-area, .bpx-player-control-wrap, .bpx-player-mini-close, .bpx-player-mini-warp",
    subtree: true
  }
};
let readerPageObserver = null;
let readerPageDiscoveryTimer = 0;
let readerPageRefreshQueued = false;
let readerPageObservedTargets = new Map();
let readerPageMissingScopes = new Set();
let readerPageEnabledScopes = new Set();

if (isYouTubePage()) {
  readerPageScopes.player = {
    roots: "ytd-watch-flexy #player, #movie_player",
    changes: "ytd-watch-flexy, #player, #movie_player, video",
    subtree: true
  };
  readerPageScopes.native = {
    roots: "ytd-watch-flexy #secondary-inner, #movie_player",
    required: "ytd-watch-flexy #secondary-inner #related",
    changes: "#secondary-inner, #related, #movie_player, video, #blr-native-transcript-panel",
    subtree: false
  };
}

function subscribeReaderPageChanges(scope, callback) {
  const subscription = { scope, callback };
  readerPageSubscriptions.add(subscription);
  if (!readerPageObserver) readerPageObserver = new MutationObserver(handleReaderPageChanges);
  refreshReaderPageScopes();
  return () => {
    readerPageSubscriptions.delete(subscription);
    refreshReaderPageScopes();
  };
}

function readerMutationTouches(record, selector) {
  const target = record.target instanceof Element ? record.target : record.target.parentElement;
  // Own content renders must not feed back into repair. An external removal
  // still has a site-owned parent and matches the removed integration node.
  if (target?.closest("#blr-root, #blr-reading-inline-host, [data-blr-extension-node]")) return false;
  for (const nodes of [record.addedNodes, record.removedNodes]) {
    for (const node of nodes) {
      if (node instanceof Element && (node.matches(selector) || node.querySelector(selector))) return true;
    }
  }
  return false;
}

function isReaderPageScopeEnabled(scope) {
  if (scope === "player") return isReaderMode();
  if (scope === "native") return isSupportedTranscriptPage() && !isReaderMode();
  return false;
}

function hasDetachedReaderPageTarget() {
  for (const node of readerPageObservedTargets.keys()) {
    if (!node.isConnected) return true;
  }
  return false;
}

function handleReaderPageChanges(records) {
  const changedScopes = new Set();
  let topologyChanged = hasDetachedReaderPageTarget();
  for (const subscription of readerPageSubscriptions) {
    if (!isReaderPageScopeEnabled(subscription.scope)) continue;
    if (changedScopes.has(subscription.scope)) continue;
    if (records.some((record) => readerMutationTouches(record, readerPageScopes[subscription.scope].changes))) {
      changedScopes.add(subscription.scope);
    }
    if (!topologyChanged && records.some((record) =>
      readerMutationTouches(record, readerPageScopes[subscription.scope].roots))) topologyChanged = true;
  }
  for (const subscription of readerPageSubscriptions) {
    if (changedScopes.has(subscription.scope)) subscription.callback();
  }
  // A control or subtitle content update does not change the observed roots.
  // Removed ancestors contain those roots, or disconnect an observed target,
  // so unknown site wrappers still take the repair/rebind path.
  if (topologyChanged && !readerPageRefreshQueued) {
    readerPageRefreshQueued = true;
    queueMicrotask(() => {
      readerPageRefreshQueued = false;
      refreshReaderPageScopes();
    });
  }
}

function scheduleReaderPageDiscovery() {
  if (readerPageDiscoveryTimer || !readerPageMissingScopes.size) return;
  readerPageDiscoveryTimer = window.setTimeout(() => {
    readerPageDiscoveryTimer = 0;
    const discovered = new Set();
    let enabledChanged = false;
    for (const scope of readerPageEnabledScopes) {
      if (!isReaderPageScopeEnabled(scope)) enabledChanged = true;
    }
    // Existing roots and their ancestors remain observed while we only search
    // for hosts that have not arrived yet.
    for (const scope of readerPageMissingScopes) {
      if (!isReaderPageScopeEnabled(scope)) continue;
      const config = readerPageScopes[scope];
      if (document.querySelector(config.required || config.roots)) discovered.add(scope);
    }
    const detached = hasDetachedReaderPageTarget();
    if (discovered.size || detached || enabledChanged) refreshReaderPageScopes();
    else scheduleReaderPageDiscovery();
    for (const subscription of readerPageSubscriptions) {
      if (discovered.has(subscription.scope) && isReaderPageScopeEnabled(subscription.scope)) subscription.callback();
    }
  }, 1500);
}

function refreshReaderPageScopes() {
  readerPageObserver?.disconnect();
  window.clearTimeout(readerPageDiscoveryTimer);
  readerPageDiscoveryTimer = 0;
  readerPageObservedTargets = new Map();
  readerPageMissingScopes = new Set();
  readerPageEnabledScopes = new Set();
  if (!readerPageObserver || !readerPageSubscriptions.size || !document.body) return;
  const targets = new Map();
  const scopes = new Set([...readerPageSubscriptions].map((item) => item.scope).filter(isReaderPageScopeEnabled));
  const missingScopes = new Set();
  const watch = (node, subtree = false) => {
    if (node) targets.set(node, Boolean(targets.get(node) || subtree));
  };
  watch(document.body);
  document.querySelectorAll("#app, #video-page-app, #biliMain, #mirror-vdcon, .video-container-v1, .left-container, .right-container-inner")
    .forEach((node) => watch(node));
  for (const scope of scopes) {
    const config = readerPageScopes[scope];
    const roots = document.querySelectorAll(config.roots);
    if (!document.querySelector(config.required || config.roots)) missingScopes.add(scope);
    for (const root of roots) {
      watch(root, config.subtree || root.matches(".up-panel-container, #playerWrap, #bilibili-player, .bpx-player-container"));
      for (let parent = root.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        watch(parent);
      }
    }
  }
  for (const [target, subtree] of targets) {
    readerPageObserver.observe(target, { childList: true, subtree });
  }
  readerPageObservedTargets = targets;
  readerPageMissingScopes = missingScopes;
  readerPageEnabledScopes = scopes;
  // During initial loading, a missing host can arrive below an unobserved
  // wrapper. Discovery stops as soon as every subscribed host is present.
  scheduleReaderPageDiscovery();
}
