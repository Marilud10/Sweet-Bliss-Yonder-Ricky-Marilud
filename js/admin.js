"use strict";

/* ============================================================
   SWEET DREAMS
   admin.js
---------------------------------------------------------------
   Panel administrativo
============================================================ */

/* ============================================================
   CLAVES
============================================================ */

const STORAGE_KEYS = Object.freeze({

    PRODUCTOS: "productos",

    INVENTARIO: "inventario",

    VENTAS: "ventas",

    CATEGORIAS: "categorias",

    CLIENTES: "clientes",

    PROMOCIONES: "promociones"

});


/* ============================================================
   ESTADO
============================================================ */

const AdminState = {

    productos: [],

    inventario: [],

    ventas: [],

    categorias: [],

    clientes: [],

    promociones: [],

    productoSeleccionado: null,

    categoriaSeleccionada: null,

    filtroVenta: "",

    filtroCategoria: "todos"

};


/* ============================================================
   STORAGE
============================================================ */

class StorageManager {

    static get(key){

        try{

            return JSON.parse(
                localStorage.getItem(key)
            ) || [];

        }

        catch(error){

            console.error(error);

            return [];

        }

    }

    static set(key,data){

        localStorage.setItem(

            key,

            JSON.stringify(data)

        );

    }

}


/* ============================================================
   UTILIDADES
============================================================ */

const Utils = {

    id:()=>crypto.randomUUID(),

    moneda:valor=>

        Number(valor).toLocaleString(

            "es-CO",

            {

                style:"currency",

                currency:"COP"

            }

        ),

    fecha:()=>

        new Date().toLocaleDateString(),

    hora:()=>

        new Date().toLocaleTimeString(),

    copiar:objeto=>

        structuredClone(objeto)

};


/* ============================================================
   CARGAR DATOS
============================================================ */

const cargarDatos = ()=>{

    AdminState.productos=

        StorageManager.get(
            STORAGE_KEYS.PRODUCTOS
        );

    AdminState.inventario=

        StorageManager.get(
            STORAGE_KEYS.INVENTARIO
        );

    AdminState.ventas=

        StorageManager.get(
            STORAGE_KEYS.VENTAS
        );

    AdminState.categorias=

        StorageManager.get(
            STORAGE_KEYS.CATEGORIAS
        );

    AdminState.clientes=

        StorageManager.get(
            STORAGE_KEYS.CLIENTES
        );

    AdminState.promociones=

        StorageManager.get(
            STORAGE_KEYS.PROMOCIONES
        );

};


/* ============================================================
   GUARDAR
============================================================ */

const guardarProductos=()=>{

    StorageManager.set(

        STORAGE_KEYS.PRODUCTOS,

        AdminState.productos

    );

};

const guardarInventario=()=>{

    StorageManager.set(

        STORAGE_KEYS.INVENTARIO,

        AdminState.inventario

    );

};

const guardarVentas=()=>{

    StorageManager.set(

        STORAGE_KEYS.VENTAS,

        AdminState.ventas

    );

};

const guardarCategorias=()=>{

    StorageManager.set(

        STORAGE_KEYS.CATEGORIAS,

        AdminState.categorias

    );

};

const guardarClientes=()=>{

    StorageManager.set(

        STORAGE_KEYS.CLIENTES,

        AdminState.clientes

    );

};

const guardarPromociones=()=>{

    StorageManager.set(

        STORAGE_KEYS.PROMOCIONES,

        AdminState.promociones

    );

};


/* ============================================================
   HELPERS
============================================================ */

const obtenerProducto=id=>

    AdminState.productos.find(

        producto=>producto.id===id

    );

const obtenerCategoria=id=>

    AdminState.categorias.find(

        categoria=>categoria.id===id

    );

const obtenerVenta=id=>

    AdminState.ventas.find(

        venta=>venta.idVenta===id

    );

const obtenerCliente=id=>

    AdminState.clientes.find(

        cliente=>cliente.id===id

    );

const obtenerPromocion=id=>

    AdminState.promociones.find(

        promocion=>promocion.id===id

    );


/* ============================================================
   ADMIN MODAL
   ------------------------------------------------------------
   Sistema de modal reutilizable para formularios de crear y
   editar en todas las secciones (productos, categorías,
   pedidos, clientes, promociones).
============================================================ */

const AdminModal = (() => {

    let overlay = null;

    const construir = () => {

        overlay = document.createElement("div");

        overlay.className = "admin-modal";

        overlay.hidden = true;

        overlay.innerHTML = `

            <div class="admin-modal__backdrop" data-cerrar-modal></div>

            <div class="admin-modal__panel" role="dialog" aria-modal="true">

                <header class="admin-modal__header">
                    <h3 id="adminModalTitulo"></h3>
                    <button
                        type="button"
                        class="admin-modal__cerrar"
                        data-cerrar-modal
                        aria-label="Cerrar">
                        ✕
                    </button>
                </header>

                <div id="adminModalCuerpo" class="admin-modal__cuerpo"></div>

            </div>

        `;

        document.body.appendChild(overlay);

        overlay
            .querySelectorAll("[data-cerrar-modal]")
            .forEach(el =>
                el.addEventListener("click", cerrar)
            );

        document.addEventListener("keydown", evento => {

            if (evento.key === "Escape") cerrar();

        });

    };

    const renderCampo = (campo, valores) => {

        const valor =
            valores[campo.name] ??
            campo.valorPorDefecto ??
            "";

        const id = `campo-${campo.name}`;

        if (campo.tipo === "select") {

            const opciones = campo.opciones
                .map(op => {

                    const opValor =
                        typeof op === "object" ? op.valor : op;

                    const opTexto =
                        typeof op === "object" ? op.texto : op;

                    const seleccionado =
                        String(opValor) === String(valor)
                            ? "selected"
                            : "";

                    return `<option value="${opValor}" ${seleccionado}>${opTexto}</option>`;

                })
                .join("");

            return `
                <label for="${id}">${campo.label}</label>
                <select id="${id}" name="${campo.name}" ${campo.requerido ? "required" : ""}>
                    ${opciones}
                </select>
            `;

        }

        if (campo.tipo === "textarea") {

            return `
                <label for="${id}">${campo.label}</label>
                <textarea id="${id}" name="${campo.name}" rows="${campo.filas ?? 3}" ${campo.requerido ? "required" : ""}>${valor}</textarea>
            `;

        }

        return `
            <label for="${id}">${campo.label}</label>
            <input
                type="${campo.tipo ?? "text"}"
                id="${id}"
                name="${campo.name}"
                value="${valor}"
                ${campo.paso ? `step="${campo.paso}"` : ""}
                ${campo.placeholder ? `placeholder="${campo.placeholder}"` : ""}
                ${campo.requerido ? "required" : ""}>
        `;

    };

    /**
     * Modal de formulario "estándar": recibe una lista de
     * campos y arma el formulario automáticamente.
     */
    const abrirFormulario = ({

        titulo,
        campos,
        valores = {},
        textoBoton = "Guardar",
        onGuardar

    }) => {

        if (!overlay) construir();

        overlay.querySelector("#adminModalTitulo")
            .textContent = titulo;

        const cuerpo =
            overlay.querySelector("#adminModalCuerpo");

        cuerpo.innerHTML = `

            <form id="adminModalForm" class="admin-modal__form">

                ${campos.map(campo =>
                    renderCampo(campo, valores)
                ).join("")}

                <button type="submit" class="admin-modal__guardar">
                    ${textoBoton}
                </button>

            </form>

        `;

        const form =
            cuerpo.querySelector("#adminModalForm");

        form.onsubmit = evento => {

            evento.preventDefault();

            const datos = Object.fromEntries(
                new FormData(form).entries()
            );

            onGuardar(datos, cerrar);

        };

        overlay.hidden = false;

        form.querySelector("input, select, textarea")
            ?.focus();

    };

    /**
     * Modal "libre": recibe HTML propio para casos más
     * complejos (p. ej. armar un pedido con varios productos).
     */
    const abrirPersonalizado = ({ titulo, contenidoHtml, montar }) => {

        if (!overlay) construir();

        overlay.querySelector("#adminModalTitulo")
            .textContent = titulo;

        const cuerpo =
            overlay.querySelector("#adminModalCuerpo");

        cuerpo.innerHTML = contenidoHtml;

        montar?.(cuerpo, cerrar);

        overlay.hidden = false;

    };

    const cerrar = () => {

        if (overlay) overlay.hidden = true;

    };

    return {
        abrirFormulario,
        abrirPersonalizado,
        cerrar
    };

})();


/* ============================================================
   WEB COMPONENTS
============================================================ */

class BaseComponent extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {}

    actualizar() {
        this.render();
    }

}

/* ============================================================
   DASHBOARD CARD
============================================================ */

class DashboardCard extends BaseComponent {

    constructor() {

        super();

        this.info = {};

    }

