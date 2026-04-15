import React from "react";
import { Dialog } from "@/primereact";
import Product from "@/models/product";
import styles from "./productSelectionDialog.module.scss";

interface ProductSelectionDialogProps {
    visible: boolean;
    products: Product[];
    onSelect: (product: Product) => void;
    onCancel: () => void;
}

const ProductSelectionDialog: React.FC<ProductSelectionDialogProps> = ({ visible, products, onSelect, onCancel }) => {
    return (
        <Dialog
            header="Select Product"
            visible={visible}
            onHide={onCancel}
            modal
            data-test_id="Home__ProductSelection_Dialog"
        >
            <div className={styles.productList}>
                {products.map((product) => (
                    <div
                        key={product.id}
                        className={styles.productItem}
                        data-test_id="Home__ProductSelection_Item"
                        onClick={() => onSelect(product)}
                    >
                        <div className={styles.productInfo}>
                            <span>{product.name}</span>
                            {product.manufacturer != null && product.manufacturer !== "" && (
                                <span className={styles.productManufacturer}>{product.manufacturer}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Dialog>
    );
};

export default ProductSelectionDialog;
