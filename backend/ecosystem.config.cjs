module.exports = {
  apps: [
    {
      name: "5m-backend",
      script: "index.js",
      // use __dirname so cwd points to this backend folder regardless of where pm2 is invoked
      cwd: __dirname,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
