import { safeZonesManager } from "./global";
import { PlayerState, SafeZone } from "./model";

export function sendFormMainPage(player: Player, playerState: PlayerState) {
  const form = mc.newSimpleForm();
  form.setTitle("S.A.M.");
  form.setContent(`Number of SA: ${safeZonesManager.safeZones.length}`);
  form.addButton("Add Safe Zone");
  form.addButton("SA List");
  player.sendForm(form, (player, buttonId) => {
    if (buttonId == null) {
      return;
    }
    switch (buttonId) {
      case 0:
        sendFormAddSafeZonePage(player, playerState);
        break;
      case 1:
        sendFormListSafeZonePage(player);
        break;
    }
  });
}

export function sendFormAddSafeZonePage(
  player: Player,
  playerState: PlayerState
) {
  const form = mc.newSimpleForm();
  form.setTitle("Add SA");
  form.setContent("Please select point A and point B of the safe area, the area between the two points will be set as the safe area");
  form.addButton("Set point A");
  form.addButton("Set point B");
  form.addButton("Create a safe zone");
  form.addButton("return");
  player.sendForm(form, (player, buttonId) => {
    if (buttonId == null) {
      return;
    }
    switch (buttonId) {
      case 0:
        playerState.stagedSafeZone.startPoint = [
          Math.floor(player.pos.x),
          Math.floor(player.pos.y),
          Math.floor(player.pos.z),
        ];
        player.tell(`Point A is set to: ${playerState.stagedSafeZone.startPoint}`);
        break;
      case 1:
        playerState.stagedSafeZone.endPoint = [
          Math.floor(player.pos.x),
          Math.floor(player.pos.y),
          Math.floor(player.pos.z),
        ];
        player.tell(`Point B is set to: ${playerState.stagedSafeZone.endPoint}`);
        break;
      case 2:
        sendFormSubmitAddSafeZonePage(player, playerState);
        break;
      case 3:
        sendFormMainPage(player, playerState);
        break;
    }
  });
}

function sendFormSubmitAddSafeZonePage(
  player: Player,
  playerState: PlayerState
) {
  const form = mc.newCustomForm();
  form.setTitle("Add safe zone");
  form.addLabel(`world: ${player.pos.dim} Id: ${player.pos.dimid}`);
  form.addLabel(`Point A: ${playerState.stagedSafeZone.startPoint}`);
  form.addLabel(`Point B: ${playerState.stagedSafeZone.endPoint}`);
  form.addInput("safe area name", "safe area name", "unnamed");
  form.addSwitch("Ignore Y axis", true);
  form.addSwitch("Prevent mobs from spawning", true);
  player.sendForm(form, (player, data) => {
    if (data === null) {
      return;
    } else if (typeof data[4] !== "boolean" || typeof data[5] !== "boolean") {
      logger.error("safezone add form invalid data type", player.name, data);
      return;
    }
    playerState.stagedSafeZone.dimensionId = player.pos.dimid;
    playerState.stagedSafeZone.name = data[3] as string;
    playerState.stagedSafeZone.ignoreY = data[4] as boolean;
    playerState.stagedSafeZone.preventMobSpawn = data[5] as boolean;
    // 生成新的坐标, 保证startPoint < endPoint
    const startPoint = [
      Math.min(
        playerState.stagedSafeZone.startPoint[0],
        playerState.stagedSafeZone.endPoint[0]
      ),
      Math.min(
        playerState.stagedSafeZone.startPoint[1],
        playerState.stagedSafeZone.endPoint[1]
      ),
      Math.min(
        playerState.stagedSafeZone.startPoint[2],
        playerState.stagedSafeZone.endPoint[2]
      ),
    ];
    const endPoint = [
      Math.max(
        playerState.stagedSafeZone.startPoint[0],
        playerState.stagedSafeZone.endPoint[0]
      ),
      Math.max(
        playerState.stagedSafeZone.startPoint[1],
        playerState.stagedSafeZone.endPoint[1]
      ),
      Math.max(
        playerState.stagedSafeZone.startPoint[2],
        playerState.stagedSafeZone.endPoint[2]
      ),
    ];
    if (
      safeZonesManager.addSafeZone({
        id: safeZonesManager.safeZones.length + 1,
        name: playerState.stagedSafeZone.name,
        dimensionId: playerState.stagedSafeZone.dimensionId,
        startPoint,
        endPoint,
        ignoreY: playerState.stagedSafeZone.ignoreY,
        preventMobSpawn: playerState.stagedSafeZone.preventMobSpawn,
      } as SafeZone)
    ) {
      player.tell(
        `safe area ${playerState.stagedSafeZone.name}: ${startPoint} -> ${endPoint} Ignore Y axis: ${playerState.stagedSafeZone.ignoreY} Prevent mobs from spawning: ${playerState.stagedSafeZone.preventMobSpawn} Added successfully`
      );
      player.tell("Security area added successfully");
    } else {
      player.tell("Security zone addition failed");
    }
  });
}

function sendFormListSafeZonePage(player: Player) {
  const form = mc.newSimpleForm();
  form.setTitle("Safe zone list");
  form.setContent(`Current number of safe areas: ${safeZonesManager.safeZones.length}`);
  safeZonesManager.safeZones.forEach((zone) => {
    form.addButton(
      `${zone.name}[dimId: ${zone.dimensionId}]\n${zone.startPoint} -> ${zone.endPoint}`
    );
  });
  player.sendForm(form, (player, buttonId) => {
    if (buttonId == null) {
      return;
    }
    sendFormSafeZoneDetailPage(player, safeZonesManager.safeZones[buttonId]);
  });
}

function sendFormSafeZoneDetailPage(player: Player, zone: SafeZone) {
  const form = mc.newSimpleForm();
  form.setTitle("Security area details");
  form.setContent(
    `${zone.name}[dimId: ${zone.dimensionId}] ${zone.startPoint} -> ${zone.endPoint}\nIgnore Y axis: ${zone.ignoreY} Prevent mobs from spawning: ${zone.preventMobSpawn}`
  );
  form.addButton("delete");
  form.addButton("return");
  player.sendForm(form, (player, buttonId) => {
    if (buttonId == null) {
      return;
    }
    switch (buttonId) {
      case 0:
        if (safeZonesManager.removeSafeZone(zone.id)) {
          player.tell(`safe area ${zone.name} successfully deleted`);
        } else {
          player.tell(`safe area ${zone.name} failed to delete`);
        }
        break;
      case 1:
        sendFormListSafeZonePage(player);
        break;
    }
  });
}
