import { useCallback, useState, useRef } from 'react';
import { HiOutlineCloudUpload, HiOutlineDocumentText } from 'react-icons/hi';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    label?: string;
}

export default function FileUpload({
    onFileSelect,
    accept = '.csv',
    label = 'Upload CSV File',
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${isDragging
                    ? 'border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/5'
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
                <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${isDragging
                            ? 'bg-violet-500/20 text-violet-300 scale-110'
                            : 'bg-white/5 text-gray-400 group-hover:bg-violet-500/10 group-hover:text-violet-300'
                        }`}
                >
                    <HiOutlineCloudUpload className="h-8 w-8" />
                </div>

                <div>
                    <p className="text-lg font-semibold text-white">{label}</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Drag & drop your file here, or click to browse
                    </p>
                </div>

                {selectedFile && (
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm">
                        <HiOutlineDocumentText className="h-4 w-4 text-violet-400" />
                        <span className="text-gray-300">{selectedFile.name}</span>
                        <span className="text-gray-600">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                    </div>
                )}
            </div>

            {/* Animated border glow */}
            {isDragging && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5 animate-pulse" />
            )}
        </div>
    );
}
