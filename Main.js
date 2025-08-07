const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;
const express = require('express');
const app = express();
const port = 3000;

function startBot() {
  const bot = mineflayer.createBot({
    host: 'classcraftx.falixsrv.me',
    port: 38352,
    username: 'AFK_Bot',
    version: false,
  });

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    roamLikeHuman();
  });

  function roamLikeHuman() {
    // Pick random nearby point to walk to
    const x = bot.entity.position.x + (Math.random() * 20 - 10);
    const y = bot.entity.position.y;
    const z = bot.entity.position.z + (Math.random() * 20 - 10);
    const goal = new GoalNear(x, y, z, 1);

    bot.pathfinder.setGoal(goal);

    // While walking, do random actions like looking, jumping, sneaking
    let actionInterval = setInterval(() => {
      if (!bot.entity) return;

      // Look around randomly
      const yaw = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI / 3;
      bot.look(yaw, pitch, true);

      // Jump randomly
      if (Math.random() < 0.1) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 400);
      }

      // Sneak randomly
      if (Math.random() < 0.05) {
        bot.setControlState('sneak', true);
        setTimeout(() => bot.setControlState('sneak', false), 2000);
      }
    }, 2000);

    // After 10-15 seconds, pick a new goal
    setTimeout(() => {
      clearInterval(actionInterval);
      roamLikeHuman();
    }, 10000 + Math.random() * 5000);
  }

  bot.on('login', () => {
    console.log('✅ Bot logged in and roaming like a human!');
    bot.chat('Hey! I am roaming like a real player.');
  });

  bot.on('end', () => {
    console.log('⚠️ Bot disconnected, reconnecting...');
    setTimeout(startBot, 5000);
  });

  bot.on('error', err => {
    console.log('❌ Bot error:', err);
  });
}

startBot();

app.get('/', (req, res) => {
  res.send('Bot is alive and moving like a real player!');
});

app.listen(port, () => {
  console.log(`🌐 Server running on port ${port}`);
});
