import React from "react";
import { Utensils } from "lucide-react";
import { Comanda } from "../../types/pdv";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface TableGridProps {
  comandas: Comanda[];
  selectedComandaId: string | null;
  onSelectComanda: (comanda: Comanda) => void;
  onCreateComanda: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function TableGrid({
  comandas,
  selectedComandaId,
  onSelectComanda,
  onCreateComanda,
}: TableGridProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Mesas e Comandas
        </h2>
        <button
          onClick={onCreateComanda}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
        >
          + Nova Comanda
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {comandas.map((comanda) => {
          const isSelected = selectedComandaId === comanda.id;

          return (
            <button
              key={comanda.id}
              onClick={() => onSelectComanda(comanda)}
              className={`
                relative p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 aspect-square
                ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 border-amber-500 ring-4 ring-amber-500/20 z-10"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-500/50 hover:shadow-md"
                }
              `}
            >
              <div
                className={`p-3 rounded-full ${
                  comanda.status === "OPEN"
                    ? "bg-amber-500/20 text-amber-500"
                    : "bg-emerald-500/20 text-emerald-500"
                }`}
              >
                <Utensils size={32} />
              </div>

              <div className="text-center">
                <span className="block font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">
                  {comanda.table}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {formatCurrency(comanda.total)}
                </span>
              </div>

              <Badge
                variant="warning"
                className="absolute top-3 right-3 text-[10px]"
              >
                Ocupada
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
