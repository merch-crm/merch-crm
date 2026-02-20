import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MerchCRM — Система управления",
  description: "CRM система для управления заказами, складом и производством",
};

export default function Home() {
  redirect("/dashboard");
}
