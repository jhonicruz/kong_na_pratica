"use server";
/* eslint-disable @typescript-eslint/no-unused-vars */
import "server-only";

export type ActionState = {
  last?: {
    ok: boolean;
    status: number;
    data?: unknown;
    error?: string;
    base: string;
    at: string;
  };
  error?: string;
};

export async function enviarPagamento(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const base =
    process.env.KONG_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  try {
    const res = await fetch(`${base}/api/enviar`, {
      method: "GET",
      // server action runs on the server; avoid caching for live LB view
      cache: "no-store",
      // small timeout via AbortController (Node 18+) if desired
    });

    const at = new Date().toISOString();
    const status = res.status;
    const ok = res.ok;
    let data: unknown = undefined;
    try {
      data = await res.json();
    } catch (_e) {
      // ignore JSON parse errors, keep body empty
    }

    return { last: { ok, status, data, base, at } };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Erro ao enviar pagamento",
      last: { ok: false, status: 0, error: String(err), base, at: new Date().toISOString() },
    };
  }
}
