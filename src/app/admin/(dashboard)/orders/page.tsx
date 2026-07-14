import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  CREATED: "bg-amber-600/10 text-amber-800 dark:text-amber-300",
  PAID: "bg-green-600/10 text-green-800 dark:text-green-300",
  FAILED: "bg-red-600/10 text-red-800 dark:text-red-300",
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Orders placed through the storefront checkout.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-black/10 text-black/60 dark:border-white/15 dark:text-white/60">
              <tr>
                <th className="py-2 pr-4">Receipt</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Items</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-black/5 align-top dark:border-white/10">
                  <td className="py-2 pr-4 font-mono text-xs">{order.receipt}</td>
                  <td className="py-2 pr-4">
                    <div>{order.customerName}</div>
                    <div className="text-black/50 dark:text-white/50">{order.customerEmail}</div>
                  </td>
                  <td className="py-2 pr-4">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="py-2 pr-4">
                    ₹{(order.amountInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 text-black/60 dark:text-white/60">
                    {order.createdAt.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
