import heroEditorialImg from './images/trendverse_hero_editorial_1792847878770.jpg';
import oversizedTshirtImg from './images/trendverse_oversized_tshirt_1792847878245.jpg';
import denimJacketImg from './images/trendverse_denim_jacket_1792847878188.jpg';
import heavyHoodieImg from './images/trendverse_heavy_hoodie_1792847878221.jpg';
import cargoPantsImg from './images/trendverse_cargo_pants_1792847878448.jpg';
import cottonThreePieceImg from './images/cotton_three_piece_1793113827824.jpg';
import georgetteThreePieceImg from './images/georgette_three_piece_1793113827971.jpg';
import leatherWalletImg from './images/amar_leather_wallet_1792478761942.jpg';
import chronoWatchImg from './images/amar_smartwatch_1792477578467.jpg';
import headphonesImg from './images/amar_headphones_1792477580118.jpg';
import speakerImg from './images/amar_bluetooth_speaker_1792477579695.jpg';
import mouseImg from './images/amar_gaming_mouse_1792477581158.jpg';
import brandLogoImg from './images/trendverse_logo_1792481013736.jpg';

export const BRAND_IMAGES = {
  logo: brandLogoImg,
  heroEditorial: heroEditorialImg,
  cottonThreePiece: cottonThreePieceImg,
  georgetteThreePiece: georgetteThreePieceImg,
  oversizedTshirt: oversizedTshirtImg,
  denimJacket: denimJacketImg,
  heavyHoodie: heavyHoodieImg,
  cargoPants: cargoPantsImg,
  leatherWallet: leatherWalletImg,
  chronoWatch: chronoWatchImg,
  headphones: headphonesImg,
  speaker: speakerImg,
  mouse: mouseImg,
} as const;

/**
 * Resolves any legacy /src/assets/images/... path, /logo.png, or external URL
 * to a Vite-bundled static asset URL so images never 404 in dev or production builds.
 */
export function resolveBrandImage(src?: string | Blob): string {
  if (typeof src !== 'string' || !src.trim()) {
    return BRAND_IMAGES.oversizedTshirt;
  }

  // Keep blob: or data: URLs uploaded by the user in Admin Customizer intact
  if (src.startsWith('blob:') || src.startsWith('data:')) {
    return src;
  }

  if (src === '/logo.png' || src.includes('trendverse_logo')) {
    return BRAND_IMAGES.logo;
  }
  if (src.includes('trendverse_hero_editorial')) {
    return BRAND_IMAGES.heroEditorial;
  }
  if (src.includes('cotton_three_piece') || src.includes('photo-1610030469983')) {
    return BRAND_IMAGES.cottonThreePiece;
  }
  if (src.includes('georgette_three_piece') || src.includes('photo-1583391733956')) {
    return BRAND_IMAGES.georgetteThreePiece;
  }
  if (src.includes('trendverse_oversized_tshirt') || src.includes('photo-1521572267360')) {
    return BRAND_IMAGES.oversizedTshirt;
  }
  if (src.includes('trendverse_denim_jacket') || src.includes('photo-1576995853123')) {
    return BRAND_IMAGES.denimJacket;
  }
  if (src.includes('trendverse_heavy_hoodie') || src.includes('photo-1556905055')) {
    return BRAND_IMAGES.heavyHoodie;
  }
  if (src.includes('trendverse_cargo_pants') || src.includes('photo-1624378439575')) {
    return BRAND_IMAGES.cargoPants;
  }
  if (src.includes('amar_leather_wallet') || src.includes('photo-1627123424574')) {
    return BRAND_IMAGES.leatherWallet;
  }
  if (src.includes('amar_smartwatch') || src.includes('photo-1523275335684')) {
    return BRAND_IMAGES.chronoWatch;
  }
  if (src.includes('amar_headphones') || src.includes('photo-1505740420928')) {
    return BRAND_IMAGES.headphones;
  }
  if (src.includes('amar_bluetooth_speaker')) {
    return BRAND_IMAGES.speaker;
  }
  if (src.includes('amar_gaming_mouse')) {
    return BRAND_IMAGES.mouse;
  }
  if (src.includes('unsplash.com')) {
    return BRAND_IMAGES.cottonThreePiece;
  }

  return src;
}

/**
 * Safe clipboard copy utility that works inside cross-origin preview iframes
 * without throwing unhandled NotAllowedError promise rejections.
 */
export async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below for restricted iframe permissions
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.className = 'fixed -top-96 -left-96 opacity-0 pointer-events-none';
    document.body.appendChild(textArea);
    textArea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textArea);
    return ok;
  } catch {
    return false;
  }
}
