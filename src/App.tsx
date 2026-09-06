import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, DragEvent, PointerEvent as ReactPointerEvent } from 'react'
import {
  AudioLines, Captions, Check, ChevronDown, ChevronLeft, ChevronRight, CirclePlay, Crop, Diamond, Download,
  Film, FolderOpen, Gauge, Globe2, Menu, Mic2, MousePointer2,
  Magnet, Music2, Pause, Play, Plus, Redo2, RotateCcw, Save, Scissors, Settings2, Square,
  SlidersHorizontal, Sparkles, Sticker, TextCursorInput,
  Trash2, Undo2, Upload, Volume2, VolumeX, WandSparkles, X, ZoomIn, ZoomOut,
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
type VideoEffectPreset = 'none' | 'film' | 'lightLeak' | 'blur' | 'grain' | 'VHS' | 'soft'
type VideoEffectSettings = { videoEffect: VideoEffectPreset; effectIntensity: number }
type TimelineTrack = { id: string; type: TrackType; label: string }
type MediaKind = 'video' | 'image'
type MediaTransform = { scale: number; scaleX: number; scaleY: number; positionX: number; positionY: number; cropLeft: number; cropRight: number; cropTop: number; cropBottom: number }
type PositionKeyframe = { time: number; x: number; y: number }
type MediaFit = 'fit' | 'fill'
type Clip = { id: number; trackId: string; label: string; start: number; duration: number; offset: number; sourceDuration: number; sourceUrl: string; sourcePath?: string; embeddedSource?: string; color: string; mediaType: MediaKind; mediaFit: MediaFit; sourceWidth: number; sourceHeight: number; positionKeyframes: PositionKeyframe[] } & MediaTransform & AnimationSettings & TransitionSettings & VideoEffectSettings
type VideoAsset = { id: number; name: string; url: string; duration: number; sourcePath?: string; embeddedSource?: string; mediaType: MediaKind; width: number; height: number }
type AudioClip = { id: number; trackId: string; label: string; start: number; duration: number; offset: number; sourceDuration: number; sourceUrl: string; sourcePath?: string; embeddedSource?: string; volume: number; fadeIn: number; fadeOut: number }
type TextClip = { id: number; trackId: string; text: string; start: number; duration: number; x: number; y: number; fontSize: number; fontFamily: string; color: string; opacity: number; bold: boolean } & AnimationSettings & TextEffectSettings
type StickerClip = { id: number; trackId: string; name: string; src: string; sourcePath?: string; embeddedSource?: string; start: number; duration: number; x: number; y: number; size: number; rotation: number; opacity: number; cropLeft: number; cropRight: number; cropTop: number; cropBottom: number } & AnimationSettings
type CaptionClip = { id: number; trackId: string; text: string; start: number; duration: number }

const initialTracks: TimelineTrack[] = [
  { id: 'video-1', type: 'video', label: 'Video' },
  { id: 'audio-1', type: 'audio', label: 'Audio' },
]

const initialClips: Clip[] = [
  { id: 1, trackId: 'video-1', label: 'Intro', start: 0, duration: 4.6, offset: 0, sourceDuration: 15, sourceUrl: '', color: '#78dce8', mediaType: 'video', mediaFit: 'fill', sourceWidth: 1920, sourceHeight: 1080, positionKeyframes: [], scale: 100, scaleX: 100, scaleY: 100, positionX: 0, positionY: 0, cropLeft: 0, cropRight: 0, cropTop: 0, cropBottom: 0, animation: 'none', animationDuration: 1, transition: 'none', transitionDuration: .8, videoEffect: 'none', effectIntensity: 70 },
  { id: 2, trackId: 'video-1', label: 'Main shot', start: 4.6, duration: 6.2, offset: 4.6, sourceDuration: 15, sourceUrl: '', color: '#a78bfa', mediaType: 'video', mediaFit: 'fill', sourceWidth: 1920, sourceHeight: 1080, positionKeyframes: [], scale: 100, scaleX: 100, scaleY: 100, positionX: 0, positionY: 0, cropLeft: 0, cropRight: 0, cropTop: 0, cropBottom: 0, animation: 'none', animationDuration: 1, transition: 'none', transitionDuration: .8, videoEffect: 'none', effectIntensity: 70 },
  { id: 3, trackId: 'video-1', label: 'Outro', start: 10.8, duration: 4.2, offset: 10.8, sourceDuration: 15, sourceUrl: '', color: '#fb7185', mediaType: 'video', mediaFit: 'fill', sourceWidth: 1920, sourceHeight: 1080, positionKeyframes: [], scale: 100, scaleX: 100, scaleY: 100, positionX: 0, positionY: 0, cropLeft: 0, cropRight: 0, cropTop: 0, cropBottom: 0, animation: 'none', animationDuration: 1, transition: 'none', transitionDuration: .8, videoEffect: 'none', effectIntensity: 70 },
]
const initialAudioClips: AudioClip[] = []
const initialTextClips: TextClip[] = []
const initialStickerClips: StickerClip[] = []
const initialCaptionClips: CaptionClip[] = []

type StickerAsset = { name: string; keywords: string; src: string; sourcePath?: string; embeddedSource?: string; kind: 'sticker' | 'gif' }
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

const videoEffectOptions = [
  { value: 'none', labelKey: 'effectNone' },
  { value: 'film', labelKey: 'film' },
  { value: 'lightLeak', labelKey: 'lightLeak' },
  { value: 'blur', labelKey: 'blur' },
  { value: 'grain', labelKey: 'grain' },
  { value: 'VHS', labelKey: 'vhs' },
  { value: 'soft', labelKey: 'soft' },
] as const

const videoEffectFilter = (preset: VideoEffectPreset, intensity: number) => {
  const amount = Math.max(0, Math.min(1, intensity / 100))
  if (preset === 'film') return `sepia(${amount * .62}) contrast(${1 + amount * .18}) saturate(${1 - amount * .28}) brightness(${1 - amount * .04})`
  if (preset === 'lightLeak') return `brightness(${1 + amount * .12}) saturate(${1 + amount * .28}) hue-rotate(${amount * -8}deg)`
  if (preset === 'blur') return `blur(${amount * 7}px)`
  if (preset === 'grain') return `contrast(${1 + amount * .14}) saturate(${1 - amount * .12})`
  if (preset === 'VHS') return `contrast(${1 + amount * .2}) saturate(${1 + amount * .32}) hue-rotate(${amount * 7}deg)`
  if (preset === 'soft') return `blur(${amount * 1.4}px) brightness(${1 + amount * .1}) saturate(${1 - amount * .18})`
  return ''
}

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

const audioClipGain = (clip: AudioClip, time: number) => {
  const elapsed = Math.max(0, Math.min(clip.duration, time - clip.start))
  const remaining = Math.max(0, clip.duration - elapsed)
  const fadeInGain = clip.fadeIn > 0 ? Math.min(1, elapsed / Math.min(clip.fadeIn, clip.duration)) : 1
  const fadeOutGain = clip.fadeOut > 0 ? Math.min(1, remaining / Math.min(clip.fadeOut, clip.duration)) : 1
  return clip.volume / 100 * Math.min(fadeInGain, fadeOutGain)
}

const audioEnvelopePath = (clip: AudioClip) => {
  const fadeIn = Math.min(100, clip.fadeIn / Math.max(.1, clip.duration) * 100)
  const fadeOut = Math.min(100, clip.fadeOut / Math.max(.1, clip.duration) * 100)
  return `polygon(0 100%, ${fadeIn}% 0, ${Math.max(fadeIn, 100 - fadeOut)}% 0, 100% 100%)`
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

const formatSigned = (value: number, fractionDigits = 0) => `${value > 0 ? '+' : ''}${value.toFixed(fractionDigits)}`

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

type ExportCodec = 'vp9' | 'vp8'
type ExportResolution = 'source' | '2160p' | '1440p' | '1080p' | '720p' | '480p'
type CanvasPreset = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | 'custom'
type PreviewZoom = 'fit' | 50 | 75 | 100 | 125 | 150 | 200

const canvasPresets: { value: Exclude<CanvasPreset, 'custom'>; width: number; height: number }[] = [
  { value: '1:1', width: 1080, height: 1080 },
  { value: '16:9', width: 1920, height: 1080 },
  { value: '9:16', width: 1080, height: 1920 },
  { value: '4:3', width: 1440, height: 1080 },
  { value: '3:4', width: 1080, height: 1440 },
]

const defaultMediaTransform: MediaTransform = { scale: 100, scaleX: 100, scaleY: 100, positionX: 0, positionY: 0, cropLeft: 0, cropRight: 0, cropTop: 0, cropBottom: 0 }
const clampMediaScale = (value: number) => Math.max(1, Math.min(1000, Number.isFinite(value) ? value : 100))
const normalizeClip = (clip: Clip): Clip => ({ ...clip, mediaType: clip.mediaType ?? 'video', mediaFit: clip.mediaFit ?? 'fill', sourceWidth: clip.sourceWidth ?? 1920, sourceHeight: clip.sourceHeight ?? 1080, positionKeyframes: clip.positionKeyframes ?? [], scale: clip.scale ?? 100, scaleX: clip.scaleX ?? 100, scaleY: clip.scaleY ?? 100, positionX: clip.positionX ?? 0, positionY: clip.positionY ?? 0, cropLeft: clip.cropLeft ?? 0, cropRight: clip.cropRight ?? 0, cropTop: clip.cropTop ?? 0, cropBottom: clip.cropBottom ?? 0 })
const normalizeSticker = (clip: StickerClip): StickerClip => ({ ...clip, cropLeft: clip.cropLeft ?? 0, cropRight: clip.cropRight ?? 0, cropTop: clip.cropTop ?? 0, cropBottom: clip.cropBottom ?? 0 })

const positionAtTimelineTime = (clip: Clip, timelineTime: number) => {
  const keyframes = [...clip.positionKeyframes].sort((a, b) => a.time - b.time)
  if (!keyframes.length) return { x: clip.positionX, y: clip.positionY }
  const localTime = Math.max(0, Math.min(clip.duration, timelineTime - clip.start))
  if (localTime <= keyframes[0].time) return { x: keyframes[0].x, y: keyframes[0].y }
  const last = keyframes[keyframes.length - 1]
  if (localTime >= last.time) return { x: last.x, y: last.y }
  const nextIndex = keyframes.findIndex((keyframe) => keyframe.time >= localTime)
  const previous = keyframes[nextIndex - 1]
  const next = keyframes[nextIndex]
  const progress = (localTime - previous.time) / Math.max(.001, next.time - previous.time)
  return { x: previous.x + (next.x - previous.x) * progress, y: previous.y + (next.y - previous.y) * progress }
}

const upsertPositionKeyframe = (keyframes: PositionKeyframe[], time: number, x: number, y: number) => [
  ...keyframes.filter((keyframe) => Math.abs(keyframe.time - time) > .03),
  { time, x, y },
].sort((a, b) => a.time - b.time)

const exportResolutionOptions: { value: ExportResolution; width: number; height: number; label: string }[] = [
  { value: 'source', width: 0, height: 0, label: 'Source' },
  { value: '2160p', width: 3840, height: 2160, label: '4K · 3840×2160' },
  { value: '1440p', width: 2560, height: 1440, label: '2K · 2560×1440' },
  { value: '1080p', width: 1920, height: 1080, label: 'Full HD · 1920×1080' },
  { value: '720p', width: 1280, height: 720, label: 'HD · 1280×720' },
  { value: '480p', width: 854, height: 480, label: 'SD · 854×480' },
]

const exportFrameRates = [24, 25, 30, 50, 60] as const

type ProjectDocument = {
  format: 'lumacut-project'
  schemaVersion: 1
  projectName: string
  savedAt: string
  tracks: TimelineTrack[]
  videoAssets: VideoAsset[]
  clips: Clip[]
  audioClips: AudioClip[]
  textClips: TextClip[]
  stickerClips: StickerClip[]
  captionClips: CaptionClip[]
  importedGifAssets: StickerAsset[]
  settings: {
    duration: number
    currentTime: number
    selectedClip: number
    selectedAudioClip: number
    selectedTextClip: number
    selectedStickerClip: number
    selectedCaptionClip: number
    zoom: number
    speed: number
    volume: number
    videoOpacity: number
    brightness: number
    contrast: number
    saturation: number
    exportCodec: ExportCodec
    exportResolution: ExportResolution
    exportFrameRate: number
    canvasPreset: CanvasPreset
    canvasWidth: number
    canvasHeight: number
    snappingEnabled: boolean
  }
}

const trackTypeOrder: Record<TrackType, number> = { video: 0, audio: 1, text: 2, sticker: 3, caption: 4 }
const orderTimelineTracks = (items: TimelineTrack[]) => [...items].sort((a, b) => trackTypeOrder[a.type] - trackTypeOrder[b.type])

function App() {
  const fileInput = useRef<HTMLInputElement>(null)
  const audioInput = useRef<HTMLInputElement>(null)
  const captionInput = useRef<HTMLInputElement>(null)
  const gifInput = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const transitionVideoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const audioGainNodeRef = useRef<GainNode | null>(null)
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null)
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
  const mediaPositionRef = useRef<{ id: number; pointerX: number; pointerY: number; x: number; y: number; keyframed: boolean } | null>(null)
  const mediaScaleRef = useRef<{ id: number; centerX: number; centerY: number; distance: number; scale: number } | null>(null)
  const mediaAxisScaleRef = useRef<{ id: number; axis: 'horizontal' | 'vertical'; center: number; distance: number; scale: number } | null>(null)
  const stickerImagesRef = useRef(new Map<string, HTMLImageElement>())
  const importedGifUrlsRef = useRef<string[]>([])
  const zoomDragRef = useRef<{ x: number; zoom: number } | null>(null)
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('lumacut-language') as LanguageCode | null
    return languageOptions.some((option) => option.code === saved) ? saved! : 'en'
  })
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [projectName, setProjectName] = useState(() => translate(language, 'untitledProject'))
  const [projectFilePath, setProjectFilePath] = useState('')
  const [isSavingProject, setIsSavingProject] = useState(false)
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
  const [importedGifAssets, setImportedGifAssets] = useState<StickerAsset[]>([])
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
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportCodec, setExportCodec] = useState<ExportCodec>('vp9')
  const [exportResolution, setExportResolution] = useState<ExportResolution>('1080p')
  const [exportFrameRate, setExportFrameRate] = useState(30)
  const [canvasPreset, setCanvasPreset] = useState<CanvasPreset>('16:9')
  const [canvasWidth, setCanvasWidth] = useState(1920)
  const [canvasHeight, setCanvasHeight] = useState(1080)
  const [snappingEnabled, setSnappingEnabled] = useState(true)
  const [previewMuted, setPreviewMuted] = useState(false)
  const [previewSettingsOpen, setPreviewSettingsOpen] = useState(false)
  const [previewZoomMenuOpen, setPreviewZoomMenuOpen] = useState(false)
  const [previewZoom, setPreviewZoom] = useState<PreviewZoom>('fit')
  const [showCenterGuides, setShowCenterGuides] = useState(false)
  const [showTransformControls, setShowTransformControls] = useState(true)
  const [previewCheckerboard, setPreviewCheckerboard] = useState(false)
  const [exportPath, setExportPath] = useState('')
  const [exportProgress, setExportProgress] = useState(0)
  const [exportEtaSeconds, setExportEtaSeconds] = useState<number | null>(null)
  const [exportFinished, setExportFinished] = useState(false)
  const exportProgressTimeRef = useRef(0)

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
  const previewEffectClip = currentVideoClip ?? activeClip
  const effectTarget = activeClip ?? currentVideoClip
  const previewVideoFilter = `${filter} ${videoEffectFilter(previewEffectClip?.videoEffect ?? 'none', previewEffectClip?.effectIntensity ?? 0)}`
  const outgoingVideoFilter = `${filter} ${videoEffectFilter(previousVideoClip?.videoEffect ?? 'none', previousVideoClip?.effectIntensity ?? 0)}`
  const previewVideoUrl = currentVideoClip?.sourceUrl || activeClip?.sourceUrl || videoUrl
  const previewMediaClip = currentVideoClip ?? activeClip
  const previewMediaType = previewMediaClip?.mediaType ?? 'video'
  const previewPosition = previewMediaClip ? positionAtTimelineTime(previewMediaClip, currentTime) : { x: 0, y: 0 }
  const outgoingPosition = previousVideoClip ? positionAtTimelineTime(previousVideoClip, currentTime) : { x: 0, y: 0 }
  const previewPositionXPercent = previewPosition.x
  const previewPositionYPercent = previewPosition.y
  const previewPositionXPixels = Math.round(canvasWidth * previewPositionXPercent / 100)
  const previewPositionYPixels = Math.round(canvasHeight * previewPositionYPercent / 100)
  const previewCrop = previewMediaClip ? `inset(${previewMediaClip.cropTop}% ${previewMediaClip.cropRight}% ${previewMediaClip.cropBottom}% ${previewMediaClip.cropLeft}%)` : undefined
  const outgoingCrop = previousVideoClip ? `inset(${previousVideoClip.cropTop}% ${previousVideoClip.cropRight}% ${previousVideoClip.cropBottom}% ${previousVideoClip.cropLeft}%)` : undefined
  const previewMediaSelectionStyle: CSSProperties = (() => {
    if (!previewMediaClip || previewMediaClip.mediaFit !== 'fit') return { inset: 0 }
    const sourceRatio = Math.max(.0001, previewMediaClip.sourceWidth / previewMediaClip.sourceHeight)
    const canvasRatio = Math.max(.0001, canvasWidth / canvasHeight)
    if (sourceRatio >= canvasRatio) {
      const height = canvasRatio / sourceRatio * 100
      return { left: 0, right: 0, top: `${(100 - height) / 2}%`, height: `${height}%` }
    }
    const width = sourceRatio / canvasRatio * 100
    return { top: 0, bottom: 0, left: `${(100 - width) / 2}%`, width: `${width}%` }
  })()
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
  const filteredStickerAssets = [...importedGifAssets, ...stickerAssets].filter((asset) => (stickerCategory === 'all' || asset.kind === stickerCategory) && `${asset.name} ${asset.keywords}`.toLowerCase().includes(stickerSearch.trim().toLowerCase()))
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

  const ensureAudioGraph = () => {
    const audio = audioRef.current
    if (!audio || audioGainNodeRef.current) return
    const context = new AudioContext()
    const source = context.createMediaElementSource(audio)
    const gain = context.createGain()
    const destination = context.createMediaStreamDestination()
    source.connect(gain)
    gain.connect(context.destination)
    gain.connect(destination)
    audioContextRef.current = context
    audioSourceNodeRef.current = source
    audioGainNodeRef.current = gain
    audioDestinationRef.current = destination
    audio.volume = 1
  }

  const togglePlayback = async () => {
    const video = videoRef.current
    if (videoUrl && video) {
      const clip = clips.find((item) => currentTime >= item.start && currentTime < item.start + item.duration) ?? [...clips].sort((a, b) => a.start - b.start)[0]
      if (clip && (currentTime < clip.start || currentTime >= clip.start + clip.duration)) seek(clip.start)
      if (isPlaying) { video.pause(); setIsPlaying(false) }
      else { if (audioClips.length) { ensureAudioGraph(); await audioContextRef.current?.resume() }; setIsPlaying(true); await video.play().catch(() => undefined) }
    } else if (audioUrl) {
      if (isPlaying) setIsPlaying(false)
      else {
        const clip = audioClips.find((item) => currentTime >= item.start && currentTime < item.start + item.duration) ?? [...audioClips].sort((a, b) => a.start - b.start)[0]
        if (clip && (currentTime < clip.start || currentTime >= clip.start + clip.duration)) seek(clip.start)
        ensureAudioGraph(); await audioContextRef.current?.resume(); setIsPlaying(true)
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
    const splitPosition = positionAtTimelineTime(clip, currentTime)
    const firstKeyframes = clip.positionKeyframes.filter((keyframe) => keyframe.time <= firstDuration + .001)
    const secondKeyframes = upsertPositionKeyframe(clip.positionKeyframes.filter((keyframe) => keyframe.time > firstDuration + .001).map((keyframe) => ({ ...keyframe, time: keyframe.time - firstDuration })), 0, splitPosition.x, splitPosition.y)
    const second: Clip = { ...clip, id: Date.now(), label: `${clip.label} (2)`, start: currentTime, duration: clip.duration - firstDuration, offset: clip.offset + firstDuration, transition: 'none', positionKeyframes: secondKeyframes }
    setClips((items) => items.flatMap((item) => item.id === clip.id ? [{ ...item, duration: firstDuration, positionKeyframes: firstKeyframes }, second] : [item]))
    setSelectedClip(second.id)
    setToast(t('splitDone', { item: t('clip') }))
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    video.volume = volume / 100
    video.muted = previewMuted || isCurrentVideoDetached
  }, [speed, volume, previewVideoUrl, isCurrentVideoDetached, previewMuted])

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
    const gain = previewMuted ? 0 : audioClipGain(clip, currentTime)
    if (audioGainNodeRef.current && audioContextRef.current) {
      audio.volume = 1
      audioGainNodeRef.current.gain.setTargetAtTime(gain, audioContextRef.current.currentTime, .015)
    } else audio.volume = Math.min(1, gain)
    if (isPlaying && audio.paused) void audio.play().catch(() => undefined)
    if (!isPlaying && !audio.paused) audio.pause()
  }, [currentTime, isPlaying, audioUrl, audioClips, previewMuted])

  useEffect(() => {
    if (!isPlaying || !audioUrl || !audioGainNodeRef.current || !audioContextRef.current) return
    let frame = 0
    const updateGain = () => {
      const audio = audioRef.current
      const clip = audioClips.find((item) => currentTime >= item.start && currentTime < item.start + item.duration)
      if (audio && clip && audio.getAttribute('src') === clip.sourceUrl) {
        const timelineTime = clip.start + audio.currentTime - clip.offset
        const gain = previewMuted ? 0 : audioClipGain(clip, timelineTime)
        audioGainNodeRef.current?.gain.setValueAtTime(gain, audioContextRef.current!.currentTime)
      }
      frame = requestAnimationFrame(updateGain)
    }
    frame = requestAnimationFrame(updateGain)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, currentTime, audioUrl, audioClips, previewMuted])

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
    audioSourceNodeRef.current?.disconnect()
    audioGainNodeRef.current?.disconnect()
    if (audioContextRef.current?.state !== 'closed') void audioContextRef.current?.close()
    importedGifUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  useEffect(() => {
    if (!isPlaying || (videoUrl && currentVideoClip?.mediaType !== 'image')) return
    const timer = setInterval(() => setCurrentTime((time) => time >= projectDuration ? 0 : time + 0.033 * speed), 33)
    return () => clearInterval(timer)
  }, [isPlaying, videoUrl, currentVideoClip?.mediaType, projectDuration, speed])

  const importFile = async (file: File) => {
    const url = URL.createObjectURL(file)
    const sourcePath = window.lumacut?.getFilePath(file) || undefined
    const mediaType: MediaKind = file.type.startsWith('image/') ? 'image' : 'video'
    const metadata = await new Promise<{ duration: number; width: number; height: number }>((resolve) => {
      if (mediaType === 'image') {
        const probe = new Image()
        probe.onload = () => resolve({ duration: 5, width: probe.naturalWidth || 1920, height: probe.naturalHeight || 1080 })
        probe.onerror = () => resolve({ duration: 5, width: 1920, height: 1080 })
        probe.src = url
      } else {
        const probe = document.createElement('video')
        probe.preload = 'metadata'
        probe.onloadedmetadata = () => resolve({ duration: Number.isFinite(probe.duration) ? probe.duration : 15, width: probe.videoWidth || 1920, height: probe.videoHeight || 1080 })
        probe.onerror = () => resolve({ duration: 15, width: 1920, height: 1080 })
        probe.src = url
      }
    })
    const sourceDuration = mediaType === 'image' ? 3600 : metadata.duration
    const displayDuration = metadata.duration
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const trackId = ensureTrackId('video')
    const palette = ['#78dce8', '#a78bfa', '#fb7185', '#fbbf24', '#34d399', '#60a5fa']
    setVideoUrl((current) => current || url)
    setVideoAssets((items) => [...items, { id, name: file.name, url, duration: displayDuration, sourcePath, mediaType, width: metadata.width, height: metadata.height }])
    setClips((items) => {
      const realClips = items.filter((item) => item.sourceUrl)
      const start = Math.max(0, ...realClips.map((item) => item.start + item.duration))
      const next: Clip = { id, trackId, label: file.name.replace(/\.[^.]+$/, ''), start, duration: displayDuration, offset: 0, sourceDuration, sourceUrl: url, sourcePath, color: palette[realClips.length % palette.length], mediaType, mediaFit: 'fill', sourceWidth: metadata.width, sourceHeight: metadata.height, positionKeyframes: [], ...defaultMediaTransform, animation: 'none', animationDuration: 1, transition: 'none', transitionDuration: .8, videoEffect: 'none', effectIntensity: 70 }
      return [...realClips, next]
    })
    setDuration((current) => current + displayDuration)
    setSelectedClip(id); setSelectedAudioClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0)
  }

  const importFiles = async (files: File[]) => {
    const media = files.filter((file) => file.type.startsWith('video/') || (file.type.startsWith('image/') && file.type !== 'image/gif'))
    if (!media.length) return setToast(t('selectMediaFile'))
    if (!videoUrl) { setFileName(media[0].name); setCurrentTime(0); setDuration(0) }
    for (const file of media) await importFile(file)
    setToast(media.length > 1 ? t('importedMediaFiles', { count: media.length }) : t('importedMedia'))
  }

  const detachAudioFromVideo = () => {
    const sourceClip = activeClip ?? currentVideoClip
    if (!sourceClip?.sourceUrl || sourceClip.mediaType === 'image') return setToast(t('selectVideoForAudio'))
    if (audioClips.some((item) => item.sourceUrl === sourceClip.sourceUrl && Math.abs(item.offset - sourceClip.offset) < .01)) return setToast(t('alreadyDetached'))
    const id = Date.now()
    const baseName = sourceClip.label.replace(/\s*\(\d+\)$/, '')
    const audioTrackId = ensureTrackId('audio')
    setAudioUrl(sourceClip.sourceUrl)
    setAudioName(t('sourceAudio', { name: baseName }))
    setAudioClips((items) => [...items, { id, trackId: audioTrackId, label: t('audioSuffix', { name: baseName }), start: sourceClip.start, duration: sourceClip.duration, offset: sourceClip.offset, sourceDuration: sourceClip.sourceDuration, sourceUrl: sourceClip.sourceUrl, sourcePath: sourceClip.sourcePath, volume: 100, fadeIn: 0, fadeOut: 0 }])
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
    const media = files.filter((file) => file.type.startsWith('video/') || (file.type.startsWith('image/') && file.type !== 'image/gif'))
    if (media.length) void importFiles(media)
    else if (files[0]?.type.startsWith('audio/')) importAudio(files[0])
    else setToast(t('selectMediaFile'))
  }
  const importAudio = (file?: File) => {
    if (!file || !file.type.startsWith('audio/')) return setToast(t('selectAudioFile'))
    new Set(audioClips.map((clip) => clip.sourceUrl).filter((url) => url !== videoUrl)).forEach((url) => URL.revokeObjectURL(url))
    const url = URL.createObjectURL(file)
    const sourcePath = window.lumacut?.getFilePath(file) || undefined
    const id = Date.now()
    setAudioUrl(url); setAudioName(file.name); setActiveTool('audio'); setIsAudioDetached(false)
    const probe = new Audio(url)
    probe.onloadedmetadata = () => {
      const audioDuration = Number.isFinite(probe.duration) ? probe.duration : 15
      setAudioClips([{ id, trackId: ensureTrackId('audio'), label: file.name.replace(/\.[^.]+$/, ''), start: 0, duration: audioDuration, offset: 0, sourceDuration: audioDuration, sourceUrl: url, sourcePath, volume: 100, fadeIn: 0, fadeOut: 0 }])
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
        setAudioClips((items) => [...items, { id, trackId: audioTrackId, label, start: recordingTimelineStartRef.current, duration: recordedDuration, offset: 0, sourceDuration: recordedDuration, sourceUrl: url, volume: 100, fadeIn: 0, fadeOut: 0 }])
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

  const deleteMediaAsset = (asset: VideoAsset) => {
    if (!window.confirm(t('deleteMediaConfirm', { name: asset.name }))) return
    const removedClipIds = new Set(clips.filter((item) => item.sourceUrl === asset.url).map((item) => item.id))
    const removedAudioIds = new Set(audioClips.filter((item) => item.sourceUrl === asset.url).map((item) => item.id))
    const remainingAssets = videoAssets.filter((item) => item.id !== asset.id)
    const remainingClips = clips.filter((item) => item.sourceUrl !== asset.url)
    const remainingAudio = audioClips.filter((item) => item.sourceUrl !== asset.url)
    const nextVisual = remainingClips.find((item) => item.sourceUrl)
    const nextAudio = remainingAudio.find((item) => item.sourceUrl)
    const remainingEnd = Math.max(0, ...remainingClips.map((item) => item.start + item.duration), ...remainingAudio.map((item) => item.start + item.duration), ...textClips.map((item) => item.start + item.duration), ...stickerClips.map((item) => item.start + item.duration), ...captionClips.map((item) => item.start + item.duration))
    videoRef.current?.pause()
    transitionVideoRef.current?.pause()
    if (audioUrl === asset.url) audioRef.current?.pause()
    setIsPlaying(false)
    setVideoAssets(remainingAssets)
    setClips(remainingClips)
    setAudioClips(remainingAudio)
    setDuration(remainingEnd || 15)
    setCurrentTime((time) => Math.min(time, remainingEnd))
    if (removedClipIds.has(selectedClip)) setSelectedClip(nextVisual?.id ?? 0)
    if (removedAudioIds.has(selectedAudioClip)) setSelectedAudioClip(0)
    if (videoUrl === asset.url) setVideoUrl(nextVisual?.sourceUrl ?? '')
    if (audioUrl === asset.url) { setAudioUrl(nextAudio?.sourceUrl ?? ''); setAudioName(nextAudio?.label ?? '') }
    setFileName(remainingAssets[0]?.name ?? 'travel_vlog_01.mp4')
    setIsAudioDetached(remainingAudio.some((audioClip) => remainingClips.some((videoClip) => audioClip.sourceUrl === videoClip.sourceUrl)))
    if (asset.url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(asset.url), 0)
    setToast(t('mediaDeleted', { name: asset.name }))
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isTyping = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
      if (event.code === 'Space' && !isTyping) { event.preventDefault(); void togglePlayback() }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b' && !isTyping) { event.preventDefault(); splitClip() }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void saveProject() }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') { event.preventDefault(); void openProject() }
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

  const updateAudioClip = (patch: Partial<AudioClip>) => {
    if (!activeAudioClip) return
    setAudioClips((items) => items.map((item) => item.id === activeAudioClip.id ? { ...item, ...patch } : item))
  }

  const updateVideoClip = (patch: Partial<Clip>) => {
    if (!activeClip) return
    setClips((items) => items.map((item) => item.id === activeClip.id ? { ...item, ...patch } : item))
  }

  const applyCanvasPreset = (preset: CanvasPreset) => {
    setCanvasPreset(preset)
    const dimensions = canvasPresets.find((item) => item.value === preset)
    if (dimensions) { setCanvasWidth(dimensions.width); setCanvasHeight(dimensions.height) }
  }

  const commitCanvasDimension = (axis: 'width' | 'height', value: number) => {
    const safe = Math.round(Math.min(8192, Math.max(64, Number.isFinite(value) ? value : 1080)))
    setCanvasPreset('custom')
    if (axis === 'width') setCanvasWidth(safe)
    else setCanvasHeight(safe)
  }

  const resetMediaTransform = () => updateVideoClip({ ...defaultMediaTransform, positionKeyframes: [] })
  const setMediaFit = (mediaFit: MediaFit) => {
    updateVideoClip({ ...defaultMediaTransform, mediaFit })
    setToast(t(mediaFit === 'fit' ? 'fitApplied' : 'fillApplied'))
  }
  const updateMediaCrop = (edge: keyof Pick<MediaTransform, 'cropLeft' | 'cropRight' | 'cropTop' | 'cropBottom'>, value: number) => {
    if (!activeClip) return
    const opposite = edge === 'cropLeft' ? activeClip.cropRight : edge === 'cropRight' ? activeClip.cropLeft : edge === 'cropTop' ? activeClip.cropBottom : activeClip.cropTop
    updateVideoClip({ [edge]: Math.max(0, Math.min(45, 95 - opposite, value)) } as Partial<Clip>)
  }
  const updateStickerCrop = (edge: keyof Pick<StickerClip, 'cropLeft' | 'cropRight' | 'cropTop' | 'cropBottom'>, value: number) => {
    if (!activeStickerClip) return
    const opposite = edge === 'cropLeft' ? activeStickerClip.cropRight : edge === 'cropRight' ? activeStickerClip.cropLeft : edge === 'cropTop' ? activeStickerClip.cropBottom : activeStickerClip.cropTop
    updateSticker({ [edge]: Math.max(0, Math.min(45, 95 - opposite, value)) } as Partial<StickerClip>)
  }

  const applyVideoEffect = (videoEffect: VideoEffectPreset) => {
    const target = activeClip ?? currentVideoClip
    if (!target) return setToast(t('selectVideoForEffect'))
    setClips((items) => items.map((item) => item.id === target.id ? { ...item, videoEffect } : item))
    setSelectedClip(target.id)
    seek(Math.max(target.start, Math.min(currentTime, target.start + target.duration - .05)))
    setToast(t('effectApplied', { effect: videoEffect === 'none' ? t('effectNone') : videoEffect === 'VHS' ? t('vhs') : t(videoEffect) }))
  }

  const updateVideoEffectIntensity = (effectIntensity: number) => {
    const target = activeClip ?? currentVideoClip
    if (!target) return
    setClips((items) => items.map((item) => item.id === target.id ? { ...item, effectIntensity } : item))
    setSelectedClip(target.id)
  }

  const addSticker = (asset: StickerAsset) => {
    const id = stickerClips.reduce((highest, item) => Math.max(highest, item.id), 1000) + 1
    const next: StickerClip = { id, trackId: ensureTrackId('sticker'), name: asset.name, src: asset.src, sourcePath: asset.sourcePath, start: currentTime, duration: Math.max(1, Math.min(4, projectDuration - currentTime || 4)), x: 50, y: 50, size: 26, rotation: 0, opacity: 100, cropLeft: 0, cropRight: 0, cropTop: 0, cropBottom: 0, animation: 'none', animationDuration: 1 }
    setStickerClips((items) => [...items, next])
    setSelectedStickerClip(id); setSelectedTextClip(0); setSelectedCaptionClip(0); setSelectedClip(0); setSelectedAudioClip(0); setActiveTool('stickers')
    setToast(t('added', { item: asset.name }))
  }

  const importGif = (file?: File) => {
    if (!file) return
    if (file.type !== 'image/gif' && !file.name.toLowerCase().endsWith('.gif')) return setToast(t('selectGifFile'))
    const url = URL.createObjectURL(file)
    const sourcePath = window.lumacut?.getFilePath(file) || undefined
    const asset: StickerAsset = { name: file.name.replace(/\.gif$/i, ''), keywords: `gif ${file.name}`, src: url, sourcePath, kind: 'gif' }
    importedGifUrlsRef.current.push(url)
    setImportedGifAssets((items) => [asset, ...items])
    const image = new Image()
    image.src = url
    stickerImagesRef.current.set(url, image)
    setStickerCategory('gif')
    setStickerSearch('')
    addSticker(asset)
    setToast(t('gifImported', { name: asset.name }))
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

  const togglePositionKeyframe = (clip: Clip) => {
    const localTime = Math.max(0, Math.min(clip.duration, currentTime - clip.start))
    const existing = clip.positionKeyframes.find((keyframe) => Math.abs(keyframe.time - localTime) <= .03)
    if (existing) {
      setClips((items) => items.map((item) => item.id === clip.id ? { ...item, positionKeyframes: item.positionKeyframes.filter((keyframe) => Math.abs(keyframe.time - localTime) > .03) } : item))
      setToast(t('positionKeyframeRemoved'))
      return
    }
    const position = positionAtTimelineTime(clip, currentTime)
    setClips((items) => items.map((item) => item.id === clip.id ? { ...item, positionKeyframes: upsertPositionKeyframe(item.positionKeyframes, localTime, position.x, position.y) } : item))
    setToast(t('positionKeyframeAdded'))
  }

  const jumpPositionKeyframe = (clip: Clip, direction: -1 | 1) => {
    const localTime = Math.max(0, Math.min(clip.duration, currentTime - clip.start))
    const ordered = [...clip.positionKeyframes].sort((a, b) => a.time - b.time)
    const target = direction < 0 ? [...ordered].reverse().find((keyframe) => keyframe.time < localTime - .03) : ordered.find((keyframe) => keyframe.time > localTime + .03)
    if (target) seek(clip.start + target.time)
  }

  const renderPositionKeyframeEditor = (clip: Clip) => {
    const localTime = Math.max(0, Math.min(clip.duration, currentTime - clip.start))
    const ordered = [...clip.positionKeyframes].sort((a, b) => a.time - b.time)
    const isOnKeyframe = ordered.some((keyframe) => Math.abs(keyframe.time - localTime) <= .03)
    return <div className="property-section position-keyframe-editor">
      <h3><Diamond size={15}/>{t('positionKeyframes')}<span>{ordered.length}</span></h3>
      <div className="keyframe-controls">
        <button onClick={() => jumpPositionKeyframe(clip, -1)} title={t('previousKeyframe')} disabled={!ordered.some((keyframe) => keyframe.time < localTime - .03)}><ChevronLeft size={15}/></button>
        <button className={isOnKeyframe ? 'active' : ''} onClick={() => togglePositionKeyframe(clip)} title={t(isOnKeyframe ? 'removePositionKeyframe' : 'addPositionKeyframe')}><Diamond size={15} fill={isOnKeyframe ? 'currentColor' : 'none'}/><span>{t(isOnKeyframe ? 'removePositionKeyframe' : 'addPositionKeyframe')}</span></button>
        <button onClick={() => jumpPositionKeyframe(clip, 1)} title={t('nextKeyframe')} disabled={!ordered.some((keyframe) => keyframe.time > localTime + .03)}><ChevronRight size={15}/></button>
      </div>
      <p className="animation-hint">{t('positionKeyframeHint')}</p>
      {ordered.length > 0 && <><div className="keyframe-list">{ordered.map((keyframe, index) => <button key={`${keyframe.time}-${index}`} className={Math.abs(keyframe.time - localTime) <= .03 ? 'active' : ''} onClick={() => seek(clip.start + keyframe.time)}><Diamond size={9} fill="currentColor"/><span>{keyframe.time.toFixed(2)}s</span><small>X {keyframe.x.toFixed(1)}% · Y {keyframe.y.toFixed(1)}%</small></button>)}</div><button className="clear-keyframes" onClick={() => { setClips((items) => items.map((item) => item.id === clip.id ? { ...item, positionKeyframes: [] } : item)); setToast(t('positionKeyframesCleared')) }}>{t('clearPositionKeyframes')}</button></>}
    </div>
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
    const desired = Math.max(0, Math.round((drag.start + (event.clientX - drag.x) / pxPerSecond) * 10) / 10)
    const hoveredTrack = (document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null)?.closest<HTMLElement>('.track[data-track-type]')
    const targetTrackId = hoveredTrack?.dataset.trackType === drag.kind ? hoveredTrack.dataset.trackId : undefined
    const sourceItems: { id: number; start: number; duration: number; trackId: string }[] = drag.kind === 'video' ? clips : drag.kind === 'audio' ? audioClips : drag.kind === 'caption' ? captionClips : drag.kind === 'sticker' ? stickerClips : textClips
    const movingItem = sourceItems.find((item) => item.id === drag.id)
    const resolvedTrackId = targetTrackId ?? movingItem?.trackId
    let next = desired
    if (snappingEnabled && movingItem && resolvedTrackId) {
      const siblings = sourceItems.filter((item) => item.id !== drag.id && item.trackId === resolvedTrackId)
      const snapThreshold = Math.max(.08, 10 / pxPerSecond)
      const snapPoints = [0, ...siblings.flatMap((item) => [item.start, item.start + item.duration, item.start - movingItem.duration, item.start + item.duration - movingItem.duration])].filter((value) => value >= 0)
      const closestSnap = snapPoints.reduce((closest, value) => Math.abs(value - desired) < Math.abs(closest - desired) ? value : closest, snapPoints[0] ?? desired)
      if (Math.abs(closestSnap - desired) <= snapThreshold) next = closestSnap
      const overlaps = (candidate: number) => siblings.some((item) => candidate < item.start + item.duration - .001 && candidate + movingItem.duration > item.start + .001)
      if (overlaps(next)) {
        const validPositions = [0, ...siblings.flatMap((item) => [item.start - movingItem.duration, item.start + item.duration])].filter((value) => value >= 0 && !overlaps(value))
        if (validPositions.length) next = validPositions.reduce((closest, value) => Math.abs(value - desired) < Math.abs(closest - desired) ? value : closest, validPositions[0])
      }
      next = Math.round(next * 1000) / 1000
    }
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
    if (track.type === 'video') return <div key={track.id} className="track video-track" data-track-id={track.id} data-track-type={track.type}>{clips.filter((clip) => clip.trackId === track.id).map((clip, index) => <button key={clip.id} className={`timeline-clip draggable ${selectedClip === clip.id ? 'selected' : ''}`} style={{left: clip.start * pxPerSecond, width: Math.max(clip.duration * pxPerSecond, 1), '--clip-color': clip.color} as React.CSSProperties} onPointerDown={(e) => beginDrag(e, 'video', clip.id, clip.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(clip.start)}}>{clip.positionKeyframes.map((keyframe, keyframeIndex) => <i key={`position-${keyframeIndex}`} className="position-keyframe-marker" style={{left: `${Math.max(0, Math.min(100, keyframe.time / Math.max(.001, clip.duration) * 100))}%`}} title={`${t('positionKeyframes')} · ${keyframe.time.toFixed(2)}s`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => {event.stopPropagation();setSelectedClip(clip.id);setVideoInspectorTab('animation');seek(clip.start + keyframe.time)}}><Diamond size={8} fill="currentColor"/></i>)}{clip.transition !== 'none' && <i className="timeline-transition" title={t('transition')} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => {event.stopPropagation();setSelectedClip(clip.id);setVideoInspectorTab('transition');seek(clip.start + clip.transitionDuration * .45)}}>◇</i>}<div className="clip-resize-handle left" title={t('trimStart')} onPointerDown={(e) => beginStartResize(e, 'video', clip.id, clip.start, clip.duration, clip.offset)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/><div className="drag-grip">•••</div><div className="filmstrip">{Array.from({length: Math.min(500, Math.max(2, Math.ceil(clip.duration * zoom * 1.8)))}, (_, i) => <i key={i}/>)}</div><span>{clip.label}</span>{index === 0 && <em>100%</em>}<div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'video', clip.id, clip.duration, clip.sourceDuration - clip.offset)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
    if (track.type === 'text') return <div key={track.id} className="track text-track" data-track-id={track.id} data-track-type={track.type}>{textClips.filter((item) => item.trackId === track.id).map((item) => <button key={item.id} className={`text-clip draggable ${selectedTextClip === item.id ? 'selected' : ''}`} style={{left: item.start * pxPerSecond, width: Math.max(item.duration * pxPerSecond, 1)}} onPointerDown={(e) => beginDrag(e, 'text', item.id, item.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(item.start)}}><TextCursorInput size={13}/><span>{item.text || t('text')}</span><small>{item.duration.toFixed(1)}s</small><div className="drag-grip">•••</div><div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'text', item.id, item.duration, 3600)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
    if (track.type === 'sticker') return <div key={track.id} className="track sticker-track" data-track-id={track.id} data-track-type={track.type}>{stickerClips.filter((item) => item.trackId === track.id).map((item) => <button key={item.id} className={`sticker-clip draggable ${selectedStickerClip === item.id ? 'selected' : ''}`} style={{left: item.start * pxPerSecond, width: Math.max(item.duration * pxPerSecond, 1)}} onPointerDown={(e) => beginDrag(e, 'sticker', item.id, item.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(item.start)}}><img src={item.src} alt=""/><span>{item.name}</span><small>{item.duration.toFixed(1)}s</small><div className="drag-grip">•••</div><div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'sticker', item.id, item.duration, 3600)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
    if (track.type === 'caption') return <div key={track.id} className="track caption-track" data-track-id={track.id} data-track-type={track.type}>{captionClips.filter((item) => item.trackId === track.id).map((item) => <button key={item.id} className={`caption-clip draggable ${selectedCaptionClip === item.id ? 'selected' : ''}`} style={{left: item.start * pxPerSecond, width: Math.max(item.duration * pxPerSecond, 1)}} onPointerDown={(e) => beginDrag(e, 'caption', item.id, item.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(item.start)}}><Captions size={13}/><span>{item.text || t('captions')}</span><small>{item.duration.toFixed(1)}s</small><div className="drag-grip">•••</div><div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'caption', item.id, item.duration, 3600)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
    return <div key={track.id} className="track audio-track" data-track-id={track.id} data-track-type={track.type}>{audioClips.filter((clip) => clip.trackId === track.id).map((clip) => <button key={clip.id} className={`audio-clip draggable ${selectedAudioClip === clip.id ? 'selected' : ''}`} style={{left: clip.start * pxPerSecond, width: Math.max(clip.duration * pxPerSecond, 1)}} onPointerDown={(e) => beginDrag(e, 'audio', clip.id, clip.start)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={(e) => {e.stopPropagation();seek(clip.start)}}><div className="audio-fade-envelope" style={{clipPath: audioEnvelopePath(clip)}}/><div className="clip-resize-handle left" title={t('trimStart')} onPointerDown={(e) => beginStartResize(e, 'audio', clip.id, clip.start, clip.duration, clip.offset)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/>{Array.from({length: Math.max(12, Math.ceil(clip.duration * 6))}, (_, i) => <i key={i} style={{height: `${18 + ((i * 17) % 70)}%`}}/>)}<span>{clip.label}</span><div className="drag-grip">•••</div><div className="clip-resize-handle" title={t('resizeDuration')} onPointerDown={(e) => beginResize(e, 'audio', clip.id, clip.duration, clip.sourceDuration - clip.offset)} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize}/></button>)}</div>
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

  const beginMediaPosition = (event: ReactPointerEvent<HTMLDivElement>, clip: Clip) => {
    event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId)
    const position = positionAtTimelineTime(clip, currentTime)
    mediaPositionRef.current = { id: clip.id, pointerX: event.clientX, pointerY: event.clientY, x: position.x, y: position.y, keyframed: clip.positionKeyframes.length > 0 }
    setSelectedClip(clip.id); setSelectedAudioClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0); setVideoInspectorTab('video')
  }
  const moveMediaPosition = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = mediaPositionRef.current
    if (!drag) return
    const canvas = event.currentTarget.parentElement?.getBoundingClientRect()
    if (!canvas) return
    const positionX = Math.max(-100, Math.min(100, drag.x + (event.clientX - drag.pointerX) / canvas.width * 100))
    const positionY = Math.max(-100, Math.min(100, drag.y + (event.clientY - drag.pointerY) / canvas.height * 100))
    setClips((items) => items.map((item) => {
      if (item.id !== drag.id) return item
      if (!drag.keyframed) return { ...item, positionX, positionY }
      const localTime = Math.max(0, Math.min(item.duration, currentTime - item.start))
      return { ...item, positionKeyframes: upsertPositionKeyframe(item.positionKeyframes, localTime, positionX, positionY) }
    }))
  }
  const endMediaPosition = () => { if (mediaPositionRef.current) { const wasKeyframed = mediaPositionRef.current.keyframed; mediaPositionRef.current = null; setToast(t(wasKeyframed ? 'positionKeyframeUpdated' : 'mediaPositioned')) } }

  const beginMediaScale = (event: ReactPointerEvent<HTMLButtonElement>, clip: Clip) => {
    event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId)
    const canvas = event.currentTarget.closest('.preview-canvas')?.getBoundingClientRect()
    if (!canvas) return
    const position = positionAtTimelineTime(clip, currentTime)
    const centerX = canvas.left + canvas.width * (.5 + position.x / 100)
    const centerY = canvas.top + canvas.height * (.5 + position.y / 100)
    mediaScaleRef.current = { id: clip.id, centerX, centerY, distance: Math.max(1, Math.hypot(event.clientX - centerX, event.clientY - centerY)), scale: clip.scale }
  }
  const moveMediaScale = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = mediaScaleRef.current
    if (!drag) return
    event.preventDefault(); event.stopPropagation()
    const distance = Math.max(1, Math.hypot(event.clientX - drag.centerX, event.clientY - drag.centerY))
    const scale = clampMediaScale(drag.scale * distance / drag.distance)
    setClips((items) => items.map((item) => item.id === drag.id ? { ...item, scale } : item))
  }
  const endMediaScale = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!mediaScaleRef.current) return
    event.preventDefault(); event.stopPropagation(); mediaScaleRef.current = null
    setToast(t('mediaResized'))
  }

  const beginMediaAxisScale = (event: ReactPointerEvent<HTMLButtonElement>, clip: Clip, axis: 'horizontal' | 'vertical') => {
    event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId)
    const canvas = event.currentTarget.closest('.preview-canvas')?.getBoundingClientRect()
    if (!canvas) return
    const position = positionAtTimelineTime(clip, currentTime)
    const center = axis === 'horizontal' ? canvas.left + canvas.width * (.5 + position.x / 100) : canvas.top + canvas.height * (.5 + position.y / 100)
    const pointer = axis === 'horizontal' ? event.clientX : event.clientY
    mediaAxisScaleRef.current = { id: clip.id, axis, center, distance: Math.max(1, Math.abs(pointer - center)), scale: axis === 'horizontal' ? clip.scaleX : clip.scaleY }
  }
  const moveMediaAxisScale = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = mediaAxisScaleRef.current
    if (!drag) return
    event.preventDefault(); event.stopPropagation()
    const pointer = drag.axis === 'horizontal' ? event.clientX : event.clientY
    const nextScale = clampMediaScale(drag.scale * Math.max(1, Math.abs(pointer - drag.center)) / drag.distance)
    setClips((items) => items.map((item) => item.id === drag.id ? { ...item, [drag.axis === 'horizontal' ? 'scaleX' : 'scaleY']: nextScale } : item))
  }
  const endMediaAxisScale = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!mediaAxisScaleRef.current) return
    event.preventDefault(); event.stopPropagation(); mediaAxisScaleRef.current = null
    setToast(t('mediaResized'))
  }

  const blobUrlToDataUrl = async (url: string) => {
    if (!url.startsWith('blob:')) return undefined
    const blob = await fetch(url).then((response) => response.blob())
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  }

  async function saveProject() {
    if (isSavingProject) return
    setIsSavingProject(true)
    try {
      const embeddedCache = new Map<string, Promise<string | undefined>>()
      const embed = (url: string, sourcePath?: string) => {
        if (sourcePath || !url.startsWith('blob:')) return Promise.resolve(undefined)
        if (!embeddedCache.has(url)) embeddedCache.set(url, blobUrlToDataUrl(url))
        return embeddedCache.get(url)!
      }
      const savedVideoAssets = await Promise.all(videoAssets.map(async (item) => ({ ...item, url: item.sourcePath || item.url.startsWith('blob:') ? '' : item.url, embeddedSource: await embed(item.url, item.sourcePath) })))
      const savedClips = await Promise.all(clips.map(async (item) => ({ ...item, sourceUrl: item.sourcePath || item.sourceUrl.startsWith('blob:') ? '' : item.sourceUrl, embeddedSource: await embed(item.sourceUrl, item.sourcePath) })))
      const savedAudioClips = await Promise.all(audioClips.map(async (item) => ({ ...item, sourceUrl: item.sourcePath || item.sourceUrl.startsWith('blob:') ? '' : item.sourceUrl, embeddedSource: await embed(item.sourceUrl, item.sourcePath) })))
      const savedStickerClips = await Promise.all(stickerClips.map(async (item) => ({ ...item, src: item.sourcePath || item.src.startsWith('blob:') ? '' : item.src, embeddedSource: await embed(item.src, item.sourcePath) })))
      const savedGifAssets = await Promise.all(importedGifAssets.map(async (item) => ({ ...item, src: item.sourcePath || item.src.startsWith('blob:') ? '' : item.src, embeddedSource: await embed(item.src, item.sourcePath) })))
      const projectDocument: ProjectDocument = {
        format: 'lumacut-project', schemaVersion: 1, projectName: projectName.trim() || t('untitledProject'), savedAt: new Date().toISOString(), tracks,
        videoAssets: savedVideoAssets, clips: savedClips, audioClips: savedAudioClips, textClips, stickerClips: savedStickerClips, captionClips, importedGifAssets: savedGifAssets,
        settings: { duration, currentTime, selectedClip, selectedAudioClip, selectedTextClip, selectedStickerClip, selectedCaptionClip, zoom, speed, volume, videoOpacity, brightness, contrast, saturation, exportCodec, exportResolution, exportFrameRate, canvasPreset, canvasWidth, canvasHeight, snappingEnabled },
      }
      const contents = JSON.stringify(projectDocument, null, 2)
      const safeName = (projectDocument.projectName || 'lumacut-project').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'lumacut-project'
      if (window.lumacut) {
        const savedPath = await window.lumacut.saveProject(`${safeName}.lumacut`, contents, projectFilePath)
        if (!savedPath) return
        setProjectFilePath(savedPath)
      } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(new Blob([contents], { type: 'application/json' }))
        link.download = `${safeName}.lumacut`
        link.click()
        URL.revokeObjectURL(link.href)
      }
      setProjectName(projectDocument.projectName)
      setToast(t('projectSaved'))
    } catch {
      setToast(t('projectSaveFailed'))
    } finally {
      setIsSavingProject(false)
    }
  }

  async function openProject() {
    if (!window.lumacut || isSavingProject) return
    try {
      const opened = await window.lumacut.openProject()
      if (!opened) return
      const document = JSON.parse(opened.contents) as ProjectDocument
      if (document.format !== 'lumacut-project' || document.schemaVersion !== 1 || !Array.isArray(document.clips) || !Array.isArray(document.tracks)) throw new Error('invalid-project')
      const restoreUrl = async (sourcePath: string | undefined, embeddedSource: string | undefined, fallback: string) => sourcePath ? window.lumacut!.mediaFileUrl(sourcePath) : embeddedSource || fallback
      const loadedVideoAssets = await Promise.all((document.videoAssets ?? []).map(async (item) => ({ ...item, mediaType: item.mediaType ?? 'video' as MediaKind, width: item.width ?? 1920, height: item.height ?? 1080, url: await restoreUrl(item.sourcePath, item.embeddedSource, item.url) })))
      const loadedClips = await Promise.all(document.clips.map(async (item) => normalizeClip({ ...item, sourceUrl: await restoreUrl(item.sourcePath, item.embeddedSource, item.sourceUrl) })))
      const loadedAudioClips = await Promise.all((document.audioClips ?? []).map(async (item) => ({ ...item, sourceUrl: await restoreUrl(item.sourcePath, item.embeddedSource, item.sourceUrl) })))
      const loadedStickerClips = await Promise.all((document.stickerClips ?? []).map(async (item) => normalizeSticker({ ...item, src: await restoreUrl(item.sourcePath, item.embeddedSource, item.src) })))
      const loadedGifAssets = await Promise.all((document.importedGifAssets ?? []).map(async (item) => ({ ...item, src: await restoreUrl(item.sourcePath, item.embeddedSource, item.src) })))
      new Set([...videoAssets.map((item) => item.url), ...audioClips.map((item) => item.sourceUrl), ...importedGifAssets.map((item) => item.src)].filter((url) => url.startsWith('blob:'))).forEach((url) => URL.revokeObjectURL(url))
      importedGifUrlsRef.current = []
      setTracks(orderTimelineTracks(document.tracks))
      setVideoAssets(loadedVideoAssets)
      setClips(loadedClips)
      setAudioClips(loadedAudioClips)
      setTextClips(document.textClips ?? [])
      setStickerClips(loadedStickerClips)
      setCaptionClips(document.captionClips ?? [])
      setImportedGifAssets(loadedGifAssets)
      loadedGifAssets.forEach((asset) => { const image = new Image(); image.src = asset.src; stickerImagesRef.current.set(asset.src, image) })
      const settings = document.settings
      setDuration(settings?.duration ?? Math.max(15, ...loadedClips.map((item) => item.start + item.duration)))
      setCurrentTime(settings?.currentTime ?? 0)
      setSelectedClip(settings?.selectedClip ?? loadedClips[0]?.id ?? 0)
      setSelectedAudioClip(settings?.selectedAudioClip ?? 0)
      setSelectedTextClip(settings?.selectedTextClip ?? 0)
      setSelectedStickerClip(settings?.selectedStickerClip ?? 0)
      setSelectedCaptionClip(settings?.selectedCaptionClip ?? 0)
      const loadedZoom = settings?.zoom ?? 1
      setZoom(loadedZoom); setZoomPercentInput(formatZoomPercent(loadedZoom))
      setSpeed(settings?.speed ?? 1); setVolume(settings?.volume ?? 100); setVideoOpacity(settings?.videoOpacity ?? 100)
      setBrightness(settings?.brightness ?? 0); setContrast(settings?.contrast ?? 0); setSaturation(settings?.saturation ?? 0)
      setExportCodec(settings?.exportCodec ?? 'vp9'); setExportResolution(settings?.exportResolution ?? '1080p'); setExportFrameRate(settings?.exportFrameRate ?? 30)
      setCanvasPreset(settings?.canvasPreset ?? '16:9'); setCanvasWidth(settings?.canvasWidth ?? 1920); setCanvasHeight(settings?.canvasHeight ?? 1080)
      setSnappingEnabled(settings?.snappingEnabled ?? true)
      const firstVideo = loadedClips.find((item) => item.sourceUrl)
      const firstAudio = loadedAudioClips.find((item) => item.sourceUrl)
      setVideoUrl(firstVideo?.sourceUrl ?? '')
      setFileName(loadedVideoAssets[0]?.name ?? firstVideo?.label ?? 'video.mp4')
      setAudioUrl(firstAudio?.sourceUrl ?? ''); setAudioName(firstAudio?.label ?? '')
      setIsAudioDetached(loadedAudioClips.some((audioClip) => loadedClips.some((videoClip) => audioClip.sourcePath && audioClip.sourcePath === videoClip.sourcePath)))
      setProjectName(document.projectName || t('untitledProject'))
      setProjectFilePath(opened.filePath)
      setExportPath('')
      setActiveTool('media')
      setToast(t('projectOpened'))
    } catch {
      setToast(t('projectOpenFailed'))
    }
  }

  const defaultExportName = `${fileName.replace(/\.[^.]+$/, '') || 'lumacut-project'}-lumacut.webm`
  const chooseExportPath = async () => {
    const selected = await window.lumacut?.chooseExportPath(defaultExportName)
    if (selected) setExportPath(selected)
    return selected ?? ''
  }
  const formatEta = (totalSeconds: number) => {
    const safe = Math.max(0, Math.round(totalSeconds))
    const minutes = Math.floor(safe / 60)
    const seconds = safe % 60
    return minutes ? `${minutes}m ${seconds.toString().padStart(2, '0')}s` : `${seconds}s`
  }

  const exportVideo = async () => {
    const canvas = canvasRef.current
    const orderedMediaClips = clips.filter((item) => item.sourceUrl).sort((a, b) => a.start - b.start)
    if (!orderedMediaClips.length || !canvas) return setToast(t('exportFirst'))
    const video = document.createElement('video')
    video.preload = 'auto'
    video.playsInline = true
    video.muted = true
    let destinationPath = exportPath
    if (window.lumacut && !destinationPath) {
      destinationPath = await chooseExportPath()
      if (!destinationPath) return
    }
    setIsExporting(true)
    setExportFinished(false)
    setExportProgress(0)
    setExportEtaSeconds(null)
    exportProgressTimeRef.current = 0
    setToast(t('preparingVideo'))
    const exportStartedAt = performance.now()
    const exportTimelineDuration = Math.max(.1, ...orderedMediaClips.map((clip) => clip.start + clip.duration))
    const reportExportProgress = (exportTime: number, force = false) => {
      const now = performance.now()
      if (!force && now - exportProgressTimeRef.current < 180) return
      exportProgressTimeRef.current = now
      const ratio = Math.max(0, Math.min(.99, exportTime / exportTimelineDuration))
      const elapsed = (now - exportStartedAt) / 1000
      setExportProgress(Math.round(ratio * 100))
      setExportEtaSeconds(ratio > .005 ? Math.max(0, elapsed / ratio * (1 - ratio)) : null)
    }
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
      const firstVideoClip = orderedMediaClips.find((clip) => clip.mediaType === 'video')
      if (firstVideoClip) await loadVideoClip(firstVideoClip)
      const ctx = canvas.getContext('2d')!
      const resolution = exportResolutionOptions.find((option) => option.value === exportResolution) ?? exportResolutionOptions[3]
      if (resolution.value === 'source') { canvas.width = canvasWidth; canvas.height = canvasHeight }
      else {
        const longEdge = Math.max(resolution.width, resolution.height)
        const ratio = canvasWidth / canvasHeight
        canvas.width = Math.max(2, Math.round((ratio >= 1 ? longEdge : longEdge * ratio) / 2) * 2)
        canvas.height = Math.max(2, Math.round((ratio >= 1 ? longEdge / ratio : longEdge) / 2) * 2)
      }
      const stream = canvas.captureStream(exportFrameRate)
      const mediaStreamVideo = video as HTMLVideoElement & { captureStream?: () => MediaStream }
      const mediaStreamAudio = audioRef.current as (HTMLAudioElement & { captureStream?: () => MediaStream }) | null
      if (audioClips.length > 0) { ensureAudioGraph(); await audioContextRef.current?.resume() }
      if (audioClips.length > 0 && audioDestinationRef.current) audioDestinationRef.current.stream.getAudioTracks().forEach((track) => stream.addTrack(track))
      else if (audioClips.length > 0 && mediaStreamAudio?.captureStream) mediaStreamAudio.captureStream().getAudioTracks().forEach((track) => stream.addTrack(track))
      else mediaStreamVideo.captureStream?.().getAudioTracks().forEach((track) => stream.addTrack(track))
      const requestedMimeType = `video/webm;codecs=${exportCodec}`
      const mimeType = MediaRecorder.isTypeSupported(requestedMimeType) ? requestedMimeType : MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm'
      const pixels = canvas.width * canvas.height
      const videoBitsPerSecond = Math.round(Math.max(2_000_000, Math.min(36_000_000, pixels * exportFrameRate * .16)))
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond })
      const exportTransitionVideo = document.createElement('video')
      exportTransitionVideo.preload = 'auto'
      exportTransitionVideo.muted = true
      exportTransitionVideo.playbackRate = speed
      exportTransitionVideo.load()
      const exportImages = new Map<string, HTMLImageElement>()
      const loadImageClip = async (clip: Clip) => {
        const cached = exportImages.get(clip.sourceUrl)
        if (cached?.complete && cached.naturalWidth) return cached
        const image = cached ?? new Image()
        exportImages.set(clip.sourceUrl, image)
        if (!image.src) image.src = clip.sourceUrl
        if (!image.complete || !image.naturalWidth) await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('image-load-failed')) })
        return image
      }
      await Promise.all(orderedMediaClips.filter((clip) => clip.mediaType === 'image').map(loadImageClip))
      const chunks: Blob[] = []
      recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data)
      const finished = new Promise<void>((resolve) => { recorder.onstop = () => resolve() })
      video.muted = true
      recorder.start(250)
      const drawVideoLayer = (source: HTMLVideoElement | HTMLImageElement, frame: VisualFrame, effectClip?: Clip, timelineTime = 0) => {
        const ready = source instanceof HTMLVideoElement ? source.readyState >= 2 : source.complete && source.naturalWidth > 0
        if (!ready || frame.opacity <= 0) return
        const naturalWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth
        const naturalHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight
        const cropLeft = effectClip?.cropLeft ?? 0
        const cropRight = effectClip?.cropRight ?? 0
        const cropTop = effectClip?.cropTop ?? 0
        const cropBottom = effectClip?.cropBottom ?? 0
        const sourceX = naturalWidth * cropLeft / 100
        const sourceY = naturalHeight * cropTop / 100
        const sourceWidth = Math.max(1, naturalWidth * (1 - (cropLeft + cropRight) / 100))
        const sourceHeight = Math.max(1, naturalHeight * (1 - (cropTop + cropBottom) / 100))
        const canvasScale = effectClip?.mediaFit === 'fit' ? Math.min(canvas.width / sourceWidth, canvas.height / sourceHeight) : Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight)
        const drawWidth = sourceWidth * canvasScale
        const drawHeight = sourceHeight * canvasScale
        ctx.save()
        ctx.filter = `${filter} ${videoEffectFilter(effectClip?.videoEffect ?? 'none', effectClip?.effectIntensity ?? 0)}`
        ctx.globalAlpha = frame.opacity * videoOpacity / 100
        const position = effectClip ? positionAtTimelineTime(effectClip, timelineTime) : { x: 0, y: 0 }
        ctx.translate(canvas.width * (.5 + (frame.x + position.x) / 100), canvas.height * (.5 + (frame.y + position.y) / 100))
        const clipScale = (effectClip?.scale ?? 100) / 100
        ctx.scale(frame.scale * clipScale * (effectClip?.scaleX ?? 100) / 100, frame.scale * clipScale * (effectClip?.scaleY ?? 100) / 100)
        ctx.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        ctx.restore()
      }
      const drawVideoEffectOverlay = (clip: Clip, exportTime: number) => {
        const amount = Math.max(0, Math.min(1, clip.effectIntensity / 100))
        if (!amount || clip.videoEffect === 'none' || clip.videoEffect === 'blur' || clip.videoEffect === 'soft') return
        ctx.save()
        ctx.filter = 'none'
        if (clip.videoEffect === 'film') {
          const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width * .12, canvas.width / 2, canvas.height / 2, canvas.width * .72)
          vignette.addColorStop(0, 'rgba(0,0,0,0)')
          vignette.addColorStop(1, `rgba(20,8,2,${.48 * amount})`)
          ctx.fillStyle = vignette
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else if (clip.videoEffect === 'lightLeak') {
          const pulse = .78 + Math.sin(exportTime * 2.4) * .12
          const leak = ctx.createRadialGradient(canvas.width * .9, canvas.height * .2, 0, canvas.width * .9, canvas.height * .2, canvas.width * .72)
          leak.addColorStop(0, `rgba(255,224,126,${.58 * amount * pulse})`)
          leak.addColorStop(.35, `rgba(255,82,82,${.3 * amount * pulse})`)
          leak.addColorStop(1, 'rgba(255,40,80,0)')
          ctx.fillStyle = leak
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else if (clip.videoEffect === 'grain') {
          const tick = Math.floor(exportTime * 18)
          ctx.fillStyle = `rgba(255,255,255,${.22 * amount})`
          for (let index = 0; index < 260; index += 1) {
            const x = (index * 733 + tick * 97) % canvas.width
            const y = (index * 379 + tick * 53) % canvas.height
            const size = 1 + ((index + tick) % 3)
            ctx.fillRect(x, y, size, size)
          }
        } else if (clip.videoEffect === 'VHS') {
          ctx.fillStyle = `rgba(2,8,18,${.22 * amount})`
          for (let y = 0; y < canvas.height; y += 7) ctx.fillRect(0, y, canvas.width, 2)
          const bandY = (exportTime * 95) % (canvas.height + 80) - 40
          ctx.fillStyle = `rgba(100,235,255,${.14 * amount})`
          ctx.fillRect(0, bandY, canvas.width, 24)
        }
        ctx.restore()
      }
      const renderFrame = (exportTime: number, exportClip?: Clip) => {
        reportExportProgress(exportTime)
        const exportAudioClip = audioClips.find((item) => exportTime >= item.start && exportTime < item.start + item.duration)
        if (audioGainNodeRef.current && audioContextRef.current) {
          const gain = exportAudioClip ? audioClipGain(exportAudioClip, exportTime) : 0
          audioGainNodeRef.current.gain.setValueAtTime(gain, audioContextRef.current.currentTime)
        }
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
          if (exportPrevious.mediaType === 'image') drawVideoLayer(exportImages.get(exportPrevious.sourceUrl)!, transition.previous, exportPrevious, exportTime)
          else {
            if (exportTransitionVideo.getAttribute('src') !== exportPrevious.sourceUrl) { exportTransitionVideo.src = exportPrevious.sourceUrl; exportTransitionVideo.load() }
            if (exportTransitionVideo.readyState >= 1) {
              if (Math.abs(exportTransitionVideo.currentTime - wanted) > .1) exportTransitionVideo.currentTime = Math.max(exportPrevious.offset, wanted)
              if (exportTransitionVideo.paused) void exportTransitionVideo.play().catch(() => undefined)
              drawVideoLayer(exportTransitionVideo, transition.previous, exportPrevious, exportTime)
            }
          }
        } else exportTransitionVideo.pause()
        if (exportClip) {
          drawVideoLayer(exportClip.mediaType === 'image' ? exportImages.get(exportClip.sourceUrl)! : video, videoFrame, exportClip, exportTime)
          drawVideoEffectOverlay(exportClip, exportTime)
        }
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
          const sourceX = image.naturalWidth * item.cropLeft / 100
          const sourceY = image.naturalHeight * item.cropTop / 100
          const sourceWidth = Math.max(1, image.naturalWidth * (1 - (item.cropLeft + item.cropRight) / 100))
          const sourceHeight = Math.max(1, image.naturalHeight * (1 - (item.cropTop + item.cropBottom) / 100))
          ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, -size / 2, -size / 2, size, size)
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
      for (const clip of orderedMediaClips) {
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
        if (clip.mediaType === 'image') {
          const imageStartedAt = performance.now()
          await new Promise<void>((resolve) => {
            const drawImageClip = () => {
              const exportTime = Math.min(clip.start + clip.duration, clip.start + (performance.now() - imageStartedAt) / 1000 * speed)
              renderFrame(exportTime, clip)
              setCurrentTime(exportTime)
              if (exportTime >= clip.start + clip.duration - .02) resolve()
              else requestAnimationFrame(drawImageClip)
            }
            drawImageClip()
          })
        } else {
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
        }
        timelineCursor = clip.start + clip.duration
      }
      exportTransitionVideo.pause()
      recorder.stop(); await finished
      const blob = new Blob(chunks, { type: 'video/webm' })
      if (window.lumacut && destinationPath) {
        const bytes = new Uint8Array(await blob.arrayBuffer())
        await window.lumacut.saveExportFile(destinationPath, bytes)
      } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob); link.download = defaultExportName; link.click()
        URL.revokeObjectURL(link.href)
      }
      reportExportProgress(exportTimelineDuration, true)
      setExportProgress(100)
      setExportEtaSeconds(0)
      setExportFinished(true)
      setToast(t('exportSuccess'))
    } catch { setToast(t('exportFailed')) }
    finally { setIsExporting(false) }
  }

  return (
    <main className="app-shell" onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop}>
      {isDragging && <div className="drop-overlay"><Upload size={34} /><strong>{t('dropTitle')}</strong><span>{t('dropDescription')}</span></div>}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
      {exportDialogOpen && <div className="export-modal-backdrop">
        <section className="export-modal" role="dialog" aria-modal="true" aria-label={t('exportSettings')}>
          <header><div><Download size={19}/><span><strong>{t('exportSettings')}</strong><small>{t('exportSettingsHint')}</small></span></div><button disabled={isExporting} onClick={() => setExportDialogOpen(false)}><X size={17}/></button></header>
          <div className="export-settings-grid">
            <label>{t('encoder')}<select value={exportCodec} disabled={isExporting} onChange={(event) => setExportCodec(event.target.value as ExportCodec)}><option value="vp9">VP9 · {t('betterQuality')}</option><option value="vp8">VP8 · {t('fasterEncoding')}</option></select></label>
            <label>{t('resolution')}<select value={exportResolution} disabled={isExporting} onChange={(event) => setExportResolution(event.target.value as ExportResolution)}>{exportResolutionOptions.map((option) => <option key={option.value} value={option.value}>{option.value === 'source' ? t('sourceResolution') : option.label}</option>)}</select></label>
            <label>{t('frameRate')}<select value={exportFrameRate} disabled={isExporting} onChange={(event) => setExportFrameRate(Number(event.target.value))}>{exportFrameRates.map((rate) => <option key={rate} value={rate}>{rate} fps</option>)}</select></label>
          </div>
          <div className="export-location-section"><label>{t('saveLocation')}</label><button disabled={isExporting} onClick={() => void chooseExportPath()}><FolderOpen size={17}/><span title={exportPath}>{exportPath || t('chooseExportLocation')}</span><small>{t('browse')}</small></button></div>
          {(isExporting || exportFinished) && <div className="export-progress-card"><div><strong>{exportFinished ? t('exportComplete') : t('encodingVideo')}</strong><b>{exportProgress}%</b></div><progress max="100" value={exportProgress}/><span>{exportFinished ? t('fileSavedAt', { path: exportPath || t('downloadsFolder') }) : exportEtaSeconds === null ? t('estimatingTime') : t('estimatedRemaining', { time: formatEta(exportEtaSeconds) })}</span></div>}
          <footer><button className="export-cancel" disabled={isExporting} onClick={() => setExportDialogOpen(false)}>{exportFinished ? t('close') : t('cancel')}</button><button className="export-start" disabled={isExporting || exportFinished} onClick={() => void exportVideo()}>{isExporting ? <><span className="export-spinner"/>{t('encoding')} {exportProgress}%</> : exportFinished ? <><Check size={16}/>{t('completed')}</> : <><Download size={16}/>{t('startExport')}</>}</button></footer>
        </section>
      </div>}
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><img src="./lumacut-icon.png" alt="" /></div><strong>LumaCut</strong></div>
        <div className="project-editor"><span className="save-dot"/><input value={projectName} maxLength={80} onChange={(event) => setProjectName(event.target.value)} onBlur={() => { if (!projectName.trim()) setProjectName(t('untitledProject')) }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }} aria-label={t('projectName')}/><button disabled={isSavingProject} onClick={() => void saveProject()} title={`${t('saveProject')} (Ctrl+S)`}>{isSavingProject ? <span className="project-save-spinner"/> : <Save size={15}/>}</button><button disabled={isSavingProject} onClick={() => void openProject()} title={`${t('openProject')} (Ctrl+O)`}><FolderOpen size={15}/></button></div>
        <div className="top-actions"><button className="icon-button"><Undo2 size={17} /></button><button className="icon-button muted"><Redo2 size={17} /></button><button className="export-button" onClick={() => {setExportDialogOpen(true);setExportFinished(false);setExportProgress(0);setExportEtaSeconds(null)}} disabled={isExporting}><Download size={16} />{isExporting ? `${t('exporting')} ${exportProgress}%` : t('export')}</button><div className="language-switcher"><button className="language-button" onClick={() => setLanguageMenuOpen((open) => !open)} aria-label={t('language')} aria-expanded={languageMenuOpen}><Globe2 size={15}/><span>{languageOptions.find((option) => option.code === language)?.short}</span><ChevronDown size={12}/></button>{languageMenuOpen && <div className="language-menu" role="menu">{languageOptions.map((option) => <button key={option.code} className={language === option.code ? 'active' : ''} onClick={() => {setLanguage(option.code);setLanguageMenuOpen(false)}} role="menuitem"><span>{option.label}</span>{language === option.code && <Check size={13}/>}</button>)}</div>}</div><button className="icon-button"><Menu size={18} /></button></div>
      </header>

      <section className="workspace">
        <nav className="tool-rail">{toolItems.map(({ id, labelKey, icon: Icon }) => <button key={id} className={activeTool === id ? 'active' : ''} onClick={() => setActiveTool(id)}><Icon size={20} strokeWidth={1.8} /><span>{t(labelKey)}</span></button>)}</nav>
        <aside className="asset-panel">
          <div className="panel-heading"><div><span>{t('myLibrary')}</span><h2>{t(toolItems.find((item) => item.id === activeTool)?.labelKey ?? 'media')}</h2></div><button className="icon-button"><X size={16} /></button></div>
          {activeTool === 'media' && <>
            <button className="import-button" onClick={() => fileInput.current?.click()}><Plus size={17} />{t('importMedia')}</button>
            <input ref={fileInput} type="file" accept="video/*,image/jpeg,image/png,image/webp,image/bmp" multiple onChange={(event: ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files ?? []); event.currentTarget.value = ''; void importFiles(files) }} hidden />
            <p className="section-label">{t('inProject')}</p>
            <div className="media-list">{videoAssets.length ? videoAssets.map((asset, index) => <div key={asset.id} className="media-card-shell"><button className="media-card" onClick={() => { const clip = clips.find((item) => item.sourceUrl === asset.url); if (clip) { setSelectedClip(clip.id); seek(clip.start) } }}><div className={`media-thumb ${asset.mediaType === 'image' ? 'image-thumb' : ''}`}>{asset.mediaType === 'image' ? <img src={asset.url} alt=""/> : <><div className="thumb-sun"/><div className="thumb-mountain"/><CirclePlay size={24}/></>}<b>{index + 1}</b></div><div className="media-meta"><strong>{asset.name}</strong><span>{asset.mediaType === 'image' ? t('stillImage') : formatTime(asset.duration).slice(0, 5)} · {t('yourFile')}</span></div></button><button className="media-delete-button" onClick={() => deleteMediaAsset(asset)} title={t('deleteMedia')} aria-label={t('deleteMedia')}><Trash2 size={14}/></button></div>) : <button className="media-card" onClick={() => fileInput.current?.click()}><div className="media-thumb"><div className="thumb-sun"/><div className="thumb-mountain"/><CirclePlay size={24}/></div><div className="media-meta"><strong>{fileName}</strong><span>{formatTime(duration).slice(0, 5)} · {t('sample')}</span></div></button>}</div>
            <button className={`extract-audio-button ${isSelectedVideoDetached ? 'done' : ''}`} onClick={detachAudioFromVideo} disabled={!selectedVideoSource || activeClip?.mediaType === 'image' || isSelectedVideoDetached}><AudioLines size={17}/>{isSelectedVideoDetached ? t('detachedDone') : t('detachAudio')}</button>
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
          {activeTool === 'effects' && <div className="video-effect-library">
            <p className="section-label">{t('videoEffects')}</p>
            <div className="effect-grid">{videoEffectOptions.map((option, index) => <button key={option.value} className={effectTarget?.videoEffect === option.value ? 'active' : ''} style={{'--hue': `${180 + index * 24}`} as CSSProperties} onClick={() => applyVideoEffect(option.value)}><i className={`effect-thumb effect-${option.value}`}><WandSparkles size={18}/></i><span>{t(option.labelKey)}</span></button>)}</div>
            {effectTarget ? <label className="effect-intensity">{t('effectIntensity')} <span>{effectTarget.effectIntensity}%</span><input type="range" min="0" max="100" step="1" value={effectTarget.effectIntensity} onChange={(event) => updateVideoEffectIntensity(Number(event.target.value))}/></label> : <div className="caption-empty effect-empty">{t('selectVideoForEffect')}</div>}
          </div>}
          {activeTool === 'stickers' && <div className="sticker-library">
            <button className="import-button" onClick={() => gifInput.current?.click()}><Upload size={16}/>{t('importGif')}</button>
            <input ref={gifInput} type="file" accept=".gif,image/gif" onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ''; importGif(file) }} hidden/>
            <input value={stickerSearch} onChange={(event) => setStickerSearch(event.target.value)} placeholder={t('searchStickers')}/>
            <div className="sticker-category-tabs"><button className={stickerCategory === 'all' ? 'active' : ''} onClick={() => setStickerCategory('all')}>{t('allAssets')}</button><button className={stickerCategory === 'sticker' ? 'active' : ''} onClick={() => setStickerCategory('sticker')}>{t('stillStickers')}</button><button className={stickerCategory === 'gif' ? 'active' : ''} onClick={() => setStickerCategory('gif')}>{t('gifMemes')}</button></div>
            <div className="sticker-grid">{filteredStickerAssets.map((asset) => <button key={asset.src} className={asset.kind === 'gif' ? 'gif-asset' : ''} onClick={() => addSticker(asset)} title={asset.name}><img src={asset.src} alt=""/>{asset.kind === 'gif' && <b>GIF</b>}<span>{asset.name}</span></button>)}</div>
            {!filteredStickerAssets.length && <div className="caption-empty">{t('noStickers')}</div>}
            <a className="sticker-credit" href="https://openmoji.org/" target="_blank" rel="noreferrer">{t('stickerCredit')}</a>
            <p className="sticker-credit meme-credit">{t('memeGifCredit')}</p>
          </div>}
        </aside>

        <section className="editor-stage"><div className="preview-wrap">
          <div className="canvas-toolbar"><span>{t('canvasRatio')}</span><div className="canvas-presets">{canvasPresets.map((preset) => <button key={preset.value} className={canvasPreset === preset.value ? 'active' : ''} onClick={() => applyCanvasPreset(preset.value)}>{preset.value}</button>)}<button className={canvasPreset === 'custom' ? 'active' : ''} onClick={() => setCanvasPreset('custom')}>{t('custom')}</button></div>{canvasPreset === 'custom' && <div className="custom-canvas-size"><input type="number" min="64" max="8192" value={canvasWidth} onChange={(event) => commitCanvasDimension('width', Number(event.target.value))} aria-label={t('canvasWidth')}/><span>×</span><input type="number" min="64" max="8192" value={canvasHeight} onChange={(event) => commitCanvasDimension('height', Number(event.target.value))} aria-label={t('canvasHeight')}/></div>}</div>
          <div className={`preview-canvas ${previewCheckerboard ? 'checkerboard' : ''} ${showCenterGuides ? 'show-center-guides' : ''}`} style={{aspectRatio: `${canvasWidth}/${canvasHeight}`, '--canvas-ratio': canvasWidth / canvasHeight, width: previewZoom === 'fit' ? undefined : `${previewZoom}%`, maxWidth: previewZoom === 'fit' ? undefined : 'none'} as CSSProperties}>
            {currentTransition.active && previousVideoClip && <div className={`preview-media-layer transition-outgoing ${previousVideoClip.mediaFit === 'fit' ? 'fit-media' : ''}`} style={{filter: outgoingVideoFilter, clipPath: outgoingCrop, opacity: currentTransition.previous.opacity * videoOpacity / 100, transform: `translate(${currentTransition.previous.x + outgoingPosition.x}%, ${currentTransition.previous.y + outgoingPosition.y}%) scale(${currentTransition.previous.scale * previousVideoClip.scale * previousVideoClip.scaleX / 10000}, ${currentTransition.previous.scale * previousVideoClip.scale * previousVideoClip.scaleY / 10000})`}}>{previousVideoClip.sourceUrl ? previousVideoClip.mediaType === 'image' ? <img src={previousVideoClip.sourceUrl} alt=""/> : <video ref={transitionVideoRef} src={previousVideoClip.sourceUrl} muted playsInline/> : <div className="demo-scene"><div className="demo-sky"/><div className="demo-sun"/><div className="demo-ridge ridge-one"/><div className="demo-ridge ridge-two"/><span className="demo-tag">TRAVEL FILM</span></div>}</div>}
            <div className={`preview-media-layer ${previewMediaClip?.mediaFit === 'fit' ? 'fit-media' : ''} ${selectedClip && previewMediaClip?.id === selectedClip ? 'selected-media' : ''}`} style={{filter: previewVideoFilter, clipPath: previewCrop, opacity: videoMotion.opacity * videoOpacity / 100, transform: `translate(${videoMotion.x + previewPosition.x}%, ${videoMotion.y + previewPosition.y}%) scale(${videoMotion.scale * (previewMediaClip?.scale ?? 100) * (previewMediaClip?.scaleX ?? 100) / 10000}, ${videoMotion.scale * (previewMediaClip?.scale ?? 100) * (previewMediaClip?.scaleY ?? 100) / 10000})`}} onPointerDown={(event) => previewMediaClip && beginMediaPosition(event, previewMediaClip)} onPointerMove={moveMediaPosition} onPointerUp={endMediaPosition} onPointerCancel={endMediaPosition}>{previewVideoUrl ? previewMediaType === 'image' ? <img src={previewVideoUrl} alt={previewMediaClip?.label ?? ''}/> : <video ref={videoRef} src={previewVideoUrl} muted={previewMuted || isCurrentVideoDetached} onLoadedMetadata={(event) => { const clip = currentVideoClip; if (!clip) return; event.currentTarget.currentTime = Math.max(0, clip.offset + currentTime - clip.start); if (isPlaying) void event.currentTarget.play().catch(() => undefined) }} onTimeUpdate={(event) => { const clip = currentVideoClip; if (!clip || event.currentTarget.getAttribute('src') !== clip.sourceUrl) return; const mapped = clip.start + event.currentTarget.currentTime - clip.offset; if (mapped >= clip.start + clip.duration - .03) { const next = [...clips].filter((item) => item.trackId === clip.trackId && item.start >= clip.start + clip.duration - .1).sort((a, b) => a.start - b.start)[0]; if (next && Math.abs(next.start - (clip.start + clip.duration)) < .11) { setCurrentTime(next.start); if (next.sourceUrl === clip.sourceUrl) event.currentTarget.currentTime = next.offset } else { event.currentTarget.pause(); setIsPlaying(false); setCurrentTime(clip.start + clip.duration) } } else setCurrentTime(Math.max(clip.start, mapped)) }} onPlay={() => setIsPlaying(true)} onEnded={() => { const clip = currentVideoClip; const next = clip ? [...clips].filter((item) => item.trackId === clip.trackId && item.start >= clip.start + clip.duration - .1).sort((a, b) => a.start - b.start)[0] : undefined; if (clip && next && Math.abs(next.start - (clip.start + clip.duration)) < .11) { setCurrentTime(next.start); setIsPlaying(true) } else setIsPlaying(false) }} /> : <div className="demo-scene"><div className="demo-sky"/><div className="demo-sun"/><div className="demo-ridge ridge-one"/><div className="demo-ridge ridge-two"/><span className="demo-tag">TRAVEL FILM</span></div>}</div>
            {showTransformControls && selectedClip && previewMediaClip?.id === selectedClip && <div className="media-transform-overlay" style={{transform: `translate(${videoMotion.x + previewPosition.x}%, ${videoMotion.y + previewPosition.y}%) scale(${videoMotion.scale * previewMediaClip.scale * previewMediaClip.scaleX / 10000}, ${videoMotion.scale * previewMediaClip.scale * previewMediaClip.scaleY / 10000})`}}><div className="media-selection-box" style={previewMediaSelectionStyle}><span className="media-scale-badge">{Math.round(previewMediaClip.scale)}% · ↔ {Math.round(previewMediaClip.scaleX)}% · ↕ {Math.round(previewMediaClip.scaleY)}%</span>{(['nw', 'ne', 'sw', 'se'] as const).map((corner) => <button key={corner} className={`media-scale-handle ${corner}`} aria-label={t('resizeMedia')} title={t('resizeMedia')} onPointerDown={(event) => beginMediaScale(event, previewMediaClip)} onPointerMove={moveMediaScale} onPointerUp={endMediaScale} onPointerCancel={endMediaScale}/>)}{(['w', 'e'] as const).map((side) => <button key={side} className={`media-axis-handle ${side}`} aria-label={t('resizeMediaWidth')} title={t('resizeMediaWidth')} onPointerDown={(event) => beginMediaAxisScale(event, previewMediaClip, 'horizontal')} onPointerMove={moveMediaAxisScale} onPointerUp={endMediaAxisScale} onPointerCancel={endMediaAxisScale}/>)}{(['n', 's'] as const).map((side) => <button key={side} className={`media-axis-handle ${side}`} aria-label={t('resizeMediaHeight')} title={t('resizeMediaHeight')} onPointerDown={(event) => beginMediaAxisScale(event, previewMediaClip, 'vertical')} onPointerMove={moveMediaAxisScale} onPointerUp={endMediaAxisScale} onPointerCancel={endMediaAxisScale}/>)}</div></div>}
            {showTransformControls && selectedClip && previewMediaClip?.id === selectedClip && <div className="media-position-measurement" aria-live="polite"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="50" y1="50" x2={50 + previewPositionXPercent} y2={50 + previewPositionYPercent}/></svg><i className="canvas-center-point"/><i className="media-center-point" style={{left: `${50 + previewPositionXPercent}%`, top: `${50 + previewPositionYPercent}%`}}/><span style={{left: `${Math.max(13, Math.min(87, 50 + previewPositionXPercent))}%`, top: `${Math.max(10, Math.min(90, 50 + previewPositionYPercent))}%`}}>{t('centerOffset')} · X {formatSigned(previewPositionXPixels)} px ({formatSigned(previewPositionXPercent, 1)}%) · Y {formatSigned(previewPositionYPixels)} px ({formatSigned(previewPositionYPercent, 1)}%)</span></div>}
            {previewEffectClip && previewEffectClip.videoEffect !== 'none' && <div className={`video-effect-overlay effect-${previewEffectClip.videoEffect}`} style={{'--effect-intensity': previewEffectClip.effectIntensity / 100} as CSSProperties}/>}
            {textClips.filter((item) => currentTime >= item.start && currentTime < item.start + item.duration).map((item) => { const motion = animationFrame(item.animation, item.start, item.duration, item.animationDuration, currentTime); const isTyping = item.animation === 'typewriter' && currentTime < item.start + Math.min(item.animationDuration, item.duration); return <div key={item.id} className={`video-text-layer ${selectedTextClip === item.id ? 'selected' : ''}`} style={{left: `calc(${item.x}% + ${motion.x}%)`, top: `calc(${item.y}% + ${motion.y}%)`, fontSize: item.fontSize, fontFamily: item.fontFamily, color: item.color, opacity: item.opacity / 100 * motion.opacity, fontWeight: item.bold ? 700 : 400, transform: `translate(-50%, -50%) scale(${motion.scale})`, ...textEffectStyle(item)}} onPointerDown={(e) => beginTextPosition(e, item)} onPointerMove={moveTextPosition} onPointerUp={endTextPosition} onPointerCancel={endTextPosition}><span className={isTyping ? 'typewriter-active' : ''}>{animatedText(item.text, item.animation, item.start, item.duration, item.animationDuration, currentTime)}</span>{selectedTextClip === item.id && <><i className="text-handle nw"/><i className="text-handle ne"/><i className="text-handle sw"/><i className="text-handle se"/></>}</div>})}
            {stickerClips.filter((item) => currentTime >= item.start && currentTime < item.start + item.duration).map((item) => { const motion = animationFrame(item.animation, item.start, item.duration, item.animationDuration, currentTime); return <button key={item.id} className={`video-sticker-layer ${selectedStickerClip === item.id ? 'selected' : ''}`} style={{left: `calc(${item.x}% + ${motion.x}%)`, top: `calc(${item.y}% + ${motion.y}%)`, width: `${item.size}%`, opacity: item.opacity / 100 * motion.opacity, transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${motion.scale})`}} onPointerDown={(event) => beginStickerPosition(event, item)} onPointerMove={moveStickerPosition} onPointerUp={endStickerPosition} onPointerCancel={endStickerPosition}><img src={item.src} alt={item.name} style={{clipPath: `inset(${item.cropTop}% ${item.cropRight}% ${item.cropBottom}% ${item.cropLeft}%)`}}/></button>})}
            {captionClips.filter((item) => currentTime >= item.start && currentTime < item.start + item.duration).map((item) => <button key={item.id} className={`video-caption-layer ${selectedCaptionClip === item.id ? 'selected' : ''}`} onClick={(event) => {event.stopPropagation();setSelectedCaptionClip(item.id);setSelectedStickerClip(0);setSelectedTextClip(0);setSelectedClip(0);setSelectedAudioClip(0);setActiveTool('captions')}}>{item.text}</button>)}
          </div>
          <div className="preview-controls">
            <span className="timecode">{formatTime(currentTime)} <i>/</i> {formatTime(projectDuration)}</span>
            <button onClick={() => seek(currentTime - 5)}><RotateCcw size={17}/></button>
            <button className="play-button" onClick={() => void togglePlayback()}>{isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}</button>
            <button onClick={() => seek(Math.min(projectDuration, currentTime + 5))}><RotateCcw className="forward" size={17}/></button>
            <div className="preview-right">
              <button className={previewMuted ? 'preview-control-active' : ''} onClick={() => setPreviewMuted((muted) => { setToast(t(muted ? 'previewUnmuted' : 'previewMuted')); return !muted })} title={t(previewMuted ? 'unmutePreview' : 'mutePreview')} aria-pressed={previewMuted}>{previewMuted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button>
              <div className="preview-menu-anchor">
                <button className={previewSettingsOpen ? 'preview-control-active' : ''} onClick={() => { setPreviewSettingsOpen((open) => !open); setPreviewZoomMenuOpen(false) }} title={t('previewSettings')} aria-expanded={previewSettingsOpen}><Settings2 size={17}/></button>
                {previewSettingsOpen && <div className="preview-popover preview-settings-popover"><strong>{t('previewSettings')}</strong><button className="preview-setting-row" onClick={() => setShowCenterGuides((value) => !value)}><span>{t('showCenterGuides')}</span><i className={showCenterGuides ? 'active' : ''}><b/></i></button><button className="preview-setting-row" onClick={() => setShowTransformControls((value) => !value)}><span>{t('showTransformControls')}</span><i className={showTransformControls ? 'active' : ''}><b/></i></button><button className="preview-setting-row" onClick={() => setPreviewCheckerboard((value) => !value)}><span>{t('checkerboardBackground')}</span><i className={previewCheckerboard ? 'active' : ''}><b/></i></button></div>}
              </div>
              <div className="preview-menu-anchor">
                <button className="fit-button" onClick={() => { setPreviewZoomMenuOpen((open) => !open); setPreviewSettingsOpen(false) }} aria-expanded={previewZoomMenuOpen} title={t('previewZoom')}>{previewZoom === 'fit' ? t('fit') : `${previewZoom}%`} <ChevronDown size={13}/></button>
                {previewZoomMenuOpen && <div className="preview-popover preview-zoom-popover"><strong>{t('previewZoom')}</strong>{(['fit', 50, 75, 100, 125, 150, 200] as PreviewZoom[]).map((option) => <button key={option} className={previewZoom === option ? 'active' : ''} onClick={() => { setPreviewZoom(option); setPreviewZoomMenuOpen(false) }}>{option === 'fit' ? t('fitPreview') : `${option}%`}{previewZoom === option && <Check size={13}/>}</button>)}</div>}
              </div>
            </div>
          </div>
        </div></section>

        <aside className="property-panel">
          {activeAudioClip ? <>
            <div className="properties-tabs"><button className="active">{t('audio')}</button></div>
            <div className="property-section audio-inspector"><h3><Volume2 size={16}/>{t('audioAdjust')}</h3><label>{t('clipVolume')} <span>{activeAudioClip.volume}%</span><input type="range" min="0" max="200" step="1" value={activeAudioClip.volume} onChange={(event) => updateAudioClip({volume: Number(event.target.value)})}/></label><div className="audio-volume-scale"><span>0%</span><span>100%</span><span>200%</span></div></div>
            <div className="property-section audio-fade-editor"><h3><AudioLines size={16}/>{t('audioFade')}</h3><label>{t('fadeInAudio')} <span>{Math.min(activeAudioClip.fadeIn, activeAudioClip.duration).toFixed(1)}s</span><input type="range" min="0" max={Math.max(.1, activeAudioClip.duration)} step="0.1" value={Math.min(activeAudioClip.fadeIn, activeAudioClip.duration)} onChange={(event) => updateAudioClip({fadeIn: Number(event.target.value)})}/></label><label>{t('fadeOutAudio')} <span>{Math.min(activeAudioClip.fadeOut, activeAudioClip.duration).toFixed(1)}s</span><input type="range" min="0" max={Math.max(.1, activeAudioClip.duration)} step="0.1" value={Math.min(activeAudioClip.fadeOut, activeAudioClip.duration)} onChange={(event) => updateAudioClip({fadeOut: Number(event.target.value)})}/></label><div className="audio-fade-diagram"><i style={{width: `${Math.min(50, activeAudioClip.fadeIn / Math.max(.1, activeAudioClip.duration) * 100)}%`}}/><b/><em style={{width: `${Math.min(50, activeAudioClip.fadeOut / Math.max(.1, activeAudioClip.duration) * 100)}%`}}/></div><p className="animation-hint">{t('audioFadeHint')}</p></div>
            <div className="property-section text-timing"><h3><Gauge size={16}/>{t('displayTime')}</h3><label>{t('start')}<input type="number" min="0" step="0.1" value={activeAudioClip.start} onChange={(event) => updateAudioClip({start: Math.max(0, Number(event.target.value))})}/><span>{t('seconds')}</span></label><label>{t('duration')}<input type="number" min="0.2" max={activeAudioClip.sourceDuration - activeAudioClip.offset} step="0.1" value={activeAudioClip.duration} onChange={(event) => updateAudioClip({duration: Math.max(.2, Math.min(activeAudioClip.sourceDuration - activeAudioClip.offset, Number(event.target.value)))})}/><span>{t('seconds')}</span></label></div>
            <button className="delete-text-button" onClick={deleteClip}><Trash2 size={14}/>{t('deleteAudio')}</button>
          </> : activeStickerClip ? <>
            <div className="properties-tabs"><button className={stickerInspectorTab === 'sticker' ? 'active' : ''} onClick={() => setStickerInspectorTab('sticker')}>{t('stickers')}</button><button className={stickerInspectorTab === 'animation' ? 'active' : ''} onClick={() => setStickerInspectorTab('animation')}>{t('animation')}</button></div>
            {stickerInspectorTab === 'animation' ? renderAnimationEditor(activeStickerClip, updateSticker, activeStickerClip.start, activeStickerClip.duration) : <>
            <div className="property-section sticker-inspector"><h3><Sticker size={16}/>{activeStickerClip.name}</h3><div className="sticker-inspector-preview"><img src={activeStickerClip.src} alt={activeStickerClip.name}/></div></div>
            <div className="property-section"><h3><SlidersHorizontal size={16}/>{t('format')}</h3><label>{t('size')} <span>{activeStickerClip.size}%</span><input type="range" min="8" max="60" value={activeStickerClip.size} onChange={(event) => updateSticker({size: Number(event.target.value)})}/></label><label>{t('rotate')} <span>{activeStickerClip.rotation}°</span><input type="range" min="-180" max="180" value={activeStickerClip.rotation} onChange={(event) => updateSticker({rotation: Number(event.target.value)})}/></label><label>{t('opacity')} <span>{activeStickerClip.opacity}%</span><input type="range" min="10" max="100" value={activeStickerClip.opacity} onChange={(event) => updateSticker({opacity: Number(event.target.value)})}/></label></div>
            <div className="property-section"><h3><MousePointer2 size={16}/>{t('position')}</h3><label>{t('horizontal')} <span>{Math.round(activeStickerClip.x)}%</span><input type="range" min="0" max="100" value={activeStickerClip.x} onChange={(event) => updateSticker({x: Number(event.target.value)})}/></label><label>{t('vertical')} <span>{Math.round(activeStickerClip.y)}%</span><input type="range" min="0" max="100" value={activeStickerClip.y} onChange={(event) => updateSticker({y: Number(event.target.value)})}/></label></div>
            <div className="property-section crop-editor"><h3><Crop size={16}/>{t('crop')}</h3>{([['cropLeft', 'left'], ['cropRight', 'right'], ['cropTop', 'top'], ['cropBottom', 'bottom']] as const).map(([edge, label]) => <label key={edge}>{t(label)} <span>{activeStickerClip[edge]}%</span><input type="range" min="0" max="45" value={activeStickerClip[edge]} onChange={(event) => updateStickerCrop(edge, Number(event.target.value))}/></label>)}<button className="inline-reset" onClick={() => updateSticker({cropLeft: 0, cropRight: 0, cropTop: 0, cropBottom: 0})}>{t('resetCrop')}</button></div>
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
            {activeClip && <><div className="property-section media-transform-editor"><h3><Crop size={16}/>{t('cropAndResize')}</h3><div className="media-fit-buttons"><button className={activeClip.mediaFit === 'fit' ? 'active' : ''} onClick={() => setMediaFit('fit')}>{t('fitToCanvas')}</button><button className={activeClip.mediaFit === 'fill' ? 'active' : ''} onClick={() => setMediaFit('fill')}>{t('fillCanvas')}</button></div><label>{t('scale')} <span className="media-scale-value"><input type="number" min="1" max="1000" step="1" value={Math.round(activeClip.scale)} onChange={(event) => updateVideoClip({scale: clampMediaScale(Number(event.target.value))})}/>%</span><input type="range" min="1" max="1000" step="1" value={activeClip.scale} onChange={(event) => updateVideoClip({scale: clampMediaScale(Number(event.target.value))})}/></label><label>{t('widthScale')} <span className="media-scale-value"><input type="number" min="1" max="1000" step="1" value={Math.round(activeClip.scaleX)} onChange={(event) => updateVideoClip({scaleX: clampMediaScale(Number(event.target.value))})}/>%</span><input type="range" min="1" max="1000" step="1" value={activeClip.scaleX} onChange={(event) => updateVideoClip({scaleX: clampMediaScale(Number(event.target.value))})}/></label><label>{t('heightScale')} <span className="media-scale-value"><input type="number" min="1" max="1000" step="1" value={Math.round(activeClip.scaleY)} onChange={(event) => updateVideoClip({scaleY: clampMediaScale(Number(event.target.value))})}/>%</span><input type="range" min="1" max="1000" step="1" value={activeClip.scaleY} onChange={(event) => updateVideoClip({scaleY: clampMediaScale(Number(event.target.value))})}/></label><label>{t('horizontal')} <span>{Math.round(activeClip.positionX)}%</span><input type="range" min="-100" max="100" value={activeClip.positionX} onChange={(event) => updateVideoClip({positionX: Number(event.target.value)})}/></label><label>{t('vertical')} <span>{Math.round(activeClip.positionY)}%</span><input type="range" min="-100" max="100" value={activeClip.positionY} onChange={(event) => updateVideoClip({positionY: Number(event.target.value)})}/></label><div className="media-position-readout"><strong>{t('centerOffset')}</strong><span>X {formatSigned(Math.round(canvasWidth * activeClip.positionX / 100))} px <small>({formatSigned(activeClip.positionX, 1)}%)</small></span><span>Y {formatSigned(Math.round(canvasHeight * activeClip.positionY / 100))} px <small>({formatSigned(activeClip.positionY, 1)}%)</small></span></div><p className="crop-hint">{t('dragMediaHint')}</p></div><div className="property-section crop-editor"><h3><Crop size={16}/>{t('cropEdges')}</h3>{([['cropLeft', 'left'], ['cropRight', 'right'], ['cropTop', 'top'], ['cropBottom', 'bottom']] as const).map(([edge, label]) => <label key={edge}>{t(label)} <span>{activeClip[edge]}%</span><input type="range" min="0" max="45" value={activeClip[edge]} onChange={(event) => updateMediaCrop(edge, Number(event.target.value))}/></label>)}<button className="inline-reset" onClick={resetMediaTransform}>{t('resetTransform')}</button></div></>}
            <div className="property-section"><h3><Gauge size={16}/>{t('speed')} <span>{speed.toFixed(1)}x</span></h3><input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}/><div className="range-labels"><span>0.5x</span><span>1x</span><span>2x</span></div></div>
            <div className="property-section"><h3><Volume2 size={16}/>{t('volume')} <span>{volume}%</span></h3><input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))}/></div>
            </> : videoInspectorTab === 'animation' ? activeClip ? <>{renderAnimationEditor(activeClip, updateVideoClip, activeClip.start, activeClip.duration)}{renderPositionKeyframeEditor(activeClip)}</> : <div className="caption-empty inspector-empty">{t('selectClipForAnimation')}</div> : videoInspectorTab === 'transition' ? activeClip ? renderTransitionEditor(activeClip) : <div className="caption-empty inspector-empty">{t('selectClipForTransition')}</div> : <>
            <div className="property-section"><h3><WandSparkles size={16}/>{t('colorAdjust')}</h3>{([['brightness', brightness, setBrightness], ['contrast', contrast, setContrast], ['saturation', saturation, setSaturation]] as const).map(([label, value, setter]) => <label key={label}>{t(label)}<span>{value > 0 ? '+' : ''}{value}</span><input type="range" min="-50" max="50" value={value} onChange={(e) => setter(Number(e.target.value))}/></label>)}</div>
            <button className="reset-button" onClick={() => {setBrightness(0);setContrast(0);setSaturation(0)}}>{t('reset')}</button>
            </>}
          </>}
        </aside>
      </section>

      <section className="timeline-panel">
        <div className="timeline-toolbar"><div><button className="tool-active"><MousePointer2 size={16}/></button><button onClick={splitClip} title={t('splitClip')}><Scissors size={16}/></button><button onClick={deleteClip} title={t('deleteItem')}><Trash2 size={16}/></button><span className="divider"/><button onClick={() => addText()} title={t('addText')}><TextCursorInput size={16}/></button><button onClick={() => setActiveTool('stickers')} title={t('openStickers')}><Sticker size={16}/></button><button onClick={() => { const target = activeClip ?? currentVideoClip; if (target) { setSelectedClip(target.id); setSelectedAudioClip(0); setSelectedTextClip(0); setSelectedStickerClip(0); setSelectedCaptionClip(0); setVideoInspectorTab('video') } else setToast(t('selectMediaForCrop')) }} title={t('cropAndResize')}><Crop size={16}/></button><button className={`snap-toggle ${snappingEnabled ? 'active' : ''}`} onClick={() => { setSnappingEnabled((enabled) => { setToast(t(enabled ? 'snappingDisabled' : 'snappingEnabled')); return !enabled }) }} title={t(snappingEnabled ? 'snappingOnHint' : 'snappingOffHint')} aria-pressed={snappingEnabled}><Magnet size={15}/><span>{t('snap')}</span></button><span className="divider"/><div className="optional-track-buttons">{optionalTrackItems.map(({type, labelKey, icon: Icon}) => <button key={type} onClick={() => addTimelineTrack(type)} title={t('addTrack', {track: t(labelKey)})} aria-label={t('addTrack', {track: t(labelKey)})}><Icon size={15}/><Plus className="track-plus" size={9}/></button>)}</div></div><div className="timeline-zoom"><button onClick={() => applyTimelineZoom(zoom / 1.25)} title={t('zoomOut')}><ZoomOut size={15}/></button><div className="timeline-zoom-scrubber" title={t('zoomHelp')} onPointerDown={beginZoomDrag} onPointerMove={moveZoomDrag} onPointerUp={endZoomDrag} onPointerCancel={endZoomDrag}><span/><i/></div><label><input className="zoom-percent-input" type="number" min="0.01" step="1" value={zoomPercentInput} onChange={(event) => {const value = event.target.value; setZoomPercentInput(value); const parsed = Number(value); if (value && Number.isFinite(parsed) && parsed > 0) setZoom(Math.min(10000, Math.max(.0001, parsed / 100)))}} onBlur={commitZoomPercent} onKeyDown={(event) => {if (event.key === 'Enter') event.currentTarget.blur()}} aria-label={t('zoomPercent')}/><span>%</span></label><button onClick={() => applyTimelineZoom(zoom * 1.25)} title={t('zoomIn')}><ZoomIn size={15}/></button></div></div>
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
