import { useEffect } from "react";
import { useAuthStore } from "../store/Store";
import { SocketIoStore } from "../store/socketioStore";

export default function SocketConnection() {
    const { token, isSignIn } = useAuthStore();
    const connect = SocketIoStore((s) => s.connect);
    const disconnect = SocketIoStore((s) => s.disconnect);

    useEffect(() => {
        if (isSignIn && token) {
            connect(token);
        } else {
            disconnect();
        }
    }, [token, isSignIn]);

    return null;
}

