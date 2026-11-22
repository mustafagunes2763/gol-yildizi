// Ara transfer dönemi (devre arası): iki haftalık pencere, kalıcı transfer ve kiralık teklifleri.
// Kiralık: sözleşmen ana kulübünde kalır, maaşını o öder; sezon sonunda ana kulübe dönersin.
import { addInbox, seasonOffers, overall, shuffle, randInt, leagueOf, money, selection } from './engine.js';
import { LEAGUES } from './data.js';

export const WINDOW_WEEKS = 2;
export const openWeek = (state) => Math.round((state.season.totalWeeks || 34) * 0.5);

export function isOpen(state) {
  const w = state.winter;
  return !!w && w.year === state.season.year && w.open && state.phase === 'hub';
}
export const weeksLeft = (state) => Math.max(0, (state.winter?.closes ?? 0) - state.season.week);
export const parentClub = (state) => state.player.loan?.from || state.player.clubId;

// Oyuncunun kulübünde aldığı süre (kiralık teklifleri için)
function playShare(state) {
  const p = state.player, wk = Math.max(1, state.season.week);
  return (p.season.starts || 0) / wk;
}

function makeOffers(state) {
  const p = state.player;
  const out = [];
  const avg = p.season.apps ? p.season.ratingSum / p.season.apps : 6;
  // kalıcı teklifler: sezon sonu mantığıyla, ama daha seçici (kulüpler ara dönemde daha az harcar)
  if (!p.loan && (avg >= 6.8 || (p.fame || 0) >= 35 || p.season.goals >= 8)) {
    for (const o of seasonOffers(state).slice(0, Math.random() < 0.5 ? 1 : 2)) {
      if (Math.random() < 0.75) out.push({ ...o, kind: 'transfer', years: Math.max(2, o.years) });
    }
  }
  // kiralık: kulübünde forma bulamıyorsan daha zayıf kulüpler forma garantisiyle ister
  const share = playShare(state);
  if (!p.loan && share < 0.45) {
    const ovr = overall(p), mine = state.teams[p.clubId];
    // gücüne uygun (biraz üstü) ve kulübünden zayıf takımlar
    const near = Object.values(state.teams).filter((t) => t.id !== p.clubId && leagueOf(state, t.id) && t.str < mine.str - 4)
      .sort((x, y) => Math.abs(x.str - (ovr + 8)) - Math.abs(y.str - (ovr + 8))).slice(0, 6);
    const pool = shuffle(near);
    for (const t of pool.slice(0, randInt(1, 2))) out.push({ clubId: t.id, kind: 'loan' });
  }
  return out;
}

// Her hafta (advanceWeek sonrası) çağrılır
export function weekly(state) {
  const s = state.season, p = state.player;
  const ow = openWeek(state);
  if (s.week === ow && state.winter?.year !== s.year) {
    const offers = makeOffers(state);
    state.winter = { year: s.year, open: true, closes: ow + WINDOW_WEEKS, offers };
    addInbox(state, offers.length
      ? `❄️ Ara transfer dönemi açıldı! Cengiz Demirel: "${offers.length} teklif var evlat, ${WINDOW_WEEKS} haftamız var. Ana ekrandan bak."`
      : '❄️ Ara transfer dönemi açıldı. Şimdilik masada teklif yok.');
    return;
  }
  if (state.winter?.open && state.winter.year === s.year && s.week >= state.winter.closes) {
    state.winter.open = false;
    if (state.winter.offers.length) addInbox(state, '❄️ Ara transfer dönemi kapandı. Kulübünde devam ediyorsun.');
    state.winter.offers = [];
  }
}

export function dismiss(state, i) {
  state.winter.offers.splice(i, 1);
}

// Kiralık git: sözleşme ve maaş ana kulüpte kalır (ana kulüp payı kadar)
export function acceptLoan(state, i, acceptOffer) {
  const o = state.winter.offers[i];
  const p = state.player;
  const from = p.clubId;
  acceptOffer(state, { clubId: o.clubId, wage: p.contract.wage, years: 1 }, { loan: true });
  p.loan = { from, to: o.clubId, year: state.season.year };
  p.weekFlags = { ...(p.weekFlags || {}), coachPromise: true };
  state.winter.offers = [];
  state.winter.open = false;
  addInbox(state, `🔁 Sezon sonuna kadar ${state.teams[o.clubId].name} formasını giyeceksin (kiralık). Maaşını ${state.teams[from].name} ödemeye devam ediyor.`);
  return { from, to: o.clubId };
}

export function acceptTransfer(state, i, acceptOffer, offerOverride) {
  const o = offerOverride || state.winter.offers[i];
  const old = state.player.clubId;
  acceptOffer(state, { clubId: o.clubId, wage: o.wage, years: o.years });
  state.player.loan = null;
  state.winter.offers = [];
  state.winter.open = false;
  return { old, to: o.clubId };
}

// Sezon sonunda kiralıktan dönüş (endSeason çağırır)
export function returnFromLoan(state) {
  const p = state.player;
  if (!p.loan) return null;
  const { from, to } = p.loan;
  p.loan = null;
  if (p.clubId === to) {
    p.clubId = from;
    addInbox(state, `🔁 Kiralık dönemin bitti, ${state.teams[from].name}'a döndün.`);
    return from;
  }
  return null;
}

export const offerLabel = (state, o) => o.kind === 'loan'
  ? `Kiralık · sezon sonuna kadar · forma şansı yüksek`
  : `${money(o.wage)}/hafta · ${o.years} yıl`;
export const leagueName = (state, id) => LEAGUES[leagueOf(state, id)]?.name || '';
export { selection };
