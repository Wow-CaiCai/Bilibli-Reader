let readerHtmlPolicy = null;

function readerHtml(html) {
  // YouTube enforces Trusted Types. Keep this policy private to the reader;
  // generated markup still escapes every video/subtitle-derived string.
  const types = isYouTubePage() ? getYouTubePageWindow().trustedTypes : null;
  if (!types) return html;
  if (!readerHtmlPolicy) readerHtmlPolicy = types.createPolicy("bilibli-reader", {
    createHTML: (value) => value
  });
  return readerHtmlPolicy.createHTML(html);
}

function normalizeSubtitleUrl(url) {
  if (!url) {
    return "";
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url.replace(/^\/+/, "")}`;
}

function formatCompactTimestamp(seconds, withHours) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const hour = Math.floor(safe / 3600);
  const minute = Math.floor((safe % 3600) / 60);
  const second = safe % 60;

  if (withHours) {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(
      second
    ).padStart(2, "0")}`;
  }

  const totalMinutes = Math.floor(safe / 60);
  return `${String(totalMinutes).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

const subtitleLanguageSelectCache = new WeakMap();

function syncSubtitleLanguageSelect(select) {
  if (!select) return;
  const selectedUrlKey = normalizeSubtitleUrlForCache(clipState.selectedSubtitleUrl);
  const previous = subtitleLanguageSelectCache.get(select);
  if (!previous || previous.tracks !== clipState.subtitles ||
      previous.selectedId !== clipState.selectedSubtitleId || previous.selectedUrl !== selectedUrlKey) {
    select.innerHTML = readerHtml(clipState.subtitles.length
      ? clipState.subtitles.map((item) => {
          const selected =
            (clipState.selectedSubtitleId && String(item.id) === String(clipState.selectedSubtitleId)) ||
            normalizeSubtitleUrlForCache(item.subtitleUrl) === selectedUrlKey;
          return `<option value="${escapeHtml(item.subtitleUrl)}" data-id="${escapeHtml(
            item.id
          )}" data-lang="${escapeHtml(item.lanDoc || item.lan || "unknown")}"${
            selected ? " selected" : ""
          }>${escapeHtml(item.lanDoc || item.lan || "字幕")}</option>`;
        }).join("")
      : '<option value="">字幕</option>');
    subtitleLanguageSelectCache.set(select, {
      tracks: clipState.subtitles, selectedId: clipState.selectedSubtitleId, selectedUrl: selectedUrlKey
    });
  }
  const disabled = clipState.subtitles.length === 0 || clipState.subtitleFetchState === "loading";
  if (select.disabled !== disabled) select.disabled = disabled;
  syncSubtitleSelection(select);
}

// A failed request keeps the last committed language. Restore the control
// separately from its options cache; user selection does not change attributes.
function syncSubtitleSelection(select) {
  if (clipState.subtitleFetchState === "loading") return;
  const option = select.querySelector("option[selected]");
  const index = option?.index ?? 0;
  if (select.selectedIndex !== index) select.selectedIndex = index;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

init();

})();
