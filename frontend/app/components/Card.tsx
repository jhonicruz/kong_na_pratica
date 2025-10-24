"use client";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// renamed local component to avoid shadowing the imported `Card`
const CardDemo = () => {
  async function handleClick() {
    // Handle payment logic here
    alert("Pagamento enviado!");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-[600px]">
        <Card>
          <CardHeader>
            <CardTitle>Realizar Pagamento</CardTitle>
            <CardDescription>Clique no link para realizar o pagamento do seu pedido</CardDescription>
            <CardAction>
              <Button
                variant="default"
                className="px-3 py-1 cursor-pointer bg-blue-500"
                type="submit"
                onClick={handleClick}
              >
                Pagar Agora
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
