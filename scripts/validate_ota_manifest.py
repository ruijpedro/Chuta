#!/usr/bin/env python3
"""Validação offline do manifesto OTA da ChutaXuta."""
import json
import re
import sys
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "ota/manifest.json")
m = json.loads(path.read_text(encoding="utf-8"))
assert m.get("appId") == "com.rjp.chulaxuta", "appId incorreto"
semver = re.compile(r"^\d+\.\d+\.\d+$")
assert semver.fullmatch(m.get("version", "")), "Versão inválida"
assert semver.fullmatch(m.get("minNativeVersion", "")), "Versão nativa inválida"
url, checksum = m.get("url", ""), m.get("checksum", "")
if url or checksum:
    expected = (
        "https://github.com/ruijpedro/Chuta/releases/download/"
        f"ota-v{m['version']}/chutaxuta-ota-v{m['version']}.zip"
    )
    assert url == expected, "URL OTA não corresponde à Release esperada"
    assert re.fullmatch(r"[a-fA-F0-9]{64}", checksum), "SHA-256 inválido"
else:
    assert not url and not checksum, "Manifesto incompleto"
print("Manifesto OTA válido" + (" (não publicado)" if not url else ""))
