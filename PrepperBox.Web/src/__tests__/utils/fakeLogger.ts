/**
 * This is a fake logger for testing purposes.
 * NOTE: This module must be imported before the modules which use the logger functions.
 */

import * as logger from "@/shared/logger";
import defaultLogger from "@/shared/logger";

interface FakeLoggerEntry {
    component?: string;
    message: unknown;
    args: unknown[];
}

class FakeLogger implements logger.Logger {
    protected errorEntries: FakeLoggerEntry[] = [];
    protected infoEntries: FakeLoggerEntry[] = [];

    public error(message: unknown, ...args: unknown[]): void {
        this.errorEntries.push({ message, args: args.flat() });
    }

    public info(message: unknown, ...args: unknown[]): void {
        this.infoEntries.push({ message, args });
    }

    public addError(entry: FakeLoggerEntry): void {
        this.errorEntries.push(entry);
    }

    public addInfo(entry: FakeLoggerEntry): void {
        this.infoEntries.push(entry);
    }

    public reset(): void {
        this.errorEntries = [];
        this.infoEntries = [];
    }

    public get errors(): Readonly<FakeLoggerEntry[]> {
        return this.errorEntries;
    }

    public get infos(): Readonly<FakeLoggerEntry[]> {
        return this.infoEntries;
    }
}

class FakeLoggerWithComponentName implements logger.Logger {
    constructor(private readonly componentName: string, private readonly logger: FakeLogger) {
    }

    public error(message: unknown, ...args: unknown[]): void {
        this.logger.addError({ component: this.componentName, message, args: args.flat() });
    }

    public info(message: unknown, ...args: unknown[]): void {
        this.logger.addInfo({ component: this.componentName, message, args });
    }
}

const fakeLogger = new FakeLogger();

vi.spyOn(defaultLogger, "error").mockImplementation((message: unknown, ...args: unknown[]) => {
    fakeLogger.error(message, args);
});

vi.spyOn(defaultLogger, "info").mockImplementation((message: unknown, ...args: unknown[]) => {
    fakeLogger.info(message, args);
});

vi.spyOn(logger, "withComponentName").mockImplementation((componentName: string) => {
    return new FakeLoggerWithComponentName(componentName, fakeLogger);
});

export default fakeLogger;
