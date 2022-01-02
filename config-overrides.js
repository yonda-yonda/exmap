const path = require('path');

module.exports = (config) => {
    config.resolve.alias['~'] = path.resolve(__dirname, './src');
    config.resolve.alias['@mui/styled-engine'] = '@mui/styled-engine-sc';

    return config;
};