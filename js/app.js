"use strict";

/* ============================================================
   SWEET DREAMS
   app.js
   ------------------------------------------------------------
   Lógica principal del sitio para clientes.
   JavaScript ES6+
============================================================ */

/* ============================================================
   CONFIGURACIÓN
============================================================ */

const STORAGE_KEYS = Object.freeze({
    PRODUCTOS: "productos",
    CARRITO: "carrito",
    VENTAS: "ventas",
    INVENTARIO: "inventario",
    CATEGORIAS: "categorias"
});

const APP_CONFIG = Object.freeze({

    IVA: 0,

    DESCUENTO_MINIMO: 100000,

    PORCENTAJE_DESCUENTO: 0.10,

    MONEDA: "es-CO"

});


/* ============================================================
   ESTADO DE LA APLICACIÓN
============================================================ */

const AppState = {

    productos: [],

    carrito: [],

    ventas: [],

    inventario: [],

    categorias: [],

    categoriaActual: "todos",

    busqueda: "",

    ordenActual: "default",

    productoSeleccionado: null

};


/* ============================================================
   UTILIDADES
============================================================ */

const Utils = {

    generarID: () =>
        crypto.randomUUID(),

    generarCodigoPedido: () =>
        `PED-${Date.now()}-${Math.floor(Math.random()*9999)}`,

    fechaActual: () => {

        const ahora = new Date();

        return ahora.toLocaleDateString("es-CO");

    },

    horaActual: () => {

        const ahora = new Date();

        return ahora.toLocaleTimeString("es-CO");

    },

    tiempoCompra: () =>
        new Date().toISOString(),

    clonar: objeto =>
        structuredClone(objeto),

    moneda: numero =>
        Number(numero).toLocaleString(
            APP_CONFIG.MONEDA,
            {
                style: "currency",
                currency: "COP"
            }
        ),

    porcentaje(valor, porcentaje){

        return valor * porcentaje;

    },

    mensaje(texto){

        alert(texto);

    }

};


/* ============================================================
   STORAGE
============================================================ */

class StorageManager{

    static obtener(clave){

        try{

            const data = localStorage.getItem(clave);

            return data ? JSON.parse(data) : [];

        }

        catch(error){

            console.error(error);

            return [];

        }

    }

    static guardar(clave,data){

        localStorage.setItem(
            clave,
            JSON.stringify(data)
        );

    }

    static inicializar(){

        Object.values(STORAGE_KEYS).forEach(clave=>{

            if(!localStorage.getItem(clave)){

                localStorage.setItem(
                    clave,
                    JSON.stringify([])
                );

            }

        });

    }

}


/* ============================================================
   CARGAR ESTADO
============================================================ */

const cargarEstado = ()=>{

    AppState.productos =
        StorageManager.obtener(STORAGE_KEYS.PRODUCTOS);

    AppState.carrito =
        StorageManager.obtener(STORAGE_KEYS.CARRITO);

    AppState.ventas =
        StorageManager.obtener(STORAGE_KEYS.VENTAS);

    AppState.inventario =
        StorageManager.obtener(STORAGE_KEYS.INVENTARIO);

    AppState.categorias =
        StorageManager.obtener(STORAGE_KEYS.CATEGORIAS);

};


/* ============================================================
   GUARDAR ESTADO
============================================================ */

const guardarProductos = ()=>{

    StorageManager.guardar(
        STORAGE_KEYS.PRODUCTOS,
        AppState.productos
    );

};

const guardarCarrito = ()=>{

    StorageManager.guardar(
        STORAGE_KEYS.CARRITO,
        AppState.carrito
    );

};

const guardarVentas = ()=>{

    StorageManager.guardar(
        STORAGE_KEYS.VENTAS,
        AppState.ventas
    );

};

const guardarInventario = ()=>{

    StorageManager.guardar(
        STORAGE_KEYS.INVENTARIO,
        AppState.inventario
    );

};

const guardarCategorias = ()=>{

    StorageManager.guardar(
        STORAGE_KEYS.CATEGORIAS,
        AppState.categorias
    );

};


/* ============================================================
   HELPERS
============================================================ */

const obtenerProducto = id =>
    AppState.productos.find(
        producto=>producto.id===id
    );

const obtenerInventario = id =>
    AppState.inventario.find(
        item=>item.id===id
    );

const existeProducto = id =>
    AppState.productos.some(
        producto=>producto.id===id
    );

/* ============================================================
   WEB COMPONENTS
============================================================ */

/**
 * Clase base para todos los Web Components.
 * Proporciona utilidades comunes.
 */
class BaseComponent extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // Se sobreescribe en cada componente.
    }

    actualizar() {
        this.render();
    }

}

/* ============================================================
   APP HEADER
============================================================ */

class AppHeader extends BaseComponent {

    render() {

        this.innerHTML = `

            <header class="app-header">

                <section class="app-header__brand">
                    <a href="#inicio">
                        <h1>Sweet Dreams</h1>
                    </a>
                </section>

                <button
                    class="app-header__toggle"
                    id="menuToggle"
                    aria-label="Abrir menú"
                    aria-expanded="false">
                    ☰
                </button>

                <nav class="app-navigation" id="appNav">
                    <ul>
                        <li><a href="#inicio">Inicio</a></li>
                        <li><a href="#destacados">Destacados</a></li>
                        <li><a href="#catalogo">Catálogo</a></li>
                        <li><a href="#promociones">Promociones</a></li>
                        <li><a href="#novedades">Novedades</a></li>
                        <li><a href="#nosotros">Nosotros</a></li>
                        <li><a href="#contacto">Contacto</a></li>
                    </ul>
                </nav>

                <section class="app-header__actions">
                    <a
                        href="#carrito"
                        class="cart-icon"
                        aria-label="Ver carrito de compras">
                        🛒
                        <span id="cart-count">0</span>
                    </a>
                </section>

            </header>

        `;

        this.registrarEventos();

        this.dispatchEvent(
            new CustomEvent("header-ready", {
                bubbles: true
            })
        );

    }

    registrarEventos() {

        const boton =
            this.querySelector("#menuToggle");

        const nav =
            this.querySelector("#appNav");

        if (!boton || !nav) return;

        boton.addEventListener("click", () => {

            const abierto =
                nav.classList.toggle("is-open");

            boton.setAttribute(
                "aria-expanded",
                abierto
            );

        });

        nav.querySelectorAll("a")
            .forEach(enlace => {

                enlace.addEventListener(
                    "click",
                    () => {

                        nav.classList.remove("is-open");

                        boton.setAttribute(
                            "aria-expanded",
                            false
                        );

                    }
                );

            });

    }

}

customElements.define("app-header", AppHeader);


/* ============================================================
   HERO BANNER
============================================================ */

