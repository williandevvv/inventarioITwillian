import { dataService } from "./services/dataService.js";
import { firebaseNotes } from "./services/firebase.js";
import { renderLogin } from "./pages/login.js";
import { renderInventory } from "./pages/inventory.js";
import { renderAdmin } from "./pages/admin.js";

const state = {
  view: "login",
  user: null,
  tools: [],
  locations: [],
  movements: [],
  search: "",
  filters: {
    category: "",
    location: "",
    status: "",
    sort: "recent"
  }
};

const setState = (partial) => {
  Object.assign(state, partial);
  render();
};

const loadInitialData = () => {
  setState({
    tools: dataService.getTools(),
    locations: dataService.getLocations(),
    movements: dataService.getMovements()
  });
};

const demoUsers = [
  {
    uid: "demo-admin",
    name: "Administrador",
    email: "admin@inventario.com",
    password: "Admin123",
    role: "admin"
  },
  {
    uid: "demo-operator",
    name: "Operador",
    email: "operador@inventario.com",
    password: "Operador123",
    role: "operador"
  }
];

const handleLogin = (payload) => {
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password ?? "";

  if (!email || !password) {
    return { ok: false, message: "Ingresa tu correo y contraseña." };
  }

  const matchedUser = demoUsers.find((item) => item.email === email);
  if (!matchedUser) {
    return { ok: false, message: "El correo no está registrado." };
  }

  if (matchedUser.password !== password) {
    return { ok: false, message: "La contraseña es incorrecta." };
  }

  const user = {
    uid: matchedUser.uid,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role
  };
  setState({ user, view: "inventory" });
  return { ok: true };
};

const handleLogout = () => {
  setState({ user: null, view: "login" });
};

const openToast = (message, variant = "info") => {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.variant = variant;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
};

const updateLoginMessage = (text, variant = "error") => {
  const message = document.querySelector("#login-message");
  if (!message) return;
  message.textContent = text;
  message.dataset.variant = variant;
  message.classList.toggle("show", Boolean(text));
};

const openModal = (content) => {
  const backdrop = document.querySelector("#modal-backdrop");
  const modalBody = document.querySelector("#modal-body");
  if (!backdrop || !modalBody) return;
  modalBody.innerHTML = "";
  modalBody.appendChild(content);
  backdrop.classList.add("active");
};

const closeModal = () => {
  const backdrop = document.querySelector("#modal-backdrop");
  if (backdrop) backdrop.classList.remove("active");
};

const registerMovement = (movement) => {
  dataService.addMovement(movement);
  setState({ movements: dataService.getMovements() });
};

const updateTool = (tool) => {
  dataService.updateTool(tool);
  setState({ tools: dataService.getTools() });
};

const addTool = (tool) => {
  dataService.addTool(tool);
  setState({ tools: dataService.getTools() });
};

const updateLocation = (location) => {
  dataService.updateLocation(location);
  setState({ locations: dataService.getLocations() });
};

const addLocation = (location) => {
  dataService.addLocation(location);
  setState({ locations: dataService.getLocations() });
};

const deleteLocation = (locationId) => {
  dataService.deleteLocation(locationId);
  setState({ locations: dataService.getLocations() });
};

const setSearch = (value) => {
  setState({ search: value });
};

const setFilters = (filters) => {
  setState({ filters: { ...state.filters, ...filters } });
};

const setView = (view) => {
  setState({ view });
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const getContext = () => ({
  state,
  actions: {
    setView,
    handleLogin,
    handleLogout,
    openToast,
    openModal,
    closeModal,
    registerMovement,
    updateTool,
    addTool,
    addLocation,
    updateLocation,
    deleteLocation,
    setSearch,
    setFilters
  }
});

const render = () => {
  const root = document.querySelector("#app");
  if (!root) return;

  if (state.view === "login") {
    root.innerHTML = renderLogin(getContext());
  } else if (state.view === "admin") {
    root.innerHTML = renderAdmin(getContext());
  } else {
    root.innerHTML = renderInventory(getContext());
  }

  const modalBackdrop = document.querySelector("#modal-backdrop");
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (event) => {
      if (event.target.id === "modal-backdrop") {
        closeModal();
      }
    });
  }
};

