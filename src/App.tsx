import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, DragEvent, PointerEvent as ReactPointerEvent } from 'react'
import {
  AudioLines, Captions, Check, ChevronDown, CirclePlay, Crop, Download,
  Film, FolderOpen, Gauge, Globe2, Menu, Mic2, MousePointer2,
  Music2, Pause, Play, Plus, Redo2, RotateCcw, Scissors, Settings2, Square,
  SlidersHorizontal, Sparkles, Sticker, TextCursorInput,
  Trash2, Undo2, Upload, Volume2, WandSparkles, X, ZoomIn, ZoomOut,
} from 'lucide-react'
import './App.css'
import './icon.css'
import { languageOptions, translate } from './i18n'
import type { LanguageCode } from './i18n'

type Tool = 'media' | 'audio' | 'text' | 'stickers' | 'effects' | 'captions'
type TrackType = 'video' | 'text' | 'sticker' | 'caption' | 'audio'
type AnimationPreset = 'none' | 'fade-in' | 'fade-out' | 'zoom-in' | 'slide-up' | 'slide-left' | 'typewriter'
type AnimationSettings = { animation: AnimationPreset; animationDuration: number }
type TextEffectPreset = 'none' | 'outline' | 'shadow' | 'glow' | 'neon' | 'background'
type TextEffectSettings = { textEffect: TextEffectPreset; strokeColor: string; strokeWidth: number; effectColor: string; backgroundColor: string; backgroundOpacity: number; letterSpacing: number }
type TransitionPreset = 'none' | 'crossfade' | 'fade-black' | 'slide-left' | 'slide-up' | 'zoom'
type TransitionSettings = { transition: TransitionPreset; transitionDuration: number }
type TimelineTrack = { id: string; type: TrackType; label: string }
type Clip = { id: number; trackId: string; label: string; start: number; duration: number; offset: number; sourceDuration: number; sourceUrl: string; color: string } & AnimationSettings & TransitionSettings
type VideoAsset = { id: number; name: string; url: string; duration: number }
type AudioClip = { id: number; trackId: string; label: string; start: number; duration: number; offset: number; sourceDuration: number; sourceUrl: string }
type TextClip = { id: number; trackId: string; text: string; start: number; duration: number; x: number; y: number; fontSize: number; fontFamily: string; color: string; opacity: number; bold: boolean } & AnimationSettings & TextEffectSettings
type StickerClip = { id: number; trackId: string; name: string; src: string; start: number; duration: number; x: number; y: number; size: number; rotation: number; opacity: number } & AnimationSettings
type CaptionClip = { id: number; trackId: string; text: string; start: number; duration: number }

const initialTracks: TimelineTrack[] = [
  { id: 'video-1', type: 'video', label: 'Video' },
  { id: 'audio-1', type: 'audio', label: 'Audio' },
]

const initialClips: Clip[] = [
  { id: 1, trackId: 'video-1', label: 'Intro', start: 0, duration: 4.6, offset: 0, sourceDuration: 15, sourceUrl: '', color: '#78dce8', animation: 'none', animationDuration: 1, transition: 'none', transitionDuration: .8 },
  { id: 2, trackId: 'video-1', label: 'Main shot', start: 4.6, duration: 6.2, offset: 4.6, sourceDuration: 15, sourceUrl: '', color: '#a78bfa', animation: 'none', animationDuration: 1, transition: 'none', transitionDuration: .8 },
  { id: 3, trackId: 'video-1', label: 'Outro', start: 10.8, duration: 4.2, offset: 10.8, sourceDuration: 15, sourceUrl: '', color: '#fb7185', animation: 'none', animationDuration: 1, transition: 'none', transitionDuration: .8 },
]
const initialAudioClips: AudioClip[] = []
const initialTextClips: TextClip[] = []
const initialStickerClips: StickerClip[] = []
const initialCaptionClips: CaptionClip[] = []

type StickerAsset = { name: string; keywords: string; src: string; kind: 'sticker' | 'gif' }
const stickerAssets: StickerAsset[] = [
  { name: 'Heart eyes', keywords: 'รัก หัวใจ love', src: './stickers/1F60D.svg', kind: 'sticker' },
  { name: 'Tears of joy', keywords: 'ตลก หัวเราะ laugh', src: './stickers/1F602.svg', kind: 'sticker' },
  { name: 'Heart', keywords: 'รัก red heart', src: './stickers/2764.svg', kind: 'sticker' },
  { name: 'Fire', keywords: 'ฮิต ร้อน fire', src: './stickers/1F525.svg', kind: 'sticker' },
  { name: 'Sparkles', keywords: 'วิ้ง sparkle shine', src: './stickers/2728.svg', kind: 'sticker' },
  { name: 'Party', keywords: 'ฉลอง party celebrate', src: './stickers/1F389.svg', kind: 'sticker' },
  { name: 'Thumbs up', keywords: 'ถูกใจ like thumb', src: './stickers/1F44D.svg', kind: 'sticker' },
  { name: 'Rocket', keywords: 'เร็ว launch rocket', src: './stickers/1F680.svg', kind: 'sticker' },
  { name: 'Star', keywords: 'ดาว star', src: './stickers/1F31F.svg', kind: 'sticker' },
  { name: 'Cool', keywords: 'แว่น cool sunglasses', src: './stickers/1F60E.svg', kind: 'sticker' },
  { name: 'Hundred', keywords: 'ร้อย perfect 100', src: './stickers/1F4AF.svg', kind: 'sticker' },
  { name: 'Movie camera', keywords: 'วิดีโอ film movie', src: './stickers/1F3A5.svg', kind: 'sticker' },
  { name: 'LOL', keywords: 'ตลก หัวเราะ funny laugh meme', src: './stickers/meme-lol.gif', kind: 'gif' },
  { name: 'WOW', keywords: 'ว้าว ตื่นเต้น surprised amazing meme', src: './stickers/meme-wow.gif', kind: 'gif' },
  { name: 'BRUH', keywords: 'อึ้ง ไม่อยากเชื่อ reaction meme', src: './stickers/meme-bruh.gif', kind: 'gif' },
  { name: 'NOPE', keywords: 'ไม่ ปฏิเสธ no reject meme', src: './stickers/meme-nope.gif', kind: 'gif' },
  { name: 'NICE', keywords: 'ดี เยี่ยม cool good meme', src: './stickers/meme-nice.gif', kind: 'gif' },
  { name: 'SUS', keywords: 'น่าสงสัย suspicious among meme', src: './stickers/meme-sus.gif', kind: 'gif' },
  { name: "LET'S GO!", keywords: 'ไป ลุย เย้ excited hype meme', src: './stickers/meme-lets-go.gif', kind: 'gif' },
  { name: 'MOOD', keywords: 'อารมณ์ ความรู้สึก vibe reaction meme', src: './stickers/meme-mood.gif', kind: 'gif' },
]

const fontOptions = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Segoe UI', value: '"Segoe UI", sans-serif' },
  { label: 'Noto Sans', value: '"Noto Sans", sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
] as const

const animationOptions = [
  { value: 'none', labelKey: 'animationNone' },
  { value: 'fade-in', labelKey: 'fadeIn' },
  { value: 'fade-out', labelKey: 'fadeOut' },
  { value: 'zoom-in', labelKey: 'zoomInAnimation' },
  { value: 'slide-up', labelKey: 'slideUp' },
  { value: 'slide-left', labelKey: 'slideLeft' },
] as const

const textAnimationOptions = [...animationOptions, { value: 'typewriter', labelKey: 'typewriter' }] as const

const textEffectOptions = [
  { value: 'none', labelKey: 'effectNone' },
  { value: 'outline', labelKey: 'effectOutline' },
  { value: 'shadow', labelKey: 'effectShadow' },
  { value: 'glow', labelKey: 'effectGlow' },
  { value: 'neon', labelKey: 'effectNeon' },
  { value: 'background', labelKey: 'effectBackground' },
] as const

const textTemplates = [
  { labelKey: 'templateClean', textKey: 'heading', sample: 'CLEAN', className: 'template-clean', style: { fontSize: 48, fontFamily: 'Arial, sans-serif', color: '#ffffff', bold: true, textEffect: 'outline', strokeColor: '#111111', strokeWidth: 2, x: 50, y: 50 } },
  { labelKey: 'templateSubtitle', textKey: 'captionPreset', sample: 'SUBTITLE', className: 'template-subtitle', style: { fontSize: 28, fontFamily: '"Segoe UI", sans-serif', color: '#ffffff', bold: false, textEffect: 'background', backgroundColor: '#000000', backgroundOpacity: 72, x: 50, y: 80 } },
  { labelKey: 'templateNeon', textKey: 'heading', sample: 'NEON', className: 'template-neon', style: { fontSize: 52, fontFamily: 'Impact, sans-serif', color: '#f5ffff', bold: false, textEffect: 'neon', effectColor: '#00f5ff', strokeColor: '#ffffff', strokeWidth: 1, letterSpacing: 2 } },
  { labelKey: 'templateCinema', textKey: 'heading', sample: 'CINEMA', className: 'template-cinema', style: { fontSize: 46, fontFamily: 'Georgia, serif', color: '#f7df9a', bold: true, textEffect: 'shadow', effectColor: '#000000', letterSpacing: 3, y: 72 } },
  { labelKey: 'templatePop', textKey: 'heading', sample: 'POP!', className: 'template-pop', style: { fontSize: 54, fontFamily: 'Arial, sans-serif', color: '#ffe34f', bold: true, textEffect: 'outline', strokeColor: '#ef3d96', strokeWidth: 6 } },
  { labelKey: 'templateMinimal', textKey: 'newText', sample: 'minimal', className: 'template-minimal', style: { fontSize: 34, fontFamily: '"Segoe UI", sans-serif', color: '#ffffff', bold: false, textEffect: 'shadow', effectColor: '#000000', letterSpacing: 4 } },
  { labelKey: 'templateBreaking', textKey: 'heading', sample: 'BREAKING', className: 'template-breaking', style: { fontSize: 38, fontFamily: 'Arial, sans-serif', color: '#ffffff', bold: true, textEffect: 'background', backgroundColor: '#dc2638', backgroundOpacity: 100, y: 80 } },
  { labelKey: 'templateRetro', textKey: 'heading', sample: 'RETRO', className: 'template-retro', style: { fontSize: 42, fontFamily: '"Courier New", monospace', color: '#ffd29b', bold: true, textEffect: 'glow', effectColor: '#ff6d3a', letterSpacing: 2 } },
] as const

const transitionOptions = [
  { value: 'none', labelKey: 'transitionNone' },
  { value: 'crossfade', labelKey: 'crossfade' },
  { value: 'fade-black', labelKey: 'fadeBlack' },
  { value: 'slide-left', labelKey: 'transitionSlideLeft' },
  { value: 'slide-up', labelKey: 'transitionSlideUp' },
  { value: 'zoom', labelKey: 'transitionZoom' },
] as const

const animationFrame = (preset: AnimationPreset, start: number, duration: number, animationDuration: number, time: number) => {
  const transition = Math.max(.1, Math.min(animationDuration, duration))
  const entering = Math.max(0, Math.min(1, (time - start) / transition))
  const leaving = Math.max(0, Math.min(1, (start + duration - time) / transition))
  if (preset === 'fade-in') return { opacity: entering, scale: 1, x: 0, y: 0 }
  if (preset === 'fade-out') return { opacity: leaving, scale: 1, x: 0, y: 0 }
  if (preset === 'zoom-in') return { opacity: entering, scale: .65 + entering * .35, x: 0, y: 0 }
  if (preset === 'slide-up') return { opacity: entering, scale: 1, x: 0, y: (1 - entering) * 14 }
  if (preset === 'slide-left') return { opacity: entering, scale: 1, x: (1 - entering) * 14, y: 0 }
  return { opacity: 1, scale: 1, x: 0, y: 0 }
}

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
const animatedText = (text: string, animation: AnimationPreset, start: number, duration: number, animationDuration: number, time: number) => {
  if (animation !== 'typewriter') return text
  const characters = [...graphemeSegmenter.segment(text)].map((part) => part.segment)
  const revealDuration = Math.max(.1, Math.min(animationDuration, duration))
  const progress = Math.max(0, Math.min(1, (time - start) / revealDuration))
  return characters.slice(0, Math.floor(characters.length * progress)).join('')
}

const hexToRgba = (hex: string, opacity: number) => {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3 ? normalized.split('').map((part) => `${part}${part}`).join('') : normalized
  const parsed = Number.parseInt(value, 16)
  if (!Number.isFinite(parsed)) return `rgba(0, 0, 0, ${opacity})`
  return `rgba(${(parsed >> 16) & 255}, ${(parsed >> 8) & 255}, ${parsed & 255}, ${opacity})`
}

const textEffectStyle = (item: TextClip): CSSProperties => {
  const style: CSSProperties = { letterSpacing: item.letterSpacing, textShadow: 'none' }
  if (item.textEffect === 'outline') {
    style.WebkitTextStroke = `${item.strokeWidth}px ${item.strokeColor}`
    style.paintOrder = 'stroke fill'
  }
  if (item.textEffect === 'shadow') style.textShadow = `0 .12em .28em ${item.effectColor}`
  if (item.textEffect === 'glow') style.textShadow = `0 0 .12em ${item.effectColor}, 0 0 .35em ${item.effectColor}, 0 0 .7em ${item.effectColor}`
  if (item.textEffect === 'neon') {
    style.WebkitTextStroke = `${Math.max(.5, item.strokeWidth / 2)}px ${item.strokeColor}`
    style.paintOrder = 'stroke fill'
    style.textShadow = `0 0 .08em #ffffff, 0 0 .28em ${item.effectColor}, 0 0 .65em ${item.effectColor}`
  }
  if (item.textEffect === 'background') {
    style.background = hexToRgba(item.backgroundColor, item.backgroundOpacity / 100)
    style.padding = '.2em .42em'
    style.borderRadius = '.16em'
  }
  return style
}

