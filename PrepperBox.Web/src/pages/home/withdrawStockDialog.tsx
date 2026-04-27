import React, { useState } from "react";
import { toastService } from "@hwndmaster/atom-react-prime";
import { Button, Dialog, InputNumber } from "@/primereact";
import TrackedProduct from "@/models/trackedProduct";
import styles from "./withdrawStockDialog.module.scss";

interface WithdrawStockDialogProps {
    trackedProduct: TrackedProduct | null;
    visible: boolean;
    onConfirm: (quantity: number) => void;
    onCancel: () => void;
}

const WithdrawStockDialog: React.FC<WithdrawStockDialogProps> = ({ trackedProduct, visible, onConfirm, onCancel }) => {
    const [quantity, setQuantity] = useState<number>(1);

    const handleShow = (): void => {
        setQuantity(1);
    };

    const handleConfirm = (): void => {
        if (quantity <= 0) {
            toastService.showError("Quantity to withdraw must be greater than zero.");
            return;
        }
        onConfirm(quantity);
    };

    return (
        <Dialog
            header="Withdraw Stock"
            visible={visible}
            onHide={onCancel}
            onShow={handleShow}
            className={styles.withdrawDialog}
            data-test_id="WithdrawStockDialog__Dialog"
        >
            <div className={styles.withdrawContent}>
                <p>Select the quantity to withdraw:</p>
                <InputNumber
                    value={quantity}
                    onValueChange={(e) => {
                        const max = trackedProduct?.quantity ?? 0;
                        const val = e.value ?? 0;
                        setQuantity(Math.min(Math.max(val, 0), max));
                    }}
                    min={0}
                    max={trackedProduct?.quantity ?? undefined}
                    minFractionDigits={0}
                    maxFractionDigits={4}
                    showButtons
                    className={styles.quantityInput}
                    data-test_id="WithdrawStockDialog__Quantity"
                />
                <div className={styles.withdrawActions}>
                    <Button
                        label="Withdraw"
                        severity="warning"
                        data-test_id="WithdrawStockDialog__Confirm"
                        onClick={handleConfirm}
                    />
                    <Button
                        label="Cancel"
                        severity="secondary"
                        outlined
                        data-test_id="WithdrawStockDialog__Cancel"
                        onClick={onCancel}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default WithdrawStockDialog;
