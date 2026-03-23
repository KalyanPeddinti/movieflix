export type SettingTopic =
  | "bluetooth"
  | "wifi"
  | "volume"
  | "brightness"
  | "silent"
  | "battery"
  | "rotate";

export type UiStyle = "ios" | "samsung" | "pixel" | "android";

export interface MockupItem {
  icon: string;
  label: string;
  detail?: string;
  hasToggle?: boolean;
  toggleOn?: boolean;
  hasArrow?: boolean;
  isHighlighted?: boolean;
}

export interface StepScreen {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  items: MockupItem[];
  highlightedIndex: number;
  caption: string;
  hasSlider?: boolean;
  sliderValue?: number;
  sliderHighlighted?: boolean;
}

export interface SettingsGuide {
  topic: SettingTopic;
  heading: string;
  uiStyle: UiStyle;
  steps: StepScreen[];
}

// ─── iOS guide data ───────────────────────────────────────────────────────────
const IOS_MAIN: MockupItem[] = [
  { icon: "✈️", label: "Aeroplane Mode", hasToggle: true, toggleOn: false },
  { icon: "📶", label: "Wi-Fi", detail: "Home Network", hasArrow: true },
  { icon: "🔵", label: "Bluetooth", detail: "On", hasArrow: true },
  { icon: "🔔", label: "Notifications", hasArrow: true },
  { icon: "🔊", label: "Sounds & Haptics", hasArrow: true },
  { icon: "🌙", label: "Focus", hasArrow: true },
  { icon: "☀️", label: "Display & Brightness", hasArrow: true },
  { icon: "🔋", label: "Battery", hasArrow: true },
];