const measureSpacedText = (ctx: CanvasRenderingContext2D, text: string, spacing: number) => {
  const characters = [...graphemeSegmenter.segment(text)].map((part) => part.segment)
  return characters.reduce((width, character) => width + ctx.measureText(character).width, 0) + Math.max(0, characters.length - 1) * spacing
}

const drawSpacedText = (ctx: CanvasRenderingContext2D, text: string, spacing: number, mode: 'fill' | 'stroke') => {
  if (!spacing) {
    if (mode === 'fill') ctx.fillText(text, 0, 0)
    else ctx.strokeText(text, 0, 0)
    return
  }
  const characters = [...graphemeSegmenter.segment(text)].map((part) => part.segment)
  let x = -measureSpacedText(ctx, text, spacing) / 2
  ctx.textAlign = 'left'
  characters.forEach((character) => {
    if (mode === 'fill') ctx.fillText(character, x, 0)
    else ctx.strokeText(character, x, 0)
    x += ctx.measureText(character).width + spacing
  })
  ctx.textAlign = 'center'
}

type VisualFrame = { opacity: number; scale: number; x: number; y: number }
const neutralFrame: VisualFrame = { opacity: 1, scale: 1, x: 0, y: 0 }
const transitionFrame = (preset: TransitionPreset, start: number, transitionDuration: number, time: number) => {
  const duration = Math.max(.1, transitionDuration)
  const progress = Math.max(0, Math.min(1, (time - start) / duration))
  const active = preset !== 'none' && time >= start && time < start + duration
  if (!active) return { active: false, progress, current: neutralFrame, previous: { ...neutralFrame, opacity: 0 } }
  if (preset === 'crossfade') return { active, progress, current: { ...neutralFrame, opacity: progress }, previous: { ...neutralFrame, opacity: 1 - progress } }
  if (preset === 'fade-black') return { active, progress, current: { ...neutralFrame, opacity: progress < .5 ? 0 : (progress - .5) * 2 }, previous: { ...neutralFrame, opacity: progress < .5 ? 1 - progress * 2 : 0 } }
  if (preset === 'slide-left') return { active, progress, current: { ...neutralFrame, x: (1 - progress) * 100 }, previous: { ...neutralFrame, x: -progress * 100 } }
  if (preset === 'slide-up') return { active, progress, current: { ...neutralFrame, y: (1 - progress) * 100 }, previous: { ...neutralFrame, y: -progress * 100 } }
  return { active, progress, current: { opacity: progress, scale: .72 + progress * .28, x: 0, y: 0 }, previous: { opacity: 1 - progress, scale: 1 + progress * .22, x: 0, y: 0 } }
}

const combineFrames = (first: VisualFrame, second: VisualFrame): VisualFrame => ({
  opacity: first.opacity * second.opacity,
  scale: first.scale * second.scale,
  x: first.x + second.x,
  y: first.y + second.y,
})

