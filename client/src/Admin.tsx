import React, {useState, useEffect} from 'react';
import {jwtDecode} from "jwt-decode";
import {TokenPayload} from "./App.tsx";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

interface AdminProps {
    token: string;
}

const Admin: React.FC<AdminProps> = ({token}) => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const role = jwtDecode<TokenPayload>(token)?.role;
        if (role !== 'admin') {
            navigate('/')
        }

        const fetchUsers = async () => {
            const res = await fetch((import.meta.env.VITE_SERVER_URL || "") + '/api/auth/users', {
                headers: {'Authorization': `Bearer ${token}`}
            });
            const data = await res.json();
            console.log(data);
            setUsers(data);
        };

        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const username = prompt('Enter username');
        if (username) {
            const res = await fetch((import.meta.env.VITE_SERVER_URL || "") + '/api/auth/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({username})
            });
            const data = await res.json();
            console.log(data);
            // @ts-ignore
            setUsers([...users, data]);
        }
    };

    const handleDeleteUser = async (id: number, username: string) => {
        let response = await fetch((import.meta.env.VITE_SERVER_URL || "") + `/api/auth/users/${id}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        });
        const data = await response.json();
        if (response.status !== 200) {
            toast.error(data.message);
            return;
        }
        toast('Deleted '+username);
        // @ts-ignore
        setUsers(users.filter(user => user.id !== id));
    };

    const handleResetPassword = async (id: number, username: string) => {
        let response = await fetch((import.meta.env.VITE_SERVER_URL || "") + `/api/auth/reset-password/${id}`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`}
        });
        const data = await response.json();
        if (response.status !== 200) {
            toast.error(data.message);
            return;
        }
        toast('Password reset for '+username);
    };

    return (
        <div className="w-full h-full">
            <h2 className="text-2xl mb-4">Admin Panel</h2>
            <button onClick={handleAddUser} className="bg-green-500 text-white p-2 mb-4">Add User</button>


            <div className="relative overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            ID
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Username
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Action
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user: any) => (
                        <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <th scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.id}</th>
                            <td className="px-6 py-4">{user.username}</td>
                            <td className="px-6 py-4">
                                <button onClick={() => handleDeleteUser(user.id, user.username)}
                                        className="bg-red-500 text-white p-2">Delete
                                </button>
                                <button onClick={() => handleResetPassword(user.id, user.username)}
                                    className="bg-blue-500 text-white p-2 ml-2">Reset password</button>
                            </td>
                        </tr>
                    ))}

                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
