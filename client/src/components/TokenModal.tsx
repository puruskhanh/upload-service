import {useEffect, useRef, useState} from "react";
import {toast} from "react-toastify";

interface Token {
  id: number;
  token: string;
  createdAt: string;
  expiresAt: string;
  permissionLevel: number;
}

function permissionLevelToString(permissionLevel: number) {
  switch (permissionLevel) {
    case 1:
      return 'READ';
    case 2:
      return 'READ_WRITE';
    case 3:
      return 'READ_WRITE_DELETE';
    case 4:
      return 'ADMIN';
    default:
      return 'READ';
  }
}

export function TokenModal({token, onClose}: { token: string, onClose?: () => void }) {
  const dialogRef = useRef(null);
  const exprireRef = useRef<HTMLSelectElement>(null);
  const permissionRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    let timeoutId = setTimeout(() => {
      dialogRef.current.showModal();
    }, 10);
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const close = () => {
    dialogRef.current.close();
    if (onClose) {
      onClose();
    }
  }

  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  const getTokens = () => {
    fetch((import.meta.env.VITE_SERVER_URL || "") + '/api/token/all', {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setTokens(data);
        setLoading(false);
      })
      .catch(error => {
        toast(error.message);
        setLoading(false);
      });
  }
  useEffect(() => {
    getTokens();
  }, []);

  const deleteToken = (id: number) => {
    fetch((import.meta.env.VITE_SERVER_URL || "") + `/api/token/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          return;
        }
        getTokens();
      })
      .catch(error => {
        toast.error(error.message);
      });
  }

  const createToken = () => {
    const expiresIn = exprireRef.current?.value || '1h';
    const permissionLevel = permissionRef.current?.value || 1;
    fetch((import.meta.env.VITE_SERVER_URL || "") + '/api/token/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({expiresIn, permissionLevel})
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          toast.error(data.message);
          return;
        }
        getTokens();
      })
      .catch(error => {
        toast(error.message);
      });
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Token copied to clipboard');
  }

  return (
    <dialog ref={dialogRef}
            onClose={close}
            className="opacity-0 open:opacity-100 transition-opacity duration-300 bg-white rounded-2xl p-4
                            backdrop:bg-black/80 overflow-visible left-0 right-0 mx-auto flex flex-col justify-center items-center fixed border-none outline-none">

      {/*button close*/}
      <button onClick={close} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div className="flex items-center justify-center flex-col gap-2 w-full">
        <h2 className="text-2xl mb-4">API Tokens</h2>
        {
          loading &&
            <>
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"/>
                <p className="ml-2">{'Loading...'}</p>
            </>
        }
        {
          //   create token with a list of expired time options
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row w-full justify-between gap-2">
                <label htmlFor="expires" className="block text-gray-700 font-bold mb-2">Expires</label>
                <select className="border p-2 w-32" ref={exprireRef}>
                  <option value={"1h"}>1 Hour</option>
                  <option value={"1d"}>1 Day</option>
                  <option value={"1w"}>1 Week</option>
                  <option value={"1m"}>1 Month</option>
                  <option value={"1y"}>1 Year</option>
                  <option value={"never"}>Never</option>
                </select>
              </div>
              <div className="flex flex-row w-full justify-between gap-2">
                <label htmlFor="permission" className="block text-gray-700 font-bold mb-2">Permission</label>
                <select className="border p-2 w-32" ref={permissionRef}>
                  <option value={1}>Read</option>
                  <option value={2}>Read Write</option>
                  <option value={3}>Read Write Delete</option>
                  <option value={4}>Admin</option>
                </select>
              </div>
            </div>
            <button onClick={createToken} className="bg-blue-500 text-white p-2 w-full">Create</button>
          </div>
        }
        {
          tokens.length > 0 &&
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        Token
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Created At
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Expires At
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Permission Level
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Action
                    </th>
                </tr>
                </thead>
                <tbody>
                {tokens.map(token => (
                  <tr key={token.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 max-w-32 truncate">{token.token}</td>
                    <td className="px-6 py-4">{new Date(token.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">{token.expiresAt ? new Date(token.expiresAt).toLocaleString() : "Never"}</td>
                    <td className="px-6 py-4">{permissionLevelToString(token.permissionLevel)}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteToken(token.id)} className="bg-red-500 text-white p-2">Delete
                      </button>
                      <button onClick={() => copy(token.token)} className="bg-blue-500 text-white p-2 ml-2">Copy
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
            </table>
        }
      </div>
    </dialog>
  )
    ;
}
