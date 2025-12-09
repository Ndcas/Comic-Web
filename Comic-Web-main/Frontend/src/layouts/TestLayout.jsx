import { Outlet } from "react-router";

export default function TestLayout() {
    return (
        <>
            <h1>Test Layout</h1>
            <Outlet />
        </>
    );
}