class HeroBanner extends BaseComponent {

    render() {

        this.innerHTML = `

            <section class="hero">

                <div class="hero__content">

                    <p class="eyebrow">Repostería artesanal</p>

                    <h1>Dulces momentos, hechos a mano</h1>

                    <p class="hero__lead">
                        Tortas, cupcakes y postres fríos preparados
                        cada día con ingredientes reales, listos
                        para llevar a tu mesa.
                    </p>

                    <div class="hero__actions">
                        <a href="#catalogo" class="btn btn--primary">
                            Ver Catálogo
                        </a>
                        <a href="#nosotros" class="btn btn--ghost">
                            Conócenos
                        </a>
                    </div>

                </div>

                <div class="hero__figure">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJVwRedKIFBTvNCb8shgsN3ubT_5tXk7Nzknx4CRYYLDyU1HlfMp1Ho4T3&s=10"
                        alt="Postre destacado de Sweet Dreams"
                        loading="eager">
                </div>

            </section>

        `;

        this.dispatchEvent(
            new CustomEvent("hero-ready", {
                bubbles: true
            })
        );

    }

}

customElements.define("hero-banner", HeroBanner);


/* ============================================================
   FEATURED PRODUCTS
============================================================ */

class FeaturedProducts extends BaseComponent {

    render() {

        const productos =
            StorageManager.obtener(STORAGE_KEYS.PRODUCTOS);

        const ventas =
            StorageManager.obtener(STORAGE_KEYS.VENTAS) || [];

        const cantidadVendidaPorId = {};

        ventas.forEach(venta => {

            (venta.productos || []).forEach(item => {

                cantidadVendidaPorId[item.id] =
                    (cantidadVendidaPorId[item.id] || 0) +
                    item.cantidad;

            });

        });

        const destacados = [...productos]
            .sort((a, b) =>
                (cantidadVendidaPorId[b.id] ?? 0) -
                (cantidadVendidaPorId[a.id] ?? 0)
            )
            .slice(0, 5);

        this.innerHTML = `

            <div class="section-header">
                <h2>Nuestros Destacados</h2>
                <p>
                    Los 5 productos más vendidos
                    por nuestros clientes.
                </p>
            </div>

            <div class="grid grid--5" id="featuredGrid"></div>

        `;

        const contenedor =
            this.querySelector("#featuredGrid");

        if (!destacados.length) {

            contenedor.innerHTML = `
                <p class="catalogo-vacio">
                    Aún no hay productos disponibles.
                </p>
            `;

        } else {

            destacados.forEach(producto => {

                const tarjeta =
                    document.createElement("product-card");

                tarjeta.data = producto;

                contenedor.appendChild(tarjeta);

            });

        }

        this.dispatchEvent(
            new CustomEvent("featured-ready", {
                bubbles: true
            })
        );

    }

}

customElements.define(
    "featured-products",
    FeaturedProducts
);


/* ============================================================
   PROMOTION SECTION
============================================================ */

class PromotionSection extends BaseComponent {

    render() {

        const minimo =
            Utils.moneda(APP_CONFIG.DESCUENTO_MINIMO);

        const porcentaje =
            APP_CONFIG.PORCENTAJE_DESCUENTO * 100;

        this.innerHTML = `

            <div class="promo-banner">

                <p class="eyebrow">Promoción activa</p>

                <h2>
                    ${porcentaje}% de descuento en compras
                    desde ${minimo}
                </h2>

                <p>
                    El descuento se aplica automáticamente
                    en tu carrito, sin necesidad de código.
                </p>

                <a href="#catalogo" class="btn btn--primary">
                    Aprovechar ahora
                </a>

            </div>

        `;

        this.dispatchEvent(
            new CustomEvent("promotion-ready", {
                bubbles: true
            })
        );

    }

}

customElements.define(
    "promotion-section",
    PromotionSection
);


/* ============================================================
   NEWS SECTION
============================================================ */

class NewsSection extends BaseComponent {

    render() {

        const productos =
            StorageManager.obtener(STORAGE_KEYS.PRODUCTOS);

        const novedades = productos.slice(-3);

        this.innerHTML = `

            <div class="section-header">
                <h2>Novedades</h2>
                <p>Lo último que llegó a la vitrina.</p>
            </div>

            <div class="grid grid--3" id="newsGrid"></div>

        `;

        const contenedor =
            this.querySelector("#newsGrid");

        if (!novedades.length) {

            contenedor.innerHTML = `
                <p class="catalogo-vacio">
                    Pronto tendremos novedades para ti.
                </p>
            `;

        } else {

            novedades.forEach(producto => {

                const tarjeta =
                    document.createElement("product-card");

                tarjeta.data = producto;

                contenedor.appendChild(tarjeta);

            });

        }

        this.dispatchEvent(
            new CustomEvent("news-ready", {
                bubbles: true
            })
        );

    }

}

customElements.define(
    "news-section",
    NewsSection
);


/* ============================================================
   SHOPPING CART
============================================================ */

class ShoppingCart extends BaseComponent {

    render() {

        this.innerHTML = `

            <div class="section-header">
                <h2>Tu Carrito</h2>
                <p>Revisa tus productos antes de continuar.</p>
            </div>

            <div class="cart-layout" id="carrito-items"></div>

        `;

        this.dispatchEvent(

            new CustomEvent("cart-ready", {

                bubbles: true

            })

        );

    }

}

customElements.define(
    "shopping-cart",
    ShoppingCart
);


/* ============================================================
   PRODUCT DETAIL
============================================================ */

class ProductDetail extends BaseComponent {

    constructor() {

        super();

        this.producto = null;

    }

    set data(producto) {

        this.producto = producto;

        this.render();

    }

    render() {

        if (!this.producto) return;

        const {

            id,
            nombre,
            categoria,
            precio,
            descripcion,
            ingredientes,
            imagen,
            stock,
            calificacion,
            tamaño

        } = this.producto;

        this.innerHTML = `

            <article class="product-detail">

                <button class="product-detail__cerrar" id="cerrarDetalle">
                    ✕ Cerrar
                </button>

                <div class="product-detail__layout">

                    <img src="${imagen || 'https://placehold.co/600x600/dbe9fa/1d4c8b?text=Sin+imagen'}" alt="${nombre ?? 'Producto'}" onerror="this.onerror=null;this.src='https://placehold.co/600x600/dbe9fa/1d4c8b?text=Sin+imagen';">

                    <div class="product-detail__info">

                        <span class="badge">${categoria}</span>

                        <h2>${nombre}</h2>

                        <p class="product-detail__precio">
                            ${Utils.moneda(precio)}
                        </p>

                        <p>⭐ ${calificacion} · ${tamaño ?? ""}</p>

                        <p>${descripcion ?? ""}</p>

                        <h3>Ingredientes</h3>

                        <ul class="product-detail__ingredientes">
                            ${(ingredientes ?? [])
                                .map(item => `<li>${item}</li>`)
                                .join("")}
                        </ul>

                        <p class="product-detail__stock">
                            ${stock > 0
                                ? `${stock} unidades disponibles`
                                : "Agotado"}
                        </p>

                        <button
                            class="btn btn--primary btn-carrito-detalle"
                            data-id="${id}"
                            ${stock <= 0 ? "disabled" : ""}>
                            Agregar al carrito
                        </button>

                    </div>

                </div>

            </article>

        `;

        this.registrarEventos();

        this.dispatchEvent(

            new CustomEvent("detail-ready", {

                bubbles: true,

                detail: this.producto

            })

        );

    }

