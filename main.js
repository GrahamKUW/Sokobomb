const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueManifest(GameManifest.data);

ASSET_MANAGER.downloadAll(() => {
	
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	
	gameEngine.init(ctx);

	const audioController = new AudioController(ASSET_MANAGER);

	canvas.addEventListener("click", () => {
		audioController.start();
	});

	canvas.addEventListener("mousedown", () => {
		audioController.start();
	});

	canvas.addEventListener("mouseup", () =>  {
		audioController.start();
	});

	canvas.addEventListener("keydown", () =>{
		audioController.start();
	});

	const gameLevel9 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_9), audioController, null, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_9_MAX_MOVES, 175, 120, LEVEL_9_SCALE, LEVEL_9_SCALE, {x: 1, y: 3},"Level 9");
	const gameLevel8 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_8), audioController, gameLevel9, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_8_MAX_MOVES, 175, 120, LEVEL_8_SCALE, LEVEL_8_SCALE, {x: 1, y: 3},"Level 8");
	const gameLevel7 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_7), audioController, gameLevel8, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_7_MAX_MOVES, 175, 120, LEVEL_7_SCALE, LEVEL_7_SCALE, {x: 1, y: 3},"Level 7");
	const gameLevel6 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_6), audioController, gameLevel7, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_6_MAX_MOVES, 175, 120, LEVEL_6_SCALE, LEVEL_6_SCALE, {x: 1, y: 3},"Level 6");
	const gameLevel5 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_5), audioController, gameLevel6, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_5_MAX_MOVES, 175, 120, LEVEL_5_SCALE, LEVEL_5_SCALE, {x: 1, y: 3},"Level 5");
	const gameLevel4 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_4), audioController, gameLevel5, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_4_MAX_MOVES, 175, 120, LEVEL_4_SCALE, LEVEL_4_SCALE, {x: 1, y: 3},"Level 4");
	const gameLevel3 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_3), audioController, gameLevel4, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_3_MAX_MOVES, 175, 120, LEVEL_3_SCALE, LEVEL_3_SCALE, {x: 1, y: 3},"Level 3");
	const gameLevel2 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL_2), audioController, gameLevel3, ASSET_MANAGER.getAsset(GameManifest.data[0]), LEVEL_2_MAX_MOVES, 175, 120, LEVEL_2_SCALE, LEVEL_2_SCALE, {x: 1, y: 4},"Level 2");
	const gameLevel1 = new GameLevel(gameEngine, structuredClone(GAME_LEVEL), audioController, gameLevel2, ASSET_MANAGER.getAsset(GameManifest.data[0]),LEVEL_1_MAX_MOVES, 175, 40, LEVEL_1_SCALE, LEVEL_1_SCALE, {x: 1, y: 4},"Level 1");

	//gameEngine.addEntity(gameLevel1);
	gameEngine.addEntity(gameLevel1);


	gameEngine.start();
});

