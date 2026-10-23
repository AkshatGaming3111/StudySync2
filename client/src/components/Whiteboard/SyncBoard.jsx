import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import LaTeXRenderer from '../Common/LaTeXRenderer';
import {
  Pen,
  Square,
  Circle,
  Minus,
  MoveRight,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Sparkles,
  Grid,
  Bot,
  Layers,
  CheckCircle2,
  Copy,
  ChevronRight
} from 'lucide-react';

export default function SyncBoard() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { currentUser, triggerXpGain } = useAuth();
  const { activeClass } = useClass();
  const { isDark } = useTheme();

  const [tool, setTool] = useState('pencil'); // pencil, line, rect, circle, arrow, eraser
  const [color, setColor] = useState('#14b8a6');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [gridMode, setGridMode] = useState('grid'); // none, grid, dots
  
  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const colors = [
    { label: 'Teal', value: '#14b8a6' },
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Dark/White', value: isDark ? '#ffffff' : '#111827' }
  ];

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      // Save current content before resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);

      canvas.width = rect.width;
      canvas.height = Math.max(550, window.innerHeight - 240);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(tempCanvas, 0, 0);
      drawGrid(ctx, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [gridMode, isDark]);

  const drawGrid = (ctx, width, height) => {
    if (gridMode === 'none') return;

    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;

    if (gridMode === 'grid') {
      const step = 30;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (gridMode === 'dots') {
      const step = 25;
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
      for (let x = step; x < width; x += step) {
        for (let y = step; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  };

  const saveStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(prev => [...prev, canvas.toDataURL()]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const lastState = history[history.length - 1];

    setRedoStack(prev => [canvas.toDataURL(), ...prev]);
    setHistory(prev => prev.slice(0, -1));

    const img = new Image();
    img.src = history.length > 1 ? history[history.length - 2] : '';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      drawGrid(ctx, canvas.width, canvas.height);
    };
    if (history.length === 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvas.width, canvas.height);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const nextState = redoStack[0];

    setHistory(prev => [...prev, canvas.toDataURL()]);
    setRedoStack(prev => prev.slice(1));

    const img = new Image();
    img.src = nextState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      drawGrid(ctx, canvas.width, canvas.height);
    };
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    saveStateToHistory();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(pos);
    saveStateToHistory();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.clearRect(pos.x - strokeWidth * 2, pos.y - strokeWidth * 2, strokeWidth * 4, strokeWidth * 4);
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'line' || tool === 'rect' || tool === 'circle' || tool === 'arrow') {
      const pos = getCanvasCoords(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();

      if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'arrow') {
        // Draw line with arrowhead
        const headlen = 12;
        const angle = Math.atan2(pos.y - startPos.y, pos.x - startPos.x);
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.lineTo(pos.x - headlen * Math.cos(angle - Math.PI / 6), pos.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x - headlen * Math.cos(angle + Math.PI / 6), pos.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }

    setIsDrawing(false);
  };

  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `StudySync_Whiteboard_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // AI Whiteboard Vision & Notes Synthesis
  const handleAIAnalyze = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setAnalyzing(true);
    try {
      // Compress and scale down canvas for ultra-fast network upload & vision processing
      const maxDim = 1200;
      let targetWidth = canvas.width || 800;
      let targetHeight = canvas.height || 600;
      if (targetWidth > maxDim || targetHeight > maxDim) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
          targetWidth = maxDim;
        } else {
          targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
          targetHeight = maxDim;
        }
      }
      const offscreen = document.createElement('canvas');
      offscreen.width = targetWidth;
      offscreen.height = targetHeight;
      const offCtx = offscreen.getContext('2d');
      // Fill crisp white background so drawn content has maximum contrast for OCR
      offCtx.fillStyle = '#FFFFFF';
      offCtx.fillRect(0, 0, targetWidth, targetHeight);
      offCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      const imageBase64 = offscreen.toDataURL('image/jpeg', 0.85);

      const res = await api.ai.analyzeWhiteboard({
        image: imageBase64,
        strokes: history.length,
        textContent: activeClass ? `${activeClass.title} - ${activeClass.subject}` : 'General Whiteboard Analysis',
        drawingSummary: 'Graph traversal and DP equations',
        userId: currentUser?.id,
        classId: activeClass?.id
      });

      if (res.success && res.analysis) {
        setAnalysisResult(res.analysis);
        triggerXpGain({
          xpGained: 20,
          reason: 'SyncBoard AI analysis'
        });
      }
    } catch (err) {
      console.error('Failed to analyze whiteboard:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
        
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface p-1 rounded-xl">
          {[
            { id: 'pencil', icon: Pen, label: 'Pen' },
            { id: 'line', icon: Minus, label: 'Line' },
            { id: 'arrow', icon: MoveRight, label: 'Arrow' },
            { id: 'rect', icon: Square, label: 'Rect' },
            { id: 'circle', icon: Circle, label: 'Circle' },
            { id: 'eraser', icon: Eraser, label: 'Eraser' },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = tool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-sm font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-dark-hover'
                }`}
                title={t.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Color Palette & Stroke Size */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c.value
                    ? 'scale-110 border-brand-500 ring-2 ring-brand-500/30'
                    : 'border-gray-300 dark:border-gray-700 opacity-80 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface px-2 py-1 rounded-xl text-xs">
            <span className="text-gray-400 text-[10px]">Size:</span>
            {[2, 4, 8, 14].map((size) => (
              <button
                key={size}
                onClick={() => setStrokeWidth(size)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  strokeWidth === size
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons (Undo, Redo, Grid, Clear, Export, AI Analyze) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-2 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setGridMode(prev => prev === 'grid' ? 'dots' : prev === 'dots' ? 'none' : 'grid')}
            className="p-2 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover"
            title={`Grid Mode: ${gridMode}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-xl border border-red-200 dark:border-red-900/30 text-rose-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Clear Board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportImage}
            className="p-2 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover"
            title="Export PNG"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* AI Whiteboard Vision Button */}
          <button
            onClick={handleAIAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'AI Analyzing...' : 'AI Analyze Board'}</span>
          </button>
        </div>

      </div>

      {/* Canvas Drawing Area */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-inner"
        style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block w-full touch-none"
        />

        {/* Ambient watermark */}
        <div className="absolute bottom-3 left-4 text-[11px] font-semibold text-gray-300 dark:text-gray-700 pointer-events-none select-none flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-500/40" />
          <span>StudySync SyncBoard • Interactive AI Canvas</span>
        </div>
      </div>

      {/* AI Whiteboard Synthesis Modal / Panel */}
      {analysisResult && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-500/10 via-indigo-500/5 to-dark-card border border-brand-500/30 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  {analysisResult.title}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500 text-white">
                    +20 XP
                  </span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Synthesized from active sketch & diagram context
                </p>
              </div>
            </div>

            <button
              onClick={() => setAnalysisResult(null)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-200"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Key concepts & notes */}
            <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border space-y-2">
              <h5 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Core Concepts Identified
              </h5>
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {analysisResult.keyConcepts?.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-500 font-bold">•</span>
                    <LaTeXRenderer content={c} />
                  </li>
                ))}
              </ul>
            </div>

            {/* LaTeX equations extracted */}
            <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border space-y-2">
              <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> LaTeX Equations & Models
              </h5>
              <div className="space-y-2">
                {analysisResult.latexEquations?.map((eq, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-center text-xs">
                    <LaTeXRenderer content={eq} />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Detailed summary markdown */}
          <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            <LaTeXRenderer content={analysisResult.summaryMarkdown} />
          </div>
        </div>
      )}

    </div>
  );
}
