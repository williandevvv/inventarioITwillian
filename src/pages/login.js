export const renderLogin = ({ actions }) => {
  return `
    <div class="login-layout">
      <form class="login-card" id="login-form">
        <div class="brand">
          <div class="brand-logo">IT</div>
          <div>
            <h1>Inventario IT</h1>
            <span class="tag">Acceso seguro</span>
          </div>
        </div>
        <p>Ingresa para administrar herramientas, registrar movimientos y generar reportes.</p>
        <label>
          Correo
          <input type="email" id="login-email" placeholder="usuario@empresa.com" />
        </label>
        <label>
          Contraseña
          <input type="password" id="login-password" placeholder="Ingresa tu contraseña" />
        </label>
        <p id="login-message" class="login-message" role="status" aria-live="polite"></p>
        <button class="button" id="login-btn" type="submit">Iniciar sesión</button>
        <span id="firebase-note" class="tag"></span>
      </form>
    </div>
  `;
};