    set data(data) {

        this.info = data;

        this.render();

    }

    render() {

        if (!this.info) return;

        const {

            titulo,

            valor,

            icono

        } = this.info;

        this.innerHTML = `

            <div class="dashboard-card">

                <span>${icono ?? ""}</span>

                <h3>${titulo}</h3>

                <h2>${valor}</h2>

            </div>

        `;

    }

}

customElements.define(
    "dashboard-card",
    DashboardCard
);


/* ============================================================
   PRODUCT ROW
============================================================ */

class ProductRow extends BaseComponent {

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

            stock,

            estado

        } = this.producto;

        this.innerHTML = "";

        const tr = document.createElement("tr");

        tr.innerHTML = `

                <td>${id}</td>

                <td>${nombre}</td>

                <td>${categoria}</td>

                <td>${Utils.moneda(precio)}</td>

                <td>${stock}</td>

                <td>${estado}</td>

                <td>

                    <button class="btn-editar"
                        data-id="${id}">
                        Editar
                    </button>

                    <button class="btn-eliminar"
                        data-id="${id}">
                        Eliminar
                    </button>

                </td>

        `;

        this.appendChild(tr);

    }

}

customElements.define(
    "product-row",
    ProductRow
);


/* ============================================================
   CATEGORY ROW
============================================================ */

class CategoryRow extends BaseComponent {

    constructor() {

        super();

        this.categoria = null;

    }

    set data(categoria) {

        this.categoria = categoria;

        this.render();

    }

    render() {

        if (!this.categoria) return;

        const numeroProductos =
            AdminState.productos.filter(
                producto =>
                    producto.categoria === this.categoria.nombre
            ).length;

        const estado =
            numeroProductos > 0 ? "En uso" : "Sin productos";

        this.innerHTML = "";

        const tr = document.createElement("tr");

        tr.innerHTML = `

                <td>${this.categoria.id}</td>

                <td>${this.categoria.nombre}</td>

                <td>${numeroProductos}</td>

                <td>${estado}</td>

                <td>

                    <button
                        class="btn-edit-category"
                        data-id="${this.categoria.id}">
                        Editar
                    </button>

                    <button
                        class="btn-delete-category"
                        data-id="${this.categoria.id}">
                        Eliminar
                    </button>

                </td>

        `;

        this.appendChild(tr);

    }

}

customElements.define(
    "category-row",
    CategoryRow
);


/* ============================================================
   INVENTORY ROW
============================================================ */

class InventoryRow extends BaseComponent {

    constructor() {

        super();

        this.item = null;

    }

    set data(item) {

        this.item = item;

        this.render();

    }

    render() {

        if (!this.item) return;

        this.innerHTML = "";

        const tr = document.createElement("tr");

        tr.innerHTML = `

                <td>${this.item.nombre}</td>

                <td>${this.item.stock}</td>

                <td>${this.item.estado}</td>

                <td>

                    <button
                        class="btn-stock-plus"
                        data-id="${this.item.id}">
                        +
                    </button>

                    <button
                        class="btn-stock-minus"
                        data-id="${this.item.id}">
                        -
                    </button>

                </td>

        `;

        this.appendChild(tr);

    }

}

customElements.define(
    "inventory-row",
    InventoryRow
);


/* ============================================================
   SALE ROW
============================================================ */

class SaleRow extends BaseComponent {

    constructor() {

        super();

        this.venta = null;

    }

    set data(venta) {

        this.venta = venta;

        this.render();

    }

    render() {

        if (!this.venta) return;

        const {

            codigoPedido,

            cliente,

            fecha,

            total,

            estado

        } = this.venta;

        this.innerHTML = "";

        const tr = document.createElement("tr");

        tr.innerHTML = `

                <td>${codigoPedido}</td>

                <td>${cliente}</td>

                <td>${fecha}</td>

                <td>${Utils.moneda(total)}</td>

                <td>${estado}</td>

                <td>

                    <button
                        class="btn-editar-venta"
                        data-id="${this.venta.idVenta}">
                        Actualizar
                    </button>

                    <button
                        class="btn-delete-sale"
                        data-id="${this.venta.idVenta}">
                        Eliminar
                    </button>

                </td>

        `;

        this.appendChild(tr);

    }

}

customElements.define(
    "sale-row",
    SaleRow
);


/* ============================================================
   CUSTOMER ROW
============================================================ */

class CustomerRow extends BaseComponent {

    constructor() {

        super();

        this.cliente = null;

    }

    set data(cliente) {

        this.cliente = cliente;

        this.render();

    }

    render() {

        if (!this.cliente) return;

        const {

            id,
            nombre,
            correo,
            telefono,
            pedidos

        } = this.cliente;

        this.innerHTML = "";

        const tr = document.createElement("tr");

        tr.innerHTML = `

                <td>${id}</td>

                <td>${nombre}</td>

                <td>${correo}</td>

                <td>${telefono}</td>

                <td>${pedidos ?? 0}</td>

                <td>

                    <button
                        class="btn-editar-cliente"
                        data-id="${id}">
                        Editar
                    </button>

                    <button
                        class="btn-eliminar-cliente"
                        data-id="${id}">
                        Eliminar
                    </button>

                </td>

        `;

        this.appendChild(tr);

    }

}

customElements.define(
    "customer-row",
    CustomerRow
);


/* ============================================================
   PROMOTION ROW
============================================================ */

class PromotionRow extends BaseComponent {

    constructor() {

        super();

        this.promocion = null;

    }

    set data(promocion) {

        this.promocion = promocion;

        this.render();

    }

    render() {

        if (!this.promocion) return;

        const {

            id,
            nombre,
            descuento,
            aplicaA,
            inicio,
            fin,
            estado

        } = this.promocion;

        this.innerHTML = "";

        const tr = document.createElement("tr");

        tr.innerHTML = `

                <td>${id}</td>

                <td>${nombre}</td>

                <td>${descuento}%</td>

                <td>${aplicaA}</td>

                <td>${inicio}</td>

                <td>${fin}</td>

                <td>${estado}</td>

                <td>

                    <button
                        class="btn-editar-promocion"
                        data-id="${id}">
                        Editar
                    </button>

                    <button
                        class="btn-eliminar-promocion"
                        data-id="${id}">
                        Eliminar
                    </button>

                </td>

        `;

        this.appendChild(tr);

    }

}

customElements.define(
    "promotion-row",
    PromotionRow
);

/* ============================================================
   DASHBOARD
============================================================ */

/**
 * Contenedor principal del Dashboard
 */
const obtenerDashboard = () =>
    document.querySelector("#dashboard");


/* ============================================================
   ESTADÍSTICAS
============================================================ */

const totalProductos = () =>
    AdminState.productos.length;


const totalCategorias = () =>
    AdminState.categorias.length;


const totalPedidos = () =>
    AdminState.ventas.length;


const totalIngresos = () =>

    AdminState.ventas.reduce(

        (total, venta) =>

            total + venta.total,

        0

    );


const productosAgotados = () =>

    AdminState.productos.filter(

        producto =>

            producto.stock <= 0

    ).length;


const productosDisponibles = () =>

    AdminState.productos.filter(

        producto =>

            producto.stock > 0

    ).length;


/* ============================================================
   TARJETAS
============================================================ */

const obtenerTarjetasDashboard = () => [

    {

        titulo: "Productos",

        valor: totalProductos(),

        icono: "🍰"

    },

    {

        titulo: "Categorías",

        valor: totalCategorias(),

        icono: "📦"

    },

    {

        titulo: "Disponibles",

        valor: productosDisponibles(),

        icono: "✅"

    },

    {

        titulo: "Agotados",

        valor: productosAgotados(),

        icono: "❌"

    },

    {

        titulo: "Pedidos",

        valor: totalPedidos(),

        icono: "🧾"

    },

    {

        titulo: "Ingresos",

        valor: Utils.moneda(

            totalIngresos()

        ),

        icono: "💰"

    }

];


/* ============================================================
   LIMPIAR DASHBOARD
============================================================ */

const limpiarDashboard = () => {

    const dashboard =
        obtenerDashboard();

    if (!dashboard) return;

    dashboard.innerHTML = "";

};


/* ============================================================
   RENDER DASHBOARD
============================================================ */

const renderDashboard = () => {

    const dashboard =
        obtenerDashboard();

    if (!dashboard) return;

    limpiarDashboard();

    const fragment =
        document.createDocumentFragment();

    obtenerTarjetasDashboard()

        .forEach(card => {

            const componente =

                document.createElement(
                    "dashboard-card"
                );

            componente.data = card;

            fragment.appendChild(
                componente
            );

        });

    dashboard.appendChild(
        fragment
    );

};


/* ============================================================
   ACTUALIZAR DASHBOARD
============================================================ */

const actualizarDashboard = () => {

    cargarDatos();

    renderDashboard();

};


