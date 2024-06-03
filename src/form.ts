import { safeZonesManager } from "./global";
import { PlayerState, SafeZone } from "./model";

export function sendFormMainPage(player: Player, playerState: PlayerState) {
  const form = mc.newSimpleForm();
  form.setTitle("安全区域管理");
  form.setContent(`当前安全区域数量: ${safeZonesManager.safeZones.length}`);
  form.addButton("添加安全区域");
  form.addButton("列出安全区域");
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
  form.setTitle("添加安全区域");
  form.setContent("请选择安全区域的A点和B点, 两点之间的区域将被设置为安全区域");
  form.addButton("设置A点");
  form.addButton("设置B点");
  form.addButton("创建安全区");
  form.addButton("返回");
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
        player.tell(`A点设置为: ${playerState.stagedSafeZone.startPoint}`);
        break;
      case 1:
        playerState.stagedSafeZone.endPoint = [
          Math.floor(player.pos.x),
          Math.floor(player.pos.y),
          Math.floor(player.pos.z),
        ];
        player.tell(`B点设置为: ${playerState.stagedSafeZone.endPoint}`);
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
  form.setTitle("添加安全区域");
  form.addLabel(`世界: ${player.pos.dim} Id: ${player.pos.dimid}`);
  form.addLabel(`A点: ${playerState.stagedSafeZone.startPoint}`);
  form.addLabel(`B点: ${playerState.stagedSafeZone.endPoint}`);
  form.addInput("安全区域名", "安全区域名", "未命名");
  form.addSwitch("忽略Y轴", true);
  form.addSwitch("阻止生物生成", true);
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
        `安全区域 ${playerState.stagedSafeZone.name}: ${startPoint} -> ${endPoint} 忽略Y轴: ${playerState.stagedSafeZone.ignoreY} 阻止生物生成: ${playerState.stagedSafeZone.preventMobSpawn} 添加成功`
      );
      player.tell("安全区域添加成功");
    } else {
      player.tell("安全区域添加失败");
    }
  });
}

function sendFormListSafeZonePage(player: Player) {
  const form = mc.newSimpleForm();
  form.setTitle("安全区域列表");
  form.setContent(`当前安全区域数量: ${safeZonesManager.safeZones.length}`);
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
  form.setTitle("安全区域详情");
  form.setContent(
    `${zone.name}[dimId: ${zone.dimensionId}] ${zone.startPoint} -> ${zone.endPoint}\n忽略Y轴: ${zone.ignoreY} 阻止生物生成: ${zone.preventMobSpawn}`
  );
  form.addButton("删除");
  form.addButton("返回");
  player.sendForm(form, (player, buttonId) => {
    if (buttonId == null) {
      return;
    }
    switch (buttonId) {
      case 0:
        if (safeZonesManager.removeSafeZone(zone.id)) {
          player.tell(`安全区域 ${zone.name} 删除成功`);
        } else {
          player.tell(`安全区域 ${zone.name} 删除失败`);
        }
        break;
      case 1:
        sendFormListSafeZonePage(player);
        break;
    }
  });
}
