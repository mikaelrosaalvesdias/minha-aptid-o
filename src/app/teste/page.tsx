import { TestClient } from "@/components/TestClient";
import { getUser } from "@/lib/auth";

export default async function TestPage() {
  const user = await getUser();
  return <TestClient initialUser={user} />;
}
