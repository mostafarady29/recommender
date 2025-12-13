import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Star, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface OverviewStats {
    totalPapers: number;
    totalFields: number;
    totalAuthors: number;
    totalDownloads: number;
}

interface PaperStats {
    totalPapers: number;
    papersByField: Array<{ Field_Name: string; count: number }>;
    recentPapers: Array<{ Paper_ID: number; Title: string; Publication_Date: string }>;
}

export default function StatisticsPanel() {
    const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
    const [paperStats, setPaperStats] = useState<PaperStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const [overviewRes, papersRes] = await Promise.all([
                fetch(`${baseUrl}/api/statistics/overview`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${baseUrl}/api/statistics/papers`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const overviewData = await overviewRes.json();
            const papersData = await papersRes.json();

            if (overviewData.success) {
                setOverviewStats(overviewData.data);
            }

            if (papersData.success) {
                setPaperStats(papersData.data);
            }
        } catch (error) {
            console.error("Error fetching statistics:", error);
            toast.error("Failed to load statistics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overviewStats?.totalPapers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {overviewStats?.totalFields || 0} fields
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overviewStats?.totalDownloads || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            All-time downloads
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overviewStats?.totalAuthors || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Contributing authors
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Research Fields</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overviewStats?.totalFields || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Active fields
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Papers by Field */}
            <Card>
                <CardHeader>
                    <CardTitle>Papers by Field</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {paperStats?.papersByField.slice(0, 5).map((field, index) => (
                            <div key={index} className="flex items-center">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">{field.Field_Name}</p>
                                </div>
                                <div className="ml-auto font-medium">{field.count} papers</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Papers */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Papers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {paperStats?.recentPapers.map((paper) => (
                            <div key={paper.Paper_ID} className="flex items-start space-x-4">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">{paper.Title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(paper.Publication_Date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
