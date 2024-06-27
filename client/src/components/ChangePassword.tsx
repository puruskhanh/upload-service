import React, {useState} from 'react';
import {toast} from "react-toastify";

interface ChangePasswordProps {
    setToken: (token: string | null) => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({setToken}) => {
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== repeatPassword) {
            toast.error('Passwords do not match');
            return;
        }
        const res = await fetch((import.meta.env.VITE_SERVER_URL || "") + '/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({password})
        });
        const data = await res.json();
        if (data.message === 'successfully') {
            toast('Password changed successfully. Please log in again.');
            localStorage.removeItem('token');
            setToken(null);
        } else {
            alert(data.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-4">
            <h2 className="text-md text-amber-600">You must change your password before continuing</h2>
            <form onSubmit={handleChangePassword}>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="repeatPassword" className="block text-gray-700 font-bold mb-2">Repeat
                        Password</label>
                    <input
                        type="password"
                        id="repeatPassword"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="border p-2 w-full"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 w-full">Change password</button>
            </form>
        </div>

    );
};

export default ChangePassword;
