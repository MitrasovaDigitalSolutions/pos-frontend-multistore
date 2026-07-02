declare module 'qz-tray' {
    const qz: {
        websocket: {
            connect(): Promise<void>;
            disconnect(): Promise<void>;
            isActive(): boolean;
        };

        security: {
            setCertificatePromise(
                fn: (resolve: (certificate?: string) => void, reject: (error: unknown) => void) => void
            ): void;

            setSignaturePromise(
                fn: (toSign: string) => (resolve: (signature?: string) => void, reject: (error: unknown) => void) => void
            ): void;
        };

        printers: {
            find(name?: string): Promise<string | string[]>;
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