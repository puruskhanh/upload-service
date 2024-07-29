import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface TopBarProps {
    token: string;
    setToken: (token: string | null) => void;
    showTokenModal: () => void;
}

interface TokenPayload {
    userId: number;
    role: string;
    username: string;
    exp: number;
}

const TopBar: React.FC<TopBarProps> = ({ token, setToken, showTokenModal }) => {
    const decoded = jwtDecode<TokenPayload>(token);
    const { username, role } = decoded;
    const [isOnAdminPage, setIsOnAdminPage] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/');
    };


    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 flex h-14 w-full items-center bg-white px-4 shadow-sm md:px-6">
            <div className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className={"h-6 w-6 text-primary-foreground"}
                         viewBox="0 0 448 512">
                        <path
                            d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
                    </svg>
                    <span>{username}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleLogout} className="bg-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={"h-4 w-4 text-primary-foreground"}
                         viewBox="0 0 512 512">
                        <path
                          d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"/>
                    </svg>
                </button>

                <button onClick={showTokenModal} className="bg-none">
                    <span className="text-primary-foreground">Token</span>
                </button>
                {
                  (role === "admin") &&
                  <button
                    onClick={() => {
                        setIsOnAdminPage(!isOnAdminPage);
                        navigate(isOnAdminPage ? "/" : "/admin");
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                      {isOnAdminPage ? "Home" : "Admin page"}
                  </button>
                }
            </div>
        </header>
    );
};

export default TopBar;
