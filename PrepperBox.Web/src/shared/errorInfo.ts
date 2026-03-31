import { AxiosError } from "axios";

export type RaiseErrorInfo = Error | AxiosError | ErrorInfo | ValidationError | string | unknown;

export interface ErrorInfo {
    message: string;
    title?: string;
}

export interface ValidationError {
    errors: Record<string, string[]>;
    status: number;
    title?: string;
}

export interface HasToastedError extends Error {
    toasted: boolean;
}
