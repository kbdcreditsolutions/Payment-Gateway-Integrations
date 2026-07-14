"use client";

import { useEffect, useState } from "react";

type ConfigView = {
  keyId: string;
  keySecretMasked: string;
  enabled: boolean;
  hasWebhookSecret: boolean;
  updatedAt: string;
} | null;

export default function GatewaySettingsPage() {
  const [config, setConfig] = useState<ConfigView>(null);
  const [loading, setLoading] = useState(true);

  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [enabled, setEnabled] = useState(false);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/gateway-config")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data.config);
        if (data.config) {
          setKeyId(data.config.keyId);
          setEnabled(data.config.enabled);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function onTest(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!keyId || !keySecret) {
      setMessage({ type: "error", text: "Enter both key_id and key_secret to test." });
      return;
    }
    setTesting(true);
    const res = await fetch("/api/admin/gateway-config/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyId, keySecret }),
    });
    const data = await res.json();
    setTesting(false);
    setMessage(
      data.ok
        ? { type: "success", text: "Connection successful — credentials are valid." }
        : { type: "error", text: data.error ?? "Connection failed." }
    );
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!config && !keySecret) {
      setMessage({ type: "error", text: "key_secret is required for first-time setup." });
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/gateway-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyId,
        keySecret: keySecret || undefined,
        webhookSecret: webhookSecret || undefined,
        enabled,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Save failed." });
      return;
    }

    setConfig(data.config ? { ...data.config, updatedAt: data.config.updatedAt } : data.config);
    setKeySecret("");
    setWebhookSecret("");
    setMessage({ type: "success", text: "Gateway configuration saved." });
  }

  if (loading) {
    return <p className="text-sm text-black/60 dark:text-white/60">Loading...</p>;
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Gateway Settings</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Configure the Razorpay key_id and key_secret used for checkout, payment links, and webhooks.
          The secret is encrypted before it&apos;s stored.
        </p>
      </div>

      {config && (
        <div className="rounded-md border border-black/10 px-4 py-3 text-sm dark:border-white/15">
          <div>Current key_id: <code>{config.keyId}</code></div>
          <div>Current key_secret: <code>{config.keySecretMasked}</code></div>
          <div>Webhook secret set: {config.hasWebhookSecret ? "yes" : "no"}</div>
          <div>Status: {config.enabled ? "enabled" : "disabled"}</div>
        </div>
      )}

      {message && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            message.type === "error"
              ? "bg-red-600/10 text-red-700 dark:text-red-400"
              : "bg-green-600/10 text-green-700 dark:text-green-400"
          }`}
        >
          {message.text}
        </p>
      )}

      <form onSubmit={onSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          key_id
          <input
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            required
            placeholder="rzp_test_xxxxxxxxxxxx"
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 font-mono text-sm dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          key_secret {config && <span className="text-black/50 dark:text-white/50">(leave blank to keep current)</span>}
          <input
            type="password"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            placeholder={config ? "••••••••••••" : "required for first setup"}
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 font-mono text-sm dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          webhook secret <span className="text-black/50 dark:text-white/50">(optional — set this in Razorpay dashboard webhooks)</span>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder={config?.hasWebhookSecret ? "•••••••••••• (already set)" : "optional"}
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 font-mono text-sm dark:border-white/20"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enable Razorpay payments
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onTest}
            disabled={testing}
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-white/20"
          >
            {testing ? "Testing..." : "Test connection"}
          </button>
        </div>
      </form>
    </div>
  );
}
