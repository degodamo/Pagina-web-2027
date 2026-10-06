"use strict";

/* ---------- Datos ---------- */
const PRODUCTOS = [
    { id: 1, nombre: "PlayStation 5", cat: "consolas", precio: 2299, desc: "Consola con SSD ultrarrápido y control DualSense.", imagen: "fotos/Immagine_Playstation_5.jpg", alt: "Consola PlayStation 5 con control inalámbrico DualSense" },
    { id: 2, nombre: "Laptop gamer 15,6\"", cat: "laptops", precio: 4599, desc: "Procesador de 8 núcleos, 16 GB de RAM y gráficos dedicados.", imagen: "fotos/istockphoto-505227671-612x612.jpg", alt: "Laptop gamer negra con teclado iluminado" },
    { id: 3, nombre: "Memoria RAM 16 GB", cat: "componentes", precio: 289, desc: "Módulo DDR5 de alto rendimiento para tu equipo.", imagen: "fotos/ram.jpg", alt: "Módulo de memoria RAM DDR5 RGB de 16 GB" },
    { id: 4, nombre: "SSD NVMe 1 TB", cat: "componentes", precio: 349, desc: "Almacenamiento veloz para juegos y trabajo pesado." },
    { id: 5, nombre: "Control inalámbrico", cat: "accesorios", precio: 299, desc: "Compatible con PlayStation 5, con vibración háptica." },
    { id: 6, nombre: "Monitor 27\" 165 Hz", cat: "accesorios", precio: 899, desc: "Pantalla fluida con baja latencia para jugar." }
];

const $ = (id) => document.getElementById(id);
const soles = (n) => "S/ " + n.toLocaleString("es-PE");

let categoria = "todos";
let texto = "";
let carrito = [];

/* ---------- Almacenamiento seguro ---------- */
try { carrito = JSON.parse(localStorage.getItem("carrito")) || []; } catch (e) { carrito = []; }
const guardar = () => { try { localStorage.setItem("carrito", JSON.stringify(carrito)); } catch (e) { /* sin almacenamiento */ } };

