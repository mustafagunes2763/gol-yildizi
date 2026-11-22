// Premier Lig + Avrupa kupası takımları (2026-27)
// str: benim tahminim (Süper Lig ölçeğiyle; GS 85). Kadrosu Gemini'den gelmeyen takımlarda geçici uydurma isimler kullanılır.

export const PL_TEAMS = {
  ars: { name: 'Arsenal',           short: 'ARS', c1: '#DB0007', c2: '#FFFFFF', str: 91, country: 'ENG' },
  liv: { name: 'Liverpool',         short: 'LIV', c1: '#C8102E', c2: '#F6EB61', str: 90, country: 'ENG' },
  mci: { name: 'Manchester City',   short: 'MCI', c1: '#6CABDD', c2: '#1C2C5B', str: 90, country: 'ENG' },
  che: { name: 'Chelsea',           short: 'CHE', c1: '#034694', c2: '#FFFFFF', str: 87, country: 'ENG' },
  mun: { name: 'Manchester United', short: 'MUN', c1: '#DA291C', c2: '#FBE122', str: 85, country: 'ENG' },
  avl: { name: 'Aston Villa',       short: 'AVL', c1: '#670E36', c2: '#95BFE5', str: 84, country: 'ENG' },
  new: { name: 'Newcastle United',  short: 'NEW', c1: '#241F20', c2: '#FFFFFF', str: 84, country: 'ENG' },
  tot: { name: 'Tottenham',         short: 'TOT', c1: '#FFFFFF', c2: '#132257', str: 83, country: 'ENG' },
  bha: { name: 'Brighton',          short: 'BHA', c1: '#0057B8', c2: '#FFFFFF', str: 81, country: 'ENG' },
  cry: { name: 'Crystal Palace',    short: 'CRY', c1: '#1B458F', c2: '#C4122E', str: 81, country: 'ENG' },
  nfo: { name: 'Nottingham Forest', short: 'NFO', c1: '#DD0000', c2: '#FFFFFF', str: 80, country: 'ENG' },
  bou: { name: 'Bournemouth',       short: 'BOU', c1: '#DA291C', c2: '#111111', str: 80, country: 'ENG' },
  bre: { name: 'Brentford',         short: 'BRE', c1: '#E30613', c2: '#FFFFFF', str: 80, country: 'ENG' },
  ful: { name: 'Fulham',            short: 'FUL', c1: '#FFFFFF', c2: '#111111', str: 79, country: 'ENG' },
  eve: { name: 'Everton',           short: 'EVE', c1: '#003399', c2: '#FFFFFF', str: 79, country: 'ENG' },
  sun: { name: 'Sunderland',        short: 'SUN', c1: '#EB172B', c2: '#FFFFFF', str: 78, country: 'ENG' },
  lee: { name: 'Leeds United',      short: 'LEE', c1: '#FFFFFF', c2: '#1D428A', str: 78, country: 'ENG' },
  cov: { name: 'Coventry City',     short: 'COV', c1: '#59CBE8', c2: '#FFFFFF', str: 75, country: 'ENG' },
  ips: { name: 'Ipswich Town',      short: 'IPS', c1: '#0044AA', c2: '#FFFFFF', str: 75, country: 'ENG' },
  hul: { name: 'Hull City',         short: 'HUL', c1: '#F5A12D', c2: '#111111', str: 74, country: 'ENG' },
};

