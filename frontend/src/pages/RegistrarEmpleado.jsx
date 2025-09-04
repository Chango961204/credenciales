import React, { useState } from 'react';
import axios from 'axios';

function RegistrarEmpleado() {
    const [form, setForm] = useState({
        num_trab: '',
        rfc: '',
        nom_trab: '',
        num_imss: '',
        sexo: '',
        fecha_ing: '',
        num_depto: '',
        nom_depto: '',
        categoria: '',
        puesto: '',
        sind: '',
        conf: '',
        nomina: '',
        vencimiento_contrato: '',
    });

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === "num_trab" || name === "num_depto") {
            // Solo enteros
            if (/^\d*$/.test(value)) setForm({ ...form, [name]: value });
        } else if (name === "sind" || name === "conf") {
            // Solo 0 o 1
            if (value === "0" || value === "1") setForm({ ...form, [name]: value });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/empleados', form);
            alert('Empleado registrado correctamente');
            setForm({
                num_trab: '', rfc: '', nom_trab: '',
                num_imss: '', sexo: '', fecha_ing: '', num_depto: '',
                nom_depto: '', categoria: '', puesto: '', sind: '', conf: '',
                nomina: '', vencimiento_contrato: '',
            });
        } catch (error) {
            alert('Error al registrar empleado');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Registrar Empleado</h2>
            <label>
                Número de empleado (entero):
                <input
                    name="num_trab"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Número de empleado"
                    value={form.num_trab}
                    onChange={handleChange}
                    required
                />
            </label>
            <label>
                RFC:
                <input
                    name="rfc"
                    type="text"
                    placeholder="RFC"
                    value={form.rfc}
                    onChange={handleChange}
                    required
                />
            </label>
            <label>
                Nombre:
                <input
                    name="nom_trab"
                    type="text"
                    placeholder="Nombre"
                    value={form.nom_trab}
                    onChange={handleChange}
                    required
                />
            </label>
            <label>
                Número de Seguro Social:
                <input
                    name="num_imss"
                    type="text"
                    placeholder="Número de Seguro Social"
                    value={form.num_imss}
                    onChange={handleChange}
                    required
                />
            </label>
            <label>
                Sexo:
                <select
                    name="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona sexo</option>
                    <option value="M">Hombre</option>
                    <option value="F">Mujer</option>
                </select>
            </label>
            <label>
                Fecha de Ingreso:
                <input
                    name="fecha_ing"
                    type="date"
                    value={form.fecha_ing}
                    onChange={handleChange}
                    required
                />
            </label>
            <label>
                No. Departamento (entero):
                <input
                    name="num_depto"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="No. Departamento"
                    value={form.num_depto}
                    onChange={handleChange}
                    required
                />
            </label>
            <label>
                Nombre de Departamento:
                <input
                    name="nom_depto"
                    type="text"
                    placeholder="Nombre de Departamento"
                    value={form.nom_depto}
                    onChange={handleChange}
                    required
                />
            </label>
            <label>
                Categoría:
                <input
                    name="categoria"
                    type="text"
                    placeholder="Categoría"
                    value={form.categoria}
                    onChange={handleChange}
                    required
                />
            </label>
            <label>
                Puesto:
                <input
                    name="puesto"
                    type="text"
                    placeholder="Puesto"
                    value={form.puesto}
                    onChange={handleChange}
                    required
                />
            </label>
            <label>
                Sindicato:
                <select
                    name="sind"
                    value={form.sind}
                    onChange={handleChange}
                    required
                >
                    <option value="">¿Sindicalizado?</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                </select>
            </label>
            <label>
                Confianza:
                <select
                    name="conf"
                    value={form.conf}
                    onChange={handleChange}
                    required
                >
                    <option value="">¿Confianza?</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                </select>
            </label>
            <label>
                Nómina:
                <input
                    name="nomina"
                    type="text"
                    placeholder="Nómina"
                    value={form.nomina}
                    onChange={handleChange}
                />
            </label>
            <label>
                Vencimiento de Contrato:
                <input
                    name="vencimiento_contrato"
                    type="date"
                    value={form.vencimiento_contrato}
                    onChange={handleChange}
                    required
                />
            </label>
            <button type="submit">Registrar</button>
        </form>
    );
}

export default RegistrarEmpleado;