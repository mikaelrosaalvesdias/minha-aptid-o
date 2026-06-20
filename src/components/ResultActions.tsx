"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteResultButton({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deleteResult() {
    const confirmed = window.confirm("Apagar este resultado e as respostas vinculadas?");
    if (!confirmed) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/results/${resultId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Não foi possível apagar.");
      router.push("/");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível apagar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="delete-result">
      <button className="button secondary" type="button" onClick={deleteResult} disabled={loading}>
        <Trash2 size={17} /> {loading ? "Apagando..." : "Apagar resultado"}
      </button>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
