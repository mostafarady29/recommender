import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Paper {
    Paper_ID: number;
    Title: string;
    Abstract: string;
    Publication_Date: string;
    Field_Name: string;
    Admin_Name: string;
    Download_Count: number;
    Review_Count: number;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function PapersManagement() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paperToDelete, setPaperToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchPapers();
    }, [pagination.page]);

    const fetchPapers = async () => {
        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const response = await fetch(
                `${baseUrl}/api/admin/papers?page=${pagination.page}&limit=${pagination.limit}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await response.json();

            if (data.success) {
                setPapers(data.data.papers);
                setPagination(data.data.pagination);
            } else {
                toast.error("Failed to load papers");
            }
        } catch (error) {
            console.error("Error fetching papers:", error);
            toast.error("An error occurred while loading papers");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!paperToDelete) return;

        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const response = await fetch(
                `${baseUrl}/api/admin/papers/${paperToDelete}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("Paper deleted successfully");
                fetchPapers();
            } else {
                toast.error(data.message || "Failed to delete paper");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred while deleting");
        } finally {
            setDeleteDialogOpen(false);
            setPaperToDelete(null);
        }
    };

    const openDeleteDialog = (paperId: number) => {
        setPaperToDelete(paperId);
        setDeleteDialogOpen(true);
    };

    const filteredPapers = papers.filter((paper) =>
        paper.Title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const goToPage = (page: number) => {
        setPagination({ ...pagination, page });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search papers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Field</TableHead>
                            <TableHead>Publication Date</TableHead>
                            <TableHead>Downloads</TableHead>
                            <TableHead>Reviews</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPapers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No papers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPapers.map((paper) => (
                                <TableRow key={paper.Paper_ID}>
                                    <TableCell className="font-medium max-w-md truncate">
                                        {paper.Title}
                                    </TableCell>
                                    <TableCell>{paper.Field_Name}</TableCell>
                                    <TableCell>
                                        {new Date(paper.Publication_Date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{paper.Download_Count}</TableCell>
                                    <TableCell>{paper.Review_Count}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDeleteDialog(paper.Paper_ID)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} papers
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="text-sm">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the paper
                            and all associated data (downloads, reviews, etc.).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
