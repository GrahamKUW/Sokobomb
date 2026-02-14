const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();



ASSET_MANAGER.queueManifest(GameManifest.data);

ASSET_MANAGER.downloadAll(() => {
	
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	
	gameEngine.init(ctx);

	const gameLevel3 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_3), null, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_3_MAX_MOVES, 175, 120, LEVEL_3_SCALE, LEVEL_3_SCALE, {x: 1, y: 3},"Level 3");
	const gameLevel2 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_2), gameLevel3, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_2_MAX_MOVES, 175, 120, LEVEL_2_SCALE, LEVEL_2_SCALE, {x: 1, y: 4},"Level 2");
	const gameLevel1 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL), gameLevel2, ASSET_MANAGER.getAsset(GameManifest.data[0]),LEVEL_1_MAX_MOVES, 175, 40, LEVEL_1_SCALE, LEVEL_1_SCALE, {x: 1, y: 4},"Level 1");

	gameEngine.addEntity(gameLevel1);

	gameEngine.start();
});