// Lig dışı Avrupa takımları (sadece kupada)
export const EURO_TEAMS = {
  psg: { name: 'Paris Saint-Germain', short: 'PSG', c1: '#004170', c2: '#DA291C', str: 92, country: 'FRA' },
  bay: { name: 'Bayern Münih',        short: 'BAY', c1: '#DC052D', c2: '#FFFFFF', str: 92, country: 'GER' },
  rma: { name: 'Real Madrid',         short: 'RMA', c1: '#FFFFFF', c2: '#FEBE10', str: 92, country: 'ESP' },
  int: { name: 'Inter',               short: 'INT', c1: '#0068A8', c2: '#111111', str: 89, country: 'ITA' },
  bar: { name: 'Barcelona',           short: 'BAR', c1: '#A50044', c2: '#004D98', str: 91, country: 'ESP' },
  atm: { name: 'Atlético Madrid',     short: 'ATM', c1: '#CB3524', c2: '#FFFFFF', str: 87, country: 'ESP' },
  bvb: { name: 'Borussia Dortmund',   short: 'BVB', c1: '#FDE100', c2: '#111111', str: 85, country: 'GER' },
  rom: { name: 'Roma',                short: 'ROM', c1: '#8E1F2F', c2: '#F0BC42', str: 83, country: 'ITA' },
  scp: { name: 'Sporting',            short: 'SCP', c1: '#008057', c2: '#FFFFFF', str: 83, country: 'POR' },
  por: { name: 'Porto',               short: 'POR', c1: '#00428C', c2: '#FFFFFF', str: 82, country: 'POR' },
  bru: { name: 'Club Brugge',         short: 'BRU', c1: '#0A2A5C', c2: '#111111', str: 80, country: 'BEL' },
  bet: { name: 'Real Betis',          short: 'BET', c1: '#00954C', c2: '#FFFFFF', str: 82, country: 'ESP' },
  psv: { name: 'PSV',                 short: 'PSV', c1: '#ED1C24', c2: '#FFFFFF', str: 81, country: 'NED' },
  fey: { name: 'Feyenoord',           short: 'FEY', c1: '#E30613', c2: '#FFFFFF', str: 80, country: 'NED' },
  lil: { name: 'Lille',               short: 'LIL', c1: '#E01E13', c2: '#1B2A4A', str: 81, country: 'FRA' },
  bodo: { name: 'Bodø/Glimt',          short: 'BOD', c1: '#FFE000', c2: '#111111', str: 77, country: 'NOR' },
  nap: { name: 'Napoli',              short: 'NAP', c1: '#12A0D7', c2: '#FFFFFF', str: 86, country: 'ITA' },
  rbl: { name: 'RB Leipzig',          short: 'RBL', c1: '#FFFFFF', c2: '#DD0741', str: 83, country: 'GER' },
  vil: { name: 'Villarreal',          short: 'VIL', c1: '#FFE667', c2: '#005187', str: 82, country: 'ESP' },
  sha: { name: 'Şahtar Donetsk',      short: 'SHA', c1: '#F26522', c2: '#111111', str: 77, country: 'UKR' },
  sla: { name: 'Slavia Prag',         short: 'SLA', c1: '#FFFFFF', c2: '#E30613', str: 77, country: 'CZE' },
  slo: { name: 'Slovan Bratislava',   short: 'SLO', c1: '#6CACE4', c2: '#FFFFFF', str: 72, country: 'SVK' },
  stu: { name: 'Stuttgart',           short: 'STU', c1: '#FFFFFF', c2: '#E32219', str: 82, country: 'GER' },
  aek: { name: 'AEK',                 short: 'AEK', c1: '#FFDD00', c2: '#111111', str: 76, country: 'GRE' },
  lask: { name: 'LASK',               short: 'LSK', c1: '#111111', c2: '#FFFFFF', str: 73, country: 'AUT' },
  com: { name: 'Como',                short: 'COM', c1: '#1A3E8C', c2: '#FFFFFF', str: 82, country: 'ITA' },
  lens: { name: 'Lens',               short: 'RCL', c1: '#FFD700', c2: '#E30613', str: 80, country: 'FRA' },
  vik: { name: 'Viking',              short: 'VIK', c1: '#1E5AA8', c2: '#FFFFFF', str: 72, country: 'NOR' },
  sab: { name: 'Sabah',               short: 'SAB', c1: '#0B3D91', c2: '#FFFFFF', str: 70, country: 'AZE' },
  // Avrupa Ligi
  mil: { name: 'Milan',               short: 'MIL', c1: '#FB090B', c2: '#111111', str: 86, country: 'ITA' },
  juv: { name: 'Juventus',            short: 'JUV', c1: '#FFFFFF', c2: '#111111', str: 86, country: 'ITA' },
  rso: { name: 'Real Sociedad',       short: 'RSO', c1: '#0067B1', c2: '#FFFFFF', str: 81, country: 'ESP' },
  cel: { name: 'Celta',               short: 'CEL', c1: '#8AC3EE', c2: '#FFFFFF', str: 80, country: 'ESP' },
  hof: { name: 'Hoffenheim',          short: 'HOF', c1: '#1C63B7', c2: '#FFFFFF', str: 80, country: 'GER' },
  lev: { name: 'Leverkusen',          short: 'LEV', c1: '#E32221', c2: '#111111', str: 85, country: 'GER' },
  om:  { name: 'Marsilya',            short: 'OM',  c1: '#FFFFFF', c2: '#2FAEE0', str: 83, country: 'FRA' },
  ren: { name: 'Rennes',              short: 'REN', c1: '#E13327', c2: '#111111', str: 79, country: 'FRA' },
  az:  { name: 'AZ Alkmaar',          short: 'AZ',  c1: '#DB0021', c2: '#FFFFFF', str: 78, country: 'NED' },
  tor: { name: 'Torreense',           short: 'TOR', c1: '#1B4F9C', c2: '#FFFFFF', str: 70, country: 'POR' },
  clj: { name: 'Celje',               short: 'CLJ', c1: '#1E5AA8', c2: '#FFD200', str: 71, country: 'SVN' },
  clt: { name: 'Celtic',              short: 'CLT', c1: '#018749', c2: '#FFFFFF', str: 78, country: 'SCO' },
  din: { name: 'Dinamo Zagreb',       short: 'DIN', c1: '#0F4C9C', c2: '#FFFFFF', str: 76, country: 'CRO' },
  hbs: { name: 'Hapoel Beer-Sheva',   short: 'HBS', c1: '#E30613', c2: '#FFFFFF', str: 72, country: 'ISR' },
  lvs: { name: 'Levski Sofya',        short: 'LVS', c1: '#1E4AA8', c2: '#FFFFFF', str: 71, country: 'BUL' },
  lyo: { name: 'Lyon',                short: 'OL',  c1: '#FFFFFF', c2: '#1A2C6B', str: 82, country: 'FRA' },
  nec: { name: 'NEC',                 short: 'NEC', c1: '#E30613', c2: '#0A7A3E', str: 75, country: 'NED' },
  oly: { name: 'Olympiakos',          short: 'OLY', c1: '#E30613', c2: '#FFFFFF', str: 79, country: 'GRE' },
  spa: { name: 'Sparta Prag',         short: 'SPA', c1: '#8B1A2B', c2: '#FFFFFF', str: 77, country: 'CZE' },
  stg: { name: 'Sturm Graz',          short: 'STG', c1: '#111111', c2: '#FFFFFF', str: 75, country: 'AUT' },
  usg: { name: 'Union SG',            short: 'USG', c1: '#FFD700', c2: '#1E4AA8', str: 77, country: 'BEL' },
  and: { name: 'Anderlecht',          short: 'AND', c1: '#5A2D82', c2: '#FFFFFF', str: 77, country: 'BEL' },
  ara: { name: 'Ararat-Armenia',      short: 'ARA', c1: '#FFD200', c2: '#1E4AA8', str: 68, country: 'ARM' },
  ben: { name: 'Benfica',             short: 'BEN', c1: '#E30613', c2: '#FFFFFF', str: 84, country: 'POR' },
  fer: { name: 'Ferencváros',         short: 'FTC', c1: '#0A7A3E', c2: '#FFFFFF', str: 75, country: 'HUN' },
  jag: { name: 'Jagiellonia',         short: 'JAG', c1: '#FFD200', c2: '#E30613', str: 72, country: 'POL' },
  lch: { name: 'Lech Poznań',         short: 'LCH', c1: '#1E4AA8', c2: '#FFFFFF', str: 74, country: 'POL' },
  lil2: { name: 'Lillestrøm',         short: 'LSK', c1: '#FFD200', c2: '#111111', str: 70, country: 'NOR' },
  ofi: { name: 'OFI Girit',           short: 'OFI', c1: '#111111', c2: '#FFFFFF', str: 69, country: 'GRE' },
  omo: { name: 'Omonia',              short: 'OMO', c1: '#0A7A3E', c2: '#FFFFFF', str: 70, country: 'CYP' },
  rbs: { name: 'Salzburg',            short: 'RBS', c1: '#FFFFFF', c2: '#E30613', str: 77, country: 'AUT' },
  plz: { name: 'Viktoria Plzeň',      short: 'PLZ', c1: '#E30613', c2: '#1E4AA8', str: 74, country: 'CZE' },
};

// La Liga 2026-27: kupa takımlarında olmayan 12 kulüp (Real Madrid, Barcelona, Atlético, Betis, Villarreal,
// Real Sociedad, Celta ve Getafe zaten EURO/UECL listelerinde)
export const LL_NEW = {
  ath: { name: 'Athletic Bilbao',     short: 'ATH', c1: '#EE2523', c2: '#FFFFFF', str: 80, country: 'ESP' },
  sev: { name: 'Sevilla',             short: 'SEV', c1: '#FFFFFF', c2: '#D81920', str: 77, country: 'ESP' },
  val: { name: 'Valencia',            short: 'VAL', c1: '#FFFFFF', c2: '#111111', str: 77, country: 'ESP' },
  osa: { name: 'Osasuna',             short: 'OSA', c1: '#C8102E', c2: '#0A2240', str: 75, country: 'ESP' },
  ray: { name: 'Rayo Vallecano',      short: 'RAY', c1: '#FFFFFF', c2: '#E30613', str: 75, country: 'ESP' },
  esp: { name: 'Espanyol',            short: 'ESP', c1: '#1E5AA8', c2: '#FFFFFF', str: 74, country: 'ESP' },
  ala: { name: 'Alavés',              short: 'ALA', c1: '#1E5AA8', c2: '#FFFFFF', str: 74, country: 'ESP' },
  elc: { name: 'Elche',               short: 'ELC', c1: '#FFFFFF', c2: '#0A7A3E', str: 73, country: 'ESP' },
  lvt: { name: 'Levante',             short: 'LEV', c1: '#1E3C8C', c2: '#B7102E', str: 73, country: 'ESP' },
  dep: { name: 'Deportivo La Coruña', short: 'DEP', c1: '#1E5AA8', c2: '#FFFFFF', str: 73, country: 'ESP' },
  rac: { name: 'Racing Santander',    short: 'RAC', c1: '#0A7A3E', c2: '#FFFFFF', str: 72, country: 'ESP' },
  mlg: { name: 'Málaga',              short: 'MAL', c1: '#6CACE4', c2: '#FFFFFF', str: 72, country: 'ESP' },
};

