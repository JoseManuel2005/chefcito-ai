// hooks/useRecipeVideo.ts
import { useState, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpegInstance: FFmpeg | null = null;

const loadFFmpeg = async () => {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
    await ffmpegInstance.load();
  }
  return ffmpegInstance;
};

export const useRecipeVideo = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const generateVideo = useCallback(async (
    stepImages: string[],
    ttsAudioUrl: string,
    recipeName: string,
    audioDuration: number // 👈 Parámetro añadido
  ) => {
    if (isGenerating || stepImages.length === 0) return;

    setIsGenerating(true);
    setVideoUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      
      // Limpiar archivos previos
      const base64ToUint8Array = (b64: string) => {
        const clean = b64.startsWith('data:') ? b64.split(',')[1] : b64;
        const binary = atob(clean);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let j = 0; j < len; j++) {
          bytes[j] = binary.charCodeAt(j);
        }
        return bytes;
      };

      for (let i = 0; i < stepImages.length; i++) {
        const bytes = base64ToUint8Array(stepImages[i]);
        await ffmpeg.writeFile(`step-${i}.png`, bytes);
      }

      // Descargar y guardar audio
      const audioRes = await fetch(ttsAudioUrl);
      const audioArrayBuf = await audioRes.arrayBuffer();
      await ffmpeg.writeFile('audio.mp3', new Uint8Array(audioArrayBuf));

      // 👇 Usar la duración estimada del audio (no 15 segundos)
      const durationPerImage = Math.max(3, audioDuration / stepImages.length);

      // Generar video
      await ffmpeg.exec([
        '-y',
        '-framerate', `${1 / durationPerImage}`,
        '-i', 'step-%d.png',
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-pix_fmt', 'yuv420p',
        '-shortest', // Se detiene cuando el audio termina
        'output.mp4'
      ]);

      // Obtener el video
      const data = await ffmpeg.readFile('output.mp4');
      const videoBytes = new Uint8Array(data as any);
      const videoBlob = new Blob([videoBytes.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);

    } catch (error) {
      console.error('Error al generar video:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  return {
    isGenerating,
    videoUrl,
    generateVideo,
  };
};