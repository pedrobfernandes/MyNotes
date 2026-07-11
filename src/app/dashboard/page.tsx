import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";


type PageProps =
{
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
};


export const metadata: Metadata = { title: "Dashboard" };

export default async function Page({ searchParams }: PageProps)
{
    const params = await searchParams;
    
    return(

            <DashboardClient
                initialPage={Number(params.page ?? "1")}
                initialSearch={params.search ?? ""}
            />
    );
}
