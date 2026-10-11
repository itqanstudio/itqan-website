/**
 * The Itqan brand system (v3, "Resolve, the signal i"), as data.
 *
 * Every spec page in the brand portal renders from this file. Values are the
 * ones the live site uses (src/styles/v3/site.css) and the signed-off kit in the
 * private repo itqanstudio/itqan-brand. Contrast ratios are measured with the
 * WCAG 2.1 formula, not estimated.
 *
 * Public on purpose: this is the brand as anyone may use it. Prices, strategy
 * and unreleased work stay in the private repo.
 */

export interface Swatch {
  name: string;
  hex: string;
  role: string;
  /** Text colour that reads on this swatch. */
  fg: string;
}

export const CORE_COLOURS: readonly Swatch[] = [
  { name: 'Ink', hex: '#0B0A0D', fg: '#F5F1EA', role: 'The ground. Pages, slides and screens start dark.' },
  { name: 'Bone', hex: '#F5F1EA', fg: '#0B0A0D', role: 'Text on ink, and the light ground for documents and print.' },
  { name: 'Itqan Rose', hex: '#EF3A78', fg: '#0B0A0D', role: 'The signal. The dot of the symbol, primary buttons, one accent per view.' },
  { name: 'Rose Deep', hex: '#C2185B', fg: '#F5F1EA', role: 'Rose for text and small marks on bone or white, where Itqan Rose is too light to read.' },
  { name: 'Haze', hex: '#E9E2E4', fg: '#0B0A0D', role: 'A quiet light tint for panels and tables on bone.' },
];

export const DUSK_COLOURS: readonly Swatch[] = [
  { name: 'Sand', hex: '#F5D3A1', fg: '#0B0A0D', role: 'The core of the dusk run, at the corner of the symbol.' },
  { name: 'Apricot', hex: '#F89A5B', fg: '#0B0A0D', role: 'Second stop of the dusk run.' },
  { name: 'Coral', hex: '#F4664F', fg: '#0B0A0D', role: 'Third stop of the dusk run.' },
  { name: 'Rose', hex: '#EF3A78', fg: '#0B0A0D', role: 'Fourth stop, the same Itqan Rose.' },
  { name: 'Orchid', hex: '#9B3FA0', fg: '#F5F1EA', role: 'The outer edge of the dusk run.' },
];

export const UI_GREYS: readonly Swatch[] = [
  { name: 'Mute', hex: '#A79FA8', fg: '#0B0A0D', role: 'Secondary text on ink: leads, captions, descriptions.' },
  { name: 'Dim', hex: '#8E8692', fg: '#0B0A0D', role: 'Tertiary text on ink: labels, meta, footers.' },
  { name: 'Line', hex: '#2A2630', fg: '#F5F1EA', role: 'Rules and cell borders on ink.' },
];

export interface Gradient {
  name: string;
  css: string;
  use: string;
}

export const GRADIENTS: readonly Gradient[] = [
  {
    name: 'Dusk',
    css: 'linear-gradient(100deg, #F5D3A1 0%, #F89A5B 28%, #F4664F 52%, #EF3A78 76%, #9B3FA0 100%)',
    use: 'The symbol, one highlighted phrase per view, covers.',
  },
  { name: 'Ember', css: 'linear-gradient(100deg, #F89A5B 0%, #EF3A78 100%)', use: 'Short words and charts on light grounds, where sand would disappear.' },
  {
    name: 'Rose glow',
    css: 'radial-gradient(110% 90% at 0% 100%, rgba(239,58,120,.5) 0%, rgba(155,63,160,.22) 38%, rgba(11,10,13,0) 70%)',
    use: 'Behind sections, rising from the bottom-left corner like the symbol.',
  },
];

/** Measured WCAG 2.1 contrast. `ok` means 4.5:1 or better for body text. */
export interface Pairing {
  fg: string;
  bg: string;
  fgHex: string;
  bgHex: string;
  ratio: number;
  ok: boolean;
  note: string;
}

