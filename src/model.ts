export interface StagedSafeZone {
  name: string;
  dimensionId: number;
  ignoreZ: boolean;
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  preventMobSpawn: boolean;
}

export interface SafeZone {
  id: number;
  name: string;
  dimensionId: number; // 主世界\下界\末地
  ignoreZ: boolean;
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  preventMobSpawn: boolean;
}

export enum SafeZoneAction {
  Null,
  Add,
  Remove,
}

export interface PlayerState {
  action: SafeZoneAction;
  stagedSafeZone: StagedSafeZone;
}

export class SafeZonesManager {
  safeZones: SafeZone[] = [];
  safeZonesConfig: JsonConfigFile | undefined;

  init(config: JsonConfigFile) {
    this.safeZonesConfig = config;
    const zones = config.get("safeZones");
    if (zones) {
      this.safeZones.push(...(zones as SafeZone[]));
    }
    logger.info(`加载安全区域数量: ${this.safeZones.length}`);
  }

  addSafeZone(zone: SafeZone): boolean {
    if (this.safeZonesConfig) {
      this.safeZones.push(zone);
      return this.safeZonesConfig.set("safeZones", this.safeZones);
    }
    return false;
  }

  updateSafeZones(zones: SafeZone[]): boolean {
    if (this.safeZonesConfig) {
      this.safeZones = zones;
      return this.safeZonesConfig.set("safeZones", zones);
    }
    return false;
  }

  removeSafeZone(id: number): boolean {
    if (this.safeZonesConfig) {
      this.safeZones = this.safeZones.filter((zone) => zone.id !== id);
      // 重新设置id
      this.safeZones.forEach((zone, index) => {
        zone.id = index + 1;
      });
      return this.safeZonesConfig.set("safeZones", this.safeZones);
    }
    return false;
  }
}
