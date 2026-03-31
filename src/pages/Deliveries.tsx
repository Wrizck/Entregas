import React, { useState } from "react";
import { Truck, Search, Plus, Filter, ChevronDown, ChevronUp, Package, MapPin, Trash2, CreditCard, Pencil } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useDeliveries, Delivery } from "../context/DeliveryContext";
import { ConfirmationModal } from "../components/ConfirmationModal";

export default function Deliveries() {
  const getLocalISOTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const { allDeliveries, addDelivery, customers, deleteDelivery, updateDelivery } = useDeliveries();
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDeliveryId, setEditingDeliveryId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<string | null>(null);
  const [isGuestCustomer, setIsGuestCustomer] = useState(false);
  const [newDelivery, setNewDelivery] = useState({
    quantity: 1,
    sugarCane: 0,
    unitPrice: 0,
    customer: "",
    deliveryDateTime: getLocalISOTime(),
    paymentStatus: "Pendente",
    paymentMethod: "",
    observations: "",
  });

  const handleAddDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const totalValue = newDelivery.quantity * newDelivery.unitPrice;
    
    if (isEditing && editingDeliveryId) {
      const existingDelivery = allDeliveries.find(d => d.id === editingDeliveryId);
      if (existingDelivery) {
        // If changing to "Pago" and it wasn't "Pago" before, set paymentDate to end of range
        const wasPaid = existingDelivery.paymentStatus === "Pago";
        const isNowPaid = newDelivery.paymentStatus === "Pago";
        
        let paymentDate = existingDelivery.paymentDate;
        if (isNowPaid && !wasPaid) {
          paymentDate = dateRange.end;
        } else if (!isNowPaid && wasPaid) {
          paymentDate = undefined;
        }

        const updatedDelivery: Delivery = {
          ...existingDelivery,
          ...newDelivery,
          value: `R$ ${totalValue.toFixed(2)}`,
          paymentDate
        };
        updateDelivery(updatedDelivery);
      }
    } else {
      const id = (Math.floor(Math.random() * 9000) + 1000).toString();
      const delivery: Delivery = {
        id,
        customer: newDelivery.customer || "Cliente Avulso",
        address: "Endereço não informado",
        type: "Padrão",
        status: "Pendente",
        eta: "Hoje",
        value: `R$ ${totalValue.toFixed(2)}`,
        paymentDate: newDelivery.paymentStatus === "Pago" ? dateRange.end : undefined,
        ...newDelivery,
      };
      addDelivery(delivery);
    }
    
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingDeliveryId(null);
    setIsGuestCustomer(false);
    setNewDelivery({
      quantity: 1,
      sugarCane: 0,
      unitPrice: 0,
      customer: "",
      deliveryDateTime: getLocalISOTime(),
      paymentStatus: "Pendente",
      paymentMethod: "",
      observations: "",
    });
  };

  // Filter and group deliveries by customer
  const filteredDeliveries = allDeliveries.filter(delivery => {
    const deliveryDate = delivery.deliveryDateTime?.split('T')[0];
    const matchesDate = deliveryDate && deliveryDate >= dateRange.start && deliveryDate <= dateRange.end;
    const matchesSearch = delivery.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          delivery.id.includes(searchQuery);
    return matchesDate && matchesSearch;
  });

  // New section: Payments received in range for deliveries from other days
  const latePayments = allDeliveries.filter(delivery => {
    const isPaidInRange = delivery.paymentDate && delivery.paymentDate >= dateRange.start && delivery.paymentDate <= dateRange.end;
    const deliveryDate = delivery.deliveryDateTime?.split('T')[0];
    const isNotFromRange = !deliveryDate || deliveryDate < dateRange.start || deliveryDate > dateRange.end;
    const matchesSearch = delivery.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          delivery.id.includes(searchQuery);
    return isPaidInRange && isNotFromRange && matchesSearch;
  });

  const groupedDeliveries = filteredDeliveries.reduce((acc, delivery) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cliente ou pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">Início</span>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                />
              </div>
              <div className="w-px h-8 bg-border mx-1" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">Fim</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl h-full py-3"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setDateRange({ start: today, end: today });
              }}
              title="Voltar para hoje"
            >
              Hoje
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button size="sm" className="rounded-xl" onClick={() => {
            setNewDelivery({
              quantity: 1,
              sugarCane: 0,
              unitPrice: 0,
              customer: "",
              deliveryDateTime: getLocalISOTime(),
              paymentStatus: "Pendente",
              paymentMethod: "",
              observations: "",
            });
            setIsEditing(false);
            setEditingDeliveryId(null);
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Entrega
          </Button>
        </div>
      </div>

      {/* New Delivery Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setIsModalOpen(false);
                setIsGuestCustomer(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden text-foreground"
            >
              <div className="p-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold">{isEditing ? "Editar Entrega" : "Nova Entrega de Cana"}</h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setEditingDeliveryId(null);
                    setIsGuestCustomer(false);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddDelivery} className="px-6 pb-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Quantidade de Pacotes *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={newDelivery.quantity}
                      onChange={(e) => setNewDelivery({ ...newDelivery, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Cana (kg)</label>
                    <input
                      type="number"
                      value={newDelivery.sugarCane}
                      onChange={(e) => setNewDelivery({ ...newDelivery, sugarCane: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Valor Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newDelivery.unitPrice}
                      onChange={(e) => setNewDelivery({ ...newDelivery, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">Valor Total</label>
                    <div className="w-full px-4 py-2.5 bg-muted/50 border border-primary/30 rounded-xl text-sm font-bold text-primary flex items-center justify-between h-[42px]">
                      <span>R$</span>
                      <span>{(newDelivery.quantity * newDelivery.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold">Cliente *</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsGuestCustomer(!isGuestCustomer);
                        setNewDelivery({ ...newDelivery, customer: "" });
                      }}
                      className="text-primary text-xs underline hover:opacity-80 transition-opacity"
                    >
                      {isGuestCustomer ? "Selecionar da lista" : "Cliente avulso (sem cadastro)"}
                    </button>
                  </div>
                  <div className="relative">
                    {isGuestCustomer ? (
                      <input
                        required
                        type="text"
                        value={newDelivery.customer}
                        onChange={(e) => setNewDelivery({ ...newDelivery, customer: e.target.value })}
                        placeholder="Nome do cliente avulso"
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                    ) : (
                      <>
                        <select
                          required
                          value={newDelivery.customer}
                          onChange={(e) => setNewDelivery({ ...newDelivery, customer: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none text-foreground/60"
                        >
                          <option value="" disabled>Selecione o cliente</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.name}>{customer.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Data e Hora da Entrega</label>
                  <input
                    type="datetime-local"
                    value={newDelivery.deliveryDateTime}
                    onChange={(e) => setNewDelivery({ ...newDelivery, deliveryDateTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground/80"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Status do Pagamento</label>
                    <div className="relative">
                      <select
                        value={newDelivery.paymentStatus}
                        onChange={(e) => setNewDelivery({ ...newDelivery, paymentStatus: e.target.value })}
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                        <option value="Parcial">Parcial</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Método de Pagamento</label>
                    <div className="relative">
                      <select
                        value={newDelivery.paymentMethod}
                        onChange={(e) => setNewDelivery({ ...newDelivery, paymentMethod: e.target.value })}
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none text-foreground/60"
                      >
                        <option value="" disabled>Selecione</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão">Cartão</option>
                        <option value="Pix">Pix</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Observações</label>
                  <textarea
                    value={newDelivery.observations}
                    onChange={(e) => setNewDelivery({ ...newDelivery, observations: e.target.value })}
                    placeholder="Observações sobre a entrega..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6">
                    {isEditing ? "Salvar Alterações" : "Salvar Entrega"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {(Object.entries(groupedDeliveries) as [string, Delivery[]][]).map(([customer, deliveries]) => {
          const isExpanded = expandedCustomers.includes(customer);
          const hasMultiple = deliveries.length > 1;

          return (
            <div key={customer} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{customer}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {deliveries[0].address}
                    </div>
                    <p className="text-xs font-medium text-primary mt-1">
                      {deliveries.length} {deliveries.length === 1 ? 'entrega de cana' : 'entregas de cana'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {!hasMultiple && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      deliveries[0].status === 'Em Rota' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      deliveries[0].status === 'Entregue' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {deliveries[0].status}
                    </span>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-xl text-xs font-bold"
                    onClick={() => toggleExpand(customer)}
                  >
                    {isExpanded ? (
                      <>Ocultar Detalhes <ChevronUp className="ml-2 h-4 w-4" /></>
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
                      {deliveries.map((delivery) => (
                        <div key={delivery.id} className="bg-card p-3 rounded-xl border border-border flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">Pedido #{delivery.id}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="font-bold text-primary">{delivery.type}</span>
                                <span>•</span>
                                <span>{delivery.value}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              delivery.status === 'Em Rota' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              delivery.status === 'Entregue' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {delivery.status}
                            </span>
                            <div className="flex items-center justify-end gap-2 mt-1">
                              <p className="text-[10px] text-muted-foreground">{delivery.eta}</p>
                              <button 
                                onClick={() => {
                                  setNewDelivery({
                                    quantity: delivery.quantity,
                                    sugarCane: delivery.sugarCane,
                                    unitPrice: delivery.unitPrice,
                                    customer: delivery.customer,
                                    deliveryDateTime: delivery.deliveryDateTime || getLocalISOTime(),
                                    paymentStatus: delivery.paymentStatus,
                                    paymentMethod: delivery.paymentMethod,
                                    observations: delivery.observations || "",
                                  });
                                  setIsEditing(true);
                                  setEditingDeliveryId(delivery.id);
                                  setIsModalOpen(true);
                                }}
                                className="text-primary hover:text-primary/80 transition-colors"
                                title="Editar entrega"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setDeliveryToDelete(delivery.id);
                                  setIsConfirmModalOpen(true);
                                }}
                                className="text-destructive hover:text-destructive/80 transition-colors"
                                title="Excluir entrega"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      {/* Late Payments Section */}
      {latePayments.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
            <Package className="h-5 w-5" />
            Pagamentos recebidos de entregas anteriores
          </h3>
          <div className="grid gap-4">
            {latePayments.map((payment) => (
              <div key={`late-${payment.id}`} className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{payment.customer}</h4>
                    <p className="text-xs text-muted-foreground">Pedido #{payment.id} • Originalmente em {new Date(payment.deliveryDateTime || "").toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-500">{payment.value}</p>
                  <p className="text-[10px] text-muted-foreground">Recebido em {new Date(payment.paymentDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
