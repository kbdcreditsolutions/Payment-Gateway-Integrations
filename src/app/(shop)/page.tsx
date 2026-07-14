import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/add-to-cart-button";

export const dynamic = "force-dynamic";

const SWATCHES = [
  "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-300",
  "from-pink-500/20 to-pink-500/5 text-pink-600 dark:text-pink-300",
  "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-300",
  "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-300",
];

export default async function CatalogPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Shop</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Test checkout powered by Razorpay. Use test card 4111 1111 1111 1111, any future expiry, any CVV.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No products yet. Run the seed script to add sample products.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="glass group flex flex-col overflow-hidden rounded-2xl transition-all duration-150 hover:-translate-y-0.5"
            >
              <div
                className={`flex h-32 items-center justify-center bg-gradient-to-br font-heading text-4xl font-semibold ${SWATCHES[i % SWATCHES.length]}`}
              >
                {product.name.charAt(0)}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h2 className="font-heading font-medium">{product.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="font-heading text-lg font-semibold">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
