// Antrenman mini oyunları. Sonuç 0..1 puan → gelişim çarpanı (0,6x – 1,8x).
// sut: hareketli hedefe zamanlama · teknik: top sektirme (daralan bölge) · guc: basılı tut-bırak
// hiz: sprint (sağ-sol hızlı dokunma) · pas: yanan arkadaşa hızlı dokun
export const DRILLS = {
  sut: { name: 'Hedef vuruşu', icon: '🎯', how: 'İbre yeşil bölgeye girince dokun. 5 şut.' },
  teknik: { name: 'Top sektirme', icon: '🪄', how: 'İbre yeşil bölgedeyken dokun. Bölge her seferinde daralır.' },
  guc: { name: 'Güç şutu', icon: '💥', how: 'Basılı tut, bar dolarken yeşil bölgede bırak. 4 deneme.' },
  hiz: { name: 'Sprint', icon: '⚡', how: 'SOL ve SAĞ ayağa sırayla olabildiğince hızlı dokun. 5 saniye!' },
  pas: { name: 'Pas çalışması', icon: '🔄', how: 'Yanan arkadaşına hemen dokun. 8 pas.' },
};
export const multOf = (score) => Math.round((0.6 + 1.2 * Math.max(0, Math.min(1, score))) * 100) / 100;

