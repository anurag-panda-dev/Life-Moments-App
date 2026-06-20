// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
//   };
// };
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: ["expo-router/babel"],
  };
};