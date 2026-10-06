import React, { useState } from "react";
import { Button, Dialog, InputText } from "@/primereact";
import * as store from "@/store";
import ImageSearchResult from "@/models/imageSearchResult";
import styles from "./imageSearchDialog.module.scss";

interface ImageSearchDialogProps {
    visible: boolean;
    /** The query the search box is reset to whenever the dialog opens. */
    initialQuery: string;
    onSelect: (image: ImageSearchResult) => void;
    onHide: () => void;
}

/** Where the image was found and how big it is, e.g. "shop.com · 1200×900". */
function describeImage(image: ImageSearchResult): string {
    const size = image.width != null && image.height != null ? `${image.width}×${image.height}` : undefined;
    return [image.sourceName, size].filter((part) => part != null && part !== "").join(" · ");
}

const ImageSearchDialog: React.FC<ImageSearchDialogProps> = ({ visible, initialQuery, onSelect, onHide }) => {
    const dispatch = store.useAppDispatch();
    const [query, setQuery] = useState(initialQuery);
    // Undefined until a search succeeds, so "not searched yet" reads differently from "nothing found".
    const [images, setImages] = useState<ImageSearchResult[]>();
    const [isSearching, setIsSearching] = useState(false);
    const [isPreviouslyVisible, setIsPreviouslyVisible] = useState(visible);

    // Starts over whenever the dialog opens, from the query the caller passes at that point. Adjusted
    // while rendering rather than in the Dialog's onShow, which only fires once the opening animation
    // ends and so would briefly show the previous search.
    if (visible !== isPreviouslyVisible) {
        setIsPreviouslyVisible(visible);
        if (visible) {
            setQuery(initialQuery);
            setImages(undefined);
        }
    }

    // Searches only on request: every search spends one of the provider's monthly searches.
    const handleSearch = (): void => {
        const trimmedQuery = query.trim();
        if (trimmedQuery === "") {
            return;
        }
        setIsSearching(true);
        dispatch(store.ImageSearch.Actions.searchImages(trimmedQuery, (results) => {
            setImages(results ?? []);
            setIsSearching(false);
        }, () => {
            // The saga has already told the user what went wrong.
            setIsSearching(false);
        }));
    };

    const renderResults = (): React.ReactNode => {
        if (isSearching) {
            return (
                <div className={styles.message} data-test_id="ImageSearchDialog__Loading">
                    <i className="pi pi-spin pi-spinner" />
                    <span>Searching images...</span>
                </div>
            );
        }
        if (images == null) {
            return (
                <div className={styles.message} data-test_id="ImageSearchDialog__Hint">
                    Search, then click an image to make it the product image.
                </div>
            );
        }
        if (images.length === 0) {
            return (
                <div className={styles.message} data-test_id="ImageSearchDialog__No_Results">
                    No images found. Try different search terms.
                </div>
            );
        }
        return (
            <div className={styles.imageGrid}>
                {images.map((image) => (
                    <button
                        key={image.imageUrl}
                        type="button"
                        className={styles.imageTile}
                        title={image.title}
                        data-test_id="ImageSearchDialog__Image"
                        onClick={() => onSelect(image)}
                    >
                        <img
                            src={image.thumbnailUrl}
                            alt={image.title ?? "Image search result"}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                        />
                        <span className={styles.imageCaption}>{describeImage(image)}</span>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <Dialog
            header="Find Product Image"
            visible={visible}
            onHide={onHide}
            modal
            className={styles.dialog}
            data-test_id="ImageSearchDialog__Dialog"
        >
            <div className={styles.searchBar}>
                <InputText
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                    placeholder="Manufacturer and product name"
                    className={styles.queryInput}
                    data-test_id="ImageSearchDialog__Query"
                />
                <Button
                    type="button"
                    label="Search"
                    icon="pi pi-search"
                    loading={isSearching}
                    disabled={query.trim() === ""}
                    data-test_id="ImageSearchDialog__Search"
                    onClick={handleSearch}
                />
            </div>
            <div className={styles.results} data-test_id="ImageSearchDialog__Results">
                {renderResults()}
            </div>
        </Dialog>
    );
};

export default ImageSearchDialog;
