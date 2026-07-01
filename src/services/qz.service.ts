import qz from "qz-tray";

class QZService {

    async connect() {
        if (!qz.websocket.isActive()) {
            await qz.websocket.connect();
        }
    }

    async disconnect() {
        if (qz.websocket.isActive()) {
            await qz.websocket.disconnect();
        }
    }

    async print(printer: string, text: string) {

        await this.connect();

        const config = qz.configs.create(printer);

        await qz.print(config, [
            {
                type: "raw",
                format: "plain",
                data: text
            }
        ]);
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new QZService();