    registrarEventos() {

        this.querySelector("#cerrarDetalle")
            ?.addEventListener("click", () => {

                this.producto = null;

                this.innerHTML = "";

            });

        this.querySelector(".btn-carrito-detalle")
            ?.addEventListener("click", evento => {

                this.dispatchEvent(

                    new CustomEvent("agregar-carrito", {

                        bubbles: true,

                        composed: true,

                        detail: {
                            id: evento.target.dataset.id
                        }

                    })

                );

            });

    }

}

customElements.define(
    "product-detail",
    ProductDetail
);


/* ============================================================
   CHECKOUT
============================================================ */

class CheckoutSection extends BaseComponent {

    render() {

        this.dispatchEvent(

            new CustomEvent("checkout-ready", {

                bubbles: true

            })

        );

    }

}

customElements.define(
    "checkout-section",
    CheckoutSection
);


/* ============================================================
   CHECKOUT PAGE
============================================================ */

class CheckoutPage extends BaseComponent {

    connectedCallback() {

        this.render();

        this._onCarritoActualizado = () =>
            this.actualizarResumen();

        document.addEventListener(
            "carrito-actualizado",
            this._onCarritoActualizado
        );

    }

    disconnectedCallback() {

        document.removeEventListener(
            "carrito-actualizado",
            this._onCarritoActualizado
        );

    }

    render() {

        this.innerHTML = `

            <div class="section-header">
                <h2>Finalizar Compra</h2>
                <p>Completa tus datos para confirmar el pedido.</p>
            </div>

            <div class="checkout-layout">

                <form class="checkout-form" id="formCheckout">

                    <label for="checkoutNombre">Nombre completo</label>
                    <input
                        type="text"
                        id="checkoutNombre"
                        name="nombre"
                        placeholder="Tu nombre"
                        required>

                    <label for="checkoutCiudad">Ciudad</label>
                    <input
                        type="text"
                        id="checkoutCiudad"
                        name="ciudad"
                        placeholder="Tu ciudad"
                        required>

                    <label for="checkoutDireccion">Dirección de entrega</label>
                    <input
                        type="text"
                        id="checkoutDireccion"
                        name="direccion"
                        placeholder="Calle, número, referencia"
                        required>

                    <label for="checkoutPago">Método de pago</label>
                    <select id="checkoutPago" name="metodoPago">
                        <option>Tarjeta de crédito</option>
                        <option>Efectivo contraentrega</option>
                        <option>Transferencia</option>
                        <option>PSE</option>
                    </select>

                    <button type="submit">
                        Confirmar Pedido
                    </button>

                </form>

                <aside class="checkout-summary" id="checkoutResumen"></aside>

            </div>

        `;

        this.registrarEventos();

        /**
         * Se difiere a una microtarea porque calcularSubtotal,
         * calcularDescuento y calcularTotal se declaran más abajo
         * en este mismo archivo; para cuando la microtarea se
         * ejecute, el script ya habrá terminado de cargar.
         */
        queueMicrotask(() => this.actualizarResumen());

        this.dispatchEvent(

            new CustomEvent("checkout-page-ready", {

                bubbles: true

            })

        );

    }

    registrarEventos() {

        const formulario =
            this.querySelector("#formCheckout");

        if (!formulario) return;

        formulario.addEventListener("submit", evento => {

            evento.preventDefault();

            if (!AppState.carrito.length) {

                Utils.mensaje(
                    "Tu carrito está vacío."
                );

                return;

            }

            const datos =
                new FormData(formulario);

            finalizarCompra({

                nombre: datos.get("nombre"),

                ciudad: datos.get("ciudad"),

                direccion: datos.get("direccion"),

                metodoPago: datos.get("metodoPago")

            });

            formulario.reset();

        });

    }

    actualizarResumen() {

        const resumen =
            this.querySelector("#checkoutResumen");

        if (!resumen) return;

        if (!AppState.carrito.length) {

            resumen.innerHTML = `
                <h3>Resumen del pedido</h3>
                <p>Tu carrito está vacío.</p>
            `;

            return;

        }

        resumen.innerHTML = `

            <h3>Resumen del pedido</h3>

            <ul>
                ${AppState.carrito.map(item => `
                    <li>
                        ${item.cantidad} × ${item.nombre}
                    </li>
                `).join("")}
            </ul>

            <p>
                Subtotal:
                ${Utils.moneda(calcularSubtotal())}
            </p>

            <p>
                Descuento:
                ${Utils.moneda(calcularDescuento())}
            </p>

            <h2>
                Total:
                ${Utils.moneda(calcularTotal())}
            </h2>

        `;

    }

}

customElements.define(
    "checkout-page",
    CheckoutPage
);


/* ============================================================
   PRODUCT CATALOG
============================================================ */

class ProductCatalog extends BaseComponent {

    render() {

        const categorias =
            StorageManager.obtener(STORAGE_KEYS.CATEGORIAS);

        const opciones = categorias
            .map(categoria =>
                `<option value="${categoria.nombre}">${categoria.nombre}</option>`
            )
            .join("");

        this.innerHTML = `

            <div class="section-header">
                <h2>Nuestro Catálogo</h2>
                <p>Encuentra el postre perfecto para cada ocasión.</p>
            </div>

            <div class="catalog-toolbar">

                <div class="catalog-toolbar__field">
                    <label for="buscar">Buscar</label>
                    <input
                        type="search"
                        id="buscar"
                        placeholder="Nombre, ingrediente...">
                </div>

                <div class="catalog-toolbar__field">
                    <label for="categoria">Categoría</label>
                    <select id="categoria">
                        <option value="todos">Todas</option>
                        ${opciones}
                    </select>
                </div>

                <div class="catalog-toolbar__field">
                    <label for="orden">Ordenar por</label>
                    <select id="orden">
                        <option value="default">Relevancia</option>
                        <option value="precio-asc">Precio: menor a mayor</option>
                        <option value="precio-desc">Precio: mayor a menor</option>
                        <option value="nombre">Nombre A-Z</option>
                        <option value="calificacion">Mejor calificados</option>
                        <option value="stock">Disponibilidad</option>
                    </select>
                </div>

            </div>

            <div class="grid grid--4" id="catalogo-grid"></div>

        `;

        this.dispatchEvent(

            new CustomEvent("catalog-ready", {

                bubbles: true

            })

        );

    }

}

