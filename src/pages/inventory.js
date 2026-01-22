import { exportToolsPdf } from "../components/pdfExport.js";

const statusBadge = (status) => {
  if (status === "disponible") return "success";
  if (status === "dañado") return "danger";
  return "warning";
};

const applyFilters = (tools, state) => {
  const search = state.search.toLowerCase();
  let result = tools.filter((tool) => {
    const matchesSearch = [
      tool.name,
      tool.category,
      tool.brand,
      tool.model,
      tool.code,
      tool.location_name_cache
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search));
    const matchesCategory = state.filters.category
      ? tool.category === state.filters.category
      : true;
    const matchesLocation = state.filters.location
      ? tool.location_id === state.filters.location
      : true;
    const matchesStatus = state.filters.status
      ? tool.status === state.filters.status
      : true;
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  if (state.filters.sort === "low") {
    result = result.filter((tool) => tool.qty_available <= tool.min_qty);
  }
  if (state.filters.sort === "recent") {
    result = result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
  return result;
};

const attachExportHandlers = (state) => {
  const listBtn = document.querySelector("#export-list");
  const lowBtn = document.querySelector("#export-low");
  const locationBtn = document.querySelector("#export-location");

  listBtn?.addEventListener("click", () => {
    exportToolsPdf({
      tools: applyFilters(state.tools, state),
      user: state.user,
      title: "Inventario de Herramientas IT"
    });
  });

  lowBtn?.addEventListener("click", () => {
    const lowTools = state.tools.filter((tool) => tool.qty_available <= tool.min_qty);
    exportToolsPdf({
      tools: lowTools,
      user: state.user,
      title: "Reporte de Stock Bajo"
    });
  });

  locationBtn?.addEventListener("click", () => {
    const selected = document.querySelector("#report-location")?.value;
    const filtered = selected
      ? state.tools.filter((tool) => tool.location_id === selected)
      : state.tools;
    exportToolsPdf({
      tools: filtered,
      user: state.user,
      title: "Reporte por Ubicación"
    });
  });
};

export const renderInventory = ({ state }) => {
  const categories = Array.from(new Set(state.tools.map((tool) => tool.category)));
  const filtered = applyFilters(state.tools, state);
  const canAdmin = ["superadmin", "admin"].includes(state.user?.role);
  const movementsByTool = state.movements.reduce((acc, movement) => {
    acc[movement.tool_id] = acc[movement.tool_id] || [];
    acc[movement.tool_id].push(movement);
    return acc;
  }, {});

  setTimeout(() => attachExportHandlers(state), 0);

  return `
    <div class="app">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo">IT</div>
          <div>
            <h1>Inventario IT</h1>
            <span class="tag">Gestión de herramientas</span>
          </div>
        </div>
        <nav class="nav">
          <button class="active" data-action="go-inventory">Inventario</button>
          ${canAdmin ? `<button data-action="go-admin">Panel Admin</button>` : ""}
        </nav>
        <div class="user-card">
          <strong>${state.user?.name || "Operador"}</strong>
          <span>${state.user?.role || "operador"}</span>
          <button class="button ghost" data-action="logout">Cerrar sesión</button>
        </div>
      </aside>
      <main class="main">
        <div class="topbar">
          <div class="search-group">
            <span>🔍</span>
            <input id="global-search" placeholder="Buscar por nombre, categoría, marca, código, ubicación" value="${state.search}" />
          </div>
          <div class="top-actions">
            <button class="button secondary" id="export-list">Exportar listado PDF</button>
            <button class="button ghost" id="export-low">Stock bajo PDF</button>
          </div>
        </div>
        <section class="content">
          <div class="filters">
            <select id="filter-category">
              <option value="">Todas las categorías</option>
              ${categories
                .map((category) => `<option ${state.filters.category === category ? "selected" : ""}>${category}</option>`)
                .join("")}
            </select>
            <select id="filter-location">
              <option value="">Todas las ubicaciones</option>
              ${state.locations
                .map(
                  (loc) =>
                    `<option value="${loc.id}" ${state.filters.location === loc.id ? "selected" : ""}>${loc.name}</option>`
                )
                .join("")}
            </select>
            <select id="filter-status">
              <option value="">Todos los estados</option>
              <option value="disponible" ${state.filters.status === "disponible" ? "selected" : ""}>Disponible</option>
              <option value="dañado" ${state.filters.status === "dañado" ? "selected" : ""}>Dañado</option>
              <option value="en reparación" ${state.filters.status === "en reparación" ? "selected" : ""}>En reparación</option>
            </select>
            <select id="filter-sort">
              <option value="recent" ${state.filters.sort === "recent" ? "selected" : ""}>Más reciente</option>
              <option value="low" ${state.filters.sort === "low" ? "selected" : ""}>Stock bajo</option>
            </select>
            <select id="report-location">
              <option value="">Reporte por ubicación</option>
              ${state.locations.map((loc) => `<option value="${loc.id}">${loc.name}</option>`).join("")}
            </select>
            <button class="button ghost" id="export-location">Exportar ubicación PDF</button>
          </div>

          <div class="cards-grid">
            ${filtered
              .map(
                (tool) => {
                  const lowStock = tool.qty_available <= tool.min_qty;
                  return `
              <article class="card">
                <img src="${tool.photos?.[0] || "https://via.placeholder.com/320x180?text=Sin+foto"}" alt="${tool.name}" />
                <div>
                  <span class="badge ${statusBadge(tool.status)}">${tool.status}</span>
                  ${lowStock ? `<span class="badge warning">Stock bajo</span>` : ""}
                </div>
                <h3>${tool.name}</h3>
                <p>${tool.category} · ${tool.brand} ${tool.model}</p>
                <p><strong>${tool.qty_available}</strong> ${tool.unit} disponibles · <span>${tool.location_name_cache}</span></p>
                <div class="card-actions">
                  <button class="button" data-action="reduce-one" data-id="${tool.id}">-1</button>
                  <button class="button secondary" data-action="open-reduce" data-id="${tool.id}">Rebajar N</button>
                  <button class="button ghost" data-action="open-move" data-id="${tool.id}">Mover</button>
                  <button class="button ghost" data-action="open-detail" data-id="${tool.id}">Ver detalle</button>
                </div>
              </article>
            `;
                }
              )
              .join("")}
          </div>

          <section class="panel">
            <h2 class="section-title">Detalle y Kardex</h2>
            ${filtered
              .map((tool) => {
                const movements = movementsByTool[tool.id] || [];
                return `
                  <div id="detail-${tool.id}" class="panel">
                    <div class="form-grid">
                      <div>
                        <h3>${tool.name}</h3>
                        <p>${tool.description}</p>
                        <p><strong>Código:</strong> ${tool.code || "Sin código"}</p>
                        <p><strong>Estado:</strong> ${tool.status}</p>
                        <p><strong>Ubicación:</strong> ${tool.location_name_cache}</p>
                        <p><strong>Mínimo:</strong> ${tool.min_qty} ${tool.unit}</p>
                        <div class="card-actions">
                          <button class="button secondary" data-action="open-reduce" data-id="${tool.id}">Rebajar</button>
                          <button class="button ghost" data-action="open-move" data-id="${tool.id}">Mover</button>
                          <button class="button ghost" data-action="open-adjust" data-id="${tool.id}">Ajustar</button>
                        </div>
                      </div>
                      <div>
                        <h4>Galería</h4>
                        <div class="cards-grid">
                          ${tool.photos
                            .map((photo) => `<img src="${photo}" alt="Foto de ${tool.name}" />`)
                            .join("")}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4>Historial de movimientos</h4>
                      <table class="table">
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Origen/Destino</th>
                            <th>Usuario</th>
                            <th>Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${movements.length === 0
                            ? `<tr><td colspan="5">Sin movimientos registrados.</td></tr>`
                            : movements
                                .map(
                                  (movement) => `
                            <tr>
                              <td>${movement.type}</td>
                              <td>${movement.qty}</td>
                              <td>${movement.from_location_id} → ${movement.to_location_id}</td>
                              <td>${movement.createdBy?.name || "-"}</td>
                              <td>${new Date(movement.createdAt).toLocaleString("es-ES")}</td>
                            </tr>
                          `
                                )
                                .join("")}
                        </tbody>
                      </table>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </section>
        </section>
      </main>
      <div id="modal-backdrop" class="modal-backdrop">
        <div class="modal" id="modal-body"></div>
      </div>
      <div id="toast" class="toast"></div>
    </div>
  `;
};
