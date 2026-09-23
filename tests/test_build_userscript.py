import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "build_userscript.py"
SPEC = importlib.util.spec_from_file_location("build_userscript", SCRIPT_PATH)
build_userscript = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(build_userscript)


class BuildUserscriptVersionTests(unittest.TestCase):
    def test_source_fragments_match_current_userscript(self):
        source = "".join(path.read_text(encoding="utf-8") for path in build_userscript.SOURCE_PATHS)
        styles = "".join(path.read_text(encoding="utf-8") for path in build_userscript.STYLE_PATHS)
        userscript = build_userscript.OUTPUT_PATH.read_text(encoding="utf-8")
        self.assertIn(f"GM_addStyle({json.dumps(styles, ensure_ascii=False)});", userscript)
        self.assertTrue(
            userscript.endswith(source + "\n})();\n"),
            "Built userscript does not match the ordered source fragments",
        )

    def test_version_sequence(self):
        self.assertEqual(build_userscript.next_version("0.0.5"), "0.0.6-alpha.1")
        self.assertEqual(build_userscript.next_version("0.0.6-alpha.1"), "0.0.6-alpha.2")
        self.assertEqual(
            build_userscript.next_version("0.0.6-alpha.2", release=True), "0.0.6"
        )
        self.assertEqual(build_userscript.next_version("0.0.6"), "0.0.7-alpha.1")

    def test_alpha_builds_increment_and_leave_release_archive_untouched(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source_paths = tuple(root / "src" / path.name for path in build_userscript.SOURCE_PATHS)
            bootstrap_path = source_paths[0]
            style_paths = tuple(root / "src" / "styles" / path.name for path in build_userscript.STYLE_PATHS)
            icon_path = root / "icon.png"
            output_path = root / "Bilibli-Reader.user.js"
            release_dir = root / "release"
            readme_path = root / "README.md"
            scriptcat_path = root / "docs" / "README.scriptcat.md"
            release_dir.mkdir()
            bootstrap_path.parent.mkdir()
            style_paths[0].parent.mkdir()
            scriptcat_path.parent.mkdir()
            old_release = release_dir / "bilibli-reader-v0.0.5.user.js"
            old_release.write_text("historical release", encoding="utf-8")
            bootstrap_path.write_text('const READER_VERSION = "0.0.5";\n', encoding="utf-8")
            for path in source_paths[1:]:
                path.write_text("// source fragment\n", encoding="utf-8")
            for path in style_paths:
                path.write_text("body {}\n", encoding="utf-8")
            icon_path.write_bytes(b"icon")
            readme_path.write_text("# Reader\n\n![示例](docs/images/sample_reader.png)\n", encoding="utf-8")

            with (
                patch.object(build_userscript, "SOURCE_PATHS", source_paths),
                patch.object(build_userscript, "STYLE_PATHS", style_paths),
                patch.object(build_userscript, "ICON_PATH", icon_path),
                patch.object(build_userscript, "OUTPUT_PATH", output_path),
                patch.object(build_userscript, "RELEASE_DIR", release_dir),
                patch.object(build_userscript, "README_PATH", readme_path),
                patch.object(build_userscript, "SCRIPT_CAT_README_PATH", scriptcat_path),
            ):
                build_userscript.main()
                self.assertIn(
                    "// @version      0.0.6-alpha.1", output_path.read_text(encoding="utf-8")
                )
                self.assertIn(
                    'READER_VERSION = "0.0.6-alpha.1"', bootstrap_path.read_text(encoding="utf-8")
                )
                self.assertIn(
                    "Bilibli-Reader@main/docs/images/sample_reader.png",
                    scriptcat_path.read_text(encoding="utf-8"),
                )
                build_userscript.main()
                self.assertIn(
                    "// @version      0.0.6-alpha.2", output_path.read_text(encoding="utf-8")
                )
                self.assertEqual(old_release.read_text(encoding="utf-8"), "historical release")
                self.assertEqual(list(release_dir.iterdir()), [old_release])

                build_userscript.main(release=True)
                self.assertIn("// @version      0.0.6", output_path.read_text(encoding="utf-8"))
                self.assertTrue((release_dir / "bilibli-reader-v0.0.6.user.js").exists())


if __name__ == "__main__":
    unittest.main()