export const PAIRINGS: readonly Pairing[] = [
  { fg: 'Bone', bg: 'Ink', fgHex: '#F5F1EA', bgHex: '#0B0A0D', ratio: 17.54, ok: true, note: 'The default. All body copy on ink.' },
  { fg: 'Mute', bg: 'Ink', fgHex: '#A79FA8', bgHex: '#0B0A0D', ratio: 7.68, ok: true, note: 'Leads and descriptions.' },
  { fg: 'Dim', bg: 'Ink', fgHex: '#8E8692', bgHex: '#0B0A0D', ratio: 5.62, ok: true, note: 'Labels and meta only.' },
  { fg: 'Itqan Rose', bg: 'Ink', fgHex: '#EF3A78', bgHex: '#0B0A0D', ratio: 5.22, ok: true, note: 'Labels, kickers, small accents.' },
  { fg: 'Ink', bg: 'Itqan Rose', fgHex: '#0B0A0D', bgHex: '#EF3A78', ratio: 5.22, ok: true, note: 'Primary buttons. Ink text, never white.' },
  { fg: 'Ink', bg: 'Bone', fgHex: '#0B0A0D', bgHex: '#F5F1EA', ratio: 17.54, ok: true, note: 'Documents and print.' },
  { fg: 'Rose Deep', bg: 'Bone', fgHex: '#C2185B', bgHex: '#F5F1EA', ratio: 5.22, ok: true, note: 'Rose text on light grounds.' },
  { fg: 'Ink', bg: 'Sand', fgHex: '#0B0A0D', bgHex: '#F5D3A1', ratio: 13.84, ok: true, note: 'Ink on any dusk stop up to coral.' },
  { fg: 'Bone', bg: 'Orchid', fgHex: '#F5F1EA', bgHex: '#9B3FA0', ratio: 5.16, ok: true, note: 'Light text only on the orchid end.' },
  { fg: 'Itqan Rose', bg: 'Bone', fgHex: '#EF3A78', bgHex: '#F5F1EA', ratio: 3.36, ok: false, note: 'Too light for text. Use Rose Deep.' },
  { fg: 'Bone', bg: 'Itqan Rose', fgHex: '#F5F1EA', bgHex: '#EF3A78', ratio: 3.36, ok: false, note: 'Never white or bone text on rose.' },
  { fg: 'Sand', bg: 'Bone', fgHex: '#F5D3A1', bgHex: '#F5F1EA', ratio: 1.27, ok: false, note: 'Invisible. On light grounds use ember, not dusk.' },
];

export interface TypeRole {
  role: string;
  family: string;
  spec: string;
  sample: string;
  className: string;
}

export const TYPE_ROLES: readonly TypeRole[] = [
  { role: 'Display', family: 'Geist 600', spec: '42 to 88 px · line height 0.94 · tracking −0.055em', sample: 'Private AI for the companies that make, move and sell.', className: 'ts-display' },
  { role: 'Section heading', family: 'Geist 600', spec: '36 to 80 px · line height 1.0 · tracking −0.045em', sample: 'We start where the paperwork is heaviest.', className: 'ts-h2' },
  { role: 'Card heading', family: 'Geist 600', spec: '20 to 38 px · tracking −0.03em', sample: 'Agents and workflows', className: 'ts-h3' },
  { role: 'Lead', family: 'Geist 400', spec: '17 to 20 px · line height 1.55 · Mute on ink', sample: 'Itqan builds AI agents for operations, supply chain and customer teams, and runs them inside your own cloud account.', className: 'ts-lead' },
  { role: 'Body', family: 'Geist 400', spec: '16 px · line height 1.6', sample: 'A person on your team approves anything an agent sends.', className: 'ts-body' },
  { role: 'Label and data', family: 'Geist Mono 400', spec: '11 to 12 px · uppercase · tracking 0.08 to 0.14em', sample: 'AGENT 03 · QUALITY LOG · REGION UAE', className: 'ts-label' },
  { role: 'Arabic', family: 'Readex Pro 400 and 600', spec: 'Same optical size as the Latin beside it · never letter-spaced', sample: 'ذكاء اصطناعي خاص للشركات التي تصنع وتنقل وتبيع.', className: 'ts-arabic' },
];

export interface MotionSpec {
  name: string;
  spec: string;
  use: string;
}

export const MOTION_SPECS: readonly MotionSpec[] = [
  { name: 'Scatter and resolve', spec: 'Spring · stiffness 170 · damping 18 · the dot lands about 1.1 s after the rest', use: 'The symbol in heroes, intros and reveals.' },
  { name: 'Reveal', spec: 'Spring · stiffness 170 · damping 22 · 22 px rise with fade', use: 'Blocks entering the viewport below the first screen.' },
  { name: 'Interface', spec: 'Spring · stiffness 320 · damping 32', use: 'Step changes, sheets, menus.' },
  { name: 'Press', spec: 'Scale to 0.97 on press, back on release', use: 'Buttons and tappable cards.' },
];

export const MOTION_RULES: readonly string[] = [
  'Motion starts from where the element is on screen, never from a fixed keyframe.',
  'A pointer or a finger passes its speed on: pixels and sheets move with the hand and settle from there.',
  'Everything can be interrupted and reversed at any instant.',
  'With reduced motion turned on, show the resolved state. No scatter, no reveals.',
];

