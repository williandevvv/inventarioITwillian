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
        <p id="login-message" class="login-message" role="status" aria-live="polite"></p>
        <button class="button" id="login-btn">Iniciar sesión</button>
        <span id="firebase-note" class="tag"></span>
      </div>
    </div>
    <script type="module">
      const button = document.querySelector('#login-btn');
      const message = document.querySelector('#login-message');
      const setMessage = (text, variant = 'error') => {
        if (!message) return;
        message.textContent = text;
        message.dataset.variant = variant;
        message.classList.toggle('show', Boolean(text));
      };
      button?.addEventListener('click', () => {
        const email = document.querySelector('#login-email').value.trim();
        const password = document.querySelector('#login-password').value;
        if (!email) {
          setMessage('Por favor ingresa tu correo.');
          return;
        }
        if (!password) {
          setMessage('Por favor ingresa tu contraseña.');
          return;
        }
        const result = window.inventoryApp.handleLogin({ email, password });
        if (result?.ok) {
          setMessage('Acceso correcto. Redirigiendo...', 'success');
          return;
        }
        setMessage(result?.message || 'No se pudo iniciar sesión.');
      });
    </script>
  `;
};
