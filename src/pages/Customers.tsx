import React, { useState } from "react";
import { Users, Search, Plus, Phone, MapPin, X, Calendar, Edit2, Trash2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useDeliveries, Customer } from "../context/DeliveryContext";

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, allDeliveries } = useDeliveries();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const id = (Math.max(0, ...customers.map(c => parseInt(c.id))) + 1).toString();
    const joinDate = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    addCustomer({ id, ...customerForm, joinDate });
    setIsModalOpen(false);
    setCustomerForm({ name: "", phone: "", address: "" });
  };

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer) {
      updateCustomer({ ...selectedCustomer, ...customerForm });
      setIsEditing(false);
      setSelectedCustomer(null);
      setCustomerForm({ name: "", phone: "", address: "" });
    }
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      deleteCustomer(id);
      setSelectedCustomer(null);
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    });
    setIsEditing(true);
  };

  const getCustomerStats = (customerName: string) => {
    const customerDeliveries = allDeliveries.filter(d => d.customer === customerName);
    const totalOrders = customerDeliveries.length;
    const totalCanas = customerDeliveries.reduce((acc, d) => acc + (d.quantity || 0), 0);
    const totalSpent = customerDeliveries.reduce((acc, d) => {
      const val = parseFloat(d.value.replace("R$ ", "").replace(".", "").replace(",", "."));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return { totalOrders, totalSpent, totalCanas };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button size="sm" className="rounded-xl" onClick={() => {
          setCustomerForm({ name: "", phone: "", address: "" });
          setIsModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const stats = getCustomerStats(customer.name);
          return (
            <div key={customer.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{customer.name}</h4>
                  <p className="text-xs text-muted-foreground">Cliente desde {customer.joinDate}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{customer.address || "Sem endereço"}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs">
                  <p className="text-muted-foreground">Total de Canas</p>
                  <p className="font-bold text-foreground">{stats.totalCanas}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8 text-primary font-bold"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setIsReportOpen(true);
                    }}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" /> Relatório
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New/Edit Customer Modal */}
      <AnimatePresence>
        {(isModalOpen || isEditing) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditing(false);
                setSelectedCustomer(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-bold">{isEditing ? "Editar Cliente" : "Novo Cliente"}</h3>
                <button onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setSelectedCustomer(null);
                }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={isEditing ? handleEditCustomer : handleAddCustomer} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Nome Completo *</label>
                  <input
                    required
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Telefone *</label>
                  <input
                    required
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Endereço Principal</label>
                  <input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl font-bold py-6">
                  {isEditing ? "Salvar Alterações" : "Cadastrar Cliente"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Report Modal */}
      <AnimatePresence>
        {isReportOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setIsReportOpen(false);
                setSelectedCustomer(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-primary text-primary-foreground">
                <div>
                  <h3 className="text-xl font-bold">Relatório Mensal</h3>
                  <p className="text-sm opacity-80">{selectedCustomer.name}</p>
                </div>
                <button onClick={() => {
                  setIsReportOpen(false);
                  setSelectedCustomer(null);
                }} className="text-primary-foreground/80 hover:text-primary-foreground">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      if (reportMonth === 0) {
                        setReportMonth(11);
                        setReportYear(reportYear - 1);
                      } else {
                        setReportMonth(reportMonth - 1);
                      }
                    }}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="font-bold text-sm min-w-[120px] text-center capitalize">
                    {new Date(reportYear, reportMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => {
                      if (reportMonth === 11) {
                        setReportMonth(0);
                        setReportYear(reportYear + 1);
                      } else {
                        setReportMonth(reportMonth + 1);
                      }
                    }}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="text-xs font-bold text-muted-foreground">
                  {allDeliveries.filter(d => 
                    d.customer === selectedCustomer.name && 
                    d.deliveryDateTime && 
                    new Date(d.deliveryDateTime).getMonth() === reportMonth &&
                    new Date(d.deliveryDateTime).getFullYear() === reportYear
                  ).length} entregas no mês
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Data</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider text-center">Qtd</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider text-center">Valor</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider text-right">Pagamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allDeliveries
                      .filter(d => 
                        d.customer === selectedCustomer.name && 
                        d.deliveryDateTime && 
                        new Date(d.deliveryDateTime).getMonth() === reportMonth &&
                        new Date(d.deliveryDateTime).getFullYear() === reportYear
                      )
                      .sort((a, b) => new Date(b.deliveryDateTime!).getTime() - new Date(a.deliveryDateTime!).getTime())
                      .map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold">{new Date(delivery.deliveryDateTime!).toLocaleDateString('pt-BR')}</p>
                            <p className="text-[10px] text-muted-foreground">Pedido #{delivery.id}</p>
                          </td>
                          <td className="px-6 py-4 text-center font-medium">{delivery.quantity}</td>
                          <td className="px-6 py-4 text-center font-bold text-primary">{delivery.value}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              delivery.paymentStatus === "Pago" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                            }`}>
                              {delivery.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {allDeliveries.filter(d => 
                      d.customer === selectedCustomer.name && 
                      d.deliveryDateTime && 
                      new Date(d.deliveryDateTime).getMonth() === reportMonth &&
                      new Date(d.deliveryDateTime).getFullYear() === reportYear
                    ).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                          Nenhuma entrega registrada para este mês.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-border bg-muted/10 flex justify-between items-center">
                <div className="text-sm">
                  <p className="text-muted-foreground font-medium">Total do Mês</p>
                  <p className="text-xl font-bold text-primary">
                    R$ {allDeliveries
                      .filter(d => 
                        d.customer === selectedCustomer.name && 
                        d.deliveryDateTime && 
                        new Date(d.deliveryDateTime).getMonth() === reportMonth &&
                        new Date(d.deliveryDateTime).getFullYear() === reportYear
                      )
                      .reduce((acc, d) => {
                        const val = parseFloat(d.value.replace("R$ ", "").replace(".", "").replace(",", "."));
                        return acc + (isNaN(val) ? 0 : val);
                      }, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Button onClick={() => {
                  setIsReportOpen(false);
                  setSelectedCustomer(null);
                }} className="rounded-xl font-bold">
                  Fechar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedCustomer && !isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedCustomer(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-primary text-primary-foreground relative">
                <button 
                  onClick={() => setSelectedCustomer(null)} 
                  className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                    <p className="text-sm opacity-80 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Cliente desde {selectedCustomer.joinDate}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total de Canas</p>
                    <p className="text-xl font-bold mt-1">{getCustomerStats(selectedCustomer.name).totalCanas}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Investido</p>
                    <p className="text-xl font-bold mt-1 text-primary">
                      R$ {getCustomerStats(selectedCustomer.name).totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm border-b border-border pb-2">Informações de Contato</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Telefone</p>
                        <p className="font-medium">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Endereço</p>
                        <p className="font-medium">{selectedCustomer.address || "Não informado"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => openEditModal(selectedCustomer)}>
                    <Edit2 className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  <Button variant="destructive" className="flex-1 rounded-xl font-bold" onClick={() => handleDeleteCustomer(selectedCustomer.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
