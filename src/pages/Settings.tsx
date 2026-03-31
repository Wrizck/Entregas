import React from "react";
import { Settings as SettingsIcon, Bell, Shield, Moon, Globe, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useDeliveries } from "../context/DeliveryContext";
import { logout } from "../firebase";

export default function Settings() {
  const { user } = useDeliveries();

  const sections = [
    { title: "Geral", icon: Globe, items: ["Idioma", "Fuso Horário", "Unidades de Medida"] },
    { title: "Notificações", icon: Bell, items: ["Push", "E-mail", "Alertas de Atraso"] },
    { title: "Segurança", icon: Shield, items: ["Alterar Senha", "Autenticação em Duas Etapas"] },
    { title: "Aparência", icon: Moon, items: ["Tema Escuro", "Cores do Sistema"] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-6 bg-card rounded-2xl border border-border shadow-sm">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ""} className="h-full w-full object-cover" />
          ) : (
            user?.displayName?.charAt(0) || "U"
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{user?.displayName || "Usuário"}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <Button variant="link" className="p-0 h-auto text-xs">Editar Perfil</Button>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          className="rounded-xl flex items-center gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-2">
              <section.icon className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">{section.title}</h4>
            </div>
            <div className="divide-y divide-border">
              {section.items.map((item) => (
                <button key={item} className="w-full p-4 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between">
                  <span>{item}</span>
                  <span className="text-muted-foreground">›</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Precisa de ajuda?</span>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl">Suporte</Button>
      </div>
    </div>
  );
}
