import LoadingTargets from "@/shared/loadingTargets";

interface CommonState {
    loadingTargets: Partial<Record<LoadingTargets, number>>;
}

export default CommonState;