/* ============================================================
   REFRESCAR
============================================================ */

const refrescarDashboard = () => {

    actualizarDashboard();

};

/* ============================================================
   CRUD PRODUCTOS
============================================================ */

/**
 * Devuelve una copia del listado de productos.
 */
const obtenerProductos = () => {

    return [...AdminState.productos];

};


/* ============================================================
   BUSCADOR
============================================================ */

const buscarProductos = (texto = "") => {

    texto = texto.trim().toLowerCase();

    if (!texto) {

        return obtenerProductos();

    }

    return AdminState.productos.filter(producto => {

        return (

            producto.nombre
                .toLowerCase()
                .includes(texto)

            ||

            producto.categoria
                .toLowerCase()
                .includes(texto)

            ||

            producto.descripcion
                .toLowerCase()
                .includes(texto)

        );

    });

};


/* ============================================================
   FILTRAR CATEGORÍA
============================================================ */

const filtrarProductos = (

    categoria = "todos"

) => {

    if (categoria === "todos") {

        return obtenerProductos();

    }

    return AdminState.productos.filter(

        producto =>

            producto.categoria === categoria

    );

};


/* ============================================================
   VALIDACIÓN
============================================================ */

const validarProducto = producto => {

    if (!producto.nombre?.trim()) {

        alert("Ingrese un nombre.");

        return false;

    }

    if (!producto.categoria?.trim()) {

        alert("Seleccione una categoría.");

        return false;

    }

    if (Number(producto.precio) <= 0) {

        alert("Precio inválido.");

        return false;

    }

    if (Number(producto.stock) < 0) {

        alert("Stock inválido.");

        return false;

    }

    return true;

};


/* ============================================================
   CREAR PRODUCTO
============================================================ */

const crearProducto = datos => {

    if (!validarProducto(datos)) return;

    const nuevoProducto = {

        id: Utils.id(),

        nombre: datos.nombre,

        categoria: datos.categoria,

        precio: Number(datos.precio),

        descripcion:
            datos.descripcion,

        ingredientes:
            datos.ingredientes ?? [],

        imagen:
            datos.imagen,

        stock:
            Number(datos.stock),

        estado:

            Number(datos.stock) > 0

                ? "Disponible"

                : "Agotado",

        tamaño:
            datos.tamaño,

        calificacion:
            Number(
                datos.calificacion ?? 5
            ),

        fechaCreacion:
            new Date().toISOString()

    };

    AdminState.productos.push(
        nuevoProducto
    );

    AdminState.inventario.push({

        id: nuevoProducto.id,

        nombre: nuevoProducto.nombre,

        stock: nuevoProducto.stock,

        estado: nuevoProducto.estado

    });

    guardarProductos();

    guardarInventario();

    actualizarDashboard();

    renderTablaProductos();

};

/* ============================================================
   EDITAR PRODUCTO
============================================================ */

const editarProducto = (id, datosActualizados) => {

    const index = AdminState.productos.findIndex(
        producto => producto.id === id
    );

    if (index === -1) return;

    const producto = {
        ...AdminState.productos[index],
        ...datosActualizados
    };

    if (!validarProducto(producto)) return;

    producto.precio = Number(producto.precio);
    producto.stock = Number(producto.stock);

    producto.estado =
        producto.stock > 0
            ? "Disponible"
            : "Agotado";

    AdminState.productos[index] = producto;

    const inventario =
        AdminState.inventario.find(
            item => item.id === id
        );

    if (inventario) {

        inventario.nombre = producto.nombre;
        inventario.stock = producto.stock;
        inventario.estado = producto.estado;

    }

    guardarProductos();

    guardarInventario();

    actualizarDashboard();

    renderTablaProductos();

};


/* ============================================================
   ELIMINAR PRODUCTO
============================================================ */

const eliminarProducto = id => {

    const confirmar = confirm(
        "¿Desea eliminar este producto?"
    );

    if (!confirmar) return;

    AdminState.productos =
        AdminState.productos.filter(
            producto => producto.id !== id
        );

    AdminState.inventario =
        AdminState.inventario.filter(
            producto => producto.id !== id
        );

    guardarProductos();

    guardarInventario();

    actualizarDashboard();

    renderTablaProductos();

};


/* ============================================================
   TABLA PRODUCTOS
============================================================ */

const obtenerTablaProductos = () =>
    document.querySelector("#tabla-productos");


const limpiarTablaProductos = () => {

    const tabla = obtenerTablaProductos();

    if (!tabla) return;

    tabla.innerHTML = "";

};


/* ============================================================
   RENDER TABLA
============================================================ */

const renderTablaProductos = (
    productos = AdminState.productos
) => {

    const tabla = obtenerTablaProductos();

    if (!tabla) return;

    limpiarTablaProductos();

    const fragment =
        document.createDocumentFragment();

    productos.forEach(producto => {

        const fila =
            document.createElement(
                "product-row"
            );

        fila.data = producto;

        fragment.appendChild(fila.firstElementChild);

    });

    tabla.appendChild(fragment);

    registrarEventosProductos();

};


/* ============================================================
   EVENTOS PRODUCTOS
============================================================ */

const abrirModalProducto = (producto = null) => {

    const nombresCategorias =
        AdminState.categorias.map(c => c.nombre);

    AdminModal.abrirFormulario({

        titulo: producto ? "Editar Producto" : "Agregar Producto",

        textoBoton: producto ? "Guardar Cambios" : "Agregar",

        valores: producto
            ? {
                ...producto,
                ingredientes:
                    (producto.ingredientes ?? []).join(", ")
            }
            : {},

        campos: [

            { name: "nombre", label: "Nombre", requerido: true },

            {
                name: "categoria",
                label: "Categoría",
                tipo: "select",
                requerido: true,
                opciones: nombresCategorias.length
                    ? nombresCategorias
                    : [{ valor: "", texto: "Crea una categoría primero" }]
            },

            { name: "precio", label: "Precio", tipo: "number", paso: "100", requerido: true },

            { name: "stock", label: "Stock", tipo: "number", requerido: true },

            { name: "tamaño", label: "Tamaño (ej. Unidad, Porción...)" },

            { name: "descripcion", label: "Descripción", tipo: "textarea" },

            {
                name: "ingredientes",
                label: "Ingredientes (separados por coma)",
                placeholder: "Harina, Mantequilla, Huevo..."
            },

            { name: "imagen", label: "URL de imagen" }

        ],

        onGuardar: (datos, cerrar) => {

            const payload = {

                ...datos,

                ingredientes: datos.ingredientes
                    ? datos.ingredientes
                        .split(",")
                        .map(item => item.trim())
                        .filter(Boolean)
                    : []

            };

            if (producto) {

                editarProducto(producto.id, payload);

            } else {

                crearProducto(payload);

            }

            cerrar();

        }

    });

};


const registrarEventosProductos = () => {

    document
        .querySelectorAll(".btn-editar")
        .forEach(btn => {

            btn.onclick = () => {

                const producto =
                    obtenerProducto(
                        btn.dataset.id
                    );

                if (!producto) return;

                AdminState.productoSeleccionado =
                    producto;

                abrirModalProducto(producto);

            };

        });

    document
        .querySelectorAll(".btn-eliminar")
        .forEach(btn => {

            btn.onclick = () =>

                eliminarProducto(
                    btn.dataset.id
                );

        });

    const botonAgregar =
        document.querySelector("#btnAgregarProducto");

    if (botonAgregar) {

        botonAgregar.onclick = () =>
            abrirModalProducto();

    }

    const botonExportar =
        document.querySelector("#btnExportarProductos");

    if (botonExportar) {

        botonExportar.onclick = () =>
            exportarProductos();

    }

};


/* ============================================================
   EXPORTAR PRODUCTOS
============================================================ */

const exportarProductos = () => {

    const contenido = JSON.stringify(
        AdminState.productos,
        null,
        2
    );

    const blob = new Blob(
        [contenido],
        { type: "application/json" }
    );

    const url =
        URL.createObjectURL(blob);

    const enlace =
        document.createElement("a");

    enlace.href = url;

    enlace.download = "productos.json";

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);

};


/* ============================================================
   BUSCADOR PRODUCTOS
============================================================ */

const registrarBuscadorProductos = () => {

    const buscador =
        document.querySelector("#buscar-producto");

    if (!buscador) return;

    buscador.addEventListener(
        "input",
        e => {

            renderTablaProductos(

                buscarProductos(
                    e.target.value
                )

            );

        }
    );

};


/* ============================================================
   FILTRO CATEGORÍA
============================================================ */

const registrarFiltroCategoria = () => {

    const filtro =
        document.querySelector("#filtro-categoria");

    if (!filtro) return;

    filtro.addEventListener(
        "change",
        e => {

            renderTablaProductos(

                filtrarProductos(
                    e.target.value
                )

            );

        }
    );

};

