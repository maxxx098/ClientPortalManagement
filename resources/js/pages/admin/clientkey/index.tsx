import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppLayout from '@/layouts/app-layout';
import { Trash2, Copy, Check, KeyRound, AlertCircle, Plus } from "lucide-react";

interface ClientKey {
  id: number;
  key: string;
  locked: boolean;
  locked_at?: string;
  created_at: string;
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

export default function ClientKeys({ keys }: Props) {
  const { post, delete: deleteKey, processing } = useForm();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const generateKey = () => {
    post(route("client-keys.store"));
  };

  function destroyKey(id: number): void {
    if (confirm("Are you sure you want to delete this key? This action cannot be undone.")) {
      deleteKey(route("client-keys.store") + `/${id}`);
    }
  }

  function copyKey(id: number, key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const availableKeys = keys.filter(key => !key.locked).length;
  const lockedKeys = keys.filter(key => key.locked).length;
  

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 ">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Keys Management</h1>
            <p className="text-muted-foreground mt-1">
              Generate and manage API keys for client authentication
            </p>
          </div>
          <Button 
            onClick={generateKey} 
            disabled={processing}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate New Key
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
              <KeyRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keys.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All generated keys
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Keys</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{availableKeys}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for use
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Keys</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lockedKeys}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Temporarily locked / in use
            </p>
          </CardContent>
        </Card>
        </div>

        {/* Alert for no keys */}
        {keys.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No client keys have been generated yet. Click the "Generate New Key" button to create your first key.
            </AlertDescription>
          </Alert>
        )}

        {/* Keys Table */}
        {keys.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                View and manage all generated client authentication keys
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[180px]">Created At</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id} className="group">
                        <TableCell className="font-medium text-muted-foreground">
                          #{key.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="relative rounded bg-muted px-[0.5rem] py-[0.3rem] font-mono text-sm flex-1 overflow-hidden text-ellipsis">
                              {key.key}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyKey(key.id, key.key)}
                              title="Copy to clipboard"
                            >
                              {copiedId === key.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      <TableCell>
                        {key.locked ? (
                          <Badge variant="destructive" className="font-normal">
                            Locked
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600 font-normal">
                            Available
                          </Badge>
                        )}
                      </TableCell>

                        <TableCell className="text-muted-foreground">
                          {new Date(key.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => destroyKey(key.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}