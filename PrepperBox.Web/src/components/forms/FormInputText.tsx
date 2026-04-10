import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { FloatLabel, InputText } from "@/primereact";
import type { InputTextProps } from "@/primereact";
import styles from "./forms.module.scss";

interface FormInputTextProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    inputProps?: Omit<InputTextProps, "id" | "value" | "onChange" | "onBlur">;
    className?: string;
}

export const FormInputText = <TFieldValues extends FieldValues>({
    name,
    form,
    label,
    inputProps,
    className
}: FormInputTextProps<TFieldValues>): React.ReactElement => {
    const error = form.formState.errors[name];

    return (
        <div className={className ?? styles.fieldWrapper}>
            <FloatLabel>
                <Controller
                    name={name}
                    control={form.control}
                    render={({ field }) => (
                        <InputText
                            id={name}
                            {...field}
                            value={field.value ?? ""}
                            {...inputProps}
                        />
                    )}
                />
                <label htmlFor={name}>{label}</label>
                {error !== undefined && (
                    <small className="p-error">{String(error.message)}</small>
                )}
            </FloatLabel>
        </div>
    );
};