/* ============================================================
   CRUD CATEGORÍAS
============================================================ */

/**
 * Devuelve todas las categorías.
 */
const obtenerCategorias = () => {

    return [...AdminState.categorias];

};


/* ============================================================
   VALIDAR CATEGORÍA
============================================================ */

const validarCategoria = categoria => {

    if (!categoria.nombre?.trim()) {

        alert("Ingrese el nombre de la categoría.");

        return false;

    }

    return true;

};


/* ============================================================
   CREAR CATEGORÍA
============================================================ */

const crearCategoria = datos => {

    if (!validarCategoria(datos)) return;

    const nuevaCategoria = {

        id: Utils.id(),

        nombre: datos.nombre,

        descripcion:
            datos.descripcion ?? "",

        fechaCreacion:
            new Date().toISOString()

    };

    AdminState.categorias.push(
        nuevaCategoria
    );

    guardarCategorias();

    actualizarDashboard();

    renderTablaCategorias();

};


/* ============================================================
   EDITAR CATEGORÍA
============================================================ */

const editarCategoria = (id, datos) => {

    const categoria =
        obtenerCategoria(id);

    if (!categoria) return;

    if (!validarCategoria(datos)) return;

    const nombreAnterior =
        categoria.nombre;

    categoria.nombre =
        datos.nombre;

    categoria.descripcion =
        datos.descripcion ?? "";

    /**
     * Actualizar todos los productos
     * pertenecientes a esta categoría.
     */

    AdminState.productos.forEach(producto => {

        if (
            producto.categoria === nombreAnterior
        ) {

            producto.categoria =
                categoria.nombre;

        }

    });

    guardarCategorias();

    guardarProductos();

    actualizarDashboard();

    renderTablaCategorias();

    renderTablaProductos();

};


/* ============================================================
   ELIMINAR CATEGORÍA
============================================================ */

const eliminarCategoria = id => {

    const categoria =
        obtenerCategoria(id);

    if (!categoria) return;

    const usada =
        AdminState.productos.some(

            producto =>

                producto.categoria ===
                categoria.nombre

        );

    if (usada) {

        alert(

            "No puede eliminar una categoría utilizada por productos."

        );

        return;

    }

    const confirmar = confirm(

        "¿Desea eliminar la categoría?"

    );

    if (!confirmar) return;

    AdminState.categorias =
        AdminState.categorias.filter(

            categoria =>

                categoria.id !== id

        );

    guardarCategorias();

    actualizarDashboard();

    renderTablaCategorias();

};


/* ============================================================
   TABLA CATEGORÍAS
============================================================ */

const obtenerTablaCategorias = () =>

    document.querySelector(
        "#tabla-categorias"
    );


const limpiarTablaCategorias = () => {

    const tabla =
        obtenerTablaCategorias();

    if (!tabla) return;

    tabla.innerHTML = "";

};


/* ============================================================
   RENDER TABLA
============================================================ */

const renderTablaCategorias = () => {

    const tabla =
        obtenerTablaCategorias();

    if (!tabla) return;

    limpiarTablaCategorias();

    const fragment =
        document.createDocumentFragment();

    AdminState.categorias.forEach(categoria => {

        const fila =
            document.createElement(
                "category-row"
            );

        fila.data = categoria;

        fragment.appendChild(fila.firstElementChild);

    });

    tabla.appendChild(fragment);

    registrarEventosCategorias();

};


/* ============================================================
   EVENTOS
============================================================ */

const abrirModalCategoria = (categoria = null) => {

    AdminModal.abrirFormulario({

        titulo: categoria ? "Editar Categoría" : "Nueva Categoría",

        textoBoton: categoria ? "Guardar Cambios" : "Crear",

        valores: categoria ?? {},

        campos: [

            { name: "nombre", label: "Nombre", requerido: true },

            { name: "descripcion", label: "Descripción", tipo: "textarea" }

        ],

        onGuardar: (datos, cerrar) => {

            if (categoria) {

                editarCategoria(categoria.id, datos);

            } else {

                crearCategoria(datos);

            }

            cerrar();

        }

    });

};


const registrarEventosCategorias = () => {

    document
        .querySelectorAll(".btn-edit-category")
        .forEach(btn => {

            btn.onclick = () => {

                const categoria =
                    obtenerCategoria(
                        btn.dataset.id
                    );

                if (!categoria) return;

                AdminState.categoriaSeleccionada =
                    categoria;

                abrirModalCategoria(categoria);

            };

        });

    document
        .querySelectorAll(".btn-delete-category")
        .forEach(btn => {

            btn.onclick = () =>

                eliminarCategoria(
                    btn.dataset.id
                );

        });

    const botonNueva =
        document.querySelector("#btnNuevaCategoria");

    if (botonNueva) {

        botonNueva.onclick = () =>
            abrirModalCategoria();

    }

};

/* ============================================================
   INVENTARIO
============================================================ */

/**
 * Devuelve una copia del inventario.
 */
const obtenerInventario = () => {

    return [...AdminState.inventario];

};


/* ============================================================
   BUSCAR ITEM INVENTARIO
============================================================ */

const obtenerItemInventario = id =>

    AdminState.inventario.find(

        item => item.id === id

    );


/* ============================================================
   SINCRONIZAR PRODUCTO
============================================================ */

const sincronizarProductoInventario = id => {

    const producto =
        obtenerProducto(id);

    const item =
        obtenerItemInventario(id);

    if (!producto || !item) return;

    producto.stock = item.stock;

    producto.estado = item.estado;

};


/* ============================================================
   AUMENTAR STOCK
============================================================ */

const aumentarStock = (

    id,

    cantidad = 1

) => {

    const item =
        obtenerItemInventario(id);

    if (!item) return;

    item.stock += Number(cantidad);

    item.estado = "Disponible";

    sincronizarProductoInventario(id);

    guardarInventario();

    guardarProductos();

    actualizarDashboard();

    renderTablaInventario();

    renderTablaProductos();

};


/* ============================================================
   REDUCIR STOCK
============================================================ */

const reducirStock = (

    id,

    cantidad = 1

) => {

    const item =
        obtenerItemInventario(id);

    if (!item) return;

    item.stock = Math.max(

        0,

        item.stock - Number(cantidad)

    );

    item.estado =

        item.stock === 0

            ? "Agotado"

            : "Disponible";

    sincronizarProductoInventario(id);

    guardarInventario();

    guardarProductos();

    actualizarDashboard();

    renderTablaInventario();

    renderTablaProductos();

};


/* ============================================================
   MARCAR AGOTADO
============================================================ */

const marcarAgotado = id => {

    const item =
        obtenerItemInventario(id);

    if (!item) return;

    item.stock = 0;

    item.estado = "Agotado";

    sincronizarProductoInventario(id);

    guardarInventario();

    guardarProductos();

    actualizarDashboard();

    renderTablaInventario();

    renderTablaProductos();

};


/* ============================================================
   ACTUALIZAR ESTADO AUTOMÁTICO
============================================================ */

const actualizarEstadoInventario = () => {

    AdminState.inventario.forEach(item => {

        item.estado =

            item.stock <= 0

                ? "Agotado"

                : "Disponible";

        sincronizarProductoInventario(
            item.id
        );

    });

    guardarInventario();

    guardarProductos();

};

/* ============================================================
   TABLA INVENTARIO
============================================================ */

/**
 * Obtiene el contenedor de la tabla
 */
const obtenerTablaInventario = () =>
    document.querySelector("#tabla-inventario");


/* ============================================================
   LIMPIAR TABLA
============================================================ */

const limpiarTablaInventario = () => {

    const tabla = obtenerTablaInventario();

    if (!tabla) return;

    tabla.innerHTML = "";

};


/* ============================================================
   RENDER INVENTARIO
============================================================ */

const renderTablaInventario = (
    inventario = AdminState.inventario
) => {

    const tabla = obtenerTablaInventario();

    if (!tabla) return;

    limpiarTablaInventario();

    const fragment =
        document.createDocumentFragment();

    inventario.forEach(item => {

        const fila =
            document.createElement(
                "inventory-row"
            );

        fila.data = item;

        fragment.appendChild(fila.firstElementChild);

    });

    tabla.appendChild(fragment);

    registrarEventosInventario();

};


/* ============================================================
   BUSCAR INVENTARIO
============================================================ */

const buscarInventario = (
    texto = ""
) => {

    texto = texto.trim().toLowerCase();

    if (!texto)
        return [...AdminState.inventario];

    return AdminState.inventario.filter(item =>

        item.nombre
            .toLowerCase()
            .includes(texto)

    );

};


/* ============================================================
   FILTRAR ESTADO
============================================================ */

const filtrarInventario = (
    estado = "todos"
) => {

    if (estado === "todos")
        return [...AdminState.inventario];

    return AdminState.inventario.filter(

        item =>

            item.estado
                .toLowerCase() ===
            estado.toLowerCase()

    );

};


