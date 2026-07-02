import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-bold text-foreground">Página não encontrada</h2>
        <p className="text-lg text-muted-foreground max-w-md">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <Link href="/">
          <Button size="lg">Voltar para Home</Button>
        </Link>
      </div>
    </div>
  );
}
