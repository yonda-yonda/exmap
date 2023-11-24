/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  devServer: {
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (
            error.message ===
            "ResizeObserver loop completed with undelivered notifications." // chromeでrsuiteのpicker系操作時に表示されるエラー（chromeアップデートでなくなる可能性もあり）
          ) {
            return false;
          }
          return true;
        },
      },
    },
  },
  webpack: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
    plugins: [],
    configure: {
      // WARNING in ./node_modules/superstruct/dist/index.mjs を無視
      // https://github.com/facebook/create-react-app/pull/11752
      module: {
        rules: [
          {
            test: /\.(js|mjs|jsx)$/,
            enforce: "pre",
            use: ["source-map-loader"],
          },
        ],
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
};
