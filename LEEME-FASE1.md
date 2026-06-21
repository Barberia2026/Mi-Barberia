# Fase 1 — Diseño base

## Qué cambió en esta entrega

- **Banner de bienvenida** (`bienvenida.html`): ahora tiene un fondo
  ilustrado de barbería (espejo con bombillos, silla, navaja, tijeras —
  todo dibujado, sin foto, para evitar temas de derechos de autor) y la
  frase "Cortes modernos, barba y estilo profesional".
- **Tira de iconos** de barbería (corte, máquina, navaja, barba, sillón)
  debajo del nombre, en `bienvenida.html`.
- **Botón flotante de WhatsApp**, fijo en la esquina inferior derecha,
  visible en `index.html` y `bienvenida.html`.
- Ajustes de responsive para que el botón flotante y los iconos se vean
  bien también en tablet.

## Qué NO cambió (a propósito)

`admin.html`, `js/admin.js`, `js/client.js`, `js/store.js` y
`js/dates.js` están exactamente igual que en tu versión original. Es
decir: el sistema de horarios, el calendario de descansos y el flujo de
aceptar/rechazar citas siguen funcionando tal cual ya los probaste.

## Cómo probarlo

1. Descomprime esta carpeta y abre `bienvenida.html` haciendo doble clic
   (no necesitas instalar nada).
2. Mira el banner: el fondo ilustrado, la frase y los 5 iconos.
3. Toca el botón verde de WhatsApp (abajo a la derecha) — debe abrir
   WhatsApp con un mensaje de saludo ya escrito.
4. Dale a "📅 Pedir cita" y agenda una cita de prueba como antes — debe
   funcionar exactamente igual que en tu versión original.
5. Prueba en el celular y en una tablet si puedes (o achicando la
   ventana del navegador en el computador).

## Para personalizar

En `js/config.js` ya puedes editar:

```js
heroPhrase: "Cortes modernos, barba y estilo profesional", // frase del banner
whatsappNumber: "573001234567",                            // tu número real
floatingWhatsappMessage: "Hola, quiero más información 💈", // mensaje del botón flotante
```

## Nota sobre el "logo"

Todavía no tienes un logo como tal — por ahora el poste de barbería
girando hace ese papel (es el elemento visual de marca). Si tienes un
logo real (imagen), lo puedo integrar directamente en el banner cuando
quieras.

---

Cuando confirmes que esto se ve y funciona bien, seguimos con la
**Fase 2: sistema de horarios** (estado gris/bloqueado y descansos de
desayuno/almuerzo por franja horaria, activables desde el panel admin).
