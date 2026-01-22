export const renderLogin = ({ actions }) => {
  return `
    <div class="login-layout">
      <div class="login-card">
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
          Nombre
          <input type="text" id="login-name" placeholder="Nombre completo" />
        </label>
        <label>
          Rol
          <select id="login-role">
            <option value="operador">Operador</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
            <option value="lector">Lector</option>
          </select>
        </label>
        <button class="button" id="login-btn">Iniciar sesión</button>
        <span id="firebase-note" class="tag"></span>
      </div>
    </div>
    <script type="module">
      const button = document.querySelector('#login-btn');
      button?.addEventListener('click', () => {
        const email = document.querySelector('#login-email').value;
        const name = document.querySelector('#login-name').value;
        const role = document.querySelector('#login-role').value;
        if (!email) {
          alert('Por favor ingresa tu correo.');
          return;
        }
        window.inventoryApp.handleLogin({ email, name, role });
      });
    </script>
  `;
};
