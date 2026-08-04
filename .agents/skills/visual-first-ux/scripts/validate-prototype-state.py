#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Validate a visual-first UX prototype workspace and its freeze integrity."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path


REQUIRED_FILES = ("PROTOTYPE-BRIEF.md", "SCREEN-INVENTORY.md", "VISUAL-DECISIONS.md")
LAVISH_ARTIFACT = Path("prototype/index.html")
LAVISH_EXPORT = Path("exports/approved-prototype.html")
ALLOWED_STATUSES = {"planned", "in progress", "approved", "needs revision"}
REQUIRED_SCREEN_HEADINGS = (
    "prototype and visual evidence",
    "lavish review evidence",
    "desktop behavior",
    "mobile behavior",
    "main components",
    "primary interaction",
    "secondary interactions",
    "validation behavior",
    "empty state",
    "loading state",
    "error and recovery",
    "accessibility notes",
    "approved decisions used",
)
DECISION_FIELDS = (
    "decision",
    "screen or component",
    "reason",
    "date or iteration",
    "locked",
    "reconsider when",
    "approved by",
)


def digest_tree(root: Path) -> str:
    prototype = root / "prototype"
    digest = hashlib.sha256()
    if not prototype.is_dir():
        return ""
    for path in sorted(p for p in prototype.rglob("*") if p.is_file()):
        digest.update(path.relative_to(prototype).as_posix().encode())
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def parse_table(path: Path) -> list[dict[str, str]]:
    lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines()]
    table = [line for line in lines if line.startswith("|") and line.endswith("|")]
    if len(table) < 2:
        return []
    headers = [cell.strip().lower() for cell in table[0].strip("|").split("|")]
    rows: list[dict[str, str]] = []
    for line in table[2:]:
        values = [cell.strip() for cell in line.strip("|").split("|")]
        if len(values) == len(headers) and any(values):
            rows.append(dict(zip(headers, values)))
    return rows


def parse_decisions(path: Path) -> tuple[dict[str, dict[str, str]], list[str]]:
    text = path.read_text(encoding="utf-8")
    starts = list(re.finditer(r"(?m)^##\s+(VD-\d+)\b.*$", text))
    decisions: dict[str, dict[str, str]] = {}
    findings: list[str] = []
    for index, match in enumerate(starts):
        decision_id = match.group(1)
        end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        block = text[match.end() : end]
        fields: dict[str, str] = {}
        for field in DECISION_FIELDS:
            found = re.search(rf"(?mi)^-\s+\*\*{re.escape(field)}:\*\*\s*(.*)$", block)
            fields[field] = found.group(1).strip() if found else ""
            if not fields[field]:
                findings.append(f"{decision_id} is missing '{field}'.")
        if fields["locked"].lower() not in {"yes", "no"}:
            findings.append(f"{decision_id} locked must be yes or no.")
        decisions[decision_id] = fields
    return decisions, findings


def headings(text: str) -> set[str]:
    return {match.group(1).strip().lower() for match in re.finditer(r"(?m)^##\s+(.+?)\s*$", text)}


