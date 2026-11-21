// Kariyer ekleri: sezon öncesi kamp, milli takım (ümit + A milli, EURO 2028 / Dünya Kupası 2030), sakatlık tedavisi.
import { clamp, pick, randInt, rand, poisson, overall, addInbox, money, shuffle, STAT_KEYS } from './engine.js';

const ABS = (s) => s.season.year * 60 + s.season.week;

// ================================================================ SEZON ÖNCESİ KAMP
export const CAMP_PLACES = [
  { id: 'antalya', name: 'Antalya', emoji: '🌴', desc: 'Sıcak hava, ağır kondisyon. Enerjin artar.', fx: { energy: 10 } },
  { id: 'alpler', name: 'Avusturya Alpleri', emoji: '🏔️', desc: 'Yüksek rakım, temiz hava. Kondisyon ve moral.', fx: { morale: 6, stat: { guc: 1 } } },
  { id: 'hollanda', name: 'Hollanda', emoji: '🌷', desc: 'Taktik ağırlıklı, sakin kamp. Hoca ilişkin güçlenir.', fx: { coach: 5 } },
];
export const CAMP_FOCUS = [
  { id: 'kondisyon', name: 'Kondisyon', emoji: '🏃', desc: 'Hız +1, güç +1', stat: { hiz: 1, guc: 1 } },
  { id: 'bitiricilik', name: 'Bitiricilik', emoji: '🎯', desc: 'Şut +2', stat: { sut: 2 } },
  { id: 'teknik', name: 'Teknik', emoji: '🪄', desc: 'Teknik +1, pas +1', stat: { teknik: 1, pas: 1 } },
  { id: 'uyum', name: 'Takım uyumu', emoji: '🤝', desc: 'Takım +6, hoca +3', rel: { team: 6, coach: 3 } },
];
const FRIENDLY_OPP = ['Shakhtar Donetsk', 'Dinamo Zagreb', 'Ferencváros', 'Slavia Prag', 'Red Bull Salzburg', 'Rapid Wien', 'Sturm Graz', 'Legia Varşova', 'Partizan', 'Kızılyıldız', 'AEK', 'PAOK', 'Ludogorets', 'FCSB', 'Maccabi Tel Aviv', 'Basel'];

export function campAvailable(state) {
  const c = state.camp;
  return state.phase === 'hub' && state.season.week === 0 && (!c || c.year !== state.season.year || !c.done);
}
export function camp(state) {
  if (!state.camp || state.camp.year !== state.season.year) state.camp = { year: state.season.year, step: 0, done: false, place: null, focus: null, friendlies: [], shirt: null };
  return state.camp;
}
function applyRel(p, k, v) { if (p.rel && v) p.rel[k] = clamp(p.rel[k] + v, 0, 100); }
function applyStat(p, st) { for (const [k, v] of Object.entries(st || {})) if (p.stats[k] != null) p.stats[k] = clamp(p.stats[k] + v, 1, 99); }
export function campPick(state, kind, id) {
  const c = camp(state), p = state.player;
  if (kind === 'place' && c.step === 0) {
    const x = CAMP_PLACES.find((y) => y.id === id); if (!x) return;
    c.place = id; c.step = 1;
    if (x.fx.energy) p.energy = clamp(p.energy + x.fx.energy, 0, 100);
    if (x.fx.morale) p.morale = clamp(p.morale + x.fx.morale, 0, 100);
    applyRel(p, 'coach', x.fx.coach); applyStat(p, x.fx.stat);
  } else if (kind === 'focus' && c.step === 1) {
    const x = CAMP_FOCUS.find((y) => y.id === id); if (!x) return;
    c.focus = id; c.step = 2;
    applyStat(p, x.stat); if (x.rel) { applyRel(p, 'team', x.rel.team); applyRel(p, 'coach', x.rel.coach); }
  } else if (kind === 'friendly' && c.step === 2) {
    const ovr = overall(p);
    for (const opp of shuffle(FRIENDLY_OPP.slice()).slice(0, 2)) {
      const my = poisson(1.5), op = poisson(1.1);
      const g = Math.min(my, poisson(clamp(0.2 + (ovr - 55) / 60, 0.15, 1.2)));
      c.friendlies.push({ opp, my, op, g, rating: Math.round(clamp(6 + g * 0.8 + (my - op) * 0.3 + rand(-0.6, 0.8), 4.5, 10) * 10) / 10 });
    }
    const tg = c.friendlies.reduce((a, f) => a + f.g, 0);
    applyRel(p, 'coach', tg * 2 + 1);
    c.step = 3;
  } else if (kind === 'shirt' && c.step === 3) {
    const n = +id; if (!shirtOptions(state).includes(n)) return;
    p.shirt = n; c.shirt = n; c.step = 4; c.done = true;
    if ([9, 10, 7].includes(n)) p.fans = clamp((p.fans ?? 50) + 2, 0, 100);
    addInbox(state, `🏕️ Kamp tamamlandı! Yeni sezonda formanın numarası: ${n}.`);
  }
}
// boştaki numaralar: büyük numaralar ün ve tecrübeyle açılır
export function shirtOptions(state) {
  const p = state.player, fame = p.fame || 0;
  const seed = (state.season.year * 7 + p.clubId.length * 13) % 97;
  const all = [7, 9, 10, 11, 14, 17, 19, 20, 21, 23, 27, 29, 33, 77, 99];
  return all.filter((n, i) => {
    if (n === p.shirt) return true;
    if ([9, 10].includes(n)) return fame >= 40 || p.captain;
    if ([7, 11].includes(n)) return fame >= 20 || (seed + i) % 3 === 0;
    return (seed + i * 5) % 4 !== 0;
  });
}
export function skipCamp(state) { const c = camp(state); c.done = true; c.skipped = true; }

