import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";

import DemoApp from "./demo/DemoApp";
const LegacyApp = lazy(async () => {
  await import("./styles.css");
  const module = await import("./App");
  return { default: module.App };
});
const useLegacy =
  new URLSearchParams(window.location.search).get("mode") === "live";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Suspense fallback={<p>正在加载迁镜…</p>}>
      {useLegacy ? <LegacyApp /> : <DemoApp />}
    </Suspense>
  </StrictMode>,
);
