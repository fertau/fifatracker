import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoCaptureProps {
    onPhotoSelected: (photoURL: string) => void;
    onCancel: () => void;
    currentPhoto?: string;
}

export function PhotoCapture({ onPhotoSelected, onCancel, currentPhoto }: PhotoCaptureProps) {
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'uploading' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Lock Body Scroll when Modal is Open
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onerror = () => reject(new Error('No se pudo cargar la imagen original.'));
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 400;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) throw new Error('Error de sistema visual (Canvas Context).');

                        ctx.drawImage(img, 0, 0, width, height);

                        canvas.toBlob(
                            (blob) => {
                                if (blob && blob.size > 0) resolve(blob);
                                else reject(new Error('Fallo en la optimización de imagen.'));
                            },
                            'image/jpeg',
                            0.7
                        );
                    } catch (e: any) {
                        reject(new Error('Error de procesamiento: ' + e.message));
                    }
                };
            };
            reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
        });
    };

    const handleFileSelect = async (file: File) => {
        if (!file || !file.type.startsWith('image/')) return;

        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);
        setStatus('processing');
        setProgress(10);
        setErrorMessage('');

        try {
            // Fake progression during compression
            const pulse = setInterval(() => setProgress(prev => prev < 40 ? prev + 5 : prev), 150);

            const compressedBlob = await compressImage(file);
            clearInterval(pulse);

            if (compressedBlob.size === 0) throw new Error('Imagen vacía detectada.');

            setProgress(50);
            setStatus('uploading');

            const timestamp = Date.now();
            const storageRef = ref(storage, `profile-photos/${timestamp}_photo.jpg`);

            // Add a small delay for iOS stability
            await new Promise(r => setTimeout(r, 500));

            const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Normalize progress from 50 to 100
                    const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
                    setProgress(50 + Math.round(pct));
                },
                (error) => {
                    console.error('❌ Upload failed:', error);
                    setErrorMessage('Fallo en la conexión con la nube. Reintenta.');
                    setStatus('error');
                    setProgress(0);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        onPhotoSelected(downloadURL);
                        setStatus('idle');
                        setProgress(100);
                    } catch (e) {
                        setErrorMessage('Error al obtener la URL final.');
                        setStatus('error');
                    }
                }
            );
        } catch (error: any) {
            console.error('❌ Processing error:', error);
            setErrorMessage(error.message || 'Error inesperado.');
            setStatus('error');
            setProgress(0);
        }
    };

    const isBusy = status === 'processing' || status === 'uploading';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 touch-none"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-surface border border-white/10 rounded-[3rem] p-8 max-w-sm w-full space-y-6 shadow-2xl overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                        {isBusy && (
                            <motion.div
                                className="h-full bg-primary shadow-[0_0_15px_#A5F3FC]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold font-heading italic tracking-tighter uppercase text-white leading-none">
                                {status === 'processing' ? 'Optimizando' : status === 'uploading' ? 'Cargando' : status === 'error' ? 'Error' : 'Perfil'}
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">
                                {status === 'error' ? 'Algo salió mal' : 'Sube tu mejor cara'}
                            </p>
                        </div>
                        {!isBusy && (
                            <button
                                onClick={onCancel}
                                className="p-2 rounded-2xl bg-white/5 text-gray-400 hover:text-white transition-colors border border-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-white/[0.02] border-2 border-white/5 flex items-center justify-center group shadow-inner">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className={cn(
                                    "w-full h-full object-cover transition-all duration-700",
                                    isBusy ? "scale-110 blur-xl opacity-30 grayscale" : status === 'error' ? 'grayscale opacity-50' : ''
                                )}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-white/5 group-hover:text-primary/20 transition-colors">
                                <Camera className="w-16 h-16" />
                            </div>
                        )}

                        {isBusy && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                    <Loader2 className="w-14 h-14 text-primary animate-spin relative z-10" />
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono text-white relative z-20">
                                        {progress}%
                                    </span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">
                                        {status === 'processing' ? 'Optimizando imagen' : 'Enviando a la nube'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-red-500/10">
                                <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
                                <p className="text-[10px] text-red-400 font-black uppercase tracking-widest text-center">{errorMessage}</p>
                                <Button
                                    className="h-10 rounded-xl bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30"
                                    onClick={() => setStatus('idle')}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" /> REINTENTAR
                                </Button>
                            </div>
                        )}
                    </div>

                    {!isBusy && status !== 'error' && (
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="ghost"
                                className="flex-col gap-3 h-auto py-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                                onClick={() => cameraInputRef.current?.click()}
                            >
                                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                                    <Camera className="w-6 h-6 text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">Cámara</span>
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex-col gap-3 h-auto py-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-accent/20 transition-colors">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-accent group-hover:scale-110 transition-all" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">Galería</span>
                            </Button>
                        </div>
                    )}

                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Utility for conditional classes
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