const formatTime = (time: number) => {
  const safe = Number.isFinite(time) ? Math.max(0, time) : 0
  const min = Math.floor(safe / 60)
  const sec = Math.floor(safe % 60)
  const frames = Math.floor((safe % 1) * 30)
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}:${String(frames).padStart(2, '0')}`
}

const parseSrtTimestamp = (value: string) => {
  const match = value.trim().match(/(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})/)
  if (!match) return 0
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000
}

const toolItems = [
  { id: 'media', labelKey: 'media', icon: Film },
  { id: 'audio', labelKey: 'audio', icon: Music2 },
  { id: 'text', labelKey: 'text', icon: TextCursorInput },
  { id: 'stickers', labelKey: 'stickers', icon: Sticker },
  { id: 'effects', labelKey: 'effects', icon: Sparkles },
  { id: 'captions', labelKey: 'captions', icon: Captions },
] as const

const optionalTrackItems = [
  { type: 'text', labelKey: 'trackText', icon: TextCursorInput },
  { type: 'sticker', labelKey: 'trackSticker', icon: Sticker },
  { type: 'caption', labelKey: 'trackCaption', icon: Captions },
] as const

const trackTypeOrder: Record<TrackType, number> = { video: 0, audio: 1, text: 2, sticker: 3, caption: 4 }
const orderTimelineTracks = (items: TimelineTrack[]) => [...items].sort((a, b) => trackTypeOrder[a.type] - trackTypeOrder[b.type])

function App() {
  const fileInput = useRef<HTMLInputElement>(null)
  const audioInput = useRef<HTMLInputElement>(null)
  const captionInput = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const transitionVideoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackHeadsRef = useRef<HTMLDivElement>(null)
  const timelineScrollRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const recordingStartedAtRef = useRef(0)
  const recordingTimelineStartRef = useRef(0)
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const dragRef = useRef<{ kind: TrackType; id: number; x: number; start: number } | null>(null)
  const resizeRef = useRef<{ kind: TrackType; id: number; edge: 'start' | 'end'; x: number; start: number; duration: number; offset: number; maxDuration: number } | null>(null)
  const textPositionRef = useRef<{ id: number; pointerX: number; pointerY: number; x: number; y: number } | null>(null)
  const stickerPositionRef = useRef<{ id: number; pointerX: number; pointerY: number; x: number; y: number } | null>(null)
  const stickerImagesRef = useRef(new Map<string, HTMLImageElement>())
  const zoomDragRef = useRef<{ x: number; zoom: number } | null>(null)
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('lumacut-language') as LanguageCode | null
    return languageOptions.some((option) => option.code === saved) ? saved! : 'en'
  })
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [activeTool, setActiveTool] = useState<Tool>('media')
  const [tracks, setTracks] = useState(initialTracks)
  const [videoUrl, setVideoUrl] = useState('')
  const [fileName, setFileName] = useState('travel_vlog_01.mp4')
  const [videoAssets, setVideoAssets] = useState<VideoAsset[]>([])
  const [duration, setDuration] = useState(15)
  const [currentTime, setCurrentTime] = useState(3.7)
  const [isPlaying, setIsPlaying] = useState(false)
  const [clips, setClips] = useState(initialClips)
  const [selectedClip, setSelectedClip] = useState(2)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioName, setAudioName] = useState('')
  const [audioClips, setAudioClips] = useState(initialAudioClips)
  const [selectedAudioClip, setSelectedAudioClip] = useState(0)
  const [_isAudioDetached, setIsAudioDetached] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [textClips, setTextClips] = useState(initialTextClips)
  const [selectedTextClip, setSelectedTextClip] = useState(0)
  const [stickerClips, setStickerClips] = useState(initialStickerClips)
  const [selectedStickerClip, setSelectedStickerClip] = useState(0)
  const [stickerSearch, setStickerSearch] = useState('')
  const [stickerCategory, setStickerCategory] = useState<'all' | 'sticker' | 'gif'>('all')
  const [captionClips, setCaptionClips] = useState(initialCaptionClips)
  const [selectedCaptionClip, setSelectedCaptionClip] = useState(0)
  const [captionDraft, setCaptionDraft] = useState('')
  const [zoom, setZoom] = useState(1)
  const [zoomPercentInput, setZoomPercentInput] = useState('100')
  const [speed, setSpeed] = useState(1)
  const [volume, setVolume] = useState(85)
  const [videoOpacity, setVideoOpacity] = useState(100)
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [videoInspectorTab, setVideoInspectorTab] = useState<'video' | 'animation' | 'transition' | 'adjust'>('video')
  const [textInspectorTab, setTextInspectorTab] = useState<'text' | 'style' | 'effects' | 'animation'>('text')
  const [stickerInspectorTab, setStickerInspectorTab] = useState<'sticker' | 'animation'>('sticker')
  const [captionInspectorTab, setCaptionInspectorTab] = useState<'caption' | 'format'>('caption')
  const [toast, setToast] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const activeClip = clips.find((clip) => clip.id === selectedClip)
  const activeAudioClip = audioClips.find((clip) => clip.id === selectedAudioClip)
  const activeTextClip = textClips.find((clip) => clip.id === selectedTextClip)
  const activeStickerClip = stickerClips.find((clip) => clip.id === selectedStickerClip)
  const activeCaptionClip = captionClips.find((clip) => clip.id === selectedCaptionClip)
  const pxPerSecond = 64 * zoom
  const projectDuration = Math.max(duration, ...clips.map((clip) => clip.start + clip.duration), ...audioClips.map((clip) => clip.start + clip.duration), ...textClips.map((clip) => clip.start + clip.duration), ...stickerClips.map((clip) => clip.start + clip.duration), ...captionClips.map((clip) => clip.start + clip.duration), 15)
  const timelineWidth = Math.max(projectDuration * pxPerSecond, 720)
  const rulerTargetStep = 90 / pxPerSecond
  const rulerMagnitude = 10 ** Math.floor(Math.log10(rulerTargetStep))
  const rulerNormalized = rulerTargetStep / rulerMagnitude
  const rulerNiceStep = (rulerNormalized <= 1 ? 1 : rulerNormalized <= 2 ? 2 : rulerNormalized <= 5 ? 5 : 10) * rulerMagnitude
  const rulerStep = Math.max(rulerNiceStep, projectDuration / 2000)
  const rulerTickCount = Math.floor(projectDuration / rulerStep) + 1
  const filter = useMemo(() => `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`, [brightness, contrast, saturation])
  const currentVideoClip = clips.find((clip) => currentTime >= clip.start && currentTime < clip.start + clip.duration)
  const previousVideoClip = currentVideoClip ? [...clips].filter((clip) => clip.trackId === currentVideoClip.trackId && clip.start < currentVideoClip.start).sort((a, b) => b.start - a.start)[0] : undefined
  const hasAdjacentPreviousClip = Boolean(currentVideoClip && previousVideoClip && Math.abs(previousVideoClip.start + previousVideoClip.duration - currentVideoClip.start) < .11)
  const currentTransition = currentVideoClip && hasAdjacentPreviousClip ? transitionFrame(currentVideoClip.transition, currentVideoClip.start, Math.min(currentVideoClip.transitionDuration, currentVideoClip.duration, previousVideoClip!.duration), currentTime) : transitionFrame('none', 0, 1, 0)
  const videoMotion = currentVideoClip ? combineFrames(animationFrame(currentVideoClip.animation, currentVideoClip.start, currentVideoClip.duration, currentVideoClip.animationDuration, currentTime), currentTransition.current) : neutralFrame
  const previewVideoUrl = currentVideoClip?.sourceUrl || activeClip?.sourceUrl || videoUrl
  const isCurrentVideoDetached = Boolean(currentVideoClip && audioClips.some((item) => item.sourceUrl === currentVideoClip.sourceUrl))
  const selectedVideoSource = activeClip?.sourceUrl || currentVideoClip?.sourceUrl || ''
  const isSelectedVideoDetached = Boolean(selectedVideoSource && audioClips.some((item) => item.sourceUrl === selectedVideoSource))
  const t = (key: Parameters<typeof translate>[1], variables?: Record<string, string | number>) => translate(language, key, variables)
  const trackBaseName = (type: TrackType) => t(({ video: 'trackVideo', text: 'trackText', sticker: 'trackSticker', caption: 'trackCaption', audio: 'trackAudio' } as const)[type])
  const trackDisplayLabel = (track: TimelineTrack) => track.id === 'video-1' ? t('mainVideo') : track.id.endsWith('-1') ? trackBaseName(track.type) : `${trackBaseName(track.type)} ${track.label}`
  const createTimelineTrack = (type: TrackType, items: TimelineTrack[]) => {
    const index = items.reduce((highest, item) => item.type === type ? Math.max(highest, Number(item.id.split('-').at(-1)) || 0) : highest, 0) + 1
    return { id: `${type}-${index}`, type, label: String(index) } satisfies TimelineTrack
  }
  const ensureTrackId = (type: TrackType) => {
    const existing = tracks.find((track) => track.type === type)
    if (existing) return existing.id
    const next = createTimelineTrack(type, tracks)
    setTracks((items) => items.some((item) => item.type === type) ? items : orderTimelineTracks([...items, next]))
    return next.id
  }
  const filteredStickerAssets = stickerAssets.filter((asset) => (stickerCategory === 'all' || asset.kind === stickerCategory) && `${asset.name} ${asset.keywords}`.toLowerCase().includes(stickerSearch.trim().toLowerCase()))
  const formatZoomPercent = (value: number) => value >= .1 ? String(Math.round(value * 100)) : (value * 100).toFixed(2)
  const applyTimelineZoom = (value: number) => {
    const safe = Number.isFinite(value) ? Math.min(10000, Math.max(.0001, value)) : 1
    setZoom(safe)
    setZoomPercentInput(formatZoomPercent(safe))
  }
  const commitZoomPercent = () => {
    const parsed = Number(zoomPercentInput)
    if (!Number.isFinite(parsed) || parsed <= 0) return setZoomPercentInput(formatZoomPercent(zoom))
    applyTimelineZoom(parsed / 100)
  }
  const beginZoomDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId)
    zoomDragRef.current = { x: event.clientX, zoom }
  }
  const moveZoomDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = zoomDragRef.current
    if (!drag) return
    event.preventDefault()
    applyTimelineZoom(drag.zoom * Math.pow(1.012, event.clientX - drag.x))
  }
  const endZoomDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!zoomDragRef.current) return
    event.preventDefault(); zoomDragRef.current = null
    setToast(t('zoomChanged', { zoom: formatZoomPercent(zoom) }))
  }

  const togglePlayback = async () => {
    const video = videoRef.current
    if (videoUrl && video) {
      const clip = clips.find((item) => currentTime >= item.start && currentTime < item.start + item.duration) ?? [...clips].sort((a, b) => a.start - b.start)[0]
      if (clip && (currentTime < clip.start || currentTime >= clip.start + clip.duration)) seek(clip.start)
      if (isPlaying) { video.pause(); setIsPlaying(false) }
      else { setIsPlaying(true); await video.play().catch(() => undefined) }
    } else if (audioUrl) {
      if (isPlaying) setIsPlaying(false)
      else {
        const clip = audioClips.find((item) => currentTime >= item.start && currentTime < item.start + item.duration) ?? [...audioClips].sort((a, b) => a.start - b.start)[0]
        if (clip && (currentTime < clip.start || currentTime >= clip.start + clip.duration)) seek(clip.start)
        setIsPlaying(true)
      }
    } else setIsPlaying((value) => !value)
  }

  const seek = (time: number) => {
    const next = Math.max(0, Math.min(projectDuration, time))
    setCurrentTime(next)
    if (videoRef.current && videoUrl) {
      const clip = clips.find((item) => next >= item.start && next < item.start + item.duration)
      if (clip && videoRef.current.getAttribute('src') === clip.sourceUrl) videoRef.current.currentTime = clip.offset + next - clip.start
      else videoRef.current.pause()
    }
  }

  const splitClip = () => {
    if (activeCaptionClip) {
      if (currentTime <= activeCaptionClip.start + .2 || currentTime >= activeCaptionClip.start + activeCaptionClip.duration - .2) return setToast(t('splitHint', { item: t('captions') }))
      const firstDuration = currentTime - activeCaptionClip.start
      const second: CaptionClip = { ...activeCaptionClip, id: Date.now(), start: currentTime, duration: activeCaptionClip.duration - firstDuration }
      setCaptionClips((items) => items.flatMap((item) => item.id === activeCaptionClip.id ? [{ ...item, duration: firstDuration }, second] : [item]))
      setSelectedCaptionClip(second.id)
      return setToast(t('splitDone', { item: t('captions') }))
    }
    if (activeStickerClip) {
      if (currentTime <= activeStickerClip.start + .2 || currentTime >= activeStickerClip.start + activeStickerClip.duration - .2) return setToast(t('splitHint', { item: t('stickers') }))
      const firstDuration = currentTime - activeStickerClip.start
      const second: StickerClip = { ...activeStickerClip, id: Date.now(), start: currentTime, duration: activeStickerClip.duration - firstDuration }
      setStickerClips((items) => items.flatMap((item) => item.id === activeStickerClip.id ? [{ ...item, duration: firstDuration }, second] : [item]))
      setSelectedStickerClip(second.id)
      return setToast(t('splitDone', { item: t('stickers') }))
    }
    if (activeTextClip) {
      if (currentTime <= activeTextClip.start + .2 || currentTime >= activeTextClip.start + activeTextClip.duration - .2) return setToast(t('splitHint', { item: t('text') }))
      const firstDuration = currentTime - activeTextClip.start
      const second: TextClip = { ...activeTextClip, id: Date.now(), start: currentTime, duration: activeTextClip.duration - firstDuration }
      setTextClips((items) => items.flatMap((item) => item.id === activeTextClip.id ? [{ ...item, duration: firstDuration }, second] : [item]))
      setSelectedTextClip(second.id)
      return setToast(t('splitDone', { item: t('text') }))
    }
    if (activeAudioClip) {
      if (currentTime <= activeAudioClip.start + .2 || currentTime >= activeAudioClip.start + activeAudioClip.duration - .2) return setToast(t('splitHint', { item: t('audio') }))
      const firstDuration = currentTime - activeAudioClip.start
      const second: AudioClip = { ...activeAudioClip, id: Date.now(), label: `${activeAudioClip.label} (2)`, start: currentTime, duration: activeAudioClip.duration - firstDuration, offset: activeAudioClip.offset + firstDuration }
      setAudioClips((items) => items.flatMap((item) => item.id === activeAudioClip.id ? [{ ...item, duration: firstDuration }, second] : [item]))
      setSelectedAudioClip(second.id)
      return setToast(t('splitDone', { item: t('audio') }))
    }
    const clip = clips.find((item) => item.id === selectedClip && currentTime > item.start + .2 && currentTime < item.start + item.duration - .2)
    if (!clip) return setToast(t('splitHint', { item: t('clip') }))
    const firstDuration = currentTime - clip.start
    const second: Clip = { ...clip, id: Date.now(), label: `${clip.label} (2)`, start: currentTime, duration: clip.duration - firstDuration, offset: clip.offset + firstDuration, transition: 'none' }
    setClips((items) => items.flatMap((item) => item.id === clip.id ? [{ ...item, duration: firstDuration }, second] : [item]))
    setSelectedClip(second.id)
    setToast(t('splitDone', { item: t('clip') }))
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    video.volume = volume / 100
    video.muted = isCurrentVideoDetached
  }, [speed, volume, previewVideoUrl, isCurrentVideoDetached])

  useEffect(() => {
    const outgoingVideo = transitionVideoRef.current
    if (!outgoingVideo || !currentTransition.active || !currentVideoClip || !previousVideoClip) {
      outgoingVideo?.pause()
      return
    }
    const transitionDuration = Math.min(currentVideoClip.transitionDuration, currentVideoClip.duration, previousVideoClip.duration)
    const wanted = previousVideoClip.offset + previousVideoClip.duration - transitionDuration + (currentTime - currentVideoClip.start)
    if (Math.abs(outgoingVideo.currentTime - wanted) > .12) outgoingVideo.currentTime = Math.max(previousVideoClip.offset, wanted)
    outgoingVideo.playbackRate = speed
    if (isPlaying && outgoingVideo.paused) void outgoingVideo.play().catch(() => undefined)
    if (!isPlaying && !outgoingVideo.paused) outgoingVideo.pause()
  }, [currentTime, currentTransition.active, currentVideoClip, previousVideoClip, speed, isPlaying])

  useEffect(() => {
    localStorage.setItem('lumacut-language', language)
    document.documentElement.lang = language
    document.title = translate(language, 'appTitle')
  }, [language])

  useEffect(() => {
    stickerAssets.forEach((asset) => {
      if (stickerImagesRef.current.has(asset.src)) return
      const image = new Image()
      image.src = asset.src
      stickerImagesRef.current.set(asset.src, image)
    })
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return
    const clip = audioClips.find((item) => currentTime >= item.start && currentTime < item.start + item.duration)
    if (!clip) { audio.pause(); return }
    if (audio.getAttribute('src') !== clip.sourceUrl) { audio.src = clip.sourceUrl; audio.load() }
    const wanted = clip.offset + currentTime - clip.start
    if (Math.abs(audio.currentTime - wanted) > .25) audio.currentTime = wanted
    audio.volume = volume / 100
    if (isPlaying && audio.paused) void audio.play().catch(() => undefined)
    if (!isPlaying && !audio.paused) audio.pause()
  }, [currentTime, isPlaying, audioUrl, audioClips, volume])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => () => {
    const recorder = mediaRecorderRef.current
    if (recorder) {
      recorder.ondataavailable = null
      recorder.onstop = null
      if (recorder.state !== 'inactive') recorder.stop()
    }
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
  }, [])

  useEffect(() => {
    if (videoUrl || !isPlaying) return
    const timer = setInterval(() => setCurrentTime((time) => time >= duration ? 0 : time + 0.033 * speed), 33)
    return () => clearInterval(timer)
  }, [isPlaying, videoUrl, duration, speed])

  const importFile = async (file: File) => {
    const url = URL.createObjectURL(file)
    const sourceDuration = await new Promise<number>((resolve) => {
      const probe = document.createElement('video')
      probe.preload = 'metadata'
      probe.onloadedmetadata = () => resolve(Number.isFinite(probe.duration) ? probe.duration : 15)
      probe.onerror = () => resolve(15)
      probe.src = url
    })
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const trackId = ensureTrackId('video')
    const palette = ['#78dce8', '#a78bfa', '#fb7185', '#fbbf24', '#34d399', '#60a5fa']
    setVideoUrl((current) => current || url)
    setVideoAssets((items) => [...items, { id, name: file.name, url, duration: sourceDuration }])
    setClips((items) => {
      const realClips = items.filter((item) => item.sourceUrl)
      const start = Math.max(0, ...realClips.map((item) => item.start + item.duration))
      const next: Clip = { id, trackId, label: file.name.replace(/\.[^.]+$/, ''), start, duration: sourceDuration, offset: 0, sourceDuration, sourceUrl: url, color: palette[realClips.length % palette.length], animation: 'none', animationDuration: 1, transition: 'none', transitionDuration: .8 }
      return [...realClips, next]
    })
    setDuration((current) => current + sourceDuration)
    setSelectedClip(id); setSelectedAudioClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0)
  }

  const importFiles = async (files: File[]) => {
    const videos = files.filter((file) => file.type.startsWith('video/'))
    if (!videos.length) return setToast(t('selectVideoFile'))
    if (!videoUrl) { setFileName(videos[0].name); setCurrentTime(0); setDuration(0) }
    for (const file of videos) await importFile(file)
    setToast(videos.length > 1 ? t('importedVideos', { count: videos.length }) : t('importedVideo'))
  }

  const detachAudioFromVideo = () => {
    const sourceClip = activeClip ?? currentVideoClip
    if (!sourceClip?.sourceUrl) return setToast(t('importVideoFirst'))
    if (audioClips.some((item) => item.sourceUrl === sourceClip.sourceUrl && Math.abs(item.offset - sourceClip.offset) < .01)) return setToast(t('alreadyDetached'))
    const id = Date.now()
    const baseName = sourceClip.label.replace(/\s*\(\d+\)$/, '')
    const audioTrackId = ensureTrackId('audio')
    setAudioUrl(sourceClip.sourceUrl)
    setAudioName(t('sourceAudio', { name: baseName }))
    setAudioClips((items) => [...items, { id, trackId: audioTrackId, label: t('audioSuffix', { name: baseName }), start: sourceClip.start, duration: sourceClip.duration, offset: sourceClip.offset, sourceDuration: sourceClip.sourceDuration, sourceUrl: sourceClip.sourceUrl }])
    setSelectedAudioClip(id)
    setSelectedClip(0)
    setSelectedTextClip(0)
    setSelectedStickerClip(0)
    setSelectedCaptionClip(0)
    setIsAudioDetached(true)
    setActiveTool('audio')
    setToast(t('detachedAudio'))
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault(); setIsDragging(false)
    const files = Array.from(event.dataTransfer.files ?? [])
    const videos = files.filter((file) => file.type.startsWith('video/'))
    if (videos.length) void importFiles(videos)
    else if (files[0]?.type.startsWith('audio/')) importAudio(files[0])
    else setToast(t('selectVideoFile'))
  }
  const importAudio = (file?: File) => {
    if (!file || !file.type.startsWith('audio/')) return setToast(t('selectAudioFile'))
    new Set(audioClips.map((clip) => clip.sourceUrl).filter((url) => url !== videoUrl)).forEach((url) => URL.revokeObjectURL(url))
    const url = URL.createObjectURL(file)
    const id = Date.now()
    setAudioUrl(url); setAudioName(file.name); setActiveTool('audio'); setIsAudioDetached(false)
    const probe = new Audio(url)
    probe.onloadedmetadata = () => {
      const audioDuration = Number.isFinite(probe.duration) ? probe.duration : 15
      setAudioClips([{ id, trackId: ensureTrackId('audio'), label: file.name.replace(/\.[^.]+$/, ''), start: 0, duration: audioDuration, offset: 0, sourceDuration: audioDuration, sourceUrl: url }])
      setSelectedAudioClip(id); setSelectedClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0)
    }
    setToast(t('importedAudio'))
  }

  const toggleRecording = async () => {
    const activeRecorder = mediaRecorderRef.current
    if (activeRecorder?.state === 'recording') {
      activeRecorder.stop()
      return
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return setToast(t('recordingUnsupported'))
    try {
      videoRef.current?.pause()
      audioRef.current?.pause()
      setIsPlaying(false)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false })
      const supportedType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : undefined)
      mediaRecorderRef.current = recorder
      recordingStreamRef.current = stream
      recordedChunksRef.current = []
      recordingStartedAtRef.current = performance.now()
      recordingTimelineStartRef.current = currentTime
      recorder.ondataavailable = (event) => { if (event.data.size) recordedChunksRef.current.push(event.data) }
      recorder.onstop = () => {
        const recordedDuration = Math.max(.3, Math.round((performance.now() - recordingStartedAtRef.current) / 100) / 10)
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
        recordingStreamRef.current = null
        mediaRecorderRef.current = null
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
        setIsRecording(false)
        setRecordingSeconds(0)
        if (!blob.size) return setToast(t('noRecordingData'))
        const url = URL.createObjectURL(blob)
        const id = Date.now()
        const label = t('recordingLabel', { time: new Date().toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }) })
        const audioTrackId = ensureTrackId('audio')
        setAudioUrl(url)
        setAudioName(label)
        setAudioClips((items) => [...items, { id, trackId: audioTrackId, label, start: recordingTimelineStartRef.current, duration: recordedDuration, offset: 0, sourceDuration: recordedDuration, sourceUrl: url }])
        setSelectedAudioClip(id); setSelectedClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0); setActiveTool('audio')
        setToast(t('recordedAudio', { duration: recordedDuration.toFixed(1) }))
      }
      recorder.onerror = () => { recorder.stop(); setToast(t('recordingError')) }
      recorder.start(250)
      setIsRecording(true)
      setRecordingSeconds(0)
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((performance.now() - recordingStartedAtRef.current) / 1000), 100)
      setToast(t('recordingNow'))
    } catch {
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
      recordingStreamRef.current = null
      setIsRecording(false)
      setToast(t('microphoneDenied'))
    }
  }

  const deleteClip = () => {
    if (activeCaptionClip) {
      setCaptionClips((items) => items.filter((item) => item.id !== activeCaptionClip.id))
      setSelectedCaptionClip(0)
      return setToast(t('deleted', { item: t('captions') }))
    }
    if (activeStickerClip) {
      setStickerClips((items) => items.filter((item) => item.id !== activeStickerClip.id))
      setSelectedStickerClip(0)
      return setToast(t('deleted', { item: t('stickers') }))
    }
    if (activeTextClip) {
      setTextClips((items) => items.filter((item) => item.id !== activeTextClip.id))
      setSelectedTextClip(0)
      return setToast(t('deleted', { item: t('text') }))
    }
    if (activeAudioClip) {
      const remaining = audioClips.filter((item) => item.id !== activeAudioClip.id)
      setAudioClips(remaining)
      setSelectedAudioClip(0)
      if (!remaining.some((item) => item.sourceUrl === activeAudioClip.sourceUrl) && activeAudioClip.sourceUrl !== videoUrl) URL.revokeObjectURL(activeAudioClip.sourceUrl)
      if (audioUrl === activeAudioClip.sourceUrl) {
        setAudioUrl(remaining[0]?.sourceUrl ?? '')
        setAudioName(remaining[0]?.label ?? '')
      }
      setIsAudioDetached(remaining.some((item) => item.sourceUrl === videoUrl))
      return setToast(t('deleted', { item: t('audio') }))
    }
    if (!activeClip) return
    setClips((items) => items.filter((item) => item.id !== activeClip.id))
    setSelectedClip(0)
    setToast(t('deleted', { item: t('clip') }))
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isTyping = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
      if (event.code === 'Space' && !isTyping) { event.preventDefault(); void togglePlayback() }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b' && !isTyping) { event.preventDefault(); splitClip() }
      if ((event.key === 'Delete' || event.key === 'Backspace') && !isTyping) { event.preventDefault(); deleteClip() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const addText = (preset = t('newText'), template: Partial<TextClip> = {}) => {
    const id = Date.now()
    const next: TextClip = { id, trackId: ensureTrackId('text'), text: preset, start: currentTime, duration: Math.max(2, Math.min(5, projectDuration - currentTime)), x: 50, y: 50, fontSize: preset === t('heading') ? 48 : 32, fontFamily: 'Arial, sans-serif', color: '#ffffff', opacity: 100, bold: preset === t('heading'), animation: 'none', animationDuration: 1, textEffect: 'none', strokeColor: '#101114', strokeWidth: 3, effectColor: '#75ead7', backgroundColor: '#000000', backgroundOpacity: 72, letterSpacing: 0, ...template }
    setTextClips((items) => [...items, next]); setSelectedTextClip(id); setSelectedStickerClip(0); setSelectedClip(0); setSelectedAudioClip(0); setSelectedCaptionClip(0); setActiveTool('text'); setToast(t('added', { item: t('text') }))
  }
  const updateText = (patch: Partial<TextClip>) => {
    if (!activeTextClip) return
    setTextClips((items) => items.map((item) => item.id === activeTextClip.id ? { ...item, ...patch } : item))
  }

  const updateVideoClip = (patch: Partial<Clip>) => {
    if (!activeClip) return
    setClips((items) => items.map((item) => item.id === activeClip.id ? { ...item, ...patch } : item))
  }

  const addSticker = (asset: StickerAsset) => {
    const id = stickerClips.reduce((highest, item) => Math.max(highest, item.id), 1000) + 1
    const next: StickerClip = { id, trackId: ensureTrackId('sticker'), name: asset.name, src: asset.src, start: currentTime, duration: Math.max(1, Math.min(4, projectDuration - currentTime || 4)), x: 50, y: 50, size: 26, rotation: 0, opacity: 100, animation: 'none', animationDuration: 1 }
    setStickerClips((items) => [...items, next])
    setSelectedStickerClip(id); setSelectedTextClip(0); setSelectedCaptionClip(0); setSelectedClip(0); setSelectedAudioClip(0); setActiveTool('stickers')
    setToast(t('added', { item: asset.name }))
  }

  const updateSticker = (patch: Partial<StickerClip>) => {
    if (!activeStickerClip) return
    setStickerClips((items) => items.map((item) => item.id === activeStickerClip.id ? { ...item, ...patch } : item))
  }

  const addCaption = (text = captionDraft.trim() || t('captionPreset')) => {
    const id = Date.now()
    const next: CaptionClip = { id, trackId: ensureTrackId('caption'), text, start: currentTime, duration: Math.max(1, Math.min(3, projectDuration - currentTime || 3)) }
    setCaptionClips((items) => [...items, next])
    setCaptionDraft('')
    setSelectedCaptionClip(id); setSelectedStickerClip(0); setSelectedTextClip(0); setSelectedClip(0); setSelectedAudioClip(0); setActiveTool('captions')
    setToast(t('added', { item: t('captions') }))
  }

  const updateCaption = (patch: Partial<CaptionClip>) => {
    if (!activeCaptionClip) return
    setCaptionClips((items) => items.map((item) => item.id === activeCaptionClip.id ? { ...item, ...patch } : item))
  }

  const renderAnimationEditor = (settings: AnimationSettings, update: (patch: Partial<AnimationSettings>) => void, start: number, clipDuration: number, includeTypewriter = false) => <>
    <div className="property-section animation-editor"><h3><Sparkles size={16}/>{t('animation')}</h3><div className="animation-presets">{(includeTypewriter ? textAnimationOptions : animationOptions).map((option) => <button key={option.value} className={settings.animation === option.value ? 'active' : ''} onClick={() => { update({ animation: option.value }); const previewOffset = Math.min(settings.animationDuration * .35, Math.max(.05, clipDuration / 3)); seek(option.value === 'fade-out' ? start + clipDuration - previewOffset : start + previewOffset) }}><i className={`animation-swatch ${option.value}`}/><span>{t(option.labelKey)}</span></button>)}</div></div>
    <div className="property-section"><label>{settings.animation === 'typewriter' ? t('typingDuration') : t('animationDuration')} <span>{settings.animationDuration.toFixed(1)}s</span><input type="range" min="0.1" max={Math.max(.1, Math.min(3, clipDuration))} step="0.1" value={Math.min(settings.animationDuration, clipDuration)} onChange={(event) => update({ animationDuration: Number(event.target.value) })}/></label><p className="animation-hint">{settings.animation === 'typewriter' ? t('typewriterHint') : t('animationHint')}</p></div>
  </>

  const renderTransitionEditor = (clip: Clip) => {
    const previous = [...clips].filter((item) => item.trackId === clip.trackId && item.start < clip.start).sort((a, b) => b.start - a.start)[0]
    const adjacent = previous && Math.abs(previous.start + previous.duration - clip.start) < .11
    if (!adjacent) return <div className="caption-empty inspector-empty transition-empty"><Sparkles size={24}/><span>{t('transitionNeedsClip')}</span></div>
    const maxDuration = Math.max(.1, Math.min(3, clip.duration, previous.duration))
    return <>
      <div className="property-section transition-editor"><h3><Sparkles size={16}/>{t('transition')}</h3><div className="transition-presets">{transitionOptions.map((option) => <button key={option.value} className={clip.transition === option.value ? 'active' : ''} onClick={() => { updateVideoClip({ transition: option.value }); seek(clip.start + Math.min(clip.transitionDuration * .45, clip.duration / 2)) }}><i className={`transition-swatch ${option.value}`}><b/><span/></i><em>{t(option.labelKey)}</em></button>)}</div></div>
      <div className="property-section"><label>{t('transitionDuration')} <span>{Math.min(clip.transitionDuration, maxDuration).toFixed(1)}s</span><input type="range" min="0.1" max={maxDuration} step="0.1" value={Math.min(clip.transitionDuration, maxDuration)} onChange={(event) => { updateVideoClip({ transitionDuration: Number(event.target.value) }); seek(clip.start + Number(event.target.value) * .45) }}/></label><p className="animation-hint">{t('transitionHint')}</p></div>
    </>
  }

  const importSrt = async (file?: File) => {
    if (!file) return
    try {
      const content = await file.text()
      const baseId = Date.now()
      const captionTrackId = ensureTrackId('caption')
      const imported = content.replace(/\r/g, '').split(/\n{2,}/).flatMap((block, index) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
        const timeIndex = lines.findIndex((line) => line.includes('-->'))
        if (timeIndex < 0) return []
        const [from, to] = lines[timeIndex].split('-->')
        const start = parseSrtTimestamp(from)
        const end = parseSrtTimestamp(to)
        const text = lines.slice(timeIndex + 1).join('\n')
        if (!text || end <= start) return []
        return [{ id: baseId + index, trackId: captionTrackId, text, start, duration: end - start } satisfies CaptionClip]
      })
      if (!imported.length) return setToast(t('invalidSrt'))
      setCaptionClips(imported)
      setSelectedCaptionClip(imported[0].id); setSelectedStickerClip(0); setSelectedTextClip(0); setSelectedClip(0); setSelectedAudioClip(0); setActiveTool('captions')
      setToast(t('srtImported', { count: imported.length }))
    } catch { setToast(t('srtReadFailed')) }
  }

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>, kind: TrackType, id: number, start: number) => {
    event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { kind, id, x: event.clientX, start }
    if (kind === 'video') { setSelectedClip(id); setSelectedAudioClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0) }
    else if (kind === 'audio') { setSelectedAudioClip(id); setSelectedClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0) }
    else if (kind === 'caption') { setSelectedCaptionClip(id); setSelectedStickerClip(0); setSelectedTextClip(0); setSelectedClip(0); setSelectedAudioClip(0); setActiveTool('captions') }
    else if (kind === 'sticker') { setSelectedStickerClip(id); setSelectedCaptionClip(0); setSelectedTextClip(0); setSelectedClip(0); setSelectedAudioClip(0); setActiveTool('stickers') }
    else { setSelectedTextClip(id); setSelectedStickerClip(0); setSelectedClip(0); setSelectedAudioClip(0); setSelectedCaptionClip(0); setActiveTool('text') }
  }
  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag) return
    event.stopPropagation()
    const next = Math.max(0, Math.round((drag.start + (event.clientX - drag.x) / pxPerSecond) * 10) / 10)
    const hoveredTrack = (document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null)?.closest<HTMLElement>('.track[data-track-type]')
    const targetTrackId = hoveredTrack?.dataset.trackType === drag.kind ? hoveredTrack.dataset.trackId : undefined
    if (drag.kind === 'video') setClips((items) => items.map((item) => item.id === drag.id ? { ...item, start: next, trackId: targetTrackId ?? item.trackId } : item))
    else if (drag.kind === 'audio') setAudioClips((items) => items.map((item) => item.id === drag.id ? { ...item, start: next, trackId: targetTrackId ?? item.trackId } : item))
    else if (drag.kind === 'caption') setCaptionClips((items) => items.map((item) => item.id === drag.id ? { ...item, start: next, trackId: targetTrackId ?? item.trackId } : item))
    else if (drag.kind === 'sticker') setStickerClips((items) => items.map((item) => item.id === drag.id ? { ...item, start: next, trackId: targetTrackId ?? item.trackId } : item))
    else setTextClips((items) => items.map((item) => item.id === drag.id ? { ...item, start: next, trackId: targetTrackId ?? item.trackId } : item))
  }
  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return
    event.stopPropagation(); dragRef.current = null; setToast(t('moved', { item: t('clip') }))
  }

  const selectTimelineClip = (kind: TrackType, id: number) => {
    if (kind === 'video') { setSelectedClip(id); setSelectedAudioClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0) }
    else if (kind === 'audio') { setSelectedAudioClip(id); setSelectedClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0) }
    else if (kind === 'caption') { setSelectedCaptionClip(id); setSelectedStickerClip(0); setSelectedTextClip(0); setSelectedClip(0); setSelectedAudioClip(0); setActiveTool('captions') }
    else if (kind === 'sticker') { setSelectedStickerClip(id); setSelectedCaptionClip(0); setSelectedTextClip(0); setSelectedClip(0); setSelectedAudioClip(0); setActiveTool('stickers') }
    else { setSelectedTextClip(id); setSelectedStickerClip(0); setSelectedClip(0); setSelectedAudioClip(0); setSelectedCaptionClip(0); setActiveTool('text') }
  }

  const beginResize = (event: ReactPointerEvent<HTMLDivElement>, kind: TrackType, id: number, clipDuration: number, maxDuration: number) => {
    event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId)
    resizeRef.current = { kind, id, edge: 'end', x: event.clientX, start: 0, duration: clipDuration, offset: 0, maxDuration }
    selectTimelineClip(kind, id)
  }
  const beginStartResize = (event: ReactPointerEvent<HTMLDivElement>, kind: 'video' | 'audio', id: number, clipStart: number, clipDuration: number, clipOffset: number) => {
    event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId)
    resizeRef.current = { kind, id, edge: 'start', x: event.clientX, start: clipStart, duration: clipDuration, offset: clipOffset, maxDuration: clipDuration + clipOffset }
    selectTimelineClip(kind, id)
  }
  const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current
    if (!resize) return
    event.preventDefault(); event.stopPropagation()
    const minimum = resize.kind === 'text' || resize.kind === 'sticker' || resize.kind === 'caption' ? .2 : .3
    if (resize.edge === 'start' && (resize.kind === 'video' || resize.kind === 'audio')) {
      const requestedDelta = Math.round((event.clientX - resize.x) / pxPerSecond * 10) / 10
      const delta = Math.max(-Math.min(resize.start, resize.offset), Math.min(resize.duration - minimum, requestedDelta))
      const patch = { start: resize.start + delta, duration: resize.duration - delta, offset: resize.offset + delta }
      if (resize.kind === 'video') setClips((items) => items.map((item) => item.id === resize.id ? { ...item, ...patch } : item))
      else setAudioClips((items) => items.map((item) => item.id === resize.id ? { ...item, ...patch } : item))
      return
    }
    const next = Math.round(Math.min(resize.maxDuration, Math.max(minimum, resize.duration + (event.clientX - resize.x) / pxPerSecond)) * 10) / 10
    if (resize.kind === 'video') setClips((items) => items.map((item) => item.id === resize.id ? { ...item, duration: next } : item))
    else if (resize.kind === 'audio') setAudioClips((items) => items.map((item) => item.id === resize.id ? { ...item, duration: next } : item))
    else if (resize.kind === 'caption') setCaptionClips((items) => items.map((item) => item.id === resize.id ? { ...item, duration: next } : item))
    else if (resize.kind === 'sticker') setStickerClips((items) => items.map((item) => item.id === resize.id ? { ...item, duration: next } : item))
    else setTextClips((items) => items.map((item) => item.id === resize.id ? { ...item, duration: next } : item))
  }
  const endResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizeRef.current) return
    const edge = resizeRef.current.edge
    event.preventDefault(); event.stopPropagation(); resizeRef.current = null; setToast(t(edge === 'start' ? 'clipStartAdjusted' : 'clipDurationAdjusted'))
  }

  const addTimelineTrack = (type: TrackType) => {
    const name = trackBaseName(type)
    setTracks((items) => orderTimelineTracks([...items, createTimelineTrack(type, items)]))
    setToast(t('addTrack', { track: name }))
  }

  const deleteTimelineTrack = (track: TimelineTrack) => {
    if ((track.type === 'video' || track.type === 'audio') && tracks.filter((item) => item.type === track.type).length <= 1) return setToast(t('minimumTrack'))
    setTracks((items) => items.filter((item) => item.id !== track.id))
    if (track.type === 'video') { setClips((items) => items.filter((item) => item.trackId !== track.id)); setSelectedClip(0) }
    else if (track.type === 'audio') {
      const removed = audioClips.filter((item) => item.trackId === track.id)
      const remaining = audioClips.filter((item) => item.trackId !== track.id)
      new Set(removed.map((item) => item.sourceUrl).filter((url) => url !== videoUrl && !remaining.some((item) => item.sourceUrl === url))).forEach((url) => URL.revokeObjectURL(url))
      setAudioClips(remaining); setSelectedAudioClip(0)
      if (!remaining.some((item) => item.sourceUrl === audioUrl)) { setAudioUrl(remaining[0]?.sourceUrl ?? ''); setAudioName(remaining[0]?.label ?? '') }
      setIsAudioDetached(remaining.some((item) => item.sourceUrl === videoUrl))
    }
    else if (track.type === 'sticker') { setStickerClips((items) => items.filter((item) => item.trackId !== track.id)); setSelectedStickerClip(0) }
    else if (track.type === 'caption') { setCaptionClips((items) => items.filter((item) => item.trackId !== track.id)); setSelectedCaptionClip(0) }
    else { setTextClips((items) => items.filter((item) => item.trackId !== track.id)); setSelectedTextClip(0) }
    setToast(t('deleteTrack', { track: trackDisplayLabel(track) }))
  }

  const syncTimelineScroll = (source: 'heads' | 'timeline') => {
    const heads = trackHeadsRef.current
    const timeline = timelineScrollRef.current
    if (!heads || !timeline) return
    if (source === 'heads' && timeline.scrollTop !== heads.scrollTop) timeline.scrollTop = heads.scrollTop
    if (source === 'timeline' && heads.scrollTop !== timeline.scrollTop) heads.scrollTop = timeline.scrollTop
  }

  const renderTimelineTrack = (track: TimelineTrack) => {
    if (track.type === 'video') return <div key={track.id} className="track video-track" data-track-id={track.id} data-track-type={track.type}>{clips.filter((clip) => clip.trackId === track.id).map((clip, index) => <button key={clip.id} className={`timeline-clip draggable ${selectedClip === clip.id ? 'selected' : ''}`} style={{left: clip.start * pxPerSecond, width: Math.max(clip.duration * pxPerSecond, 1), '--clip-color': clip.color} as React.CSSProperties} onPointerDown={(e) => beginDrag(e, 'video', clip.id, clip.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(clip.start)}}>{clip.transition !== 'none' && <i className="timeline-transition" title={t('transition')} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => {event.stopPropagation();setSelectedClip(clip.id);setVideoInspectorTab('transition');seek(clip.start + clip.transitionDuration * .45)}}>◇</i>}<div className="clip-resize-handle left" title={t('trimStart')} onPointerDown={(e) => beginStartResize(e, 'video', clip.id, clip.start, clip.duration, clip.offset)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/><div className="drag-grip">•••</div><div className="filmstrip">{Array.from({length: Math.min(500, Math.max(2, Math.ceil(clip.duration * zoom * 1.8)))}, (_, i) => <i key={i}/>)}</div><span>{clip.label}</span>{index === 0 && <em>100%</em>}<div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'video', clip.id, clip.duration, clip.sourceDuration - clip.offset)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
    if (track.type === 'text') return <div key={track.id} className="track text-track" data-track-id={track.id} data-track-type={track.type}>{textClips.filter((item) => item.trackId === track.id).map((item) => <button key={item.id} className={`text-clip draggable ${selectedTextClip === item.id ? 'selected' : ''}`} style={{left: item.start * pxPerSecond, width: Math.max(item.duration * pxPerSecond, 1)}} onPointerDown={(e) => beginDrag(e, 'text', item.id, item.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(item.start)}}><TextCursorInput size={13}/><span>{item.text || t('text')}</span><small>{item.duration.toFixed(1)}s</small><div className="drag-grip">•••</div><div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'text', item.id, item.duration, 3600)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
    if (track.type === 'sticker') return <div key={track.id} className="track sticker-track" data-track-id={track.id} data-track-type={track.type}>{stickerClips.filter((item) => item.trackId === track.id).map((item) => <button key={item.id} className={`sticker-clip draggable ${selectedStickerClip === item.id ? 'selected' : ''}`} style={{left: item.start * pxPerSecond, width: Math.max(item.duration * pxPerSecond, 1)}} onPointerDown={(e) => beginDrag(e, 'sticker', item.id, item.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(item.start)}}><img src={item.src} alt=""/><span>{item.name}</span><small>{item.duration.toFixed(1)}s</small><div className="drag-grip">•••</div><div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'sticker', item.id, item.duration, 3600)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
    if (track.type === 'caption') return <div key={track.id} className="track caption-track" data-track-id={track.id} data-track-type={track.type}>{captionClips.filter((item) => item.trackId === track.id).map((item) => <button key={item.id} className={`caption-clip draggable ${selectedCaptionClip === item.id ? 'selected' : ''}`} style={{left: item.start * pxPerSecond, width: Math.max(item.duration * pxPerSecond, 1)}} onPointerDown={(e) => beginDrag(e, 'caption', item.id, item.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(item.start)}}><Captions size={13}/><span>{item.text || t('captions')}</span><small>{item.duration.toFixed(1)}s</small><div className="drag-grip">•••</div><div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'caption', item.id, item.duration, 3600)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
    return <div key={track.id} className="track audio-track" data-track-id={track.id} data-track-type={track.type}>{audioClips.filter((clip) => clip.trackId === track.id).map((clip) => <button key={clip.id} className={`audio-clip draggable ${selectedAudioClip === clip.id ? 'selected' : ''}`} style={{left: clip.start * pxPerSecond, width: Math.max(clip.duration * pxPerSecond, 1)}} onPointerDown={(e) => beginDrag(e, 'audio', clip.id, clip.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(clip.start)}}><div className="clip-resize-handle left" title={t('trimStart')} onPointerDown={(e) => beginStartResize(e, 'audio', clip.id, clip.start, clip.duration, clip.offset)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/>{Array.from({length: Math.max(12, Math.ceil(clip.duration * 6))}, (_, i) => <i key={i} style={{height: `${18 + ((i * 17) % 70)}%`}}/>)}<span>{clip.label}</span><div className="drag-grip">•••</div><div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'audio', clip.id, clip.duration, clip.sourceDuration - clip.offset)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
  }

  const beginTextPosition = (event: ReactPointerEvent<HTMLDivElement>, clip: TextClip) => {
    event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId)
    textPositionRef.current = { id: clip.id, pointerX: event.clientX, pointerY: event.clientY, x: clip.x, y: clip.y }
    setSelectedTextClip(clip.id); setSelectedStickerClip(0); setSelectedClip(0); setSelectedAudioClip(0); setSelectedCaptionClip(0); setActiveTool('text')
  }
  const moveTextPosition = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = textPositionRef.current
    if (!drag) return
    const canvas = event.currentTarget.parentElement?.getBoundingClientRect()
    if (!canvas) return
    const x = Math.max(2, Math.min(98, drag.x + (event.clientX - drag.pointerX) / canvas.width * 100))
    const y = Math.max(4, Math.min(96, drag.y + (event.clientY - drag.pointerY) / canvas.height * 100))
    setTextClips((items) => items.map((item) => item.id === drag.id ? { ...item, x, y } : item))
  }
  const endTextPosition = () => { if (textPositionRef.current) { textPositionRef.current = null; setToast(t('moved', { item: t('text') })) } }

  const beginStickerPosition = (event: ReactPointerEvent<HTMLButtonElement>, clip: StickerClip) => {
    event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId)
    stickerPositionRef.current = { id: clip.id, pointerX: event.clientX, pointerY: event.clientY, x: clip.x, y: clip.y }
    setSelectedStickerClip(clip.id); setSelectedTextClip(0); setSelectedCaptionClip(0); setSelectedClip(0); setSelectedAudioClip(0); setActiveTool('stickers')
  }
  const moveStickerPosition = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = stickerPositionRef.current
    if (!drag) return
    const canvas = event.currentTarget.parentElement?.getBoundingClientRect()
    if (!canvas) return
    const x = Math.max(3, Math.min(97, drag.x + (event.clientX - drag.pointerX) / canvas.width * 100))
    const y = Math.max(5, Math.min(95, drag.y + (event.clientY - drag.pointerY) / canvas.height * 100))
    setStickerClips((items) => items.map((item) => item.id === drag.id ? { ...item, x, y } : item))
  }
  const endStickerPosition = () => { if (stickerPositionRef.current) { stickerPositionRef.current = null; setToast(t('moved', { item: t('stickers') })) } }

  const exportVideo = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const orderedVideoClips = clips.filter((item) => item.sourceUrl).sort((a, b) => a.start - b.start)
    if (!orderedVideoClips.length || !video || !canvas) return setToast(t('exportFirst'))
    setIsExporting(true)
    setToast(t('preparingVideo'))
    try {
      const loadVideoClip = async (clip: Clip) => {
        if (video.getAttribute('src') !== clip.sourceUrl) {
          video.pause()
          video.src = clip.sourceUrl
          video.load()
          await new Promise<void>((resolve, reject) => {
            const loaded = () => { cleanup(); resolve() }
            const failed = () => { cleanup(); reject(new Error('video-load-failed')) }
            const cleanup = () => { video.removeEventListener('loadeddata', loaded); video.removeEventListener('error', failed) }
            video.addEventListener('loadeddata', loaded)
            video.addEventListener('error', failed)
          })
        }
        const wanted = Math.max(0, clip.offset)
        if (Math.abs(video.currentTime - wanted) > .02) {
          video.currentTime = wanted
          await new Promise<void>((resolve) => video.addEventListener('seeked', () => resolve(), { once: true }))
        }
      }
      await loadVideoClip(orderedVideoClips[0])
      const ctx = canvas.getContext('2d')!
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const stream = canvas.captureStream(30)
      const mediaStreamVideo = video as HTMLVideoElement & { captureStream?: () => MediaStream }
      const mediaStreamAudio = audioRef.current as (HTMLAudioElement & { captureStream?: () => MediaStream }) | null
      if (audioClips.length > 0 && mediaStreamAudio?.captureStream) mediaStreamAudio.captureStream().getAudioTracks().forEach((track) => stream.addTrack(track))
      else mediaStreamVideo.captureStream?.().getAudioTracks().forEach((track) => stream.addTrack(track))
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
      const exportTransitionVideo = document.createElement('video')
      exportTransitionVideo.preload = 'auto'
      exportTransitionVideo.muted = true
      exportTransitionVideo.playbackRate = speed
      exportTransitionVideo.load()
      const chunks: Blob[] = []
      recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data)
      const finished = new Promise<void>((resolve) => { recorder.onstop = () => resolve() })
      video.muted = true
      recorder.start(250)
      const drawVideoLayer = (source: HTMLVideoElement, frame: VisualFrame) => {
        if (source.readyState < 2 || frame.opacity <= 0) return
        ctx.save()
        ctx.filter = filter
        ctx.globalAlpha = frame.opacity * videoOpacity / 100
        ctx.translate(canvas.width * (.5 + frame.x / 100), canvas.height * (.5 + frame.y / 100))
        ctx.scale(frame.scale, frame.scale)
        ctx.drawImage(source, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)
        ctx.restore()
      }
      const renderFrame = (exportTime: number, exportClip?: Clip) => {
        const exportPrevious = exportClip ? [...clips].filter((item) => item.trackId === exportClip.trackId && item.start < exportClip.start).sort((a, b) => b.start - a.start)[0] : undefined
        const adjacent = Boolean(exportClip && exportPrevious && Math.abs(exportPrevious.start + exportPrevious.duration - exportClip.start) < .11)
        const transition = exportClip && adjacent ? transitionFrame(exportClip.transition, exportClip.start, Math.min(exportClip.transitionDuration, exportClip.duration, exportPrevious!.duration), exportTime) : transitionFrame('none', 0, 1, 0)
        const videoFrame = exportClip ? combineFrames(animationFrame(exportClip.animation, exportClip.start, exportClip.duration, exportClip.animationDuration, exportTime), transition.current) : neutralFrame
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if (transition.active && exportClip && exportPrevious) {
          const transitionDuration = Math.min(exportClip.transitionDuration, exportClip.duration, exportPrevious.duration)
          const wanted = exportPrevious.offset + exportPrevious.duration - transitionDuration + (exportTime - exportClip.start)
          if (exportTransitionVideo.getAttribute('src') !== exportPrevious.sourceUrl) { exportTransitionVideo.src = exportPrevious.sourceUrl; exportTransitionVideo.load() }
          if (exportTransitionVideo.readyState >= 1) {
            if (Math.abs(exportTransitionVideo.currentTime - wanted) > .1) exportTransitionVideo.currentTime = Math.max(exportPrevious.offset, wanted)
            if (exportTransitionVideo.paused) void exportTransitionVideo.play().catch(() => undefined)
            drawVideoLayer(exportTransitionVideo, transition.previous)
          }
        } else exportTransitionVideo.pause()
        if (exportClip) drawVideoLayer(video, videoFrame)
        textClips.filter((item) => exportTime >= item.start && exportTime < item.start + item.duration).forEach((item) => {
          const frame = animationFrame(item.animation, item.start, item.duration, item.animationDuration, exportTime)
          const displayText = animatedText(item.text, item.animation, item.start, item.duration, item.animationDuration, exportTime)
          const fontSize = Math.max(16, item.fontSize * canvas.width / 720)
          const letterSpacing = item.letterSpacing * canvas.width / 720
          ctx.save()
          ctx.globalAlpha = item.opacity / 100 * frame.opacity
          ctx.font = `${item.bold ? 700 : 400} ${fontSize}px ${item.fontFamily}`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = item.color
          ctx.translate(canvas.width * (item.x + frame.x) / 100, canvas.height * (item.y + frame.y) / 100)
          ctx.scale(frame.scale, frame.scale)
          if (item.textEffect === 'background') {
            const textWidth = measureSpacedText(ctx, displayText, letterSpacing)
            const horizontalPadding = fontSize * .42
            const verticalPadding = fontSize * .2
            ctx.fillStyle = hexToRgba(item.backgroundColor, item.backgroundOpacity / 100)
            ctx.fillRect(-textWidth / 2 - horizontalPadding, -fontSize / 2 - verticalPadding, textWidth + horizontalPadding * 2, fontSize + verticalPadding * 2)
            ctx.fillStyle = item.color
          }
          if (item.textEffect === 'shadow') {
            ctx.shadowColor = item.effectColor; ctx.shadowBlur = fontSize * .18; ctx.shadowOffsetY = fontSize * .12
          }
          if (item.textEffect === 'glow' || item.textEffect === 'neon') {
            ctx.shadowColor = item.effectColor; ctx.shadowBlur = fontSize * (item.textEffect === 'neon' ? .55 : .38)
          }
          if (item.textEffect === 'outline' || item.textEffect === 'neon') {
            ctx.strokeStyle = item.strokeColor
            ctx.lineWidth = Math.max(1, item.strokeWidth * canvas.width / 720 * (item.textEffect === 'neon' ? .5 : 2))
            ctx.lineJoin = 'round'
            drawSpacedText(ctx, displayText, letterSpacing, 'stroke')
          }
          drawSpacedText(ctx, displayText, letterSpacing, 'fill')
          ctx.restore()
        })
        stickerClips.filter((item) => exportTime >= item.start && exportTime < item.start + item.duration).forEach((item) => {
          const image = stickerImagesRef.current.get(item.src)
          if (!image?.complete || !image.naturalWidth) return
          const size = Math.min(canvas.width, canvas.height) * item.size / 100
          const frame = animationFrame(item.animation, item.start, item.duration, item.animationDuration, exportTime)
          ctx.save()
          ctx.globalAlpha = item.opacity / 100 * frame.opacity
          ctx.translate(canvas.width * (item.x + frame.x) / 100, canvas.height * (item.y + frame.y) / 100)
          ctx.rotate(item.rotation * Math.PI / 180)
          ctx.scale(frame.scale, frame.scale)
          ctx.shadowColor = 'rgba(0,0,0,.25)'
          ctx.shadowBlur = Math.max(2, size * .04)
          ctx.drawImage(image, -size / 2, -size / 2, size, size)
          ctx.restore()
        })
        captionClips.filter((item) => exportTime >= item.start && exportTime < item.start + item.duration).forEach((item) => {
          const captionText = item.text.replace(/\s*\n\s*/g, ' ')
          const fontSize = Math.max(18, 30 * canvas.width / 1280)
          ctx.globalAlpha = 1
          ctx.font = `600 ${fontSize}px sans-serif`
          ctx.textAlign = 'center'
          ctx.lineJoin = 'round'
          ctx.lineWidth = Math.max(5, fontSize * .22)
          ctx.strokeStyle = 'rgba(0,0,0,.78)'
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = 'rgba(0,0,0,.5)'
          ctx.shadowBlur = 6
          ctx.strokeText(captionText, canvas.width / 2, canvas.height * .88)
          ctx.fillText(captionText, canvas.width / 2, canvas.height * .88)
        })
      }
      let timelineCursor = 0
      for (const clip of orderedVideoClips) {
        if (clip.start > timelineCursor) {
          const gapStart = performance.now()
          await new Promise<void>((resolve) => {
            const drawGap = () => {
              const exportTime = timelineCursor + (performance.now() - gapStart) / 1000 * speed
              renderFrame(Math.min(clip.start, exportTime))
              if (exportTime >= clip.start) resolve()
              else requestAnimationFrame(drawGap)
            }
            drawGap()
          })
        }
        await loadVideoClip(clip)
        video.playbackRate = speed
        video.muted = true
        await video.play()
        await new Promise<void>((resolve) => {
          const drawClip = () => {
            const exportTime = Math.min(clip.start + clip.duration, clip.start + video.currentTime - clip.offset)
            renderFrame(exportTime, clip)
            setCurrentTime(exportTime)
            if (video.ended || video.currentTime >= clip.offset + clip.duration - .02) resolve()
            else requestAnimationFrame(drawClip)
          }
          drawClip()
        })
        video.pause()
        timelineCursor = clip.start + clip.duration
      }
      exportTransitionVideo.pause()
      recorder.stop(); await finished
      const blob = new Blob(chunks, { type: 'video/webm' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob); link.download = `${fileName.replace(/\.[^.]+$/, '')}-lumacut.webm`; link.click()
      URL.revokeObjectURL(link.href)
      setToast(t('exportSuccess'))
      video.muted = isCurrentVideoDetached
    } catch { setToast(t('exportFailed')) }
    finally { setIsExporting(false) }
  }

  return (
    <main className="app-shell" onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop}>
      {isDragging && <div className="drop-overlay"><Upload size={34} /><strong>{t('dropTitle')}</strong><span>{t('dropDescription')}</span></div>}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><img src="./lumacut-icon.png" alt="" /></div><strong>LumaCut</strong></div>
        <button className="project-name"><span className="save-dot" />{t('untitledProject')} <ChevronDown size={14} /></button>
        <div className="top-actions"><button className="icon-button"><Undo2 size={17} /></button><button className="icon-button muted"><Redo2 size={17} /></button><button className="export-button" onClick={exportVideo} disabled={isExporting}><Download size={16} />{isExporting ? t('exporting') : t('export')}</button><div className="language-switcher"><button className="language-button" onClick={() => setLanguageMenuOpen((open) => !open)} aria-label={t('language')} aria-expanded={languageMenuOpen}><Globe2 size={15}/><span>{languageOptions.find((option) => option.code === language)?.short}</span><ChevronDown size={12}/></button>{languageMenuOpen && <div className="language-menu" role="menu">{languageOptions.map((option) => <button key={option.code} className={language === option.code ? 'active' : ''} onClick={() => {setLanguage(option.code);setLanguageMenuOpen(false)}} role="menuitem"><span>{option.label}</span>{language === option.code && <Check size={13}/>}</button>)}</div>}</div><button className="icon-button"><Menu size={18} /></button></div>
      </header>

      <section className="workspace">
        <nav className="tool-rail">{toolItems.map(({ id, labelKey, icon: Icon }) => <button key={id} className={activeTool === id ? 'active' : ''} onClick={() => setActiveTool(id)}><Icon size={20} strokeWidth={1.8} /><span>{t(labelKey)}</span></button>)}</nav>
        <aside className="asset-panel">
          <div className="panel-heading"><div><span>{t('myLibrary')}</span><h2>{t(toolItems.find((item) => item.id === activeTool)?.labelKey ?? 'media')}</h2></div><button className="icon-button"><X size={16} /></button></div>
          {activeTool === 'media' && <>
            <button className="import-button" onClick={() => fileInput.current?.click()}><Plus size={17} />{t('importMedia')}</button>
            <input ref={fileInput} type="file" accept="video/*" multiple onChange={(event: ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files ?? []); event.currentTarget.value = ''; void importFiles(files) }} hidden />
            <p className="section-label">{t('inProject')}</p>
            <div className="media-list">{videoAssets.length ? videoAssets.map((asset, index) => <button key={asset.id} className="media-card" onClick={() => { const clip = clips.find((item) => item.sourceUrl === asset.url); if (clip) { setSelectedClip(clip.id); seek(clip.start) } }}><div className="media-thumb"><div className="thumb-sun"/><div className="thumb-mountain"/><b>{index + 1}</b><CirclePlay size={24}/></div><div className="media-meta"><strong>{asset.name}</strong><span>{formatTime(asset.duration).slice(0, 5)} · {t('yourFile')}</span></div></button>) : <button className="media-card" onClick={() => fileInput.current?.click()}><div className="media-thumb"><div className="thumb-sun"/><div className="thumb-mountain"/><CirclePlay size={24}/></div><div className="media-meta"><strong>{fileName}</strong><span>{formatTime(duration).slice(0, 5)} · {t('sample')}</span></div></button>}</div>
            <button className={`extract-audio-button ${isSelectedVideoDetached ? 'done' : ''}`} onClick={detachAudioFromVideo} disabled={!selectedVideoSource || isSelectedVideoDetached}><AudioLines size={17}/>{isSelectedVideoDetached ? t('detachedDone') : t('detachAudio')}</button>
            <div className="media-card empty"><FolderOpen size={22} /><span>{t('dropVideo')}</span></div>
          </>}
          {activeTool === 'text' && <div className="text-tools">
            <button className="import-button" onClick={() => addText()}><Plus size={17} />{t('addText')}</button>
            <p className="section-label">{t('textTemplates')}</p>
            <div className="text-template-grid">{textTemplates.map((template) => <button key={template.labelKey} className={`text-template-card ${template.className}`} onClick={() => addText(t(template.textKey), template.style)} title={t(template.labelKey)}><span>{template.sample}</span><small>{t(template.labelKey)}</small></button>)}</div>
            <p className="section-label">{t('textLayers')}</p>
            <div className="text-layer-list">{textClips.map((item) => <button key={item.id} className={selectedTextClip === item.id ? 'active' : ''} onClick={() => {setSelectedTextClip(item.id);setSelectedStickerClip(0);setSelectedClip(0);setSelectedAudioClip(0);setSelectedCaptionClip(0)}}><TextCursorInput size={14}/><span>{item.text}</span><small>{item.duration.toFixed(1)}s</small></button>)}</div>
          </div>}
          {activeTool === 'audio' && <div className="audio-library">
            <button className="import-button" onClick={() => audioInput.current?.click()}><Plus size={17}/>{t('importAudio')}</button>
            <input ref={audioInput} type="file" accept="audio/*" onChange={(event) => importAudio(event.target.files?.[0])} hidden/>
            <p className="section-label">{t('audioInProject')}</p>
            <button className="audio-card" onClick={() => audioInput.current?.click()}><AudioLines size={22}/><div><strong>{audioUrl ? audioName : t('clickChooseAudio')}</strong><span>{audioUrl ? t('readyTimeline') : t('clickChooseAudio')}</span></div></button>
            <div className="audio-tip"><MousePointer2 size={16}/><span>{t('audioTip')}</span></div>
            <button className={`record-button ${isRecording ? 'recording' : ''}`} onClick={() => void toggleRecording()}>{isRecording ? <Square size={13} fill="currentColor"/> : <Mic2 size={15}/>} {isRecording ? `${t('stopRecording')} · ${Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:${Math.floor(recordingSeconds % 60).toString().padStart(2, '0')}` : t('recordAudio')}</button>
          </div>}
          {activeTool === 'captions' && <div className="caption-library">
            <textarea value={captionDraft} onChange={(event) => setCaptionDraft(event.target.value)} placeholder={t('captionPlaceholder')}/>
            <button className="import-button" onClick={() => addCaption()}><Plus size={16}/>{t('addAtPlayhead')}</button>
            <button className="srt-button" onClick={() => captionInput.current?.click()}><Captions size={15}/>{t('importSrt')}</button>
            <input ref={captionInput} type="file" accept=".srt,text/plain" onChange={(event) => void importSrt(event.target.files?.[0])} hidden/>
            <p className="section-label">{t('captionsInProject')}</p>
            <div className="caption-list">{captionClips.length ? captionClips.map((item) => <button key={item.id} className={selectedCaptionClip === item.id ? 'active' : ''} onClick={() => {setSelectedCaptionClip(item.id);setSelectedStickerClip(0);setSelectedTextClip(0);setSelectedClip(0);setSelectedAudioClip(0)}}><span>{item.text}</span><small>{formatTime(item.start).slice(0,5)} · {item.duration.toFixed(1)}s</small></button>) : <div className="caption-empty">{t('noCaptions')}</div>}</div>
          </div>}
          {activeTool === 'effects' && <div className="effect-grid">{(['film','lightLeak','blur','grain','VHS','soft'] as const).map((name, i) => <button key={name} style={{'--hue': `${195 + i * 22}`} as React.CSSProperties}><WandSparkles size={18}/><span>{name === 'VHS' ? name : t(name)}</span></button>)}</div>}
          {activeTool === 'stickers' && <div className="sticker-library">
            <input value={stickerSearch} onChange={(event) => setStickerSearch(event.target.value)} placeholder={t('searchStickers')}/>
            <div className="sticker-category-tabs"><button className={stickerCategory === 'all' ? 'active' : ''} onClick={() => setStickerCategory('all')}>{t('allAssets')}</button><button className={stickerCategory === 'sticker' ? 'active' : ''} onClick={() => setStickerCategory('sticker')}>{t('stillStickers')}</button><button className={stickerCategory === 'gif' ? 'active' : ''} onClick={() => setStickerCategory('gif')}>{t('gifMemes')}</button></div>
            <div className="sticker-grid">{filteredStickerAssets.map((asset) => <button key={asset.src} className={asset.kind === 'gif' ? 'gif-asset' : ''} onClick={() => addSticker(asset)} title={asset.name}><img src={asset.src} alt=""/>{asset.kind === 'gif' && <b>GIF</b>}<span>{asset.name}</span></button>)}</div>
            {!filteredStickerAssets.length && <div className="caption-empty">{t('noStickers')}</div>}
            <a className="sticker-credit" href="https://openmoji.org/" target="_blank" rel="noreferrer">{t('stickerCredit')}</a>
            <p className="sticker-credit meme-credit">{t('memeGifCredit')}</p>
          </div>}
        </aside>

        <section className="editor-stage"><div className="preview-wrap">
          <div className="preview-canvas">
            {currentTransition.active && previousVideoClip && <div className="preview-media-layer transition-outgoing" style={{filter, opacity: currentTransition.previous.opacity * videoOpacity / 100, transform: `translate(${currentTransition.previous.x}%, ${currentTransition.previous.y}%) scale(${currentTransition.previous.scale})`}}>{previousVideoClip.sourceUrl ? <video ref={transitionVideoRef} src={previousVideoClip.sourceUrl} muted playsInline/> : <div className="demo-scene"><div className="demo-sky"/><div className="demo-sun"/><div className="demo-ridge ridge-one"/><div className="demo-ridge ridge-two"/><span className="demo-tag">TRAVEL FILM</span></div>}</div>}
            <div className="preview-media-layer" style={{filter, opacity: videoMotion.opacity * videoOpacity / 100, transform: `translate(${videoMotion.x}%, ${videoMotion.y}%) scale(${videoMotion.scale})`}}>{previewVideoUrl ? <video ref={videoRef} src={previewVideoUrl} muted={isCurrentVideoDetached} onLoadedMetadata={(event) => { const clip = currentVideoClip; if (!clip) return; event.currentTarget.currentTime = Math.max(0, clip.offset + currentTime - clip.start); if (isPlaying) void event.currentTarget.play().catch(() => undefined) }} onTimeUpdate={(event) => { const clip = currentVideoClip; if (!clip || event.currentTarget.getAttribute('src') !== clip.sourceUrl) return; const mapped = clip.start + event.currentTarget.currentTime - clip.offset; if (mapped >= clip.start + clip.duration - .03) { const next = [...clips].filter((item) => item.trackId === clip.trackId && item.start >= clip.start + clip.duration - .1).sort((a, b) => a.start - b.start)[0]; if (next && Math.abs(next.start - (clip.start + clip.duration)) < .11) { setCurrentTime(next.start); if (next.sourceUrl === clip.sourceUrl) event.currentTarget.currentTime = next.offset } else { event.currentTarget.pause(); setIsPlaying(false); setCurrentTime(clip.start + clip.duration) } } else setCurrentTime(Math.max(clip.start, mapped)) }} onPlay={() => setIsPlaying(true)} onEnded={() => { const clip = currentVideoClip; const next = clip ? [...clips].filter((item) => item.trackId === clip.trackId && item.start >= clip.start + clip.duration - .1).sort((a, b) => a.start - b.start)[0] : undefined; if (clip && next && Math.abs(next.start - (clip.start + clip.duration)) < .11) { setCurrentTime(next.start); setIsPlaying(true) } else setIsPlaying(false) }} /> : <div className="demo-scene"><div className="demo-sky"/><div className="demo-sun"/><div className="demo-ridge ridge-one"/><div className="demo-ridge ridge-two"/><span className="demo-tag">TRAVEL FILM</span></div>}</div>
            {textClips.filter((item) => currentTime >= item.start && currentTime < item.start + item.duration).map((item) => { const motion = animationFrame(item.animation, item.start, item.duration, item.animationDuration, currentTime); const isTyping = item.animation === 'typewriter' && currentTime < item.start + Math.min(item.animationDuration, item.duration); return <div key={item.id} className={`video-text-layer ${selectedTextClip === item.id ? 'selected' : ''}`} style={{left: `calc(${item.x}% + ${motion.x}%)`, top: `calc(${item.y}% + ${motion.y}%)`, fontSize: item.fontSize, fontFamily: item.fontFamily, color: item.color, opacity: item.opacity / 100 * motion.opacity, fontWeight: item.bold ? 700 : 400, transform: `translate(-50%, -50%) scale(${motion.scale})`, ...textEffectStyle(item)}} onPointerDown={(e) => beginTextPosition(e, item)} onPointerMove={moveTextPosition} onPointerUp={endTextPosition} onPointerCancel={endTextPosition}><span className={isTyping ? 'typewriter-active' : ''}>{animatedText(item.text, item.animation, item.start, item.duration, item.animationDuration, currentTime)}</span>{selectedTextClip === item.id && <><i className="text-handle nw"/><i className="text-handle ne"/><i className="text-handle sw"/><i className="text-handle se"/></>}</div>})}
            {stickerClips.filter((item) => currentTime >= item.start && currentTime < item.start + item.duration).map((item) => { const motion = animationFrame(item.animation, item.start, item.duration, item.animationDuration, currentTime); return <button key={item.id} className={`video-sticker-layer ${selectedStickerClip === item.id ? 'selected' : ''}`} style={{left: `calc(${item.x}% + ${motion.x}%)`, top: `calc(${item.y}% + ${motion.y}%)`, width: `${item.size}%`, opacity: item.opacity / 100 * motion.opacity, transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${motion.scale})`}} onPointerDown={(event) => beginStickerPosition(event, item)} onPointerMove={moveStickerPosition} onPointerUp={endStickerPosition} onPointerCancel={endStickerPosition}><img src={item.src} alt={item.name}/></button>})}
            {captionClips.filter((item) => currentTime >= item.start && currentTime < item.start + item.duration).map((item) => <button key={item.id} className={`video-caption-layer ${selectedCaptionClip === item.id ? 'selected' : ''}`} onClick={(event) => {event.stopPropagation();setSelectedCaptionClip(item.id);setSelectedStickerClip(0);setSelectedTextClip(0);setSelectedClip(0);setSelectedAudioClip(0);setActiveTool('captions')}}>{item.text}</button>)}
          </div>
          <div className="preview-controls"><span className="timecode">{formatTime(currentTime)} <i>/</i> {formatTime(projectDuration)}</span><button onClick={() => seek(currentTime - 5)}><RotateCcw size={17}/></button><button className="play-button" onClick={() => void togglePlayback()}>{isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}</button><button onClick={() => seek(Math.min(projectDuration, currentTime + 5))}><RotateCcw className="forward" size={17}/></button><div className="preview-right"><button><Volume2 size={17}/></button><button><Settings2 size={17}/></button><button className="fit-button">{t('fit')} <ChevronDown size={13}/></button></div></div>
        </div></section>

        <aside className="property-panel">
          {activeStickerClip ? <>
            <div className="properties-tabs"><button className={stickerInspectorTab === 'sticker' ? 'active' : ''} onClick={() => setStickerInspectorTab('sticker')}>{t('stickers')}</button><button className={stickerInspectorTab === 'animation' ? 'active' : ''} onClick={() => setStickerInspectorTab('animation')}>{t('animation')}</button></div>
            {stickerInspectorTab === 'animation' ? renderAnimationEditor(activeStickerClip, updateSticker, activeStickerClip.start, activeStickerClip.duration) : <>
            <div className="property-section sticker-inspector"><h3><Sticker size={16}/>{activeStickerClip.name}</h3><div className="sticker-inspector-preview"><img src={activeStickerClip.src} alt={activeStickerClip.name}/></div></div>
            <div className="property-section"><h3><SlidersHorizontal size={16}/>{t('format')}</h3><label>{t('size')} <span>{activeStickerClip.size}%</span><input type="range" min="8" max="60" value={activeStickerClip.size} onChange={(event) => updateSticker({size: Number(event.target.value)})}/></label><label>{t('rotate')} <span>{activeStickerClip.rotation}°</span><input type="range" min="-180" max="180" value={activeStickerClip.rotation} onChange={(event) => updateSticker({rotation: Number(event.target.value)})}/></label><label>{t('opacity')} <span>{activeStickerClip.opacity}%</span><input type="range" min="10" max="100" value={activeStickerClip.opacity} onChange={(event) => updateSticker({opacity: Number(event.target.value)})}/></label></div>
            <div className="property-section"><h3><MousePointer2 size={16}/>{t('position')}</h3><label>{t('horizontal')} <span>{Math.round(activeStickerClip.x)}%</span><input type="range" min="0" max="100" value={activeStickerClip.x} onChange={(event) => updateSticker({x: Number(event.target.value)})}/></label><label>{t('vertical')} <span>{Math.round(activeStickerClip.y)}%</span><input type="range" min="0" max="100" value={activeStickerClip.y} onChange={(event) => updateSticker({y: Number(event.target.value)})}/></label></div>
            <div className="property-section text-timing"><h3><Gauge size={16}/>{t('displayTime')}</h3><label>{t('start')}<input type="number" min="0" step="0.1" value={activeStickerClip.start} onChange={(event) => updateSticker({start: Math.max(0, Number(event.target.value))})}/><span>{t('seconds')}</span></label><label>{t('duration')}<input type="number" min="0.2" step="0.1" value={activeStickerClip.duration} onChange={(event) => updateSticker({duration: Math.max(.2, Number(event.target.value))})}/><span>{t('seconds')}</span></label></div>
            </>}
            <button className="delete-text-button" onClick={deleteClip}><Trash2 size={14}/>{t('deleteSticker')}</button>
          </> : activeCaptionClip ? <>
            <div className="properties-tabs"><button className={captionInspectorTab === 'caption' ? 'active' : ''} onClick={() => setCaptionInspectorTab('caption')}>{t('captions')}</button><button className={captionInspectorTab === 'format' ? 'active' : ''} onClick={() => setCaptionInspectorTab('format')}>{t('format')}</button></div>
            {captionInspectorTab === 'caption' ? <div className="property-section caption-inspector"><h3><Captions size={16}/>{t('editCaption')}</h3><textarea value={activeCaptionClip.text} onChange={(event) => updateCaption({text: event.target.value})}/></div> : <div className="property-section text-timing"><h3><Gauge size={16}/>{t('displayTime')}</h3><label>{t('start')}<input type="number" min="0" step="0.1" value={activeCaptionClip.start} onChange={(event) => updateCaption({start: Math.max(0, Number(event.target.value))})}/><span>{t('seconds')}</span></label><label>{t('duration')}<input type="number" min="0.2" step="0.1" value={activeCaptionClip.duration} onChange={(event) => updateCaption({duration: Math.max(.2, Number(event.target.value))})}/><span>{t('seconds')}</span></label></div>}
            <button className="delete-text-button" onClick={deleteClip}><Trash2 size={14}/>{t('deleteCaption')}</button>
          </> : activeTextClip ? <>
            <div className="properties-tabs text-tabs"><button className={textInspectorTab === 'text' ? 'active' : ''} onClick={() => setTextInspectorTab('text')}>{t('text')}</button><button className={textInspectorTab === 'style' ? 'active' : ''} onClick={() => setTextInspectorTab('style')}>{t('style')}</button><button className={textInspectorTab === 'effects' ? 'active' : ''} onClick={() => setTextInspectorTab('effects')}>{t('textEffects')}</button><button className={textInspectorTab === 'animation' ? 'active' : ''} onClick={() => setTextInspectorTab('animation')}>{t('animation')}</button></div>
            {textInspectorTab === 'text' ? <div className="property-section text-inspector"><h3><TextCursorInput size={16}/>{t('editText')}</h3><textarea value={activeTextClip.text} onChange={(e) => updateText({text: e.target.value})}/><div className="text-style-row"><button className={activeTextClip.bold ? 'active' : ''} onClick={() => updateText({bold: !activeTextClip.bold})}>B</button><label className="color-pick"><input type="color" value={activeTextClip.color} onChange={(e) => updateText({color: e.target.value})}/><span style={{background: activeTextClip.color}}/></label></div></div> : textInspectorTab === 'style' ? <>
            <div className="property-section"><h3><SlidersHorizontal size={16}/>{t('format')}</h3><label className="font-select-label">{t('font')}<select value={activeTextClip.fontFamily} onChange={(e) => updateText({fontFamily: e.target.value})} aria-label={t('font')}>{fontOptions.map((font) => <option key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.label}</option>)}</select></label><label>{t('size')} <span>{activeTextClip.fontSize}px</span><input type="range" min="14" max="96" value={activeTextClip.fontSize} onChange={(e) => updateText({fontSize: Number(e.target.value)})}/></label><label>{t('opacity')} <span>{activeTextClip.opacity}%</span><input type="range" min="10" max="100" value={activeTextClip.opacity} onChange={(e) => updateText({opacity: Number(e.target.value)})}/></label></div>
            <div className="property-section"><h3><MousePointer2 size={16}/>{t('position')}</h3><label>{t('horizontal')} <span>{Math.round(activeTextClip.x)}%</span><input type="range" min="0" max="100" value={activeTextClip.x} onChange={(e) => updateText({x: Number(e.target.value)})}/></label><label>{t('vertical')} <span>{Math.round(activeTextClip.y)}%</span><input type="range" min="0" max="100" value={activeTextClip.y} onChange={(e) => updateText({y: Number(e.target.value)})}/></label></div>
            <div className="property-section text-timing"><h3><Gauge size={16}/>{t('displayTime')}</h3><label>{t('start')}<input type="number" min="0" step="0.1" value={activeTextClip.start} onChange={(e) => updateText({start: Math.max(0, Number(e.target.value))})}/><span>{t('seconds')}</span></label><label>{t('duration')}<input type="number" min="0.2" step="0.1" value={activeTextClip.duration} onChange={(e) => updateText({duration: Math.max(.2, Number(e.target.value))})}/><span>{t('seconds')}</span></label></div>
            </> : textInspectorTab === 'effects' ? <>
            <div className="property-section"><h3><Sparkles size={16}/>{t('textEffects')}</h3><div className="text-effect-grid">{textEffectOptions.map((effect) => <button key={effect.value} className={activeTextClip.textEffect === effect.value ? 'active' : ''} onClick={() => updateText({textEffect: effect.value})}><span className={`effect-sample effect-${effect.value}`}>Aa</span><small>{t(effect.labelKey)}</small></button>)}</div></div>
            <div className="property-section text-effect-controls"><h3><SlidersHorizontal size={16}/>{t('effectSettings')}</h3><label>{t('letterSpacing')} <span>{activeTextClip.letterSpacing}px</span><input type="range" min="-2" max="12" step="1" value={activeTextClip.letterSpacing} onChange={(e) => updateText({letterSpacing: Number(e.target.value)})}/></label>
            {(activeTextClip.textEffect === 'outline' || activeTextClip.textEffect === 'neon') && <><label>{t('outlineWidth')} <span>{activeTextClip.strokeWidth}px</span><input type="range" min="1" max="10" step="1" value={activeTextClip.strokeWidth} onChange={(e) => updateText({strokeWidth: Number(e.target.value)})}/></label><label className="effect-color-row">{t('outlineColor')}<input type="color" value={activeTextClip.strokeColor} onChange={(e) => updateText({strokeColor: e.target.value})}/></label></>}
            {(activeTextClip.textEffect === 'shadow' || activeTextClip.textEffect === 'glow' || activeTextClip.textEffect === 'neon') && <label className="effect-color-row">{t('effectColor')}<input type="color" value={activeTextClip.effectColor} onChange={(e) => updateText({effectColor: e.target.value})}/></label>}
            {activeTextClip.textEffect === 'background' && <><label className="effect-color-row">{t('backgroundColor')}<input type="color" value={activeTextClip.backgroundColor} onChange={(e) => updateText({backgroundColor: e.target.value})}/></label><label>{t('backgroundOpacity')} <span>{activeTextClip.backgroundOpacity}%</span><input type="range" min="0" max="100" value={activeTextClip.backgroundOpacity} onChange={(e) => updateText({backgroundOpacity: Number(e.target.value)})}/></label></>}
            {activeTextClip.textEffect === 'none' && <p className="effect-help">{t('effectHint')}</p>}</div>
            </> : renderAnimationEditor(activeTextClip, updateText, activeTextClip.start, activeTextClip.duration, true)}
            <button className="delete-text-button" onClick={deleteClip}><Trash2 size={14}/>{t('deleteText')}</button>
          </> : <>
            <div className="properties-tabs video-tabs"><button className={videoInspectorTab === 'video' ? 'active' : ''} onClick={() => setVideoInspectorTab('video')}>{t('video')}</button><button className={videoInspectorTab === 'animation' ? 'active' : ''} onClick={() => setVideoInspectorTab('animation')}>{t('animation')}</button><button className={videoInspectorTab === 'transition' ? 'active' : ''} onClick={() => setVideoInspectorTab('transition')}>{t('transition')}</button><button className={videoInspectorTab === 'adjust' ? 'active' : ''} onClick={() => setVideoInspectorTab('adjust')}>{t('adjust')}</button></div>
            {videoInspectorTab === 'video' ? <>
            <div className="property-section"><h3><SlidersHorizontal size={16}/>{t('basic')}</h3><label>{t('opacity')} <span>{videoOpacity}%</span><input type="range" min="0" max="100" value={videoOpacity} onChange={(event) => setVideoOpacity(Number(event.target.value))}/></label><div className="toggle-row"><span>{t('stabilize')}</span><button className="toggle"><i/></button></div></div>
            <div className="property-section"><h3><Gauge size={16}/>{t('speed')} <span>{speed.toFixed(1)}x</span></h3><input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}/><div className="range-labels"><span>0.5x</span><span>1x</span><span>2x</span></div></div>
            <div className="property-section"><h3><Volume2 size={16}/>{t('volume')} <span>{volume}%</span></h3><input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))}/></div>
            </> : videoInspectorTab === 'animation' ? activeClip ? renderAnimationEditor(activeClip, updateVideoClip, activeClip.start, activeClip.duration) : <div className="caption-empty inspector-empty">{t('selectClipForAnimation')}</div> : videoInspectorTab === 'transition' ? activeClip ? renderTransitionEditor(activeClip) : <div className="caption-empty inspector-empty">{t('selectClipForTransition')}</div> : <>
            <div className="property-section"><h3><WandSparkles size={16}/>{t('colorAdjust')}</h3>{([['brightness', brightness, setBrightness], ['contrast', contrast, setContrast], ['saturation', saturation, setSaturation]] as const).map(([label, value, setter]) => <label key={label}>{t(label)}<span>{value > 0 ? '+' : ''}{value}</span><input type="range" min="-50" max="50" value={value} onChange={(e) => setter(Number(e.target.value))}/></label>)}</div>
            <button className="reset-button" onClick={() => {setBrightness(0);setContrast(0);setSaturation(0)}}>{t('reset')}</button>
            </>}
          </>}
        </aside>
      </section>

      <section className="timeline-panel">
        <div className="timeline-toolbar"><div><button className="tool-active"><MousePointer2 size={16}/></button><button onClick={splitClip} title={t('splitClip')}><Scissors size={16}/></button><button onClick={deleteClip} title={t('deleteItem')}><Trash2 size={16}/></button><span className="divider"/><button onClick={() => addText()} title={t('addText')}><TextCursorInput size={16}/></button><button onClick={() => setActiveTool('stickers')} title={t('openStickers')}><Sticker size={16}/></button><button><Crop size={16}/></button><span className="divider"/><div className="optional-track-buttons">{optionalTrackItems.map(({type, labelKey, icon: Icon}) => <button key={type} onClick={() => addTimelineTrack(type)} title={t('addTrack', {track: t(labelKey)})} aria-label={t('addTrack', {track: t(labelKey)})}><Icon size={15}/><Plus className="track-plus" size={9}/></button>)}</div></div><div className="timeline-zoom"><button onClick={() => applyTimelineZoom(zoom / 1.25)} title={t('zoomOut')}><ZoomOut size={15}/></button><div className="timeline-zoom-scrubber" title={t('zoomHelp')} onPointerDown={beginZoomDrag} onPointerMove={moveZoomDrag} onPointerUp={endZoomDrag} onPointerCancel={endZoomDrag}><span/><i/></div><label><input className="zoom-percent-input" type="number" min="0.01" step="1" value={zoomPercentInput} onChange={(event) => {const value = event.target.value; setZoomPercentInput(value); const parsed = Number(value); if (value && Number.isFinite(parsed) && parsed > 0) setZoom(Math.min(10000, Math.max(.0001, parsed / 100)))}} onBlur={commitZoomPercent} onKeyDown={(event) => {if (event.key === 'Enter') event.currentTarget.blur()}} aria-label={t('zoomPercent')}/><span>%</span></label><button onClick={() => applyTimelineZoom(zoom * 1.25)} title={t('zoomIn')}><ZoomIn size={15}/></button></div></div>
        <div className="timeline-body"><div className="track-heads" ref={trackHeadsRef} onScroll={() => syncTimelineScroll('heads')}><div className="ruler-spacer"/>{tracks.map((track) => { const Icon = track.type === 'video' ? Film : track.type === 'text' ? TextCursorInput : track.type === 'sticker' ? Sticker : track.type === 'caption' ? Captions : Music2; const canDelete = track.type === 'text' || track.type === 'sticker' || track.type === 'caption' || tracks.filter((item) => item.type === track.type).length > 1; const label = trackDisplayLabel(track); return <div key={track.id} className="track-head-row"><Icon size={15}/><span>{label}</span><div className="track-actions"><button onClick={() => addTimelineTrack(track.type)} title={t('addTrack', {track: label})}><Plus size={13}/></button><button disabled={!canDelete} onClick={() => deleteTimelineTrack(track)} title={t('deleteTrack', {track: label})}><Trash2 size={12}/></button></div></div>})}</div>
          <div className="timeline-scroll" ref={timelineScrollRef} onScroll={() => syncTimelineScroll('timeline')}><div className="timeline-content" style={{ width: timelineWidth, height: 25 + tracks.length * 64 }} onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); seek((e.clientX - rect.left) / pxPerSecond) }}>
            <div className="ruler">{Array.from({length: rulerTickCount}, (_, i) => {const time = i * rulerStep; return <span key={i} style={{left: time * pxPerSecond}}>{rulerStep < .1 ? `${time.toFixed(3)}s` : rulerStep < 1 ? `${time.toFixed(1)}s` : formatTime(time).slice(0,5)}</span>})}</div><div className="playhead" style={{left: currentTime * pxPerSecond}}><i/><b/></div>
            {tracks.map(renderTimelineTrack)}
          </div></div>
        </div>
      </section>
      <audio ref={audioRef} src={audioUrl || undefined} onTimeUpdate={(event) => { if (!videoUrl) { const clip = audioClips.find((item) => currentTime >= item.start && currentTime < item.start + item.duration); if (clip) setCurrentTime(clip.start + event.currentTarget.currentTime - clip.offset) } }} onEnded={() => !videoUrl && setIsPlaying(false)} hidden/>
      <canvas ref={canvasRef} hidden />
    </main>
  )
}

export default App
