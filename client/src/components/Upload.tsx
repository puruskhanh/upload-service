import React, {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import {useNavigate} from "react-router-dom";
import DragAndDropFile from "./DragAndDropFile.tsx";

interface UploadProps {
    token: string;
    setToken: (token: string | null) => void;
}

const Upload: React.FC<UploadProps> = ({token, setToken}) => {
    const [uploads, setUploads] = useState<any[]>([]);

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_SERVER_URL + '/api/auth/user', {
                    headers: {'Authorization': `Bearer ${token}`}
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Fetch user error:', error);
                setToken(null);
                localStorage.removeItem('token');
                useNavigate()('/');
            }
        };

        fetchUserName();
    }, [token]);

    const loadUploads = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_SERVER_URL + '/api/uploads', {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!res.ok) {
                throw new Error('Failed to load uploads');
            }
            const data = await res.json();
            setUploads(data);
        } catch (error) {
            console.error('Load uploads error:', error);
            toast.error('Failed to load uploads');
        }
    };

    useEffect(() => {
        loadUploads();
    }, []);

    const handleCopyLink = (link: string) => {
        let url = window.location.href + link;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(import.meta.env.VITE_SERVER_URL + `/api/uploads/${id}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!res.ok) {
                throw new Error('Failed to delete upload');
            }
            toast.success('Upload deleted successfully');
            loadUploads();
        } catch (error) {
            console.error('Delete upload error:', error);
            toast.error('Failed to delete upload');
        }
    };

    function submitFile(files: FileList) {
        if (!files.length) {
            return;
        }
        const formData = new FormData();
        formData.append('file', files[0]);
        fetch(import.meta.env.VITE_SERVER_URL + '/api/upload', {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to upload file');
                }
                toast.success('File uploaded successfully');
                loadUploads();
            })
            .catch((error) => {
                console.error('Upload file error:', error);
                toast.error('Failed to upload file');
            });
    }

    return (
        <div>
            <h2 className="text-2xl mb-4 min-w-[50vw]">Upload File</h2>
            <DragAndDropFile onSubmit={submitFile} />

            <h2 className="text-2xl mb-4">Your Uploads</h2>
            <ul>
                {uploads.map((upload) => (
                    <li key={upload.id} className="mb-4 flex items-center">
                        <a href={import.meta.env.VITE_SERVER_URL + `/uploads/${upload.filePath}`} target={"_blank"}
                           className="flex-1">{upload.originalName}</a>
                        <button
                            className="bg-green-500 text-white p-2 mr-2"
                            onClick={() => handleCopyLink(`/uploads/${upload.filePath}`)}
                        >
                            Get Link
                        </button>
                        <button
                            className="bg-red-500 text-white p-2"
                            onClick={() => handleDelete(upload.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Upload;