const IOS_GUIDES: Record<SettingTopic, Omit<SettingsGuide, "uiStyle">> = {
  bluetooth: {
    topic: "bluetooth", heading: "Connect Bluetooth (iPhone)",
    steps: [
      { title: "Settings", showSearch: true, items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 2 })), highlightedIndex: 2, caption: 'Open Settings, then tap "Bluetooth"' },
      { title: "Bluetooth", showBack: true, items: [{ icon: "🔵", label: "Bluetooth", hasToggle: true, toggleOn: true, isHighlighted: true }, { icon: "🎧", label: "My Headphones", detail: "Not Connected", hasArrow: true }, { icon: "📱", label: "iPad", detail: "Not Connected", hasArrow: true }], highlightedIndex: 0, caption: "Make sure the Bluetooth switch is turned ON (green)" },
      { title: "Bluetooth", showBack: true, items: [{ icon: "🔵", label: "Bluetooth", hasToggle: true, toggleOn: true }, { icon: "🎧", label: "My Headphones", detail: "Not Connected", hasArrow: true, isHighlighted: true }, { icon: "📱", label: "iPad", detail: "Not Connected", hasArrow: true }], highlightedIndex: 1, caption: "Tap your device name in the list to connect" },
    ],
  },
  wifi: {
    topic: "wifi", heading: "Connect to Wi-Fi (iPhone)",
    steps: [
      { title: "Settings", showSearch: true, items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 1 })), highlightedIndex: 1, caption: 'Open Settings, then tap "Wi-Fi"' },
      { title: "Wi-Fi", showBack: true, items: [{ icon: "📶", label: "Wi-Fi", hasToggle: true, toggleOn: true, isHighlighted: true }, { icon: "📶", label: "HomeNetwork_5G", detail: "Secured", hasArrow: true }, { icon: "📶", label: "HomeNetwork_2G", detail: "Secured", hasArrow: true }], highlightedIndex: 0, caption: "Confirm the Wi-Fi switch is ON (green)" },
      { title: "Wi-Fi", showBack: true, items: [{ icon: "📶", label: "Wi-Fi", hasToggle: true, toggleOn: true }, { icon: "📶", label: "HomeNetwork_5G", detail: "Secured", hasArrow: true, isHighlighted: true }, { icon: "📶", label: "HomeNetwork_2G", detail: "Secured", hasArrow: true }], highlightedIndex: 1, caption: "Tap your home network name to connect" },
    ],
  },
  volume: {
    topic: "volume", heading: "Adjust Volume (iPhone)",
    steps: [
      { title: "Settings", showSearch: true, items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 4 })), highlightedIndex: 4, caption: 'Open Settings, then tap "Sounds & Haptics"' },
      { title: "Sounds & Haptics", showBack: true, items: [{ icon: "🔊", label: "Ringer and Alerts", detail: "Use the slider below" }], highlightedIndex: 0, hasSlider: true, sliderValue: 0.65, sliderHighlighted: true, caption: "Drag the slider right to increase, left to lower the ringtone volume" },
    ],
  },
  brightness: {
    topic: "brightness", heading: "Adjust Brightness (iPhone)",
    steps: [
      { title: "Settings", showSearch: true, items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 6 })), highlightedIndex: 6, caption: 'Open Settings, then tap "Display & Brightness"' },
      { title: "Display & Brightness", showBack: true, items: [{ icon: "☀️", label: "Brightness", detail: "Drag the slider below" }], highlightedIndex: 0, hasSlider: true, sliderValue: 0.5, sliderHighlighted: true, caption: "Drag right for a brighter screen, left for dimmer" },
    ],
  },
  silent: {
    topic: "silent", heading: "Do Not Disturb (iPhone)",
    steps: [
      { title: "Settings", showSearch: true, items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 5 })), highlightedIndex: 5, caption: 'Open Settings, then tap "Focus"' },
      { title: "Focus", showBack: true, items: [{ icon: "🌙", label: "Do Not Disturb", detail: "Off", hasArrow: true, isHighlighted: true }, { icon: "👤", label: "Personal", detail: "Off", hasArrow: true }, { icon: "💼", label: "Work", detail: "Off", hasArrow: true }], highlightedIndex: 0, caption: 'Tap "Do Not Disturb"' },
      { title: "Do Not Disturb", showBack: true, items: [{ icon: "🌙", label: "Do Not Disturb", hasToggle: true, toggleOn: false, isHighlighted: true }, { icon: "⏰", label: "Turn On Automatically", hasArrow: true }], highlightedIndex: 0, caption: "Tap the switch to turn Do Not Disturb ON (it turns green)" },
    ],
  },
  battery: {
    topic: "battery", heading: "Low Power Mode (iPhone)",
    steps: [
      { title: "Settings", showSearch: true, items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 7 })), highlightedIndex: 7, caption: 'Open Settings, then tap "Battery"' },
      { title: "Battery", showBack: true, items: [{ icon: "⚡", label: "Low Power Mode", hasToggle: true, toggleOn: false, isHighlighted: true }, { icon: "🔋", label: "Battery Health & Charging", hasArrow: true }, { icon: "📊", label: "Battery Usage", hasArrow: true }], highlightedIndex: 0, caption: "Tap Low Power Mode to turn it ON — the switch turns yellow" },
    ],
  },
  rotate: {
    topic: "rotate", heading: "Auto-Rotate Screen (iPhone)",
    steps: [
      { title: "Control Centre", items: [{ icon: "🔄", label: "Rotation Lock", detail: "Swipe down from top-right corner", hasToggle: true, toggleOn: true, isHighlighted: true }, { icon: "📶", label: "Wi-Fi & Bluetooth" }, { icon: "🌙", label: "Focus / Do Not Disturb" }], highlightedIndex: 0, caption: "Swipe down from the top-right corner of the screen to open Control Centre" },
      { title: "Control Centre", items: [{ icon: "🔄", label: "Rotation Lock", detail: "Tap to unlock rotation", hasToggle: true, toggleOn: false, isHighlighted: true }, { icon: "📶", label: "Wi-Fi & Bluetooth" }, { icon: "🌙", label: "Focus / Do Not Disturb" }], highlightedIndex: 0, caption: "Tap the Rotation Lock icon to unlock. When unlocked, auto-rotate turns ON" },
    ],
  },
};

// ─── Samsung One UI guide data ────────────────────────────────────────────────
const SAMSUNG_MAIN: MockupItem[] = [
  { icon: "📶", label: "Connections", detail: "Wi-Fi, Bluetooth, NFC", hasArrow: true },
  { icon: "🔊", label: "Sounds and vibration", hasArrow: true },
  { icon: "🔔", label: "Notifications", hasArrow: true },
  { icon: "☀️", label: "Display", hasArrow: true },
  { icon: "🌙", label: "Modes and Routines", hasArrow: true },
  { icon: "🔋", label: "Battery and device care", hasArrow: true },
  { icon: "📱", label: "Apps", hasArrow: true },
];