/* ============================================================
   EVENTOS INVENTARIO
============================================================ */

const registrarEventosInventario = () => {

    document
        .querySelectorAll(".btn-stock-plus")
        .forEach(btn => {

            btn.onclick = () =>

                aumentarStock(
                    btn.dataset.id
                );

        });

    document
        .querySelectorAll(".btn-stock-minus")
        .forEach(btn => {

            btn.onclick = () =>

                reducirStock(
                    btn.dataset.id
                );

        });

};


/* ============================================================
   BUSCADOR INVENTARIO
============================================================ */

const registrarBuscadorInventario = () => {

    const buscador =
        document.querySelector(
            "#buscar-inventario"
        );

    if (!buscador) return;

    buscador.addEventListener(
        "input",
        e => {

            renderTablaInventario(

                buscarInventario(
                    e.target.value
                )

            );

        }
    );

};


/* ============================================================
   FILTRO ESTADO
============================================================ */

const registrarFiltroInventario = () => {

    const filtro =
        document.querySelector(
            "#filtro-inventario"
        );

    if (!filtro) return;

    filtro.addEventListener(
        "change",
        e => {

            renderTablaInventario(

                filtrarInventario(
                    e.target.value
                )

            );

        }
    );

};


/* ============================================================
   ACTUALIZAR INVENTARIO
============================================================ */

const refrescarInventario = () => {

    cargarDatos();

    actualizarEstadoInventario();

    renderTablaInventario();

    actualizarDashboard();

};

/* ============================================================
   VENTAS
============================================================ */

/**
 * Devuelve todas las ventas.
 */
const obtenerVentas = () => {

    return [...AdminState.ventas];

};


/* ============================================================
   TABLA VENTAS
============================================================ */

const obtenerTablaVentas = () =>
    document.querySelector("#tabla-ventas");


const limpiarTablaVentas = () => {

    const tabla = obtenerTablaVentas();

    if (!tabla) return;

    tabla.innerHTML = "";

};


/* ============================================================
   RENDER VENTAS
============================================================ */

const renderTablaVentas = (
    ventas = AdminState.ventas
) => {

    const tabla = obtenerTablaVentas();

    if (!tabla) return;

    limpiarTablaVentas();

    const fragment =
        document.createDocumentFragment();

    ventas.forEach(venta => {

        const fila =
            document.createElement(
                "sale-row"
            );

        fila.data = venta;

        fragment.appendChild(fila.firstElementChild);

    });

    tabla.appendChild(fragment);

    registrarEventosVentas();

};


/* ============================================================
   BUSCAR VENTAS
============================================================ */

const buscarVentas = (texto = "") => {

    texto = texto.trim().toLowerCase();

    if (!texto) {

        return [...AdminState.ventas];

    }

    return AdminState.ventas.filter(venta => {

        return (

            venta.codigoPedido
                .toLowerCase()
                .includes(texto)

            ||

            venta.cliente
                .toLowerCase()
                .includes(texto)

            ||

            venta.ciudad
                .toLowerCase()
                .includes(texto)

        );

    });

};


/* ============================================================
   FILTRAR VENTAS
============================================================ */

const filtrarVentas = (
    estado = "todos"
) => {

    if (estado === "todos") {

        return [...AdminState.ventas];

    }

    return AdminState.ventas.filter(

        venta =>

            venta.estado
                .toLowerCase() ===
            estado.toLowerCase()

    );

};


/* ============================================================
   ELIMINAR VENTA
============================================================ */

const eliminarVenta = id => {

    const confirmar = confirm(
        "¿Eliminar esta venta?"
    );

    if (!confirmar) return;

    AdminState.ventas =
        AdminState.ventas.filter(

            venta =>

                venta.idVenta !== id

        );

    guardarVentas();

    actualizarDashboard();

    renderTablaVentas();

};


/* ============================================================
   EVENTOS
============================================================ */

/* ============================================================
   CREAR PEDIDO MANUAL (desde el panel admin)
============================================================ */

const crearVentaManual = (datosCliente, items) => {

    if (!items.length) {

        alert("Agrega al menos un producto al pedido.");

        return false;

    }

    const subtotal = items.reduce(

        (total, item) =>
            total + item.precio * item.cantidad,

        0

    );

    const venta = {

        idVenta: Utils.id(),

        codigoPedido: `PED-${Date.now()}`,

        fecha: new Date().toLocaleDateString("es-CO"),

        hora: new Date().toLocaleTimeString("es-CO"),

        cliente: datosCliente.cliente || "Cliente",

        ciudad: datosCliente.ciudad || "",

        productos: items,

        subtotal,

        descuento: 0,

        total: subtotal,

        metodoPago:
            datosCliente.metodoPago || "No especificado",

        estado: datosCliente.estado || "Pendiente",

        tiempoCompra: new Date().toISOString()

    };

    AdminState.ventas.push(venta);

    guardarVentas();

    actualizarDashboard();

    renderTablaVentas();

    return true;

};


/* ============================================================
   EDITAR PEDIDO
============================================================ */

const editarVenta = (id, datosActualizados) => {

    const venta = obtenerVenta(id);

    if (!venta) return;

    Object.assign(venta, {

        cliente: datosActualizados.cliente ?? venta.cliente,

        ciudad: datosActualizados.ciudad ?? venta.ciudad,

        metodoPago:
            datosActualizados.metodoPago ?? venta.metodoPago,

        estado: datosActualizados.estado ?? venta.estado

    });

    guardarVentas();

    actualizarDashboard();

    renderTablaVentas();

};


/* ============================================================
   MODAL: ACTUALIZAR PEDIDO
============================================================ */

const abrirModalEditarVenta = venta => {

    AdminModal.abrirFormulario({

        titulo: `Actualizar Pedido ${venta.codigoPedido}`,

        textoBoton: "Guardar Cambios",

        valores: venta,

        campos: [

            { name: "cliente", label: "Cliente", requerido: true },

            { name: "ciudad", label: "Ciudad" },

            {
                name: "metodoPago",
                label: "Método de pago",
                tipo: "select",
                opciones: [
                    "Tarjeta de crédito",
                    "Efectivo contraentrega",
                    "Transferencia",
                    "PSE",
                    "No especificado"
                ]
            },

            {
                name: "estado",
                label: "Estado",
                tipo: "select",
                opciones: [
                    "Pendiente",
                    "Preparando",
                    "Enviado",
                    "Entregado",
                    "Cancelado"
                ]
            }

        ],

        onGuardar: (datos, cerrar) => {

            editarVenta(venta.idVenta, datos);

            cerrar();

        }

    });

};


/* ============================================================
   MODAL: NUEVO PEDIDO
   (formulario libre: cliente + selector de varios productos)
============================================================ */

