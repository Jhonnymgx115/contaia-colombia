// Proceso principal de ContaIA Colombia (Electron).
// Orquesta: PostgreSQL embebida → servidor Next.js → ventana.

const { app, BrowserWindow, Menu } = require("electron");
const path = require("node:path");
const { iniciarPostgres, iniciarServidorNext } = require("./servicios.cjs");

const PUERTO_APP = 38501; // alto y fijo para evitar colisiones
let ventana = null;
let postgres = null;
let servidor = null;

async function crearVentana() {
  ventana = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    title: "ContaIA Colombia",
    backgroundColor: "#f8fafc",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  await ventana.loadURL(`http://127.0.0.1:${PUERTO_APP}`);
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null); // interfaz limpia para usuarios no técnicos
  const directorioDatos = app.getPath("userData"); // ~/AppData | ~/.config | ~/Library

  try {
    postgres = await iniciarPostgres(directorioDatos);
    const servidorEmpaquetado = app.isPackaged
      ? path.join(process.resourcesPath, "app-standalone")
      : path.join(__dirname, "..", ".next", "standalone");
    servidor = await iniciarServidorNext(servidorEmpaquetado, postgres.url, PUERTO_APP);
    await crearVentana();
  } catch (error) {
    const { dialog } = require("electron");
    dialog.showErrorBox(
      "ContaIA Colombia no pudo iniciar",
      `Revise que el puerto ${PUERTO_APP} no esté en uso e intente de nuevo.\n\nDetalles: ${error}`,
    );
    app.quit();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", async (evento) => {
  if (servidor || postgres) {
    evento.preventDefault();
    if (servidor) { servidor.kill(); servidor = null; }
    if (postgres) { await postgres.detener(); postgres = null; }
    app.quit();
  }
});
