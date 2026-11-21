// Maç yorumcusu Ertem Şener: spikerin yanında oyuncular, takımlar, statlar ve şehirler hakkında ilginç bilgiler verir (yalnızca tarafsız, doğru bilgiler).
// Bilgiler oyunun verisinden (kulüp, kadro, istatistik) ve aşağıdaki doğrulanmış şehir notlarından üretilir.
import { KULUPLER } from './kulupler.js';
import { leagueOf, leagueStats, pick, shuffle } from './engine.js';

export const NAME = 'Ertem Şener';

const CITY = {
  'İstanbul': ['İstanbul iki kıtaya yayılan bir şehir; Avrupa ile Asya\'yı Boğaz ayırıyor.', 'İstanbul Boğazı yaklaşık 30 kilometre uzunluğunda; maç sonrası bir vapur turu tavsiye ederim.'],
  'Ankara': ['Ankara 1923\'ten beri Türkiye\'nin başkenti.', 'Ünlü Ankara keçisinin tiftiğinden yapılan sof kumaşı, bir zamanlar Avrupa\'ya kadar gidermiş.'],
  'İzmir': ['İzmir\'in meşhur boyozu, şehre Sefarad Yahudilerinin getirdiği bir hamur işi.', 'İzmir\'de akşamüstü Kordon\'da yürümeden olmaz derler.'],
  'Trabzon': ['Trabzon\'da hamsi o kadar sevilir ki hamsiden tatlı bile yapılır.', 'Sümela Manastırı, Trabzon Maçka\'da sarp bir kayalığın yamacına kurulu.'],
  'Kayseri': ['Kayseri mantısı için "bir kaşığa kırk tane sığmalı" denir.', 'Kayseri\'nin simgesi Erciyes, aslında sönmüş bir volkan.'],
  'Konya': ['Konya, yüzölçümüyle Türkiye\'nin en büyük ili.', 'Mevlânâ\'nın türbesi Konya\'da; etli ekmeği de cabası.'],
  'Samsun': ['Atatürk 19 Mayıs 1919\'da Samsun\'a çıktı; Kurtuluş Savaşı böyle başladı.'],
  'Rize': ['Türkiye\'de çay tarımının en çok yapıldığı il Rize.'],
  'Sivas': ['1919\'daki Sivas Kongresi, Kurtuluş Savaşı\'nın dönüm noktalarından.', 'Divriği Ulu Camii ve Darüşşifası UNESCO Dünya Mirası listesinde.'],
  'Gaziantep': ['Gaziantep, UNESCO\'nun yaratıcı şehirler ağında gastronomi şehri olarak yer alıyor. Baklavası malum!'],
  'Antalya': ['Antalya, Türkiye\'nin en çok turist ağırlayan şehirlerinden.', 'Alanya\'daki Kızıl Kule, şehrin simgelerinden biri.'],
  'Balıkesir': ['Atatürk\'ü 1919\'da Samsun\'a götüren geminin adı Bandırma Vapuru.'],
  'Batman': ['Türkiye\'de ilk ticari petrol 1940\'larda Batman\'daki Raman Dağı\'nda bulundu.'],
  'Bolu': ['Bolu\'nun Mengen ilçesi aşçılarıyla meşhurdur; her yıl aşçılık festivali yapılır.'],
  'Bursa': ['İskender kebap Bursa\'da doğdu.', 'Bursa, Osmanlı Devleti\'nin ilk başkentlerinden biri.'],
  'Diyarbakır': ['Diyarbakır surları ve Hevsel Bahçeleri UNESCO Dünya Mirası listesinde.'],
  'Erzurum': ['1919\'da Erzurum Kongresi burada toplandı.', 'Cağ kebabının memleketi Erzurum.'],
  'Iğdır': ['Türkiye\'nin en yüksek dağı Ağrı Dağı, Iğdır\'dan muhteşem görünür.'],
  'Kocaeli': ['İzmit pişmaniyesi, Kocaeli\'nin meşhur tatlısı.'],
  'Manisa': ['Manisa\'da yüzyıllardır Mesir Macunu Festivali düzenleniyor.'],
  'Mardin': ['Mardin taş evleri ve Midyat telkârisiyle ünlü.'],
  'Muğla': ['Bodrum\'daki Halikarnas Mozolesi, Dünyanın Yedi Harikası\'ndan biriydi.'],
  'Van': ['Van Gölü, Türkiye\'nin en büyük gölü.', 'Van kedilerinin gözleri çoğu zaman farklı renktedir.'],
  'Çorum': ['Çorum leblebisiyle meşhur.'],
};
const OPEN = ['Sevgili seyirciler, ilginç bir bilgi:', 'Bir not düşeyim:', 'Hazır top oyun dışındayken söyleyeyim:', 'Bunu biliyor muydunuz?', 'Arşivime baktım:'];

