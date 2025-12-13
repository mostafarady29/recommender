import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, Plus } from "lucide-react";

interface Author {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
}

interface Field {
    Field_ID: number;
    Field_Name: string;
}

export default function UploadPaperForm() {
    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [publicationDate, setPublicationDate] = useState("");
    const [fieldId, setFieldId] = useState("");
    const [authors, setAuthors] = useState<Author[]>([
        { firstName: "", lastName: "", email: "", country: "" },
    ]);
    const [keywords, setKeywords] = useState<string[]>([""]);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fields`);
            const data = await response.json();
            if (data.success && data.data && data.data.fields) {
                setFields(data.data.fields);
            } else if (data.success && Array.isArray(data.data)) {
                setFields(data.data);
            }
        } catch (error) {
            console.error("Error fetching fields:", error);
            toast.error("Failed to load fields");
        }
    };

    const addAuthor = () => {
        setAuthors([...authors, { firstName: "", lastName: "", email: "", country: "" }]);
    };

    const removeAuthor = (index: number) => {
        if (authors.length > 1) {
            setAuthors(authors.filter((_, i) => i !== index));
        }
    };

    const updateAuthor = (index: number, field: keyof Author, value: string) => {
        const newAuthors = [...authors];
        newAuthors[index][field] = value;
        setAuthors(newAuthors);
    };

    const addKeyword = () => {
        setKeywords([...keywords, ""]);
    };

    const removeKeyword = (index: number) => {
        if (keywords.length > 1) {
            setKeywords(keywords.filter((_, i) => i !== index));
        }
    };

    const updateKeyword = (index: number, value: string) => {
        const newKeywords = [...keywords];
        newKeywords[index] = value;
        setKeywords(newKeywords);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                setPdfFile(file);
            } else {
                toast.error("Please select a PDF file");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !abstract || !fieldId || !pdfFile) {
            toast.error("Please fill in all required fields and upload a PDF");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("abstract", abstract);
            formData.append("publicationDate", publicationDate || new Date().toISOString().split('T')[0]);
            formData.append("fieldId", fieldId);
            formData.append("pdfFile", pdfFile);

            // Filter out empty authors
            const validAuthors = authors.filter(
                (a) => a.firstName && a.lastName && a.email
            );
            if (validAuthors.length > 0) {
                formData.append("authors", JSON.stringify(validAuthors));
            }

            // Filter out empty keywords
            const validKeywords = keywords.filter((k) => k.trim() !== "");
            if (validKeywords.length > 0) {
                formData.append("keywords", JSON.stringify(validKeywords));
            }

            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/papers`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("Paper uploaded successfully!");
                // Reset form
                setTitle("");
                setAbstract("");
                setPublicationDate("");
                setFieldId("");
                setAuthors([{ firstName: "", lastName: "", email: "", country: "" }]);
                setKeywords([""]);
                setPdfFile(null);
            } else {
                toast.error(data.message || "Failed to upload paper");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An error occurred while uploading");
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter paper title"
                    required
                />
            </div>

            {/* Abstract */}
            <div className="space-y-2">
                <Label htmlFor="abstract">
                    Abstract <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="abstract"
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Enter paper abstract"
                    rows={6}
                    required
                />
            </div>

            {/* Field and Publication Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="field">
                        Field <span className="text-red-500">*</span>
                    </Label>
                    <Select value={fieldId} onValueChange={setFieldId} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                            {fields.map((field) => (
                                <SelectItem key={field.Field_ID} value={field.Field_ID.toString()}>
                                    {field.Field_Name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="publicationDate">Publication Date</Label>
                    <Input
                        id="publicationDate"
                        type="date"
                        value={publicationDate}
                        onChange={(e) => setPublicationDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Authors */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Authors</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAuthor}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Author
                    </Button>
                </div>

                {authors.map((author, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                        {authors.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => removeAuthor(index)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                                placeholder="First Name"
                                value={author.firstName}
                                onChange={(e) => updateAuthor(index, "firstName", e.target.value)}
                            />
                            <Input
                                placeholder="Last Name"
                                value={author.lastName}
                                onChange={(e) => updateAuthor(index, "lastName", e.target.value)}
                            />
                            <Input
                                placeholder="Email"
                                type="email"
                                value={author.email}
                                onChange={(e) => updateAuthor(index, "email", e.target.value)}
                            />
                            <Input
                                placeholder="Country"
                                value={author.country}
                                onChange={(e) => updateAuthor(index, "country", e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Keywords */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Keywords</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Keyword
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {keywords.map((keyword, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                placeholder="Enter keyword"
                                value={keyword}
                                onChange={(e) => updateKeyword(index, e.target.value)}
                            />
                            {keywords.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeKeyword(index)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
                <Label htmlFor="pdfFile">
                    PDF File <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {pdfFile ? (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{pdfFile.name}</p>
                            <p className="text-xs text-gray-500">
                                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPdfFile(null)}
                            >
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="text-sm text-gray-600">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PDF (MAX. 50MB)</p>
                            <Input
                                id="pdfFile"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("pdfFile")?.click()}
                            >
                                Select File
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Paper"}
            </Button>
        </form>
    );
}
