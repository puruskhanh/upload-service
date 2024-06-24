import React, {useState, useEffect, useRef} from 'react';
import {toast} from 'react-toastify';

interface UploadProps {
    token: string;
    setToken: (token: string | null) => void;
}

const Upload: React.FC<UploadProps> = ({token, setToken}) => {
    const [uploads, setUploads] = useState<any[]>([]);
    const [userName, setUserName] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_SERVER_URL + '/api/auth/user', {
                    headers: {'Authorization': `Bearer ${token}`}
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const userData = await response.json();
                setUserName(userData.username);
            } catch (error) {
                console.error('Fetch user error:', error);
                toast.error('Failed to fetch user data');
                setToken(null);
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
        inputRef.current?.addEventListener('change', () => {
            if (inputRef.current?.files && inputRef.current?.files[0]) {
                setFileName(inputRef.current.files[0].name);
            }
        });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

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

    function submitFile(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData();
        const fileInput = inputRef.current as HTMLInputElement;
        if (fileInput.files && fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }
        fetch(import.meta.env.VITE_SERVER_URL + '/api/upload', {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to upload file');
                }
                setFileName('');
                inputRef.current!.value = '';
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
            <div className="flex justify-between items-center mb-4 w-[80vw]">
                <div className="text-xl font-semibold">{userName}</div>
                <button
                    className="bg-red-500 text-white p-2"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            <h2 className="text-2xl mb-4">Upload File</h2>
            <form onSubmit={submitFile} className="dropzone">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file"
                           className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                className="font-semibold">Click to upload</span> or drag and drop</p>
                            {
                                fileName ?
                                    <p className="text-md text-gray-600 dark:text-gray-300">{fileName}</p>
                                    :
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Single file in any type, if
                                        it is a zip file that contains the index.html file</p>
                            }
                        </div>
                        <input ref={inputRef} id="dropzone-file" type="file" className="hidden"/>
                    </label>
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 w-full mt-2">Upload</button>
            </form>

            <h2 className="text-2xl mb-4">Your Uploads</h2>
            <ul>
                {uploads.map((upload) => (
                    <li key={upload.id} className="mb-4 flex items-center">
                        <a href={import.meta.env.VITE_SERVER_URL + `/uploads/${upload.filePath}`} target={"_blank"} className="flex-1">{upload.originalName}</a>
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