const SAMSUNG_GUIDES: Record<SettingTopic, Omit<SettingsGuide, "uiStyle">> = {
  bluetooth: {
    topic: "bluetooth", heading: "Connect Bluetooth (Samsung)",
    steps: [
      { title: "Settings", showSearch: true, items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 0 })), highlightedIndex: 0, caption: 'Open Settings, then tap "Connections"' },
      { title: "Connections", showBack: true, items: [{ icon: "🔵", label: "Bluetooth", hasToggle: true, toggleOn: true, isHighlighted: true }, { icon: "📶", label: "Wi-Fi", hasToggle: true, toggleOn: true }, { icon: "📱", label: "NFC and contactless payments", hasArrow: true }, { icon: "✈️", label: "Flight mode", hasToggle: true, toggleOn: false }], highlightedIndex: 0, caption: 'Make sure Bluetooth is turned ON, then tap the "Bluetooth" row' },
      { title: "Bluetooth", showBack: true, items: [{ icon: "🔵", label: "Bluetooth", hasToggle: true, toggleOn: true }, { icon: "➕", label: "Pair new device", hasArrow: true, isHighlighted: true }, { icon: "🎧", label: "My Headphones", detail: "Not connected", hasArrow: true }], highlightedIndex: 1, caption: 'Tap "Pair new device" to search, or tap your device name in the list' },
    ],
  },
  wifi: {
    topic: "wifi", heading: "Connect to Wi-Fi (Samsung)",
    steps: [
      { title: "Settings", showSearch: true, items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 0 })), highlightedIndex: 0, caption: 'Open Settings, then tap "Connections"' },
      { title: "Connections", showBack: true, items: [{ icon: "🔵", label: "Bluetooth", hasToggle: true, toggleOn: true }, { icon: "📶", label: "Wi-Fi", hasToggle: true, toggleOn: true, isHighlighted: true }, { icon: "📱", label: "NFC and contactless payments", hasArrow: true }], highlightedIndex: 1, caption: 'Make sure Wi-Fi is ON, then tap the "Wi-Fi" row' },
      { title: "Wi-Fi", showBack: true, items: [{ icon: "📶", label: "Wi-Fi", hasToggle: true, toggleOn: true }, { icon: "📶", label: "HomeNetwork_5G", detail: "Saved", hasArrow: true, isHighlighted: true }, { icon: "📶", label: "Neighbor_WiFi", detail: "Available", hasArrow: true }], highlightedIndex: 1, caption: "Tap your home network name to connect" },
    ],
  },
  volume: {
    topic: "volume", heading: "Adjust Volume (Samsung)",
    steps: [
      { title: "Settings", showSearch: true, items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 1 })), highlightedIndex: 1, caption: 'Open Settings, then tap "Sounds and vibration"' },
      { title: "Sounds and vibration", showBack: true, items: [{ icon: "📳", label: "Ringtone", hasArrow: true }, { icon: "🔊", label: "Media", detail: "Drag the slider below" }], highlightedIndex: 1, hasSlider: true, sliderValue: 0.6, sliderHighlighted: true, caption: "Drag the media volume slider to adjust the level" },
    ],
  },
  brightness: {
    topic: "brightness", heading: "Adjust Brightness (Samsung)",
    steps: [
      { title: "Settings", showSearch: true, items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 3 })), highlightedIndex: 3, caption: 'Open Settings, then tap "Display"' },
      { title: "Display", showBack: true, items: [{ icon: "☀️", label: "Brightness", detail: "Drag the slider below" }, { icon: "🌙", label: "Dark mode", hasToggle: true, toggleOn: false }, { icon: "🔎", label: "Screen zoom", hasArrow: true }], highlightedIndex: 0, hasSlider: true, sliderValue: 0.5, sliderHighlighted: true, caption: "Drag the brightness slider — right for brighter, left for dimmer" },
    ],
  },
  silent: {
    topic: "silent", heading: "Do Not Disturb (Samsung)",
    steps: [
      { title: "Settings", showSearch: true, items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 4 })), highlightedIndex: 4, caption: 'Open Settings, then tap "Modes and Routines"' },
      { title: "Modes", showBack: true, items: [{ icon: "🌙", label: "Do not disturb", detail: "Tap to enable", hasArrow: true, isHighlighted: true }, { icon: "🛏️", label: "Sleep", detail: "Off", hasArrow: true }, { icon: "💼", label: "Work", detail: "Off", hasArrow: true }], highlightedIndex: 0, caption: 'Tap "Do not disturb" to turn it on' },
      { title: "Do not disturb", showBack: true, items: [{ icon: "🌙", label: "Do not disturb", hasToggle: true, toggleOn: false, isHighlighted: true }, { icon: "⏰", label: "Schedule", hasArrow: true }, { icon: "📞", label: "Allow calls from", hasArrow: true }], highlightedIndex: 0, caption: "Tap the switch to turn Do Not Disturb ON" },
    ],
  },
  battery: {
    topic: "battery", heading: "Power Saving Mode (Samsung)",
    steps: [
      { title: "Settings", showSearch: true, items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 5 })), highlightedIndex: 5, caption: 'Open Settings, then tap "Battery and device care"' },
      { title: "Battery and device care", showBack: true, items: [{ icon: "🔋", label: "Battery", hasArrow: true, isHighlighted: true }, { icon: "💾", label: "Storage", hasArrow: true }, { icon: "⚡", label: "Memory", hasArrow: true }], highlightedIndex: 0, caption: 'Tap "Battery"' },
      { title: "Battery", showBack: true, items: [{ icon: "⚡", label: "Power saving", hasToggle: true, toggleOn: false, isHighlighted: true }, { icon: "🔋", label: "Protect battery", hasToggle: true, toggleOn: false }, { icon: "📊", label: "Battery usage", hasArrow: true }], highlightedIndex: 0, caption: "Tap the Power saving switch to turn it ON (turns blue)" },
    ],
  },
  rotate: {
    topic: "rotate", heading: "Auto Rotate (Samsung)",
    steps: [
      { title: "Settings", showSearch: true, items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 3 })), highlightedIndex: 3, caption: 'Open Settings, then tap "Display"' },
      { title: "Display", showBack: true, items: [{ icon: "☀️", label: "Brightness", hasArrow: true }, { icon: "🔄", label: "Auto rotate", hasToggle: true, toggleOn: false, isHighlighted: true }, { icon: "🔤", label: "Font size and style", hasArrow: true }, { icon: "🌙", label: "Screen mode", hasArrow: true }], highlightedIndex: 1, caption: 'Find "Auto rotate" and tap the switch to turn it ON' },
    ],
  },
};

