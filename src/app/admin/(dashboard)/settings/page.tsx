"use client";

import { useEffect, useState } from "react";

type ConfigView = {
  keyId: string;
  keySecretMasked: string;
  enabled: boolean;
  hasWebhookSecret: boolean;
  updatedAt: string;
} | null;

const inputClass =
  "rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm text-foreground transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring";

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

    setConfig(data.config ?? null);
    setKeySecret("");
    setWebhookSecret("");
    setMessage({ type: "success", text: "Gateway configuration saved." });
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Gateway Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the Razorpay key_id and key_secret used for checkout, payment links, and webhooks.
          The secret is encrypted before it&apos;s stored.
        </p>
      </div>

      {config && (
        <dl className="glass grid grid-cols-2 gap-4 rounded-2xl p-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">key_id</dt>
            <dd className="mt-1 truncate font-mono text-sm">{config.keyId}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">key_secret</dt>
            <dd className="mt-1 font-mono text-sm">{config.keySecretMasked}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Webhook secret</dt>
            <dd className="mt-1 text-sm">{config.hasWebhookSecret ? "Set" : "Not set"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm">
              <span className={`size-1.5 rounded-full ${config.enabled ? "bg-success" : "bg-muted-foreground"}`} />
              {config.enabled ? "Enabled" : "Disabled"}
            </dd>
          </div>
        </dl>
      )}

      {message && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === "error"
              ? "bg-destructive-muted text-destructive-strong"
              : "bg-success-muted text-success-strong"
          }`}
        >
          {message.text}
        </p>
      )}

      <form onSubmit={onSave} className="glass flex flex-col gap-4 rounded-2xl p-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          key_id
          <input
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            required
            placeholder="rzp_test_xxxxxxxxxxxx"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          key_secret{" "}
          {config && <span className="font-normal text-muted-foreground">(leave blank to keep current)</span>}
          <input
            type="password"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            placeholder={config ? "••••••••••••" : "required for first setup"}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          webhook secret{" "}
          <span className="font-normal text-muted-foreground">
            (optional — set this in Razorpay dashboard webhooks)
          </span>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder={config?.hasWebhookSecret ? "•••••••••••• (already set)" : "optional"}
            className={inputClass}
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <span className="text-sm font-medium">Enable Razorpay payments</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ${
              enabled ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-150 ${
                enabled ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>

        <div className="mt-1 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onTest}
            disabled={testing}
            className="cursor-pointer rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testing ? "Testing..." : "Test connection"}
          </button>
        </div>
      </form>
    </div>
  );
}