/* ---------- Catálogo ---------- */
function pintarProductos() {
    const q = texto.trim().toLowerCase();
    const lista = PRODUCTOS.filter((p) =>
        (categoria === "todos" || p.cat === categoria) &&
        (p.nombre.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
    );
    $("listaProductos").innerHTML = lista.length
        ? lista.map((p) => `
            <article class="producto" data-cat="${p.cat}">
                ${p.imagen ? `<img class="producto__imagen" src="${p.imagen}" alt="${p.alt}" loading="lazy">` : ""}
                <div class="producto__marca">${p.cat}</div>
                <div class="producto__cuerpo">
                    <h3>${p.nombre}</h3>
                    <p>${p.desc}</p>
                    <span class="precio">${soles(p.precio)}</span>
                    <button class="boton" data-agregar="${p.id}">Agregar al carrito</button>
                </div>
            </article>`).join("")
        : '<p class="vacio">No encontramos productos con esa búsqueda.</p>';
}

function elegirCategoria(cat) {
    categoria = cat;
    document.querySelectorAll(".filtro").forEach((b) => b.classList.toggle("activo", b.dataset.cat === cat));
    pintarProductos();
}

$("filtros").addEventListener("click", (e) => {
    const b = e.target.closest(".filtro");
    if (b) elegirCategoria(b.dataset.cat);
});
$("buscar").addEventListener("input", (e) => { texto = e.target.value; pintarProductos(); });
document.querySelectorAll(".submenu [data-cat]").forEach((a) =>
    a.addEventListener("click", () => { elegirCategoria(a.dataset.cat); cerrarMenu(); })
);

/* ---------- Carrito ---------- */
function pintarCarrito() {
    const total = carrito.reduce((s, i) => s + i.precio * i.cant, 0);
    $("contador").textContent = carrito.reduce((s, i) => s + i.cant, 0);
    $("carritoTotal").textContent = soles(total);
    $("solicitarCotizacion").disabled = carrito.length === 0;
    $("carritoLista").innerHTML = carrito.length
        ? carrito.map((i) => `
            <li>
                <strong>${i.nombre}</strong>
                <span>${soles(i.precio)} c/u</span>
                <div class="cantidad">
                    <button data-menos="${i.id}" aria-label="Quitar uno">−</button>
                    <span>${i.cant}</span>
                    <button data-mas="${i.id}" aria-label="Agregar uno">+</button>
                </div>
            </li>`).join("")
        : "<li>Tu carrito está vacío.</li>";
    guardar();
}

function pintarCheckout() {
    const lista = $("checkoutLista");
    lista.replaceChildren();

    carrito.forEach((item) => {
        const fila = document.createElement("li");
        const nombre = document.createElement("strong");
        const subtotal = document.createElement("span");
        nombre.textContent = item.nombre;
        subtotal.textContent = `${item.cant} x ${soles(item.precio)} = ${soles(item.precio * item.cant)}`;
        fila.append(nombre, subtotal);
        lista.append(fila);
    });

    const total = carrito.reduce((suma, item) => suma + item.precio * item.cant, 0);
    $("checkoutTotal").textContent = soles(total);
}

function cambiarCantidad(id, delta) {
    const item = carrito.find((i) => i.id === id);
    if (!item) return;
    item.cant += delta;
    carrito = carrito.filter((i) => i.cant > 0);
    pintarCarrito();
}

$("listaProductos").addEventListener("click", (e) => {
    const b = e.target.closest("[data-agregar]");
    if (!b) return;
    const id = Number(b.dataset.agregar);
    const existente = carrito.find((i) => i.id === id);
    if (existente) existente.cant++;
    else {
        const p = PRODUCTOS.find((x) => x.id === id);
        carrito.push({ id: p.id, nombre: p.nombre, precio: p.precio, cant: 1 });
    }
    pintarCarrito();
    abrirCarrito();
});

$("carritoLista").addEventListener("click", (e) => {
    const mas = e.target.closest("[data-mas]");
    const menos = e.target.closest("[data-menos]");
    if (mas) cambiarCantidad(Number(mas.dataset.mas), 1);
    if (menos) cambiarCantidad(Number(menos.dataset.menos), -1);
});
$("vaciar").addEventListener("click", () => { carrito = []; pintarCarrito(); });

$("solicitarCotizacion").addEventListener("click", () => {
    if (!carrito.length) return;
    pintarCheckout();
    $("formCheckout").reset();
    $("formCheckout").hidden = false;
    $("checkoutGrid").hidden = false;
    $("mensajeExito").hidden = true;
    $("formCheckout").querySelectorAll("[data-error]").forEach((el) => { el.textContent = ""; });
    $("seccionCheckout").hidden = false;
    cerrarCarrito();
    $("seccionCheckout").scrollIntoView({ behavior: "smooth" });
});

$("formCheckout").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const datos = new FormData(form);
    const errores = {};
    const nombre = String(datos.get("nombre")).trim();
    const correo = String(datos.get("correo")).trim();
    const telefono = String(datos.get("telefono")).trim();
    const ciudad = String(datos.get("ciudad")).trim();
    const direccion = String(datos.get("direccion")).trim();

    if (nombre.length < 3) errores.nombre = "Ingresa tu nombre completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.correo = "Ingresa un correo válido.";
    if (!/^\+?[0-9\s()-]{9,18}$/.test(telefono)) errores.telefono = "Ingresa un teléfono válido.";
    if (!ciudad) errores.ciudad = "Selecciona una ciudad.";
    if (direccion.length < 5) errores.direccion = "Ingresa una dirección válida.";

    form.querySelectorAll("[data-error]").forEach((el) => {
        el.textContent = errores[el.dataset.error] || "";
    });
    if (Object.keys(errores).length || !carrito.length) return;

    const lineas = carrito.map((item) => `${item.nombre} x${item.cant}`).join(", ");
    const total = carrito.reduce((suma, item) => suma + item.precio * item.cant, 0);
    $("detallePedidoExito").textContent = `${nombre}, cotización para ${lineas}. Total estimado: ${soles(total)}. Entrega en ${ciudad}. Preferencia de pago: ${datos.get("metodoPago")}.`;
    $("checkoutGrid").hidden = true;
    $("mensajeExito").hidden = false;
});

$("btnCancelarCheckout").addEventListener("click", () => {
    $("seccionCheckout").hidden = true;
    $("productos").scrollIntoView({ behavior: "smooth" });
});

$("btnVolverInicio").addEventListener("click", () => {
    $("seccionCheckout").hidden = true;
    $("checkoutGrid").hidden = false;
    $("formCheckout").hidden = false;
    $("mensajeExito").hidden = true;
    $("productos").scrollIntoView({ behavior: "smooth" });
});

function abrirCarrito() {
    $("carrito").classList.add("abierto");
    $("carrito").setAttribute("aria-hidden", "false");
    $("velo").hidden = false;
}
function cerrarCarrito() {
    $("carrito").classList.remove("abierto");
    $("carrito").setAttribute("aria-hidden", "true");
    $("velo").hidden = true;
}
$("abrirCarrito").addEventListener("click", abrirCarrito);
$("cerrarCarrito").addEventListener("click", cerrarCarrito);
$("velo").addEventListener("click", cerrarCarrito);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarCarrito(); });