customElements.define(
    "product-catalog",
    ProductCatalog
);


/* ============================================================
   ABOUT US
============================================================ */

class AboutUs extends BaseComponent {

    render() {

        this.innerHTML = `

            <div class="section-header">
                <h2>Sobre Nosotros</h2>
                <p>
                    Repostería casera hecha con ingredientes
                    reales, todos los días.
                </p>
            </div>

            <div class="about-grid">

                <article class="card">
                    <span class="about-grid__icon">🎂</span>
                    <h3>Nuestra historia</h3>
                    <p>
                        Sweet Dreams nació de la idea simple de
                        llevar postres artesanales a cada mesa,
                        preparados en pequeños lotes cada día.
                    </p>
                </article>

                <article class="card">
                    <span class="about-grid__icon">🌾</span>
                    <h3>Ingredientes reales</h3>
                    <p>
                        Sin mezclas industriales ni conservantes
                        artificiales: mantequilla, huevo y fruta
                        de verdad en cada receta.
                    </p>
                </article>

                <article class="card">
                    <span class="about-grid__icon">🚚</span>
                    <h3>Entrega fresca</h3>
                    <p>
                        Preparamos por encargo y entregamos el
                        mismo día para que llegue tan fresco como
                        salió del horno.
                    </p>
                </article>

            </div>

        `;

        this.dispatchEvent(

            new CustomEvent("about-ready", {

                bubbles: true

            })

        );

    }

}

customElements.define(
    "about-us",
    AboutUs
);


/* ============================================================
   CONTACT SECTION
============================================================ */

class ContactSection extends BaseComponent {

    render() {

        this.innerHTML = `

            <section class="contact-section">

                <header class="section-header">
                    <h2>Contáctanos</h2>
                    <p>
                        ¿Tienes dudas o quieres hacer un
                        pedido especial? Escríbenos.
                    </p>
                </header>

                <section class="contact-content">

                    <article class="contact-info">

                        <h3>Información de contacto</h3>

                        <ul>
                            <li>📍 Calle Falsa 123, Bogotá</li>
                            <li>📞 +57 300 000 0000</li>
                            <li>✉️ contacto@sweetdreams.com</li>
                            <li>🕒 Lun - Sáb: 9:00 am - 7:00 pm</li>
                        </ul>

                    </article>

                    <form class="contact-form" id="formContacto">

                        <label for="contactoNombre">Nombre</label>
                        <input
                            type="text"
                            id="contactoNombre"
                            name="nombre"
                            placeholder="Tu nombre"
                            required>

                        <label for="contactoCorreo">Correo</label>
                        <input
                            type="email"
                            id="contactoCorreo"
                            name="correo"
                            placeholder="tucorreo@email.com"
                            required>

                        <label for="contactoMensaje">Mensaje</label>
                        <textarea
                            id="contactoMensaje"
                            name="mensaje"
                            rows="4"
                            placeholder="Escribe tu mensaje..."
                            required></textarea>

                        <button type="submit">
                            Enviar Mensaje
                        </button>

                    </form>

                </section>

            </section>

        `;

        this.registrarEventos();

        this.dispatchEvent(

            new CustomEvent("contact-ready", {

                bubbles: true

            })

        );

    }

    registrarEventos() {

        const formulario =
            this.querySelector("#formContacto");

        if (!formulario) return;

        formulario.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();

                const datos =
                    new FormData(formulario);

                const nombre =
                    datos.get("nombre")?.trim();

                if (!nombre) {

                    Utils.mensaje(
                        "Por favor ingresa tu nombre."
                    );

                    return;

                }

                Utils.mensaje(

                    `Gracias ${nombre}, hemos recibido tu mensaje. Te contactaremos pronto.`

                );

                formulario.reset();

            }
        );

    }

}

customElements.define(
    "contact-section",
    ContactSection
);


/* ============================================================
   APP FOOTER
============================================================ */

class AppFooter extends BaseComponent {

    render() {

        const year =
            new Date().getFullYear();

        this.innerHTML = `

            <div class="app-footer__content">

                <article>
                    <h3>Sweet Dreams</h3>
                    <p>Repostería artesanal, hecha a mano.</p>
                </article>

                <article>
                    <h3>Navegación</h3>
                    <ul>
                        <li><a href="#catalogo">Catálogo</a></li>
                        <li><a href="#promociones">Promociones</a></li>
                        <li><a href="#nosotros">Nosotros</a></li>
                        <li><a href="#contacto">Contacto</a></li>
                    </ul>
                </article>

                <article>
                    <h3>Contacto</h3>
                    <p>contacto@sweetdreams.com</p>
                    <p>+57 300 000 0000</p>
                </article>

            </div>

            <p class="app-footer__admin">
                <button id="btnAdminAccess" class="btn btn--primary">
                    Acceso Administrador
                </button>
            </p>

            <p class="app-footer__copy">
                © ${year} Sweet Dreams. Todos los derechos reservados.
            </p>

        `;

        this.querySelector("#btnAdminAccess")
            .addEventListener("click", () => {

                const usuario = prompt("Usuario:");

                if (usuario === null) return;

                const clave = prompt("Contraseña:");

                if (clave === null) return;

                if (usuario === "123" && clave === "123") {

                    window.location.href = "admin.html";

                } else {

                    alert("Usuario o contraseña incorrectos.");

                }

            });

        this.dispatchEvent(

            new CustomEvent("footer-ready", {

                bubbles: true

            })

        );

    }

}

customElements.define(
    "app-footer",
    AppFooter
);


/* ============================================================
   SINCRONIZACIÓN
============================================================ */

/**
 * Garantiza que cada producto tenga
 * un registro correspondiente dentro
 * del inventario.
 */
const sincronizarInventario = () => {

    if (!AppState.productos.length) return;

    AppState.productos.forEach(producto => {

        const existe = AppState.inventario.find(
            item => item.id === producto.id
        );

        if (existe) return;

        AppState.inventario.push({

            id: producto.id,

            nombre: producto.nombre,

            stock: producto.stock,

            estado: producto.estado

        });

    });

    guardarInventario();

};


/* ============================================================
   RENDER PRINCIPAL
============================================================ */

const renderAplicacion = () => {

    renderCatalogo();

    renderCarrito();

    actualizarContadorCarrito();

    const destacados =
        document.querySelector("#destacados");

    if (destacados) destacados.actualizar();

};


