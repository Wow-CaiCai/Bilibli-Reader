from __future__ import annotations

import argparse
import base64
import json
from pathlib import Path
import re
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent.parent
SOURCE_PATHS = tuple(
    ROOT / "src" / name
    for name in (
        "bootstrap.js",
        "youtube-data.js",
        "page-observer.js",
        "reader-session.js",
        "reader-layout.js",
        "native-transcript.js",
        "app.js",
        "reading-view.js",
        "reader-player.js",
        "reader-playback.js",
        "bilibili-data.js",
        "utils.js",
    )
)
STYLE_PATHS = (
    ROOT / "src" / "styles" / "panel.css",
    ROOT / "src" / "styles" / "reading-view.css",
)
ICON_PATH = ROOT / "icons" / "icon48.png"
OUTPUT_PATH = ROOT / "Bilibli-Reader.user.js"
TEMPLATE_PATH = ROOT / "scripts" / "userscript.template.js"
README_PATH = ROOT / "README.md"
SCRIPT_CAT_README_PATH = ROOT / "docs" / "README.scriptcat.md"
GITHUB_CDN_BASE_URL = "https://cdn.jsdelivr.net/gh/Wow-CaiCai/Bilibli-Reader@main/"

MARKDOWN_IMAGE_RE = re.compile(
    r"(!\[[^\]]*\]\(\s*)(<[^>]*>|[^\s)]+)(?=\s*(?:[\"'][^\"']*[\"']\s*)?\))"
)
HTML_IMAGE_SRC_RE = re.compile(
    r"(<img\b[^>]*?\bsrc\s*=\s*)([\"'])(.*?)(\2)", re.IGNORECASE
)
READER_VERSION_RE = re.compile(r'^const READER_VERSION = "([^"]+)";$', re.MULTILINE)
VERSION_RE = re.compile(r"^(\d+)\.(\d+)\.(\d+)(?:-alpha\.(\d+))?$")


def next_version(current: str, *, release: bool = False) -> str:
    """Advance the patch's alpha counter, or finish the current release."""
    match = VERSION_RE.fullmatch(current)
    if not match:
        raise ValueError(f"Unsupported reader version: {current}")

    major, minor, patch = (int(part) for part in match.group(1, 2, 3))
    alpha = match.group(4)
    if release:
        return f"{major}.{minor}.{patch if alpha else patch + 1}"
    if alpha:
        return f"{major}.{minor}.{patch}-alpha.{int(alpha) + 1}"
    return f"{major}.{minor}.{patch + 1}-alpha.1"


def advance_content_version(content: str, *, release: bool = False) -> tuple[str, str]:
    matches = READER_VERSION_RE.findall(content)
    if len(matches) != 1:
        raise ValueError("Expected exactly one READER_VERSION declaration in bootstrap.js")
    version = next_version(matches[0], release=release)
    updated, count = READER_VERSION_RE.subn(f'const READER_VERSION = "{version}";', content)
    if count != 1:
        raise ValueError("Could not update READER_VERSION in bootstrap.js")
    return updated, version


def to_github_cdn_url(image_path: str) -> str:
    """Return the CDN URL for a local relative image path."""
    if image_path.startswith(("/", "\\", "#", "//")) or urlsplit(image_path).scheme:
        return image_path

    normalized_path = image_path.replace("\\", "/")
    while normalized_path.startswith("./"):
        normalized_path = normalized_path[2:]
    return GITHUB_CDN_BASE_URL + normalized_path


def build_scriptcat_readme() -> None:
    """Create the ScriptCat README with local image paths rewritten to jsDelivr."""
    readme = README_PATH.read_text(encoding="utf-8")

    def replace_markdown_image(match: re.Match[str]) -> str:
        image_path = match.group(2)
        if image_path.startswith("<") and image_path.endswith(">"):
            image_path = f"<{to_github_cdn_url(image_path[1:-1])}>"
        else:
            image_path = to_github_cdn_url(image_path)
        return match.group(1) + image_path

    def replace_html_image(match: re.Match[str]) -> str:
        return match.group(1) + match.group(2) + to_github_cdn_url(match.group(3)) + match.group(4)

    scriptcat_readme = MARKDOWN_IMAGE_RE.sub(replace_markdown_image, readme)
    scriptcat_readme = HTML_IMAGE_SRC_RE.sub(replace_html_image, scriptcat_readme)
    SCRIPT_CAT_README_PATH.write_text(scriptcat_readme, encoding="utf-8", newline="\n")
    print(SCRIPT_CAT_README_PATH)


def main(*, bump: bool = False, release: bool = False) -> None:
    bootstrap = SOURCE_PATHS[0].read_text(encoding="utf-8")
    if bump or release:
        bootstrap, version = advance_content_version(bootstrap, release=release)
    else:
        matches = READER_VERSION_RE.findall(bootstrap)
        if len(matches) != 1 or not VERSION_RE.fullmatch(matches[0]):
            raise ValueError("Expected exactly one valid READER_VERSION in bootstrap.js")
        version = matches[0]
    content = bootstrap + "".join(path.read_text(encoding="utf-8") for path in SOURCE_PATHS[1:])
    css_literal = json.dumps(
        "".join(path.read_text(encoding="utf-8") for path in STYLE_PATHS), ensure_ascii=False
    )
    icon_data = base64.b64encode(ICON_PATH.read_bytes()).decode("ascii")

    header = (
        TEMPLATE_PATH.read_text(encoding="utf-8")
        .replace("__BLR_VERSION__", version)
        .replace("__BLR_ICON__", icon_data)
        .replace("__BLR_CSS__", css_literal)
    )

    output = header + content + "\n})();\n"
    if bump or release:
        SOURCE_PATHS[0].write_text(bootstrap, encoding="utf-8", newline="\n")
    OUTPUT_PATH.write_text(output, encoding="utf-8", newline="\n")
    build_scriptcat_readme()
    print(f"Version: {version}")
    print(OUTPUT_PATH)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build the Bilibili Reader userscript")
    parser.add_argument(
        "--release", action="store_true", help="Build the next stable patch release"
    )
    parser.add_argument(
        "--bump", action="store_true", help="Advance the alpha version before building"
    )
    args = parser.parse_args()
    main(bump=args.bump, release=args.release)