/* ---------- Menú móvil ---------- */
function cerrarMenu() {
    $("menu").classList.remove("abierto");
    $("btnMenu").setAttribute("aria-expanded", "false");
}
$("btnMenu").addEventListener("click", () => {
    const abierto = $("menu").classList.toggle("abierto");
    $("btnMenu").setAttribute("aria-expanded", String(abierto));
});
$("menu").addEventListener("click", (e) => { if (e.target.closest("a")) cerrarMenu(); });

/* ---------- Sombra de la cabecera al hacer scroll ---------- */
const cabecera = document.querySelector(".cabecera");
window.addEventListener("scroll", () => cabecera.classList.toggle("sombra", window.scrollY > 10), { passive: true });

/* ---------- Formulario de contacto ---------- */
$("formContacto").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const errores = {};
    if (f.nombre.value.trim().length < 2) errores.nombre = "Escribe tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.value.trim())) errores.correo = "Escribe un correo válido.";
    if (f.mensaje.value.trim().length < 10) errores.mensaje = "El mensaje debe tener al menos 10 caracteres.";

    document.querySelectorAll("[data-error]").forEach((el) => { el.textContent = errores[el.dataset.error] || ""; });
    if (Object.keys(errores).length) { $("estadoForm").textContent = ""; return; }

    // Aquí iría el envío real (por ejemplo, fetch a tu servidor).
    $("estadoForm").textContent = "¡Gracias! Recibimos tu mensaje y te responderemos pronto.";
    f.reset();
});

/* ---------- Inicio ---------- */
$("anio").textContent = new Date().getFullYear();
pintarProductos();
pintarCarrito();
/* =========================================
   CHAT BOX - TECHSTORE
   ========================================= */

const btnChat = document.getElementById("btnChat");
const chatBox = document.getElementById("chatBox");
const cerrarChat = document.getElementById("cerrarChat");
const chatMensajes = document.getElementById("chatMensajes");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");


/* ABRIR CHAT */

btnChat.addEventListener("click", () => {
    chatBox.classList.add("abierto");
    chatBox.setAttribute("aria-hidden", "false");

    chatInput.focus();
});


/* CERRAR CHAT */

cerrarChat.addEventListener("click", () => {
    chatBox.classList.remove("abierto");
    chatBox.setAttribute("aria-hidden", "true");
});


/* =========================================
   50 PREGUNTAS Y RESPUESTAS
   ========================================= */