const abrirModalNuevoPedido = () => {

    if (!AdminState.productos.length) {

        alert("Primero agrega productos al catálogo.");

        return;

    }

    let itemsPedido = [];

    const opcionesProductos = AdminState.productos
        .map(producto =>
            `<option value="${producto.id}">${producto.nombre} — ${Utils.moneda(producto.precio)}</option>`
        )
        .join("");

    AdminModal.abrirPersonalizado({

        titulo: "Nuevo Pedido",

        contenidoHtml: `

            <form id="formNuevoPedido" class="admin-modal__form">

                <label for="pedidoCliente">Cliente</label>
                <input type="text" id="pedidoCliente" name="cliente" required>

                <label for="pedidoCiudad">Ciudad</label>
                <input type="text" id="pedidoCiudad" name="ciudad">

                <label for="pedidoMetodoPago">Método de pago</label>
                <select id="pedidoMetodoPago" name="metodoPago">
                    <option>Tarjeta de crédito</option>
                    <option>Efectivo contraentrega</option>
                    <option>Transferencia</option>
                    <option>PSE</option>
                </select>

                <label for="pedidoEstado">Estado</label>
                <select id="pedidoEstado" name="estado">
                    <option>Pendiente</option>
                    <option>Preparando</option>
                    <option>Enviado</option>
                    <option>Entregado</option>
                    <option>Cancelado</option>
                </select>

                <label for="pedidoProductoSelect">Productos del pedido</label>

                <div class="admin-modal__producto-selector">

                    <select id="pedidoProductoSelect">
                        ${opcionesProductos}
                    </select>

                    <input
                        type="number"
                        id="pedidoProductoCantidad"
                        min="1"
                        value="1">

                    <button type="button" id="btnAgregarItemPedido">
                        Agregar
                    </button>

                </div>

                <ul id="pedidoItemsLista" class="admin-modal__items"></ul>

                <p id="pedidoTotalPreview"><strong>Total: $0</strong></p>

                <button type="submit" class="admin-modal__guardar">
                    Crear Pedido
                </button>

            </form>

        `,

        montar: (cuerpo, cerrar) => {

            const lista =
                cuerpo.querySelector("#pedidoItemsLista");

            const totalPreview =
                cuerpo.querySelector("#pedidoTotalPreview");

            const renderItems = () => {

                lista.innerHTML = itemsPedido.length
                    ? itemsPedido.map((item, index) => `
                        <li>
                            ${item.cantidad} × ${item.nombre}
                            (${Utils.moneda(item.precio * item.cantidad)})
                            <button type="button" data-quitar="${index}">
                                Quitar
                            </button>
                        </li>
                    `).join("")
                    : "<li>Sin productos agregados.</li>";

                const total = itemsPedido.reduce(
                    (suma, item) =>
                        suma + item.precio * item.cantidad,
                    0
                );

                totalPreview.innerHTML =
                    `<strong>Total: ${Utils.moneda(total)}</strong>`;

                lista
                    .querySelectorAll("[data-quitar]")
                    .forEach(btn => {

                        btn.onclick = () => {

                            itemsPedido.splice(
                                Number(btn.dataset.quitar),
                                1
                            );

                            renderItems();

                        };

                    });

            };

            cuerpo
                .querySelector("#btnAgregarItemPedido")
                .onclick = () => {

                    const select = cuerpo.querySelector(
                        "#pedidoProductoSelect"
                    );

                    const cantidadInput = cuerpo.querySelector(
                        "#pedidoProductoCantidad"
                    );

                    const producto = obtenerProducto(
                        select.value
                    );

                    const cantidad =
                        Number(cantidadInput.value) || 1;

                    if (!producto) return;

                    const existente = itemsPedido.find(
                        item => item.id === producto.id
                    );

                    if (existente) {

                        existente.cantidad += cantidad;

                    } else {

                        itemsPedido.push({

                            id: producto.id,

                            nombre: producto.nombre,

                            categoria: producto.categoria,

                            precio: producto.precio,

                            cantidad

                        });

                    }

                    renderItems();

                };

            const form =
                cuerpo.querySelector("#formNuevoPedido");

            form.onsubmit = evento => {

                evento.preventDefault();

                const datos = Object.fromEntries(
                    new FormData(form).entries()
                );

                const creado = crearVentaManual(
                    datos,
                    itemsPedido
                );

                if (creado) cerrar();

            };

            renderItems();

        }

    });

};


const registrarEventosVentas = () => {

    document
        .querySelectorAll(".btn-delete-sale")
        .forEach(btn => {

            btn.onclick = () =>

                eliminarVenta(
                    btn.dataset.id
                );

        });

    document
        .querySelectorAll(".btn-editar-venta")
        .forEach(btn => {

            btn.onclick = () => {

                const venta = obtenerVenta(
                    btn.dataset.id
                );

                if (venta) abrirModalEditarVenta(venta);

            };

        });

    const botonNuevoPedido =
        document.querySelector("#btnNuevoPedido");

    if (botonNuevoPedido) {

        botonNuevoPedido.onclick = () =>
            abrirModalNuevoPedido();

    }

};


/* ============================================================
   BUSCADOR
============================================================ */

const registrarBuscadorVentas = () => {

    const buscador =
        document.querySelector(
            "#buscar-venta"
        );

    if (!buscador) return;

    buscador.addEventListener(
        "input",
        e => {

            renderTablaVentas(

                buscarVentas(
                    e.target.value
                )

            );

        }
    );

};


/* ============================================================
   FILTRO ESTADO
============================================================ */

const registrarFiltroVentas = () => {

    const filtro =
        document.querySelector(
            "#filtro-ventas"
        );

    if (!filtro) return;

    filtro.addEventListener(
        "change",
        e => {

            renderTablaVentas(

                filtrarVentas(
                    e.target.value
                )

            );

        }
    );

};


/* ============================================================
   REFRESCAR
============================================================ */

const refrescarVentas = () => {

    cargarDatos();

    renderTablaVentas();

    actualizarDashboard();

};

/* ============================================================
   CLIENTES
============================================================ */

const validarCliente = cliente => {

    if (!cliente.nombre?.trim()) {

        alert("Ingrese el nombre del cliente.");

        return false;

    }

    if (!cliente.correo?.trim()) {

        alert("Ingrese el correo del cliente.");

        return false;

    }

    return true;

};


const crearCliente = datos => {

    if (!validarCliente(datos)) return;

    const nuevoCliente = {

        id: Utils.id(),

        nombre: datos.nombre,

        correo: datos.correo,

        telefono: datos.telefono ?? "",

        pedidos: 0,

        fechaCreacion: new Date().toISOString()

    };

    AdminState.clientes.push(nuevoCliente);

    guardarClientes();

    renderTablaClientes();

};


const editarCliente = (id, datosActualizados) => {

    const cliente = obtenerCliente(id);

    if (!cliente) return;

    const actualizado = {
        ...cliente,
        ...datosActualizados
    };

    if (!validarCliente(actualizado)) return;

    Object.assign(cliente, actualizado);

    guardarClientes();

    renderTablaClientes();

};


const eliminarCliente = id => {

    const confirmar = confirm(
        "¿Desea eliminar este cliente?"
    );

    if (!confirmar) return;

    AdminState.clientes =
        AdminState.clientes.filter(
            cliente => cliente.id !== id
        );

    guardarClientes();

    renderTablaClientes();

};


const abrirModalCliente = (cliente = null) => {

    AdminModal.abrirFormulario({

        titulo: cliente ? "Editar Cliente" : "Nuevo Cliente",

        textoBoton: cliente ? "Guardar Cambios" : "Crear",

        valores: cliente ?? {},

        campos: [

            { name: "nombre", label: "Nombre", requerido: true },

            { name: "correo", label: "Correo", tipo: "email", requerido: true },

            { name: "telefono", label: "Teléfono" }

        ],

        onGuardar: (datos, cerrar) => {

            if (cliente) {

                editarCliente(cliente.id, datos);

            } else {

                crearCliente(datos);

            }

            cerrar();

        }

    });

};


const obtenerTablaClientes = () =>
    document.querySelector("#tabla-clientes");


const buscarClientes = (texto = "") => {

    texto = texto.trim().toLowerCase();

    if (!texto) return [...AdminState.clientes];

    return AdminState.clientes.filter(cliente =>

        cliente.nombre.toLowerCase().includes(texto) ||
        cliente.correo.toLowerCase().includes(texto)

    );

};


const renderTablaClientes = (
    clientes = AdminState.clientes
) => {

    const tabla = obtenerTablaClientes();

    if (!tabla) return;

    tabla.innerHTML = "";

    const fragment = document.createDocumentFragment();

    if (!clientes.length) {

        const fila = document.createElement("tr");

        fila.innerHTML =
            `<td colspan="6">Aún no hay clientes registrados.</td>`;

        fragment.appendChild(fila);

    } else {

        clientes.forEach(cliente => {

            const fila = document.createElement("customer-row");

            fila.data = cliente;

            fragment.appendChild(fila.firstElementChild);

        });

    }

    tabla.appendChild(fragment);

    registrarEventosClientes();

};


const registrarEventosClientes = () => {

    document
        .querySelectorAll(".btn-editar-cliente")
        .forEach(btn => {

            btn.onclick = () => {

                const cliente = obtenerCliente(btn.dataset.id);

                if (cliente) abrirModalCliente(cliente);

            };

        });

    document
        .querySelectorAll(".btn-eliminar-cliente")
        .forEach(btn => {

            btn.onclick = () =>
                eliminarCliente(btn.dataset.id);

        });

    const botonNuevo =
        document.querySelector("#btnNuevoCliente");

    if (botonNuevo) {

        botonNuevo.onclick = () => abrirModalCliente();

    }

};


const registrarBuscadorClientes = () => {

    const buscador =
        document.querySelector("#customerSearch");

    if (!buscador) return;

    buscador.addEventListener("input", e => {

        renderTablaClientes(
            buscarClientes(e.target.value)
        );

    });

};


/* ============================================================
   PROMOCIONES
============================================================ */

const validarPromocion = promocion => {

    if (!promocion.nombre?.trim()) {

        alert("Ingrese el nombre de la promoción.");

        return false;

    }

    if (
        Number(promocion.descuento) <= 0 ||
        Number(promocion.descuento) > 100
    ) {

        alert("El descuento debe estar entre 1 y 100.");

        return false;

    }

    return true;

};


const crearPromocion = datos => {

    if (!validarPromocion(datos)) return;

    const nuevaPromocion = {

        id: Utils.id(),

        nombre: datos.nombre,

        descuento: Number(datos.descuento),

        aplicaA: datos.aplicaA || "Todos",

        inicio: datos.inicio ?? "",

        fin: datos.fin ?? "",

        estado: datos.estado || "Programada",

        fechaCreacion: new Date().toISOString()

    };

    AdminState.promociones.push(nuevaPromocion);

    guardarPromociones();

    renderTablaPromociones();

};


