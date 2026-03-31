/* eslint-disable no-console */

interface Logger {
    error(message: unknown, ...args: unknown[]): void;
    info(message: unknown, ...args: unknown[]): void;
}

class DefaultLogger implements Logger {
    public error(message: unknown, ...args: unknown[]): void {
        console.error(message, ...args);
    }
    public info(message: unknown, ...args: unknown[]): void {
        console.log(message, ...args);
    }
}

const defaultLogger: DefaultLogger = new DefaultLogger();

export type { Logger, DefaultLogger };
export default defaultLogger;

/**
 * Returns a logger, with the component name included in the log messages.
 * @param componentName The name of the component.
 * @returns The logger object.
 */
export function withComponentName(componentName: string): Logger {
    return {
        error: (message: unknown, ...args: unknown[]): void => {
            console.error(`[%c${componentName}%c] ` + message, ...[ "color: #6085ae; font-weight: bold;", "", ...args ]);
        },
        info: (message: unknown, ...args: unknown[]): void => {
            console.log(`[%c${componentName}%c] ` + message, ...[ "color: #6085ae; font-weight: bold;", "", ...args ]);
        }
    };
}
