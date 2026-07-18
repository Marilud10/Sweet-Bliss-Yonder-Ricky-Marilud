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

    CATEGORIAS: "categorias"

});


/* ============================================================
   ESTADO
============================================================ */

const AdminState = {

    productos: [],

    inventario: [],

    ventas: [],

    categorias: [],

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

        this.innerHTML = `

            <tr>

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

            </tr>

        `;

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

        this.innerHTML = `

            <tr>

                <td>${this.categoria.id}</td>

                <td>${this.categoria.nombre}</td>

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

            </tr>

        `;

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

        this.innerHTML = `

            <tr>

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

            </tr>

        `;

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

        this.innerHTML = `

            <tr>

                <td>${codigoPedido}</td>

                <td>${cliente}</td>

                <td>${fecha}</td>

                <td>${Utils.moneda(total)}</td>

                <td>${estado}</td>

                <td>

                    <button
                        class="btn-delete-sale"
                        data-id="${this.venta.idVenta}">
                        Eliminar
                    </button>

                </td>

            </tr>

        `;

    }

}

customElements.define(
    "sale-row",
    SaleRow
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

        fragment.appendChild(fila);

    });

    tabla.appendChild(fragment);

    registrarEventosProductos();

};


/* ============================================================
   EVENTOS PRODUCTOS
============================================================ */

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

                /**
                 * Aquí posteriormente se abrirá
                 * el modal de edición del HTML.
                 */

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

        fragment.appendChild(fila);

    });

    tabla.appendChild(fragment);

    registrarEventosCategorias();

};


/* ============================================================
   EVENTOS
============================================================ */

const registrarEventosCategorias = () => {

    document
        .querySelectorAll(".btn-edit-category")
        .forEach(btn => {

            btn.onclick = () => {

                AdminState.categoriaSeleccionada =
                    obtenerCategoria(
                        btn.dataset.id
                    );

                /**
                 * Aquí se abrirá posteriormente
                 * el modal de edición.
                 */

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

        fragment.appendChild(fila);

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

        fragment.appendChild(fila);

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

const registrarEventosVentas = () => {

    document
        .querySelectorAll(".btn-delete-sale")
        .forEach(btn => {

            btn.onclick = () =>

                eliminarVenta(
                    btn.dataset.id
                );

        });

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
                    <button id="btnImportarProductos">Importar Productos</button>
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

        const clientesEjemplo = [

            {
                id: "C001",
                nombre: "María Gómez",
                correo: "maria@email.com",
                telefono: "3001112233",
                pedidos: 15
            },

            {
                id: "C002",
                nombre: "Carlos Pérez",
                correo: "carlos@email.com",
                telefono: "3019876543",
                pedidos: 8
            },

            {
                id: "C003",
                nombre: "Ana Torres",
                correo: "ana@email.com",
                telefono: "3204567890",
                pedidos: 20
            }

        ];

        const filas = clientesEjemplo.map(cliente => `

            <tr>
                <td>${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.correo}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.pedidos}</td>
                <td>
                    <button class="btn-ver-cliente" data-id="${cliente.id}">Ver</button>
                    <button class="btn-editar-cliente" data-id="${cliente.id}">Editar</button>
                </td>
            </tr>

        `).join("");

        this.innerHTML = `

            <section class="dashboard-customers" id="clientes">

                <header class="section-header">
                    <h2>Clientes</h2>
                    <p>Información de los clientes registrados.</p>
                </header>

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
                        <tbody id="tabla-clientes">
                            ${filas}
                        </tbody>
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

        const promocionesEjemplo = [

            {
                id: "PR001",
                nombre: "2x1 Cupcakes",
                descuento: "50%",
                aplicaA: "Cupcakes",
                inicio: "01/07/2026",
                fin: "31/07/2026",
                estado: "Activa"
            },

            {
                id: "PR002",
                nombre: "Descuento Tortas",
                descuento: "15%",
                aplicaA: "Tortas",
                inicio: "15/07/2026",
                fin: "20/07/2026",
                estado: "Activa"
            },

            {
                id: "PR003",
                nombre: "Combo Familiar",
                descuento: "20%",
                aplicaA: "Todos",
                inicio: "10/07/2026",
                fin: "25/07/2026",
                estado: "Programada"
            }

        ];

        const filas = promocionesEjemplo.map(promocion => `

            <tr>
                <td>${promocion.id}</td>
                <td>${promocion.nombre}</td>
                <td>${promocion.descuento}</td>
                <td>${promocion.aplicaA}</td>
                <td>${promocion.inicio}</td>
                <td>${promocion.fin}</td>
                <td>${promocion.estado}</td>
                <td>
                    <button class="btn-ver-promocion" data-id="${promocion.id}">Ver</button>
                    <button class="btn-editar-promocion" data-id="${promocion.id}">Editar</button>
                    <button class="btn-eliminar-promocion" data-id="${promocion.id}">Eliminar</button>
                </td>
            </tr>

        `).join("");

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
                        <tbody id="tabla-promociones">
                            ${filas}
                        </tbody>
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
   INICIALIZACIÓN
============================================================ */

const iniciarAdmin = () => {

    cargarDatos();

    actualizarDashboard();

    renderTablaProductos();

    renderTablaCategorias();

    renderTablaInventario();

    renderTablaVentas();

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