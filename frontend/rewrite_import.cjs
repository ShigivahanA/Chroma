const fs = require('fs');
const path = './src/pages/Import.jsx';

let content = fs.readFileSync(path, 'utf8');

const returnIndex = content.indexOf('  return (\n    <div className="w-full max-w-7xl mx-auto px-6');
if (returnIndex !== -1) {
  const top = content.slice(0, returnIndex);
  const newBottom = `  return (
    <div className="w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-art-white px-6 md:px-12 relative">
      <div className="w-full max-w-4xl space-y-8 z-10">
        
        {/* Minimal Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-8xl font-sans font-black tracking-tighter text-art-black uppercase leading-none select-none">
            ARCHIVE.
          </h1>
          <div className="flex justify-center gap-4 bg-art-black/5 p-1.5 rounded-full w-max mx-auto text-[10px] font-mono tracking-[0.2em] font-extrabold uppercase">
            <button
              onClick={() => { resetImporter(); setImportTarget('exhibit'); }}
              disabled={status === 'importing'}
              className={\`px-6 py-2 rounded-full transition-all \${
                importTarget === 'exhibit' ? 'bg-art-black text-art-white' : 'text-art-gray hover:text-art-black'
              }\`}
            >
              Exhibit
            </button>
            <button
              onClick={() => { resetImporter(); setImportTarget('templates'); }}
              disabled={status === 'importing'}
              className={\`px-6 py-2 rounded-full transition-all \${
                importTarget === 'templates' ? 'bg-art-black text-art-white' : 'text-art-gray hover:text-art-black'
              }\`}
            >
              Templates
            </button>
          </div>
        </div>

        {/* Central Action Area */}
        <div className="bg-white border-2 border-art-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 md:p-12 relative min-h-[300px] flex flex-col items-center justify-center transition-all duration-300">
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-6 left-6 right-6 bg-red-100 text-red-800 text-xs font-mono p-3 border-2 border-red-800 text-center uppercase tracking-widest font-black z-20"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {status === 'idle' || status === 'error' ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={\`w-full h-full flex flex-col items-center justify-center gap-6 cursor-pointer text-center transition-all \${
                isDragActive ? 'scale-105 opacity-50' : 'hover:scale-[1.02]'
              }\`}
            >
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
              <div className="text-8xl opacity-10 select-none">📥</div>
              <div>
                <h3 className="font-sans font-black text-2xl uppercase">Drop JSON File</h3>
                <p className="text-art-gray font-mono text-xs uppercase tracking-widest mt-2">Format: Array / Limit: 1000+</p>
              </div>
            </div>
          ) : status === 'validated' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="space-y-2">
                <h3 className="font-sans font-black text-3xl uppercase text-art-teal">File Validated</h3>
                <p className="font-mono text-sm text-art-gray uppercase tracking-widest">
                  Target: {importTarget} / Count: {fileData?.length}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetImporter}
                  className="px-8 py-4 border-2 border-art-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-art-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerUpload}
                  className="px-8 py-4 bg-art-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-art-teal hover:text-art-black transition-colors"
                >
                  Confirm Import
                </button>
              </div>
            </motion.div>
          ) : status === 'importing' ? (
            <div className="flex flex-col items-center justify-center gap-6">
              <span className="w-12 h-12 border-4 border-art-black border-t-art-teal rounded-full animate-spin" />
              <h3 className="font-sans font-black text-xl uppercase tracking-widest animate-pulse">Writing to Database...</h3>
            </div>
          ) : status === 'success' ? (
            <div className="flex flex-col items-center justify-center text-center space-y-8">
              <div className="space-y-2">
                <h3 className="font-sans font-black text-3xl uppercase text-art-teal">Import Complete</h3>
                <p className="font-mono text-sm text-art-gray uppercase tracking-widest">
                  Processed: {importResult?.processedCount} / Saved: {importResult?.importedCount}
                </p>
              </div>
              <Link
                to="/popular"
                className="px-8 py-4 bg-art-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-transparent hover:text-art-black border-2 border-art-black transition-all"
              >
                Go to Gallery
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Import;
`;
  fs.writeFileSync(path, top + newBottom);
  console.log('Successfully updated Import.jsx');
} else {
  console.log('Could not find the return statement');
}
