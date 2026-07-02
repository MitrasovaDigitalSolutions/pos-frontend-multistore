declare module 'qz-tray' {
    const qz: {
        websocket: {
            connect(): Promise<void>;
            disconnect(): Promise<void>;
            isActive(): boolean;
        };

        security: {
            setCertificatePromise(
                fn: () => Promise<string>
            ): void;

            setSignaturePromise(
                fn: (toSign: string) => Promise<string>
            ): void;
        };

        printers: {
            find(name?: string): Promise<string>;
        };

        configs: {
            create(
                printer: string,
                options?: Record<string, unknown>
            ): unknown;
        };

        print(config: unknown, data: unknown[]): Promise<void>;
    };

    export default qz;
}