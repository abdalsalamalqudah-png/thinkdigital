module.exports = {
  apps: [
    {
      name: 'eduplatform',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        JWT_SECRET: 'eduplatform-secret-key-2024',
        ENVIRONMENT: 'development'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}