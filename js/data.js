// Takım verileri — 2026-27 sezonu.
// str: takım gücü (benim tahminim, 1-100). c1/c2: forma renkleri.
// Değiştirmek istersen buradaki değerleri düzenlemen yeterli.

import { KULUPLER } from './kulupler.js';
import { PL_TEAMS, EURO_TEAMS, UECL_TEAMS } from './data-europe.js';

export const SEASON_START_YEAR = 2026;

export const TEAMS = {
  // ---- Süper Lig ----
  gs:   { name: 'Galatasaray',     short: 'GS',  c1: '#A90432', c2: '#FDB912', str: 85 },
  fb:   { name: 'Fenerbahçe',      short: 'FB',  c1: '#0B2A6F', c2: '#FFE000', str: 84 },
  bjk:  { name: 'Beşiktaş',        short: 'BJK', c1: '#111111', c2: '#FFFFFF', str: 80 },
  ts:   { name: 'Trabzonspor',     short: 'TS',  c1: '#7A1F3D', c2: '#5BB4E5', str: 77 },
  ibfk: { name: 'Başakşehir',      short: 'İBFK',c1: '#F26522', c2: '#1B2A4A', str: 75 },
  sam:  { name: 'Samsunspor',      short: 'SAM', c1: '#E30613', c2: '#FFFFFF', str: 74 },
  goz:  { name: 'Göztepe',         short: 'GÖZ', c1: '#FFD200', c2: '#E30613', str: 73 },
  kas:  { name: 'Kasımpaşa',       short: 'KAS', c1: '#1C3F94', c2: '#FFFFFF', str: 71 },
  riz:  { name: 'Çaykur Rizespor', short: 'RİZ', c1: '#0B7A3B', c2: '#1E5AA8', str: 71 },
  aln:  { name: 'Alanyaspor',      short: 'ALN', c1: '#F58220', c2: '#0A7A3E', str: 71 },
  kon:  { name: 'Konyaspor',       short: 'KON', c1: '#0A7A3E', c2: '#FFFFFF', str: 70 },
  koc:  { name: 'Kocaelispor',     short: 'KOC', c1: '#0A7A3E', c2: '#111111', str: 70 },
  gfk:  { name: 'Gaziantep FK',    short: 'GFK', c1: '#D71920', c2: '#111111', str: 70 },
  eyp:  { name: 'Eyüpspor',        short: 'EYP', c1: '#6A2C91', c2: '#FFD200', str: 69 },
  gen:  { name: 'Gençlerbirliği',  short: 'GB',  c1: '#D71920', c2: '#111111', str: 69 },
  amd:  { name: 'Amedspor',        short: 'AMD', c1: '#0A7A3E', c2: '#D71920', str: 69 },
  cor:  { name: 'Çorum FK',        short: 'ÇOR', c1: '#D71920', c2: '#111111', str: 68 },
  erz:  { name: 'Erzurumspor',     short: 'ERZ', c1: '#1E5AA8', c2: '#FFFFFF', str: 67 },
  // ---- 1. Lig ----
  ant:  { name: 'Antalyaspor',     short: 'ANT', c1: '#D71920', c2: '#FFFFFF', str: 66 },
  kay:  { name: 'Kayserispor',     short: 'KAY', c1: '#FFD200', c2: '#D71920', str: 66 },
  bur:  { name: 'Bursaspor',       short: 'BUR', c1: '#0A7A3E', c2: '#FFFFFF', str: 65 },
  kgm:  { name: 'Fatih Karagümrük',short: 'FKG', c1: '#D71920', c2: '#111111', str: 64 },
  sivas:{ name: 'Sivasspor',       short: 'SİV', c1: '#D71920', c2: '#FFFFFF', str: 63 },
  igd:  { name: 'Iğdır FK',        short: 'IĞD', c1: '#1E5AA8', c2: '#FFFFFF', str: 63 },
  ero:  { name: 'Esenler Erokspor',short: 'ERO', c1: '#1E5AA8', c2: '#F58220', str: 63 },
  bod:  { name: 'Bodrum FK',       short: 'BOD', c1: '#0A7A3E', c2: '#FFFFFF', str: 62 },
  sar:  { name: 'Sarıyer',         short: 'SAR', c1: '#1B2A6F', c2: '#FFFFFF', str: 61 },
  bat:  { name: 'Batman Petrolspor',short:'BAT', c1: '#D71920', c2: '#111111', str: 61 },
  mar:  { name: 'Mardin 1969',     short: 'MAR', c1: '#D71920', c2: '#FFD200', str: 60 },
  kec:  { name: 'Keçiörengücü',    short: 'KEÇ', c1: '#7A1F3D', c2: '#FFFFFF', str: 60 },
  mug:  { name: 'Muğlaspor',       short: 'MUĞ', c1: '#F58220', c2: '#1E5AA8', str: 59 },
  ban:  { name: 'Bandırmaspor',    short: 'BAN', c1: '#D71920', c2: '#1E5AA8', str: 60 },
  pen:  { name: 'Pendikspor',      short: 'PEN', c1: '#D71920', c2: '#FFFFFF', str: 60 },
  umr:  { name: 'Ümraniyespor',    short: 'ÜMR', c1: '#D71920', c2: '#FFFFFF', str: 59 },
  man:  { name: 'Manisa FK',       short: 'MAN', c1: '#111111', c2: '#FFFFFF', str: 59 },
  van:  { name: 'Vanspor',         short: 'VAN', c1: '#D71920', c2: '#FFFFFF', str: 58 },
  ist:  { name: 'İstanbulspor',    short: 'İST', c1: '#FFD200', c2: '#111111', str: 57 },
  bol:  { name: 'Boluspor',        short: 'BOL', c1: '#D71920', c2: '#FFFFFF', str: 56 },
};
Object.assign(TEAMS, PL_TEAMS, EURO_TEAMS, UECL_TEAMS);