// Konferans Ligi 2026-27 lig aşaması (gerçek katılımcılar) + ön eleme rakipleri (yedek havuz)
export const UECL_TEAMS = {
  ata: { name: 'Atalanta',            short: 'ATA', c1: '#1E71B8', c2: '#111111', str: 83, country: 'ITA' },
  frb: { name: 'Freiburg',            short: 'SCF', c1: '#E30613', c2: '#111111', str: 80, country: 'GER' },
  mon: { name: 'Monaco',              short: 'ASM', c1: '#E30613', c2: '#FFFFFF', str: 80, country: 'FRA' },
  get: { name: 'Getafe',              short: 'GET', c1: '#005999', c2: '#FFFFFF', str: 77, country: 'ESP' },
  bra: { name: 'Braga',               short: 'BRA', c1: '#E30613', c2: '#FFFFFF', str: 78, country: 'POR' },
  aja: { name: 'Ajax',                short: 'AJA', c1: '#FFFFFF', c2: '#D2122E', str: 79, country: 'NED' },
  twe: { name: 'Twente',              short: 'TWE', c1: '#E30613', c2: '#FFFFFF', str: 75, country: 'NED' },
  gnt: { name: 'Gent',                short: 'GNT', c1: '#1B4B9C', c2: '#FFFFFF', str: 74, country: 'BEL' },
  stv: { name: 'Sint-Truiden',        short: 'STV', c1: '#FFD200', c2: '#1B4B9C', str: 71, country: 'BEL' },
  jab: { name: 'Jablonec',            short: 'JAB', c1: '#0A7A3E', c2: '#FFFFFF', str: 69, country: 'CZE' },
  pao: { name: 'Panathinaikos',       short: 'PAO', c1: '#0A7A3E', c2: '#FFFFFF', str: 74, country: 'GRE' },
  agf: { name: 'Aarhus',              short: 'AGF', c1: '#FFFFFF', c2: '#111111', str: 70, country: 'DEN' },
  fck: { name: 'Kopenhag',            short: 'FCK', c1: '#FFFFFF', c2: '#1B4B9C', str: 74, country: 'DEN' },
  fcm: { name: 'Midtjylland',         short: 'FCM', c1: '#111111', c2: '#E30613', str: 74, country: 'DEN' },
  fcn: { name: 'Nordsjælland',        short: 'FCN', c1: '#E30613', c2: '#FFD200', str: 70, country: 'DEN' },
  brn: { name: 'Brann',               short: 'BRN', c1: '#E30613', c2: '#FFFFFF', str: 71, country: 'NOR' },
  pfs: { name: 'Pafos',               short: 'PAF', c1: '#1B4B9C', c2: '#FFFFFF', str: 71, country: 'CYP' },
  lug: { name: 'Lugano',              short: 'LUG', c1: '#111111', c2: '#FFFFFF', str: 70, country: 'SUI' },
  thu: { name: 'Thun',                short: 'THU', c1: '#E30613', c2: '#FFFFFF', str: 68, country: 'SUI' },
  hea: { name: 'Hearts',              short: 'HEA', c1: '#7A1F3D', c2: '#FFFFFF', str: 70, country: 'SCO' },
  mjb: { name: 'Mjällby',             short: 'MJB', c1: '#FFD200', c2: '#111111', str: 67, country: 'SWE' },
  haj: { name: 'Hajduk Split',        short: 'HAJ', c1: '#FFFFFF', c2: '#1B4B9C', str: 71, country: 'CRO' },
  czv: { name: 'Kızılyıldız',         short: 'CZV', c1: '#E30613', c2: '#FFFFFF', str: 75, country: 'SRB' },
  ucr: { name: 'Universitatea Craiova', short: 'UCV', c1: '#6CACE4', c2: '#FFFFFF', str: 70, country: 'ROU' },
  kai: { name: 'Kairat Almatı',       short: 'KAI', c1: '#FFD200', c2: '#111111', str: 68, country: 'KAZ' },
  csk: { name: 'CSKA Sofya',          short: 'CSK', c1: '#E30613', c2: '#FFFFFF', str: 69, country: 'BUL' },
  kup: { name: 'KuPS',                short: 'KUP', c1: '#FFD200', c2: '#111111', str: 65, country: 'FIN' },
  bor: { name: 'Borac Banja Luka',    short: 'BOR', c1: '#E30613', c2: '#1B4B9C', str: 65, country: 'BIH' },
  rig: { name: 'Riga FC',             short: 'RIG', c1: '#1B4B9C', c2: '#FFFFFF', str: 65, country: 'LVA' },
  egn: { name: 'Egnatia',             short: 'EGN', c1: '#E30613', c2: '#111111', str: 63, country: 'ALB' },
  kau: { name: 'Kauno Žalgiris',      short: 'KAU', c1: '#0A7A3E', c2: '#FFFFFF', str: 64, country: 'LTU' },
  lri: { name: 'Lincoln Red Imps',    short: 'LRI', c1: '#E30613', c2: '#FFFFFF', str: 60, country: 'GIB' },
  ies: { name: 'Inter Escaldes',      short: 'IES', c1: '#1B4B9C', c2: '#FFD200', str: 58, country: 'AND' },
  ibe: { name: 'Iberia 1999',         short: 'IBE', c1: '#E30613', c2: '#FFFFFF', str: 63, country: 'GEO' },
  // ön eleme rakipleri (lig aşamasında değiller)
  rap: { name: 'Rapid Viyana',        short: 'RAP', c1: '#0A7A3E', c2: '#FFFFFF', str: 72, country: 'AUT' },
  leg: { name: 'Legia Varşova',       short: 'LEG', c1: '#FFFFFF', c2: '#0A7A3E', str: 72, country: 'POL' },
  mta: { name: 'Maccabi Tel Aviv',    short: 'MTA', c1: '#FFD200', c2: '#1B4B9C', str: 71, country: 'ISR' },
  par: { name: 'Partizan',            short: 'PAR', c1: '#111111', c2: '#FFFFFF', str: 71, country: 'SRB' },
  ros: { name: 'Rosenborg',           short: 'RBK', c1: '#FFFFFF', c2: '#111111', str: 69, country: 'NOR' },
  bas: { name: 'Basel',               short: 'BAS', c1: '#E30613', c2: '#1B4B9C', str: 73, country: 'SUI' },
  yb:  { name: 'Young Boys',          short: 'YB',  c1: '#FFD200', c2: '#111111', str: 74, country: 'SUI' },
  shr: { name: 'Shamrock Rovers',     short: 'SHR', c1: '#0A7A3E', c2: '#FFFFFF', str: 66, country: 'IRL' },
  gor: { name: 'Górnik Zabrze',       short: 'GOR', c1: '#1B4B9C', c2: '#FFFFFF', str: 69, country: 'POL' },
  rij: { name: 'Rijeka',              short: 'RIJ', c1: '#FFFFFF', c2: '#1B4B9C', str: 70, country: 'CRO' },
  mal: { name: 'Malmö',               short: 'MFF', c1: '#6CACE4', c2: '#FFFFFF', str: 72, country: 'SWE' },
  lud: { name: 'Ludogorets',          short: 'LUD', c1: '#0A7A3E', c2: '#FFFFFF', str: 72, country: 'BUL' },
  fcsb: { name: 'FCSB',               short: 'FCS', c1: '#E30613', c2: '#1B4B9C', str: 71, country: 'ROU' },
  qar: { name: 'Karabağ',             short: 'QAR', c1: '#111111', c2: '#FFFFFF', str: 74, country: 'AZE' },
};
export const UECL_2026 = ['bha', 'ata', 'get', 'frb', 'mon', 'bra', 'aja', 'twe', 'gnt', 'stv', 'ts', 'jab', 'pao', 'agf', 'fck', 'fcm', 'fcn', 'brn',
  'pfs', 'lug', 'thu', 'hea', 'mjb', 'haj', 'czv', 'ucr', 'kai', 'csk', 'kup', 'bor', 'rig', 'egn', 'kau', 'lri', 'ies', 'ibe'];
