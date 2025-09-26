"use client";

import React from "react";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  CommandLineIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

// Props are destructured directly in the function parameter

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: ChartBarIcon,
      description: "Monitoramento",
    },
    {
      id: "drones",
      name: "Drones",
      icon: CommandLineIcon,
      description: "Gerenciamento",
    },
    {
      id: "drone-types",
      name: "Tipos de Drones",
      icon: WrenchScrewdriverIcon,
      description: "Especificações",
    },
    {
      id: "orders",
      name: "Pedidos",
      icon: ClipboardDocumentListIcon,
      description: "Gerenciamento",
    },
    {
      id: "config",
      name: "Configurações",
      icon: CogIcon,
      description: "Sistema",
    },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <CommandLineIcon className="h-8 w-8 text-blue-400 animate-glow" />
          <div>
            <h1 className="text-xl font-bold text-white">DroneOps</h1>
            <p className="text-sm text-gray-400">Sistema de Entregas</p>
          </div>
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 hover-lift ${
                activeTab === item.id
                  ? "bg-blue-600 text-white border-r-2 border-blue-400 transform translate-x-1"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <Icon className="h-5 w-5 mr-3" />
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