// Maç için ilginç bilgi havuzu hazırla (her maçta karışık sırayla kullanılır)
export function pool(state, plan) {
  const p = state.player, my = plan.fx.home ? plan.fx.h : plan.fx.a, opp = plan.fx.opp;
  const T = state.teams, out = [];
  const yr = () => state.season.year;
  const ci = (id) => KULUPLER[id] || {};
  const name = (id) => T[id]?.name || id;
  const home = plan.fx.h, hc = ci(home), ac = ci(plan.fx.a);
  // stat
  if (hc.stadyum && hc.kapasite) {
    const caps = Object.values(KULUPLER).map((x) => x.kapasite).filter(Boolean).sort((a, b) => b - a);
    const rank = caps.indexOf(hc.kapasite) + 1;
    out.push(`${hc.stadyum} ${hc.kapasite.toLocaleString('tr-TR')} kişilik. Listemdeki ${caps.length} stat arasında kapasitede ${rank}. sırada.`);
  }
  // kuruluş yılları
  for (const id of [my, opp]) {
    const c = ci(id);
    if (c.kurulus_yili) out.push(`${c.tam_adi || name(id)} ${c.kurulus_yili} yılında kuruldu; kulüp tam ${yr() - c.kurulus_yili} yaşında.`);
  }
  if (ci(my).kurulus_yili && ci(opp).kurulus_yili && ci(my).kurulus_yili !== ci(opp).kurulus_yili) {
    const [o, n] = ci(my).kurulus_yili < ci(opp).kurulus_yili ? [my, opp] : [opp, my];
    out.push(`${name(o)}, ${name(n)} takımından ${Math.abs(ci(my).kurulus_yili - ci(opp).kurulus_yili)} yaş büyük.`);
  }
  if (hc.sehir && hc.sehir === ac.sehir) out.push(`İki takım da ${hc.sehir} ekibi; bugün şehrin bir yakası sevinecek.`);
  // ezeli rakipler
  for (const id of [my, opp]) { const ez = (ci(id).ezeli_rakipler || []).map((x) => T[x]?.name).filter(Boolean); if (ez.length) out.push(`${name(id)} taraftarına ezeli rakibini sorarsanız ${ez.join(', ')} derler.`); }
  // şehir
  for (const c of [hc, ac]) if (CITY[c.sehir]) out.push(pick(CITY[c.sehir]));
  // kadrolar
  for (const id of [my, opp]) {
    const sq = (T[id]?.squad || []).filter((x) => x.age);
    if (sq.length < 5) continue;
    const old = sq.reduce((a, b) => (b.age > a.age ? b : a)), young = sq.reduce((a, b) => (b.age < a.age ? b : a));
    out.push(`${name(id)} kadrosunun en tecrübelisi ${old.name}, ${old.age} yaşında.`);
    if (young.name !== `${p.name} ${p.surname}`) out.push(`${name(id)} kadrosunun en genci ${young.name}; henüz ${young.age} yaşında.`);
    const nats = new Set(sq.map((x) => x.nat).filter(Boolean));
    if (nats.size > 2) out.push(`${name(id)} kadrosunda ${nats.size} farklı ülkeden oyuncu var. Soyunma odası adeta Birleşmiş Milletler!`);
    const fx = sq.filter((x) => x.nat && x.nat !== 'Türkiye');
    if (fx.length) { const f = pick(fx); out.push(`${f.name} ${f.nat} uyruklu; ${f.age} yaşında ve ${{ FV: 'forvet', OS: 'orta saha', DF: 'defans', KL: 'kaleci' }[f.pos] || 'oyuncu'} oynuyor.`); }
  }
  // istatistik
  const lid = leagueOf(state, my);
  if (lid && !plan.fx.comp) {
    const st = leagueStats(state, lid);
    const top = st.filter((x) => x.teamId === opp).sort((a, b) => b.g - a.g)[0];
    if (top?.g > 0) out.push(`${name(opp)} takımının bu sezonki en golcüsü ${top.name}, ${top.g} gol.`);
    const lk = st.slice().sort((a, b) => b.g - a.g)[0];
    if (lk?.g > 2) out.push(`Ligde gol krallığında zirvede ${lk.me ? `${p.name} ${p.surname}` : lk.name} var, ${lk.g} gol.`);
  }
  const cg = p.career?.seasons?.reduce((a, s) => a + (s.goals || 0), 0) || 0;
  if (p.season.apps) out.push(`${p.name} ${p.surname} ${p.age} yaşında; bu sezon ${p.season.apps} maçta ${p.season.goals} gol${cg ? `, kariyerinde toplam ${cg + p.season.goals}` : ''}.`);
  if (state.social?.rival) {
    const r = state.social.rival, k = `${r.team}|Ahmet Akyurt`, rg = state.season.ps?.[k]?.[0] || 0;
    out.push(`${p.surname} ile Ahmet Akyurt akademiden beri rakip. Bu sezon Ahmet ${rg} gol attı, ${p.surname} ${p.season.goals}.`);
  }
  return shuffle(out);
}
export function line(pl) { const t = pl.shift(); return t ? `${pick(OPEN)} ${t}` : null; }
