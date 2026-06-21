/* ============================================================
   BOTÓN FLOTANTE DE WHATSAPP
   Módulo independiente: se puede incluir en cualquier página
   agregando <script src="js/whatsapp-float.js"></script>
   después de config.js. No depende de Store ni de las citas,
   así que no afecta nada de la lógica de reservas.
   ============================================================ */

function mountWhatsAppFloat() {
  // Evita duplicados si el script se incluye más de una vez
  if (document.getElementById("waFloat")) return;

  const digits = (CONFIG.whatsappNumber || "").replace(/[^0-9]/g, "");
  if (!digits) return; // sin número configurado, no se muestra el botón

  const message = CONFIG.floatingWhatsappMessage || "Hola, quiero más información";
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  const link = document.createElement("a");
  link.id = "waFloat";
  link.className = "wa-float";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.setAttribute("aria-label", "Escribir por WhatsApp");

  link.innerHTML = `
    <span class="wa-float-ping" aria-hidden="true"></span>
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <path fill="currentColor" d="M16.01 3C9.39 3 4 8.36 4 14.94c0 2.27.63 4.41 1.74 6.24L4 29l8.06-1.67a13.1 13.1 0 0 0 3.95.61h.01c6.62 0 12-5.36 12-11.94C28.02 8.36 22.64 3 16.01 3Zm0 21.78h-.01c-1.24 0-2.46-.33-3.53-.96l-.25-.15-4.78.99 1.01-4.62-.16-.27a9.7 9.7 0 0 1-1.5-5.19c0-5.43 4.46-9.85 9.93-9.85 2.65 0 5.14 1.03 7.01 2.9a9.74 9.74 0 0 1 2.9 6.95c0 5.43-4.46 9.85-9.92 9.85Zm5.42-7.38c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.5-.17-.01-.37-.01-.57-.01s-.52.07-.8.37c-.27.3-1.04 1.02-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z"/>
    </svg>
  `;

  document.body.appendChild(link);
}

document.addEventListener("DOMContentLoaded", mountWhatsAppFloat);
