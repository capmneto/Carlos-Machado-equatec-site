#!/usr/bin/env python3
"""Garante que nenhuma rota/URL funcional mudou: compara os links do protótipo com a linha de base do site atual.
Removidos de propósito (decisão do dono): eap, sigt, obras, equatecmarket (FACILMART), mindmap."""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
base = set(root.joinpath("ops/baseline-links.txt").read_text().split())
removed = {"//eap.","//sigt.","//obras.","//equatecmarket.","//mindmap.","//gestaoobras."}   # gestaoobras foi substituído por canteiro
new_ok = {"https://canteiro.equatec-eng.com.br"}   # novo módulo autorizado pelo dono
src = (root/"prototype/index.html").read_text() + (root/"prototype/data/modules.js").read_text()
found = set(re.findall(r"""(?:href=|url:|login:|signup:|whatsapp:|linkedin:)\s*["']([^"']+)["']""", src))
norm = lambda u: u.rstrip("/")
asset = re.compile(r"\.(css|js|woff2|jpg|png|svg|ico)$")
fnd = {norm(u) for u in found if not asset.search(u)}
missing = [b for b in base if norm(b) not in fnd and not any(r in b for r in removed)]
extra = [f for f in fnd if not f.startswith("#") and norm(f) not in {norm(b) for b in base} | new_ok]
print("faltando:", missing or "nenhum"); print("novos externos:", extra or "nenhum")
sys.exit(1 if missing or extra else 0)