// ================================================================ MİLLİ TAKIM
const OPP_EURO = [['Fransa', 88], ['İngiltere', 87], ['İspanya', 88], ['Almanya', 85], ['Portekiz', 85], ['Hollanda', 84], ['İtalya', 83], ['Belçika', 81], ['Hırvatistan', 80], ['Danimarka', 78], ['İsviçre', 78], ['Avusturya', 77], ['Sırbistan', 76], ['Ukrayna', 76], ['Polonya', 75], ['Macaristan', 74], ['Çekya', 74], ['İskoçya', 73], ['Gürcistan', 72], ['Slovenya', 72], ['Romanya', 72], ['Slovakya', 72], ['Arnavutluk', 70], ['Galler', 72], ['Norveç', 78], ['İsveç', 75], ['Yunanistan', 73]];
const OPP_WORLD = [['Brezilya', 87], ['Arjantin', 88], ['Uruguay', 80], ['Kolombiya', 80], ['Fas', 81], ['Japonya', 79], ['ABD', 78], ['Meksika', 77], ['Senegal', 77], ['Güney Kore', 76], ['Avustralya', 73], ['Ekvador', 76], ['Mısır', 74], ['Kanada', 74]];
const SMALL = [['Litvanya', 62], ['Estonya', 60], ['Letonya', 61], ['Kazakistan', 64], ['Azerbaycan', 63], ['Kuzey Makedonya', 66], ['Karadağ', 66], ['Kosova', 65], ['Bulgaristan', 67], ['Finlandiya', 68], ['İzlanda', 67], ['Lüksemburg', 62], ['Moldova', 58], ['Belarus', 63], ['Ermenistan', 62], ['Kıbrıs Rum Kesimi', 60]];
const TUR = 79, TUR_U21 = 72;
export const nat = (p) => (p.nat ||= { caps: 0, goals: 0, u21caps: 0, u21goals: 0, level: null, tourn: [] });

