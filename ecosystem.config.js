module.exports = {
  apps: [
    {
      name: 'CN - NestJs',
      script: 'dist/main.js',
      watch: true,
      watch_delay: 1000, // Optional: delay before restarting
      ignore_watch: ['node_modules', 'dist'], // Optional: directories to ignore
    },
  ],
};
