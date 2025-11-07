import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Search, X, Eye, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function pretty(v) {
    try {
        return JSON.stringify(v, null, 2);
    } catch {
        return String(v);
    }
}
function diffObjects(oldObj = {}, newObj = {}) {
    const changed = [];
    const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
    for (const k of keys) {
        if (["createdAt", "updatedAt"].includes(k)) continue;
        const a = oldObj?.[k];
        const b = newObj?.[k];
        const eq = JSON.stringify(a) === JSON.stringify(b);
        if (!eq) changed.push({ field: k, old: a, now: b });
    }
    return changed;
}

const Field = ({ icon: Icon, ...props }) => (
    <div className="relative group">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
        <input
            {...props}
            className={`w-full pl-9 pr-3 py-2 rounded-xl bg-white/70 ring-1 ring-slate-200
                  outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm
                  placeholder:text-slate-400 text-slate-800`}
        />
    </div>
);

const Pill = ({ tone = "indigo", children }) => {
    const map = {
        green: "bg-emerald-100 text-emerald-700",
        yellow: "bg-amber-100 text-amber-700",
        red: "bg-rose-100 text-rose-700",
        indigo: "bg-indigo-100 text-indigo-700",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[tone] || map.indigo}`}>
            {children}
        </span>
    );
};

export default function AuditoriasPage() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        model: "",
        modelId: "",
        email: "",
        page: 1,
        limit: 20, 
    });

    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState(null);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(Number(total || 0) / Number(filters.limit || 20))),
        [total, filters.limit]
    );

    useEffect(() => {
        if (!isAuthenticated) return navigate("/login");
        if (user?.role !== "admin") return navigate("/");
    }, [isAuthenticated, user]);

    useEffect(() => {
        fetchAudits();
    }, [filters.page, filters.limit]);

    async function fetchAudits(customPage) {
        try {
            setLoading(true);
            setErr("");
            const token = localStorage.getItem("token");
            const params = {
                model: filters.model || undefined,
                modelId: filters.modelId || undefined,
                email: filters.email || undefined,
                page: customPage ?? filters.page,
                limit: filters.limit,
            };

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/auditorias`,
                { params, headers: { Authorization: `Bearer ${token}` } }
            );

            setData(res.data?.data || []);
            setTotal(res.data?.total || 0);
            if (customPage) setFilters((f) => ({ ...f, page: customPage }));
        } catch (e) {
            setErr(e.response?.data?.message || "No se pudieron cargar las auditorías");
        } finally {
            setLoading(false);
        }
    }

    function onChangeFilter(e) {
        const { name, value } = e.target;
        setFilters((f) => ({ ...f, [name]: value }));
    }
    function onSearch(e) {
        e?.preventDefault?.();
        fetchAudits(1);
    }
    function onClear() {
        setFilters({ model: "", modelId: "", email: "", page: 1, limit: 20 });
        fetchAudits(1);
    }
    function openDetail(row) {
        setCurrent(row);
        setOpen(true);
    }

    const changedFields = useMemo(() => {
        if (!current) return [];
        return diffObjects(current.oldValues || {}, current.newValues || {});
    }, [current]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white">
            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            Auditorías
                        </span>
                    </h1>
                    <Link
                        to="/"
                        className="text-indigo-600/90 hover:text-indigo-700 inline-flex items-center gap-2 font-semibold"
                    >
                        ← Volver al inicio
                    </Link>
                </div>

                <form
                    onSubmit={onSearch}
                    className="mb-6 rounded-2xl backdrop-blur bg-white/60 ring-1 ring-slate-200 shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)] p-4 md:p-5"
                >
                    <div className="flex items-center gap-3 mb-3 text-slate-700">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-semibold">Filtros rápidos</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Field
                            name="model"
                            value={filters.model}
                            onChange={onChangeFilter}
                            placeholder="Modelo (User, Empleado...)"
                            icon={Search}
                        />
                        <Field
                            name="modelId"
                            value={filters.modelId}
                            onChange={onChangeFilter}
                            placeholder="ID modelo"
                            icon={Search}
                        />
                        <Field
                            name="email"
                            value={filters.email}
                            onChange={onChangeFilter}
                            placeholder="Email del actor"
                            icon={Search}
                        />

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                           bg-gradient-to-r from-indigo-600 to-violet-600 text-white
                           px-4 py-2.5 font-semibold shadow hover:shadow-md
                           transition-all active:scale-[0.99]"
                            >
                                <Search className="w-4 h-4" />
                                Buscar
                            </button>
                            <button
                                type="button"
                                onClick={onClear}
                                className="inline-flex items-center justify-center gap-2 rounded-xl
                           bg-slate-100 text-slate-700 px-4 py-2.5 font-semibold
                           ring-1 ring-slate-200 hover:bg-slate-200 transition-all"
                            >
                                <X className="w-4 h-4" />
                                Limpiar
                            </button>
                        </div>
                    </div>
                </form>

                {/* Tabla */}
                <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white/80 backdrop-blur shadow-[0_10px_30px_-12px_rgba(2,6,23,0.15)]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur z-10">
                                <tr className="text-slate-600">
                                    <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                                    <th className="px-4 py-3 text-left font-semibold">Evento</th>
                                    <th className="px-4 py-3 text-left font-semibold">Modelo</th>
                                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                                    <th className="px-4 py-3 text-left font-semibold">IP</th>
                                    <th className="px-4 py-3 text-left font-semibold">URL</th>
                                    <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-slate-500" colSpan={8}>
                                            Cargando…
                                        </td>
                                    </tr>
                                ) : err ? (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-rose-600" colSpan={8}>
                                            {err}
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-slate-500" colSpan={8}>
                                            Sin resultados
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((row) => {
                                        const tone =
                                            row.event === "created"
                                                ? "green"
                                                : row.event === "updated"
                                                    ? "yellow"
                                                    : row.event === "deleted"
                                                        ? "red"
                                                        : "indigo";
                                        return (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-indigo-50/40 transition-colors"
                                            >
                                                <td className="px-4 py-3 text-slate-700">
                                                    {new Date(row.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Pill tone={tone}>{row.event}</Pill>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{row.model}</td>
                                                <td className="px-4 py-3 text-slate-700">{row.modelId}</td>
                                                <td className="px-4 py-3 text-slate-700">{row.userEmail || "-"}</td>
                                                <td className="px-4 py-3 text-slate-700">{row.ip || "-"}</td>
                                                <td className="px-4 py-3">
                                                    {row.url ? (
                                                        <a
                                                            href={row.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-indigo-600 hover:text-indigo-700 hover:underline"
                                                            title={row.url}
                                                        >
                                                            {row.url.length > 36 ? row.url.slice(0, 36) + "…" : row.url}
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => openDetail(row)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5
                                       bg-indigo-50 text-indigo-700 hover:bg-indigo-100
                                       ring-1 ring-inset ring-indigo-200 transition"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Paginación */}
                <div className="mt-5 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                        Total: <span className="font-semibold">{total}</span> registros
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={filters.page <= 1}
                            onClick={() => fetchAudits(filters.page - 1)}
                            className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 text-slate-700
                         hover:bg-slate-100 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-slate-600">
                            Página <b className="text-slate-800">{filters.page}</b> de{" "}
                            <b className="text-slate-800">{totalPages}</b>
                        </span>
                        <button
                            disabled={filters.page >= totalPages}
                            onClick={() => fetchAudits(filters.page + 1)}
                            className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 text-slate-700
                         hover:bg-slate-100 disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {open && current && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 p-6 animate-[fadeIn_.16s_ease]">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
                            title="Cerrar"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold mb-4">Detalle de auditoría</h2>

                        <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                            <div className="bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100">
                                <p><b>Evento:</b> {current.event}</p>
                                <p><b>Fecha:</b> {new Date(current.createdAt).toLocaleString()}</p>
                                <p><b>Modelo:</b> {current.model}</p>
                                <p><b>ID modelo:</b> {current.modelId || "-"}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100">
                                <p><b>Email:</b> {current.userEmail || "-"}</p>
                                <p><b>IP:</b> {current.ip || "-"}</p>
                                <p><b>URL:</b> {current.url || "-"}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-slate-800 mb-2">Campos cambiados</h3>
                            {(() => {
                                const changed = changedFields;
                                if (changed.length === 0) {
                                    return <p className="text-sm text-slate-600">Sin diferencias detectadas.</p>;
                                }
                                return (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm border rounded-xl overflow-hidden">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left border">Campo</th>
                                                    <th className="px-3 py-2 text-left border">Antes</th>
                                                    <th className="px-3 py-2 text-left border">Ahora</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {changed.map((c) => (
                                                    <tr key={c.field} className="align-top">
                                                        <td className="px-3 py-2 border font-medium">{c.field}</td>
                                                        <td className="px-3 py-2 border text-rose-700 bg-rose-50 whitespace-pre-wrap">
                                                            {pretty(c.old)}
                                                        </td>
                                                        <td className="px-3 py-2 border text-emerald-700 bg-emerald-50 whitespace-pre-wrap">
                                                            {pretty(c.now)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">Old values</h3>
                                <pre className="bg-slate-900 text-slate-100 rounded-xl p-3 text-xs overflow-auto max-h-80">
                                    {pretty(current.oldValues)}
                                </pre>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">New values</h3>
                                <pre className="bg-slate-900 text-slate-100 rounded-xl p-3 text-xs overflow-auto max-h-80">
                                    {pretty(current.newValues)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
