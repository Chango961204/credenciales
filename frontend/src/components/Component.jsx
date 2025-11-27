import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import logoZac from "../assets/pmz.webp";

export default function Footer() {
    const location = useLocation();
    const panelRef = useRef(null);

    const [open, setOpen] = useState(false);

    const hideFooter = /^\/credencial\/[^/]+$/.test(location.pathname);
    useEffect(() => setOpen(false), [location.pathname]);

    useEffect(() => {
        const HOTZONE_PX = 10; // <- qué tan fácil se activa (8-16 recomendado)
        let raf = 0;

        const onMove = (e) => {
            const x = e.clientX;
            const y = e.clientY;

            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const inHotzone = y >= window.innerHeight - HOTZONE_PX;

                const rect = panelRef.current?.getBoundingClientRect();
                const inPanel =
                    !!rect &&
                    x >= rect.left &&
                    x <= rect.right &&
                    y >= rect.top &&
                    y <= rect.bottom;

                const shouldOpen = inHotzone || inPanel;

                setOpen((prev) => (prev === shouldOpen ? prev : shouldOpen));
            });
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    if (hideFooter) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none">
            <div
                ref={panelRef}
                className={`pointer-events-auto transition-transform duration-200 ${open ? "translate-y-0" : "translate-y-[140%]"
                    }`}
            >
                <div className="mx-auto max-w-7xl px-4 pb-3 relative">
                    {/* Glow suave */}
                    <div
                        className="
              pointer-events-none
              absolute -inset-x-10 -top-10 h-20
              bg-gradient-to-r from-sky-500/25 via-emerald-400/15 to-violet-500/25
              blur-2xl opacity-80
            "
                        aria-hidden="true"
                    />

                    {/* Tarjeta glass transparente */}
                    <div
                        className="
              relative overflow-hidden rounded-3xl p-[1px]
              bg-gradient-to-r from-white/35 via-white/10 to-white/25
              ring-1 ring-white/30
              shadow-[0_-18px_45px_-28px_rgba(15,23,42,0.45)]
              backdrop-blur-2xl
            "
                    >
                        <div className="relative rounded-3xl px-4 py-3 bg-white/18">
                            <div
                                className="
                  pointer-events-none absolute -top-10 left-10 h-24 w-40
                  rotate-12 rounded-full bg-white/25 blur-2xl
                "
                                aria-hidden="true"
                            />

                            <div className="relative flex items-center justify-between gap-4">
                                <div className="leading-tight">
                                    <p className="text-xs font-medium text-slate-700/80">
                                        Sistema de Credenciales PMZ
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Desarrollado por{" "}
                                        <span className="font-extrabold bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-clip-text text-transparent">
                                            Ing. Luis Manuel López Robles
                                        </span>
                                    </p>
                                </div>
                                <img
                                    src={logoZac}
                                    alt="Ayuntamiento de Zacatecas 2024-2027"
                                    className="h-10 w-auto object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-white/35 ring-1 ring-white/25 backdrop-blur-xl" />
                </div>
            </div>
        </div>
    );
}
