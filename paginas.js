"use strict";

const menu = document.getElementById("menu");
const btnMenu = document.getElementById("btnMenu");

if (menu && btnMenu) {
    btnMenu.addEventListener("click", () => {
        const abierto = menu.classList.toggle("abierto");
        btnMenu.setAttribute("aria-expanded", String(abierto));
    });

    menu.addEventListener("click", (event) => {
        if (!event.target.closest("a")) return;
        menu.classList.remove("abierto");
        btnMenu.setAttribute("aria-expanded", "false");
    });
}

const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();

const formulario = document.getElementById("formContactoPagina");
if (formulario) {
    formulario.addEventListener("submit", (event) => {
        event.preventDefault();
        document.getElementById("estadoContactoPagina").textContent =
            "Este formulario es una demostración y no envía datos. Escríbenos por WhatsApp para recibir atención.";
        formulario.reset();
    });
}