import React, { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppLayout from '@/layouts/app-layout';
import { Trash2, Copy, Check, KeyRound, AlertCircle, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClientKey {
  id: number;
  key: string;
  locked: boolean;
  locked_at?: string;
  created_at: string;
  projects_count?: number;
}

interface Props {
  keys: ClientKey[];
}

function route(name: string): string {
  const routes: Record<string, string> = {
    "client-keys.store": "/admin/client-keys",
  };
  return routes[name] || "/";
}

// ---------- Ledger stat block (matches dashboard / projects pages) ----------
const LedgerStat = ({
  index,
  label,
  value,
  icon: Icon,
  redInk,
}: {
  index: string;
  label: string;
  value: number;
  icon: React.ElementType;
  redInk?: boolean;
}) => (
  <div className="border border-border p-6">
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] text-muted-foreground">{index}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      </div>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
    </div>
    <span className={`font-mono text-3xl font-semibold tabular-nums ${redInk ? "text-destructive" : "text-foreground"}`}>
      {String(value).padStart(2, "0")}
    </span>
  </div>
);

// Status mark — filled/hollow dot instead of a colored badge
const Mark = ({ locked }: { locked: boolean }) => (
  <span
    className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${
      locked ? "text-destructive" : "text-muted-foreground"
    }`}
  >
    <span className={`h-1.5 w-1.5 ${locked ? "bg-destructive" : "border border-current bg-transparent"}`} />
    {locked ? "Locked" : "Available"}
  </span>
);

export default function ClientKeys({ keys }: Props) {
  const { post, delete: deleteKey, processing } = useForm();
  const { flash } = usePage().props as any;
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });

  useEffect(() => {
    if (flash?.error) {
      setErrorMessage({ title: flash.error.title, description: flash.error.description });
      setDeleteDialogOpen(false);
      setErrorDialogOpen(true);
    }
  }, [flash?.error]);

  const generateKey = () => {
    post(route("client-keys.store"));
  };

  function destroyKey() {
    if (selectedKeyId === null) return;

    deleteKey(`/admin/client-keys/${selectedKeyId}`, {
      preserveScroll: true,
      preserveState: false,
      onSuccess: () => setDeleteDialogOpen(false),
      onError: (errors: any) => {
        if (errors?.error) {
          setErrorMessage(errors.error);
        } else {
          setErrorMessage({ title: "Error", description: "An unexpected error occurred." });
        }
        setErrorDialogOpen(true);
      },
    });
  }

  const handleDeleteClick = (key: any) => {
    if (key.projects_count > 0) {
      setErrorMessage({
        title: "Cannot Delete Client Key",
        description: `This client key has ${key.projects_count} project(s) linked to it. Please reassign or delete them first.`,
      });
      setErrorDialogOpen(true);
    } else {
      setSelectedKeyId(key.id);
      setDeleteDialogOpen(true);
    }
  };

  function copyKey(id: number, key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const availableKeys = keys.filter((key) => !key.locked).length;
  const lockedKeys = keys.filter((key) => key.locked).length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1400px] p-6 lg:p-8 space-y-3">
          {/* Masthead */}
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Authentication Register
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Client Keys</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate and manage API keys for client authentication
              </p>
            </div>
            <Button
              onClick={generateKey}
              disabled={processing}
              className="w-full gap-2 rounded-none sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Generate New Key
            </Button>
          </div>

          {/* Stat ledger */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <LedgerStat index="01" label="Total Keys" value={keys.length} icon={KeyRound} />
            <LedgerStat index="02" label="Available Keys" value={availableKeys} icon={Check} />
            <LedgerStat index="03" label="Locked Keys" value={lockedKeys} icon={AlertCircle} redInk={lockedKeys > 0} />
          </div>

          {/* Empty state */}
          {keys.length === 0 && (
            <Alert className="rounded-none border-border">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">
                No client keys have been generated yet. Click "Generate New Key" to create your first key.
              </AlertDescription>
            </Alert>
          )}

          {/* Key register — flat rows, no nested table chrome */}
          {keys.length > 0 && (
            <div className="border border-border">
              <div className="border-b border-border p-6">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">API Keys</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  All generated client authentication keys, most recent first
                </p>
              </div>

              {/* Column headers */}
              <div className="hidden grid-cols-[3rem_1fr_7rem_11rem_3rem] gap-4 border-b border-border px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:grid">
                <span>Id</span>
                <span>Key</span>
                <span>Status</span>
                <span>Created At</span>
                <span className="text-right">Del</span>
              </div>

              {keys.map((key) => (
                <div
                  key={key.id}
                  className="group grid grid-cols-1 gap-3 border-b border-border px-6 py-4 last:border-b-0 md:grid-cols-[3rem_1fr_7rem_11rem_3rem] md:items-center md:gap-4"
                >
                  <span className="font-mono text-xs text-muted-foreground">#{key.id}</span>

                  <div className="flex min-w-0 items-center gap-2">
                    <code className="flex-1 truncate border border-border bg-muted/30 px-2 py-1.5 font-mono text-xs text-foreground">
                      {key.key}
                    </code>
                    <button
                      onClick={() => copyKey(key.id, key.key)}
                      title="Copy to clipboard"
                      className="shrink-0 p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    >
                      {copiedId === key.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <Mark locked={key.locked} />

                  <span className="font-mono text-[11px] text-muted-foreground">{formatDate(key.created_at)}</span>

                  <div className="justify-self-start md:justify-self-end">
                    <button
                      onClick={() => handleDeleteClick(key)}
                      title="Delete key"
                      className="p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected client key will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={destroyKey}
              className="rounded-none bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-destructive">
              <AlertCircle className="h-5 w-5" />
              {errorMessage.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{errorMessage.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)} className="rounded-none">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}