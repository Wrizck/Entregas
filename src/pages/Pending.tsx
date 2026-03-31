import React, { useState } from "react";
import { AlertCircle, CreditCard, Calendar, User, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useDeliveries, Delivery } from "../context/DeliveryContext";

export default function Pending() {
  const { allDeliveries } = useDeliveries();
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([]);

  const pendingPayments = allDeliveries.filter(d => d.paymentStatus === "Pendente");

  // Group payments by customer
  const groupedPayments = pendingPayments.reduce((acc, delivery) => {
    if (!acc[delivery.customer]) {
      acc[delivery.customer] = [];
    }
    acc[delivery.customer].push(delivery);
    return acc;
  }, {} as Record<string, Delivery[]>);

  const toggleExpand = (customer: string) => {
    setExpandedCustomers(prev => 
      prev.includes(customer) 
        ? prev.filter(c => c !== customer) 
        : [...prev, customer]
    );
  };

  const calculateTotal = (deliveries: Delivery[]) => {
    const total = deliveries.reduce((sum, d) => {
      const val = parseFloat(d.value.replace("R$ ", "").replace(".", "").replace(",", "."));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-800 dark:text-blue-400 text-sm">Atenção Financeira (Cana)</h4>
          <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
            Existem {pendingPayments.length} pagamentos pendentes de pacotes de cana de {Object.keys(groupedPayments).length} clientes.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {(Object.entries(groupedPayments) as [string, Delivery[]][]).map(([customer, deliveries]) => {
          const isExpanded = expandedCustomers.includes(customer);
          const totalAmount = calculateTotal(deliveries);
          // Mocking "Atrasado" if delivery date is in the past (simplified)
          const hasLate = deliveries.some(d => d.deliveryDateTime && new Date(d.deliveryDateTime) < new Date());

          return (
            <div key={customer} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    hasLate ? 'bg-destructive/10 text-destructive' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{customer}</h4>
                    <p className="text-sm font-bold text-primary">{totalAmount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {deliveries.length} {deliveries.length === 1 ? 'pagamento pendente' : 'pagamentos pendentes'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {hasLate && !isExpanded && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">
                      Atrasado
                    </span>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-xl text-xs font-bold"
                    onClick={() => toggleExpand(customer)}
                  >
                    {isExpanded ? (
                      <>Ocultar <ChevronUp className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>Ver Detalhes <ChevronDown className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border bg-muted/30"
                  >
                    <div className="p-4 space-y-3">
                      {deliveries.map((delivery) => {
                        const isLate = delivery.deliveryDateTime && new Date(delivery.deliveryDateTime) < new Date();
                        return (
                          <div key={delivery.id} className="bg-card p-4 rounded-xl border border-border space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold">{delivery.value}</p>
                                <p className="text-[10px] text-muted-foreground">Pedido #{delivery.id}</p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isLate ? 'bg-destructive/10 text-destructive' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {isLate ? 'Atrasado' : 'Pendente'}
                                </span>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  Vence: {delivery.deliveryDateTime ? new Date(delivery.deliveryDateTime).toLocaleDateString('pt-BR') : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold">
                                Confirmar
                              </button>
                              <button className="flex-1 py-1.5 bg-muted text-muted-foreground rounded-lg text-[10px] font-bold">
                                Cobrar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