const editarPromocion = (id, datosActualizados) => {

    const promocion = obtenerPromocion(id);

    if (!promocion) return;

    const actualizado = {
        ...promocion,
        ...datosActualizados,
        descuento: Number(
            datosActualizados.descuento ?? promocion.descuento
        )
    };

    if (!validarPromocion(actualizado)) return;

    Object.assign(promocion, actualizado);

    guardarPromociones();

    renderTablaPromociones();

};


const eliminarPromocion = id => {

    const confirmar = confirm(
        "¿Desea eliminar esta promoción?"
    );

    if (!confirmar) return;

    AdminState.promociones =
        AdminState.promociones.filter(
            promocion => promocion.id !== id
        );

    guardarPromociones();

    renderTablaPromociones();

};


const abrirModalPromocion = (promocion = null) => {

    const nombresCategorias =
        AdminState.categorias.map(c => c.nombre);

    AdminModal.abrirFormulario({

        titulo: promocion ? "Editar Promoción" : "Nueva Promoción",

        textoBoton: promocion ? "Guardar Cambios" : "Crear",

        valores: promocion ?? {},

        campos: [

            { name: "nombre", label: "Nombre", requerido: true },

            { name: "descuento", label: "Descuento (%)", tipo: "number", requerido: true },

            {
                name: "aplicaA",
                label: "Aplica a",
                tipo: "select",
                opciones: ["Todos", ...nombresCategorias]
            },

            { name: "inicio", label: "Fecha de inicio", tipo: "date" },

            { name: "fin", label: "Fecha de fin", tipo: "date" },

            {
                name: "estado",
                label: "Estado",
                tipo: "select",
                opciones: ["Programada", "Activa", "Finalizada"]
            }

        ],

        onGuardar: (datos, cerrar) => {

            if (promocion) {

                editarPromocion(promocion.id, datos);

            } else {

                crearPromocion(datos);

            }

            cerrar();

        }

    });

};


const obtenerTablaPromociones = () =>
    document.querySelector("#tabla-promociones");


const renderTablaPromociones = (
    promociones = AdminState.promociones
) => {

    const tabla = obtenerTablaPromociones();

    if (!tabla) return;

    tabla.innerHTML = "";

    const fragment = document.createDocumentFragment();

    if (!promociones.length) {

        const fila = document.createElement("tr");

        fila.innerHTML =
            `<td colspan="8">Aún no hay promociones creadas.</td>`;

        fragment.appendChild(fila);

    } else {

        promociones.forEach(promocion => {

            const fila = document.createElement("promotion-row");

            fila.data = promocion;

            fragment.appendChild(fila.firstElementChild);

        });

    }

    tabla.appendChild(fragment);

    registrarEventosPromociones();

};


const registrarEventosPromociones = () => {

    document
        .querySelectorAll(".btn-editar-promocion")
        .forEach(btn => {

            btn.onclick = () => {

                const promocion =
                    obtenerPromocion(btn.dataset.id);

                if (promocion) abrirModalPromocion(promocion);

            };

        });

    document
        .querySelectorAll(".btn-eliminar-promocion")
        .forEach(btn => {

            btn.onclick = () =>
                eliminarPromocion(btn.dataset.id);

        });

    const botonNueva =
        document.querySelector("#newPromotionButton");

    if (botonNueva) {

        botonNueva.onclick = () => abrirModalPromocion();

    }

};

/* ============================================================
   ESTADÍSTICAS AVANZADAS
============================================================ */

/**
 * Productos más vendidos.
 */
const productosMasVendidos = () => {

    const ventas = {};

    AdminState.ventas.forEach(venta => {

        venta.productos.forEach(producto => {

            if (!ventas[producto.id]) {

                ventas[producto.id] = {

                    nombre: producto.nombre,

                    cantidad: 0

                };

            }

            ventas[producto.id].cantidad += producto.cantidad;

        });

    });

    return Object.values(ventas)

        .sort((a, b) => b.cantidad - a.cantidad);

};


/**
 * Categorías más vendidas.
 */
const categoriasMasVendidas = () => {

    const categorias = {};

    AdminState.ventas.forEach(venta => {

        venta.productos.forEach(producto => {

            if (!categorias[producto.categoria]) {

                categorias[producto.categoria] = 0;

            }

            categorias[producto.categoria] += producto.cantidad;

        });

    });

    return Object.entries(categorias)

        .map(([nombre, cantidad]) => ({

            nombre,

            cantidad

        }))

        .sort((a, b) => b.cantidad - a.cantidad);

};


/* ============================================================
   TOTALES
============================================================ */

const totalIngresosDashboard = () =>

    AdminState.ventas.reduce(

        (total, venta) => total + venta.total,

        0

    );


const numeroPedidos = () =>

    AdminState.ventas.length;


/* ============================================================
   WEB COMPONENTS DE SECCIÓN
   (contenedores de layout referidos desde admin.html)
============================================================ */

/* ============================================================
   ADMIN HEADER
============================================================ */

class AdminHeader extends BaseComponent {

    render() {

        this.innerHTML = `

            <header class="admin-header">

                <section class="admin-header__brand">
                    <h1>Sweet Dreams Admin</h1>
                </section>

                <nav class="admin-navigation">
                    <ul>
                        <li><a href="#dashboard">Dashboard</a></li>
                        <li><a href="#productos">Productos</a></li>
                        <li><a href="#categorias">Categorías</a></li>
                        <li><a href="#pedidos">Pedidos</a></li>
                        <li><a href="#clientes">Clientes</a></li>
                        <li><a href="#promociones">Promociones</a></li>
                    </ul>
                </nav>

                <section class="admin-user">
                    <article>
                        <h3>Administrador</h3>
                        <p>admin@sweetdreams.com</p>
                    </article>
                    <button id="btnCerrarSesion">Cerrar Sesión</button>
                </section>

            </header>

        `;

        this.querySelector("#btnCerrarSesion")
            .addEventListener("click", () => {
                window.location.href = "index.html";
            });

    }

}

customElements.define(
    "admin-header",
    AdminHeader
);


/* ============================================================
   DASHBOARD HOME
============================================================ */

class DashboardHome extends BaseComponent {

    render() {

        this.innerHTML = `

            <section class="dashboard-home">

                <header class="section-header">
                    <h2>Panel de Control</h2>
                    <p>Resumen general de la tienda.</p>
                </header>

                <section class="dashboard-cards" id="dashboard"></section>

                <section class="dashboard-summary">

                    <article>
                        <h3>Productos Más Vendidos</h3>
                        <ol id="topProductos"></ol>
                    </article>

                    <article>
                        <h3>Últimos Pedidos</h3>
                        <ul id="ultimosPedidos"></ul>
                    </article>

                </section>

            </section>

        `;

        this.renderResumen();

    }

    renderResumen() {

        const ventas =
            StorageManager.get(STORAGE_KEYS.VENTAS);

        const topOl =
            this.querySelector("#topProductos");

        const pedidosUl =
            this.querySelector("#ultimosPedidos");

        if (topOl) {

            const conteo = {};

            ventas.forEach(venta => {

                (venta.productos ?? []).forEach(producto => {

                    conteo[producto.nombre] =
                        (conteo[producto.nombre] ?? 0) +
                        producto.cantidad;

                });

            });

            const top = Object.entries(conteo)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            topOl.innerHTML = top.length
                ? top.map(([nombre]) =>
                    `<li>${nombre}</li>`
                  ).join("")
                : "<li>Sin datos aún</li>";

        }

        if (pedidosUl) {

            const ultimos = [...ventas]
                .slice(-5)
                .reverse();

            pedidosUl.innerHTML = ultimos.length
                ? ultimos.map(venta =>
                    `<li>Pedido #${venta.codigoPedido}</li>`
                  ).join("")
                : "<li>Sin pedidos aún</li>";

        }

    }

}

customElements.define(
    "dashboard-home",
    DashboardHome
);


/* ============================================================
   DASHBOARD PRODUCTS
============================================================ */

class DashboardProducts extends BaseComponent {

    render() {

        const categorias =
            StorageManager.get(STORAGE_KEYS.CATEGORIAS);

        const opciones = categorias
            .map(categoria =>
                `<option value="${categoria.nombre}">${categoria.nombre}</option>`
            )
            .join("");

        this.innerHTML = `

            <section class="dashboard-products" id="productos">

                <header class="section-header">
                    <h2>Gestión de Productos</h2>
                </header>

                <section class="products-toolbar">
                    <button id="btnAgregarProducto">Agregar Producto</button>
                    <button id="btnExportarProductos">Exportar Productos</button>
                </section>

                <section class="products-search">

                    <label for="buscar-producto">Buscar Producto</label>
                    <input
                        type="search"
                        id="buscar-producto"
                        placeholder="Buscar...">

                    <label for="filtro-categoria">Categoría</label>
                    <select id="filtro-categoria">
                        <option value="todos">Todas</option>
                        ${opciones}
                    </select>

                </section>

                <section class="products-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-productos"></tbody>
                    </table>
                </section>

            </section>

        `;

    }

}

