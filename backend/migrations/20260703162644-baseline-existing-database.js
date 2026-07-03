"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    // Baseline: las tablas actuales ya existen en la base de datos.
    // Esta migracion solo marca el punto inicial para cambios futuros.
  },

  async down() {
    // No se revierte nada para evitar borrar tablas o datos existentes.
  },
};
