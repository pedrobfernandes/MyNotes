import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";


export const metadata: Metadata = { title: "Dashboard" };


export default function Page()
{
    return(
        <Suspense fallback={null}>
            <DashboardClient/>
        </Suspense>
    );
}
