var SafeZone = (function (exports) {
    'use strict';

    var dist = {};

    var form = {};

    var global = {};

    var model = {};

    Object.defineProperty(model, "__esModule", { value: true });
    model.SafeZonesManager = model.SafeZoneAction = void 0;
    var SafeZoneAction;
    (function (SafeZoneAction) {
        SafeZoneAction[SafeZoneAction["Null"] = 0] = "Null";
        SafeZoneAction[SafeZoneAction["Add"] = 1] = "Add";
        SafeZoneAction[SafeZoneAction["Remove"] = 2] = "Remove";
    })(SafeZoneAction || (model.SafeZoneAction = SafeZoneAction = {}));
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
            logger.info(`加载安全区域数量: ${this.safeZones.length}`);
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
    model.SafeZonesManager = SafeZonesManager;

    Object.defineProperty(global, "__esModule", { value: true });
    global.safeZonesManager = void 0;
    const model_1$1 = model;
    global.safeZonesManager = new model_1$1.SafeZonesManager();

    Object.defineProperty(form, "__esModule", { value: true });
    form.sendFormAddSafeZonePage = form.sendFormMainPage = void 0;
    const global_1$1 = global;
    function sendFormMainPage(player, playerState) {
        const form = mc.newSimpleForm();
        form.setTitle("安全区域管理");
        form.setContent(`当前安全区域数量: ${global_1$1.safeZonesManager.safeZones.length}`);
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
    form.sendFormMainPage = sendFormMainPage;
    function sendFormAddSafeZonePage(player, playerState) {
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
    form.sendFormAddSafeZonePage = sendFormAddSafeZonePage;
    function sendFormSubmitAddSafeZonePage(player, playerState) {
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
            }
            else if (typeof data[4] !== "boolean" || typeof data[5] !== "boolean") {
                logger.error("safezone add form invalid data type", player.name, data);
                return;
            }
            playerState.stagedSafeZone.dimensionId = player.pos.dimid;
            playerState.stagedSafeZone.name = data[3];
            playerState.stagedSafeZone.ignoreY = data[4];
            playerState.stagedSafeZone.preventMobSpawn = data[5];
            // 生成新的坐标, 保证startPoint < endPoint
            const startPoint = [
                Math.min(playerState.stagedSafeZone.startPoint[0], playerState.stagedSafeZone.endPoint[0]),
                Math.min(playerState.stagedSafeZone.startPoint[1], playerState.stagedSafeZone.endPoint[1]),
                Math.min(playerState.stagedSafeZone.startPoint[2], playerState.stagedSafeZone.endPoint[2]),
            ];
            const endPoint = [
                Math.max(playerState.stagedSafeZone.startPoint[0], playerState.stagedSafeZone.endPoint[0]),
                Math.max(playerState.stagedSafeZone.startPoint[1], playerState.stagedSafeZone.endPoint[1]),
                Math.max(playerState.stagedSafeZone.startPoint[2], playerState.stagedSafeZone.endPoint[2]),
            ];
            if (global_1$1.safeZonesManager.addSafeZone({
                id: global_1$1.safeZonesManager.safeZones.length + 1,
                name: playerState.stagedSafeZone.name,
                dimensionId: playerState.stagedSafeZone.dimensionId,
                startPoint,
                endPoint,
                ignoreY: playerState.stagedSafeZone.ignoreY,
                preventMobSpawn: playerState.stagedSafeZone.preventMobSpawn,
            })) {
                player.tell(`安全区域 ${playerState.stagedSafeZone.name}: ${startPoint} -> ${endPoint} 忽略Y轴: ${playerState.stagedSafeZone.ignoreY} 阻止生物生成: ${playerState.stagedSafeZone.preventMobSpawn} 添加成功`);
                player.tell("安全区域添加成功");
            }
            else {
                player.tell("安全区域添加失败");
            }
        });
    }
    function sendFormListSafeZonePage(player) {
        const form = mc.newSimpleForm();
        form.setTitle("安全区域列表");
        form.setContent(`当前安全区域数量: ${global_1$1.safeZonesManager.safeZones.length}`);
        global_1$1.safeZonesManager.safeZones.forEach((zone) => {
            form.addButton(`${zone.name}[dimId: ${zone.dimensionId}]\n${zone.startPoint} -> ${zone.endPoint}`);
        });
        player.sendForm(form, (player, buttonId) => {
            if (buttonId == null) {
                return;
            }
            sendFormSafeZoneDetailPage(player, global_1$1.safeZonesManager.safeZones[buttonId]);
        });
    }
    function sendFormSafeZoneDetailPage(player, zone) {
        const form = mc.newSimpleForm();
        form.setTitle("安全区域详情");
        form.setContent(`${zone.name}[dimId: ${zone.dimensionId}] ${zone.startPoint} -> ${zone.endPoint}\n忽略Y轴: ${zone.ignoreY} 阻止生物生成: ${zone.preventMobSpawn}`);
        form.addButton("删除");
        form.addButton("返回");
        player.sendForm(form, (player, buttonId) => {
            if (buttonId == null) {
                return;
            }
            switch (buttonId) {
                case 0:
                    if (global_1$1.safeZonesManager.removeSafeZone(zone.id)) {
                        player.tell(`安全区域 ${zone.name} 删除成功`);
                    }
                    else {
                        player.tell(`安全区域 ${zone.name} 删除失败`);
                    }
                    break;
                case 1:
                    sendFormListSafeZonePage(player);
                    break;
            }
        });
    }

    // LiteLoader-AIDS automatic generated
    /// <reference path="c:\Users\haojie\dev\lse/dts/HelperLib-master/src/index.d.ts"/>
    Object.defineProperty(dist, "__esModule", { value: true });
    exports.updateSafeZones = dist.updateSafeZones = void 0;
    const form_1 = form;
    const global_1 = global;
    const model_1 = model;
    ll.registerPlugin("SafeZone", "Create SafeZone", [1, 0, 0], {});
    new JsonConfigFile("./plugins/SafeZone/data/config.json", JSON.stringify({}));
    // 从JSON中加载安全区域列表
    const safeZonesConfig = new JsonConfigFile("./plugins/SafeZone/data/safeZones.json", JSON.stringify({
        safeZones: [],
    }));
    global_1.safeZonesManager.init(safeZonesConfig);
    const updateSafeZones = (zones) => {
        return safeZonesConfig.set("safeZones", zones);
    };
    exports.updateSafeZones = dist.updateSafeZones = updateSafeZones;
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

    exports.default = dist;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
