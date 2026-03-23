// ─────────────────────────────────────────────────────────────────────────────
// FairNest Typography Config
//
// HOW TO CHANGE THE FONT FAMILY:
//   1. Install a Google Font:
//        npx expo install @expo-google-fonts/inter
//        npx expo install @expo-google-fonts/poppins
//        npx expo install @expo-google-fonts/nunito
//        npx expo install @expo-google-fonts/lato
//        npx expo install @expo-google-fonts/roboto
//
//   2. Load it in App.js:
//        import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
//        const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
//        if (!fontsLoaded) return null;
//
//   3. Change FONT_REGULAR and FONT_BOLD below to the loaded font names,
//      e.g. 'Inter_400Regular' and 'Inter_700Bold'.
//
// POPULAR OPTIONS TO TRY:
//   Inter      — Clean, modern, highly readable (recommended)
//   Poppins    — Rounded, friendly, slightly larger feel
//   Nunito     — Soft and approachable, great for social apps
//   Lato       — Professional and neutral
//   Roboto     — Android default, very familiar
//   System     — Uses device default (no install needed)
// ─────────────────────────────────────────────────────────────────────────────

export const FONT_REGULAR = 'Poppins_400Regular';
export const FONT_BOLD    = 'Poppins_700Bold';
export const FONT_SEMI    = 'Poppins_600SemiBold';

// Font sizes — increase/decrease the base to scale everything at once
const BASE = 1; // multiply all sizes by this to scale up/down globally

export const fontSize = {
  // Labels & captions
  tiny:    Math.round(12 * BASE),   // timestamps, badges
  caption: Math.round(13 * BASE),   // helper text, footer notes
  small:   Math.round(14 * BASE),   // secondary info, tags

  // Body
  body:    Math.round(16 * BASE),   // standard body text
  bodyLg:  Math.round(17 * BASE),   // hero subtitles, descriptions

  // UI elements
  button:  Math.round(17 * BASE),   // button labels
  input:   Math.round(16 * BASE),   // text input fields
  label:   Math.round(15 * BASE),   // form labels
  navLink: Math.round(16 * BASE),   // navbar links

  // Headings
  h4:      Math.round(18 * BASE),   // card titles
  h3:      Math.round(20 * BASE),   // section subtitles
  h2:      Math.round(24 * BASE),   // section titles
  h1:      Math.round(30 * BASE),   // page titles
  hero:    Math.round(36 * BASE),   // hero / landing titles
};

// Ready-to-use fontFamily values — spread these into any StyleSheet text style
// Example: { ...font.regular, fontSize: fontSize.body, color: '#333' }
export const font = {
  regular: FONT_REGULAR ? { fontFamily: FONT_REGULAR } : {},
  bold:    FONT_BOLD    ? { fontFamily: FONT_BOLD }    : {},
  semi:    FONT_SEMI    ? { fontFamily: FONT_SEMI }    : {},
};
