import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File) => {
        if (!file || !file.type.startsWith('image/')) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Firebase Storage
        setUploading(true);
        try {
            const timestamp = Date.now();
            const storageRef = ref(storage, `profile-photos/${timestamp}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            onPhotoSelected(downloadURL);
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error al subir la foto. Intenta de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-background border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            Foto de Perfil
                        </h3>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {preview && (
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/10">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="ghost"
                            className="flex-col gap-2 h-auto py-4"
                            onClick={() => cameraInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <Camera className="w-6 h-6" />
                            <span className="text-xs">Tomar Foto</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex-col gap-2 h-auto py-4"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <Upload className="w-6 h-6" />
                            <span className="text-xs">Galería</span>
                        </Button>
                    </div>

                    {uploading && (
                        <div className="text-center text-sm text-primary animate-pulse">
                            Subiendo foto...
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