def validate(root: Path, mode: str) -> tuple[dict[str, object], int]:
    errors: list[str] = []
    warnings: list[str] = []
    for filename in REQUIRED_FILES:
        if not (root / filename).is_file():
            errors.append(f"Missing required file: {filename}")

    prototype_digest = digest_tree(root)
    if not prototype_digest:
        errors.append("Prototype directory is missing or contains no files.")
    lavish_artifact = root / LAVISH_ARTIFACT
    if not lavish_artifact.is_file():
        errors.append(f"Missing canonical Lavish artifact: {LAVISH_ARTIFACT.as_posix()}")
    elif "<html" not in lavish_artifact.read_text(encoding="utf-8", errors="ignore").lower():
        errors.append(f"Canonical Lavish artifact is not an HTML document: {LAVISH_ARTIFACT.as_posix()}")

    rows: list[dict[str, str]] = []
    inventory = root / "SCREEN-INVENTORY.md"
    if inventory.is_file():
        rows = parse_table(inventory)
        if not rows:
            errors.append("Screen inventory has no screen rows.")

    decisions: dict[str, dict[str, str]] = {}
    decision_log = root / "VISUAL-DECISIONS.md"
    if decision_log.is_file():
        decisions, decision_findings = parse_decisions(decision_log)
        errors.extend(decision_findings)

    approved_count = 0
    for row in rows:
        screen_id = row.get("id", "<missing id>")
        status = row.get("status", "").lower()
        if status not in ALLOWED_STATUSES:
            errors.append(f"{screen_id} has invalid status '{status}'.")
        if mode == "finalize" and status != "approved":
            errors.append(f"{screen_id} is not approved (status: {status or 'missing'}).")
        if status != "approved":
            continue
        approved_count += 1
        record_value = row.get("approved record", "")
        if not record_value:
            errors.append(f"{screen_id} is approved but has no approved record path.")
            continue
        record = root / record_value
        if not record.is_file():
            errors.append(f"{screen_id} approved record does not exist: {record_value}")
            continue
        text = record.read_text(encoding="utf-8")
        missing = [heading for heading in REQUIRED_SCREEN_HEADINGS if heading not in headings(text)]
        if missing:
            errors.append(f"{screen_id} approved record is missing headings: {', '.join(missing)}")
        used_ids = set(re.findall(r"\bVD-\d+\b", text))
        unknown = sorted(used_ids - decisions.keys())
        if unknown:
            errors.append(f"{screen_id} references unknown decisions: {', '.join(unknown)}")
        if not used_ids and "none" not in text.lower():
            warnings.append(f"{screen_id} approved record names no approved decision IDs.")

    if mode == "finalize":
        if approved_count == 0:
            errors.append("No approved screens are recorded.")
        freeze = root / "PROTOTYPE-FREEZE.md"
        if not freeze.is_file():
            errors.append("Missing PROTOTYPE-FREEZE.md.")
        else:
            freeze_text = freeze.read_text(encoding="utf-8")
            match = re.search(r"(?mi)^-\s+\*\*Prototype digest:\*\*\s*([a-f0-9]{64})\s*$", freeze_text)
            if not match:
                errors.append("Freeze record has no valid prototype digest.")
            elif match.group(1) != prototype_digest:
                errors.append("Frozen prototype digest does not match current prototype files.")
            status = re.search(r"(?mi)^-\s+\*\*Lavish review status:\*\*\s*(.+?)\s*$", freeze_text)
            if not status or status.group(1).strip().lower() != "ended":
                errors.append("Freeze record must show Lavish review status as ended.")
            export = re.search(r"(?mi)^-\s+\*\*Lavish export:\*\*\s*`?([^`\n]+)`?\s*$", freeze_text)
            if not export:
                errors.append("Freeze record has no Lavish export path.")
            elif Path(export.group(1).strip()) != LAVISH_EXPORT:
                errors.append(f"Freeze record Lavish export must be {LAVISH_EXPORT.as_posix()}.")
        if not (root / LAVISH_EXPORT).is_file():
            errors.append(f"Missing portable Lavish export: {LAVISH_EXPORT.as_posix()}")

    result: dict[str, object] = {
        "ok": not errors,
        "mode": mode,
        "workspace": str(root),
        "prototype_digest": prototype_digest,
        "lavish_artifact": LAVISH_ARTIFACT.as_posix(),
        "lavish_export": LAVISH_EXPORT.as_posix() if (root / LAVISH_EXPORT).is_file() else "",
        "screens": len(rows),
        "approved_screens": approved_count,
        "decisions": len(decisions),
        "locked_decisions": sum(1 for item in decisions.values() if item.get("locked", "").lower() == "yes"),
        "errors": errors,
        "warnings": warnings,
    }
    return result, 0 if not errors else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate visual-first UX workspace structure and freeze integrity.")
    parser.add_argument("workspace", type=Path, help="Prototype run workspace")
    parser.add_argument("--mode", choices=("working", "finalize"), default="working")
    parser.add_argument("-o", "--output", type=Path, help="Write JSON result to a file instead of stdout")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    if not args.workspace.is_dir():
        print(json.dumps({"ok": False, "error": f"Workspace not found: {args.workspace}"}))
        return 2
    result, exit_code = validate(args.workspace.resolve(), args.mode)
    rendered = json.dumps(result, indent=2)
    if args.output:
        args.output.write_text(rendered + "\n", encoding="utf-8")
        if args.verbose:
            print(f"Wrote {args.output}", file=sys.stderr)
    else:
        print(rendered)
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
