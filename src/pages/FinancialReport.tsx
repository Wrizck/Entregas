import React, { useState } from "react";
import { Download, Package, CreditCard, Wallet, Users, CheckCircle2, Clock, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useDeliveries } from "../context/DeliveryContext";
import { ConfirmationModal } from "../components/ConfirmationModal";

export default function FinancialReport() {
  const { allDeliveries, deleteDelivery } = useDeliveries();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<string | null>(null);

  // Daily Stats Calculation
  const deliveriesForDate = allDeliveries.filter(d => 
    d.deliveryDateTime && d.deliveryDateTime.startsWith(selectedDate)
  );

  // Late payments received today
  const latePayments = allDeliveries.filter(d => 
    d.paymentDate === selectedDate && (!d.deliveryDateTime || !d.deliveryDateTime.startsWith(selectedDate))
  );

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR');

  const packagesDelivered = deliveriesForDate
    .filter(d => d.status === "Entregue")
    .reduce((acc, d) => acc + (d.quantity || 0), 0);

  const packagesPaidFromDeliveries = deliveriesForDate
    .filter(d => d.paymentStatus === "Pago")
    .reduce((acc, d) => acc + (d.quantity || 0), 0);
  
  const packagesPaidFromLate = latePayments.reduce((acc, d) => acc + (d.quantity || 0), 0);
  const packagesPaid = packagesPaidFromDeliveries + packagesPaidFromLate;

  const parseValue = (valStr: string) => {
    const val = parseFloat(valStr.replace("R$ ", "").replace(".", "").replace(",", "."));
    return isNaN(val) ? 0 : val;
  };

  const cashPaymentsFromDeliveries = deliveriesForDate.filter(d => d.paymentMethod === "Dinheiro" && d.paymentStatus === "Pago");
  const cashPaymentsFromLate = latePayments.filter(d => d.paymentMethod === "Dinheiro");
  
  const cashCount = cashPaymentsFromDeliveries.reduce((acc, d) => acc + (d.quantity || 0), 0) + 
                    cashPaymentsFromLate.reduce((acc, d) => acc + (d.quantity || 0), 0);
  
  const cashValue = cashPaymentsFromDeliveries.reduce((acc, d) => acc + parseValue(d.value), 0) +
                    cashPaymentsFromLate.reduce((acc, d) => acc + parseValue(d.value), 0);

  const pixPaymentsFromDeliveries = deliveriesForDate.filter(d => d.paymentMethod === "Pix" && d.paymentStatus === "Pago");
  const pixPaymentsFromLate = latePayments.filter(d => d.paymentMethod === "Pix");
  
  const pixCount = pixPaymentsFromDeliveries.reduce((acc, d) => acc + (d.quantity || 0), 0) +
                   pixPaymentsFromLate.reduce((acc, d) => acc + (d.quantity || 0), 0);
  
  const pixValue = pixPaymentsFromDeliveries.reduce((acc, d) => acc + parseValue(d.value), 0) +
                   pixPaymentsFromLate.reduce((acc, d) => acc + parseValue(d.value), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-bold text-xl">Relatório de Pacotes de Cana</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Hoje
            </Button>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Resumo do Dia ({formattedDate})
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Entregas Realizadas</p>
                <p className="text-2xl font-bold">{deliveriesForDate.filter(d => d.status === "Entregue").length} pedidos</p>
                <p className="text-xs text-muted-foreground">{packagesDelivered} pacotes de cana</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Pacotes Pagos</p>
                <p className="text-2xl font-bold text-green-500">{packagesPaid} pacotes</p>
                <p className="text-xs text-muted-foreground">Total de {deliveriesForDate.filter(d => d.paymentStatus === "Pago").length} pedidos</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <Wallet className="h-3 w-3" /> Dinheiro
                </p>
                <p className="text-2xl font-bold">R$ {cashValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">{cashCount} pacotes pagos</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Pix
                </p>
                <p className="text-2xl font-bold">R$ {pixValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">{pixCount} pacotes pagos</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Detalhamento das Entregas ({formattedDate})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="pb-3 font-bold uppercase text-[10px] tracking-wider">Cliente</th>
                    <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Pacotes</th>
                    <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Valor</th>
                    <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Pagamento</th>
                    <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Status</th>
                    <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {deliveriesForDate.length > 0 ? (
                    deliveriesForDate.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4">
                          <p className="font-bold text-foreground">{delivery.customer}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {delivery.deliveryDateTime ? new Date(delivery.deliveryDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Horário não inf.'}
                          </p>
                        </td>
                        <td className="py-4 text-center font-medium">{delivery.quantity}</td>
                        <td className="py-4 text-center font-bold text-primary">{delivery.value}</td>
                        <td className="py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              delivery.paymentStatus === "Pago" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                            }`}>
                              {delivery.paymentStatus}
                            </span>
                            <span className="text-[9px] text-muted-foreground">{delivery.paymentMethod || 'Não inf.'}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            delivery.status === "Entregue" ? "bg-green-500/10 text-green-500" : 
                            delivery.status === "Em Rota" ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {delivery.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => {
                              setDeliveryToDelete(delivery.id);
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-destructive hover:text-destructive/80 transition-colors p-1"
                            title="Excluir entrega"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground italic">
                        Nenhuma entrega registrada para este dia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {latePayments.length > 0 && (
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-green-500">
                <CreditCard className="h-5 w-5" />
                Pagamentos recebidos de entregas anteriores ({formattedDate})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="pb-3 font-bold uppercase text-[10px] tracking-wider">Cliente</th>
                      <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Data Original</th>
                      <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Pacotes</th>
                      <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Valor</th>
                      <th className="pb-3 font-bold uppercase text-[10px] tracking-wider text-center">Método</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {latePayments.map((payment) => (
                      <tr key={`late-report-${payment.id}`} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4">
                          <p className="font-bold text-foreground">{payment.customer}</p>
                          <p className="text-[10px] text-muted-foreground">Pedido #{payment.id}</p>
                        </td>
                        <td className="py-4 text-center text-xs">
                          {payment.deliveryDateTime ? new Date(payment.deliveryDateTime).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="py-4 text-center font-medium">{payment.quantity}</td>
                        <td className="py-4 text-center font-bold text-green-500">{payment.value}</td>
                        <td className="py-4 text-center text-xs font-medium">{payment.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          if (deliveryToDelete) {
            deleteDelivery(deliveryToDelete);
            setDeliveryToDelete(null);
          }
        }}
        title="Excluir Entrega"
        message="Tem certeza que deseja excluir esta entrega? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
