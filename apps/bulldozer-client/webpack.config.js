module.exports = (config) => {
  config.resolve.fallback = {
    path: false,
    fs: false,
    os: false,
    crypto: false,
    process: false,
    util: false,
    assert: false,
  };

  return config;
};
