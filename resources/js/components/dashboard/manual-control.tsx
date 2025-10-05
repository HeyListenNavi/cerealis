import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Circle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const SERVER_IP = '127.0.0.1'; 
const CONTROL_URL = `ws://${SERVER_IP}:8000/ws/control`;

const statusConfig = {
    'Connected': {
        textClass: 'text-green-500',
        bgClass: 'bg-green-500',
        pulse: false,
    },
    'Connecting...': { 
        textClass: 'text-yellow-500',
        bgClass: 'bg-yellow-500',
        pulse: true,
    },
    'Disconnected': {
        textClass: 'text-red-500',
        bgClass: 'bg-red-500',
        pulse: false,
    },
    'Error': {
        textClass: 'text-red-700',
        bgClass: 'bg-red-700',
        pulse: false,
    },
};

const defaultStatusConfig = {
    textClass: 'text-gray-500',
    bgClass: 'bg-gray-500',
    pulse: false,
};


export default function ManualControl() {
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const socketRef = useRef(null);

    useEffect(() => {
        console.log(`Attempting to connect to ${CONTROL_URL}`);
        const ws = new WebSocket(CONTROL_URL);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connection established');
            setConnectionStatus('Connected');
        };

        ws.onmessage = (event) => {
            console.log('Received message:', event.data);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            setConnectionStatus('Disconnected');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('Error');
        };

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    const sendCommand = (command) => {
        if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {
            console.log(`Sending command: ${command}`);
            socketRef.current.send(command);
        } else {
            console.warn('Cannot send command, WebSocket is not open.');
        }
    };

    const handleStart = (command) => sendCommand(command);
    const handleEnd = () => sendCommand('stop');
    
    const currentStatus = statusConfig[connectionStatus] || defaultStatusConfig;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <p
                    className={`flex items-center text-lg font-semibold ${currentStatus.textClass}`}
                >
                    <span
                        className={`mr-3 size-3 rounded-full animate-pulse ${currentStatus.bgClass} ${currentStatus.pulse ? 'animate-pulse' : ''}`}
                    ></span>
                    {connectionStatus}
                </p>
            </div>

            <div className="relative flex size-48 items-center justify-center rounded-full bg-black shadow-xl md:size-64">
                <div className="absolute inset-0 rounded-full bg-zinc-700/50"></div>

                <button
                    onMouseDown={() => handleStart('up')}
                    onMouseUp={handleEnd}
                    onTouchStart={() => handleStart('up')}
                    onTouchEnd={handleEnd}
                    className="text-zinc absolute flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-inner transition-transform duration-150 ease-in-out hover:bg-zinc-200 focus:ring-4 focus:ring-white/50 focus:outline-none active:scale-90 md:h-20 md:w-20"
                >
                    <Circle className="h-6 w-6 fill-current text-zinc-800 md:h-8 md:w-8" />
                </button>

                <button
                    onMouseDown={() => handleStart('forward')}
                    onMouseUp={handleEnd}
                    onTouchStart={() => handleStart('forward')}
                    onTouchEnd={handleEnd}
                    className="absolute top-2 flex size-12 items-center justify-center rounded-full text-white transition-colors duration-150 ease-in-out hover:bg-zinc-700 focus:ring-4 focus:ring-white/50 focus:outline-none active:bg-zinc-600 md:size-16"
                >
                    <ChevronUp className="size-7 md:size-9" />
                </button>

                <button
                    onMouseDown={() => handleStart('backward')}
                    onMouseUp={handleEnd}
                    onTouchStart={() => handleStart('backward')}
                    onTouchEnd={handleEnd}
                    className="absolute bottom-2 flex size-12 items-center justify-center rounded-full text-white transition-colors duration-150 ease-in-out hover:bg-zinc-700 focus:ring-4 focus:ring-white/50 focus:outline-none active:bg-zinc-600 md:size-16"
                >
                    <ChevronDown className="size-7 md:size-9" />
                </button>

                <button
                    onMouseDown={() => handleStart('left')}
                    onMouseUp={handleEnd}
                    onTouchStart={() => handleStart('left')}
                    onTouchEnd={handleEnd}
                    className="absolute left-2 flex size-12 items-center justify-center rounded-full text-white transition-colors duration-150 ease-in-out hover:bg-zinc-700 focus:ring-4 focus:ring-white/50 focus:outline-none active:bg-zinc-600 md:size-16"
                >
                    <ChevronLeft className="size-7 md:size-9" />
                </button>

                <button
                    onMouseDown={() => handleStart('right')}
                    onMouseUp={handleEnd}
                    onTouchStart={() => handleStart('right')}
                    onTouchEnd={handleEnd}
                    className="absolute right-2 flex size-12 items-center justify-center rounded-full text-white transition-colors duration-150 ease-in-out hover:bg-zinc-700 focus:ring-4 focus:ring-white/50 focus:outline-none active:bg-zinc-600 md:size-16"
                >
                    <ChevronRight className="size-7 md:size-9" />
                </button>
            </div>
        </div>
    );
}
