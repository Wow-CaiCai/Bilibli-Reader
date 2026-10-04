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
