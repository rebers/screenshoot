'use client';

import { useRef, useState, useEffect } from 'react';
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">BeautifyBG</h1>
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
          BeautifyBG - All processing happens in your browser. No data is sent to any server.
        </div>
      </footer>
    </div>
  );
}
