import * as Device from "expo-device";
import { Platform } from "react-native";

export type UiStyle = "ios" | "samsung" | "pixel" | "android";
export type DeviceBrand = "apple" | "samsung" | "google" | "other-android" | "web";

export interface DeviceInfo {
  model: string;
  manufacturer: string;
  osName: string;
  osVersion: string;
  osMajorVersion: number;
  brand: DeviceBrand;
  uiStyle: UiStyle;
  isDetected: boolean;
}

let _cache: DeviceInfo | null = null;

export function getDeviceInfo(): DeviceInfo {
  if (_cache) return _cache;

  if (Platform.OS === "web") {
    _cache = {
      model: "Web Browser",
      manufacturer: "Browser",
      osName: "Web",
      osVersion: "1.0",
      osMajorVersion: 1,
      brand: "web",
      uiStyle: "android",
      isDetected: false,
    };
    return _cache;
  }

  const model = Device.modelName ?? "Unknown";
  const manufacturer = Device.manufacturer ?? "Unknown";
  const osName = Device.osName ?? (Platform.OS === "ios" ? "iOS" : "Android");
  const osVersion = Device.osVersion ?? "Unknown";
  const osMajorVersion = parseInt(osVersion.split(".")[0], 10) || 0;

  let brand: DeviceBrand;
  let uiStyle: UiStyle;

  if (Platform.OS === "ios") {
    brand = "apple";
    uiStyle = "ios";
  } else {
    const mfg = manufacturer.toLowerCase();
    if (mfg.includes("samsung")) {
      brand = "samsung";
      uiStyle = "samsung";
    } else if (mfg.includes("google") || model.toLowerCase().includes("pixel")) {
      brand = "google";
      uiStyle = "pixel";
    } else {
      brand = "other-android";
      uiStyle = "android";
    }
  }

  _cache = { model, manufacturer, osName, osVersion, osMajorVersion, brand, uiStyle, isDetected: true };
  return _cache;
}

export function describeDevice(info: DeviceInfo): string {
  if (info.brand === "web") return "web browser";
  return `${info.model} running ${info.osName} ${info.osVersion}`;
}

export function toApiPayload(info: DeviceInfo) {
  return {
    model: info.model,
    manufacturer: info.manufacturer,
    osName: info.osName,
    osVersion: info.osVersion,
  };
}
