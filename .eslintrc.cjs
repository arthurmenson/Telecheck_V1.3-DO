module.exports = {
  rules: {
    "no-restricted-syntax": [
      "error",
      { selector: "Literal[value=/http:\\/\\/localhost:\\d+/]", message: "Do not hardcode localhost — use CFG.apiBase or /api." },
      { selector: "ImportDeclaration[source.value='client/services/api.service']", message: "Use per-feature adapters, not api.service." }
    ]
  }
};