// ─── Stock Android (Pixel) guide data ─────────────────────────────────────────
const PIXEL_MAIN: MockupItem[] = [
  { icon: "📶", label: "Network & internet", detail: "Wi-Fi, mobile, data usage", hasArrow: true },
  { icon: "🔵", label: "Connected devices", detail: "Bluetooth, cast", hasArrow: true },
  { icon: "📱", label: "Apps", hasArrow: true },
  { icon: "🔔", label: "Notifications", hasArrow: true },
  { icon: "🔋", label: "Battery", hasArrow: true },
  { icon: "☀️", label: "Display", hasArrow: true },
  { icon: "🔊", label: "Sound & vibration", hasArrow: true },
];

const PIXEL_GUIDES: Record<SettingTopic, Omit<SettingsGuide, "uiStyle">> = {
  bluetooth: {
    topic: "bluetooth", heading: "Connect Bluetooth (Android)",
    steps: [
      { title: "Settings", showSearch: true, items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 1 })), highlightedIndex: 1, caption: 'Open Settings, then tap "Connected devices"' },
      { title: "Connected devices", showBack: true, items: [{ icon: "➕", label: "Pair new device", hasArrow: true, isHighlighted: true }, { icon: "🔵", label: "Connection preferences", detail: "Bluetooth, NFC", hasArrow: true }], highlightedIndex: 0, caption: 'Tap "Pair new device" to search for your Bluetooth device' },
      { title: "Pair new device", showBack: true, items: [{ icon: "🔵", label: "Bluetooth", hasToggle: true, toggleOn: true }, { icon: "🎧", label: "My Headphones", detail: "Available", hasArrow: true, isHighlighted: true }, { icon: "📱", label: "BT Speaker", detail: "Available", hasArrow: true }], highlightedIndex: 1, caption: "Tap the name of your device when it appears" },
    ],
  },
  wifi: {
    topic: "wifi", heading: "Connect to Wi-Fi (Android)",
    steps: [
      { title: "Settings", showSearch: true, items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 0 })), highlightedIndex: 0, caption: 'Open Settings, then tap "Network & internet"' },
      { title: "Network & internet", showBack: true, items: [{ icon: "📶", label: "Internet", detail: "HomeNetwork", hasArrow: true, isHighlighted: true }, { icon: "📞", label: "Calls & SMS", hasArrow: true }, { icon: "🔥", label: "Hotspot & tethering", hasArrow: true }], highlightedIndex: 0, caption: 'Tap "Internet" (Wi-Fi)' },
      { title: "Internet", showBack: true, items: [{ icon: "📶", label: "Wi-Fi", hasToggle: true, toggleOn: true }, { icon: "📶", label: "HomeNetwork", detail: "Connected", hasArrow: true, isHighlighted: true }, { icon: "📶", label: "Neighbor_WiFi", detail: "Available", hasArrow: true }], highlightedIndex: 1, caption: "Tap your home network name to connect" },
    ],
  },
  volume: {
    topic: "volume", heading: "Adjust Volume (Android)",
    steps: [
      { title: "Settings", showSearch: true, items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 6 })), highlightedIndex: 6, caption: 'Open Settings, then tap "Sound & vibration"' },
      { title: "Sound & vibration", showBack: true, items: [{ icon: "🔊", label: "Media volume", detail: "Drag the slider below" }, { icon: "📞", label: "Call volume", hasArrow: true }], highlightedIndex: 0, hasSlider: true, sliderValue: 0.6, sliderHighlighted: true, caption: "Drag the Media volume slider to adjust" },
    ],
  },
  brightness: {
    topic: "brightness", heading: "Adjust Brightness (Android)",
    steps: [
      { title: "Settings", showSearch: true, items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 5 })), highlightedIndex: 5, caption: 'Open Settings, then tap "Display"' },
      { title: "Display", showBack: true, items: [{ icon: "☀️", label: "Brightness level", detail: "Drag the slider below" }, { icon: "🌙", label: "Dark theme", hasToggle: true, toggleOn: false }, { icon: "🔎", label: "Display size and text", hasArrow: true }], highlightedIndex: 0, hasSlider: true, sliderValue: 0.5, sliderHighlighted: true, caption: "Drag the Brightness level slider — right for brighter, left for dimmer" },
    ],
  },
  silent: {
    topic: "silent", heading: "Do Not Disturb (Android)",
    steps: [
      { title: "Settings", showSearch: true, items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 3 })), highlightedIndex: 3, caption: 'Open Settings, then tap "Notifications"' },
      { title: "Notifications", showBack: true, items: [{ icon: "🌙", label: "Do Not Disturb", detail: "Off", hasArrow: true, isHighlighted: true }, { icon: "🔔", label: "App notifications", hasArrow: true }, { icon: "⏰", label: "Notification history", hasArrow: true }], highlightedIndex: 0, caption: 'Tap "Do Not Disturb"' },
      { title: "Do Not Disturb", showBack: true, items: [{ icon: "🌙", label: "Use Do Not Disturb", hasToggle: true, toggleOn: false, isHighlighted: true }, { icon: "⏰", label: "Schedules", hasArrow: true }, { icon: "👤", label: "People", hasArrow: true }], highlightedIndex: 0, caption: 'Tap "Use Do Not Disturb" to turn it ON' },
    ],
  },
  battery: {
    topic: "battery", heading: "Battery Saver (Android)",
    steps: [
      { title: "Settings", showSearch: true, items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 4 })), highlightedIndex: 4, caption: 'Open Settings, then tap "Battery"' },
      { title: "Battery", showBack: true, items: [{ icon: "⚡", label: "Battery Saver", detail: "Off", hasArrow: true, isHighlighted: true }, { icon: "🔋", label: "Battery usage", hasArrow: true }, { icon: "📊", label: "Battery health", hasArrow: true }], highlightedIndex: 0, caption: 'Tap "Battery Saver"' },
      { title: "Battery Saver", showBack: true, items: [{ icon: "⚡", label: "Use Battery Saver", hasToggle: true, toggleOn: false, isHighlighted: true }, { icon: "⏰", label: "Set a schedule", hasArrow: true }], highlightedIndex: 0, caption: "Tap the switch to turn Battery Saver ON" },
    ],
  },
  rotate: {
    topic: "rotate", heading: "Auto-Rotate Screen (Android)",
    steps: [
      { title: "Settings", showSearch: true, items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 5 })), highlightedIndex: 5, caption: 'Open Settings, then tap "Display"' },
      { title: "Display", showBack: true, items: [{ icon: "☀️", label: "Brightness level", hasArrow: true }, { icon: "🔄", label: "Auto-rotate screen", hasToggle: true, toggleOn: false, isHighlighted: true }, { icon: "🌙", label: "Dark theme", hasToggle: true, toggleOn: false }, { icon: "🔎", label: "Display size and text", hasArrow: true }], highlightedIndex: 1, caption: 'Find "Auto-rotate screen" and tap the switch to turn it ON (turns blue)' },
    ],
  },
};