// Kulüp bilgisi: gerçek ana renk, stadyum, şehir, hoca, ezeli rakipler
for (const [id, k] of Object.entries(KULUPLER)) {
  const t = TEAMS[id];
  if (!t) continue;
  if (/^#[0-9a-f]{6}$/i.test(k.ana_renk || '')) t.c1 = k.ana_renk.toUpperCase();
  if (t.c1 === t.c2) t.c2 = t.c1 === '#FFFFFF' ? '#111111' : '#FFFFFF';
}
export const clubInfo = (id) => KULUPLER[id] || {};
const EN_DERBIES = [['ars', 'tot'], ['liv', 'eve'], ['mci', 'mun'], ['liv', 'mun'], ['new', 'sun'], ['che', 'tot'], ['ars', 'che'], ['lee', 'mun'], ['avl', 'bha']];
export const isDerby = (a, b) => {
  const big = ['gs', 'fb', 'bjk', 'ts'];
  if (EN_DERBIES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return true;
  return (big.includes(a) && big.includes(b)) || (KULUPLER[a]?.ezeli_rakipler || []).includes(b) || (KULUPLER[b]?.ezeli_rakipler || []).includes(a);
};

export const LEAGUES = {
  SL: { id: 'SL', name: 'Trendyol Süper Lig', tier: 1,
        teams: ['gs','fb','bjk','ts','ibfk','sam','goz','kas','riz','aln','kon','koc','gfk','eyp','gen','amd','cor','erz'],
        promote: 0, relegate: 3 },
  L1: { id: 'L1', name: 'Trendyol 1. Lig', tier: 2,
        teams: ['ant','kay','bur','kgm','sivas','igd','ero','bod','sar','bat','mar','kec','mug','ban','pen','umr','man','van','ist','bol'],
        promote: 3, relegate: 0 },
  PL: { id: 'PL', name: 'Premier Lig', tier: 1, country: 'ENG',
        teams: Object.keys(PL_TEAMS), promote: 0, relegate: 0 },
};

// Takım arkadaşı / rakip isimleri (gerçek kadrolar sonraki aşamada js/kadrolar.js ile gelecek)
export const FIRST_NAMES = ['Emre','Burak','Arda','Kerem','Mert','Yusuf','Ozan','Barış','Kaan','Can','Efe','Ali','Umut','Hakan','Serdar','Onur','Cenk','Eren','Berkay','Oğuz','Semih','Yunus','Doğukan','Furkan','İsmail','Abdülkadir','Mehmet','Enes','Tolga','Halil','Lucas','Mateo','Victor','Joao','Moussa','Ivan','Luka','Nikola','David','Kevin'];
export const LAST_NAMES = ['Yılmaz','Kaya','Demir','Şahin','Çelik','Aydın','Özdemir','Arslan','Doğan','Kılıç','Aslan','Çetin','Kara','Koç','Kurt','Özkan','Şimşek','Polat','Korkmaz','Erdem','Aktürk','Güler','Yıldız','Tosun','Kökçü','Silva','Santos','Diallo','Petrović','Horvat','Müller','Costa','Traoré','Novak','Fernandes'];

export const STAT_LABELS = {
  sut:    'Şut',
  pas:    'Pas',
  hiz:    'Hız',
  teknik: 'Teknik',
  guc:    'Güç',
};