const bindUIEvents = () => {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === "logout") {
      handleLogout();
    }
    if (action === "go-admin") {
      if (["superadmin", "admin"].includes(state.user?.role)) {
        setView("admin");
      } else {
        openToast("No tienes permisos para acceder al panel admin.", "warning");
      }
    }
    if (action === "go-inventory") {
      setView("inventory");
    }
    if (action === "open-reduce") {
      const tool = state.tools.find((item) => item.id === id);
      if (tool) {
        const content = document.createElement("div");
        content.innerHTML = `
          <h3>Rebajar unidades</h3>
          <p>¿Cuántas unidades deseas rebajar de <strong>${tool.name}</strong>?</p>
          <input type="number" min="1" value="1" id="reduce-qty" />
          <div class="form-actions">
            <button class="button ghost" data-action="close-modal">Cancelar</button>
            <button class="button" data-action="confirm-reduce" data-id="${tool.id}">Confirmar</button>
          </div>
        `;
        openModal(content);
      }
    }
    if (action === "reduce-one") {
      const tool = state.tools.find((item) => item.id === id);
      if (tool) {
        if (tool.qty_available - 1 < 0) {
          openToast("No puedes rebajar por debajo de cero.", "danger");
          return;
        }
        tool.qty_available -= 1;
        tool.updatedAt = new Date().toISOString();
        updateTool(tool);
        registerMovement({
          id: crypto.randomUUID(),
          tool_id: tool.id,
          type: "USE",
          qty: 1,
          from_location_id: tool.location_id,
          to_location_id: tool.location_id,
          note: "Rebaja rápida",
          createdAt: new Date().toISOString(),
          createdBy: {
            uid: state.user?.uid || "demo",
            name: state.user?.name || "Demo",
            role: state.user?.role || "operador"
          }
        });
        openToast("Rebaja registrada correctamente.");
        render();
      }
    }
    if (action === "open-move") {
      const tool = state.tools.find((item) => item.id === id);
      if (tool) {
        const options = state.locations
          .map(
            (loc) =>
              `<option value="${loc.id}" ${loc.id === tool.location_id ? "selected" : ""}>${loc.name}</option>`
          )
          .join("");
        const content = document.createElement("div");
        content.innerHTML = `
          <h3>Mover herramienta</h3>
          <p>Mover <strong>${tool.name}</strong> a:</p>
          <select id="move-location">${options}</select>
          <div class="form-actions">
            <button class="button ghost" data-action="close-modal">Cancelar</button>
            <button class="button" data-action="confirm-move" data-id="${tool.id}">Confirmar</button>
          </div>
        `;
        openModal(content);
      }
    }
    if (action === "open-detail") {
      setView("inventory");
      const detailSection = document.querySelector(`#detail-${id}`);
      if (detailSection) {
        detailSection.scrollIntoView({ behavior: "smooth" });
      }
    }
    if (action === "open-adjust") {
      const tool = state.tools.find((item) => item.id === id);
      if (tool) {
        const content = document.createElement("div");
        content.innerHTML = `
          <h3>Ajustar inventario</h3>
          <p>Ingresa la nueva cantidad disponible para <strong>${tool.name}</strong>.</p>
          <input type="number" min="0" value="${tool.qty_available}" id="adjust-qty" />
          <input type="text" placeholder="Nota del ajuste" id="adjust-note" />
          <div class="form-actions">
            <button class="button ghost" data-action="close-modal">Cancelar</button>
            <button class="button" data-action="confirm-adjust" data-id="${tool.id}">Confirmar</button>
          </div>
        `;
        openModal(content);
      }
    }
    if (action === "close-modal") {
      closeModal();
    }
    if (action === "confirm-reduce") {
      const tool = state.tools.find((item) => item.id === id);
      const qtyInput = document.querySelector("#reduce-qty");
      const qty = Number(qtyInput?.value || 0);
      if (tool && qty > 0) {
        if (tool.qty_available - qty < 0) {
          openToast("Stock insuficiente para rebajar.", "danger");
          return;
        }
        tool.qty_available -= qty;
        tool.updatedAt = new Date().toISOString();
        updateTool(tool);
        registerMovement({
          id: crypto.randomUUID(),
          tool_id: tool.id,
          type: "USE",
          qty,
          from_location_id: tool.location_id,
          to_location_id: tool.location_id,
          note: "Rebaja manual",
          createdAt: new Date().toISOString(),
          createdBy: {
            uid: state.user?.uid || "demo",
            name: state.user?.name || "Demo",
            role: state.user?.role || "operador"
          }
        });
        openToast("Rebaja registrada correctamente.");
        closeModal();
        render();
      }
    }
    if (action === "confirm-move") {
      const tool = state.tools.find((item) => item.id === id);
      const locationSelect = document.querySelector("#move-location");
      const destinationId = locationSelect?.value;
      if (tool && destinationId) {
        const destination = state.locations.find((loc) => loc.id === destinationId);
        const fromId = tool.location_id;
        tool.location_id = destinationId;
        tool.location_name_cache = destination?.name || "";
        tool.updatedAt = new Date().toISOString();
        updateTool(tool);
        registerMovement({
          id: crypto.randomUUID(),
          tool_id: tool.id,
          type: "MOVE",
          qty: tool.qty_available,
          from_location_id: fromId,
          to_location_id: destinationId,
          note: "Traslado",
          createdAt: new Date().toISOString(),
          createdBy: {
            uid: state.user?.uid || "demo",
            name: state.user?.name || "Demo",
            role: state.user?.role || "operador"
          }
        });
        openToast("Herramienta movida.");
        closeModal();
        render();
      }
    }
    if (action === "confirm-adjust") {
      const tool = state.tools.find((item) => item.id === id);
      const qtyInput = document.querySelector("#adjust-qty");
      const noteInput = document.querySelector("#adjust-note");
      const newQty = Number(qtyInput?.value || 0);
      if (tool && newQty >= 0) {
        tool.qty_available = newQty;
        tool.qty_total = newQty;
        tool.updatedAt = new Date().toISOString();
        updateTool(tool);
        registerMovement({
          id: crypto.randomUUID(),
          tool_id: tool.id,
          type: "ADJUST",
          qty: newQty,
          from_location_id: tool.location_id,
          to_location_id: tool.location_id,
          note: noteInput?.value || "Ajuste manual",
          createdAt: new Date().toISOString(),
          createdBy: {
            uid: state.user?.uid || "demo",
            name: state.user?.name || "Demo",
            role: state.user?.role || "operador"
          }
        });
        openToast("Ajuste registrado.");
        closeModal();
        render();
      }
    }
    if (action === "delete-location") {
      const location = state.locations.find((loc) => loc.id === id);
      if (location) {
        const content = document.createElement("div");
        content.innerHTML = `
          <h3>Eliminar ubicación</h3>
          <p>¿Seguro que deseas eliminar <strong>${location.name}</strong>?</p>
          <div class="form-actions">
            <button class="button ghost" data-action="close-modal">Cancelar</button>
            <button class="button" data-action="confirm-delete-location" data-id="${location.id}">Eliminar</button>
          </div>
        `;
        openModal(content);
      }
    }
    if (action === "confirm-delete-location") {
      deleteLocation(id);
      openToast("Ubicación eliminada.");
      closeModal();
      render();
    }
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches("#global-search")) {
      setSearch(target.value);
    }
    if (target.matches("#filter-category")) {
      setFilters({ category: target.value });
    }
    if (target.matches("#filter-location")) {
      setFilters({ location: target.value });
    }
    if (target.matches("#filter-status")) {
      setFilters({ status: target.value });
    }
    if (target.matches("#filter-sort")) {
      setFilters({ sort: target.value });
    }
  });

  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (form.matches("#tool-form")) {
      event.preventDefault();
      const formData = new FormData(form);
      const photoFile = formData.get("photo");
      const locationId = formData.get("location_id");
      const location = state.locations.find((loc) => loc.id === locationId);
      const photoUrl =
        photoFile instanceof File && photoFile.size > 0 ? await readFileAsDataUrl(photoFile) : "";
      const tool = {
        id: crypto.randomUUID(),
        name: formData.get("name"),
        category: formData.get("category"),
        brand: formData.get("brand"),
        model: formData.get("model"),
        description: formData.get("description"),
        unit: formData.get("unit"),
        qty_total: Number(formData.get("qty_total")),
        qty_available: Number(formData.get("qty_total")),
        min_qty: Number(formData.get("min_qty") || 0),
        status: formData.get("status"),
        location_id: locationId,
        location_name_cache: location?.name || "",
        photos: photoUrl ? [photoUrl] : [],
        code: formData.get("code"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        movements: []
      };
      addTool(tool);
      form.reset();
      openToast("Herramienta creada con éxito.");
      render();
    }
    if (form.matches("#location-form")) {
      event.preventDefault();
      const formData = new FormData(form);
      const location = {
        id: crypto.randomUUID(),
        name: formData.get("name"),
        description: formData.get("description"),
        active: true
      };
      addLocation(location);
      form.reset();
      openToast("Ubicación agregada.");
      render();
    }
    if (form.matches("#login-form")) {
      event.preventDefault();
      const email = form.querySelector("#login-email")?.value.trim();
      const password = form.querySelector("#login-password")?.value || "";
      if (!email) {
        updateLoginMessage("Por favor ingresa tu correo.");
        return;
      }
      if (!password) {
        updateLoginMessage("Por favor ingresa tu contraseña.");
        return;
      }
      const result = handleLogin({ email, password });
      if (!result?.ok) {
        updateLoginMessage(result?.message || "No se pudo iniciar sesión.");
      }
    }
  });
};

const init = () => {
  loadInitialData();
  render();
  bindUIEvents();
  const note = document.querySelector("#firebase-note");
  if (note) {
    note.textContent = firebaseNotes.message;
  }
};

window.inventoryApp = {
  setView,
  handleLogout,
  handleLogin
};

window.addEventListener("DOMContentLoaded", init);
