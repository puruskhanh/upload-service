import React, {useEffect, useRef, useState} from "react";
import DragAndDropFile from "./DragAndDropFile.tsx";
import {toast} from "react-toastify";

interface ModalEditUploadProps {
    id: number;
    name: string;
    onClose?: () => void;
    onUpdated?: () => void;
    token: string;
    oldCustomPath: string;
    isWebSite: boolean;
}

export default function ModalEditUpload({id, name, oldCustomPath, isWebSite, token, onClose, onUpdated}: ModalEditUploadProps) {
    const dialogRef = useRef(null);
    const [useCustomPath, setUseCustomPath] = useState<boolean>(false);
    const customPathRef = React.createRef<HTMLInputElement>();
    const close = () => {
        dialogRef.current.close();
        setTimeout(() => {
            onClose?.();
        }, 300);
    };

    const submitFile = (files: FileList) => {
        if (!files.length) {
            return;
        }
        const formData = new FormData();
        formData.append('file', files[0]);

        fetch((import.meta.env.VITE_SERVER_URL || "") + `/api/uploads/${id}`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to upload file');
                }
                toast.success('File updated successfully');
            })
            .catch((error) => {
                console.error('Upload file error:', error);
                toast.error('Failed to upload file');
            });
    };

    const updateCustomPath = () => {
        let body = {};
        if (useCustomPath && customPathRef.current?.value?.trim()) {
            body = {customPath: customPathRef.current.value};
        } else {
            body = {customPath: null};
        }
        fetch((import.meta.env.VITE_SERVER_URL || "") + `/api/update-custom-path/${id}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to update custom path');
                }
                toast.success('Custom path updated successfully');
                onUpdated?.();
                onClose?.();
            })
            .catch((error) => {
                console.error('Update custom path error:', error);
                toast.error('Failed to update custom path');
            });
    }

    useEffect(() => {
        let timeoutId = setTimeout(() => {
            dialogRef.current.showModal();
        }, 10);
        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (oldCustomPath) {
            setUseCustomPath(true);
            customPathRef.current.value = oldCustomPath;
        }
    }, [oldCustomPath]);

    return (
        <dialog ref={dialogRef}
                onClose={close}
                className="sm:w-[40rem] w-[90%] opacity-0 open:opacity-100 transition-opacity duration-300 bg-white rounded-2xl p-4
                            backdrop:bg-black/80 overflow-visible left-0 right-0 mx-auto flex flex-col justify-center items-center fixed">

            <div onClick={close} id={"close-modal"}
                 className="absolute top-2 right-3 outline-none bg-none w-5 h-5 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className={"w-5 h-5"}
                     viewBox="0 0 384 512">
                    <path
                        d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                </svg>
            </div>

            <h2 className="text-2xl mb-4 font-bold">Edit Upload</h2>
            <p className="text-lg mb-4">Current file: {name}</p>
            <p className="text-lg mb-4">Upload a new file to replace the current file</p>

            <DragAndDropFile onSubmit={submitFile}/>

            <div className="p-2 mt-2">
                <label className="h-6 relative inline-block">
                    <input type="checkbox"
                           checked={isWebSite} contentEditable={false} disabled />
                    <span>Is website</span></label>
            </div>

            <div className="p-2 flex flex-row flex-grow justify-center items-center w-full">

                <label className="h-6 relative inline-block">
                    <input type="checkbox"
                           checked={useCustomPath}
                           onChange={() => setUseCustomPath(!useCustomPath)}/>
                    <span>Use custom path</span></label>
                <input ref={customPathRef} type="text" className="border p-2 ml-2 flex-1 rounded-xl"
                       disabled={!useCustomPath}/>
                <button onClick={updateCustomPath} className="bg-blue-500 text-white p-2 ml-2 rounded-xl">Update</button>
            </div>
        </dialog>
    );
}
