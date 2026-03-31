import { FC, ReactNode, memo } from "react";
import { shallowEqual } from "react-redux";
import { useAppSelector } from "@/store/setup";
import LoadingTargets from "@/shared/loadingTargets";
import CircularProgress from "../circularProgress/circularProgress";
import styles from "./loadingSpinner.module.scss";

interface LoadingSpinnerProps {
    target: LoadingTargets;
    children: ReactNode;
}

const LoadingSpinnerComponent: FC<LoadingSpinnerProps> = (props) => {
    const isActive = useAppSelector((state) => (state.common.loadingTargets[props.target] ?? 0) > 0, shallowEqual);

    return (
        <div
            className={styles.loadingSpinnerContainer}
            data-testid={`LoadingSpinner__${props.target}`}
            data-loading={isActive}
        >
            <div className={styles.loadingSpinner}>
                <CircularProgress />
            </div>
            <div className={styles.loadingSpinnerContent}>{props.children}</div>
        </div>
    );
};

const LoadingSpinner = memo(LoadingSpinnerComponent);

export default LoadingSpinner;
