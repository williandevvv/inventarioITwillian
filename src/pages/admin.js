export const renderAdmin = ({ state }) => {
  return `
    <div class="app">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo">IT</div>
          <div>
            <h1>Panel Admin</h1>
            <span class="tag">Control total</span>
          </div>
        </div>
        <nav class="nav">
          <button data-action="go-inventory">Inventario</button>
          <button class="active" data-action="go-admin">Panel Admin</button>
        </nav>
        <div class="user-card">
          <strong>${state.user?.name || "Administrador"}</strong>
          <span>${state.user?.role || "admin"}</span>
          <button class="button ghost" data-action="logout">Cerrar sesión</button>
        </div>
      </aside>
      <main class="main">
        <div class="topbar">
          <h2>Administración</h2>
          <div class="top-actions">
            <span class="tag">Roles habilitados: superadmin, admin, operador, lector</span>
          </div>
        </div>
        <section class="content">
          <div class="panel">
            <h3 class="section-title">Crear herramienta</h3>
            <form id="tool-form" class="form-grid">
              <input name="name" placeholder="Nombre" required />
              <input name="category" placeholder="Categoría" required />
              <input name="brand" placeholder="Marca" />
              <input name="model" placeholder="Modelo" />
              <input name="unit" placeholder="Unidad (pieza, caja, metro)" required />
              <input type="number" name="qty_total" placeholder="Cantidad total" min="0" required />
              <input type="number" name="min_qty" placeholder="Mínimo" min="0" />
              <select name="status">
                <option value="disponible">Disponible</option>
                <option value="dañado">Dañado</option>
                <option value="en reparación">En reparación</option>
              </select>
              <select name="location_id" required>
                <option value="">Ubicación</option>
                ${state.locations.map((loc) => `<option value="${loc.id}">${loc.name}</option>`).join("")}
              </select>
              <input name="code" placeholder="Código interno" />
              <textarea name="description" placeholder="Descripción"></textarea>
              <input name="photo" placeholder="URL de foto (Firebase Storage)" />
              <div class="form-actions">
                <button class="button" type="submit">Guardar herramienta</button>
              </div>
            </form>
          </div>

          <div class="panel">
            <h3 class="section-title">Ubicaciones</h3>
            <form id="location-form" class="form-grid">
              <input name="name" placeholder="Nombre de ubicación" required />
              <input name="description" placeholder="Descripción" />
              <button class="button" type="submit">Agregar ubicación</button>
            </form>
            <table class="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${state.locations
                  .map(
                    (loc) => `
                  <tr>
                    <td>${loc.name}</td>
                    <td>${loc.description || "-"}</td>
                    <td>${loc.active ? "Activa" : "Inactiva"}</td>
                    <td><button class="button ghost" data-action="delete-location" data-id="${loc.id}">Eliminar</button></td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="panel">
            <h3 class="section-title">Usuarios y roles</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Activo</th>
                </tr>
              </thead>
              <tbody>
                ${state.user
                  ? `
                  <tr>
                    <td>${state.user.name}</td>
                    <td>${state.user.email}</td>
                    <td>${state.user.role}</td>
                    <td>Activo</td>
                  </tr>
                `
                  : `<tr><td colspan="4">Sin usuarios cargados.</td></tr>`}
              </tbody>
            </table>
          </div>

          <div class="panel">
            <h3 class="section-title">Reportes rápidos</h3>
            <div class="cards-grid">
              <div class="card">
                <h4>Stock por ubicación</h4>
                <p>Consulta rápida agrupada por ubicación.</p>
                <ul>
                  ${state.locations
                    .map((loc) => {
                      const qty = state.tools
                        .filter((tool) => tool.location_id === loc.id)
                        .reduce((sum, tool) => sum + tool.qty_available, 0);
                      return `<li>${loc.name}: ${qty} unidades</li>`;
                    })
                    .join("")}
                </ul>
              </div>
              <div class="card">
                <h4>Herramientas con stock bajo</h4>
                <p>${state.tools.filter((tool) => tool.qty_available <= tool.min_qty).length} herramientas en alerta.</p>
              </div>
              <div class="card">
                <h4>Movimientos recientes</h4>
                <p>${state.movements.length} movimientos registrados.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div id="modal-backdrop" class="modal-backdrop">
        <div class="modal" id="modal-body"></div>
      </div>
      <div id="toast" class="toast"></div>
    </div>
  `;
};