customElements.define(
    "dashboard-products",
    DashboardProducts
);


/* ============================================================
   DASHBOARD CATEGORIES
============================================================ */

class DashboardCategories extends BaseComponent {

    render() {

        this.innerHTML = `

            <section class="dashboard-categories" id="categorias">

                <header class="section-header">
                    <h2>Categorías</h2>
                    <p>Administra las categorías disponibles en la tienda.</p>
                </header>

                <section class="categories-toolbar">
                    <button id="btnNuevaCategoria">Nueva Categoría</button>
                </section>

                <section class="categories-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Categoría</th>
                                <th>Productos</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-categorias"></tbody>
                    </table>
                </section>

            </section>

        `;

    }

}

customElements.define(
    "dashboard-categories",
    DashboardCategories
);


/* ============================================================
   DASHBOARD ORDERS
============================================================ */

class DashboardOrders extends BaseComponent {

    render() {

        this.innerHTML = `

            <section class="dashboard-orders" id="pedidos">

                <header class="section-header">
                    <h2>Pedidos</h2>
                    <p>Consulta y administra los pedidos realizados.</p>
                </header>

                <section class="orders-toolbar">
                    <button id="btnNuevoPedido">Nuevo Pedido</button>
                </section>

                <section class="orders-filters">

                    <label for="filtro-ventas">Estado</label>
                    <select id="filtro-ventas">
                        <option value="todos">Todos</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Preparando">Preparando</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>

                    <label for="buscar-venta">Buscar</label>
                    <input
                        type="search"
                        id="buscar-venta"
                        placeholder="Pedido, cliente o ciudad...">

                </section>

                <section class="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-ventas"></tbody>
                    </table>
                </section>

            </section>

        `;

    }

}

customElements.define(
    "dashboard-orders",
    DashboardOrders
);


/* ============================================================
   DASHBOARD CUSTOMERS
============================================================ */

class DashboardCustomers extends BaseComponent {

    render() {

        this.innerHTML = `

            <section class="dashboard-customers" id="clientes">

                <header class="section-header">
                    <h2>Clientes</h2>
                    <p>Información de los clientes registrados.</p>
                </header>

                <section class="customers-toolbar">
                    <button id="btnNuevoCliente">Nuevo Cliente</button>
                </section>

                <section class="customers-search">
                    <label for="customerSearch">Buscar Cliente</label>
                    <input
                        type="search"
                        id="customerSearch"
                        placeholder="Nombre o correo">
                </section>

                <section class="customers-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Teléfono</th>
                                <th>Pedidos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-clientes"></tbody>
                    </table>
                </section>

            </section>

        `;

    }

}

customElements.define(
    "dashboard-customers",
    DashboardCustomers
);


/* ============================================================
   DASHBOARD PROMOTIONS
============================================================ */

class DashboardPromotions extends BaseComponent {

    render() {

        this.innerHTML = `

            <section class="dashboard-promotions" id="promociones">

                <header class="section-header">
                    <h2>Gestión de Promociones</h2>
                    <p>Administra los descuentos y promociones de la tienda.</p>
                </header>

                <section class="promotions-toolbar">
                    <button id="newPromotionButton">Nueva Promoción</button>
                </section>

                <section class="promotions-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Promoción</th>
                                <th>Descuento</th>
                                <th>Aplica a</th>
                                <th>Inicio</th>
                                <th>Finaliza</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-promociones"></tbody>
                    </table>
                </section>

            </section>

        `;

    }

}

customElements.define(
    "dashboard-promotions",
    DashboardPromotions
);


/* ============================================================
   ADMIN FOOTER
============================================================ */

class AdminFooter extends BaseComponent {

    render() {

        this.innerHTML = `

            <footer class="admin-footer">

                <section class="admin-footer__content">

                    <article>
                        <h3>Sweet Dreams</h3>
                        <p>Panel Administrativo</p>
                    </article>

                    <article>
                        <p>Versión 1.0</p>
                    </article>

                    <article>
                        <p>© 2026 Todos los derechos reservados.</p>
                    </article>

                </section>

            </footer>

        `;

    }

}

customElements.define(
    "admin-footer",
    AdminFooter
);


/* ============================================================
   REFRESCAR TODO
============================================================ */

const refrescarTodo = () => {

    cargarDatos();

    actualizarDashboard();

    renderTablaProductos();

    renderTablaCategorias();

    renderTablaInventario();

    renderTablaVentas();

    renderTablaClientes();

    renderTablaPromociones();

};


/* ============================================================
   EVENTOS GENERALES
============================================================ */

const registrarEventosGenerales = () => {

    registrarBuscadorProductos();

    registrarFiltroCategoria();

    registrarBuscadorInventario();

    registrarFiltroInventario();

    registrarBuscadorVentas();

    registrarFiltroVentas();

    registrarBuscadorClientes();

};


/* ============================================================
   OBSERVADOR LOCALSTORAGE
============================================================ */

window.addEventListener(

    "storage",

    ({ key }) => {

        if (

            !Object.values(STORAGE_KEYS)

                .includes(key)

        ) return;

        refrescarTodo();

    }

);


/* ============================================================
   API PÚBLICA
============================================================ */

const AdminApp = {

    get productos() {

        return [...AdminState.productos];

    },

    get ventas() {

        return [...AdminState.ventas];

    },

    get categorias() {

        return [...AdminState.categorias];

    },

    get inventario() {

        return [...AdminState.inventario];

    },

    refrescar: refrescarTodo,

    productosMasVendidos,

    categoriasMasVendidas,

    totalIngresos: totalIngresosDashboard,

    numeroPedidos

};


Object.freeze(AdminApp);

window.AdminApp = AdminApp;


/* ============================================================
   SIEMBRA DE DATOS
   ------------------------------------------------------------
   Si el panel admin se abre directamente (sin haber visitado
   antes index.html), el localStorage puede estar vacío. Estas
   funciones aseguran que siempre haya datos de partida.
============================================================ */

const sembrarDatosIniciales = async () => {

    const cargas = [];

    if (!AdminState.productos.length) {

        cargas.push(

            fetch("./data/inventario.json")
                .then(res => res.ok ? res.json() : [])
                .then(productos => {

                    AdminState.productos = productos;

                    guardarProductos();

                    AdminState.inventario = productos.map(
                        producto => ({

                            id: producto.id,

                            nombre: producto.nombre,

                            stock: producto.stock,

                            estado: producto.estado

                        })
                    );

                    guardarInventario();

                })
                .catch(error => console.error(error))

        );

    }

    if (!AdminState.categorias.length) {

        cargas.push(

            fetch("./data/categorias.json")
                .then(res => res.ok ? res.json() : [])
                .then(categorias => {

                    AdminState.categorias = categorias;

                    guardarCategorias();

                })
                .catch(error => console.error(error))

        );

    }

    if (!AdminState.ventas.length) {

        cargas.push(

            fetch("./data/ventas.json")
                .then(res => res.ok ? res.json() : [])
                .then(ventas => {

                    AdminState.ventas = ventas;

                    guardarVentas();

                })
                .catch(error => console.error(error))

        );

    }

    if (!AdminState.clientes.length) {

        cargas.push(

            fetch("./data/clientes.json")
                .then(res => res.ok ? res.json() : [])
                .then(clientes => {

                    AdminState.clientes = clientes;

                    guardarClientes();

                })
                .catch(error => console.error(error))

        );

    }

    if (!AdminState.promociones.length) {

        cargas.push(

            fetch("./data/promociones.json")
                .then(res => res.ok ? res.json() : [])
                .then(promociones => {

                    AdminState.promociones = promociones;

                    guardarPromociones();

                })
                .catch(error => console.error(error))

        );

    }

    await Promise.all(cargas);

};


/* ============================================================
   INICIALIZACIÓN
============================================================ */

/* ============================================================
   VERSIÓN DE LOS DATOS
   (misma lógica y misma clave que en app.js, para que ambas
   páginas se pongan de acuerdo sobre cuándo limpiar datos viejos)
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
   INICIALIZACIÓN
============================================================ */

const iniciarAdmin = async () => {

    verificarVersionDatos();

    cargarDatos();

    await sembrarDatosIniciales();

    actualizarDashboard();

    renderTablaProductos();

    renderTablaCategorias();

    renderTablaInventario();

    renderTablaVentas();

    renderTablaClientes();

    renderTablaPromociones();

    registrarEventosGenerales();

};


/* ============================================================
   DOM READY
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    iniciarAdmin

);


/* ============================================================
   FIN DEL ARCHIVO
============================================================ */

console.info(

    "%cSweet Dreams Admin iniciado correctamente.",

    "color:#8B4513;font-weight:bold;font-size:14px;"

);