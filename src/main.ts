import { Game } from './core/Game';

async function bootstrap() {
  const game = new Game();
  await game.start();
  console.log(' Space Gate Runner initialized successfully.');
}

bootstrap().catch(console.error);