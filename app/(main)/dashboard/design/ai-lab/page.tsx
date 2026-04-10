import { Metadata } from "next";
import { AiLabClientWrapper } from "./client-wrapper";

export const metadata: Metadata = {
  title: "AI Design Lab | MerchCRM",
  description: "AI-powered tools for design and print preparation.",
};

export default function AiLabPage() {
  return (
    <div className="flex-1 space-$1-3 p-8 pt-6">
      <AiLabClientWrapper />
    </div>
  );
}
