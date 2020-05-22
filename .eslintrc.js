const { NODE_ENV } = process.env;

module.exports = {
  extends: ["airbnb-base", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": ["error"],
    "no-underscore-dangle": ["error", { allow: ["_id"] }],
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "no-console": NODE_ENV === "production" ? "error" : "off",
    "no-debugger": NODE_ENV === "production" ? "error" : "off",
  },
  env: {
    jest: true,
  },
};
