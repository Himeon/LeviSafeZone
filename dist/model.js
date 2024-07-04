"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeZonesManager = exports.SafeZoneAction = void 0;
var SafeZoneAction;
(function (SafeZoneAction) {
    SafeZoneAction[SafeZoneAction["Null"] = 0] = "Null";
    SafeZoneAction[SafeZoneAction["Add"] = 1] = "Add";
    SafeZoneAction[SafeZoneAction["Remove"] = 2] = "Remove";
})(SafeZoneAction || (exports.SafeZoneAction = SafeZoneAction = {}));
class SafeZonesManager {
    constructor() {
        this.safeZones = [];
    }
    init(config) {
        this.safeZonesConfig = config;
        const zones = config.get("safeZones");
        if (zones) {
            // 兼容ignoreZ, 迁移
            zones.forEach((zone) => {
                if (zone.ignoreZ !== undefined) {
                    zone.ignoreY = zone.ignoreZ;
                    delete zone.ignoreZ;
                }
            });
            this.safeZones.push(...zones);
            this.safeZonesConfig.set("safeZones", this.safeZones);
        }
        logger.info(`Load the number of safe areas: ${this.safeZones.length}`);
    }
    addSafeZone(zone) {
        if (this.safeZonesConfig) {
            this.safeZones.push(zone);
            return this.safeZonesConfig.set("safeZones", this.safeZones);
        }
        return false;
    }
    updateSafeZones(zones) {
        if (this.safeZonesConfig) {
            this.safeZones = zones;
            return this.safeZonesConfig.set("safeZones", zones);
        }
        return false;
    }
    removeSafeZone(id) {
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
exports.SafeZonesManager = SafeZonesManager;
