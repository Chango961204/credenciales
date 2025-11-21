import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  UserPlus,
  Search,
  Upload,
  UserCog,
  History,
} from "lucide-react";

function ActionCard({
  to,
  Icon,
  title,
  desc,
  gradient = "from-indigo-500 to-violet-600",
}) {
  return (
    <Link
      to={to}
      aria-label={title}
      className={`
        group relative flex flex-col rounded-2xl bg-gradient-to-br ${gradient}
        p-[1px] shadow-[0_10px_30px_-12px_rgba(15,23,42,0.4)]
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgba(15,23,42,0.5)]
      `}
    >
      <div className="flex h-full flex-col rounded-2xl bg-white/90 p-5 ring-1 ring-slate-200 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-900 group-hover:bg-slate-900/10">
            <Icon className="h-6 w-6" />
          </div>
        {/*   <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 group-hover:text-slate-500">
            Acción rápida
          </span> */}
        </div>

        <h3 className="mb-1 text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="text-sm text-slate-600">{desc}</p>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
{/*             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
 */}{/*             <span className="font-medium">Disponible</span>
 */}          </span>
          {/* <span className="inline-flex items-center gap-1 text-[11px] font-medium group-hover:text-slate-500">
            Ir a la sección
            <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </span> */}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        {/* Header */}
        <header className="mb-10 text-center md:mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 bg-clip-text text-transparent">
              Sistema de Credenciales PMZ
            </span>
          </h1>
          {isAuthenticated && (
            <p className="mt-3 text-sm text-slate-600 md:text-base">
              Administra empleados, usuarios y credenciales desde un solo lugar.
            </p>
          )}
        </header>

        {isAuthenticated ? (
          <>
            {/* Tarjeta de bienvenida */}
            <section className="relative mb-10">
              <div
                className="rounded-3xl bg-white/80 p-6 shadow-[0_20px_60px_-22px_rgba(15,23,42,0.4)]
                           ring-1 ring-slate-200 backdrop-blur-xl md:p-8"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Panel principal
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                      Bienvenido de nuevo{" "}
                      <span className="text-indigo-600">{user?.name}</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Selecciona una de los modulos para gestionar empleados,
                      usuarios o credenciales.
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Sesión activa
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                      <span className="text-xs text-slate-500">Rol actual:</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${user?.role === "admin"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-indigo-100 text-indigo-700"
                          }`}
                      >
                        {user?.role === "admin" ? "Administrador" : "Usuario"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Acciones principales */}
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Acciones principales
                </h2>
                <span className="text-xs text-slate-400">
                  Elige una opción para comenzar
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <ActionCard
                  to="/empleados"
                  Icon={Users}
                  title="Ver empleados"
                  desc="Consulta y administra el listado completo de empleados."
                  gradient="from-sky-500 to-blue-600"
                />

                <ActionCard
                  to="/registrar-empleados"
                  Icon={UserPlus}
                  title="Registrar empleado"
                  desc="Da de alta nuevos empleados en el sistema."
                  gradient="from-emerald-500 to-teal-600"
                />

                <ActionCard
                  to="/buscar-empleado"
                  Icon={Search}
                  title="Buscar empleado"
                  desc="Encuentra empleados por nombre o número de trabajador."
                  gradient="from-violet-500 to-fuchsia-600"
                />

                <ActionCard
                  to="/importar-empleados"
                  Icon={Upload}
                  title="Importar empleados"
                  desc="Carga empleados desde un archivo Excel."
                  gradient="from-amber-500 to-orange-600"
                />

                {/* Solo admin */}
                {user?.role === "admin" && (
                  <>
                    <ActionCard
                      to="/register"
                      Icon={UserCog}
                      title="Registrar usuario"
                      desc="Crea y gestiona usuarios con acceso al sistema."
                      gradient="from-rose-500 to-red-600"
                    />

                    <ActionCard
                      to="/auditorias"
                      Icon={History}
                      title="Auditorías"
                      desc="Revisa el historial de acciones y cambios."
                      gradient="from-teal-500 to-cyan-600"
                    />
                  </>
                )}
              </div>
            </section>
          </>
        ) : (
          //  no autenticado
          <section className="mx-auto max-w-md text-center">
            <div className="rounded-3xl bg-white/80 p-8 ring-1 ring-slate-200 shadow-lg backdrop-blur-xl">
              <h2 className="mb-2 text-3xl font-bold text-slate-900">
                Bienvenido
              </h2>
              <p className="mb-6 text-sm text-slate-600">
                Inicia sesión para acceder al panel de administración de
                credenciales del PMZ.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
              >
                Iniciar sesión
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
