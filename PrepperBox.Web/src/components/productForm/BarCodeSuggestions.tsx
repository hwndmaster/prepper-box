import React from "react";
import OpenFoodFactsProduct from "@/models/openFoodFactsProduct";
import styles from "./barCodeSuggestions.module.scss";

interface BarCodeSuggestionsProps {
    suggestions: OpenFoodFactsProduct[];
    isLoading: boolean;
    onSelect: (product: OpenFoodFactsProduct) => void;
}

const BarCodeSuggestions: React.FC<BarCodeSuggestionsProps> = ({ suggestions, isLoading, onSelect }) => {
    if (!isLoading && suggestions.length === 0) {
        return null;
    }

    return (
        <div className={styles.container} data-test_id="BarCodeSuggestions__Container">
            {isLoading ? (
                <div className={styles.loading} data-test_id="BarCodeSuggestions__Loading">
                    <i className="pi pi-spin pi-spinner" />
                    <span>Searching OpenFoodFacts...</span>
                </div>
            ) : (
                <ul className={styles.list} data-test_id="BarCodeSuggestions__List">
                    {suggestions.map((product) => (
                        <li
                            key={product.barCode}
                            className={styles.item}
                            data-test_id="BarCodeSuggestions__Item"
                            onClick={() => onSelect(product)}
                        >
                            {product.imageSmallUrl != null && (
                                <img
                                    src={product.imageSmallUrl}
                                    alt={product.productName ?? "Product image"}
                                    className={styles.image}
                                    data-test_id="BarCodeSuggestions__Item_Image"
                                />
                            )}
                            <div className={styles.info}>
                                <span className={styles.name} data-test_id="BarCodeSuggestions__Item_Name">
                                    {product.productName ?? "(no name)"}
                                </span>
                                {product.brands != null && (
                                    <span className={styles.manufacturer} data-test_id="BarCodeSuggestions__Item_Manufacturer">
                                        {product.brands}
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BarCodeSuggestions;
