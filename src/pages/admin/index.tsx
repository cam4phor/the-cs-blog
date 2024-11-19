import { useState, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Editor component, disabling server-side rendering
const Editor = dynamic(() => import('../../components/Editor'), { ssr: false });

const AdminPage: React.FC = () => {
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [passwordInput, setPasswordInput] = useState<string>('');

    const handleLogin = (): void => {
        if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            setAuthenticated(true);
        } else {
            alert('Incorrect password');
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setPasswordInput(e.target.value);
    };

    if (!authenticated) {
        return (
            <div>
                <h1>Admin Login</h1>
                <input
                    type="password"
                    value={passwordInput}
                    onChange={handleInputChange}
                />
                <button onClick={handleLogin}>Login</button>
            </div>
        );
    }

    return <Editor />;
};

export default AdminPage;
