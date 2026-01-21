import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, QrCode } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface QRManagerProps {
    playerId: string;
    onScan: (scannedId: string) => void;
    onClose: () => void;
}

export function QRManager({ playerId, onScan, onClose }: QRManagerProps) {
    const [mode, setMode] = useState<'show' | 'scan'>('show');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                    <h3 className="font-heading font-bold italic uppercase tracking-tighter text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        FIFA Tracker QR
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={mode === 'show' ? 'primary' : 'ghost'}
                        className="flex-1 rounded-2xl"
                        onClick={() => setMode('show')}
                    >
                        <QrCode className="w-4 h-4 mr-2" /> MI CÓDIGO
                    </Button>
                    <Button
                        variant={mode === 'scan' ? 'primary' : 'ghost'}
                        className="flex-1 rounded-2xl"
                        onClick={() => setMode('scan')}
                    >
                        <Camera className="w-4 h-4 mr-2" /> ESCANEAR
                    </Button>
                </div>

                <Card glass className="p-8 aspect-square flex flex-col items-center justify-center border-primary/20 relative overflow-hidden">
                    {mode === 'show' ? (
                        <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center gap-6">
                            <div className="p-4 bg-white rounded-3xl shadow-[0_0_30px_rgba(var(--color-primary),0.2)]">
                                <QRCodeSVG
                                    value={playerId}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/favicon.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 30,
                                        width: 30,
                                        excavate: true,
                                    }}
                                />
                            </div>
                            <p className="text-center text-[10px] uppercase font-black tracking-widest text-gray-400">
                                Muestra este código para que <br /> te agreguen como amigo.
                            </p>
                        </div>
                    ) : (
                        <QRScanner onResult={(result) => onScan(result)} />
                    )}
                </Card>
            </div>
        </div>
    );
}

function QRScanner({ onResult }: { onResult: (val: string) => void }) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                onResult(decodedText);
                scanner.clear();
            },
            () => {
                // Ignore errors
            }
        );

        return () => {
            scanner.clear().catch(e => console.error("Error clearing scanner", e));
        };
    }, [onResult]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40" />
            <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-gray-500">Apunta a un código QR</p>
        </div>
    );
}
