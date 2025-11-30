// app/pdv/page.tsx
"use client";

import { useState, useEffect } from "react";
import type { Comanda, Product } from "../../../types/pdv";
import { TableGrid } from "../../../components/pdv/TableGrid";
import { OrderPanel } from "../../../components/pdv/OrderPanel";
import { PaymentModal } from "../../../components/pdv/PaymentModal";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function PdvPage() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComandaTable, setNewComandaTable] = useState("");
  const [isCreatingComanda, setIsCreatingComanda] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Nenhum token encontrado");
      setError("Não autorizado. Faça login novamente.");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setIsLoading(false);
        return;
      }

      const [comandasRes, productsRes] = await Promise.all([
        fetch("/api/orders?status=OPEN", { headers }),
        fetch("/api/products", { headers }),
      ]);

      if (!comandasRes.ok) throw new Error("Falha ao buscar comandas");
      const comandasData: Comanda[] = await comandasRes.json();
      setComandas(comandasData);

      if (!productsRes.ok) throw new Error("Falha ao buscar produtos");
      const productsData: Product[] = await productsRes.json();
      setProducts(productsData);

      if (selectedComanda) {
        const updatedComanda = comandasData.find(
          (c) => c.id === selectedComanda.id
        );
        setSelectedComanda(updatedComanda || null);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
    setNewComandaTable("");
    setError(null);
  };

  const handleCloseCreateModal = () => {
    if (isCreatingComanda) return;
    setIsModalOpen(false);
    setNewComandaTable("");
    setIsCreatingComanda(false);
  };

  const handleCreateComandaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComandaTable || isCreatingComanda) return;

    setIsCreatingComanda(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Não autorizado.");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ table: newComandaTable }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Falha ao criar comanda");
      }

      await fetchData();
      handleCloseCreateModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreatingComanda(false);
    }
  };

  const handleSelectComanda = (comanda: Comanda) => {
    setSelectedComanda(comanda);
  };

  const handleAddItem = async (productId: string, quantity: number) => {
    if (!selectedComanda) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Não autorizado.");

      const res = await fetch(
        `/api/orders/${encodeURIComponent(selectedComanda.id)}/items`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ productId, quantity }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Falha ao adicionar item");
      }

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCloseAccount = () => {
    if (!selectedComanda) return;
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (
    method: "CASH" | "DEBIT" | "CREDIT" | "PIX"
  ) => {
    if (!selectedComanda) return;
    setIsProcessingPayment(true);

    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Não autorizado.");

      const res = await fetch(`/api/orders/${selectedComanda.id}/close`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ paymentMethod: method }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Falha ao fechar comanda");
      }

      await fetchData();
      setIsPaymentModalOpen(false);
      setSelectedComanda(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading && !isModalOpen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error && !isModalOpen) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md"
          role="alert"
        >
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <TableGrid
            comandas={comandas}
            selectedComandaId={selectedComanda?.id || null}
            onSelectComanda={handleSelectComanda}
            onCreateComanda={handleOpenCreateModal}
          />
        </div>

        <div className="w-96 h-full border-l border-slate-200 dark:border-slate-800">
          <OrderPanel
            comanda={selectedComanda}
            products={products}
            onAddItem={handleAddItem}
            onCloseAccount={handleCloseAccount}
          />
        </div>
      </div>

      <CreateComandaModal
        isOpen={isModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateComandaSubmit}
        tableName={newComandaTable}
        setTableName={setNewComandaTable}
        isLoading={isCreatingComanda}
        error={error}
      />

      {selectedComanda && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirmPayment={handleConfirmPayment}
          comanda={selectedComanda}
          isLoading={isProcessingPayment}
        />
      )}
    </>
  );
}

type CreateComandaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  tableName: string;
  setTableName: (value: string) => void;
  isLoading: boolean;
  error: string | null;
};

function CreateComandaModal({
  isOpen,
  onClose,
  onSubmit,
  tableName,
  setTableName,
  isLoading,
  error,
}: CreateComandaModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Criar Nova Comanda
        </h3>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label
              htmlFor="tableName"
              className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1"
            >
              N° da Mesa ou Cliente
            </label>
            <input
              id="tableName"
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Ex: Mesa 05"
              autoFocus
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="my-3 p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !tableName}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  Criando...
                </>
              ) : (
                "Criar Comanda"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function SpinnerIcon() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
