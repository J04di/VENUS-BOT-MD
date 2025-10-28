export const app = {
  name: "Venus App",
  version: "2.0.0-lts",
  hash: process.env["HASH"] ?? "",
};
if (!app.hash) {
  throw new Error("Environment variable 'HASH' required.");
}
