import {
  collection,
  deleteDoc,
  doc,
  firestoreDb,
  onSnapshot,
  saveToolToFirebase,
  setDoc
} from "./firebase.js";

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

const localState = {
  tools: structuredClone(seedData.tools),
  locations: structuredClone(seedData.locations),
  movements: structuredClone(seedData.movements)
};

const subscribers = new Set();

const notifySubscribers = () => {
  const snapshot = getState();
  subscribers.forEach((callback) => callback(snapshot));
};

const getState = () => localState;

const updateState = (partial) => {
  Object.assign(localState, partial);
  notifySubscribers();
};

const normalizeSnapshot = (docs) =>
  docs.map((docItem) => ({
    ...docItem.data(),
    id: docItem.id
  }));

const watchCollection = (path, onUpdate) =>
  onSnapshot(collection(firestoreDb, path), (snapshot) => {
    onUpdate(normalizeSnapshot(snapshot.docs));
  });

const startFirebaseSync = () => {
  if (startFirebaseSync.started) return;
  startFirebaseSync.started = true;

  watchCollection("tools", (tools) => updateState({ tools }));
  watchCollection("locations", (locations) => updateState({ locations }));
  watchCollection("movements", (movements) => updateState({ movements }));
};

const bootstrapCollection = async (path, items) => {
  const ref = collection(firestoreDb, path);
  const existing = await new Promise((resolve) => {
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      unsubscribe();
      resolve(snapshot.docs.length);
    });
  });

  if (existing > 0) return;

  await Promise.all(
    items.map((item) => {
      if (!item?.id) return Promise.resolve();
      return setDoc(doc(firestoreDb, path, item.id), item, { merge: true });
    })
  );
};

const ensureSeedData = async () => {
  await bootstrapCollection("locations", seedData.locations);
  await bootstrapCollection("tools", seedData.tools);
  await bootstrapCollection("movements", seedData.movements);
};

export const dataService = {
  async init() {
    await ensureSeedData();
    startFirebaseSync();
  },
  getTools() {
    return getState().tools;
  },
  getLocations() {
    return getState().locations;
  },
  getMovements() {
    return getState().movements;
  },
  subscribe(callback) {
    subscribers.add(callback);
    callback(getState());
    return () => subscribers.delete(callback);
  },
  addMovement(movement) {
    updateState({ movements: [...getState().movements, movement] });
    if (movement?.id) {
      setDoc(doc(firestoreDb, "movements", movement.id), movement, { merge: true }).catch((error) => {
        console.error("No se pudo guardar el movimiento en Firebase.", error);
      });
    }
  },
  updateTool(tool) {
    updateState({
      tools: getState().tools.map((item) => (item.id === tool.id ? tool : item))
    });
    saveToolToFirebase(tool).catch((error) => {
      console.error("No se pudo actualizar la herramienta en Firebase.", error);
    });
  },
  addTool(tool) {
    updateState({ tools: [...getState().tools, tool] });
    saveToolToFirebase(tool).catch((error) => {
      console.error("No se pudo guardar la herramienta en Firebase.", error);
    });
  },
  addLocation(location) {
    updateState({ locations: [...getState().locations, location] });
    if (location?.id) {
      setDoc(doc(firestoreDb, "locations", location.id), location, { merge: true }).catch((error) => {
        console.error("No se pudo guardar la ubicación en Firebase.", error);
      });
    }
  },
  updateLocation(location) {
    updateState({
      locations: getState().locations.map((loc) => (loc.id === location.id ? location : loc))
    });
    if (location?.id) {
      setDoc(doc(firestoreDb, "locations", location.id), location, { merge: true }).catch((error) => {
        console.error("No se pudo actualizar la ubicación en Firebase.", error);
      });
    }
  },
  deleteLocation(locationId) {
    updateState({
      locations: getState().locations.filter((loc) => loc.id !== locationId)
    });
    deleteDoc(doc(firestoreDb, "locations", locationId)).catch((error) => {
      console.error("No se pudo eliminar la ubicación en Firebase.", error);
    });
  },
  deleteTool(toolId) {
    updateState({ tools: getState().tools.filter((tool) => tool.id !== toolId) });
    deleteDoc(doc(firestoreDb, "tools", toolId)).catch((error) => {
      console.error("No se pudo eliminar la herramienta en Firebase.", error);
    });
  }
};
