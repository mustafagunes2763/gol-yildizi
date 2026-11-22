// Ulusal kupalar: her ülkenin tüm takımlarıyla tek maçlık eleme. Beraberlikte uzatma + penaltı.
// Takvim Avrupa haftalarına denk gelmeyecek şekilde sezona yayılır. Oyuncunun maçı fx.comp = 'CUP' ile oynanır.
import { simScore, shuffle, rand, clamp, money, addInbox } from './engine.js';
import { LEAGUES } from './data.js';

export const CUPS = {
  TUR: { name: 'Türkiye Kupası', short: 'TK', icon: '🏆', flag: '🇹🇷', fame: 8, prize: 6_000_000 },
  ENG: { name: 'FA Cup', short: 'FA', icon: '🏆', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', fame: 10, prize: 15_000_000 },
  ESP: { name: 'Kral Kupası', short: 'KK', icon: '🏆', flag: '🇪🇸', fame: 9, prize: 12_000_000 },
  ITA: { name: 'İtalya Kupası', short: 'İK', icon: '🏆', flag: '🇮🇹', fame: 9, prize: 12_000_000 },
  GER: { name: 'Almanya Kupası', short: 'AK', icon: '🏆', flag: '🇩🇪', fame: 9, prize: 12_000_000 },
  FRA: { name: 'Fransa Kupası', short: 'FK', icon: '🏆', flag: '🇫🇷', fame: 8, prize: 9_000_000 },
  NED: { name: 'Hollanda Kupası', short: 'HK', icon: '🏆', flag: '🇳🇱', fame: 7, prize: 6_000_000 },
  POR: { name: 'Portekiz Kupası', short: 'PK', icon: '🏆', flag: '🇵🇹', fame: 7, prize: 6_000_000 },
  BEL: { name: 'Belçika Kupası', short: 'BK', icon: '🏆', flag: '🇧🇪', fame: 6, prize: 5_000_000 },
  SCO: { name: 'İskoçya Kupası', short: 'İK', icon: '🏆', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', fame: 6, prize: 4000000 },
  GRE: { name: 'Yunanistan Kupası', short: 'YK', icon: '🏆', flag: '🇬🇷', fame: 6, prize: 4000000 },
  AUT: { name: 'Avusturya Kupası', short: 'AK', icon: '🏆', flag: '🇦🇹', fame: 5, prize: 3500000 },
  SUI: { name: 'İsviçre Kupası', short: 'İK', icon: '🏆', flag: '🇨🇭', fame: 5, prize: 3500000 },
  DEN: { name: 'Danimarka Kupası', short: 'DK', icon: '🏆', flag: '🇩🇰', fame: 5, prize: 3000000 },
  NOR: { name: 'Norveç Kupası', short: 'NK', icon: '🏆', flag: '🇳🇴', fame: 5, prize: 3000000 },
  CZE: { name: 'Çekya Kupası', short: 'ÇK', icon: '🏆', flag: '🇨🇿', fame: 5, prize: 3000000 },
  POL: { name: 'Polonya Kupası', short: 'PK', icon: '🏆', flag: '🇵🇱', fame: 5, prize: 3000000 },
};
const ROUND_NAMES = { 64: '1. tur', 32: 'Son 32', 16: 'Son 16', 8: 'Çeyrek final', 4: 'Yarı final', 2: 'Final' };

export const countryOfLeague = (lid) => LEAGUES[lid]?.country || 'TUR';
export function countryOf(state, teamId) {
  const lid = Object.keys(state.leagues).find((l) => state.leagues[l].includes(teamId));
  return lid ? countryOfLeague(lid) : null;
}
function teamsOf(state, c) {
  return Object.keys(state.leagues).filter((l) => countryOfLeague(l) === c).flatMap((l) => state.leagues[l]);
}

// Bir kupanın turları için hafta listesi (Avrupa haftalarından ve ilk 4 haftadan kaçınır)
function cupWeeks(total, n, avoid) {
  const out = [];
  for (let i = 0; i < n; i++) {
    let w = Math.round(total * (0.14 + (0.8 * i) / Math.max(1, n - 1)));
    w = clamp(w, 4, total - 1);
    while ((avoid.has(w) || out.includes(w)) && w < total - 1) w++;
    while ((avoid.has(w) || out.includes(w)) && w > 4) w--;
    out.push(w);
  }
  return out.sort((a, b) => a - b);
}

function rnd(n) { return ROUND_NAMES[n] || `Son ${n}`; }

// Kupayı kur: takım sayısını 2'nin kuvvetine indirmek için en zayıf takımlar ön turda oynar
function newCup(state, c) {
  const ids = teamsOf(state, c);
  if (ids.length < 4) return null;
  let size = 1; while (size * 2 <= ids.length) size *= 2;
  const extra = ids.length - size;                 // ön turda elenecek takım sayısı
  const byStr = ids.slice().sort((a, b) => (state.teams[b].str || 0) - (state.teams[a].str || 0));
  const playIn = extra ? byStr.slice(ids.length - extra * 2) : [];
  const byes = byStr.slice(0, ids.length - playIn.length);
  const rounds = [];
  if (playIn.length) rounds.push({ name: 'Ön eleme', ties: pair(shuffle(playIn)), byes });
  let n = size; while (n >= 2) { rounds.push({ name: rnd(n), ties: null }); n /= 2; }
  if (!playIn.length) rounds[0].ties = pair(shuffle(ids));
  const avoid = new Set(state.euro?.weeks || []);
  const weeks = cupWeeks(state.season.totalWeeks, rounds.length, avoid);
  rounds.forEach((r, i) => { r.week = weeks[i]; });
  return { country: c, rounds, cur: 0, winner: null, out: [] };
}
function pair(list) {
  const ties = [];
  for (let i = 0; i + 1 < list.length; i += 2) ties.push({ h: list[i], a: list[i + 1], hg: null, ag: null, pens: null, w: null });
  return ties;
}

export function createCups(state) {
  const cups = {};
  for (const c of new Set(Object.keys(state.leagues).map(countryOfLeague))) {
    const cup = newCup(state, c);
    if (cup) cups[c] = cup;
  }
  return { year: state.season.year, cups };
}
export function ensure(state) {
  if (!state.season) return null;
  if (!state.cups || state.cups.year !== state.season.year) {
    state.cups = createCups(state);
    // eski kayıt: sezon ortasında başladıysa geçmiş turlar sessizce oynanır
    for (let w = 0; w < state.season.week; w++) simWeek(state, w, true);
  }
  return state.cups;
}

// Turun eşleşmeleri (ilk kez ihtiyaç duyulunca kura çekilir)
function tiesOf(cup, i) {
  const r = cup.rounds[i];
  if (r.ties) return r.ties;
  const prev = cup.rounds[i - 1];
  const winners = prev.ties.map((t) => t.w).filter(Boolean).concat(prev.byes || []);
  r.ties = pair(shuffle(winners));
  return r.ties;
}

function settle(state, cup, t, pens) {
  if (t.hg !== t.ag) t.w = t.hg > t.ag ? t.h : t.a;
  else {
    if (!pens) {
      const sh = state.teams[t.h].str || 70, sa = state.teams[t.a].str || 70;
      const hw = Math.random() < 0.5 + (sh - sa) / 200;
      const lo = 3 + Math.floor(Math.random() * 3);
      pens = hw ? [lo + 1, lo] : [lo, lo + 1];
      if (Math.random() < 0.3) t.et = true;
    }
    t.pens = pens;
    t.w = pens[0] > pens[1] ? t.h : t.a;
  }
  cup.out.push(t.w === t.h ? t.a : t.h);
}

function closeRound(state, cup, i, quiet) {
  if (i !== cup.cur) return;
  const ties = tiesOf(cup, i);
  if (ties.some((t) => !t.w)) return;
  cup.cur++;
  if (cup.cur >= cup.rounds.length) {
    cup.winner = ties[0].w;
    const me = state.player.clubId;
    if (!quiet && countryOf(state, me) === cup.country && cup.winner !== me) {
      addInbox(state, `${CUPS[cup.country].name}'nı ${state.teams[cup.winner].name} kazandı.`);
    }
  }
}

// Haftanın kupa maçlarını oyna (oyuncunun maçı hariç; o maç oynanmadıysa onu da sim'le — örn. hafta atlandı)
export function simWeek(state, week, quiet = false) {
  if (!state.cups) return;
  const me = state.player.clubId;
  for (const cup of Object.values(state.cups.cups)) {
    const i = cup.rounds.findIndex((r) => r.week === week);
    if (i < 0 || i !== cup.cur || cup.winner) continue;
    for (const t of tiesOf(cup, i)) {
      if (t.w) continue;
      [t.hg, t.ag] = simScore(state.teams, t.h, t.a);
      settle(state, cup, t, null);
      if (!quiet && (t.h === me || t.a === me)) addInbox(state, `${CUPS[cup.country].name}: ${state.teams[t.h].short} ${t.hg}-${t.ag} ${state.teams[t.a].short}${t.pens ? ` (pen. ${t.pens[0]}-${t.pens[1]})` : ''}`);
    }
    closeRound(state, cup, i, quiet);
  }
}

// Oyuncunun bu haftaki kupa maçı
export function cupFixture(state) {
  const C = ensure(state);
  if (!C) return null;
  const me = state.player.clubId, wk = state.season.week;
  const c = countryOf(state, me);
  const cup = C.cups[c];
  if (!cup || cup.winner) return null;
  const i = cup.rounds.findIndex((r) => r.week === wk);
  if (i < 0 || i !== cup.cur) return null;
  const t = tiesOf(cup, i).find((x) => x.h === me || x.a === me);
  if (!t || t.w) return null;
  const final = i === cup.rounds.length - 1;
  return {
    comp: 'CUP', cup: c, cupName: CUPS[c].name, ri: i, round: cup.rounds[i].name, h: t.h, a: t.a, home: t.h === me, opp: t.h === me ? t.a : t.h,
    knockout: true, single: true, final, leg: 0, stage: cup.rounds[i].name, agg: null,
  };
}

// Oyuncunun kupa maçının sonucu. pensMine: [biz, onlar]
export function record(state, fx, myG, opG, pensMine) {
  const cup = state.cups.cups[fx.cup];
  const t = tiesOf(cup, fx.ri).find((x) => x.h === fx.h && x.a === fx.a);
  t.hg = fx.home ? myG : opG; t.ag = fx.home ? opG : myG;
  const pens = pensMine ? (fx.home ? pensMine : [pensMine[1], pensMine[0]]) : null;
  if (pensMine) t.et = true;
  settle(state, cup, t, pens);
  const won = t.w === state.player.clubId;
  closeRound(state, cup, fx.ri, false);
  return { won, champion: cup.winner === state.player.clubId, tie: t };
}

// Kupa şampiyonluğu ödülü
export function reward(state, fx) {
  const p = state.player, C = CUPS[fx.cup];
  (p.trophies ||= []).push({ key: 'cup_' + fx.cup, year: state.season.year, club: p.clubId });
  p.fame = clamp((p.fame || 0) + C.fame, 0, 100);
  const bonus = Math.round(Math.max(p.contract.wage * 4, C.prize * 0.02) / 1000) * 1000;
  p.money += bonus + (p.contract.champ || 0);
  addInbox(state, `🏆 ${C.name} şampiyonu oldun! Kulüp primi: ${money(bonus)}${p.contract.champ ? ` + sözleşme primi ${money(p.contract.champ)}` : ''}.`);
  return bonus;
}

// Hub/ekran için durum
export function myStatus(state) {
  const C = ensure(state);
  if (!C) return null;
  const me = state.player.clubId, c = countryOf(state, me), cup = C.cups[c];
  if (!cup) return null;
  const nextRound = cup.rounds[cup.cur];
  return {
    country: c, name: CUPS[c].name, winner: cup.winner === me, champ: cup.winner,
    out: cup.out.includes(me), round: nextRound?.name || null, week: nextRound?.week ?? null,
  };
}

export const cupTeamsCount = (state, c) => teamsOf(state, c).length;
export { rand };
