import type { UiStyle } from "@/lib/deviceInfo";

export type SettingTopic =
  | "bluetooth"
  | "wifi"
  | "volume"
  | "brightness"
  | "silent"
  | "battery";

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
  { icon: "airplane", label: "Aeroplane Mode", hasToggle: true, toggleOn: false },
  { icon: "wifi", label: "Wi-Fi", detail: "Home Network", hasArrow: true },
  { icon: "bluetooth", label: "Bluetooth", detail: "On", hasArrow: true },
  { icon: "notifications", label: "Notifications", hasArrow: true },
  { icon: "volume-high", label: "Sounds & Haptics", hasArrow: true },
  { icon: "moon", label: "Focus", hasArrow: true },
  { icon: "contrast", label: "Display & Brightness", hasArrow: true },
  { icon: "battery-half", label: "Battery", hasArrow: true },
];

const IOS_GUIDES: Record<SettingTopic, Omit<SettingsGuide, "uiStyle">> = {
  bluetooth: {
    topic: "bluetooth",
    heading: "Connect Bluetooth (iPhone)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 2 })),
        highlightedIndex: 2,
        caption: 'Open Settings, then tap "Bluetooth"',
      },
      {
        title: "Bluetooth",
        showBack: true,
        items: [
          { icon: "bluetooth", label: "Bluetooth", hasToggle: true, toggleOn: true, isHighlighted: true },
          { icon: "headset", label: "My Headphones", detail: "Not Connected", hasArrow: true },
          { icon: "tablet-portrait", label: "iPad", detail: "Not Connected", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: "Make sure the Bluetooth switch is turned ON (green)",
      },
      {
        title: "Bluetooth",
        showBack: true,
        items: [
          { icon: "bluetooth", label: "Bluetooth", hasToggle: true, toggleOn: true },
          { icon: "headset", label: "My Headphones", detail: "Not Connected", hasArrow: true, isHighlighted: true },
          { icon: "tablet-portrait", label: "iPad", detail: "Not Connected", hasArrow: true },
        ],
        highlightedIndex: 1,
        caption: "Tap your device name in the list to connect",
      },
    ],
  },
  wifi: {
    topic: "wifi",
    heading: "Connect to Wi-Fi (iPhone)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 1 })),
        highlightedIndex: 1,
        caption: 'Open Settings, then tap "Wi-Fi"',
      },
      {
        title: "Wi-Fi",
        showBack: true,
        items: [
          { icon: "wifi", label: "Wi-Fi", hasToggle: true, toggleOn: true, isHighlighted: true },
          { icon: "wifi", label: "HomeNetwork_5G", detail: "Secured", hasArrow: true },
          { icon: "wifi", label: "HomeNetwork_2G", detail: "Secured", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: "Confirm the Wi-Fi switch is ON (green)",
      },
      {
        title: "Wi-Fi",
        showBack: true,
        items: [
          { icon: "wifi", label: "Wi-Fi", hasToggle: true, toggleOn: true },
          { icon: "wifi", label: "HomeNetwork_5G", detail: "Secured", hasArrow: true, isHighlighted: true },
          { icon: "wifi", label: "HomeNetwork_2G", detail: "Secured", hasArrow: true },
        ],
        highlightedIndex: 1,
        caption: "Tap your home network name to connect",
      },
    ],
  },
  volume: {
    topic: "volume",
    heading: "Adjust Volume (iPhone)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 4 })),
        highlightedIndex: 4,
        caption: 'Open Settings, then tap "Sounds & Haptics"',
      },
      {
        title: "Sounds & Haptics",
        showBack: true,
        items: [
          { icon: "volume-high", label: "Ringer and Alerts", detail: "Use the slider below" },
        ],
        highlightedIndex: 0,
        hasSlider: true,
        sliderValue: 0.65,
        sliderHighlighted: true,
        caption: "Drag the slider right to increase, left to lower the ringtone volume",
      },
    ],
  },
  brightness: {
    topic: "brightness",
    heading: "Adjust Brightness (iPhone)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 6 })),
        highlightedIndex: 6,
        caption: 'Open Settings, then tap "Display & Brightness"',
      },
      {
        title: "Display & Brightness",
        showBack: true,
        items: [
          { icon: "sunny", label: "Brightness", detail: "Drag the slider below" },
        ],
        highlightedIndex: 0,
        hasSlider: true,
        sliderValue: 0.5,
        sliderHighlighted: true,
        caption: "Drag right for a brighter screen, left for dimmer",
      },
    ],
  },
  silent: {
    topic: "silent",
    heading: "Do Not Disturb (iPhone)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 5 })),
        highlightedIndex: 5,
        caption: 'Open Settings, then tap "Focus"',
      },
      {
        title: "Focus",
        showBack: true,
        items: [
          { icon: "moon", label: "Do Not Disturb", detail: "Off", hasArrow: true, isHighlighted: true },
          { icon: "person", label: "Personal", detail: "Off", hasArrow: true },
          { icon: "briefcase", label: "Work", detail: "Off", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Do Not Disturb"',
      },
      {
        title: "Do Not Disturb",
        showBack: true,
        items: [
          { icon: "moon", label: "Do Not Disturb", hasToggle: true, toggleOn: false, isHighlighted: true },
          { icon: "time", label: "Turn On Automatically", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: "Tap the switch to turn Do Not Disturb ON (it turns green)",
      },
    ],
  },
  battery: {
    topic: "battery",
    heading: "Low Power Mode (iPhone)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: IOS_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 7 })),
        highlightedIndex: 7,
        caption: 'Open Settings, then tap "Battery"',
      },
      {
        title: "Battery",
        showBack: true,
        items: [
          { icon: "battery-charging", label: "Low Power Mode", hasToggle: true, toggleOn: false, isHighlighted: true },
          { icon: "battery-full", label: "Battery Health & Charging", hasArrow: true },
          { icon: "analytics", label: "Battery Usage", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: "Tap Low Power Mode to turn it ON — the switch turns yellow",
      },
    ],
  },
};

// ─── Samsung One UI guide data ────────────────────────────────────────────────

const SAMSUNG_MAIN: MockupItem[] = [
  { icon: "wifi", label: "Connections", detail: "Wi-Fi, Bluetooth, NFC", hasArrow: true },
  { icon: "volume-high", label: "Sounds and vibration", hasArrow: true },
  { icon: "notifications", label: "Notifications", hasArrow: true },
  { icon: "contrast", label: "Display", hasArrow: true },
  { icon: "moon", label: "Modes and Routines", hasArrow: true },
  { icon: "battery-half", label: "Battery and device care", hasArrow: true },
  { icon: "apps", label: "Apps", hasArrow: true },
];

const SAMSUNG_GUIDES: Record<SettingTopic, Omit<SettingsGuide, "uiStyle">> = {
  bluetooth: {
    topic: "bluetooth",
    heading: "Connect Bluetooth (Samsung)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 0 })),
        highlightedIndex: 0,
        caption: 'Open Settings, then tap "Connections"',
      },
      {
        title: "Connections",
        showBack: true,
        items: [
          { icon: "bluetooth", label: "Bluetooth", hasToggle: true, toggleOn: true, isHighlighted: true },
          { icon: "wifi", label: "Wi-Fi", hasToggle: true, toggleOn: true },
          { icon: "phone-portrait", label: "NFC and contactless payments", hasArrow: true },
          { icon: "airplane", label: "Flight mode", hasToggle: true, toggleOn: false },
        ],
        highlightedIndex: 0,
        caption: 'Make sure Bluetooth is turned ON, then tap the "Bluetooth" row',
      },
      {
        title: "Bluetooth",
        showBack: true,
        items: [
          { icon: "bluetooth", label: "Bluetooth", hasToggle: true, toggleOn: true },
          { icon: "add-circle", label: "Pair new device", hasArrow: true, isHighlighted: true },
          { icon: "headset", label: "My Headphones", detail: "Not connected", hasArrow: true },
        ],
        highlightedIndex: 1,
        caption: 'Tap "Pair new device" to search, or tap your device name in the list',
      },
    ],
  },
  wifi: {
    topic: "wifi",
    heading: "Connect to Wi-Fi (Samsung)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 0 })),
        highlightedIndex: 0,
        caption: 'Open Settings, then tap "Connections"',
      },
      {
        title: "Connections",
        showBack: true,
        items: [
          { icon: "bluetooth", label: "Bluetooth", hasToggle: true, toggleOn: true },
          { icon: "wifi", label: "Wi-Fi", hasToggle: true, toggleOn: true, isHighlighted: true },
          { icon: "phone-portrait", label: "NFC and contactless payments", hasArrow: true },
        ],
        highlightedIndex: 1,
        caption: 'Make sure Wi-Fi is ON, then tap the "Wi-Fi" row',
      },
      {
        title: "Wi-Fi",
        showBack: true,
        items: [
          { icon: "wifi", label: "Wi-Fi", hasToggle: true, toggleOn: true },
          { icon: "wifi", label: "HomeNetwork_5G", detail: "Saved", hasArrow: true, isHighlighted: true },
          { icon: "wifi", label: "Neighbor_WiFi", detail: "Available", hasArrow: true },
        ],
        highlightedIndex: 1,
        caption: "Tap your home network name to connect",
      },
    ],
  },
  volume: {
    topic: "volume",
    heading: "Adjust Volume (Samsung)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 1 })),
        highlightedIndex: 1,
        caption: 'Open Settings, then tap "Sounds and vibration"',
      },
      {
        title: "Sounds and vibration",
        showBack: true,
        items: [
          { icon: "phone-portrait", label: "Ringtone", hasArrow: true },
          { icon: "volume-high", label: "Media", detail: "Drag the slider below" },
        ],
        highlightedIndex: 1,
        hasSlider: true,
        sliderValue: 0.6,
        sliderHighlighted: true,
        caption: "Drag the media volume slider to adjust the level",
      },
    ],
  },
  brightness: {
    topic: "brightness",
    heading: "Adjust Brightness (Samsung)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 3 })),
        highlightedIndex: 3,
        caption: 'Open Settings, then tap "Display"',
      },
      {
        title: "Display",
        showBack: true,
        items: [
          { icon: "sunny", label: "Brightness", detail: "Drag the slider below" },
          { icon: "moon", label: "Dark mode", hasToggle: true, toggleOn: false },
          { icon: "resize", label: "Screen zoom", hasArrow: true },
        ],
        highlightedIndex: 0,
        hasSlider: true,
        sliderValue: 0.5,
        sliderHighlighted: true,
        caption: "Drag the brightness slider — right for brighter, left for dimmer",
      },
    ],
  },
  silent: {
    topic: "silent",
    heading: "Do Not Disturb (Samsung)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 4 })),
        highlightedIndex: 4,
        caption: 'Open Settings, then tap "Modes and Routines"',
      },
      {
        title: "Modes",
        showBack: true,
        items: [
          { icon: "moon", label: "Do not disturb", detail: "Tap to enable", hasArrow: true, isHighlighted: true },
          { icon: "bed", label: "Sleep", detail: "Off", hasArrow: true },
          { icon: "briefcase", label: "Work", detail: "Off", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Do not disturb" to turn it on',
      },
      {
        title: "Do not disturb",
        showBack: true,
        items: [
          { icon: "moon", label: "Do not disturb", hasToggle: true, toggleOn: false, isHighlighted: true },
          { icon: "time", label: "Schedule", hasArrow: true },
          { icon: "call", label: "Allow calls from", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: "Tap the switch to turn Do Not Disturb ON",
      },
    ],
  },
  battery: {
    topic: "battery",
    heading: "Power Saving Mode (Samsung)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: SAMSUNG_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 5 })),
        highlightedIndex: 5,
        caption: 'Open Settings, then tap "Battery and device care"',
      },
      {
        title: "Battery and device care",
        showBack: true,
        items: [
          { icon: "battery-half", label: "Battery", hasArrow: true, isHighlighted: true },
          { icon: "hardware-chip", label: "Storage", hasArrow: true },
          { icon: "speedometer", label: "Memory", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Battery"',
      },
      {
        title: "Battery",
        showBack: true,
        items: [
          { icon: "battery-charging", label: "Power saving", hasToggle: true, toggleOn: false, isHighlighted: true },
          { icon: "battery-full", label: "Protect battery", hasToggle: true, toggleOn: false },
          { icon: "analytics", label: "Battery usage", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: "Tap the Power saving switch to turn it ON (turns blue)",
      },
    ],
  },
};

// ─── Stock Android (Pixel) guide data ─────────────────────────────────────────

const PIXEL_MAIN: MockupItem[] = [
  { icon: "wifi", label: "Network & internet", detail: "Wi-Fi, mobile, data usage", hasArrow: true },
  { icon: "bluetooth", label: "Connected devices", detail: "Bluetooth, cast", hasArrow: true },
  { icon: "apps", label: "Apps", hasArrow: true },
  { icon: "notifications", label: "Notifications", hasArrow: true },
  { icon: "battery-half", label: "Battery", hasArrow: true },
  { icon: "contrast", label: "Display", hasArrow: true },
  { icon: "volume-high", label: "Sound & vibration", hasArrow: true },
];

const PIXEL_GUIDES: Record<SettingTopic, Omit<SettingsGuide, "uiStyle">> = {
  bluetooth: {
    topic: "bluetooth",
    heading: "Connect Bluetooth (Android)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 1 })),
        highlightedIndex: 1,
        caption: 'Open Settings, then tap "Connected devices"',
      },
      {
        title: "Connected devices",
        showBack: true,
        items: [
          { icon: "add-circle", label: "Pair new device", hasArrow: true, isHighlighted: true },
          { icon: "bluetooth", label: "Connection preferences", detail: "Bluetooth, NFC", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Pair new device" to search for your Bluetooth device',
      },
      {
        title: "Pair new device",
        showBack: true,
        items: [
          { icon: "bluetooth", label: "Bluetooth", hasToggle: true, toggleOn: true },
          { icon: "headset", label: "My Headphones", detail: "Available", hasArrow: true, isHighlighted: true },
          { icon: "phone-portrait", label: "BT Speaker", detail: "Available", hasArrow: true },
        ],
        highlightedIndex: 1,
        caption: "Tap the name of your device when it appears",
      },
    ],
  },
  wifi: {
    topic: "wifi",
    heading: "Connect to Wi-Fi (Android)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 0 })),
        highlightedIndex: 0,
        caption: 'Open Settings, then tap "Network & internet"',
      },
      {
        title: "Network & internet",
        showBack: true,
        items: [
          { icon: "wifi", label: "Internet", detail: "HomeNetwork", hasArrow: true, isHighlighted: true },
          { icon: "call", label: "Calls & SMS", hasArrow: true },
          { icon: "hotspot", label: "Hotspot & tethering", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Internet" (Wi-Fi)',
      },
      {
        title: "Internet",
        showBack: true,
        items: [
          { icon: "wifi", label: "Wi-Fi", hasToggle: true, toggleOn: true },
          { icon: "wifi", label: "HomeNetwork", detail: "Connected", hasArrow: true, isHighlighted: true },
          { icon: "wifi", label: "Neighbor_WiFi", detail: "Available", hasArrow: true },
        ],
        highlightedIndex: 1,
        caption: "Tap your home network name to connect",
      },
    ],
  },
  volume: {
    topic: "volume",
    heading: "Adjust Volume (Android)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 6 })),
        highlightedIndex: 6,
        caption: 'Open Settings, then tap "Sound & vibration"',
      },
      {
        title: "Sound & vibration",
        showBack: true,
        items: [
          { icon: "volume-high", label: "Media volume", detail: "Drag the slider below" },
          { icon: "phone-portrait", label: "Call volume", hasArrow: true },
        ],
        highlightedIndex: 0,
        hasSlider: true,
        sliderValue: 0.6,
        sliderHighlighted: true,
        caption: "Drag the Media volume slider to adjust",
      },
    ],
  },
  brightness: {
    topic: "brightness",
    heading: "Adjust Brightness (Android)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 5 })),
        highlightedIndex: 5,
        caption: 'Open Settings, then tap "Display"',
      },
      {
        title: "Display",
        showBack: true,
        items: [
          { icon: "sunny", label: "Brightness level", detail: "Drag the slider below" },
          { icon: "contrast", label: "Dark theme", hasToggle: true, toggleOn: false },
          { icon: "resize", label: "Display size and text", hasArrow: true },
        ],
        highlightedIndex: 0,
        hasSlider: true,
        sliderValue: 0.5,
        sliderHighlighted: true,
        caption: "Drag the Brightness level slider — right for brighter, left for dimmer",
      },
    ],
  },
  silent: {
    topic: "silent",
    heading: "Do Not Disturb (Android)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 3 })),
        highlightedIndex: 3,
        caption: 'Open Settings, then tap "Notifications"',
      },
      {
        title: "Notifications",
        showBack: true,
        items: [
          { icon: "moon", label: "Do Not Disturb", detail: "Off", hasArrow: true, isHighlighted: true },
          { icon: "notifications", label: "App notifications", hasArrow: true },
          { icon: "time", label: "Notification history", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Do Not Disturb"',
      },
      {
        title: "Do Not Disturb",
        showBack: true,
        items: [
          { icon: "moon", label: "Use Do Not Disturb", hasToggle: true, toggleOn: false, isHighlighted: true },
          { icon: "time", label: "Schedules", hasArrow: true },
          { icon: "people", label: "People", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Use Do Not Disturb" to turn it ON',
      },
    ],
  },
  battery: {
    topic: "battery",
    heading: "Battery Saver (Android)",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: PIXEL_MAIN.map((it, i) => ({ ...it, isHighlighted: i === 4 })),
        highlightedIndex: 4,
        caption: 'Open Settings, then tap "Battery"',
      },
      {
        title: "Battery",
        showBack: true,
        items: [
          { icon: "battery-charging", label: "Battery Saver", detail: "Off", hasArrow: true, isHighlighted: true },
          { icon: "battery-full", label: "Battery usage", hasArrow: true },
          { icon: "analytics", label: "Battery health", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Battery Saver"',
      },
      {
        title: "Battery Saver",
        showBack: true,
        items: [
          { icon: "battery-charging", label: "Use Battery Saver", hasToggle: true, toggleOn: false, isHighlighted: true },
          { icon: "time", label: "Set a schedule", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: "Tap the switch to turn Battery Saver ON",
      },
    ],
  },
};

// ─── selector ─────────────────────────────────────────────────────────────────

export function getGuideForDevice(
  topic: SettingTopic,
  uiStyle: UiStyle
): SettingsGuide {
  let base: Omit<SettingsGuide, "uiStyle">;
  if (uiStyle === "ios") {
    base = IOS_GUIDES[topic];
  } else if (uiStyle === "samsung") {
    base = SAMSUNG_GUIDES[topic];
  } else {
    base = PIXEL_GUIDES[topic];
  }
  return { ...base, uiStyle };
}

export function detectTopic(text: string): SettingTopic | null {
  const t = text.toLowerCase();
  if (t.includes("bluetooth")) return "bluetooth";
  if (t.includes("wi-fi") || t.includes("wifi") || t.includes("wi fi")) return "wifi";
  if (t.includes("volume") || t.includes("sound") || t.includes("ring")) return "volume";
  if (t.includes("brightness") || t.includes("bright") || t.includes("display")) return "brightness";
  if (t.includes("silent") || t.includes("do not disturb") || t.includes("dnd") || t.includes("mute")) return "silent";
  if (t.includes("battery") || t.includes("power saver") || t.includes("low power")) return "battery";
  return null;
}