export function run(stat, onDone) {
  const d = DRILLS[stat];
  const ov = document.createElement('div');
  ov.className = 'drill-ov';
  ov.innerHTML = `<div class="drill"><div class="dhead"><b>${d.icon} ${d.name}</b><button class="dx" aria-label="Kapat">✕</button></div>
    <p class="muted small">${d.how}</p><div class="dstage"></div><div class="dscore"></div></div>`;
  document.body.appendChild(ov);
  const stage = ov.querySelector('.dstage'), scoreEl = ov.querySelector('.dscore');
  let stopped = false, raf = 0;
  const end = (score) => {
    if (stopped) return; stopped = true; cancelAnimationFrame(raf);
    stage.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    const m = multOf(score);
    scoreEl.innerHTML = `<div class="dres"><b>${Math.round(score * 100)} puan</b><span>Gelişim çarpanı ×${String(m).replace('.', ',')}</span></div><button class="btn big dok">Tamam</button>`;
    scoreEl.querySelector('.dok').onclick = () => { ov.remove(); onDone(score); };
  };
  ov.querySelector('.dx').onclick = () => { stopped = true; cancelAnimationFrame(raf); ov.remove(); };
  const loop = (fn) => { const t0 = performance.now(); const step = (t) => { if (stopped) return; fn((t - t0) / 1000); raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); };

  if (stat === 'sut' || stat === 'teknik') {
    const tries = stat === 'sut' ? 5 : 6;
    stage.innerHTML = `<div class="tbar"><div class="tzone"></div><div class="tneedle"></div></div><div class="tball">${stat === 'sut' ? '🥅' : '⚽'}</div><div class="tinfo"></div><button class="btn big dtap">${stat === 'sut' ? 'VUR!' : 'SEKTİR!'}</button>`;
    const zone = stage.querySelector('.tzone'), needle = stage.querySelector('.tneedle'), info = stage.querySelector('.tinfo'), ballEl = stage.querySelector('.tball');
    let n = 0, pts = 0, pos = 0, zc = 0.5, zw = stat === 'sut' ? 0.2 : 0.26, speed = stat === 'sut' ? 1.1 : 0.9, zv = 0;
    const place = () => { zc = 0.15 + Math.random() * 0.7; zone.style.left = (zc - zw / 2) * 100 + '%'; zone.style.width = zw * 100 + '%'; zv = stat === 'sut' ? (Math.random() < 0.5 ? -0.25 : 0.25) : 0; };
    place();
    info.textContent = `0 / ${tries}`;
    // faz biriktirilir: hız değişince ibre zıplamaz. Dokunuş anındaki konum, ekranda görünen konumdur.
    let phase = 0, last = 0, lock = 0;
    loop((t) => {
      const dt = Math.min(0.05, t - last); last = t;
      if (performance.now() < lock) return;          // sonuç gösterilirken ibre durur
      phase += dt * Math.PI * speed;
      pos = (Math.sin(phase) + 1) / 2;
      needle.style.left = pos * 100 + '%';
      if (zv) { zc += zv * dt; if (zc < zw / 2 || zc > 1 - zw / 2) { zv = -zv; zc = Math.min(1 - zw / 2, Math.max(zw / 2, zc)); } zone.style.left = (zc - zw / 2) * 100 + '%'; }
    });
    stage.querySelector('.dtap').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (stopped || performance.now() < lock) return;
      lock = performance.now() + 450;
      const off = Math.abs(pos - zc) / (zw / 2 + 0.012);
      const hit = off <= 1;
      const q = hit ? (off < 0.35 ? 1 : 0.7) : 0;
      pts += q; n++;
      ballEl.textContent = hit ? (q === 1 ? '🔥' : '✅') : '❌';
      ballEl.classList.remove('pop'); void ballEl.offsetWidth; ballEl.classList.add('pop');
      info.textContent = `${n} / ${tries} · ${Math.round(pts * 10) / 10} isabet`;
      if (stat === 'teknik') { zw = Math.max(0.1, zw * 0.85); speed *= 1.1; }
      else speed *= 1.06;
      if (n >= tries) return end(pts / tries);
      setTimeout(() => { if (!stopped) place(); }, 450);
    });
  } else if (stat === 'guc') {
    const tries = 4;
    stage.innerHTML = `<div class="tbar vert"><div class="tzone"></div><div class="tfill"></div></div><div class="tinfo"></div><button class="btn big dhold">BASILI TUT</button>`;
    const zone = stage.querySelector('.tzone'), fill = stage.querySelector('.tfill'), info = stage.querySelector('.tinfo'), btn = stage.querySelector('.dhold');
    let n = 0, pts = 0, v = 0, holding = false, zc = 0.75, zw = 0.16, t0 = 0;
    const place = () => { zc = 0.55 + Math.random() * 0.33; zone.style.bottom = (zc - zw / 2) * 100 + '%'; zone.style.height = zw * 100 + '%'; };
    place(); info.textContent = `0 / ${tries}`;
    loop(() => { if (holding) { v = Math.min(1.08, (performance.now() - t0) / 1100); fill.style.height = Math.min(100, v * 100) + '%'; if (v >= 1.08) release(); } });
    const release = () => {
      if (!holding) return; holding = false;
      const off = Math.abs(v - zc) / (zw / 2);
      pts += off <= 1 ? (off < 0.4 ? 1 : 0.7) : v > 1 ? 0 : Math.max(0, 0.3 - (off - 1) * 0.2);
      n++; info.textContent = `${n} / ${tries} · ${off <= 1 ? 'Müthiş şut! 💥' : v > zc ? 'Çok sert, üstten gitti' : 'Zayıf kaldı'}`;
      if (n >= tries) return end(pts / tries);
      setTimeout(() => { fill.style.height = '0%'; place(); }, 400);
    };
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); if (stopped || holding) return; holding = true; t0 = performance.now(); v = 0; });
    btn.addEventListener('pointerup', release); btn.addEventListener('pointerleave', release); btn.addEventListener('pointercancel', release);
  } else if (stat === 'hiz') {
    stage.innerHTML = `<div class="track"><div class="runner">🏃</div><div class="finish">🏁</div></div><div class="tinfo">Hazır…</div><div class="feet"><button class="btn big fl">SOL</button><button class="btn big fr">SAĞ</button></div>`;
    const runner = stage.querySelector('.runner'), info = stage.querySelector('.tinfo');
    let taps = 0, last = null, started = 0;
    const TARGET = 38, DUR = 5;
    const tap = (side) => {
      if (stopped) return;
      if (!started) { started = performance.now(); loop(() => { const left = DUR - (performance.now() - started) / 1000; info.textContent = `${Math.max(0, left).toFixed(1)} sn · ${taps} adım`; if (left <= 0) end(Math.min(1, taps / TARGET)); }); }
      if (side === last) return;                     // aynı ayak iki kez sayılmaz
      last = side; taps++;
      runner.style.left = Math.min(88, taps / TARGET * 88) + '%';
      if (taps >= TARGET) end(1);
    };
    stage.querySelector('.fl').addEventListener('pointerdown', (e) => { e.preventDefault(); tap('L'); });
    stage.querySelector('.fr').addEventListener('pointerdown', (e) => { e.preventDefault(); tap('R'); });
  } else if (stat === 'pas') {
    const N = 8;
    stage.innerHTML = `<div class="pgrid">${Array.from({ length: 9 }, (_, i) => `<button class="pm" data-i="${i}">${i === 4 ? '🧍' : '👤'}</button>`).join('')}</div><div class="tinfo"></div>`;
    const cells = [...stage.querySelectorAll('.pm')], info = stage.querySelector('.tinfo');
    let n = 0, pts = 0, cur = -1, shown = 0;
    const next = () => {
      if (n >= N) return end(pts / N);
      cells.forEach((c) => c.classList.remove('lit'));
      do cur = Math.floor(Math.random() * 9); while (cur === 4);
      cells[cur].classList.add('lit'); shown = performance.now();
    };
    cells.forEach((c, i) => c.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (stopped || cur < 0 || i === 4) return;
      const rt = (performance.now() - shown) / 1000;
      if (i === cur) { pts += rt < 0.55 ? 1 : rt < 0.9 ? 0.75 : rt < 1.4 ? 0.45 : 0.2; c.classList.add('ok'); setTimeout(() => c.classList.remove('ok'), 200); }
      else { c.classList.add('bad'); setTimeout(() => c.classList.remove('bad'), 200); }
      cells.forEach((x) => x.classList.remove('lit'));
      n++; info.textContent = `${n} / ${N} pas`; cur = -1;
      setTimeout(next, 250 + Math.random() * 400);
    }));
    info.textContent = `0 / ${N} pas`;
    setTimeout(next, 600);
  }
}
