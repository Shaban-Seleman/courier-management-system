import React, { useEffect, useState } from 'react';
import { 
  MoreHorizontal,
  RefreshCw,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { orderApi } from '../../lib/api';

// --- Types ---
type ShipmentStatus = 'Ordered' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception' | 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';

interface Shipment {
  id: string;
  trackingId: string;
  customer: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  amount: string;
}

// Helper to map backend status to frontend display status
const mapBackendStatus = (status: string): ShipmentStatus => {
  switch (status) {
    case 'PENDING': return 'Ordered';
    case 'ASSIGNED': return 'Picked Up';
    case 'IN_TRANSIT': return 'In Transit';
    case 'DELIVERED': return 'Delivered';
    case 'CANCELLED': return 'Exception';
    case 'FAILED': return 'Exception';
    default: return status as ShipmentStatus;
  }
};

const StatusBadge = ({ status }: { status: ShipmentStatus }) => {
  const displayStatus = mapBackendStatus(status);
  
  const styles: Record<string, string> = {
    'Ordered': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'Picked Up': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'In Transit': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Out for Delivery': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Delivered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Exception': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", styles[displayStatus] || styles['Ordered'])}>
      {displayStatus}
    </span>
  );
};

export default function OrdersPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    try {
        const response = await orderApi.get('/');
        
        const mappedData = response.data.map((order: any) => ({
            id: order.orderId,
            trackingId: order.orderNumber || 'PENDING',
            customer: order.customerId ? `Customer ${order.customerId.substring(0, 8)}...` : 'Unknown Customer',
            origin: order.pickupCity,
            destination: order.deliveryCity,
            status: order.status,
            estimatedDelivery: order.scheduledDelivery ? new Date(order.scheduledDelivery).toLocaleDateString() : 'TBD',
            amount: `$${order.amount}`
        }));
        
        setShipments(mappedData);
        setError(null);
    } catch (err) {
        console.error("Failed to fetch shipments", err);
        setError("Failed to load shipments. Is the backend running?");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shipments</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track all orders</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchShipments}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                title="Refresh Data"
            >
                <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-logistics-600 text-white rounded-lg text-sm font-medium hover:bg-logistics-700 shadow-sm shadow-logistics-500/30">
              <Plus className="w-4 h-4" />
              New Shipment
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {error ? (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20">
                <p>{error}</p>
                <button onClick={fetchShipments} className="mt-2 text-sm underline hover:text-red-600">Try Again</button>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tracking ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Origin & Destination</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Est. Delivery</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                        {loading && shipments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                                    Loading shipments...
                                </td>
                            </tr>
                        ) : shipments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                                    No active shipments found. Create a new shipment to get started.
                                </td>
                            </tr>
                        ) : (
                            shipments.map((shipment) => (
                                <tr key={shipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                        {shipment.trackingId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {shipment.customer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col">
                                            <span>From: {shipment.origin}</span>
                                            <span>To: {shipment.destination}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={shipment.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {shipment.estimatedDelivery}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {shipment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}