const respuestasChat = [

    {
        palabras: ["productos", "venden", "catalogo", "catálogo"],
        respuesta: "🛒 En TechStore vendemos consolas, laptops, componentes y accesorios tecnológicos."
    },

    {
        palabras: ["ubicacion", "ubicación", "donde", "dónde"],
        respuesta: "📍 Tenemos presencia en Lima, Chiclayo, Tarapoto, Cajamarca y Huancayo."
    },

    {
        palabras: ["envio", "envíos", "envíos", "envio"],
        respuesta: "🚚 Sí. Realizamos envíos a diferentes partes del Perú."
    },

    {
        palabras: ["costo envio", "precio envio", "cuanto cuesta envio"],
        respuesta: "💰 El costo del envío puede variar según la ciudad y el pedido. Contáctanos para conocer el costo exacto."
    },

    {
        palabras: ["demora", "tarda", "tiempo envio"],
        respuesta: "⏱️ El tiempo de entrega depende de la ciudad de destino y del servicio de transporte."
    },

    {
        palabras: ["pago", "pagos", "metodos", "métodos"],
        respuesta: "💳 Para conocer los métodos de pago disponibles, comunícate con nuestro equipo de atención."
    },

    {
        palabras: ["yape"],
        respuesta: "📱 Si deseas pagar mediante Yape, consulta previamente con nuestro equipo para confirmar los datos de pago."
    },

    {
        palabras: ["plin"],
        respuesta: "📱 Consulta con nuestro equipo si deseas realizar tu pago mediante Plin."
    },

    {
        palabras: ["tarjeta", "tarjetas"],
        respuesta: "💳 Consulta con nuestro equipo para confirmar las tarjetas y medios de pago disponibles."
    },

    {
        palabras: ["contra entrega"],
        respuesta: "📦 La disponibilidad del pago contra entrega depende de la zona y del pedido."
    },

    {
        palabras: ["garantia", "garantía"],
        respuesta: "🛡️ Nuestros productos cuentan con una garantía de hasta 12 meses, según las condiciones correspondientes."
    },

    {
        palabras: ["cuanto dura garantia", "duracion garantia"],
        respuesta: "🛡️ La garantía indicada para nuestros productos es de hasta 12 meses."
    },

    {
        palabras: ["hacer valida garantia", "validar garantia"],
        respuesta: "🔧 Para hacer válida la garantía, comunícate con nuestro equipo indicando tu pedido y el problema presentado."
    },

    {
        palabras: ["playstation", "ps5", "ps 5"],
        respuesta: "🎮 Sí, tenemos PlayStation 5. Puedes revisar el catálogo para consultar disponibilidad y precio."
    },

    {
        palabras: ["precio playstation", "cuesta playstation"],
        respuesta: "🎮 La PlayStation 5 de nuestro catálogo aparece con un precio de S/ 2,299."
    },

    {
        palabras: ["laptop", "laptops"],
        respuesta: "💻 Sí, contamos con laptops gamer."
    },

    {
        palabras: ["precio laptop", "cuesta laptop"],
        respuesta: "💻 La laptop gamer de nuestro catálogo aparece con un precio de S/ 4,599."
    },

    {
        palabras: ["ram", "memoria ram"],
        respuesta: "🧠 Sí, contamos con memoria RAM de 16 GB."
    },

    {
        palabras: ["precio ram", "cuesta ram"],
        respuesta: "🧠 La memoria RAM de 16 GB aparece en nuestro catálogo con un precio de S/ 289."
    },

    {
        palabras: ["ssd", "nvme"],
        respuesta: "💾 Sí, contamos con SSD NVMe de 1 TB."
    },

    {
        palabras: ["precio ssd", "cuesta ssd"],
        respuesta: "💾 El SSD NVMe de 1 TB aparece en nuestro catálogo con un precio de S/ 349."
    },

    {
        palabras: ["control", "controles"],
        respuesta: "🎮 Sí, tenemos controles inalámbricos."
    },

    {
        palabras: ["precio control", "cuesta control"],
        respuesta: "🎮 El control inalámbrico aparece en nuestro catálogo con un precio de S/ 299."
    },

    {
        palabras: ["monitor", "monitores"],
        respuesta: "🖥️ Sí, tenemos monitores gamer."
    },

    {
        palabras: ["frecuencia monitor", "hz", "165"],
        respuesta: "🖥️ Nuestro monitor de 27 pulgadas cuenta con una frecuencia de actualización de 165 Hz."
    },

    {
        palabras: ["varios productos", "cantidad", "muchos productos"],
        respuesta: "🛒 Sí, puedes agregar varios productos al carrito antes de realizar tu compra."
    },

    {
        palabras: ["descuento", "descuentos"],
        respuesta: "🏷️ Para conocer descuentos o promociones disponibles, consulta con nuestro equipo."
    },

    {
        palabras: ["igv", "impuesto"],
        respuesta: "🧾 Para conocer información tributaria específica de tu compra, consulta con nuestro equipo."
    },

    {
        palabras: ["hacer pedido", "realizar pedido", "pedido"],
        respuesta: "🛍️ Selecciona un producto, agrégalo al carrito y revisa tu pedido."
    },

    {
        palabras: ["cancelar", "cancelacion", "cancelación"],
        respuesta: "❌ Si necesitas cancelar un pedido, comunícate con nuestro equipo lo antes posible."
    },

    {
        palabras: ["cambiar producto", "cambio producto"],
        respuesta: "🔄 Para cambios de productos, comunícate con nuestro equipo y consulta las condiciones aplicables."
    },

    {
        palabras: ["llego dañado", "dañado", "daño", "roto"],
        respuesta: "⚠️ Si recibes un producto dañado, toma fotografías y comunícate con nuestro equipo para recibir asistencia."
    },

    {
        palabras: ["contactar", "contacto"],
        respuesta: "📞 Puedes comunicarte con nosotros mediante los canales de contacto disponibles en nuestra página."
    },

    {
        palabras: ["whatsapp", "wsp"],
        respuesta: "📱 Puedes contactarnos mediante WhatsApp desde el botón correspondiente de nuestra página."
    },

    {
        palabras: ["horario", "atencion", "atención"],
        respuesta: "🕐 Para conocer nuestro horario exacto de atención, revisa la información de contacto de la página."
    },

    {
        palabras: ["tienda fisica", "tienda física", "local"],
        respuesta: "🏪 Contamos con presencia en diferentes ciudades. Consulta con nuestro equipo para conocer el punto de atención disponible."
    },

    {
        palabras: ["lima"],
        respuesta: "📍 Sí, realizamos atención y envíos en Lima."
    },

    {
        palabras: ["chiclayo"],
        respuesta: "📍 Sí, contamos con atención/envíos hacia Chiclayo."
    },

    {
        palabras: ["tarapoto"],
        respuesta: "📍 Sí, contamos con atención/envíos hacia Tarapoto."
    },

    {
        palabras: ["cajamarca"],
        respuesta: "📍 Sí, contamos con atención/envíos hacia Cajamarca."
    },

    {
        palabras: ["huancayo"],
        respuesta: "📍 Sí, contamos con atención/envíos hacia Huancayo."
    },

    {
        palabras: ["nuevos", "nuevo"],
        respuesta: "📦 Los productos mostrados en el catálogo corresponden a los productos ofrecidos por la tienda."
    },

    {
        palabras: ["stock", "disponible", "disponibilidad"],
        respuesta: "📦 La disponibilidad puede cambiar. Revisa el catálogo o consulta directamente antes de realizar tu compra."
    },

    {
        palabras: ["precio producto", "precio"],
        respuesta: "💰 Puedes consultar los precios directamente en las tarjetas de productos del catálogo."
    },

    {
        palabras: ["asesoria laptop", "asesoría laptop", "elegir laptop"],
        respuesta: "💻 Sí. Podemos orientarte según el uso que quieras darle a tu laptop y tu presupuesto."
    },

    {
        palabras: ["ssd recomiendo", "recomiendas ssd"],
        respuesta: "💾 Para almacenamiento rápido, el SSD NVMe de 1 TB de nuestro catálogo es una de las opciones disponibles."
    },

    {
        palabras: ["ram recomiendo", "recomiendas ram"],
        respuesta: "🧠 Tenemos una memoria RAM de 16 GB disponible en nuestro catálogo."
    },

    {
        palabras: ["monitor recomiendo", "recomiendas monitor"],
        respuesta: "🖥️ Si buscas un monitor gamer, contamos con uno de 27 pulgadas y 165 Hz."
    },

    {
        palabras: ["comprar", "como compro", "cómo compro"],
        respuesta: "🛍️ Para comenzar, selecciona el producto que deseas y agrégalo al carrito."
    },

    {
        palabras: ["catalogo", "catálogo", "productos"],
        respuesta: "📋 Puedes consultar todos nuestros productos en la sección de catálogo de la página."
    }

];