export const QUAL_RESERVE = ['rap', 'leg', 'mta', 'par', 'ros', 'bas', 'yb', 'shr', 'gor', 'rij', 'mal', 'lud', 'fcsb', 'qar'];
// 2026 Süper Kupa: Şampiyonlar Ligi şampiyonu PSG – Avrupa Ligi şampiyonu Aston Villa
export const SUPER_2026 = ['psg', 'avl'];

// 2026-27 gerçek katılımcılar (sonraki sezonlarda Türk ve İngiliz takımları puan durumuna göre değişir)
export const UCL_2026 = ['psg', 'bay', 'rma', 'liv', 'int', 'mci', 'ars', 'bar', 'atm', 'bvb', 'rom', 'scp', 'avl', 'por', 'mun', 'bru', 'bet', 'psv',
  'fey', 'lil', 'bodo', 'nap', 'rbl', 'vil', 'fb', 'sha', 'gs', 'sla', 'slo', 'stu', 'aek', 'lask', 'com', 'lens', 'vik', 'sab'];
export const UEL_2026 = ['cry', 'bou', 'sun', 'mil', 'juv', 'rso', 'cel', 'hof', 'lev', 'om', 'ren', 'az', 'tor', 'clj', 'clt', 'din', 'hbs', 'lvs',
  'lyo', 'nec', 'oly', 'spa', 'stg', 'usg', 'and', 'ara', 'ben', 'bjk', 'fer', 'jag', 'lch', 'lil2', 'ofi', 'omo', 'rbs', 'plz'];
// Kontenjan: Türkiye UCL 2 / UEL 1, İngiltere UCL 5 / UEL 3
// Kontenjan (lig sırası): doğrudan katılanlar. Türkiye'nin elemeli yolları QUAL_PATHS'te.
export const EURO_SLOTS = { TUR: { UCL: 1, UEL: 0, UECL: 0, league: 'SL' }, ENG: { UCL: 5, UEL: 2, UECL: 1, league: 'PL' }, ESP: { UCL: 5, UEL: 2, UECL: 1, league: 'LL' }, ITA: { UCL: 4, UEL: 2, UECL: 1, league: 'SA' }, GER: { UCL: 4, UEL: 2, UECL: 1, league: 'BL' }, FRA: { UCL: 4, UEL: 1, UECL: 1, league: 'FR' }, NED: { UCL: 2, UEL: 1, UECL: 1, league: 'NL' }, POR: { UCL: 2, UEL: 1, UECL: 1, league: 'PT' }, BEL: { UCL: 1, UEL: 1, UECL: 1, league: 'BE' }, GRE: { UCL: 1, UEL: 1, UECL: 1, league: 'GRE' }, CZE: { UCL: 1, UEL: 1, UECL: 1, league: 'CZE' }, DEN: { UCL: 1, UEL: 1, UECL: 1, league: 'DEN' }, NOR: { UCL: 1, UEL: 1, UECL: 1, league: 'NOR' }, SCO: { UCL: 0, UEL: 1, UECL: 1, league: 'SCO' }, AUT: { UCL: 0, UEL: 1, UECL: 1, league: 'AUT' }, SUI: { UCL: 0, UEL: 1, UECL: 1, league: 'SUI' }, POL: { UCL: 0, UEL: 1, UECL: 1, league: 'POL' } };
// TFF 2026-27 erişim listesi (Türkiye Kupası oyunda yok: kupa şampiyonunun yerini lig 3.'sü alır).
// 2. ön eleme Temmuz'da oynandığı için oyunda 3. ön elemeden başlanır.
export const QUAL_PATHS = [
  { pos: 2, comp: 'UCL', rounds: ['3. ön eleme', 'Play-off turu'] },
  { pos: 3, comp: 'UEL', rounds: ['Play-off turu'] },
  { pos: 4, comp: 'UEL', rounds: ['3. ön eleme', 'Play-off turu'] },
  { pos: 5, comp: 'UECL', rounds: ['3. ön eleme', 'Play-off turu'] },
];