// lig takviminde 3 milli ara
export function breakWeeks(state) { const t = state.season.totalWeeks || 34; return [Math.round(t * 0.22), Math.round(t * 0.46), Math.round(t * 0.72)]; }
function callScore(state) {
  const p = state.player;
  const avg = p.season.apps ? p.season.ratingSum / p.season.apps : 6.3;
  return overall(p) + (avg - 6.5) * 4 + (p.fame || 0) / 8;
}
// her hafta (advanceWeek sonrası): milli ara geldiyse kadro açıklanır
export function weekly(state) {
  const p = state.player, n = nat(p), w = state.season.week;
  if (state.natMatch && !state.natMatch.res && !(p.injury > 0)) playNat(state);   // oynanmadan geçildiyse otomatik
  if (state.natMatch) state.natMatch = null;
  if (!breakWeeks(state).includes(w) || state.natMatch || p.injury > 0) return;
  const sc = callScore(state);
  let level = null;
  if (sc >= 73) level = 'A';
  else if (p.age <= 21 && sc >= 62) level = 'U21';
  if (!level) { if (n.level) addInbox(state, `🇹🇷 Milli takım kadrosu açıklandı. Bu kez listede yoksun.`); n.level = null; return; }
  const first = level === 'A' ? !n.caps : !n.u21caps;
  n.level = level;
  const pool = level === 'A' ? (Math.random() < 0.5 ? SMALL : OPP_EURO) : SMALL.concat(OPP_EURO.slice(-10));
  const [opp, str] = pick(pool);
  state.natMatch = { level, opp, str: level === 'U21' ? str - 8 : str, comp: pick(['Hazırlık maçı', level === 'A' ? 'Dünya Kupası elemesi' : 'U21 EURO elemesi', 'Uluslar Ligi']), abs: ABS(state) };
  addInbox(state, `🇹🇷 ${level === 'A' ? 'A Milli Takım' : 'Ümit Milli Takım'} kadrosuna ${first ? 'ilk kez ' : ''}davet edildin! Rakip: ${opp}.`);
  state.newsQueue ||= [];
  return { level, first, opp };
}
function simNat(str, oppStr, ovr, cap = 1) {
  const my = poisson(clamp(1.35 * Math.exp((str - oppStr) / 20), 0.25, 3.5));
  const op = poisson(clamp(1.35 * Math.exp((oppStr - str) / 20), 0.2, 3.5));
  const g = Math.min(my, poisson(clamp(0.18 + (ovr - 62) / 55, 0.1, 1.1) * cap));
  const a = Math.min(my - g, Math.random() < 0.25 ? 1 : 0);
  const rating = Math.round(clamp(6.2 + g * 0.9 + a * 0.4 + (my - op) * 0.25 + rand(-0.7, 0.7), 4.5, 10) * 10) / 10;
  return { my, op, g, a, rating };
}
export function playNat(state) {
  const m = state.natMatch; if (!m || m.res) return null;
  const p = state.player, n = nat(p);
  if (p.injury > 0) { state.natMatch = null; addInbox(state, '🇹🇷 Sakatlığın nedeniyle milli takım kadrosundan çıkarıldın.'); return null; }
  const r = simNat(m.level === 'A' ? TUR : TUR_U21, m.str, overall(p), m.level === 'A' ? 0.9 : 1.1);
  m.res = r;
  if (m.level === 'A') { n.caps++; n.goals += r.g; } else { n.u21caps++; n.u21goals += r.g; }
  p.fame = clamp((p.fame || 0) + (m.level === 'A' ? 1.5 : 0.7) + r.g, 0, 100);
  p.morale = clamp(p.morale + (r.my > r.op ? 4 : r.my < r.op ? -3 : 1) + r.g * 2, 0, 100);
  p.energy = clamp(p.energy - 12, 0, 100);
  const res = r.my > r.op ? 'kazandı' : r.my < r.op ? 'kaybetti' : 'berabere kaldı';
  addInbox(state, `🇹🇷 ${m.level === 'A' ? 'Türkiye' : 'Türkiye U21'} ${r.my}-${r.op} ${m.opp} (${m.comp}). Milli takım ${res}.${r.g ? ` ${r.g} gol attın!` : ''}`);
  return r;
}
export function closeNat(state) { state.natMatch = null; }

// ---------------------------------------------------------------- turnuvalar (yaz)
// 2027-28 sezonu sonunda EURO 2028, 2029-30 sonunda Dünya Kupası 2030. Son sezonda A milli olmalısın.
export function tournamentFor(state) {
  const endYear = state.season.year + 1, p = state.player, n = nat(p);
  const def = endYear === 2028 ? { id: 'euro2028', name: 'EURO 2028', icon: '🇪🇺', pool: OPP_EURO }
    : endYear === 2030 ? { id: 'wc2030', name: 'Dünya Kupası 2030', icon: '🌍', pool: OPP_EURO.concat(OPP_WORLD) }
      : endYear === 2032 ? { id: 'euro2032', name: 'EURO 2032', icon: '🇪🇺', pool: OPP_EURO }
        : endYear === 2034 ? { id: 'wc2034', name: 'Dünya Kupası 2034', icon: '🌍', pool: OPP_EURO.concat(OPP_WORLD) } : null;
  if (!def || n.tourn.some((t) => t.id === def.id)) return null;
  if (n.level !== 'A' && callScore(state) < 73) return null;
  return def;
}
const STAGES = ['Grup 1. maç', 'Grup 2. maç', 'Grup 3. maç', 'Son 16', 'Çeyrek final', 'Yarı final', 'Final'];
export function startTournament(state) {
  const d = tournamentFor(state); if (!d) return null;
  const opps = shuffle(d.pool.slice());
  const t = state.natTourn = { id: d.id, name: d.name, icon: d.icon, i: 0, pts: 0, games: [], out: false, champion: false, opps: opps.slice(0, 7) };
  // eleme turlarında rakipler güçlensin
  t.opps.sort((a, b) => a[1] - b[1]);
  t.opps = [...shuffle(t.opps.slice(0, 3)), ...t.opps.slice(3)];
  return t;
}
export function nextTournamentGame(state) {
  const t = state.natTourn; if (!t || t.out || t.champion) return null;
  const p = state.player, n = nat(p);
  const [opp, str] = t.opps[t.i];
  let r = simNat(TUR + (p.fame || 0) / 25, str, overall(p), 1);
  const ko = t.i >= 3;
  let pens = null;
  if (ko && r.my === r.op) { const win = Math.random() < 0.5; pens = win ? '5-4' : '3-4'; }
  n.caps++; n.goals += r.g;
  p.fame = clamp((p.fame || 0) + 2 + r.g * 1.5, 0, 100);
  t.games.push({ stage: STAGES[t.i], opp, ...r, pens });
  if (!ko) {
    t.pts += r.my > r.op ? 3 : r.my === r.op ? 1 : 0;
    if (t.i === 2 && t.pts < 4) t.out = true;
  } else {
    const won = r.my > r.op || (pens && pens.startsWith('5'));
    if (!won) t.out = true;
    else if (t.i === 6) t.champion = true;
  }
  t.i++;
  if (t.out || t.champion) finishTournament(state);
  return t.games[t.games.length - 1];
}
function finishTournament(state) {
  const t = state.natTourn, p = state.player, n = nat(p);
  const goals = t.games.reduce((a, g) => a + g.g, 0);
  const reached = t.champion ? 'Şampiyon' : t.games[t.games.length - 1].stage;
  n.tourn.push({ id: t.id, name: t.name, reached, goals, games: t.games.length });
  if (t.champion) {
    p.trophies ||= []; p.trophies.push({ key: t.id.startsWith('wc') ? 'wc' : 'euro', year: state.season.year, club: p.clubId });
    p.fame = clamp((p.fame || 0) + 15, 0, 100); p.fans = clamp((p.fans ?? 50) + 10, 0, 100);
  }
  addInbox(state, `${t.icon} ${t.name}: ${t.champion ? 'ŞAMPİYON OLDUK! 🏆' : `${reached} turunda veda ettik.`} ${goals} gol attın.`);
}
export function simRestTournament(state) { if (!state.natTourn && tournamentFor(state)) startTournament(state); let k = 0; while (state.natTourn && !state.natTourn.out && !state.natTourn.champion && k++ < 8) nextTournamentGame(state); }

