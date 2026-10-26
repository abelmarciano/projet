import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { WHATSAPP_URL } from "@/data";

type Ember = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; hue: number };

/** Braises qui montent du bas de l'écran et s'écartent du curseur. */
function useEmbers(ref: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1, raf = 0;
    const mouse = { x: -9999, y: -9999 };
    const embers: Ember[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (anywhere = false): Ember => {
      const max = 300 + Math.random() * 400;
      return {
        x: w * (0.15 + Math.random() * 0.7),
        y: anywhere ? Math.random() * h : h + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.35 + Math.random() * 1.1),
        r: 0.6 + Math.random() * 2.2,
        life: anywhere ? Math.random() * max : 0,
        max,
        hue: 18 + Math.random() * 30,
      };
    };

    resize();
    const count = Math.round(Math.min(160, (w * h) / 9000));
    for (let i = 0; i < count; i++) embers.push(spawn(true));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const e of embers) {
        const dx = e.x - mouse.x, dy = e.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22000) {
          const f = (22000 - d2) / 22000;
          e.vx += (dx / Math.sqrt(d2 + 1)) * f * 0.25;
        }
        e.vx += (Math.random() - 0.5) * 0.04;
        e.vx *= 0.97;
        e.x += e.vx;
        e.y += e.vy;
        e.life += 1;
        const t = e.life / e.max;
        const a = Math.max(0, Math.sin(Math.PI * Math.min(1, t))) * 0.9;
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
        g.addColorStop(0, `hsla(${e.hue}, 100%, 62%, ${a})`);
        g.addColorStop(1, `hsla(${e.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
        ctx.fill();
        if (e.life > e.max || e.y < -20) Object.assign(e, spawn());
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();

    const onMove = (ev: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = ev.clientX - r.left;
      mouse.y = ev.clientY - r.top;
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [ref]);
}

export default function Hero() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEmbers(canvas);

  return (
    <section className="hero" id="top">
      <div className="hero-orb" aria-hidden="true" />
      <canvas ref={canvas} aria-hidden="true" />
      <div className="wrap hero-inner">
        <span className="badge"><b>LIVE</b> Leads B2C exclusifs, livrés à la seconde</span>
        <h1 className="display">
          <span className="line"><span>Vos clients</span></span>
          <span className="line"><span className="flame-text">arrivent.</span></span>
        </h1>
        <p className="lede">
          Leadeurs génère, vérifie et livre des prospects prêts à signer, directement dans votre CRM.
          Photovoltaïque, isolation, pompe à chaleur, LED : vous ne payez que les leads conformes.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-flame" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Recevoir mes premiers leads <ArrowRight />
          </a>
          <a className="btn btn-glass ring" href="#pourquoi">Découvrir Leadeurs</a>
        </div>
        <div className="scroll-hint" aria-hidden="true">SCROLL<i /></div>
      </div>
    </section>
  );
}
