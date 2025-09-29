import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useToast } from "../hooks/use-toast";
import {
  useAdminUsers,
  useAdminUserStats,
  useDeactivateAdminUser,
  useInviteAdminUser,
  useUpdateAdminUser,
} from "../hooks/api";
import type { User } from "../services/api.service";
import { useAuth } from "../contexts/AuthContext";
import {
  Activity,
  Ban,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";

interface InviteFormState {
  email: string;
  firstName: string;
  lastName: string;
  role: User["role"];
  phone?: string;
}

interface EditFormState {
  firstName: string;
  lastName: string;
  phone?: string;
  role: User["role"];
  isActive: boolean;
}

const ROLE_OPTIONS: Array<{ value: User["role"]; label: string }> = [
  { value: "admin", label: "Administrator" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "patient", label: "Patient" },
];

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatRelative = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} min ago`;
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hr ago`;
  }
  const days = Math.floor(diff / day);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const getInitials = (user: User) => {
  const firstInitial = user.firstName?.charAt(0);
  const lastInitial = user.lastName?.charAt(0);
  if (firstInitial || lastInitial) {
    return `${firstInitial ?? ""}${lastInitial ?? ""}`.toUpperCase();
  }
  return user.email.charAt(0).toUpperCase();
};

const roleBadgeVariant: Record<User["role"], string> = {
  admin:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200",
  doctor: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200",
  nurse: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-200",
  pharmacist:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  patient:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
};

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);
  const [inviteForm, setInviteForm] = useState<InviteFormState>({
    email: "",
    firstName: "",
    lastName: "",
    role: "doctor",
    phone: "",
  });
  const [editForm, setEditForm] = useState<EditFormState | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (editUser) {
      setEditForm({
        firstName: editUser.firstName ?? "",
        lastName: editUser.lastName ?? "",
        phone: editUser.phone,
        role: editUser.role,
        isActive: editUser.isActive,
      });
    } else {
      setEditForm(null);
    }
  }, [editUser]);

  const usersQuery = useAdminUsers({
    page,
    limit,
    search: debouncedSearch,
  });
  const statsQuery = useAdminUserStats();

  const inviteMutation = useInviteAdminUser();
  const updateMutation = useUpdateAdminUser();
  const deactivateMutation = useDeactivateAdminUser();

  const users = usersQuery.data?.users ?? [];
  const pagination = usersQuery.data?.pagination;
  const stats = statsQuery.data;

  const summaryCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      sublabel: "Across all roles",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers ?? 0,
      icon: Activity,
      sublabel: `Active last 30d: ${stats?.activeLast30Days ?? 0}`,
    },
    {
      title: "Administrators",
      value: stats?.admins ?? 0,
      icon: Shield,
      sublabel: `${stats?.doctors ?? 0} clinicians`,
    },
    {
      title: "Inactive",
      value: stats?.inactiveUsers ?? 0,
      icon: Ban,
      sublabel: "Soft-deactivated accounts",
    },
  ];

  const handleInviteSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const payload: InviteFormState = {
      ...inviteForm,
      email: inviteForm.email.trim(),
      firstName: inviteForm.firstName.trim(),
      lastName: inviteForm.lastName.trim(),
      phone: inviteForm.phone?.trim() || undefined,
    };

    try {
      const result = await inviteMutation.mutateAsync(payload);
      if (result.success) {
        toast({
          title: "Invitation sent",
          description: result.message ?? "The user has been invited.",
        });
        setInviteOpen(false);
        setInviteForm({
          email: "",
          firstName: "",
          lastName: "",
          role: "doctor",
          phone: "",
        });
      } else {
        throw new Error(result.error ?? "Unable to invite user");
      }
    } catch (error: any) {
      toast({
        title: "Invite failed",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editUser || !editForm) return;

    try {
      const result = await updateMutation.mutateAsync({
        id: editUser.id,
        updates: {
          firstName: editForm.firstName.trim() || undefined,
          lastName: editForm.lastName.trim() || undefined,
          phone: editForm.phone?.trim() || undefined,
          role: editForm.role,
          isActive: editForm.isActive,
        },
      });

      if (result.success && result.data) {
        toast({
          title: "User updated",
          description: `${result.data.name} has been updated successfully.`,
        });
        setEditUser(null);
      } else {
        throw new Error(result.error ?? "Update failed");
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateUser) return;
    try {
      const result = await deactivateMutation.mutateAsync(deactivateUser.id);
      if (result.success) {
        toast({
          title: "User deactivated",
          description: `${deactivateUser.name} has been deactivated.`,
        });
        setDeactivateUser(null);
      } else {
        throw new Error(result.error ?? "Unable to deactivate user");
      }
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const isInitialLoading = usersQuery.isLoading;
  const isFetching = usersQuery.isFetching;
  const showEmptyState = !isInitialLoading && users.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage users, invitations, and access controls
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && <Badge variant="outline">{user.email}</Badge>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                usersQuery.refetch();
                statsQuery.refetch();
              }}
              disabled={usersQuery.isFetching || statsQuery.isFetching}
            >
              {usersQuery.isFetching || statsQuery.isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a new user</DialogTitle>
                  <DialogDescription>
                    Send an invitation email with a temporary password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={inviteForm.email}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        required
                        value={inviteForm.firstName}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            firstName: event.target.value,
                          }))
                        }
                        placeholder="Taylor"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        required
                        value={inviteForm.lastName}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            lastName: event.target.value,
                          }))
                        }
                        placeholder="Morgan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={inviteForm.role}
                        onValueChange={(value: User["role"]) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            role: value,
                          }))
                        }
                      >
                        <SelectTrigger id="role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={inviteForm.phone ?? ""}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={inviteMutation.isPending}>
                      {inviteMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Send invite
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">
                    {statsQuery.isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      card.value
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {card.sublabel}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>User directory</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search and manage all accounts that have access to TeleCheck.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search by name or email"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last active</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isInitialLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading users…
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {showEmptyState && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            No users found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Adjust your search term or invite a new teammate.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isInitialLoading &&
                    users.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {item.avatar ? (
                                <AvatarImage
                                  src={item.avatar}
                                  alt={item.name}
                                />
                              ) : (
                                <AvatarFallback>
                                  {getInitials(item)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground">
                            {item.email}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${roleBadgeVariant[item.role]}`}
                          >
                            {item.role.charAt(0).toUpperCase() +
                              item.role.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.isActive ? "default" : "outline"}
                            className={
                              item.isActive
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                                : "text-muted-foreground"
                            }
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatRelative(item.lastLoginAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => setEditUser(item)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit user
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  !item.isActive || deactivateMutation.isPending
                                }
                                className="text-destructive focus:text-destructive"
                                onSelect={() => setDeactivateUser(item)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row">
              <div className="flex items-center gap-2">
                <span>
                  Showing {users.length} of{" "}
                  {pagination?.totalUsers ?? users.length} users
                </span>
                {isFetching && !isInitialLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1 || isInitialLoading || isFetching}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                </Button>
                <span>
                  Page {page} of {pagination?.totalPages ?? page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((prev) => (pagination?.hasNext ? prev + 1 : prev))
                  }
                  disabled={
                    !pagination?.hasNext || isInitialLoading || isFetching
                  }
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(editUser)}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update profile details, roles, or activation status.
            </DialogDescription>
          </DialogHeader>
          {editUser && editForm && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-first-name">First name</Label>
                  <Input
                    id="edit-first-name"
                    required
                    value={editForm.firstName}
                    onChange={(event) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              firstName: event.target.value,
                            }
                          : prev,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-last-name">Last name</Label>
                  <Input
                    id="edit-last-name"
                    required
                    value={editForm.lastName}
                    onChange={(event) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              lastName: event.target.value,
                            }
                          : prev,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value: User["role"]) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              role: value,
                            }
                          : prev,
                      )
                    }
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phone ?? ""}
                    onChange={(event) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              phone: event.target.value,
                            }
                          : prev,
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Account status
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Inactive accounts cannot sign in until reactivated.
                  </p>
                </div>
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            isActive: checked,
                          }
                        : prev,
                    )
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deactivateUser)}
        onOpenChange={(open) => !open && setDeactivateUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this account?</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateUser
                ? `This will disable sign-in access for ${deactivateUser.name}. You can reactivate the account later from this dashboard.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