// ================================================================ SAKATLIK TEDAVİSİ
export function rehabOptions(state) {
  const p = state.player, base = Math.max(50_000, Math.round(p.contract.wage * 1.5 / 1000) * 1000);
  return [
    { id: 'std', name: 'Standart tedavi', emoji: '🩹', desc: 'Kulüp doktorları. Ücretsiz, normal süre.', cost: 0 },
    { id: 'fizyo', name: 'Yoğun fizyoterapi', emoji: '💆', desc: 'Günde iki seans. 1 hafta erken dönüş.', cost: base, ok: p.injury >= 2 },
    { id: 'abroad', name: 'Yurt dışında tedavi', emoji: '✈️', desc: 'Özel klinik. 2 hafta erken dönüş, moral +3.', cost: base * 4, ok: p.injury >= 3 },
    { id: 'early', name: 'Erken dönüş (ağrı kesiciyle)', emoji: '💉', desc: 'Hemen oynarsın ama 6 hafta boyunca tekrar sakatlanma riskin yüksek.', cost: 0, risky: true },
  ];
}
export function rehab(state, id) {
  const p = state.player; p.weekFlags ||= {};
  if (p.injury <= 0) return { ok: false, msg: 'Sakat değilsin.' };
  if (p.weekFlags.rehab) return { ok: false, msg: 'Bu hafta tedavi kararını verdin.' };
  const o = rehabOptions(state).find((x) => x.id === id); if (!o) return { ok: false };
  if (o.ok === false) return { ok: false, msg: 'Sakatlık süresi bunun için çok kısa.' };
  if (o.cost > p.money) return { ok: false, msg: 'Paran yetmiyor.' };
  p.money -= o.cost; p.weekFlags.rehab = id;
  if (id === 'fizyo') { p.injury = Math.max(1, p.injury - 1); p.energy = clamp(p.energy - 5, 0, 100); }
  if (id === 'abroad') { p.injury = Math.max(1, p.injury - 2); p.morale = clamp(p.morale + 3, 0, 100); }
  if (id === 'early') { p.injury = 0; p.fragile = 6; if (p.rel) p.rel.coach = clamp(p.rel.coach + 2, 0, 100); addInbox(state, '💉 Ağrı kesiciyle sahalara döndün. Dikkat: 6 hafta boyunca sakatlık riskin yüksek.'); }
  return { ok: true, msg: { std: 'Kulüp doktorlarıyla tedavi devam ediyor.', fizyo: `Yoğun fizyoterapi başladı (${money(o.cost)}).`, abroad: `Yurt dışında tedaviye gittin (${money(o.cost)}).`, early: 'Erken dönüş kararı verdin. Risk sende!' }[id] };
}
