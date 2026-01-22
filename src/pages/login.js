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
          Contraseña
          <input type="password" id="login-password" placeholder="Ingresa tu contraseña" />
        </label>
        <button class="button" id="login-btn">Iniciar sesión</button>
        <span id="firebase-note" class="tag"></span>
      </div>
    </div>
    <script type="module">
      const button = document.querySelector('#login-btn');
      button?.addEventListener('click', () => {
        const email = document.querySelector('#login-email').value;
        const password = document.querySelector('#login-password').value;
        if (!email) {
          alert('Por favor ingresa tu correo.');
          return;
        }
        if (!password) {
          alert('Por favor ingresa tu contraseña.');
          return;
        }
        window.inventoryApp.handleLogin({ email, password });
      });
    </script>
  `;
};
