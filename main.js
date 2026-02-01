const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

const GLOBAL_SCALE = 6;

ASSET_MANAGER.queueManifest(GameManifest.data);

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	
	gameEngine.init(ctx);
	const player = new Player(ASSET_MANAGER.getAsset(GameManifest.data[1]), GLOBAL_SCALE, GLOBAL_SCALE);
	const gameLevel = new GameLevel(gameEngine, GAME_LEVEL, ASSET_MANAGER.getAsset(GameManifest.data[0]),player,MAX_MOVES, 175, 40, GLOBAL_SCALE, GLOBAL_SCALE);

	gameEngine.addEntity(gameLevel);

	gameEngine.start();
});
