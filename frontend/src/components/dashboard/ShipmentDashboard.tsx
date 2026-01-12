import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  DollarSign, 
  MoreHorizontal,
  MapPin,
  Clock,
  CheckCircle2,
  RefreshCw
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

const stats = [
  { name: 'Total Shipments', value: '1,284', change: '+12%', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Out for Delivery', value: '42', change: '+4%', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-100' },
  { name: 'Delayed', value: '8', change: '-2%', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  { name: 'Total Revenue', value: '$45.2k', change: '+8%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
];

// --- Components ---

const MetricCard = ({ stat }: { stat: typeof stats[0] }) => (
  <div className="bg-white dark:bg-slate-900 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
    <div className="flex items-center">
      <div className={cn("p-3 rounded-lg", stat.bg, "dark:bg-opacity-10")}>
        <stat.icon className={cn("h-6 w-6", stat.color)} />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{stat.name}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</div>
            <div className={cn(
              "ml-2 flex items-baseline text-xs font-medium",
              stat.change.startsWith('+') ? "text-green-600" : "text-red-600"
            )}>
              {stat.change}
            </div>
          </dd>
        </dl>
      </div>
    </div>
    {/* Sparkline placeholder */}
    <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-logistics-500 w-2/3 rounded-full" />
    </div>
  </div>
);

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

const ShipmentStepper = ({ currentStatus }: { currentStatus: ShipmentStatus }) => {
  const steps = ['Ordered', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
  const mappedStatus = mapBackendStatus(currentStatus);
  const currentIndex = steps.indexOf(mappedStatus === 'Exception' ? 'In Transit' : mappedStatus);

  return (
    <div className="w-full py-4">
        <div className="flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
            
            {steps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={step} className="flex flex-col items-center bg-white dark:bg-slate-900 px-2">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-200",
                            isCompleted ? "bg-logistics-600 border-logistics-600 text-white" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400"
                        )}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
                        </div>
                        <span className={cn(
                            "text-xs mt-2 font-medium absolute -bottom-6 w-24 text-center", 
                            isCurrent ? "text-logistics-700 dark:text-logistics-400" : "text-slate-500 dark:text-slate-400",
                            index === 0 ? "left-0 text-left px-2" : index === steps.length - 1 ? "right-0 text-right px-2" : "left-1/2 -translate-x-1/2"
                        )}>
                            {step}
                        </span>
                    </div>
                )
            })}
        </div>
        <div className="h-6" /> {/* Spacer for text */}
    </div>
  );
};

export default function ShipmentDashboard() {
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Overview of your logistics operations</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={fetchShipments}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title="Refresh Data"
                >
                    <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                </button>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                    Export Report
                </button>
                <button className="px-4 py-2 bg-logistics-600 text-white rounded-lg text-sm font-medium hover:bg-logistics-700 shadow-sm shadow-logistics-500/30">
                    New Shipment
                </button>
            </div>
        </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid (Bento Boxish) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Shipment Table (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 dark:text-white">Recent Shipments</h3>
                <button className="text-sm text-logistics-600 hover:text-logistics-700 font-medium">View All</button>
            </div>
            
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Est. Delivery</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                            {loading && shipments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        Loading shipments...
                                    </td>
                                </tr>
                            ) : shipments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        No active shipments found.
                                    </td>
                                </tr>
                            ) : (
                                shipments.map((shipment) => (
                                    <tr key={shipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                            {shipment.trackingId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            <div className="font-medium text-slate-900 dark:text-slate-200">{shipment.customer}</div>
                                            <div className="text-xs">{shipment.origin} → {shipment.destination.split(',')[0]}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={shipment.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {shipment.estimatedDelivery}
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

        {/* Featured Tracking / Status (Span 1) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Track Shipment</h3>
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Tracking ID</span>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">TRK-93812</div>
                        </div>
                        <StatusBadge status="In Transit" />
                    </div>
                    <div className="space-y-2 mt-4">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                            <span>Current Location: <span className="font-medium text-slate-900 dark:text-white">Harrisburg, PA Distribution Center</span></span>
                        </div>
                         <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                            <Clock className="w-4 h-4 mr-2 text-slate-400" />
                            <span>Est. Delivery: <span className="font-medium text-slate-900 dark:text-white">Today, 2:00 PM</span></span>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-6">Progress</h4>
                    <ShipmentStepper currentStatus="In Transit" />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
