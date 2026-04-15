import React from "react";
import { useZxing } from "react-zxing";
import { Dialog } from "@/primereact";
import styles from "./barcodeScannerDialog.module.scss";

interface BarcodeScannerDialogProps {
    visible: boolean;
    onScan: (barcode: string) => void;
    onCancel: () => void;
}

const ScannerContent: React.FC<{ onScan: (barcode: string) => void }> = ({ onScan }) => {
    const { ref } = useZxing({
        onDecodeResult(result) {
            onScan(result.getText());
        },
    });

    return (
        <div className={styles.scannerContainer}>
            <video ref={ref} data-test_id="Home__BarcodeScanner_Video" />
        </div>
    );
};

const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({ visible, onScan, onCancel }) => {
    return (
        <Dialog
            header="Scan Barcode"
            visible={visible}
            onHide={onCancel}
            modal
            data-test_id="Home__BarcodeScanner_Dialog"
        >
            {visible && <ScannerContent onScan={onScan} />}
        </Dialog>
    );
};

export default BarcodeScannerDialog;
