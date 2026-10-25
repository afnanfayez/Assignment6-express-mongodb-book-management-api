// Roman to Integer - LeetCode-compatible JavaScript solution.
// For each symbol, subtract it when a smaller value appears before a larger one.
var romanToInt = function (s) {
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;

  for (let index = 0; index < s.length; index += 1) {
    const current = values[s[index]];
    const next = values[s[index + 1]] ?? 0;
    total += current < next ? -current : current;
  }

  return total;
};

if (typeof process !== "undefined" && process.argv?.[1]?.endsWith("bonus.js")) {
  const examples = [
    ["III", 3],
    ["IV", 4],
    ["IX", 9],
    ["LVIII", 58],
    ["MCMXCIV", 1994],
  ];
  for (const [input, expected] of examples) {
    const actual = romanToInt(input);
    if (actual !== expected)
      throw new Error(`${input}: expected ${expected}, received ${actual}`);
    console.log(`${input} = ${actual}`);
  }
}
