import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import UploadPaperForm from "@/components/admin/UploadPaperForm";
import StatisticsPanel from "@/components/admin/StatisticsPanel";
import PapersManagement from "@/components/admin/PapersManagement";
import UsersManagement from "@/components/admin/UsersManagement";
import FieldsManagement from "@/components/admin/FieldsManagement";
import { BarChart3, Upload, FileText, Users, Home, Database } from "lucide-react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("statistics");

    const handleGoHome = () => {
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 animate-in fade-in duration-500">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Manage research papers and view platform statistics
                            </p>
                        </div>
                        <Button
                            onClick={handleGoHome}
                            variant="outline"
                            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Home</span>
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                        <TabsTrigger value="statistics" className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Statistics</span>
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span className="hidden sm:inline">Upload Paper</span>
                        </TabsTrigger>
                        <TabsTrigger value="manage" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Manage Papers</span>
                        </TabsTrigger>
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Users</span>
                        </TabsTrigger>
                        <TabsTrigger value="fields" className="flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            <span className="hidden sm:inline">Fields</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="statistics" className="space-y-6 animate-in slide-in-from-bottom duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Statistics</CardTitle>
                                <CardDescription>
                                    Overview of papers, downloads, reviews, and user activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StatisticsPanel />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-6 animate-in slide-in-from-bottom duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Research Paper</CardTitle>
                                <CardDescription>
                                    Add a new research paper to the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UploadPaperForm />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="manage" className="space-y-6 animate-in slide-in-from-bottom duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Papers</CardTitle>
                                <CardDescription>
                                    View, edit, and delete research papers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PapersManagement />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-6 animate-in slide-in-from-bottom duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Users</CardTitle>
                                <CardDescription>
                                    View and manage user roles
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UsersManagement />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="fields" className="space-y-6 animate-in slide-in-from-bottom duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Fields</CardTitle>
                                <CardDescription>
                                    Manage research field categories
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FieldsManagement />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