/* ============================================================
   CATÁLOGO
============================================================ */

/**
 * Devuelve una copia del catálogo
 */
const obtenerCatalogo = () => {

    return [...AppState.productos];

};


/* ============================================================
   BÚSQUEDA
============================================================ */

const buscarProductos = (productos) => {

    const texto = AppState.busqueda
        .trim()
        .toLowerCase();

    if (!texto) return productos;

    return productos.filter(producto => {

        return (

            (producto.nombre ?? "")
                .toLowerCase()
                .includes(texto)

            ||

            (producto.descripcion ?? "")
                .toLowerCase()
                .includes(texto)

            ||

            (producto.categoria ?? "")
                .toLowerCase()
                .includes(texto)

            ||

            (producto.ingredientes ?? [])
                .join(" ")
                .toLowerCase()
                .includes(texto)

        );

    });

};


/* ============================================================
   FILTRAR CATEGORÍA
============================================================ */

const filtrarCategoria = (productos) => {

    if (
        AppState.categoriaActual === "todos"
    ) {

        return productos;

    }

    return productos.filter(producto =>

        producto.categoria ===
        AppState.categoriaActual

    );

};


/* ============================================================
   ORDENAMIENTO
============================================================ */

const ordenarProductos = (productos) => {

    const copia = [...productos];

    switch (AppState.ordenActual) {

        case "precio-asc":

            return copia.sort(

                (a, b) => a.precio - b.precio

            );

        case "precio-desc":

            return copia.sort(

                (a, b) => b.precio - a.precio

            );

        case "nombre":

            return copia.sort(

                (a, b) =>

                    a.nombre.localeCompare(
                        b.nombre
                    )

            );

        case "calificacion":

            return copia.sort(

                (a, b) =>

                    b.calificacion -
                    a.calificacion

            );

        case "stock":

            return copia.sort(

                (a, b) =>

                    b.stock -
                    a.stock

            );

        default:

            return copia;

    }

};


/* ============================================================
   CATÁLOGO FILTRADO
============================================================ */

const obtenerCatalogoFiltrado = () => {

    let productos = obtenerCatalogo();

    productos =
        buscarProductos(productos);

    productos =
        filtrarCategoria(productos);

    productos =
        ordenarProductos(productos);

    return productos;

};

/* ============================================================
   PRODUCT CARD
============================================================ */

class ProductCard extends HTMLElement {

    constructor() {
        super();
        this.producto = null;
    }

    set data(producto) {

        this.producto = producto;

        this.render();

    }

    get estadoStock() {

        if (!this.producto) return "";

        if (this.producto.stock <= 0)
            return "Agotado";

        if (this.producto.stock <= 5)
            return "Pocas unidades";

        return "Disponible";

    }

    render() {

        if (!this.producto) return;

        const {

            id,
            nombre,
            precio,
            imagen,
            categoria,
            descripcion,
            stock,
            calificacion

        } = this.producto;

        const imagenSegura =
            imagen ||
            "https://placehold.co/600x600/dbe9fa/1d4c8b?text=Sin+imagen";

        this.innerHTML = `

            <article class="product-card">

                <img
                    src="${imagenSegura}"
                    alt="${nombre ?? "Producto"}"
                    onerror="this.onerror=null;this.src='https://placehold.co/600x600/dbe9fa/1d4c8b?text=Sin+imagen';"
                >

                <h3>${nombre ?? "Producto sin nombre"}</h3>

                <p>${categoria ?? ""}</p>

                <strong>
                    ${Utils.moneda(precio ?? 0)}
                </strong>

                <span>
                    ⭐ ${calificacion}
                </span>

                <small>

                    ${this.estadoStock}

                </small>

                <button
                    class="btn-carrito"
                    data-id="${id}"
                    ${stock <= 0 ? "disabled" : ""}
                >

                    Agregar al carrito

                </button>

            </article>

        `;

        this.registrarEventos();

    }

    registrarEventos() {

        const botonDetalle =
            this.querySelector(".btn-detalle");

        const botonCarrito =
            this.querySelector(".btn-carrito");

        botonDetalle?.addEventListener(
            "click",
            () => {

                this.dispatchEvent(

                    new CustomEvent(

                        "ver-producto",

                        {

                            bubbles: true,

                            composed: true,

                            detail: this.producto

                        }

                    )

                );

            }

        );

        botonCarrito?.addEventListener(
            "click",
            () => {

                this.dispatchEvent(

                    new CustomEvent(

                        "agregar-carrito",

                        {

                            bubbles: true,

                            composed: true,

                            detail: this.producto

                        }

                    )

                );

            }

        );

    }

}

customElements.define(
    "product-card",
    ProductCard
);

/* ============================================================
   RENDER DEL CATÁLOGO
============================================================ */

const obtenerContenedorCatalogo = () => {

    /**
     * OJO: apunta al grid interno (#catalogo-grid) y no
     * a #catalogo directamente, porque #catalogo es el
     * <product-catalog> completo (incluye buscador, filtro
     * y orden). Si se limpiara ese contenedor completo en
     * cada render, la barra de búsqueda desaparecería
     * apenas el usuario escribiera la primera letra.
     */

    return document.querySelector(
        "#catalogo-grid"
    );

};


/* ============================================================
   LIMPIAR CATÁLOGO
============================================================ */

const limpiarCatalogo = () => {

    const contenedor = obtenerContenedorCatalogo();

    if (!contenedor) return;

    contenedor.innerHTML = "";

};


/* ============================================================
   MENSAJE SIN PRODUCTOS
============================================================ */

const renderSinProductos = () => {

    const contenedor = obtenerContenedorCatalogo();

    if (!contenedor) return;

    const mensaje = document.createElement("p");

    mensaje.className = "catalogo-vacio";

    mensaje.textContent =
        "No se encontraron productos.";

    contenedor.appendChild(mensaje);

};


/* ============================================================
   CREAR TARJETA
============================================================ */

const crearTarjetaProducto = producto => {

    const tarjeta =
        document.createElement("product-card");

    tarjeta.data = producto;

    /**
     * OJO: no se agregan listeners aquí. ProductCard ya
     * despacha "agregar-carrito" y "ver-producto" con
     * bubbles+composed, y registrarEventosGlobales() los
     * escucha una sola vez en document. Agregarlos también
     * aquí duplicaba cada acción (p. ej. se agregaban 2
     * unidades al carrito por un solo clic).
     */

    return tarjeta;

};


/* ============================================================
   RENDER CATÁLOGO
============================================================ */

