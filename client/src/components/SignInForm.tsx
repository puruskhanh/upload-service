import React, {useState} from 'react';
import {toast} from "react-toastify";

interface SignInFormProps {
    setToken: (token: string | null) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({setToken}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Simulate API call for demonstration
            // Replace with actual fetch call to your server
            const response = await fetch((import.meta.env.VITE_SERVER_URL || "") + '/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password}),
            });
            if (!response.ok) {
                toast('Failed to sign in', {
                    type: 'error'
                });
                return;
            }
            const data = await response.json();
            localStorage.setItem('token', data.token); // Store token in local storage
            setToken(data.token);
        } catch (error) {
            // @ts-ignore
            toast('Failed to sign in: ' + error.message, {
                type: 'error'
            });
        }
    };

    return (
        <div className="max-w-md mx-auto">


            <div className="mt-4">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border p-2 w-full"
                            required
                        />
                    </div>
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
                    <button type="submit" className="bg-blue-500 text-white p-2 w-full">Sign In</button>
                </form>
            </div>
        </div>

    );
};

export default SignInForm;
