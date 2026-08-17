import { redirect } from "next/navigation";

export default function LegacyVaultLogPage() {
  redirect("/vault/logs");
}
