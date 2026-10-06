import { createActionWithMeta } from "@hwndmaster/atom-react-redux";
import ImageSearchResult from "@/models/imageSearchResult";

export const searchImages = createActionWithMeta<string, ImageSearchResult[]>("imageSearch/searchImages");