/* =========================================
   MOSTRAR MENSAJE
   ========================================= */

function agregarMensaje(texto, tipo) {

    const mensaje = document.createElement("div");

    mensaje.className = `mensaje ${tipo}`;

    mensaje.textContent = texto;

    chatMensajes.appendChild(mensaje);

    chatMensajes.scrollTop = chatMensajes.scrollHeight;
}


/* =========================================
   BUSCAR RESPUESTA
   ========================================= */

function buscarRespuesta(pregunta) {

    const texto = pregunta
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    for (const item of respuestasChat) {

        for (const palabra of item.palabras) {

            if (texto.includes(palabra)) {
                return item.respuesta;
            }

        }

    }

    return "🤔 No estoy seguro de entender tu pregunta. Puedes preguntarme sobre productos, precios, envíos, pagos, garantía o compras.";
}


/* =========================================
   ENVIAR PREGUNTA
   ========================================= */

function enviarPregunta(pregunta) {

    if (!pregunta.trim()) return;

    agregarMensaje(pregunta, "usuario");

    setTimeout(() => {

        const respuesta = buscarRespuesta(pregunta);

        agregarMensaje(respuesta, "bot");

    }, 400);
}


/* =========================================
   FORMULARIO
   ========================================= */

chatForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const pregunta = chatInput.value.trim();

    if (!pregunta) return;

    enviarPregunta(pregunta);

    chatInput.value = "";

});


/* =========================================
   BOTONES DE PREGUNTAS
   ========================================= */

document.querySelectorAll(".preguntas-chat button").forEach((boton) => {

    boton.addEventListener("click", () => {

        const pregunta = boton.dataset.pregunta;

        enviarPregunta(pregunta);

    });

});
/* Activar Modal de Cotización al hacer clic en el botón */
const btnCotizar = document.getElementById("btnAbrirCotizacion");
if (btnCotizar) {
    btnCotizar.addEventListener("click", () => {
        // Abre el formulario cargando automáticamente los items del carrito si los hay
        if (carrito.length > 0) {
            const resumen = carrito.map(i => `- ${i.nombre} (x${i.cant})`).join("\n");
            window.AbrirFormularioCotizacion("Deseo cotizar los siguientes productos:\n" + resumen);
        } else {
            window.AbrirFormularioCotizacion();
        }
    });
}