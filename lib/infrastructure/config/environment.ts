export default (() => {
  const environment: any = {
    NODE_ENV: process.env.NODE_ENV || 'development',

    server: {
      PORT: process.env.PORT || 3000,
      HTTPS: process.env.HTTPS === 'true',
      KEY: process.env.KEY,
      CERT: process.env.CERT,
    },
  };
  return environment;
})();
