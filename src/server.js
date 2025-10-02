// src/server.js
const app = require('./app');
const sequelize = require('./config/db');
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    // IMPORTANT: Be careful with sync in production. For initial dev uncomment:
    // await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error('Startup error', err);
    process.exit(1);
  }
})();
