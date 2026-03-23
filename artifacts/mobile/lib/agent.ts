import * as Brightness from "expo-brightness";
import { Alert, Linking, Platform } from "react-native";

export type AgentAction =
  | "SET_BRIGHTNESS_LOW"
  | "SET_BRIGHTNESS_MEDIUM"
  | "SET_BRIGHTNESS_HIGH"
  | "OPEN_BLUETOOTH"
  | "OPEN_WIFI"
  | "OPEN_SOUND"
  | "OPEN_DISPLAY"
  | "OPEN_DND"
  | "OPEN_BATTERY";

interface ActionConfig {
  label: string;
  icon: string;
  androidUrl?: string;
  iosUrl?: string;
  directAction?: () => Promise<void>;
}

const ACTIONS: Record<AgentAction, ActionConfig> = {
  SET_BRIGHTNESS_LOW: {
    label: "Set Brightness to Low",
    icon: "sunny-outline",
    directAction: async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted") {
        await Brightness.setSystemBrightnessAsync(0.2);
      } else {
        await Brightness.setBrightnessAsync(0.2);
      }
    },
  },
  SET_BRIGHTNESS_MEDIUM: {
    label: "Set Brightness to Medium",
    icon: "sunny-outline",
    directAction: async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted") {
        await Brightness.setSystemBrightnessAsync(0.5);
      } else {
        await Brightness.setBrightnessAsync(0.5);
      }
    },
  },
  SET_BRIGHTNESS_HIGH: {
    label: "Set Brightness to High",
    icon: "sunny",
    directAction: async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted") {
        await Brightness.setSystemBrightnessAsync(1.0);
      } else {
        await Brightness.setBrightnessAsync(1.0);
      }
    },
  },
  OPEN_BLUETOOTH: {
    label: "Open Bluetooth Settings",
    icon: "bluetooth",
    androidUrl: "android.settings.BLUETOOTH_SETTINGS",
    iosUrl: "App-Prefs:root=Bluetooth",
  },
  OPEN_WIFI: {
    label: "Open Wi-Fi Settings",
    icon: "wifi",
    androidUrl: "android.settings.WIFI_SETTINGS",
    iosUrl: "App-Prefs:root=WIFI",
  },
  OPEN_SOUND: {
    label: "Open Sound Settings",
    icon: "volume-high",
    androidUrl: "android.settings.SOUND_SETTINGS",
    iosUrl: "App-Prefs:root=Sounds",
  },
  OPEN_DISPLAY: {
    label: "Open Display Settings",
    icon: "contrast",
    androidUrl: "android.settings.DISPLAY_SETTINGS",
    iosUrl: "App-Prefs:root=DISPLAY&BRIGHTNESS",
  },
  OPEN_DND: {
    label: "Open Do Not Disturb",
    icon: "moon",
    androidUrl: "android.settings.ZEN_MODE_SETTINGS",
    iosUrl: "App-Prefs:root=DO_NOT_DISTURB",
  },
  OPEN_BATTERY: {
    label: "Open Battery Settings",
    icon: "battery-half",
    androidUrl: "android.settings.BATTERY_SAVER_SETTINGS",
    iosUrl: "App-Prefs:root=BATTERY_USAGE",
  },
};

export function getActionLabel(action: AgentAction): string {
  return ACTIONS[action].label;
}

export function getActionIcon(action: AgentAction): string {
  return ACTIONS[action].icon;
}

export async function executeAction(action: AgentAction): Promise<boolean> {
  const config = ACTIONS[action];
  try {
    if (config.directAction) {
      await config.directAction();
      return true;
    }
    const url =
      Platform.OS === "ios" ? config.iosUrl : config.androidUrl;
    if (!url) return false;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    Alert.alert(
      "Cannot Open Settings",
      "Please open your phone's Settings app manually.",
      [{ text: "OK" }]
    );
    return false;
  } catch {
    return false;
  }
}

export function detectActions(topic: string): AgentAction[] {
  const t = topic.toLowerCase();
  if (t.includes("bluetooth")) return ["OPEN_BLUETOOTH"];
  if (t.includes("wi-fi") || t.includes("wifi") || t.includes("wi fi")) return ["OPEN_WIFI"];
  if (t.includes("volume") || t.includes("sound") || t.includes("ring")) return ["OPEN_SOUND"];
  if (t.includes("brightness") || t.includes("bright") || t.includes("screen") || t.includes("display")) {
    return ["SET_BRIGHTNESS_LOW", "SET_BRIGHTNESS_MEDIUM", "SET_BRIGHTNESS_HIGH", "OPEN_DISPLAY"];
  }
  if (t.includes("silent") || t.includes("do not disturb") || t.includes("dnd") || t.includes("mute")) return ["OPEN_DND"];
  if (t.includes("battery") || t.includes("power saver") || t.includes("low power")) return ["OPEN_BATTERY"];
  return [];
}
