#!/usr/bin/env python3
"""Gemini'den gelen kadro CSV'lerini kontrol eder ve js/kadrolar.js'e ekler.

Kullanım: python3 tools/kadro_ekle.py dosya1.csv [dosya2.csv ...] [--yaz]
CSV başlığı: takim_id,oyuncu,mevki,yas,uyruk,guc,tahmini
--yaz olmadan sadece kontrol eder (rapor).
"""
import csv, io, json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
KADRO = ROOT / 'js' / 'kadrolar.js'
HEADER = ['takim_id', 'oyuncu', 'mevki', 'yas', 'uyruk', 'guc', 'tahmini']
POS = {'KL', 'DF', 'OS', 'FV'}


def known_ids():
    ids = set()
    for f in ['data.js', 'data-europe.js']:
        ids |= set(re.findall(r"^\s+([a-z0-9]+):\s*\{\s*name:", (ROOT / 'js' / f).read_text(), re.M))
    return ids


def parse(text):
    text = text.strip().strip('`').replace('```csv', '').replace('```', '').strip()
    rows = list(csv.reader(io.StringIO(text)))
    rows = [r for r in rows if r and any(c.strip() for c in r)]
    if [c.strip() for c in rows[0]] == HEADER:
        rows = rows[1:]
    return rows


def check(rows, ids):
    teams, errs, warns = {}, [], []
    for i, r in enumerate(rows, 1):
        if len(r) != 7:
            errs.append(f'satır {i}: 7 sütun olmalı ({len(r)} var): {r}')
            continue
        tid, name, pos, age, nat, ovr, est = [c.strip() for c in r]
        if tid not in ids:
            errs.append(f'satır {i}: bilinmeyen takım kodu "{tid}"')
        if pos not in POS:
            errs.append(f'satır {i}: mevki {pos} (KL/DF/OS/FV olmalı)')
        try:
            age, ovr, est = int(age), int(ovr), int(est or 0)
        except ValueError:
            errs.append(f'satır {i}: yaş/güç sayı değil: {r}')
            continue
        if not 16 <= age <= 42:
            warns.append(f'{name}: yaş {age}?')
        if not 40 <= ovr <= 99:
            warns.append(f'{name}: güç {ovr}?')
        teams.setdefault(tid, []).append([name, pos, age, nat, ovr, est])
    seen = {}
    for tid, pl in teams.items():
        n = len(pl)
        if not 18 <= n <= 35:
            warns.append(f'{tid}: {n} oyuncu (18-35 beklenir)')
        if sum(1 for p in pl if p[1] == 'KL') < 2:
            warns.append(f'{tid}: 2\'den az kaleci')
        names = [p[0] for p in pl]
        for d in {x for x in names if names.count(x) > 1}:
            errs.append(f'{tid}: {d} iki kez')
        for p in pl:
            seen.setdefault(p[0], []).append(tid)
    for name, ts in seen.items():
        if len(set(ts)) > 1:
            errs.append(f'{name} birden fazla takımda: {", ".join(sorted(set(ts)))}')
    # mevcut kadrolarla çakışma (yeni gelen takımlar hariç)
    existing = {}
    for m in re.finditer(r'^  ([a-z0-9]+): \[', KADRO.read_text(), re.M):
        pass
    cur = None
    for line in KADRO.read_text().split('\n'):
        mm = re.match(r'^  ([a-z0-9]+): \[', line)
        if mm: cur = mm.group(1)
        for nm in re.findall(r'\["([^"]+)", "(?:KL|DF|OS|FV)"', line):
            existing.setdefault(nm, set()).add(cur)
    for name, ts in seen.items():
        other = existing.get(name, set()) - set(teams)
        if other:
            warns.append(f'{name} ({ts[0]}) mevcut kadroda da var: {", ".join(sorted(other))}')
    return teams, errs, warns


def write(teams):
    s = KADRO.read_text()
    for tid, pl in teams.items():
        line = f'  {tid}: [' + ', '.join(json.dumps(p, ensure_ascii=False) for p in pl) + '],\n'
        m = re.search(rf'^  {tid}: \[.*\],\n', s, re.M)
        if m:
            s = s[:m.start()] + line + s[m.end():]
        else:
            i = s.rindex('};')
            s = s[:i] + line + s[i:]
    KADRO.write_text(s)


if __name__ == '__main__':
    files = [a for a in sys.argv[1:] if not a.startswith('--')]
    rows = []
    for f in files:
        rows += parse(pathlib.Path(f).read_text(encoding='utf-8'))
    teams, errs, warns = check(rows, known_ids())
    for tid, pl in teams.items():
        avg = sum(p[4] for p in pl) / len(pl)
        print(f'{tid}: {len(pl)} oyuncu, ort. güç {avg:.1f}, tahmini {sum(p[5] for p in pl)}')
    for e in errs:
        print('HATA:', e)
    for w in warns:
        print('UYARI:', w)
    if '--yaz' in sys.argv and not errs:
        write(teams)
        print('kadrolar.js güncellendi:', ', '.join(teams))
