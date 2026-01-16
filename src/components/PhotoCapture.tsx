import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
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
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onerror = () => reject(new Error('Failed to load image'));
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 400; // Profile photos don't need to be huge
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
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Canvas conversion failed'));
                        },
                        'image/jpeg',
                        0.8 // 80% quality is perfect for profile photos
                    );
                };
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
        });
    };

    const handleFileSelect = async (file: File) => {
        if (!file || !file.type.startsWith('image/')) return;

        // Show instant local preview
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);

        setUploading(true);
        setProgress(0);

        try {
            console.log('🔵 Starting optimized upload for:', file.name);

            // 1. Compress Image
            const compressedBlob = await compressImage(file);
            console.log('✅ Image compressed from', (file.size / 1024).toFixed(1), 'KB to', (compressedBlob.size / 1024).toFixed(1), 'KB');

            // 2. Upload to Firebase Storage with progress Tracking
            const timestamp = Date.now();
            const storageRef = ref(storage, `profile-photos/${timestamp}_photo.jpg`);

            const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(Math.round(pct));
                },
                (error) => {
                    console.error('❌ Upload failed:', error);
                    alert('Error al subir la foto.');
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('✅ Upload complete. URL:', downloadURL);
                    onPhotoSelected(downloadURL);
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error('❌ Processing error:', error);
            alert('Error al procesar la imagen.');
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-surface border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full space-y-6 shadow-2xl overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                        {uploading && (
                            <motion.div
                                className="h-full bg-primary shadow-[0_0_10px_#A5F3FC]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold font-heading italic tracking-tighter uppercase text-white">
                                {uploading ? 'Subiendo...' : 'Cambiar Foto'}
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Asegúrate de que se vea tu cara</p>
                        </div>
                        {!uploading && (
                            <button
                                onClick={onCancel}
                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white/[0.02] border-2 border-white/5 flex items-center justify-center group">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className={`w-full h-full object-cover transition-all duration-500 ${uploading ? 'blur-sm scale-110 opacity-50' : ''}`}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-600">
                                <Camera className="w-12 h-12 opacity-20" />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Sin foto</span>
                            </div>
                        )}

                        {uploading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <div className="relative">
                                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono">
                                        {progress}%
                                    </span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Optimizando...</span>
                            </div>
                        )}
                    </div>

                    {!uploading && (
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="ghost"
                                className="flex-col gap-3 h-auto py-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/50 transition-all hover:bg-primary/5 group"
                                onClick={() => cameraInputRef.current?.click()}
                            >
                                <Camera className="w-6 h-6 text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Cámara</span>
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex-col gap-3 h-auto py-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-accent/50 transition-all hover:bg-accent/5 group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-accent group-hover:scale-110 transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Galería</span>
                            </Button>
                        </div>
                    )}

                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
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