// Kadrosu olmayan takımlar için ülkeye göre geçici isimler (uydurma)
export const NAME_POOLS = {
  ENG: [['Jack', 'Harry', 'Oliver', 'George', 'Charlie', 'Jacob', 'Alfie', 'Freddie', 'Archie', 'Leo', 'Mason', 'Tom', 'Ben', 'Sam', 'Ryan', 'Callum', 'Jordan', 'Kyle'],
    ['Walker', 'Hughes', 'Bennett', 'Carter', 'Fletcher', 'Barnes', 'Reid', 'Turner', 'Webb', 'Holt', 'Marsh', 'Price', 'Ward', 'Cole', 'Hayes', 'Burke', 'Dunn', 'Wells']],
  ESP: [['Pablo', 'Álvaro', 'Hugo', 'Mario', 'Diego', 'Iker', 'Adrián', 'Sergio', 'Javier', 'Raúl', 'Unai', 'Marcos'], ['Moreno', 'Navarro', 'Ruiz', 'Ortega', 'Serrano', 'Molina', 'Castro', 'Delgado', 'Vidal', 'Iglesias', 'Romero', 'Cano']],
  ITA: [['Luca', 'Matteo', 'Marco', 'Andrea', 'Davide', 'Simone', 'Lorenzo', 'Federico', 'Nicolò', 'Pietro'], ['Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Marino', 'Greco', 'Conti', 'Gallo', 'Fontana']],
  GER: [['Lukas', 'Jonas', 'Leon', 'Finn', 'Felix', 'Niklas', 'Tim', 'Moritz', 'Paul', 'Jan'], ['Müller', 'Schmidt', 'Weber', 'Wagner', 'Becker', 'Hoffmann', 'Koch', 'Richter', 'Wolf', 'Krause']],
  FRA: [['Lucas', 'Hugo', 'Théo', 'Nathan', 'Enzo', 'Mathis', 'Louis', 'Jules', 'Rayan', 'Yanis'], ['Martin', 'Bernard', 'Dubois', 'Laurent', 'Lefèvre', 'Girard', 'Moreau', 'Fontaine', 'Mercier', 'Blanc']],
  POR: [['João', 'Tiago', 'Rafael', 'Diogo', 'Gonçalo', 'Rúben', 'Nuno', 'Bruno'], ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Costa', 'Oliveira', 'Martins', 'Sousa']],
  NED: [['Daan', 'Sem', 'Bram', 'Lars', 'Thijs', 'Jesse', 'Milan', 'Ruben'], ['de Vries', 'Jansen', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder']],
  GEN: [['Adam', 'Luka', 'David', 'Ivan', 'Marko', 'Nikola', 'Tomas', 'Filip', 'Erik', 'Mateo', 'Petar', 'Andrej', 'Kristian', 'Dominik'],
    ['Novak', 'Horvat', 'Kovač', 'Popov', 'Nielsen', 'Hansen', 'Dimitrov', 'Petrov', 'Nowak', 'Kowalski', 'Varga', 'Papadopoulos', 'Berg', 'Lund']],
};

// Serie A 2026-27 (Inter, Milan, Juventus, Napoli, Roma, Como, Atalanta zaten EURO_TEAMS'te). Yükselen: Venezia, Frosinone, Monza.
export const SA_NEW = {
  laz: { name: 'Lazio',      short: 'LAZ', c1: '#87D8F7', c2: '#FFFFFF', str: 80, country: 'ITA' },
  bgn: { name: 'Bologna',    short: 'BOL', c1: '#A21C26', c2: '#1A2F48', str: 80, country: 'ITA' },
  fio: { name: 'Fiorentina', short: 'FIO', c1: '#4B2884', c2: '#FFFFFF', str: 78, country: 'ITA' },
  trn: { name: 'Torino',     short: 'TOR', c1: '#8A1E03', c2: '#FFFFFF', str: 76, country: 'ITA' },
  udi: { name: 'Udinese',    short: 'UDI', c1: '#111111', c2: '#FFFFFF', str: 75, country: 'ITA' },
  gea: { name: 'Genoa',      short: 'GEN', c1: '#A3001E', c2: '#002B5C', str: 75, country: 'ITA' },
  sas: { name: 'Sassuolo',   short: 'SAS', c1: '#00A752', c2: '#111111', str: 75, country: 'ITA' },
  cag: { name: 'Cagliari',   short: 'CAG', c1: '#A50034', c2: '#002350', str: 74, country: 'ITA' },
  prm: { name: 'Parma',      short: 'PAR', c1: '#FFDD00', c2: '#1B3D8F', str: 74, country: 'ITA' },
  lec: { name: 'Lecce',      short: 'LEC', c1: '#FFD100', c2: '#D2001F', str: 72, country: 'ITA' },
  ven: { name: 'Venezia',    short: 'VEN', c1: '#111111', c2: '#F37021', str: 72, country: 'ITA' },
  mnz: { name: 'Monza',      short: 'MON', c1: '#E30613', c2: '#FFFFFF', str: 72, country: 'ITA' },
  fro: { name: 'Frosinone',  short: 'FRO', c1: '#FFDD00', c2: '#0055A4', str: 71, country: 'ITA' },
};
// Bundesliga 2026-27 (Bayern, Dortmund, Leipzig, Stuttgart, Leverkusen, Hoffenheim, Freiburg zaten var). Yükselen: Schalke, Elversberg, Paderborn.
export const BL_NEW = {
  sge: { name: 'Eintracht Frankfurt', short: 'SGE', c1: '#E1000F', c2: '#111111', str: 81, country: 'GER' },
  bmg: { name: "Mönchengladbach",     short: 'BMG', c1: '#FFFFFF', c2: '#111111', str: 77, country: 'GER' },
  fcu: { name: 'Union Berlin',        short: 'FCU', c1: '#D4011D', c2: '#FFFFFF', str: 76, country: 'GER' },
  m05: { name: 'Mainz 05',            short: 'M05', c1: '#C3141E', c2: '#FFFFFF', str: 76, country: 'GER' },
  svw: { name: 'Werder Bremen',       short: 'SVW', c1: '#1D9053', c2: '#FFFFFF', str: 76, country: 'GER' },
  fca: { name: 'Augsburg',            short: 'FCA', c1: '#BA3733', c2: '#46714D', str: 75, country: 'GER' },
  koe: { name: 'Köln',                short: 'KOE', c1: '#FFFFFF', c2: '#ED1C24', str: 75, country: 'GER' },
  hsv: { name: 'Hamburg',             short: 'HSV', c1: '#FFFFFF', c2: '#0A3F86', str: 75, country: 'GER' },
  s04: { name: 'Schalke 04',          short: 'S04', c1: '#004D9D', c2: '#FFFFFF', str: 74, country: 'GER' },
  sve: { name: 'Elversberg',          short: 'SVE', c1: '#111111', c2: '#FFFFFF', str: 71, country: 'GER' },
  pad: { name: 'Paderborn',           short: 'SCP', c1: '#005CA9', c2: '#111111', str: 71, country: 'GER' },
};
// Ligue 1 2026-27 (PSG, Marsilya, Monaco, Lille, Lyon, Lens, Rennes zaten var). Yükselen: Troyes, Le Mans.
export const FR_NEW = {
  nic: { name: 'Nice',       short: 'NIC', c1: '#D2001F', c2: '#111111', str: 78, country: 'FRA' },
  str: { name: 'Strasbourg', short: 'STR', c1: '#0098D8', c2: '#FFFFFF', str: 78, country: 'FRA' },
  bst: { name: 'Brest',      short: 'BRE', c1: '#ED1C24', c2: '#FFFFFF', str: 76, country: 'FRA' },
  tfc: { name: 'Toulouse',   short: 'TFC', c1: '#5B2B82', c2: '#FFFFFF', str: 76, country: 'FRA' },
  pfc: { name: 'Paris FC',   short: 'PFC', c1: '#1B2D59', c2: '#FFFFFF', str: 74, country: 'FRA' },
  aux: { name: 'Auxerre',    short: 'AUX', c1: '#FFFFFF', c2: '#0055A4', str: 73, country: 'FRA' },
  ang: { name: 'Angers',     short: 'ANG', c1: '#111111', c2: '#FFFFFF', str: 72, country: 'FRA' },
  hac: { name: 'Le Havre',   short: 'HAC', c1: '#7AB8E6', c2: '#0A2240', str: 72, country: 'FRA' },
  lor: { name: 'Lorient',    short: 'LOR', c1: '#F58220', c2: '#111111', str: 72, country: 'FRA' },
  tro: { name: 'Troyes',     short: 'TRO', c1: '#0055A4', c2: '#FFFFFF', str: 71, country: 'FRA' },
  lms: { name: 'Le Mans',    short: 'LMS', c1: '#E30613', c2: '#FFD100', str: 70, country: 'FRA' },
};

// Eredivisie 2026-27 (PSV, Feyenoord, AZ, NEC, Ajax, Twente zaten var). Yükselen: ADO Den Haag, Cambuur, Willem II.
export const NL_NEW = {
  utr: { name: 'Utrecht',          short: 'UTR', c1: '#E30613', c2: '#FFFFFF', str: 75, country: 'NED' },
  gae: { name: 'Go Ahead Eagles',  short: 'GAE', c1: '#E30613', c2: '#FFD100', str: 73, country: 'NED' },
  gro: { name: 'Groningen',        short: 'GRO', c1: '#00A651', c2: '#FFFFFF', str: 72, country: 'NED' },
  hee: { name: 'Heerenveen',       short: 'HEE', c1: '#0055A4', c2: '#FFFFFF', str: 72, country: 'NED' },
  pec: { name: 'PEC Zwolle',       short: 'PEC', c1: '#0055A4', c2: '#FFFFFF', str: 70, country: 'NED' },
  spr: { name: 'Sparta Rotterdam', short: 'SPA', c1: '#E30613', c2: '#FFFFFF', str: 70, country: 'NED' },
  fsi: { name: 'Fortuna Sittard',  short: 'FOR', c1: '#FFD100', c2: '#00A651', str: 70, country: 'NED' },
  exc: { name: 'Excelsior',        short: 'EXC', c1: '#E30613', c2: '#111111', str: 68, country: 'NED' },
  tel: { name: 'Telstar',          short: 'TEL', c1: '#FFFFFF', c2: '#0055A4', str: 67, country: 'NED' },
  ado: { name: 'ADO Den Haag',     short: 'ADO', c1: '#FFD100', c2: '#00A651', str: 68, country: 'NED' },
  cam: { name: 'Cambuur',          short: 'CAM', c1: '#FFD100', c2: '#0055A4', str: 67, country: 'NED' },
  wil: { name: 'Willem II',        short: 'WIL', c1: '#E30613', c2: '#0A2240', str: 67, country: 'NED' },
};
// Liga Portugal 2026-27 (Benfica, Porto, Sporting, Braga zaten var). Yükselen: Marítimo, Académico de Viseu.
export const PT_NEW = {
  vsc: { name: 'Vitória Guimarães', short: 'VSC', c1: '#FFFFFF', c2: '#111111', str: 74, country: 'POR' },
  scl: { name: 'Santa Clara',       short: 'SCL', c1: '#E30613', c2: '#FFFFFF', str: 72, country: 'POR' },
  fam: { name: 'Famalicão',         short: 'FAM', c1: '#0A2240', c2: '#FFFFFF', str: 73, country: 'POR' },
  est: { name: 'Estoril',           short: 'EST', c1: '#FFD100', c2: '#0055A4', str: 71, country: 'POR' },
  gil: { name: 'Gil Vicente',       short: 'GIL', c1: '#E30613', c2: '#0055A4', str: 71, country: 'POR' },
  mor: { name: 'Moreirense',        short: 'MOR', c1: '#00A651', c2: '#FFFFFF', str: 70, country: 'POR' },
  rav: { name: 'Rio Ave',           short: 'RAV', c1: '#00A651', c2: '#FFFFFF', str: 70, country: 'POR' },
  aro: { name: 'Arouca',            short: 'ARO', c1: '#FFD100', c2: '#0055A4', str: 70, country: 'POR' },
  cpi: { name: 'Casa Pia',          short: 'CPI', c1: '#111111', c2: '#FFFFFF', str: 69, country: 'POR' },
  nac: { name: 'Nacional',          short: 'NAC', c1: '#111111', c2: '#FFFFFF', str: 68, country: 'POR' },
  ead: { name: 'Estrela Amadora',   short: 'EAD', c1: '#E30613', c2: '#00A651', str: 68, country: 'POR' },
  alv: { name: 'Alverca',           short: 'ALV', c1: '#E30613', c2: '#FFFFFF', str: 68, country: 'POR' },
  mrt: { name: 'Marítimo',          short: 'MAR', c1: '#00A651', c2: '#E30613', str: 67, country: 'POR' },
  acv: { name: 'Académico de Viseu', short: 'ACV', c1: '#111111', c2: '#FFFFFF', str: 66, country: 'POR' },
};
// Jupiler Pro League 2026-27, 18 takım (Club Brugge, Union SG, Anderlecht, Gent, Sint-Truiden zaten var). Yükselen: Beveren, Kortrijk, Lommel.
export const BE_NEW = {
  gnk:  { name: 'Genk',             short: 'GNK', c1: '#0055A4', c2: '#FFFFFF', str: 75, country: 'BEL' },
  rafc: { name: 'Antwerp',          short: 'ANT', c1: '#E30613', c2: '#FFFFFF', str: 73, country: 'BEL' },
  sta:  { name: 'Standard Liège',   short: 'STA', c1: '#E30613', c2: '#FFFFFF', str: 72, country: 'BEL' },
  wes:  { name: 'Westerlo',         short: 'WES', c1: '#FFD100', c2: '#0055A4', str: 70, country: 'BEL' },
  kvm:  { name: 'Mechelen',         short: 'KVM', c1: '#FFD100', c2: '#E30613', str: 70, country: 'BEL' },
  cha:  { name: 'Charleroi',        short: 'CHA', c1: '#111111', c2: '#FFFFFF', str: 70, country: 'BEL' },
  ohl:  { name: 'OH Leuven',        short: 'OHL', c1: '#FFFFFF', c2: '#00A651', str: 68, country: 'BEL' },
  cer:  { name: 'Cercle Brugge',    short: 'CER', c1: '#00A651', c2: '#111111', str: 68, country: 'BEL' },
  zwa:  { name: 'Zulte Waregem',    short: 'ZWA', c1: '#E30613', c2: '#00A651', str: 67, country: 'BEL' },
  lal:  { name: 'La Louvière',      short: 'LAL', c1: '#00A651', c2: '#FFFFFF', str: 66, country: 'BEL' },
  bev:  { name: 'Beveren',          short: 'BEV', c1: '#FFD100', c2: '#0055A4', str: 67, country: 'BEL' },
  kor:  { name: 'Kortrijk',         short: 'KOR', c1: '#E30613', c2: '#FFFFFF', str: 67, country: 'BEL' },
  lom:  { name: 'Lommel',           short: 'LOM', c1: '#00A651', c2: '#FFFFFF', str: 66, country: 'BEL' },
};

// ================================================================ YENİ LİGLER (2026-27; Norveç 2026 sezonu)
// Kadrolar şimdilik ülkeye göre uydurma isimlerle doluyor; gerçek kadrolar CSV ile eklenecek.
const T = (name, short, c1, c2, str, country) => ({ name, short, c1, c2, str, country });
// İskoçya Premiership (Celtic, Hearts zaten var). Yükselen: St Johnstone.
export const SCO_NEW = {
  rng: T('Rangers', 'RAN', '#1B458F', '#FFFFFF', 75, 'SCO'), abd: T('Aberdeen', 'ABE', '#E30613', '#FFFFFF', 68, 'SCO'),
  hib: T('Hibernian', 'HIB', '#00703C', '#FFFFFF', 67, 'SCO'), dun: T('Dundee', 'DUN', '#1B2A5C', '#FFFFFF', 63, 'SCO'),
  ddu: T('Dundee United', 'DDU', '#F47A20', '#111111', 64, 'SCO'), fal: T('Falkirk', 'FAL', '#1B2A5C', '#FFFFFF', 62, 'SCO'),
  kil: T('Kilmarnock', 'KIL', '#1B458F', '#FFFFFF', 63, 'SCO'), mot: T('Motherwell', 'MOT', '#FFB81C', '#8B1A2B', 64, 'SCO'),
  sjo: T('St Johnstone', 'STJ', '#0A3D91', '#FFFFFF', 61, 'SCO'), smi: T('St Mirren', 'STM', '#111111', '#FFFFFF', 63, 'SCO'),
};
// Yunanistan Super League (AEK, Olympiakos, OFI, Panathinaikos var). Yükselenler: Iraklis, Kalamata.
export const GRE_NEW = {
  paok: T('PAOK', 'PAO', '#111111', '#FFFFFF', 76, 'GRE'), ari: T('Aris', 'ARI', '#FFD200', '#111111', 70, 'GRE'),
  ast: T('Asteras Tripolis', 'AST', '#FFD200', '#111111', 64, 'GRE'), kif: T('Kifisia', 'KIF', '#1B4B9C', '#FFFFFF', 63, 'GRE'),
  atr: T('Atromitos', 'ATR', '#1E5AA8', '#FFFFFF', 65, 'GRE'), ira: T('Iraklis', 'IRA', '#1B4B9C', '#FFFFFF', 63, 'GRE'),
  lvd: T('Levadiakos', 'LEV', '#00703C', '#FFFFFF', 64, 'GRE'), kal: T('Kalamata', 'KLM', '#111111', '#FFFFFF', 62, 'GRE'),
  pan: T('Panetolikos', 'PNE', '#FFD200', '#1B4B9C', 63, 'GRE'), vol: T('Volos', 'VOL', '#E30613', '#1B4B9C', 64, 'GRE'),
};
// Avusturya Bundesliga (Salzburg, Rapid, Sturm, LASK var). Yükselen: Austria Lustenau.
export const AUT_NEW = {
  auw: T('Austria Viyana', 'AUW', '#5B2C83', '#FFFFFF', 70, 'AUT'), wac: T('Wolfsberger AC', 'WAC', '#111111', '#FFFFFF', 67, 'AUT'),
  gak: T('Grazer AK', 'GAK', '#E30613', '#FFFFFF', 64, 'AUT'), alt: T('Altach', 'ALT', '#111111', '#FFFFFF', 64, 'AUT'),
  rie: T('Ried', 'RIE', '#00703C', '#111111', 63, 'AUT'), har: T('Hartberg', 'HAR', '#1B4B9C', '#FFFFFF', 64, 'AUT'),
  wsg: T('WSG Tirol', 'WSG', '#00703C', '#FFFFFF', 63, 'AUT'), lus: T('Austria Lustenau', 'LUS', '#00703C', '#FFFFFF', 62, 'AUT'),
};
// İsviçre Super League (Basel, Young Boys, Lugano, Thun var). Yükselen: Vaduz.
export const SUI_NEW = {
  ser: T('Servette', 'SER', '#8B1A2B', '#FFFFFF', 68, 'SUI'), stg2: T('St. Gallen', 'STG', '#00703C', '#FFFFFF', 67, 'SUI'),
  luz: T('Luzern', 'LUZ', '#1B4B9C', '#FFFFFF', 66, 'SUI'), zur: T('Zürih', 'ZUR', '#FFFFFF', '#1B4B9C', 66, 'SUI'),
  gc: T('Grasshopper', 'GC', '#1B4B9C', '#FFFFFF', 64, 'SUI'), sio: T('Sion', 'SIO', '#FFFFFF', '#E30613', 65, 'SUI'),
  lau: T('Lausanne-Sport', 'LAU', '#1B2A5C', '#FFFFFF', 65, 'SUI'), vad: T('Vaduz', 'VAD', '#E30613', '#1B4B9C', 62, 'SUI'),
};
// Danimarka Superliga (FCK, Midtjylland, Nordsjælland, Aarhus var). Yükselenler: Lyngby, Horsens.
export const DEN_NEW = {
  bro: T('Brøndby', 'BRØ', '#FFD200', '#1B4B9C', 70, 'DEN'), ran: T('Randers', 'RAN', '#1B4B9C', '#FFFFFF', 65, 'DEN'),
  sil: T('Silkeborg', 'SIL', '#E30613', '#FFFFFF', 65, 'DEN'), vib: T('Viborg', 'VIB', '#00703C', '#FFFFFF', 64, 'DEN'),
  ob: T('OB', 'OB', '#1B4B9C', '#FFFFFF', 64, 'DEN'), soe: T('Sønderjyske', 'SØN', '#1B4B9C', '#FFFFFF', 62, 'DEN'),
  lyn: T('Lyngby', 'LYN', '#1B4B9C', '#FFFFFF', 63, 'DEN'), hor: T('Horsens', 'HOR', '#FFD200', '#111111', 61, 'DEN'),
};
// Norveç Eliteserien 2026 (Bodø/Glimt, Viking, Lillestrøm, Brann, Rosenborg var). Yükselenler: Start, Aalesund (+Lillestrøm).
export const NOR_NEW = {
  trm: T('Tromsø', 'TRO', '#E30613', '#FFFFFF', 67, 'NOR'), mol: T('Molde', 'MOL', '#1B4B9C', '#FFFFFF', 68, 'NOR'),
  sp08: T('Sarpsborg 08', 'SAR', '#1B4B9C', '#FFFFFF', 64, 'NOR'), ham: T('HamKam', 'HAM', '#00703C', '#FFFFFF', 63, 'NOR'),
  vif: T('Vålerenga', 'VÅL', '#1B2A5C', '#E30613', 65, 'NOR'), fre: T('Fredrikstad', 'FRE', '#E30613', '#FFFFFF', 63, 'NOR'),
  san: T('Sandefjord', 'SAN', '#1B4B9C', '#FFFFFF', 62, 'NOR'), kfu: T('KFUM Oslo', 'KFU', '#1B4B9C', '#E30613', 61, 'NOR'),
  aal: T('Aalesund', 'AAL', '#FF6600', '#1B4B9C', 61, 'NOR'), kri: T('Kristiansund', 'KRI', '#1B4B9C', '#FFFFFF', 61, 'NOR'),
  ikst: T('Start', 'STA', '#FFD200', '#111111', 61, 'NOR'),
};
// Çekya 1. Liga (Slavia, Sparta, Plzeň, Jablonec var). Yükselenler: Zbrojovka Brno, Artis Brno.
export const CZE_NEW = {
  hrk: T('Hradec Králové', 'HRK', '#111111', '#FFFFFF', 66, 'CZE'), bos: T('Baník Ostrava', 'BAN', '#1B4B9C', '#FFFFFF', 66, 'CZE'),
  boh: T('Bohemians 1905', 'BOH', '#00703C', '#FFFFFF', 63, 'CZE'), lib: T('Slovan Liberec', 'LIB', '#FFFFFF', '#1B4B9C', 64, 'CZE'),
  mbo: T('Mladá Boleslav', 'MBO', '#1B4B9C', '#FFFFFF', 63, 'CZE'), olo: T('Sigma Olomouc', 'OLO', '#1B4B9C', '#FFFFFF', 64, 'CZE'),
  pdb: T('Pardubice', 'PAR', '#E30613', '#FFFFFF', 62, 'CZE'), slc: T('Slovácko', 'SLC', '#FFFFFF', '#1B4B9C', 63, 'CZE'),
  tep: T('Teplice', 'TEP', '#FFD200', '#1B4B9C', 62, 'CZE'), zli: T('Zlín', 'ZLÍ', '#FFD200', '#1B4B9C', 61, 'CZE'),
  zbr: T('Zbrojovka Brno', 'ZBR', '#E30613', '#FFFFFF', 61, 'CZE'), art: T('Artis Brno', 'ART', '#1B4B9C', '#FFD200', 60, 'CZE'),
};
// Polonya Ekstraklasa (Lech, Legia, Jagiellonia, Górnik var). Yükselenler: Wisła Kraków, Śląsk Wrocław, Wieczysta Kraków.
export const POL_NEW = {
  rak: T('Raków', 'RAK', '#E30613', '#1B4B9C', 70, 'POL'), pog: T('Pogoń Szczecin', 'POG', '#1B2A5C', '#8B1A2B', 67, 'POL'),
  cra: T('Cracovia', 'CRA', '#E30613', '#FFFFFF', 65, 'POL'), wid: T('Widzew Łódź', 'WID', '#E30613', '#FFFFFF', 65, 'POL'),
  zag: T('Zagłębie Lubin', 'ZAG', '#FF6600', '#00703C', 65, 'POL'), pia: T('Piast Gliwice', 'PIA', '#1B4B9C', '#E30613', 64, 'POL'),
  kki: T('Korona Kielce', 'KOR', '#FFD200', '#E30613', 63, 'POL'), mtr: T('Motor Lublin', 'MTR', '#FFD200', '#1B4B9C', 63, 'POL'),
  rad: T('Radomiak', 'RAD', '#00703C', '#FFFFFF', 63, 'POL'), gks: T('GKS Katowice', 'GKS', '#FFD200', '#00703C', 63, 'POL'),
  wpl: T('Wisła Płock', 'WPŁ', '#1B4B9C', '#FFFFFF', 63, 'POL'), wkr: T('Wisła Kraków', 'WKR', '#E30613', '#FFFFFF', 64, 'POL'),
  sla2: T('Śląsk Wrocław', 'ŚLĄ', '#00703C', '#FFFFFF', 64, 'POL'), wie: T('Wieczysta Kraków', 'WIE', '#FFD200', '#111111', 62, 'POL'),
};
// isim havuzları (uydurma geçici isimler)
export const NAME_POOLS_2 = {
  SCO: [['Callum', 'Lewis', 'Ross', 'Euan', 'Fraser', 'Kieran', 'Jamie', 'Craig', 'Scott', 'Lyall', 'Finlay', 'Rory'], ['MacLeod', 'Fraser', 'Campbell', 'Murray', 'Stewart', 'Robertson', 'McKenzie', 'Paterson', 'Kerr', 'Henderson', 'Ritchie', 'Boyd']],
  GRE: [['Giorgos', 'Dimitris', 'Kostas', 'Nikos', 'Giannis', 'Christos', 'Vasilis', 'Panagiotis', 'Thanasis', 'Stelios', 'Andreas', 'Manolis'], ['Papadopoulos', 'Nikolaou', 'Georgiou', 'Karagiannis', 'Pappas', 'Vlachos', 'Dimitriou', 'Stavrou', 'Kotsis', 'Mavros', 'Alexiou', 'Lambrou']],
  AUT: [['Lukas', 'Florian', 'David', 'Tobias', 'Michael', 'Stefan', 'Philipp', 'Dominik', 'Matthias', 'Julian', 'Fabian', 'Marco'], ['Gruber', 'Huber', 'Wagner', 'Pichler', 'Moser', 'Steiner', 'Hofer', 'Leitner', 'Berger', 'Fuchs', 'Eder', 'Brunner']],
  SUI: [['Noah', 'Luca', 'Nico', 'Levin', 'Jan', 'Fabian', 'Silvan', 'Cédric', 'Yannick', 'Loris', 'Gian', 'Andrin'], ['Müller', 'Meier', 'Keller', 'Frei', 'Graf', 'Baumann', 'Roth', 'Favre', 'Rossi', 'Bühler', 'Steiner', 'Gerber']],
  DEN: [['Mads', 'Mikkel', 'Rasmus', 'Jonas', 'Frederik', 'Mathias', 'Oliver', 'Magnus', 'Kasper', 'Andreas', 'Lucas', 'Emil'], ['Jensen', 'Nielsen', 'Hansen', 'Pedersen', 'Andersen', 'Christensen', 'Larsen', 'Sørensen', 'Rasmussen', 'Poulsen', 'Kristensen', 'Madsen']],
  NOR: [['Ola', 'Henrik', 'Sander', 'Magnus', 'Jonas', 'Eirik', 'Kristian', 'Sindre', 'Håkon', 'Vegard', 'Even', 'Torbjørn'], ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Berg', 'Haugen', 'Bakken', 'Solberg', 'Lund', 'Strand', 'Dahl', 'Moen']],
  CZE: [['Jakub', 'Tomáš', 'Jan', 'Lukáš', 'Ondřej', 'Martin', 'David', 'Matěj', 'Petr', 'Adam', 'Vojtěch', 'Filip'], ['Novák', 'Svoboda', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec', 'Pokorný', 'Marek', 'Král']],
  POL: [['Jakub', 'Kacper', 'Mateusz', 'Bartosz', 'Michał', 'Kamil', 'Piotr', 'Szymon', 'Dawid', 'Paweł', 'Patryk', 'Łukasz'], ['Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kamiński', 'Lewandowicz', 'Zieliński', 'Szymański', 'Woźniak', 'Kozłowski', 'Mazur', 'Krawczyk']],
};
