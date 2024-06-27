import React, {FormEvent, useEffect, useRef, useState} from "react";
import useDebounce from "../hooks/useDebounce.tsx";

interface DragAndDropProps {
    onSubmit: (files: FileList) => void;
}


export default function DragAndDropFile({onSubmit}: DragAndDropProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>('');
    const [dragging, setDragging] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const debouncedDrag = useDebounce(dragging, 100);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dragging) {
            setDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragging) {
            setDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const {files} = e.dataTransfer;
        if (files && files.length > 0) {
            setFileName(files[0].name);
            setFiles(files);
            e.dataTransfer.clearData();
        }
    };

    useEffect(() => {
        inputRef.current?.addEventListener('change', () => {
            if (inputRef.current?.files && inputRef.current?.files[0]) {
                setFileName(inputRef.current.files[0].name);
            }
        });
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(files!);
        setFileName('');
        setFiles(null);
    }

    return (
        <form onSubmit={handleSubmit} className="dropzone w-full"
              onDragOver={handleDrag}
              onDragEnter={handleDrag}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file"
                       className={`flex flex-col items-center justify-center w-full h-30 border-2 ${debouncedDrag ? "border-blue-500" : "border-gray-300"} border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        {
                            debouncedDrag ? <p className="text-gray-500 dark:text-gray-400">Drop the file here</p>
                                : <><p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                    className="font-semibold">Click to upload</span> or drag and drop</p>
                                    {
                                        fileName ?
                                            <p className="text-md text-gray-600 dark:text-gray-300">{fileName}</p>
                                            :
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Single file in any type</p>
                                    }</>
                        }
                    </div>
                    <input ref={inputRef} id="dropzone-file" type="file" className="hidden"/>
                </label>
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 w-full mt-2">Upload</button>
        </form>
    )
}
