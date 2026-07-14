import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/add-to-cart-button";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Shop</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Test checkout powered by Razorpay. Use test card 4111 1111 1111 1111, any future expiry, any CVV.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No products yet. Run the seed script to add sample products.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <div>
                <h2 className="font-medium">{product.name}</h2>
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">{product.description}</p>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-semibold">
                  ₹{(product.priceInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <AddToCartButton
                  product={{
                    productId: product.id,
                    name: product.name,
                    priceInPaise: product.priceInPaise,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
