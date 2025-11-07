import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, UserPlus, Search, Upload, UserCog, History } from "lucide-react";

function ActionCard({ to, Icon, title, desc, gradient = "from-indigo-500 to-violet-600" }) {
  return (
    <Link
      to={to}
      className={`group relative rounded-2xl p-[1px] bg-gradient-to-br ${gradient}
                  shadow-[0_10px_30px_-12px_rgba(2,6,23,0.25)]
                  hover:shadow-[0_18px_40px_-12px_rgba(2,6,23,0.35)]
                  transition-all`}
    >
      <div className="h-full w-full rounded-2xl bg-white/80 backdrop-blur-xl p-6 ring-1 ring-slate-200">
        <Icon className="w-12 h-12 mb-4 opacity-90 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-600 text-sm">{desc}</p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Título */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Sistema de Credenciales PMZ
            </span>
          </h1>
        </header>

        {isAuthenticated ? (
          <>
            <section className="relative mb-10">
              <div
                className="rounded-3xl p-8 md:p-10 backdrop-blur-xl bg-white/70 ring-1 ring-slate-200
                           shadow-[0_20px_60px_-20px_rgba(2,6,23,0.25)]"
              >
                <h2 className="text-3xl font-bold text-slate-900">
                  ¡Bienvenido de nuevo {user?.name}!
                </h2>
                <div className="mt-3 inline-flex items-center gap-2">
                  <span className="text-slate-600">Rol:</span>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full
                                ${user?.role === "admin"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-indigo-100 text-indigo-700"}`}
                  >
                    {user?.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </div>
              </div>
            </section>

            {/* Acciones */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ActionCard
                to="/empleados"
                Icon={Users}
                title="Ver Empleados"
                desc="Consulta la lista completa de empleados"
                gradient="from-sky-500 to-blue-600"
              />

              <ActionCard
                to="/registrar-empleados"
                Icon={UserPlus}
                title="Registrar Empleado"
                desc="Agrega nuevos empleados al sistema"
                gradient="from-emerald-500 to-teal-600"
              />

              <ActionCard
                to="/buscar-empleado"
                Icon={Search}
                title="Buscar Empleado"
                desc="Encuentra empleados por diferentes criterios"
                gradient="from-violet-500 to-fuchsia-600"
              />

              <ActionCard
                to="/importar-empleados"
                Icon={Upload}
                title="Importar Empleados"
                desc="Carga empleados desde archivos Excel"
                gradient="from-amber-500 to-orange-600"
              />

              {/* Solo admin */}
              {user?.role === "admin" && (
                <>
                  <ActionCard
                    to="/register"
                    Icon={UserCog}
                    title="Registrar Usuario"
                    desc="Crea nuevos usuarios con acceso"
                    gradient="from-rose-500 to-red-600"
                  />

                  <ActionCard
                    to="/auditorias"
                    Icon={History}
                    title="Auditorías"
                    desc="Consulta acciones y cambios del sistema"
                    gradient="from-teal-500 to-cyan-600"
                  />
                </>
              )}
            </section>
          </>
        ) : (
          /* Estado no autenticado */
          <section className="max-w-md mx-auto text-center">
            <div className="rounded-3xl p-8 backdrop-blur-xl bg-white/70 ring-1 ring-slate-200 shadow-md">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Bienvenido
              </h2>
              <p className="text-slate-600 mb-6">
                Comienza ahora para acceder a todas las funcionalidades del sistema
              </p>
              <Link
                to="/login"
                className="inline-block w-full px-6 py-4 rounded-2xl font-semibold text-white
                           bg-gradient-to-r from-indigo-600 to-violet-600
                           shadow hover:shadow-lg active:scale-[0.99] transition"
              >
                Iniciar Sesión
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
