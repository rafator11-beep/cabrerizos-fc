import { useState, useRef } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PhotoUploadModal({ isOpen, onClose, rosterId, currentPhotoUrl, onPhotoUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('❌ Por favor selecciona una imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Tamaño objetivo: 400x400
          const size = 400;
          canvas.width = size;
          canvas.height = size;

          // Calcular recorte para hacer cuadrado
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          // Dibujar imagen recortada y redimensionada
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          // Convertir a blob con compresión
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            'image/jpeg',
            0.85 // Calidad 85%
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadPhoto = async () => {
    if (!preview) return;

    setUploading(true);
    try {
      // Obtener el archivo del input
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        alert('❌ No se pudo obtener el archivo');
        setUploading(false);
        return;
      }

      // Comprimir imagen
      const compressedBlob = await compressImage(file);

      // Generar nombre único
      const fileExt = 'jpg';
      const fileName = `${rosterId}-${Date.now()}.${fileExt}`;
      const filePath = `player-photos/${fileName}`;

      // Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        alert('❌ Error al subir la foto: ' + uploadError.message);
        setUploading(false);
        return;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('player-photos')
        .getPublicUrl(filePath);

      const photoUrl = urlData.publicUrl;

      // Actualizar roster con nueva URL
      const { error: updateError } = await supabase
        .from('roster')
        .update({ photo_url: photoUrl })
        .eq('id', rosterId);

      if (updateError) {
        console.error('Error updating roster:', updateError);
        alert('❌ Error al actualizar el perfil');
        setUploading(false);
        return;
      }

      // Eliminar foto anterior si existe
      if (currentPhotoUrl && currentPhotoUrl.includes('player-photos/')) {
        const oldPath = currentPhotoUrl.split('player-photos/')[1]?.split('?')[0];
        if (oldPath) {
          await supabase.storage
            .from('player-photos')
            .remove([`player-photos/${oldPath}`]);
        }
      }

      alert('✅ Foto actualizada correctamente');
      onPhotoUpdated(photoUrl);
      onClose();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('❌ Error al subir la foto');
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-black text-white">Subir Foto de Perfil</h3>
            <p className="text-xs text-muted">La imagen se recortará automáticamente</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Preview */}
          {preview ? (
            <div className="mb-4">
              <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-accent/20">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-xs text-muted mt-3">
                Vista previa - La imagen se recortará en cuadrado
              </p>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-48 h-48 mx-auto rounded-full border-4 border-dashed border-white/10 hover:border-accent/40 flex flex-col items-center justify-center cursor-pointer transition-all mb-4"
            >
              <Camera size={40} className="text-muted mb-2" />
              <p className="text-sm font-bold text-white">Seleccionar foto</p>
              <p className="text-xs text-muted mt-1">JPG, PNG (máx. 5MB)</p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Actions */}
          <div className="flex gap-2">
            {preview && (
              <button
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all"
              >
                Cambiar foto
              </button>
            )}
            <button
              onClick={preview ? uploadPhoto : () => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-accent hover:bg-accent/90 rounded-xl text-sm font-bold text-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  Subiendo...
                </>
              ) : preview ? (
                <>
                  <Upload size={16} />
                  Guardar foto
                </>
              ) : (
                <>
                  <Camera size={16} />
                  Seleccionar
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-muted text-center mt-4">
            💡 Consejo: Usa una foto con buena iluminación y enfocada en tu rostro
          </p>
        </div>
      </div>
    </div>
  );
}
