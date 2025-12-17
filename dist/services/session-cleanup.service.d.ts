export declare class SessionCleanupService {
    private authService;
    private intervalId;
    constructor();
    start(): void;
    stop(): void;
    private cleanup;
    manualCleanup(): Promise<number>;
}
export declare const sessionCleanupService: SessionCleanupService;
//# sourceMappingURL=session-cleanup.service.d.ts.map