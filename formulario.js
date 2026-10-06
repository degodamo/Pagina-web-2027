"use strict";

/* ========== CONTROLADOR REGISTRO Y COTIZACIÓN ========== */
(function () {
    const modal = document.getElementById("modalCotizacion");
    const form = document.getElementById("formCotizacion");
    const btnCerrar = document.getElementById("cerrarCotizacion");
    const exitoBox = document.getElementById("cotizacionExito");
    const btnVolver = document.getElementById("btnVolverTienda");

    /* API Global para desplegar este modal desde cualquier boton de la tienda */
    window.AbrirFormularioCotizacion = function (mensajePredefinido = "") {
        if (!modal) return;
        
        form.reset();
        limpiarErrores();
        
        if (mensajePredefinido) {
            document.getElementById("cotMensaje").value = mensajePredefinido;
        }

        form.hidden = false;
        exitoBox.hidden = true;
        modal.hidden = false;
    };

    window.CerrarFormularioCotizacion = function () {
        if (modal) modal.hidden = true;
    };

    function limpiarErrores() {
        form.querySelectorAll("[data-error]").forEach((el) => {
            el.textContent = "";
        });
    }

    function validarCotizacion(f) {
        const errores = {};

        if (f.nombre.value.trim().length < 3) {
            errores.nombre = "Ingresa tu nombre completo.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.value.trim())) {
            errores.correo = "Ingresa un correo electrónico válido.";
        }
        if (!/^\+?[0-9\s]{8,15}$/.test(f.telefono.value.trim())) {
            errores.telefono = "Ingresa un número de contacto válido.";
        }

        limpiarErrores();

        Object.keys(errores).forEach((key) => {
            const el = form.querySelector(`[data-error="${key}"]`);
            if (el) el.textContent = errores[key];
        });

        return Object.keys(errores).length === 0;
    }

    /* Event Listeners */
    if (btnCerrar) btnCerrar.addEventListener("click", window.CerrarFormularioCotizacion);

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!validarCotizacion(e.target)) return;

            // Transición a estado exitoso
            form.hidden = true;
            exitoBox.hidden = false;
        });
    }

    if (btnVolver) {
        btnVolver.addEventListener("click", window.CerrarFormularioCotizacion);
    }
})();