const renderCatalogo = () => {

    const contenedor = obtenerContenedorCatalogo();

    if (!contenedor) return;

    limpiarCatalogo();

    const productos =
        obtenerCatalogoFiltrado();

    if (!productos.length) {

        renderSinProductos();

        return;

    }

    const fragment =
        document.createDocumentFragment();

    productos.forEach(producto => {

        fragment.appendChild(

            crearTarjetaProducto(producto)

        );

    });

    contenedor.appendChild(fragment);

};


/* ============================================================
   ACTUALIZAR CATÁLOGO
============================================================ */

const actualizarCatalogo = () => {

    renderCatalogo();

};


/* ============================================================
   RECARGAR DESPUÉS DE CAMBIOS
============================================================ */

const refrescarCatalogo = () => {

    AppState.productos =
        StorageManager.obtener(
            STORAGE_KEYS.PRODUCTOS
        );

    renderCatalogo();

};

/* ============================================================
   DETALLE DEL PRODUCTO
============================================================ */

const obtenerContenedorDetalle = () =>
    document.querySelector("#producto");

/**
 * Muestra el detalle de un producto.
 */
const mostrarDetalleProducto = (id) => {

    const producto = obtenerProducto(id);

    if (!producto) return;

    AppState.productoSeleccionado = producto;

    const contenedor = obtenerContenedorDetalle();

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const detalle = document.createElement("product-detail");

    detalle.data = producto;

    contenedor.appendChild(detalle);

};


/* ============================================================
   BÚSQUEDA
============================================================ */

const actualizarBusqueda = (texto = "") => {

    AppState.busqueda = texto;

    actualizarCatalogo();

};


/* ============================================================
   CATEGORÍAS
============================================================ */

const actualizarCategoria = (categoria = "todos") => {

    AppState.categoriaActual = categoria;

    actualizarCatalogo();

};


/* ============================================================
   ORDENAMIENTO
============================================================ */

const actualizarOrden = (orden = "default") => {

    AppState.ordenActual = orden;

    actualizarCatalogo();

};


/* ============================================================
   LISTENERS
============================================================ */

const registrarBuscador = () => {

    const input =
        document.querySelector("#buscar");

    if (!input) return;

    input.addEventListener("input", e => {

        actualizarBusqueda(
            e.target.value
        );

    });

};


const registrarCategorias = () => {

    const filtro =
        document.querySelector("#categoria");

    if (!filtro) return;

    filtro.addEventListener("change", e => {

        actualizarCategoria(
            e.target.value
        );

    });

};


const registrarOrdenamiento = () => {

    const orden =
        document.querySelector("#orden");

    if (!orden) return;

    orden.addEventListener("change", e => {

        actualizarOrden(
            e.target.value
        );

    });

};


/* ============================================================
   EVENTOS DEL CATÁLOGO
============================================================ */

const registrarEventosCatalogo = () => {

    registrarBuscador();

    registrarCategorias();

    registrarOrdenamiento();

};


/* ============================================================
   REGISTRO GENERAL
============================================================ */

/**
 * Esta función reemplaza el placeholder
 * creado en la Parte 1.
 */
const registrarEventos = () => {

    registrarEventosCatalogo();

};

/* ============================================================
   CARRITO DE COMPRAS
============================================================ */

/**
 * Busca un producto dentro del carrito.
 */
const obtenerProductoCarrito = (id) => {

    return AppState.carrito.find(
        item => item.id === id
    );

};


/**
 * Cantidad total de productos.
 */
const cantidadProductosCarrito = () => {

    return AppState.carrito.reduce(

        (total, producto) =>

            total + producto.cantidad,

        0

    );

};


/**
 * Verifica si existe stock.
 */
const validarStock = (producto, cantidad = 1) => {

    return producto.stock >= cantidad;

};


/* ============================================================
   AGREGAR AL CARRITO
============================================================ */

const agregarAlCarrito = (id) => {

    const producto = obtenerProducto(id);

    if (!producto) {

        Utils.mensaje(
            "Producto no encontrado."
        );

        return;

    }

    if (!validarStock(producto)) {

        Utils.mensaje(
            "Producto agotado."
        );

        return;

    }

    const existente =
        obtenerProductoCarrito(id);

    if (existente) {

        if (
            existente.cantidad >= producto.stock
        ) {

            Utils.mensaje(
                "No hay más unidades disponibles."
            );

            return;

        }

        existente.cantidad++;

    } else {

        AppState.carrito.push({

            ...Utils.clonar(producto),

            cantidad: 1

        });

    }

    guardarCarrito();

    actualizarContadorCarrito();

    renderCarrito();

    Utils.mensaje(
        "Producto agregado al carrito."
    );

};


/* ============================================================
   OBTENER TOTAL DE UN PRODUCTO
============================================================ */

const totalProducto = producto =>

    producto.precio * producto.cantidad;


/* ============================================================
   EXISTE EN CARRITO
============================================================ */

const existeEnCarrito = id =>

    AppState.carrito.some(

        item => item.id === id

    );

/* ============================================================
   ELIMINAR PRODUCTO DEL CARRITO
============================================================ */

const eliminarDelCarrito = (id) => {

    const index = AppState.carrito.findIndex(
        producto => producto.id === id
    );

    if (index === -1) return;

    AppState.carrito.splice(index, 1);

    guardarCarrito();

    actualizarContadorCarrito();

    renderCarrito();

};


/* ============================================================
   AUMENTAR CANTIDAD
============================================================ */

const aumentarCantidad = (id) => {

    const item = obtenerProductoCarrito(id);

    if (!item) return;

    const producto = obtenerProducto(id);

    if (!producto) return;

    if (item.cantidad >= producto.stock) {

        Utils.mensaje(
            "No hay más unidades disponibles."
        );

        return;

    }

    item.cantidad++;

    guardarCarrito();

    actualizarContadorCarrito();

    renderCarrito();

};


/* ============================================================
   DISMINUIR CANTIDAD
============================================================ */

const disminuirCantidad = (id) => {

    const item = obtenerProductoCarrito(id);

    if (!item) return;

    if (item.cantidad > 1) {

        item.cantidad--;

    } else {

        eliminarDelCarrito(id);

        return;

    }

    guardarCarrito();

    actualizarContadorCarrito();

    renderCarrito();

};


/* ============================================================
   VACIAR CARRITO
============================================================ */

const vaciarCarrito = () => {

    if (!AppState.carrito.length) return;

    const confirmar = confirm(
        "¿Desea vaciar el carrito?"
    );

    if (!confirmar) return;

    AppState.carrito = [];

    guardarCarrito();

    actualizarContadorCarrito();

    renderCarrito();

};


/* ============================================================
   LIMPIAR CARRITO DESPUÉS DE COMPRA
============================================================ */

const limpiarCarrito = () => {

    AppState.carrito = [];

    guardarCarrito();

    actualizarContadorCarrito();

    renderCarrito();

};


/* ============================================================
   VALIDAR CARRITO
============================================================ */

