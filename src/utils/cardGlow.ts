// Smoothly animate CSS variables --glow-x and --glow-y for elements with `.card-border-glow`
type CleanupFn = () => void;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initCardGlow(root: ParentNode = document): CleanupFn {
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>(".card-border-glow")
  );
  const cleanups: CleanupFn[] = [];

  cards.forEach((card) => {
    let tgtX = 50;
    let tgtY = 50;
    let curX = 50;
    let curY = 50;
    let raf = 0;
    let active = true;
    let idleInterval: number | null = null;
    let idlePhase = Math.random() * Math.PI * 2;

    const setVars = () => {
      card.style.setProperty("--glow-x", `${curX}%`);
      card.style.setProperty("--glow-y", `${curY}%`);
    };

    const loop = () => {
      if (!active) return;
      curX = lerp(curX, tgtX, 0.12);
      curY = lerp(curY, tgtY, 0.12);
      setVars();
      raf = requestAnimationFrame(loop);
    };

    // Start the animation loop
    raf = requestAnimationFrame(loop);

    // Idle autonomous movement: pick a new random target every few seconds
    const startIdle = () => {
      if (idleInterval) return;
      idleInterval = window.setInterval(() => {
        // small random movement centered around 50%
        const range = 18; // percent offset
        const nx =
          50 +
          Math.cos(Math.random() * Math.PI * 2 + idlePhase) *
            (Math.random() * range);
        const ny =
          50 +
          Math.sin(Math.random() * Math.PI * 2 + idlePhase) *
            (Math.random() * range);
        tgtX = Math.max(10, Math.min(90, Math.round(nx * 100) / 100));
        tgtY = Math.max(10, Math.min(90, Math.round(ny * 100) / 100));
      }, 2800 + Math.random() * 2200);
    };

    const stopIdle = () => {
      if (idleInterval) {
        clearInterval(idleInterval);
        idleInterval = null;
      }
    };

    // begin idle movement immediately
    startIdle();

    const onMove = (e: MouseEvent) => {
      // when user moves mouse, stop idle adjustments temporarily
      stopIdle();
      const rect = card.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / (rect.width || 1))
      );
      const y = Math.max(
        0,
        Math.min(1, (e.clientY - rect.top) / (rect.height || 1))
      );
      tgtX = Math.round(x * 100 * 100) / 100; // keep precision
      tgtY = Math.round(y * 100 * 100) / 100;
      card.style.setProperty("--glow-intensity", "0.95");
    };

    const onLeave = () => {
      // resume idle behavior when mouse leaves
      startIdle();
      card.style.setProperty("--glow-intensity", "0.28");
    };

    const onEnter = (e: MouseEvent) => onMove(e);

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);

    const cleanup = () => {
      active = false;
      cancelAnimationFrame(raf);
      stopIdle();
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
    };

    cleanups.push(cleanup);
  });

  return () => {
    cleanups.forEach((c) => c());
  };
}

export default initCardGlow;
