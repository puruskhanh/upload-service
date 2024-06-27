import React, {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import {useNavigate} from "react-router-dom";
import DragAndDropFile from "./DragAndDropFile.tsx";
import ModalEditUpload from "./ModalEditUpload.tsx";
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-scroller-dt';
import ModalLoading from "./ModalLoading.tsx";

// import 'datatables.net-responsive-dt';

interface UploadProps {
    token: string;
    setToken: (token: string | null) => void;
}

const Upload: React.FC<UploadProps> = ({token, setToken}) => {
    const [uploads, setUploads] = useState<any[]>([]);
    const [modals, setModals] = useState<any[]>([]);
    const [useCustomPath, setUseCustomPath] = useState<boolean>(false);
    const [isWebSite, setIsWebSite] = useState<boolean>(false);
    const [_, setTable] = useState<DataTable<any>>(null);
    const tableRef = React.createRef<HTMLTableElement>();
    const customPathRef = React.createRef<HTMLInputElement>();

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const response = await fetch((import.meta.env.VITE_SERVER_URL || "") + '/api/auth/user', {
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
            const res = await fetch((import.meta.env.VITE_SERVER_URL || "") + '/api/uploads', {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!res.ok) {
                throw new Error('Failed to load uploads');
            }
            const data = await res.json();
            setUploads(data);

            if (tableRef.current) {
                setTimeout(() => {
                    // @ts-ignore
                    setTable((prevState) => {
                        if (prevState) {
                            prevState.destroy();
                        }
                        return new DataTable("#uploads", {
                            scrollY: '30vh',
                            scrollCollapse: true,
                            scroller: true,
                            order: [[2, 'desc']]
                        });
                    });
                }, 1000);
            }

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
            const res = await fetch((import.meta.env.VITE_SERVER_URL || "") + `/api/uploads/${id}`, {
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

        setModals([<ModalLoading key="loading" message="Uploading file..."/>])

        const formData = new FormData();
        formData.append('file', files[0]);
        if (useCustomPath && customPathRef.current?.value?.trim()) {
            formData.append('customPath', customPathRef.current.value);
        }
        if (isWebSite) {
            formData.append('isWebSite', 'true');
        }
        fetch((import.meta.env.VITE_SERVER_URL || "") + '/api/upload', {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData
        })
            .then((res) => {
                if (useCustomPath) {
                    customPathRef.current.value = '';
                }
                if (!res.ok) {
                    throw new Error('Failed to upload file');
                }
                toast.success('File uploaded successfully');
                loadUploads();
                setModals([]);
            })
            .catch((error) => {
                console.error('Upload file error:', error);
                toast.error('Failed to upload file');
                setModals([]);
            });
    }

    return (
        <>
            <div className="w-full">

                <div className="mb-10 border-2 p-2 rounded-xl drop-shadow bg-white">
                    <h2 className="text-2xl mb-4 min-w-[50vw]">Upload File</h2>
                    <DragAndDropFile onSubmit={submitFile}/>

                    <div className="p-2 mt-2">
                        <label className="h-6 relative inline-block">
                            <input type="checkbox"
                                   checked={isWebSite}
                                   onChange={() => setIsWebSite(!isWebSite)}/>
                            <span>Is website (Accept zip file with has index.html in root)</span></label>
                    </div>
                    <div className="p-2 flex flex-row flex-grow justify-center items-center">

                        <label className="h-6 relative inline-block">
                            <input type="checkbox"
                                   checked={useCustomPath}
                                   onChange={() => setUseCustomPath(!useCustomPath)}/>
                            <span>Use custom path</span></label>
                        <input ref={customPathRef} type="text" className="border p-2 ml-2 flex-1 rounded-xl"
                               disabled={!useCustomPath}/>
                    </div>

                </div>

                <div className="w-full">
                    <h2 className="text-2xl mb-4">Your Uploads</h2>
                    <table id="uploads" className="table-auto w-full" ref={tableRef}>
                        <thead>
                        <tr>
                            <th className="border px-4 py-2">File Name</th>
                            <th className="border px-4 py-2">Custom Path</th>
                            <th className="border px-4 py-2">Upload date</th>
                            <th className="border px-4 py-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {uploads.map((upload) => (
                            <tr key={upload.id} className="">
                                <td className="border px-4 py-2">
                                    <a href={(import.meta.env.VITE_SERVER_URL || "") + `/uploads/${upload.filePath}`}
                                       target={"_blank"}>{upload.originalName}</a>
                                </td>
                                <td className="border px-4 py-2">
                                    {
                                        upload.customPath &&
                                      <a href={(import.meta.env.VITE_SERVER_URL || "") + `/uploads/${upload.customPath}`}
                                         target={"_blank"}>{upload.customPath}</a>
                                    }
                                </td>
                                <td className="border px-4 py-2">{new Date(upload.createdAt).toLocaleString()}</td>
                                <td className="border px-4 py-2 flex flex-row gap-1">
                                    <button
                                        className="bg-green-500 text-white p-2 mr-2"
                                        onClick={() => handleCopyLink(`/uploads/${upload.filePath}`)}
                                    >
                                        Get Link
                                    </button>
                                    <button
                                        className="bg-blue-500 text-white p-2 mr-2"
                                        onClick={() => {
                                            const modal = <ModalEditUpload
                                                key={upload.id}
                                                id={upload.id}
                                                isWebSite={upload.isWebSite}
                                                oldCustomPath={upload.customPath}
                                                name={upload.originalName}
                                                token={token}
                                                onClose={() => {
                                                    loadUploads();
                                                    setModals([]);
                                                }}
                                                onUpdated={loadUploads}
                                            />;
                                            setModals([modal]);
                                        }}>
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 text-white p-2"
                                        onClick={() => handleDelete(upload.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {
                modals
            }
        </>
    );
};

export default Upload;
