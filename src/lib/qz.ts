import qz from "qz-tray";

export async function connectPrinter() {
    if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
    }
}