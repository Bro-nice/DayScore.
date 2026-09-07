import React, { useEffect, useRef } from 'react';

interface InteractiveLiveBackgroundProps {
  isDark: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  amplitude: number;
  decay: number;
  life: number;
}

export const InteractiveLiveBackground: React.FC<InteractiveLiveBackgroundProps> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isLoopRunning = false;
    let hadDrawnDotsLastFrame = false;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setupCanvasSize();

    // Mouse coordinates with smoothing
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isActive: false,
    };

    const ripples: Ripple[] = [];
    let rippleCounter = 0;

    // Helper to determine if an event target is purely the application background
    // and NOT an icon, button, input, card, menu, dialog, or UI element
    const isPureBackgroundTarget = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof Element)) return false;

      // Direct canvas or root page backgrounds
      if (target === canvas || target === document.body || target === document.documentElement) {
        return true;
      }

      // Check if target is inside any interactive UI or elevated container
      const interactiveOrUi = target.closest(
        'button, a, input, textarea, select, option, label, ' +
        'svg, path, circle, rect, polygon, line, ' +
        '[role], [tabindex], ' +
        'nav, header, footer, aside, form, ' +
        '[data-interactive="true"], ' +
        '.card, [class*="shadow-"], [class*="rounded-"], ' +
        '[class*="bg-white"], [class*="dark:bg-slate-"], [class*="backdrop-blur"]'
      );

      if (interactiveOrUi) {
        return false;
      }

      // Content text elements (headings, paragraphs, lists)
      const tagName = target.tagName.toLowerCase();
      if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'strong', 'em', 'b', 'i', 'code', 'li'].includes(tagName)) {
        return false;
      }

      return true;
    };

    // Helper to determine if an element is a navigation / down bar button (Home, Chat, Settings, etc.)
    const isNavigationTrigger = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof Element)) return false;

      return !!target.closest(
        'nav button, nav [role="button"], [class*="bottom-0"] [role="button"], [class*="bottom-0"] button, [data-ripple="true"], [data-nav-button="true"], [aria-label*="Home"], [aria-label*="Chat"], [aria-label*="Settings"]'
      );
    };

    const spawnRippleAt = (x: number, y: number) => {
      // Cap concurrent ripples to maximum 2 to maintain smooth 60fps
      if (ripples.length >= 2) {
        ripples.shift();
      }

      ripples.push({
        id: ++rippleCounter,
        x,
        y,
        radius: 0,
        maxRadius: Math.min(width, height) * 0.75,
        speed: 8.5,
        amplitude: 22,
        decay: 0.965,
        life: 1.0,
      });

      startLoop();
    };

    const startLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      setupCanvasSize();
      startLoop();
    };

    const handlePointerMove = (e: PointerEvent) => {
      // ONLY trigger cursor excitation if moving over empty background
      if (!isPureBackgroundTarget(e.target)) {
        if (mouse.isActive) {
          mouse.isActive = false;
          mouse.targetX = -1000;
          mouse.targetY = -1000;
          startLoop();
        }
        return;
      }

      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isActive = true;
      startLoop();
    };

    const handlePointerLeave = () => {
      if (mouse.isActive) {
        mouse.isActive = false;
        mouse.targetX = -1000;
        mouse.targetY = -1000;
        startLoop();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;

      // 1. Navigation & Down buttons (Home, Chat, Settings, Time, Rank, Feed, Profile, etc.)
      if (isNavigationTrigger(target)) {
        spawnRippleAt(e.clientX, e.clientY);
        return;
      }

      // 2. Pure background clicks
      if (isPureBackgroundTarget(target)) {
        spawnRippleAt(e.clientX, e.clientY);
        return;
      }

      // Other buttons (checkboxes, inputs, form buttons, text typing) do NOT spawn ripples to prevent lag
    };

    const handleCustomRipple = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      if (customEvent.detail && typeof customEvent.detail.x === 'number') {
        spawnRippleAt(customEvent.detail.x, customEvent.detail.y);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('app-ripple', handleCustomRipple);
    document.addEventListener('pointerleave', handlePointerLeave);

    const SPACING = 24; // Balanced geometric distribution with low computational footprint
    const WAVE_WIDTH = 70;

    const render = () => {
      // Smooth lerp mouse coordinates
      if (mouse.isActive) {
        mouse.x += (mouse.targetX - mouse.x) * 0.22;
        mouse.y += (mouse.targetY - mouse.y) * 0.22;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      // Advance active ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.amplitude *= r.decay;
        r.life *= r.decay;
        if (r.radius > r.maxRadius || r.life < 0.03) {
          ripples.splice(i, 1);
        }
      }

      // Auto-sleep check: if there are no ripples and mouse is idle, pause loop and save 100% CPU
      const isMouseSettled = !mouse.isActive || (Math.abs(mouse.targetX - mouse.x) < 0.5 && Math.abs(mouse.targetY - mouse.y) < 0.5);
      if (ripples.length === 0 && isMouseSettled && !hadDrawnDotsLastFrame) {
        ctx.clearRect(0, 0, width, height);
        isLoopRunning = false;
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;

      // Razor-sharp crystal colors
      const activeSpikeColor = isDark ? 'rgba(192, 132, 252, ' : 'rgba(124, 58, 237, ';
      const glowSpikeColor = isDark ? 'rgba(244, 114, 182, ' : 'rgba(217, 70, 239, ';

      const excitedDots: Array<{
        x: number;
        y: number;
        excitation: number;
      }> = [];

      const mouseRadius = 110;
      const mouseRadiusSq = mouseRadius * mouseRadius;

      for (let col = 0; col < cols; col++) {
        const originX = col * SPACING;

        for (let row = 0; row < rows; row++) {
          const originY = row * SPACING;

          let dx = 0;
          let dy = 0;
          let excitation = 0;

          // 1. Mouse magnetic interaction (only when on background)
          if (mouse.isActive) {
            const distMouseX = originX - mouse.x;
            const distMouseY = originY - mouse.y;
            const distMouseSq = distMouseX * distMouseX + distMouseY * distMouseY;

            if (distMouseSq < mouseRadiusSq && distMouseSq > 0.1) {
              const distMouse = Math.sqrt(distMouseSq);
              const factor = 1 - distMouse / mouseRadius;
              const push = factor * factor * 10;
              dx += (distMouseX / distMouse) * push;
              dy += (distMouseY / distMouse) * push;
              excitation = Math.max(excitation, factor * 0.95);
            }
          }

          // 2. Ripple wave interaction with fast bounding-box skip
          for (let i = 0; i < ripples.length; i++) {
            const r = ripples[i];
            const distRipX = originX - r.x;
            const distRipY = originY - r.y;

            // Fast bounding box rejection to prevent unnecessary Math.sqrt operations
            if (Math.abs(distRipX) > r.radius + WAVE_WIDTH || Math.abs(distRipY) > r.radius + WAVE_WIDTH) {
              continue;
            }

            const distRipSq = distRipX * distRipX + distRipY * distRipY;
            const distRip = Math.sqrt(distRipSq);

            const diff = distRip - r.radius;
            if (Math.abs(diff) < WAVE_WIDTH && distRip > 0.1) {
              const envelope = Math.cos((diff / WAVE_WIDTH) * (Math.PI / 2));
              const wavePower = envelope * envelope * (r.amplitude / 22) * r.life;

              const push = Math.sin((diff / WAVE_WIDTH) * Math.PI) * wavePower * 11;
              dx += (distRipX / distRip) * push;
              dy += (distRipY / distRip) * push;

              excitation = Math.max(excitation, wavePower);
            }
          }

          // Only collect points that are meaningfully excited
          if (excitation > 0.04) {
            excitedDots.push({
              x: originX + dx,
              y: originY + dy,
              excitation,
            });
          }
        }
      }

      hadDrawnDotsLastFrame = excitedDots.length > 0;

      // Draw crystal spikes
      ctx.lineWidth = 1.0;
      for (let i = 0; i < excitedDots.length; i++) {
        const dot = excitedDots[i];
        const alpha = Math.min(0.85, 0.25 + dot.excitation * 0.6);
        const spikeLen = 2.0 + dot.excitation * 4.8;
        const coreRadius = 0.8 + dot.excitation * 1.2;

        ctx.save();
        ctx.translate(dot.x, dot.y);

        // 4-point cross flare
        ctx.strokeStyle = `${activeSpikeColor}${alpha})`;
        ctx.beginPath();
        ctx.moveTo(-spikeLen, 0);
        ctx.lineTo(spikeLen, 0);
        ctx.moveTo(0, -spikeLen);
        ctx.lineTo(0, spikeLen);
        ctx.stroke();

        // Crystal radiant center
        ctx.fillStyle = `${glowSpikeColor}${alpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    startLoop();

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('app-ripple', handleCustomRipple);
      document.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      id="interactive-live-background-canvas"
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      style={{ opacity: isDark ? 0.85 : 0.65 }}
    />
  );
};
