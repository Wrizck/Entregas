import React from "react";
import { Package, Truck, Users, CreditCard, TrendingUp } from "lucide-react";
import { useDeliveries } from "../context/DeliveryContext";

export default function Dashboard() {
  const { allDeliveries } = useDeliveries();

  const stats = [
    { 
      label: "Entregas de Cana Hoje", 
      value: allDeliveries.filter(d => d.status !== "Entregue").length.toString(), 
      icon: Truck, 
      color: "bg-blue-500" 
    },
    { 
      label: "Pagamentos Pendentes", 
      value: allDeliveries.filter(d => d.paymentStatus === "Pendente").length.toString(), 
      icon: CreditCard, 
      color: "bg-blue-600" 
    },
    { 
      label: "Novos Clientes", 
      value: "5", 
      icon: Users, 
      color: "bg-green-500" 
    },
    { 
      label: "Receita Mensal", 
      value: `R$ ${allDeliveries.reduce((acc, d) => acc + parseFloat(d.value.replace("R$ ", "").replace(",", ".")), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 
      icon: TrendingUp, 
      color: "bg-purple-500" 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-lg">Entregas de Cana Recentes</h3>
        </div>
        <div className="divide-y divide-border">
          {allDeliveries.slice(0, 5).map((delivery) => (
            <div key={delivery.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pedido #{delivery.id}</p>
                  <p className="text-xs text-muted-foreground">{delivery.customer} • {delivery.address}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  delivery.status === "Entregue" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                }`}>
                  {delivery.status}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{delivery.eta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