const carritoVacio = () =>

    AppState.carrito.length === 0;


/* ============================================================
   OBTENER PRODUCTOS DEL CARRITO
============================================================ */

const obtenerCarrito = () =>

    [...AppState.carrito];

/* ============================================================
   TOTALES DEL CARRITO
============================================================ */

/**
 * Calcula el subtotal.
 */
const calcularSubtotal = () => {

    return AppState.carrito.reduce(

        (subtotal, producto) => {

            return subtotal + (
                producto.precio * producto.cantidad
            );

        },

        0

    );

};


/**
 * Calcula el descuento.
 */
const calcularDescuento = () => {

    const subtotal = calcularSubtotal();

    if (
        subtotal < APP_CONFIG.DESCUENTO_MINIMO
    ) {

        return 0;

    }

    return subtotal *
        APP_CONFIG.PORCENTAJE_DESCUENTO;

};


/**
 * Calcula el total.
 */
const calcularTotal = () => {

    const subtotal = calcularSubtotal();

    const descuento = calcularDescuento();

    return subtotal - descuento;

};


/* ============================================================
   CONTADOR DEL CARRITO
============================================================ */

const actualizarContadorCarrito = () => {

    const contador =
        document.querySelector("#cart-count");

    if (contador) {

        contador.textContent =
            cantidadProductosCarrito();

    }

    document.dispatchEvent(

        new CustomEvent("carrito-actualizado")

    );

};


/* ============================================================
   CONTENEDOR
============================================================ */

const obtenerContenedorCarrito = () =>

    /**
     * Igual que con el catálogo: se apunta al contenedor
     * interno (#carrito-items) para no borrar el encabezado
     * de la sección en cada actualización del carrito.
     */

    document.querySelector("#carrito-items");


/* ============================================================
   RENDER CARRITO
============================================================ */

const renderCarrito = () => {

    const contenedor =
        obtenerContenedorCarrito();

    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (carritoVacio()) {

        contenedor.innerHTML = `

            <p>
                Tu carrito está vacío.
            </p>

        `;

        return;

    }

    const fragment =
        document.createDocumentFragment();

    AppState.carrito.forEach(producto => {

        const card =
            document.createElement("div");

        card.className =
            "cart-item";

        card.innerHTML = `

            <h4>${producto.nombre}</h4>

            <p>

                ${Utils.moneda(producto.precio)}

            </p>

            <p>

                Cantidad:
                ${producto.cantidad}

            </p>

            <p>

                ${Utils.moneda(
                    totalProducto(producto)
                )}

            </p>

            <button
                class="btn-minus"
                data-id="${producto.id}"
            >
                -
            </button>

            <button
                class="btn-plus"
                data-id="${producto.id}"
            >
                +
            </button>

            <button
                class="btn-delete"
                data-id="${producto.id}"
            >
                Eliminar
            </button>

        `;

        fragment.appendChild(card);

    });

    const resumen =
        document.createElement("section");

    resumen.className =
        "cart-summary";

    resumen.innerHTML = `

        <h3>Resumen</h3>

        <p>

            Subtotal:

            ${Utils.moneda(
                calcularSubtotal()
            )}

        </p>

        <p>

            Descuento:

            ${Utils.moneda(
                calcularDescuento()
            )}

        </p>

        <h2>

            Total:

            ${Utils.moneda(
                calcularTotal()
            )}

        </h2>

        <button id="vaciar-carrito">

            Vaciar carrito

        </button>

        <button id="btn-checkout">

            Continuar con la compra

        </button>

    `;

    fragment.appendChild(resumen);

    contenedor.appendChild(fragment);

    registrarEventosCarrito();

};


/* ============================================================
   CHECKOUT
============================================================ */

/**
 * Valida si el carrito puede procesarse.
 */
const validarCheckout = () => {

    if (carritoVacio()) {

        Utils.mensaje(
            "El carrito está vacío."
        );

        return false;

    }

    for (const item of AppState.carrito) {

        const producto = obtenerProducto(item.id);

        if (!producto) {

            Utils.mensaje(
                `${item.nombre} ya no existe.`
            );

            return false;

        }

        if (item.cantidad > producto.stock) {

            Utils.mensaje(
                `Stock insuficiente para ${producto.nombre}.`
            );

            return false;

        }

    }

    return true;

};


/* ============================================================
   ACTUALIZAR INVENTARIO
============================================================ */

const actualizarInventario = () => {

    AppState.carrito.forEach(item => {

        const producto = obtenerProducto(item.id);

        if (!producto) return;

        producto.stock -= item.cantidad;

        if (producto.stock <= 0) {

            producto.stock = 0;

            producto.estado = "agotado";

        }

        const inventario = obtenerInventario(item.id);

        if (inventario) {

            inventario.stock = producto.stock;

            inventario.estado = producto.estado;

        }

    });

    guardarProductos();

    guardarInventario();

};


/* ============================================================
   CREAR OBJETO VENTA
============================================================ */

const crearVenta = (datosCliente = {}) => {

    return {

        idVenta: Utils.generarID(),

        codigoPedido:
            Utils.generarCodigoPedido(),

        fecha:
            Utils.fechaActual(),

        hora:
            Utils.horaActual(),

        cliente:
            datosCliente.nombre ?? "Cliente",

        ciudad:
            datosCliente.ciudad ?? "",

        productos:
            Utils.clonar(AppState.carrito),

        subtotal:
            calcularSubtotal(),

        descuento:
            calcularDescuento(),

        total:
            calcularTotal(),

        metodoPago:
            datosCliente.metodoPago ??
            "No especificado",

        estado:
            "Completado",

        tiempoCompra:
            Utils.tiempoCompra()

    };

};


/* ============================================================
   REGISTRAR VENTA
============================================================ */

const registrarVenta = (venta) => {

    AppState.ventas.push(venta);

    guardarVentas();

};


/* ============================================================
   FINALIZAR COMPRA
============================================================ */

const finalizarCompra = (datosCliente = {}) => {

    if (!validarCheckout()) return;

    actualizarInventario();

    const venta =
        crearVenta(datosCliente);

    registrarVenta(venta);

    limpiarCarrito();

    refrescarCatalogo();

    Utils.mensaje(

        `Compra realizada correctamente.\n\nPedido: ${venta.codigoPedido}`

    );

};


/* ============================================================
   BOTÓN CHECKOUT
============================================================ */

const registrarBotonCheckout = () => {

    document
        .querySelector("#btn-checkout")
        ?.addEventListener(

            "click",

            () => {

                if (carritoVacio()) {

                    Utils.mensaje(
                        "Tu carrito está vacío."
                    );

                    return;

                }

                document
                    .querySelector("#checkout")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }

        );

};


