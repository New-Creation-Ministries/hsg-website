#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "validate-prototype-state.py"
SPEC = importlib.util.spec_from_file_location("validator", SCRIPT)
validator = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(validator)


class ValidatorTests(unittest.TestCase):
    def make_workspace(self) -> Path:
        root = Path(tempfile.mkdtemp())
        (root / "prototype").mkdir()
        (root / "prototype" / "index.html").write_text("<!doctype html><html><h1>Anchor</h1></html>", encoding="utf-8")
        (root / "PROTOTYPE-BRIEF.md").write_text("# Brief\n", encoding="utf-8")
        (root / "VISUAL-DECISIONS.md").write_text(
            "# Visual Decision Log\n\n## VD-001 — Hero\n\n"
            "- **Decision:** Lead with visit planning.\n"
            "- **Screen or component:** Home hero\n"
            "- **Reason:** Newcomer confidence\n"
            "- **Date or iteration:** 1\n"
            "- **Locked:** yes\n"
            "- **Reconsider when:** Journey changes\n"
            "- **Approved by:** Udeet\n",
            encoding="utf-8",
        )
        (root / "approved-screens").mkdir()
        headings = "\n".join(f"## {value.title()}\n\nContent" for value in validator.REQUIRED_SCREEN_HEADINGS)
        (root / "approved-screens" / "home.md").write_text(f"# Home\n\n{headings}\n\nVD-001\n", encoding="utf-8")
        (root / "SCREEN-INVENTORY.md").write_text(
            "| ID | Screen name | Purpose | User entry point | Primary action | Status | Related screens | Approved record |\n"
            "| --- | --- | --- | --- | --- | --- | --- | --- |\n"
            "| SCR-001 | Home | Orient | Search | Plan visit | approved | None | approved-screens/home.md |\n",
            encoding="utf-8",
        )
        digest = validator.digest_tree(root)
        (root / "exports").mkdir()
        (root / "exports" / "approved-prototype.html").write_text(
            "<!doctype html><html><h1>Portable anchor</h1></html>", encoding="utf-8"
        )
        (root / "PROTOTYPE-FREEZE.md").write_text(
            f"# Freeze\n\n- **Prototype digest:** {digest}\n"
            "- **Lavish review status:** ended\n"
            "- **Lavish export:** `exports/approved-prototype.html`\n",
            encoding="utf-8",
        )
        return root

    def test_finalized_workspace_passes(self):
        result, code = validator.validate(self.make_workspace(), "finalize")
        self.assertEqual(code, 0, result)
        self.assertTrue(result["ok"])

    def test_digest_change_breaks_freeze(self):
        root = self.make_workspace()
        (root / "prototype" / "index.html").write_text("<!doctype html><html><h1>Changed</h1></html>", encoding="utf-8")
        result, code = validator.validate(root, "finalize")
        self.assertEqual(code, 1)
        self.assertIn("Frozen prototype digest does not match current prototype files.", result["errors"])

    def test_missing_lavish_export_breaks_finalize(self):
        root = self.make_workspace()
        (root / "exports" / "approved-prototype.html").unlink()
        result, code = validator.validate(root, "finalize")
        self.assertEqual(code, 1)
        self.assertIn("Missing portable Lavish export: exports/approved-prototype.html", result["errors"])

    def test_non_html_lavish_artifact_breaks_working_validation(self):
        root = self.make_workspace()
        (root / "prototype" / "index.html").write_text("not html", encoding="utf-8")
        result, code = validator.validate(root, "working")
        self.assertEqual(code, 1)
        self.assertIn(
            "Canonical Lavish artifact is not an HTML document: prototype/index.html",
            result["errors"],
        )


if __name__ == "__main__":
    unittest.main()
