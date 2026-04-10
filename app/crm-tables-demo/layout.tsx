import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Table Designs Demo | MerchCRM",
  description: "Explore 10 different premium table designs and data visualization layouts.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
