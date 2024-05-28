"use strict";
// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\haojie\dev\lse/dts/HelperLib-master/src/index.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSafeZones = void 0;
const form_1 = require("./form");
const global_1 = require("./global");
const model_1 = require("./model");
ll.registerPlugin("SafeZone", "Create SafeZone", [1, 0, 0], {});
const pluginConfig = new JsonConfigFile("./plugins/SafeZone/data/config.json", JSON.stringify({}));
// 从JSON中加载安全区域列表
const safeZonesConfig = new JsonConfigFile("./plugins/SafeZone/data/safeZones.json", JSON.stringify({
    safeZones: [],
}));
global_1.safeZonesManager.init(safeZonesConfig);
const updateSafeZones = (zones) => {
    return safeZonesConfig.set("safeZones", zones);
};
exports.updateSafeZones = updateSafeZones;
logger.info(`Loaded ${global_1.safeZonesManager.safeZones.length} safe zones`);
mc.listen("onMobTrySpawn", (entity, pos) => {
    for (const safeZone of global_1.safeZonesManager.safeZones) {
        if (pos.dimid !== safeZone.dimensionId) {
            continue;
        }
        if (pos.x >= safeZone.startPoint[0] &&
            pos.x <= safeZone.endPoint[0] &&
            pos.z >= safeZone.startPoint[2] &&
            pos.z <= safeZone.endPoint[2] &&
            (safeZone.ignoreY ||
                (pos.y >= safeZone.startPoint[1] && pos.y <= safeZone.endPoint[1]))) {
            // mod生成在安全区域内
            if (safeZone.preventMobSpawn) {
                return false;
            }
        }
    }
    return true;
});
const safeZoneCommand = mc.newCommand("safezone", "创建安全区域", PermType.GameMasters, 0x80, "安全区");
const playerStateMap = new Map();
safeZoneCommand.overload([]);
safeZoneCommand.setCallback((cmd, origin, output, result) => {
    var _a, _b, _c;
    if (!origin.player) {
        output.error("Player only");
        return;
    }
    if (origin.player && !playerStateMap.has((_a = origin.player) === null || _a === void 0 ? void 0 : _a.xuid)) {
        playerStateMap.set((_b = origin.player) === null || _b === void 0 ? void 0 : _b.xuid, {
            action: model_1.SafeZoneAction.Null,
            stagedSafeZone: {
                name: "",
                dimensionId: 0,
                ignoreY: true,
                startPoint: [0, 0, 0],
                endPoint: [0, 0, 0],
                preventMobSpawn: true,
            },
        });
    }
    const playerState = playerStateMap.get((_c = origin.player) === null || _c === void 0 ? void 0 : _c.xuid);
    (0, form_1.sendFormMainPage)(origin.player, playerState);
});
const setupResult = safeZoneCommand.setup();
if (!setupResult) {
    logger.error("Failed to setup safe zone command");
}
