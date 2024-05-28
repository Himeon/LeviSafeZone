// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\haojie\dev\lse/dts/HelperLib-master/src/index.d.ts"/>

import { sendFormMainPage } from "./form";
import { safeZonesManager } from "./global";
import { PlayerState, SafeZone, SafeZoneAction } from "./model";

ll.registerPlugin("SafeZone", "Create SafeZone", [1, 0, 0], {});

const pluginConfig = new JsonConfigFile(
  "./plugins/SafeZone/data/config.json",
  JSON.stringify({})
);
// 从JSON中加载安全区域列表
const safeZonesConfig = new JsonConfigFile(
  "./plugins/SafeZone/data/safeZones.json",
  JSON.stringify({
    safeZones: [],
  })
);
safeZonesManager.init(safeZonesConfig);
export const updateSafeZones = (zones: SafeZone[]): boolean => {
  return safeZonesConfig.set("safeZones", zones);
};
logger.info(`Loaded ${safeZonesManager.safeZones.length} safe zones`);
mc.listen("onMobTrySpawn", (entity: string, pos: FloatPos) => {
  for (const safeZone of safeZonesManager.safeZones) {
    if (pos.dimid !== safeZone.dimensionId) {
      continue;
    }
    if (
      pos.x >= safeZone.startPoint[0] &&
      pos.x <= safeZone.endPoint[0] &&
      pos.z >= safeZone.startPoint[2] &&
      pos.z <= safeZone.endPoint[2] &&
      (safeZone.ignoreY ||
        (pos.y >= safeZone.startPoint[1] && pos.y <= safeZone.endPoint[1]))
    ) {
      // mod生成在安全区域内
      if (safeZone.preventMobSpawn) {
        return false;
      }
    }
  }
  return true;
});

const safeZoneCommand = mc.newCommand(
  "safezone",
  "创建安全区域",
  PermType.GameMasters,
  0x80,
  "安全区"
);

const playerStateMap = new Map<string, PlayerState>();

safeZoneCommand.overload([]);
safeZoneCommand.setCallback(
  (cmd: Command, origin: CommandOrigin, output: CommandOutput, result: any) => {
    if (!origin.player) {
      output.error("Player only");
      return;
    }

    if (origin.player && !playerStateMap.has(origin.player?.xuid)) {
      playerStateMap.set(origin.player?.xuid, {
        action: SafeZoneAction.Null,
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
    const playerState = playerStateMap.get(origin.player?.xuid) as PlayerState;
    sendFormMainPage(origin.player, playerState);
  }
);
const setupResult = safeZoneCommand.setup();
if (!setupResult) {
  logger.error("Failed to setup safe zone command");
}
