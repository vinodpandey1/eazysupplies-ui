"use client";

import { useEffect } from "react";

const CURRENT_RELEASE = process.env.NEXT_PUBLIC_RELEASE_ID;
const CHECK_INTERVAL_MS = 60_000;

const ReleaseVersionGuard = () => {
  useEffect(() => {
    if (!CURRENT_RELEASE || CURRENT_RELEASE === "unknown") return undefined;

    let reloading = false;

    const checkForNewRelease = async () => {
      if (reloading || document.visibilityState === "hidden") return;

      try {
        const response = await fetch(`/api/version?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!response.ok) return;

        const { release } = await response.json();
        if (release && release !== "unknown" && release !== CURRENT_RELEASE) {
          reloading = true;
          window.location.reload();
        }
      } catch {
        // A temporary network failure must not interrupt the storefront.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkForNewRelease();
    };

    checkForNewRelease();
    const intervalId = window.setInterval(checkForNewRelease, CHECK_INTERVAL_MS);
    window.addEventListener("focus", checkForNewRelease);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkForNewRelease);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
};

export default ReleaseVersionGuard;
