import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({}),
  // npm run build から呼ばれたときに再帰しないよう、next build を直接実行
  buildCommand: "npx next build",
};
