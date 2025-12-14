module.exports = {
  apps: [
    {
      name: "5m-backend",
      script: "index.js",
      cwd: "./backend",
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
