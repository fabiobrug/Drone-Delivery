import React, { useState, useEffect } from "react";
import { useDroneContext } from "../../context/DroneContext";
import DroneOrdersModal from "./DroneOrdersModal";

const DroneDeliveryInfo = ({ drone }) => {
  const { getDroneOrders } = useDroneContext();
  const [droneOrders, setDroneOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDroneOrders = async () => {
      if (drone.id) {
        setLoading(true);
        try {
          const orders = await getDroneOrders(drone.id);
          setDroneOrders(orders);
        } catch (error) {
          console.error("Error loading drone orders:", error);
          setDroneOrders([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDroneOrders();
  }, [drone.id, getDroneOrders]);

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 transition-colors bg-purple-900/20 hover:bg-purple-900/30 px-2 py-1 rounded border border-purple-700/50"
        title="Ver pedidos do drone"
      >
        <span>{droneOrders.length} pedidos</span>
        <span className="text-xs text-gray-400">
          ({Math.round((drone.currentLoad || 0) * 100) / 100}kg /{" "}
          {drone.capacity}kg)
        </span>
      </button>

      <DroneOrdersModal
        drone={drone}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DroneDeliveryInfo;
