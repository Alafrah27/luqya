import { useEffect } from "react";
import { useAuthStore } from "../store/Store";
import { SocketIoStore } from "../store/socketioStore";

export default function SocketConnection() {
    // Defensive access to auth store
    const token = useAuthStore((state) => state?.token);
    const isSignIn = useAuthStore((state) => state?.isSignIn);

    // Defensive access to socket store functions
    const connect = SocketIoStore((s) => s?.connect);
    const disconnect = SocketIoStore((s) => s?.disconnect);

    useEffect(() => {
        try {
            if (isSignIn && token && typeof connect === 'function') {
                connect(token);
            } else if (typeof disconnect === 'function') {
                disconnect();
            }
        } catch (error) {
            // Silently handle socket connection errors
            console.warn("SocketConnection error:", error?.message);
        }
    }, [token, isSignIn, connect, disconnect]);

    return null;
}
