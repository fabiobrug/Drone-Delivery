import React, { useState, useEffect } from "react";
import { useDroneContext } from "../context/DroneContext";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const EfficiencyAnalysis = () => {
  const { stats } = useDroneContext();
  const [displayStats, setDisplayStats] = useState(stats);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayStats(stats);
    }, 100);
    return () => clearTimeout(timer);
  }, [stats]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">
                📊 Análise de Eficiência
              </h1>
              <p className="text-gray-300 text-sm mt-1">
                Desempenho operacional do sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Current Efficiency */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-white mb-4">
            Eficiência Atual:{" "}
            <span className="text-blue-400 text-lg">
              {displayStats.performance?.systemEfficiency || 0}%
            </span>
          </h2>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${displayStats.performance?.systemEfficiency || 0}%`,
              }}
            ></div>
          </div>
          <p className="text-gray-300 text-sm">
            Calculada usando média ponderada de 4 fatores principais do sistema.
          </p>
        </div>

        {/* Calculation Breakdown */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-white mb-6">
            🧮 Cálculo Detalhado
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-300 font-medium text-sm">
                    Utilização de Drones
                  </span>
                  <span className="text-blue-400 font-bold text-sm">
                    {displayStats.performance?.capacityUtilization || 0}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">Peso: 30%</div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        displayStats.performance?.capacityUtilization || 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-right text-white font-medium mt-2 text-sm">
                  = {(displayStats.performance?.capacityUtilization || 0) * 0.3}{" "}
                  pontos
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-300 font-medium text-sm">
                    Processamento de Pedidos
                  </span>
                  <span className="text-green-400 font-bold text-sm">
                    {displayStats.performance?.orderProcessing || 0}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">Peso: 30%</div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        displayStats.performance?.orderProcessing || 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-right text-white font-medium mt-2 text-sm">
                  = {(displayStats.performance?.orderProcessing || 0) * 0.3}{" "}
                  pontos
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-500">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-300 font-medium text-sm">
                    Saúde da Bateria
                  </span>
                  <span className="text-yellow-400 font-bold text-sm">
                    {displayStats.recent?.avgBattery || 0}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">Peso: 20%</div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${displayStats.recent?.avgBattery || 0}%`,
                    }}
                  ></div>
                </div>
                <div className="text-right text-white font-medium mt-2 text-sm">
                  = {(displayStats.recent?.avgBattery || 0) * 0.2} pontos
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-red-500">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-300 font-medium text-sm">
                    Performance de Entrega
                  </span>
                  <span className="text-red-400 font-bold text-sm">
                    {displayStats.performance?.deliveryRate || 0}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">Peso: 20%</div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${displayStats.performance?.deliveryRate || 0}%`,
                    }}
                  ></div>
                </div>
                <div className="text-right text-white font-medium mt-2 text-sm">
                  = {(displayStats.performance?.deliveryRate || 0) * 0.2} pontos
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-4 border-2 border-blue-500">
            <div className="flex justify-between items-center">
              <span className="text-white text-base font-semibold">
                Total da Eficiência:
              </span>
              <span className="text-blue-400 text-xl font-bold">
                {Math.round(
                  (displayStats.performance?.capacityUtilization || 0) * 0.3 +
                    (displayStats.performance?.orderProcessing || 0) * 0.3 +
                    (displayStats.recent?.avgBattery || 0) * 0.2 +
                    (displayStats.performance?.deliveryRate || 0) * 0.2
                )}
                %
              </span>
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Soma ponderada de todos os fatores de eficiência
            </div>
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-white mb-6">
            💡 Estratégias para Melhorar a Eficiência
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-900/30 to-orange-800/30 rounded-lg p-4 border border-orange-500/30">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm mb-3">
                      Alocar Mais Pedidos aos Drones
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm">
                      Aumente a utilização da frota alocando mais pedidos
                      pendentes.
                    </p>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-2">
                        Status Atual:
                      </div>
                      <div className="text-white font-medium text-sm">
                        {displayStats.overview?.allocatedOrders || 0} de{" "}
                        {displayStats.overview?.totalOrders || 0} pedidos
                        alocados
                      </div>
                      <div className="text-orange-400 text-sm mt-2">
                        Potencial de melhoria:{" "}
                        {(displayStats.overview?.totalOrders || 0) -
                          (displayStats.overview?.allocatedOrders || 0)}{" "}
                        pedidos
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-lg p-4 border border-red-500/30">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm mb-3">
                      Entregar Pedidos para Aumentar Taxa de Entrega
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm">
                      Complete as entregas para melhorar significativamente a
                      eficiência.
                    </p>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-2">
                        Taxa Atual:
                      </div>
                      <div className="text-white font-medium text-sm">
                        {displayStats.performance?.deliveryRate || 0}% (0
                        entregues)
                      </div>
                      <div className="text-red-400 text-sm mt-2">
                        Impacto: Alto - 20% do peso total
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm mb-3">
                      Otimizar Capacidade dos Drones
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm">
                      Distribua melhor a carga entre os drones disponíveis.
                    </p>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-2">
                        Utilização Atual:
                      </div>
                      <div className="text-white font-medium text-sm">
                        {displayStats.performance?.capacityUtilization || 0}%
                      </div>
                      <div className="text-blue-400 text-sm mt-2">
                        {displayStats.performance?.usedCapacity || 0}kg de{" "}
                        {displayStats.performance?.totalCapacity || 0}kg
                        utilizados
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm mb-3">
                      Manter Bateria Alta
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm">
                      Excelente! Continue mantendo os níveis de bateria altos.
                    </p>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-2">
                        Bateria Média:
                      </div>
                      <div className="text-white font-medium text-sm">
                        {displayStats.recent?.avgBattery || 0}%
                      </div>
                      <div className="text-green-400 text-sm mt-2">
                        Status: Excelente! 🎉
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-8">
            📈 Status Atual do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-400 text-3xl">🚁</div>
                <div className="text-blue-400 text-sm font-bold">
                  {displayStats.overview?.activeDrones || 0}
                </div>
              </div>
              <div className="text-gray-300 font-medium text-sm">
                Drones Ativos
              </div>
              <div className="text-gray-400 text-sm">
                de {displayStats.overview?.totalDrones || 0} total
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-lg p-4 border border-orange-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="text-orange-400 text-3xl">📦</div>
                <div className="text-orange-400 text-sm font-bold">
                  {displayStats.overview?.pendingOrders || 0}
                </div>
              </div>
              <div className="text-gray-300 font-medium text-sm">
                Pedidos Pendentes
              </div>
              <div className="text-gray-400 text-sm">aguardando alocação</div>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="text-green-400 text-3xl">⚖️</div>
                <div className="text-green-400 text-sm font-bold">
                  {displayStats.performance?.usedCapacity || 0}
                </div>
              </div>
              <div className="text-gray-300 font-medium text-sm">
                Capacidade Usada
              </div>
              <div className="text-gray-400 text-sm">
                de {displayStats.performance?.totalCapacity || 0}kg total
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="text-yellow-400 text-3xl">🔋</div>
                <div className="text-yellow-400 text-sm font-bold">
                  {displayStats.recent?.avgBattery || 0}%
                </div>
              </div>
              <div className="text-gray-300 font-medium text-sm">
                Bateria Média
              </div>
              <div className="text-gray-400 text-sm">nível excelente</div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 rounded-xl transition-all duration-200 font-bold text-sm shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            ✨ Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyAnalysis;
