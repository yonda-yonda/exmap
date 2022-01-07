/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { resolve } = require("path");

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "~": resolve(__dirname, "./src"),
      },
    },
  });
};
