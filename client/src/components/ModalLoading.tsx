import {useEffect, useRef} from "react";

interface ModalLoadingProps {
    message?: string;
}

export default function ModalLoading({message}: ModalLoadingProps) {
    const dialogRef = useRef(null);

    useEffect(() => {
        let timeoutId = setTimeout(() => {
            dialogRef.current.showModal();
        }, 10);
        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <dialog ref={dialogRef}
                onClose={close}
                className="sm:w-[20rem] w-[90%] h-72 opacity-0 open:opacity-100 transition-opacity duration-300 bg-white rounded-2xl p-4
                            backdrop:bg-black/80 overflow-visible left-0 right-0 mx-auto flex flex-col justify-center items-center fixed border-none outline-none">

            <div className="flex items-center justify-center flex-col gap-2 te">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"/>
                <p className="ml-2">{message || 'Loading...'}</p>
            </div>
        </dialog>
    );
}
