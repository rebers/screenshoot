'use client';

import { useRef } from 'react';
import Canvas from '../components/Canvas';
import ControlPanel from '../components/ControlPanel';
import { useScreenshot } from '../hooks/useScreenshot';

export default function Home() {
  const {
    screenshotSrc,
    settings,
    handleImageUpload,
    updateSettings,
    exportImage,
    copyToClipboard,
    aspectRatioOptions,
    backgroundPresets,
  } = useScreenshot();

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExportImage = () => {
    if (canvasRef.current) {
      exportImage({ current: canvasRef.current });
    }
  };

  const handleCopyToClipboard = () => {
    if (canvasRef.current) {
      copyToClipboard({ current: canvasRef.current });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-7 h-7 mr-2 text-gray-800 dark:text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
              <circle cx="50" cy="50" r="45" fill="none"/>
              <path d="M50 5 C 50 95 50 95 50 95" />
              <path d="M5 50 C 95 50 95 50 95 50" />
              <path d="M19 19 C 81 81 81 81 81 81" />
              <path d="M81 19 C 19 81 19 81 19 81" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Screenshoot</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Screenshot Beautifier</p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Canvas Area (Left Side) */}
            <div className="lg:col-span-2" 
                style={{ height: 'calc(100vh - 180px)' }}>
              <div className="w-full h-full" ref={canvasRef}>
                <Canvas
                  settings={settings}
                  backgroundPresets={backgroundPresets}
                  screenshotSrc={screenshotSrc}
                  onImageUpload={handleImageUpload}
                />
              </div>
            </div>
            
            {/* Control Panel (Right Side) */}
            <div className="lg:col-span-1" style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              <ControlPanel
                settings={settings}
                aspectRatioOptions={aspectRatioOptions}
                backgroundPresets={backgroundPresets}
                onSettingsChange={updateSettings}
                onExportImage={handleExportImage}
                onCopyToClipboard={handleCopyToClipboard}
                canExport={!!screenshotSrc}
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-3 px-6 bg-white dark:bg-gray-900 shadow-inner-top">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          Screenshoot - All processing happens in your browser. No data is sent to any server.
        </div>
      </footer>
    </div>
  );
}
