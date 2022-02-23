const {
  resolve
} = require("path"); /* eslint-disable-line @typescript-eslint/no-var-requires */

exports.onCreateWebpackConfig = ({
  actions,
  plugins
}) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "~": resolve(__dirname, "./src"),
      },
      fallback: {
        assert: require.resolve("assert/"),
        url: require.resolve("url/"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        stream: require.resolve("stream-browserify"),
        zlib: require.resolve("browserify-zlib"),
      }
    },
    plugins: [
      plugins.define({
        CESIUM_BASE_URL: JSON.stringify("cesium"),
      }),
    ]
  });
};