// ─── selector ─────────────────────────────────────────────────────────────────
export function getGuideForDevice(topic: SettingTopic, uiStyle: UiStyle): SettingsGuide {
  let base: Omit<SettingsGuide, "uiStyle">;
  if (uiStyle === "ios") base = IOS_GUIDES[topic];
  else if (uiStyle === "samsung") base = SAMSUNG_GUIDES[topic];
  else base = PIXEL_GUIDES[topic];
  return { ...base, uiStyle };
}

// ─── topic detection ──────────────────────────────────────────────────────────
export function detectTopic(text: string): SettingTopic | null {
  const t = text.toLowerCase();
  if (/rotat|auto.?rotat|landscape|portrait|screen.?orient/.test(t)) return "rotate";
  if (/bluetoot|pair|earphone|headphone|speaker|connect.*device|wireless.*device/.test(t)) return "bluetooth";
  if (/wi.?fi|wifi|wireless.*network|internet.*connect|connect.*network|password.*network/.test(t)) return "wifi";
  if (/volume|ringtone|loud|quiet|sound level|media volume|call volume|mute/.test(t)) return "volume";
  if (/bright|screen bright|dim|dim.*screen|display.*bright/.test(t)) return "brightness";
  if (/do not disturb|silent|dnd|quiet mode|no disturb|disturb/.test(t)) return "silent";
  if (/battery.*sav|power.*sav|low power|save.*battery|battery.*mode/.test(t)) return "battery";
  return null;
}

// ─── UI style detection from text ────────────────────────────────────────────
export function detectUiStyleFromText(text: string): UiStyle | null {
  const t = text.toLowerCase();
  if (/iphone|ipad|ipod|ios|apple\s+phone/.test(t)) return "ios";
  if (/samsung|galaxy\s+[sazmf]|one\s*ui|galaxy\s+tab/.test(t)) return "samsung";
  if (/s2[0-5]|galaxy\s+z\s*(fold|flip)/.test(t)) return "samsung";
  if (/pixel\s+\d|google\s+pixel/.test(t)) return "pixel";
  if (/oneplus|one\s+plus|oppo|realme|xiaomi|redmi|poco|vivo|motorola|moto\s+[gem]|nokia|xperia|asus\s+zen|nothing\s+phone|huawei|honor|infinix|tecno/.test(t)) return "android";
  return null;
}

// ─── topic label for UI ───────────────────────────────────────────────────────
export const TOPIC_LABELS: Record<SettingTopic, string> = {
  bluetooth: "Bluetooth",
  wifi: "Wi-Fi",
  volume: "Volume",
  brightness: "Brightness",
  silent: "Do Not Disturb",
  battery: "Battery Saver",
  rotate: "Auto-Rotate",
};
