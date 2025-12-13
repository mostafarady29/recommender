import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Search } from "lucide-react";

interface Field {
    Field_ID: number;
    Field_Name: string;
    Description: string | null;
    Paper_Count: number;
}

export default function FieldsManagement() {
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

    // Create/Edit dialog
    const [showDialog, setShowDialog] = useState(false);
    const [editingField, setEditingField] = useState<Field | null>(null);
    const [fieldForm, setFieldForm] = useState({
        fieldName: "",
        description: ""
    });

    // Delete dialog
    const [fieldToDelete, setFieldToDelete] = useState<Field | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fields?limit=100`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success && data.data && data.data.fields) {
                setFields(data.data.fields);
            } else {
                toast.error(data.message || "Failed to load fields");
            }
        } catch (error) {
            console.error("Fetch fields error:", error);
            toast.error("An error occurred while loading fields");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setEditingField(null);
        setFieldForm({ fieldName: "", description: "" });
        setShowDialog(true);
    };

    const handleOpenEditDialog = (field: Field) => {
        setEditingField(field);
        setFieldForm({
            fieldName: field.Field_Name,
            description: field.Description || ""
        });
        setShowDialog(true);
    };

    const handleSaveField = async () => {
        if (!fieldForm.fieldName.trim()) {
            toast.error("Field name is required");
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            const url = editingField
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fields/${editingField.Field_ID}`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fields`;

            const response = await fetch(url, {
                method: editingField ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    Field_Name: fieldForm.fieldName,
                    Description: fieldForm.description || null
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(editingField ? "Field updated successfully" : "Field created successfully");
                setShowDialog(false);
                setFieldForm({ fieldName: "", description: "" });
                setEditingField(null);
                fetchFields();
            } else {
                toast.error(data.message || "Failed to save field");
            }
        } catch (error) {
            console.error("Save field error:", error);
            toast.error("An error occurred while saving field");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteField = async () => {
        if (!fieldToDelete) return;

        try {
            setDeleting(fieldToDelete.Field_ID);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fields/${fieldToDelete.Field_ID}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("Field deleted successfully");
                setShowDeleteDialog(false);
                setFieldToDelete(null);
                fetchFields();
            } else {
                toast.error(data.message || "Failed to delete field");
            }
        } catch (error) {
            console.error("Delete field error:", error);
            toast.error("An error occurred while deleting field");
        } finally {
            setDeleting(null);
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
            {/* Search and Add Field */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search fields..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger asChild>
                        <Button onClick={handleOpenCreateDialog} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 hover:scale-105 shadow-lg">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Field
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingField ? "Edit Field" : "Create New Field"}</DialogTitle>
                            <DialogDescription>
                                {editingField ? "Update the research field details" : "Add a new research field category"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="fieldName">Field Name *</Label>
                                <Input
                                    id="fieldName"
                                    value={fieldForm.fieldName}
                                    onChange={(e) => setFieldForm({ ...fieldForm, fieldName: e.target.value })}
                                    placeholder="e.g., Computer Science"
                                    maxLength={100}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={fieldForm.description}
                                    onChange={(e) => setFieldForm({ ...fieldForm, description: e.target.value })}
                                    placeholder="Brief description of this field"
                                    rows={4}
                                    maxLength={300}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveField} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    editingField ? "Update Field" : "Create Field"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Fields Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Field Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-center">Papers</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields
                            .filter(field =>
                                searchQuery === "" ||
                                field.Field_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (field.Description && field.Description.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                    {searchQuery ? "No fields match your search." : "No fields found. Create your first research field!"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            fields
                                .filter(field =>
                                    searchQuery === "" ||
                                    field.Field_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (field.Description && field.Description.toLowerCase().includes(searchQuery.toLowerCase()))
                                )
                                .map((field) => (
                                    <TableRow key={field.Field_ID}>
                                        <TableCell className="font-medium">{field.Field_Name}</TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {field.Description || <span className="italic text-gray-400">No description</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {field.Paper_Count}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenEditDialog(field)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setFieldToDelete(field);
                                                        setShowDeleteDialog(true);
                                                    }}
                                                    disabled={deleting === field.Field_ID}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Field?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the field <strong>{fieldToDelete?.Field_Name}</strong>?
                            {fieldToDelete && fieldToDelete.Paper_Count > 0 && (
                                <span className="block mt-2 text-red-600">
                                    Warning: This field has {fieldToDelete.Paper_Count} associated paper(s).
                                    You may not be able to delete it.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setFieldToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteField}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Field"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
