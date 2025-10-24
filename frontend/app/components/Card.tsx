"use client";
import { useFormState, useFormStatus } from "react-dom";
import { enviarPagamento } from "@/app/actions";
import type { ActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card as UiCard,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="default"
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
      type="submit"
      disabled={pending}
    >
      {pending ? "Enviando..." : "Pagar Agora"}
    </Button>
  );
}

const initialState: ActionState = {};

// renamed local component to avoid shadowing the imported `Card`
const CardDemo = () => {
  const [state, formAction] = useFormState(enviarPagamento, initialState);

  const response = state?.last;
  const data = (response?.data || {}) as Record<string, unknown>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-2xl">
        <UiCard>
          <CardHeader>
            <CardTitle>Realizar Pagamento</CardTitle>
            <CardDescription>
              Clique para disparar uma requisição via Kong e visualizar qual instância do backend respondeu.
            </CardDescription>
            <CardAction>
              <form action={formAction}>
                <SubmitButton />
              </form>
            </CardAction>
          </CardHeader>

          <CardContent>
            {!response && (
              <div className="text-sm text-muted-foreground">
                Sem requisições ainda. Clique em &quot;Pagar Agora&quot; para começar.
              </div>
            )}

            {response && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 bg-white">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="text-lg font-semibold">
                    {response.ok ? (
                      <span className="text-green-600">OK</span>
                    ) : (
                      <span className="text-red-600">Erro</span>
                    )}
                    <span className="ml-2 text-sm text-muted-foreground">{response.status}</span>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-white">
                  <div className="text-xs text-muted-foreground">Kong Base URL</div>
                  <div className="text-sm break-all">{response.base}</div>
                </div>

                <div className="rounded-lg border p-4 bg-white md:col-span-2">
                  <div className="text-xs text-muted-foreground mb-1">Resposta do Backend</div>
                  <pre className="text-sm whitespace-pre-wrap wrap-break-word bg-gray-50 rounded-md p-3 border">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>

                <div className="rounded-lg border p-4 bg-white">
                  <div className="text-xs text-muted-foreground">Instância</div>
                  <div className="text-sm font-medium">{String(data.instance ?? data.hostname ?? "-")}</div>
                </div>

                <div className="rounded-lg border p-4 bg-white">
                  <div className="text-xs text-muted-foreground">Porta</div>
                  <div className="text-sm font-medium">{String(data.port ?? "-")}</div>
                </div>

                <div className="rounded-lg border p-4 bg-white">
                  <div className="text-xs text-muted-foreground">PID</div>
                  <div className="text-sm font-medium">{String(data.pid ?? "-")}</div>
                </div>

                <div className="rounded-lg border p-4 bg-white">
                  <div className="text-xs text-muted-foreground">Request Count</div>
                  <div className="text-sm font-medium">{String(data.requestCount ?? "-")}</div>
                </div>
              </div>
            )}
          </CardContent>

          {response && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Última requisição: {new Date(response.at).toLocaleString()}
              </div>
            </CardFooter>
          )}
        </UiCard>
      </div>
    </div>
  );
};

export default CardDemo;
