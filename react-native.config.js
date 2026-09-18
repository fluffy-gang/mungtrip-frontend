const path = require('node:path');

function packageRoot(packageName) {
  return path.dirname(require.resolve(`${packageName}/package.json`));
}

module.exports = {
  dependencies: {
    '@react-native-google-signin/google-signin': {
      root: packageRoot('@react-native-google-signin/google-signin'),
    },
    '@react-native-seoul/kakao-login': {
      root: packageRoot('@react-native-seoul/kakao-login'),
    },
  },
};
