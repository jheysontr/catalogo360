const TermsOfService = () => (
  <div className="container max-w-3xl py-12 px-4">
    <h1 className="font-display text-3xl font-bold text-foreground mb-6">Términos de Servicio</h1>
    <p className="text-sm text-muted-foreground mb-8">Última actualización: 10 de marzo de 2026</p>

    <div className="prose prose-sm dark:prose-invert space-y-6 text-foreground/80">
      <section>
        <h2 className="text-xl font-semibold text-foreground">1. Aceptación de los Términos</h2>
        <p>Al acceder y utilizar Catalogo360, aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguno de estos términos, no debes utilizar la plataforma.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">2. Descripción del Servicio</h2>
        <p>Catalogo360 es una plataforma que permite a los usuarios crear y gestionar catálogos de productos en línea, tiendas virtuales y páginas de enlaces (Linkbox). El servicio incluye herramientas de administración de productos, procesamiento de pedidos y personalización de tiendas.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">3. Registro y Cuenta</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Debes proporcionar información veraz y actualizada al crear tu cuenta.</li>
          <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
          <li>Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.</li>
          <li>Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">4. Uso Aceptable</h2>
        <p>Te comprometes a no utilizar la plataforma para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Publicar contenido ilegal, fraudulento o engañoso.</li>
          <li>Vender productos prohibidos por la ley aplicable.</li>
          <li>Infringir derechos de propiedad intelectual de terceros.</li>
          <li>Intentar acceder a datos o cuentas de otros usuarios sin autorización.</li>
          <li>Realizar actividades que puedan dañar o sobrecargar la infraestructura del servicio.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">5. Contenido del Usuario</h2>
        <p>Conservas todos los derechos sobre el contenido que publicas en la plataforma. Al subir contenido, nos otorgas una licencia limitada para mostrar, distribuir y procesar dicho contenido exclusivamente para la prestación del servicio.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">6. Planes y Pagos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Los planes de pago se facturan de forma mensual o anual según la opción seleccionada.</li>
          <li>Los precios pueden cambiar con previo aviso de al menos 30 días.</li>
          <li>Las cancelaciones son efectivas al final del período de facturación actual.</li>
          <li>No se realizan reembolsos por períodos parciales.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">7. Limitación de Responsabilidad</h2>
        <p>Catalogo360 se proporciona "tal cual". No garantizamos la disponibilidad ininterrumpida del servicio. En ningún caso seremos responsables por daños indirectos, incidentales o consecuentes derivados del uso de la plataforma.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">8. Modificaciones</h2>
        <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones serán efectivas una vez publicadas en la plataforma. El uso continuado del servicio constituye la aceptación de los términos modificados.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">9. Contacto</h2>
        <p>Para consultas relacionadas con estos términos, puedes contactarnos a través de la plataforma o enviando un correo a soporte@catalogo360.com.</p>
      </section>
    </div>
  </div>
);

export default TermsOfService;
