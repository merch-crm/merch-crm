import { Suspense } from "react";
import { Metadata } from "next";
import { PageContainer } from "@/components/ui/page-container";
import { CalculatorsSkeleton } from "./components/calculators-skeleton";

export const metadata: Metadata = {
    title: "Калькуляторы печати | Производство",
    description: "Расчёт себестоимости и раскладки принтов",
};

interface CalculatorsLayoutProps {
    children: React.ReactNode;
}

export default function CalculatorsLayout({ children }: CalculatorsLayoutProps) {
    return (
        <PageContainer>
            <Suspense fallback={<CalculatorsSkeleton />}>
                {children}
            </Suspense>
        </PageContainer>
    );
}
