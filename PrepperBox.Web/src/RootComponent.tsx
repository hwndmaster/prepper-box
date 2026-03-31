import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppRoutes from "./shared/routes";
import Layout from "./components/layout/Layout";
import Home from "./pages/home";
import Categories from "./pages/categories";
import Error from "./pages/error";
import NotFound from "./pages/notFound";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <Error />,
        children: [
            {
                path: AppRoutes.Default.path,
                element: <Home />,
            },
            {
                path: AppRoutes.Categories.path,
                element: <Categories />,
            },
            {
                path: "*",
                element: <NotFound />,
            },
        ],
    },
]);

const RootComponent: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default RootComponent;
