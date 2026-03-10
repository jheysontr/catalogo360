const PrivacyPolicy = () => (
  <div className="container max-w-3xl py-12 px-4">
    <h1 className="font-display text-3xl font-bold text-foreground mb-6">Política de Privacidad</h1>
    <p className="text-sm text-muted-foreground mb-8">Última actualización: 10 de marzo de 2026</p>

    <div className="prose prose-sm dark:prose-invert space-y-6 text-foreground/80">
      <section>
        <h2 className="text-xl font-semibold text-foreground">1. Información que Recopilamos</h2>
        <p>Recopilamos la siguiente información cuando utilizas Catalogo360:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Datos de registro:</strong> nombre completo, correo electrónico y nombre del negocio.</li>
          <li><strong>Datos de la tienda:</strong> productos, categorías, imágenes, precios y configuración de la tienda.</li>
          <li><strong>Datos de pedidos:</strong> información de clientes (nombre, correo, teléfono) y detalles de los pedidos.</li>
          <li><strong>Datos de uso:</strong> interacciones con la plataforma, páginas visitadas y funcionalidades utilizadas.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">2. Cómo Usamos tu Información</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proporcionar, mantener y mejorar nuestros servicios.</li>
          <li>Procesar y gestionar tus pedidos y los de tus clientes.</li>
          <li>Enviarte notificaciones relacionadas con tu cuenta y tienda.</li>
          <li>Personalizar tu experiencia en la plataforma.</li>
          <li>Prevenir fraudes y garantizar la seguridad de la plataforma.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">3. Compartición de Datos</h2>
        <p>No vendemos ni alquilamos tu información personal a terceros. Podemos compartir información en los siguientes casos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Con proveedores de servicios que nos ayudan a operar la plataforma.</li>
          <li>Cuando sea requerido por ley o proceso legal.</li>
          <li>Para proteger nuestros derechos, privacidad, seguridad o propiedad.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">4. Almacenamiento y Seguridad</h2>
        <p>Tus datos se almacenan en servidores seguros con encriptación. Implementamos medidas técnicas y organizativas para proteger tu información contra acceso no autorizado, alteración o destrucción.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">5. Tus Derechos</h2>
        <p>Tienes derecho a:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Acceder</strong> a tus datos personales almacenados en la plataforma.</li>
          <li><strong>Rectificar</strong> cualquier información incorrecta o desactualizada.</li>
          <li><strong>Eliminar</strong> tu cuenta y datos asociados.</li>
          <li><strong>Exportar</strong> tus datos en un formato portable.</li>
          <li><strong>Oponerte</strong> al procesamiento de tus datos para fines específicos.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
        <p>Utilizamos cookies esenciales para el funcionamiento de la plataforma, incluyendo autenticación y preferencias de sesión. No utilizamos cookies de seguimiento con fines publicitarios.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">7. Retención de Datos</h2>
        <p>Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, tus datos serán eliminados dentro de los 30 días siguientes, salvo que la ley exija su conservación por un período mayor.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">8. Cambios en esta Política</h2>
        <p>Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios significativos a través de la plataforma o por correo electrónico.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">9. Contacto</h2>
        <p>Para consultas sobre privacidad, contáctanos en soporte@catalogo360.com.</p>
      </section>
    </div>
  </div>
);

export default PrivacyPolicy;
