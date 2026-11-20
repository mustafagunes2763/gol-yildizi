// Oyuncu görünüşü: ten, saç modeli, saç rengi — SVG ile çizilir.

export const SKINS = ['#f6d7bd', '#e8c39e', '#c99a6e', '#9a6a43', '#6b4429', '#4a2e1c'];
export const HAIR_COLORS = { siyah: '#1b1b1b', kahve: '#5a3a22', sari: '#d9b44a', kizil: '#a8431f', platin: '#e8e4d8' };
export const HAIR_STYLES = { kisa: 'Kısa', kazitma: 'Kazıtma', kivircik: 'Kıvırcık', uzun: 'Uzun', mohikan: 'Mohikan', kel: 'Kel' };
export const HAIR_COLOR_LABELS = { siyah: 'Siyah', kahve: 'Kahve', sari: 'Sarı', kizil: 'Kızıl', platin: 'Platin' };

export const DEFAULT_LOOK = { skin: 1, hair: 'kisa', hairColor: 'siyah' };
export const lookOf = (p) => ({ ...DEFAULT_LOOK, ...(p?.look || {}) });
export const skinColor = (look) => SKINS[look.skin] || SKINS[1];
export const hairColor = (look) => HAIR_COLORS[look.hairColor] || HAIR_COLORS.siyah;

// Kafa + saç (merkez 0,0; yarıçap ~r). Gazete silüeti ve portrede ortak kullanılır.
export function headSvg(look, cx, cy, r, { face = true } = {}) {
  const sk = skinColor(look), hc = hairColor(look);
  const s = r / 20; // ölçek
  const P = (x, y) => `${cx + x * s},${cy + y * s}`;
  let back = '', front = '';
  switch (look.hair) {
    case 'kisa':
      front = `<path d="M${P(-20, -2)} Q${P(-21, -24)} ${P(0, -24)} Q${P(21, -24)} ${P(20, -2)} Q${P(14, -14)} ${P(0, -13)} Q${P(-14, -14)} ${P(-20, -2)}Z" fill="${hc}"/>`;
      break;
    case 'kazitma':
      front = `<path d="M${P(-19.5, -4)} Q${P(-19, -21)} ${P(0, -21)} Q${P(19, -21)} ${P(19.5, -4)} Q${P(13, -12)} ${P(0, -12)} Q${P(-13, -12)} ${P(-19.5, -4)}Z" fill="${hc}" opacity=".55"/>`;
      break;
    case 'kivircik':
      back = [[-16, -14], [-6, -21], [6, -21], [16, -14], [-21, -3], [21, -3], [0, -24], [-12, -22], [12, -22]]
        .map(([x, y]) => `<circle cx="${cx + x * s}" cy="${cy + y * s}" r="${8.5 * s}" fill="${hc}"/>`).join('');
      break;
    case 'uzun':
      back = `<path d="M${P(-21, -6)} Q${P(-24, 18)} ${P(-17, 26)} L${P(17, 26)} Q${P(24, 18)} ${P(21, -6)}Z" fill="${hc}"/>`;
      front = `<path d="M${P(-21, 0)} Q${P(-22, -25)} ${P(0, -25)} Q${P(22, -25)} ${P(21, 0)} Q${P(8, -16)} ${P(-4, -12)} Q${P(-14, -10)} ${P(-21, 0)}Z" fill="${hc}"/>`;
      break;
    case 'mohikan':
      front = `<path d="M${P(-5, -16)} Q${P(-6, -32)} ${P(0, -33)} Q${P(6, -32)} ${P(5, -16)}Z" fill="${hc}"/>
               <path d="M${P(-19, -4)} Q${P(-18, -16)} ${P(-6, -18)} M${P(19, -4)} Q${P(18, -16)} ${P(6, -18)}" stroke="${hc}" stroke-width="${2 * s}" fill="none" opacity=".45"/>`;
      break;
    case 'kel':
    default:
      front = `<ellipse cx="${cx - 7 * s}" cy="${cy - 12 * s}" rx="${5 * s}" ry="${3 * s}" fill="#fff" opacity=".25"/>`;
  }
  const ears = `<circle cx="${cx - 20 * s}" cy="${cy + 1 * s}" r="${4 * s}" fill="${sk}"/><circle cx="${cx + 20 * s}" cy="${cy + 1 * s}" r="${4 * s}" fill="${sk}"/>`;
  const head = `<ellipse cx="${cx}" cy="${cy}" rx="${19 * s}" ry="${21 * s}" fill="${sk}"/>`;
  const faceSvg = face ? `
    <path d="M${P(-12, -6)} q${4 * s},${-3 * s} ${8 * s},0 M${P(4, -6)} q${4 * s},${-3 * s} ${8 * s},0" stroke="${look.hair === 'kel' ? '#3b2a20' : hc}" stroke-width="${2.2 * s}" fill="none" stroke-linecap="round"/>
    <circle cx="${cx - 7 * s}" cy="${cy}" r="${2.2 * s}" fill="#1b1b1b"/><circle cx="${cx + 7 * s}" cy="${cy}" r="${2.2 * s}" fill="#1b1b1b"/>
    <path d="M${P(0, 2)} q${-2 * s},${5 * s} ${1 * s},${6 * s}" stroke="#0004" stroke-width="${1.5 * s}" fill="none"/>
    <path d="M${P(-6, 12)} q${6 * s},${5 * s} ${12 * s},0" stroke="#7a3b2e" stroke-width="${2 * s}" fill="none" stroke-linecap="round"/>` : '';
  return back + ears + head + faceSvg + front;
}

// Profil / oluşturma ekranı portresi
export function portraitSvg(look, kit = ['#16a34a', '#ffffff'], size = 120) {
  const [k1, k2] = kit;
  const sk = skinColor(look);
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="portrait" role="img" aria-label="Oyuncu portresi">
    <defs><radialGradient id="pbg" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#2f4a63"/><stop offset="1" stop-color="#0f1720"/></radialGradient></defs>
    <rect width="120" height="120" rx="18" fill="url(#pbg)"/>
    <rect x="50" y="70" width="20" height="16" fill="${sk}"/>
    <path d="M18 120 Q20 88 44 82 L60 92 L76 82 Q100 88 102 120Z" fill="${k1}"/>
    <path d="M44 82 L60 92 L76 82 L72 80 L60 87 L48 80Z" fill="${k2}"/>
    ${headSvg(look, 60, 52, 22)}
  </svg>`;
}
