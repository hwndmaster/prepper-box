import React, { useState } from "react";
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
                        const max = trackedProduct?.quantity ?? 1;
                        const val = e.value ?? 1;
                        setQuantity(Math.min(Math.max(val, 1), max));
                    }}
                    min={1}
                    max={trackedProduct?.quantity ?? 1}
                    showButtons
                    data-test_id="WithdrawStockDialog__Quantity"
                />
                <div className={styles.withdrawActions}>
                    <Button
                        label="Withdraw"
                        severity="warning"
                        data-test_id="WithdrawStockDialog__Confirm"
                        onClick={() => onConfirm(quantity)}
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