/* ============================================================
   ACTUALIZACIÓN DE EVENTOS
============================================================ */

/**
 * Se amplía la función creada anteriormente
 * para incluir los eventos del checkout.
 */

const registrarEventosCarrito = () => {

    document
        .querySelectorAll(".btn-plus")
        .forEach(btn => {

            btn.onclick = () =>
                aumentarCantidad(btn.dataset.id);

        });

    document
        .querySelectorAll(".btn-minus")
        .forEach(btn => {

            btn.onclick = () =>
                disminuirCantidad(btn.dataset.id);

        });

    document
        .querySelectorAll(".btn-delete")
        .forEach(btn => {

            btn.onclick = () =>
                eliminarDelCarrito(btn.dataset.id);

        });

    document
        .querySelector("#vaciar-carrito")
        ?.addEventListener(
            "click",
            vaciarCarrito
        );

    registrarBotonCheckout();

};

/* ============================================================
   DATOS INICIALES
============================================================ */

/**
 * Carga los productos iniciales únicamente
 * si LocalStorage aún está vacío.
 */
const inicializarProductos = async () => {

    if (AppState.productos.length) return;

    try {

        const response = await fetch(
            "./data/inventario.json"
        );

        if (!response.ok)
            throw new Error("Inventario no encontrado.");

        const productos = await response.json();

        AppState.productos = [...productos];

        AppState.inventario = productos.map(producto => ({

            id: producto.id,

            nombre: producto.nombre,

            stock: producto.stock,

            estado: producto.estado

        }));

        guardarProductos();

        guardarInventario();

    }

    catch (error) {

        console.error(error);

    }

};


/* ============================================================
   CARGA DE CATEGORÍAS
============================================================ */

/**
 * Carga las categorías iniciales únicamente
 * si LocalStorage aún está vacío. Comparte la
 * misma clave de almacenamiento que el panel admin.
 */
const inicializarCategorias = async () => {

    if (AppState.categorias.length) return;

    try {

        const response = await fetch(
            "./data/categorias.json"
        );

        if (!response.ok) return;

        const categorias =
            await response.json();

        AppState.categorias = [...categorias];

        guardarCategorias();

    }

    catch (error) {

        console.error(error);

    }

};


/* ============================================================
   CARGA DE VENTAS
============================================================ */

const inicializarVentas = async () => {

    if (AppState.ventas.length) return;

    try {

        const response = await fetch(
            "./data/ventas.json"
        );

        if (!response.ok)
            return;

        const ventas =
            await response.json();

        AppState.ventas = [...ventas];

        guardarVentas();

    }

    catch (error) {

        console.error(error);

    }

};


/* ============================================================
   RECARGAR TODOS LOS DATOS
============================================================ */

const recargarDatos = async () => {

    cargarEstado();

    await inicializarCategorias();

    await inicializarProductos();

    await inicializarVentas();

    sincronizarInventario();

};


/* ============================================================
   REINICIAR LA APLICACIÓN
============================================================ */

const reiniciarAplicacion = async () => {

    await recargarDatos();

    renderAplicacion();

};


/* ============================================================
   EXPORTAR DATOS
============================================================ */

const exportarDatos = () => ({

    productos: Utils.clonar(AppState.productos),

    inventario: Utils.clonar(AppState.inventario),

    ventas: Utils.clonar(AppState.ventas),

    carrito: Utils.clonar(AppState.carrito)

});


/* ============================================================
   IMPORTAR DATOS
============================================================ */

const importarDatos = datos => {

    if (!datos) return;

    const {

        productos = [],

        inventario = [],

        ventas = [],

        carrito = []

    } = datos;

    AppState.productos = productos;

    AppState.inventario = inventario;

    AppState.ventas = ventas;

    AppState.carrito = carrito;

    guardarProductos();

    guardarInventario();

    guardarVentas();

    guardarCarrito();

    renderAplicacion();

};

/* ============================================================
   OBSERVADOR DE LOCALSTORAGE
============================================================ */

/**
 * Si otra pestaña modifica el LocalStorage,
 * la aplicación se sincroniza automáticamente.
 */
window.addEventListener("storage", ({ key }) => {

    if (!Object.values(STORAGE_KEYS).includes(key)) return;

    cargarEstado();

    renderAplicacion();

});


/* ============================================================
   REFRESCAR INTERFAZ
============================================================ */

const refrescarAplicacion = () => {

    cargarEstado();

    renderAplicacion();

};


/* ============================================================
   EVENTOS GLOBALES
============================================================ */

const registrarEventosGlobales = () => {

    document.addEventListener(

        "agregar-carrito",

        ({ detail }) => {

            agregarAlCarrito(detail.id);

        }

    );

    document.addEventListener(

        "ver-producto",

        ({ detail }) => {

            mostrarDetalleProducto(detail.id);

        }

    );

};


/* ============================================================
   API PÚBLICA
============================================================ */

const SweetDreamsApp = {

    get productos() {

        return [...AppState.productos];

    },

    get carrito() {

        return [...AppState.carrito];

    },

    get ventas() {

        return [...AppState.ventas];

    },

    refrescar: refrescarAplicacion,

    reiniciar: reiniciarAplicacion,

    exportar: exportarDatos,

    importar: importarDatos

};


/* ============================================================
   OBJETO GLOBAL (SOLO LECTURA)
============================================================ */

Object.freeze(SweetDreamsApp);

window.SweetDreamsApp = SweetDreamsApp;


/* ============================================================
   VERSIÓN DE LOS DATOS
   ------------------------------------------------------------
   Si el localStorage del navegador tiene datos de un esquema
   viejo (por ejemplo, de antes de que el catálogo tuviera
   categoría/descripción/ingredientes), se limpia automáticamente
   para que se vuelva a sembrar desde los JSON actuales. Evita
   tener que borrar caché a mano cada vez que cambian los datos.
============================================================ */

const DATA_VERSION = "3";

const verificarVersionDatos = () => {

    const versionGuardada =
        localStorage.getItem("dataVersion");

    if (versionGuardada === DATA_VERSION) return;

    Object.values(STORAGE_KEYS).forEach(clave => {

        localStorage.removeItem(clave);

    });

    localStorage.setItem("dataVersion", DATA_VERSION);

};


/* ============================================================
   INICIALIZACIÓN PRINCIPAL
============================================================ */

const init = async () => {

    verificarVersionDatos();

    StorageManager.inicializar();

    await recargarDatos();

    registrarEventos();

    registrarEventosGlobales();

    renderAplicacion();

};


/* ============================================================
   DOM READY
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    init

);


/* ============================================================
   FIN DEL ARCHIVO
============================================================ */

console.info(

    "%cSweet Dreams App iniciada correctamente.",

    "color:#8B4513;font-weight:bold;font-size:14px;"

);