import React from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Calendar, CalendarProps, FloatLabel } from "@/primereact";
import { isoDateToLocalDate, localDateToIsoDate } from "@/shared/dateFormat";
import styles from "./formCalendar.module.scss";

/**
 * PrimeReact's notation for the app-wide "DD-MMM-YYYY" format that `formatDate` produces, e.g. "19-Oct-2026":
 * `dd` is the zero-padded day, `M` the short month name and `yy` the four-digit year.
 */
const DateFormat = "dd-M-yy";

interface FormCalendarProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
    label: string;
    inputProps?: Omit<CalendarProps, "id" | "inputId" | "value" | "onChange" | "onBlur" | "selectionMode" | "dateFormat">;
    className?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "data-test_id"?: string;
}

/**
 * A date picker for a form field holding an ISO "YYYY-MM-DD" date, the shape `inputDateToTicks` reads.
 * Shows the date as "DD-MMM-YYYY" whatever the browser locale, which a native date input cannot do:
 * that one always follows the locale, e.g. MM/DD/YYYY on an en-US browser.
 * Laid out like the atom-react-prime Form* components: a floating label and the error underneath.
 */
const FormCalendar = <TFieldValues extends FieldValues>({
    name,
    form,
    label,
    inputProps,
    className,
    "data-test_id": dataTestId
}: FormCalendarProps<TFieldValues>): React.ReactElement => {
    const error = form.formState.errors[name];

    return (
        <div className={className ?? styles.fieldWrapper}>
            <FloatLabel>
                <Controller
                    name={name}
                    control={form.control}
                    render={({ field }) => (
                        <Calendar
                            inputId={name}
                            value={typeof field.value === "string" ? isoDateToLocalDate(field.value) : undefined}
                            onChange={(e) => field.onChange(localDateToIsoDate(e.value))}
                            onBlur={field.onBlur}
                            dateFormat={DateFormat}
                            // Picked rather than typed: on a phone, typing would also bring up the keyboard
                            // over the calendar. The button bar's Clear empties an optional date.
                            readOnlyInput
                            showButtonBar
                            showIcon
                            className={styles.calendar}
                            {...inputProps}
                            data-test_id={dataTestId}
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

export default FormCalendar;