export interface IconInfo {
  name: string;
  meaning: string;
}

export const ICON_SET: readonly IconInfo[] = [
  { name: 'buildings', meaning: 'Manufacturing' },
  { name: 'store', meaning: 'Retail' },
  { name: 'coffee', meaning: 'Food and beverage' },
  { name: 'message-processing', meaning: 'Agents and workflows' },
  { name: 'file-flash', meaning: 'Search over documents' },
  { name: 'server', meaning: 'Private models, your cloud' },
  { name: 'sliders', meaning: 'Running it' },
  { name: 'map', meaning: 'Region' },
  { name: 'lock', meaning: 'No training on your data' },
  { name: 'card-id', meaning: 'Access by role' },
  { name: 'analytics', meaning: 'Audit trail' },
  { name: 'users', meaning: 'A person approves' },
  { name: 'shield', meaning: 'Tested before launch' },
];

/** Voice rules, the same ones the site copy is written to. */
export const VOICE_RULES: readonly { rule: string; example: string }[] = [
  { rule: 'A thing, a number or a name in every sentence.', example: 'Kickoff is within five working days of payment.' },
  { rule: 'Plain sentences. No em dashes or en dashes.', example: 'We deploy in your AWS, Azure or Google Cloud account.' },
  { rule: 'Say what a person decides.', example: 'Nothing is sent. The buyer approves, edits or rejects the draft.' },
  { rule: 'No invented proof. Sample data says sample.', example: 'An illustration. The company, the order and the numbers are made up.' },
  { rule: 'No moral or takeaway closer. Stop when the point is made.', example: 'Arabic, English and Swedish, for the agents and for the people you talk to.' },
];

export const BANNED_WORDS: readonly string[] = [
  'elevate',
  'empower',
  'seamless',
  'end-to-end',
  'cutting-edge',
  'leverage',
  'unlock',
  'journey',
  'solutions (as a noun for what we sell)',
];

export interface CopyItem {
  label: string;
  meta: string;
  text: string;
}

export const COPY_LIBRARY: readonly CopyItem[] = [
  { label: 'Line', meta: 'Under the logo, in bios', text: 'We build the AI your business runs on, and we stay to run it.' },
  { label: 'Headline', meta: 'The site hero', text: 'Private AI for the companies that make, move and sell.' },
  {
    label: 'Short description',
    meta: 'Directories, event listings, 40 words',
    text: 'Itqan builds AI agents for operations, supply chain and customer teams in manufacturing, retail and food and beverage, and runs them inside the client’s own cloud account. Dubai and Gothenburg.',
  },
  {
    label: 'Boilerplate',
    meta: 'End of a press release',
    text: 'Itqan is an AI studio for manufacturing, retail and food and beverage. It designs, builds and runs AI agents and private models inside each client’s own cloud account, with the data kept in the client’s region and a person approving what an agent sends. Itqan Studio FZ-LLC is registered in Ras Al Khaimah and works from Dubai and Gothenburg.',
  },
  { label: 'Founders', meta: 'Who runs the studio', text: 'Itqan was founded by Ibrahim Shareef (founder and CEO) and Bisma Aslam (co-founder).' },
  { label: 'Arabic line', meta: 'Arabic bios and covers', text: 'نبني الذكاء الاصطناعي الذي تعمل عليه أعمالك، ونبقى لنشغّله.' },
  { label: 'Name', meta: 'How to write it', text: 'Itqan in running text. itqan (lowercase) only in the wordmark. Itqan Studio FZ-LLC for the legal entity. إتقان in Arabic.' },
];

export const BRAND_UPDATES: readonly { date: string; title: string; body: string }[] = [
  {
    date: '11 Oct 2026',
    title: 'The brand portal moves to v3',
    body: 'Every page of this portal, the asset library, the stickers and the email signatures now use brand v3. The old plum and mauve files are retired.',
  },
  {
    date: '8 Oct 2026',
    title: 'itqanstudio.com relaunches in English and Arabic',
    body: 'The site now speaks to decision makers in manufacturing, retail and food and beverage, with briefings booked on the site itself.',
  },
  {
    date: '7 Oct 2026',
    title: 'Brand v3: the signal i',
    body: 'A new symbol: a pixel stem and a square rose dot form the i of itqan and the alef of إتقان, with the arc radiating in the dusk gradient. Ink, Bone and Itqan Rose; Geist, Geist Mono and Readex Pro.',
  },
  {
    date: '6 Oct 2026',
    title: 'Itqan becomes an AI studio',
    body: 'The founders decided to focus only on AI: agents, workflows and private models, built and run inside the client’s own cloud.',
  },
];
