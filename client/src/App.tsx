import {useState, useEffect} from 'react';
import Upload from './components/Upload';
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SignInForm from "./components/SignInForm.tsx";
import {jwtDecode} from 'jwt-decode';
import ChangePassword from "./components/ChangePassword.tsx";
import {HashRouter, Route, Routes} from "react-router-dom";
import Admin from "./Admin.tsx";
import TopBar from "./components/TopBar.tsx";
import {TokenModal} from "./components/TokenModal.tsx";

export interface TokenPayload {
    userId: number;
    role: string;
    firstLogin: boolean;
    exp: number;
}

export default function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>();
    const [firstLogin, setFirstLogin] = useState<boolean>(false);
    const [modals, setModals] = useState<any>([]);

    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    useEffect(() => {
        if (token) {
            try {
                // @ts-ignore
                const decoded = jwtDecode<TokenPayload>(token);
                setRole(decoded.role);
                setFirstLogin(decoded.firstLogin)
            } catch (error) {
                console.error('Invalid token');
                setToken(null);
                localStorage.removeItem('token');
                toast.error('Invalid token');
            }
        }
    }, [token]);

    const showTokenModal = () => {
        setModals([<TokenModal key={Math.random()} token={token}/>]);
    }

    return (
        <div className="container mx-auto p-4 min-w-[90%]">
            <h1 className="text-3xl font-bold mb-4 w-full text-center">Upload Service</h1>
            <HashRouter>
                {token && <TopBar token={token} setToken={setToken} showTokenModal={showTokenModal}/>}
                <Routes>
                    <Route path={'/'} element={
                        <>
                            {
                                (!token) && <SignInForm setToken={setToken}/>
                            }

                            {
                                (token && firstLogin) && <ChangePassword setToken={setToken}/>
                            }
                            {
                                (token && !firstLogin && role === 'user') && <Upload token={token} setToken={setToken}/>
                            }

                            {
                                (token && !firstLogin && role === 'admin') &&
                                <Upload token={token} setToken={setToken}/>
                            }
                        </>
                    }>
                    </Route>

                    <Route path={'/admin'} element={<Admin token={token!}/>}/>
                </Routes>

            </HashRouter>
            {modals}
            <ToastContainer/>
        </div>
    );
}
