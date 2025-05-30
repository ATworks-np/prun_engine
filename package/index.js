// index.js

/**
 * 入力にプレフィックスをつけて返すシンプルな関数
 * @param {string} input - 任意の文字列
 * @returns {string} - 処理結果
 */
function run(input) {
  return `[PrunEngine]: ${input}`;
}

/**
 * バージョン情報を返す関数
 * @returns {string}
 */
function version() {
  return '0.0.1';
}

// エクスポート（CommonJS形式）
module.exports = {
  run,
  version,
};
