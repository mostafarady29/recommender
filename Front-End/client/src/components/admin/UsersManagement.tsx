import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Save, UserPlus, Trash2, Search } from "lucide-react";

interface User {
    User_ID: number;
    Name: string;
    Email: string;
    Role: string;
}

interface UserRoleUpdate {
    userId: number;
    newRole: string;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [roleCounts, setRoleCounts] = useState<{ [key: string]: number }>({});
    const [pendingChanges, setPendingChanges] = useState<Map<number, string>>(new Map());

    // Delete dialog
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Create user dialog
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "Researcher"
    });

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            // If searching, get all users. Otherwise use pagination
            const limit = searchQuery ? 1000 : 20;
            const currentPage = searchQuery ? 1 : page;

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users?page=${currentPage}&limit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                setUsers(data.data.users);
                setTotal(data.data.pagination.total);
                setTotalPages(data.data.pagination.totalPages);
                setRoleCounts(data.data.roleCounts || {});
            } else {
                toast.error(data.message || "Failed to load users");
            }
        } catch (error) {
            console.error("Fetch users error:", error);
            toast.error("An error occurred while loading users");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (userId: number, newRole: string) => {
        const newChanges = new Map(pendingChanges);
        newChanges.set(userId, newRole);
        setPendingChanges(newChanges);
    };

    const saveRoleChange = async (userId: number) => {
        const newRole = pendingChanges.get(userId);
        if (!newRole) return;

        try {
            setUpdating(userId);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}/role`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ role: newRole }),
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("User role updated successfully");
                // Update local state
                setUsers(users.map(user =>
                    user.User_ID === userId ? { ...user, Role: newRole } : user
                ));
                // Clear pending change
                const newChanges = new Map(pendingChanges);
                newChanges.delete(userId);
                setPendingChanges(newChanges);
                // Refresh to update counts
                fetchUsers();
            } else {
                toast.error(data.message || "Failed to update role");
            }
        } catch (error) {
            console.error("Update role error:", error);
            toast.error("An error occurred while updating role");
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setDeleting(userToDelete.User_ID);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userToDelete.User_ID}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("User deleted successfully");
                setShowDeleteDialog(false);
                setUserToDelete(null);
                fetchUsers(); // Refresh list
            } else {
                toast.error(data.message || "Failed to delete user");
            }
        } catch (error) {
            console.error("Delete user error:", error);
            toast.error("An error occurred while deleting user");
        } finally {
            setDeleting(null);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newUser.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setCreating(true);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(newUser),
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("User created successfully");
                setShowCreateDialog(false);
                setNewUser({ name: "", email: "", password: "", role: "Researcher" });
                fetchUsers(); // Refresh list
            } else {
                toast.error(data.message || "Failed to create user");
            }
        } catch (error) {
            console.error("Create user error:", error);
            toast.error("An error occurred while creating user");
        } finally {
            setCreating(false);
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "Admin":
                return "destructive";
            case "Researcher":
                return "default";
            default:
                return "secondary";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Add User */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-2 flex-1 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    setPage(1);
                                    fetchUsers();
                                }
                            }}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setPage(1);
                            fetchUsers();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 shadow-md"
                    >
                        <Search className="w-4 h-4" />
                    </Button>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 hover:scale-105 shadow-lg">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Add a new user to the system
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="Enter user name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="Enter password (min 6 characters)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Researcher">Researcher</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateUser} disabled={creating}>
                                {creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create User"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="text-sm font-medium text-blue-100 mb-2">Total Users</div>
                        <div className="text-4xl font-bold text-white">{total}</div>
                    </div>
                </div>
                <div className="stat-card group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="text-sm font-medium text-red-100 mb-2">Admins</div>
                        <div className="text-4xl font-bold text-white">
                            {roleCounts.Admin || 0}
                        </div>
                    </div>
                </div>
                <div className="stat-card group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="text-sm font-medium text-green-100 mb-2">Researchers</div>
                        <div className="text-4xl font-bold text-white">
                            {roleCounts.Researcher || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Current Role</TableHead>
                            <TableHead>Change Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users
                            .filter(user =>
                                searchQuery === "" ||
                                user.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                user.Email.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((user) => {
                                const hasPendingChange = pendingChanges.has(user.User_ID);
                                const pendingRole = pendingChanges.get(user.User_ID);
                                const isUpdating = updating === user.User_ID;

                                return (
                                    <TableRow key={user.User_ID}>
                                        <TableCell className="font-medium">{user.Name}</TableCell>
                                        <TableCell>{user.Email}</TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(user.Role)}>
                                                {user.Role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={pendingRole || user.Role}
                                                onValueChange={(value) => handleRoleChange(user.User_ID, value)}
                                                disabled={isUpdating}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Admin">Admin</SelectItem>
                                                    <SelectItem value="Researcher">Researcher</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {hasPendingChange && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => saveRoleChange(user.User_ID)}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="w-4 h-4 mr-1" />
                                                                Save
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setShowDeleteDialog(true);
                                                    }}
                                                    disabled={deleting === user.User_ID}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination - Hidden when searching */}
            {!searchQuery && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user <strong>{userToDelete?.Name}</strong> ({userToDelete?.Email}).
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete User"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
