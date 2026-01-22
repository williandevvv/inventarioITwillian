const STORAGE_KEY = "it_inventory_data_v1";

const seedData = {
  tools: [
    {
      id: "tool-1",
      name: "Crimpeadora RJ45",
      category: "Redes",
      brand: "ProTech",
      model: "CR-500",
      description: "Crimpeadora profesional para conectores RJ45 y RJ11.",
      unit: "pieza",
      qty_total: 4,
      qty_available: 3,
      min_qty: 2,
      status: "disponible",
      location_id: "loc-1",
      location_name_cache: "Bodega",
      photos: [
        "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=600&q=80"
      ],
      code: "IT-CR-500",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      movements: []
    },
    {
      id: "tool-2",
      name: "Laptop Soporte Dell",
      category: "Equipos",
      brand: "Dell",
      model: "Latitude 5420",
      description: "Laptop de soporte con herramientas diagnósticas.",
      unit: "pieza",
      qty_total: 2,
      qty_available: 2,
      min_qty: 1,
      status: "disponible",
      location_id: "loc-2",
      location_name_cache: "Oficina",
      photos: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
      ],
      code: "IT-LAP-5420",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      movements: []
    },
    {
      id: "tool-3",
      name: "Tester de Cableado",
      category: "Diagnóstico",
      brand: "NetScan",
      model: "NT-100",
      description: "Tester portátil para cables UTP y coaxial.",
      unit: "pieza",
      qty_total: 1,
      qty_available: 1,
      min_qty: 1,
      status: "en reparación",
      location_id: "loc-3",
      location_name_cache: "Mochila Soporte",
      photos: [
        "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=600&q=80"
      ],
      code: "IT-TST-100",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      movements: []
    }
  ],
  locations: [
    { id: "loc-1", name: "Bodega", description: "Almacén principal", active: true },
    { id: "loc-2", name: "Oficina", description: "Área de soporte", active: true },
    { id: "loc-3", name: "Mochila Soporte", description: "Kit móvil", active: true }
  ],
  movements: [],
  users: [
    { uid: "demo-1", name: "Willian Admin", email: "admin@demo.com", role: "admin", active: true }
  ]
};

const loadState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return structuredClone(seedData);
  }
  return JSON.parse(raw);
};

const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const getState = () => {
  if (!window.__inventoryState) {
    window.__inventoryState = loadState();
  }
  return window.__inventoryState;
};

const updateState = (partial) => {
  const current = getState();
  window.__inventoryState = { ...current, ...partial };
  saveState(window.__inventoryState);
};

export const dataService = {
  getTools() {
    return getState().tools;
  },
  getLocations() {
    return getState().locations;
  },
  getMovements() {
    return getState().movements;
  },
  addMovement(movement) {
    const state = getState();
    const updated = [...state.movements, movement];
    updateState({ movements: updated });
  },
  updateTool(tool) {
    const state = getState();
    const updatedTools = state.tools.map((item) => (item.id === tool.id ? tool : item));
    updateState({ tools: updatedTools });
  },
  addTool(tool) {
    const state = getState();
    updateState({ tools: [...state.tools, tool] });
  },
  addLocation(location) {
    const state = getState();
    updateState({ locations: [...state.locations, location] });
  },
  updateLocation(location) {
    const state = getState();
    const updated = state.locations.map((loc) => (loc.id === location.id ? location : loc));
    updateState({ locations: updated });
  },
  deleteLocation(locationId) {
    const state = getState();
    updateState({ locations: state.locations.filter((loc) => loc.id !== locationId) });
  },
  deleteTool(toolId) {
    const state = getState();
    updateState({ tools: state.tools.filter((tool) => tool.id !== toolId) });
  }
};
