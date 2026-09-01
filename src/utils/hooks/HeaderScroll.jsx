import { useEffect, useState } from "react";

export function useHeaderScroll(value) {
  const [upScroll, setUpScroll] = useState(value);

  useEffect(() => {
    let frameId = null;

    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        // A meaningful threshold prevents the header flickering between states
        // during tiny trackpad/touch movements at the top of the page.
        setUpScroll((current) => {
          const threshold = current ? 56 : 88;
          return window.scrollY > threshold;
        });
        frameId = null;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return upScroll;
}
