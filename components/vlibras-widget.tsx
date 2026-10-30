"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (options: { rootPath: string; avatar: string; position: string }) => unknown;
    };
  }
}

const VLibrAS_SCRIPT_ID = "vlibras-widget-script";
const VLibrAS_ROOT_PATH = "https://vlibras.gov.br/app";

export function VlibrasWidget() {
  useEffect(() => {
    const initialize = () => {
      if (!window.VLibras || document.querySelector("[data-vlibras-widget]") ) return;

      const container = document.createElement("div");
      container.dataset.vlibrasWidget = "true";
      document.body.appendChild(container);

      new window.VLibras.Widget({
        rootPath: VLibrAS_ROOT_PATH,
        avatar: "random",
        position: "R",
      });
    };

    const existingScript = document.getElementById(VLibrAS_SCRIPT_ID);
    if (existingScript) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.id = VLibrAS_SCRIPT_ID;
    script.src = `${VLibrAS_ROOT_PATH}/vlibras-plugin.js`;
    script.async = true;
    script.addEventListener("load", initialize, { once: true });
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", initialize);
    };
  }, []);

  return null;
}
