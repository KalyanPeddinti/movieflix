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
  isToggleTarget?: boolean;
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
  steps: StepScreen[];
}

const MAIN_LIST_ITEMS: MockupItem[] = [
  { icon: "airplane", label: "Aeroplane Mode", hasToggle: true, toggleOn: false },
  { icon: "wifi", label: "Wi-Fi", detail: "Home Network", hasArrow: true },
  { icon: "bluetooth", label: "Bluetooth", detail: "On", hasArrow: true },
  { icon: "notifications", label: "Notifications", hasArrow: true },
  { icon: "volume-high", label: "Sounds & Haptics", hasArrow: true },
  { icon: "moon", label: "Focus", hasArrow: true },
  { icon: "contrast", label: "Display & Brightness", hasArrow: true },
  { icon: "battery-half", label: "Battery", hasArrow: true },
];

export const SETTINGS_GUIDES: Record<SettingTopic, SettingsGuide> = {
  bluetooth: {
    topic: "bluetooth",
    heading: "Connect Bluetooth",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: MAIN_LIST_ITEMS.map((it, i) => ({ ...it, isHighlighted: i === 2 })),
        highlightedIndex: 2,
        caption: 'Tap "Bluetooth" in the Settings list',
      },
      {
        title: "Bluetooth",
        showBack: true,
        items: [
          { icon: "bluetooth", label: "Bluetooth", hasToggle: true, toggleOn: true, isToggleTarget: true, isHighlighted: true },
          { icon: "headset", label: "My Headphones", detail: "Connected", hasArrow: true },
          { icon: "tablet-portrait", label: "John's iPad", detail: "Not Connected", hasArrow: true },
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
          { icon: "tablet-portrait", label: "John's iPad", detail: "Not Connected", hasArrow: true },
        ],
        highlightedIndex: 1,
        caption: 'Tap the name of your device (headphones or speaker) to connect',
      },
    ],
  },

  wifi: {
    topic: "wifi",
    heading: "Connect to Wi-Fi",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: MAIN_LIST_ITEMS.map((it, i) => ({ ...it, isHighlighted: i === 1 })),
        highlightedIndex: 1,
        caption: 'Tap "Wi-Fi" in the Settings list',
      },
      {
        title: "Wi-Fi",
        showBack: true,
        items: [
          { icon: "wifi", label: "Wi-Fi", hasToggle: true, toggleOn: true, isToggleTarget: true, isHighlighted: true },
          { icon: "wifi", label: "HomeNetwork_5G", detail: "Secured", hasArrow: true },
          { icon: "wifi", label: "HomeNetwork_2G", detail: "Secured", hasArrow: true },
          { icon: "wifi", label: "Neighbor_WiFi", detail: "Secured", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: "Make sure Wi-Fi is switched ON (green)",
      },
      {
        title: "Wi-Fi",
        showBack: true,
        items: [
          { icon: "wifi", label: "Wi-Fi", hasToggle: true, toggleOn: true },
          { icon: "wifi", label: "HomeNetwork_5G", detail: "Secured", hasArrow: true, isHighlighted: true },
          { icon: "wifi", label: "HomeNetwork_2G", detail: "Secured", hasArrow: true },
          { icon: "wifi", label: "Neighbor_WiFi", detail: "Secured", hasArrow: true },
        ],
        highlightedIndex: 1,
        caption: "Tap your home network name to connect",
      },
    ],
  },

  volume: {
    topic: "volume",
    heading: "Adjust Volume",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: MAIN_LIST_ITEMS.map((it, i) => ({ ...it, isHighlighted: i === 4 })),
        highlightedIndex: 4,
        caption: 'Tap "Sounds & Haptics" in Settings',
      },
      {
        title: "Sounds & Haptics",
        showBack: true,
        items: [
          { icon: "volume-high", label: "Ringer and Alerts", detail: "Drag the slider below", hasArrow: false },
        ],
        highlightedIndex: 0,
        hasSlider: true,
        sliderValue: 0.7,
        sliderHighlighted: true,
        caption: "Drag the slider right to increase, left to lower the volume",
      },
    ],
  },

  brightness: {
    topic: "brightness",
    heading: "Adjust Brightness",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: MAIN_LIST_ITEMS.map((it, i) => ({ ...it, isHighlighted: i === 6 })),
        highlightedIndex: 6,
        caption: 'Tap "Display & Brightness" in Settings',
      },
      {
        title: "Display & Brightness",
        showBack: true,
        items: [
          { icon: "sunny", label: "Brightness", detail: "Drag the slider below", hasArrow: false },
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
    heading: "Enable Silent / Do Not Disturb",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: MAIN_LIST_ITEMS.map((it, i) => ({ ...it, isHighlighted: i === 5 })),
        highlightedIndex: 5,
        caption: 'Tap "Focus" (or "Do Not Disturb") in Settings',
      },
      {
        title: "Focus",
        showBack: true,
        items: [
          { icon: "moon", label: "Do Not Disturb", detail: "Off", hasArrow: true, isHighlighted: true },
          { icon: "person", label: "Personal", detail: "Off", hasArrow: true },
          { icon: "briefcase", label: "Work", detail: "Off", hasArrow: true },
          { icon: "bed", label: "Sleep", detail: "Off", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Do Not Disturb"',
      },
      {
        title: "Do Not Disturb",
        showBack: true,
        items: [
          { icon: "moon", label: "Do Not Disturb", hasToggle: true, toggleOn: false, isToggleTarget: true, isHighlighted: true },
          { icon: "time", label: "Turn On Automatically", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: "Tap the switch to turn Do Not Disturb ON",
      },
    ],
  },

  battery: {
    topic: "battery",
    heading: "Enable Battery Saver",
    steps: [
      {
        title: "Settings",
        showSearch: true,
        items: MAIN_LIST_ITEMS.map((it, i) => ({ ...it, isHighlighted: i === 7 })),
        highlightedIndex: 7,
        caption: 'Tap "Battery" in Settings',
      },
      {
        title: "Battery",
        showBack: true,
        items: [
          { icon: "battery-charging", label: "Low Power Mode", hasToggle: true, toggleOn: false, isToggleTarget: true, isHighlighted: true },
          { icon: "battery-full", label: "Battery Health", detail: "100%", hasArrow: true },
          { icon: "analytics", label: "Battery Usage", hasArrow: true },
        ],
        highlightedIndex: 0,
        caption: 'Tap "Low Power Mode" to turn it ON (switch turns green)',
      },
    ],
  },
};

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
