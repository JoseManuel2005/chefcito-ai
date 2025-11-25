// src/components/VoiceRecorder/VoiceRecorder.tsx

'use client';

import { useVoiceRecorder } from './useVoiceRecorder';
import { Mic, MicOff } from 'lucide-react';
import { motion } from "framer-motion";
import { useState } from 'react';
import Tooltip from '../Tooltip';

interface VoiceRecorderProps {
  onTranscriptionReady: (text: string) => void;
}

export default function VoiceRecorder({ onTranscriptionReady }: VoiceRecorderProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { isRecording, error, startRecording, stopRecording } = useVoiceRecorder({
    onAudioReady: async (audioBlob) => {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        onTranscriptionReady(result.text);
      } catch (err) {
        console.error('Error al transcribir:', err);
        onTranscriptionReady('No se pudo transcribir el audio.');
      } finally {
        setIsTranscribing(false);
      }
    },
  });

  return (
    <Tooltip
      content={isRecording ? "Detener grabación" : "Ingresar Ingredientes por voz"}
      colorClass={isRecording ? "bg-red-500 text-white" : "bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-800"}
    >
      <motion.button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          p-2 rounded-full flex items-center justify-center cursor-pointer
          ${isRecording 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
          }
          ${error ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        disabled={!!error || isTranscribing}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isRecording ? "Detener grabación" : "Iniciar grabación por voz"}
      >
        {isTranscribing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </motion.button>
    </Tooltip>
  );
}