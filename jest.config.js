module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  snapshotSerializers: [require.resolve("enzyme-to-json/serializer")]
};
