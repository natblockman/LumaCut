# LumaCut 🎬

<p align="center">
  <img src="public/lumacut-icon.png" width="112" alt="LumaCut icon">
</p>

LumaCut is a free, open-source desktop video editor with a straightforward workflow inspired by modern editing applications such as CapCut. It is built with Electron, React, and TypeScript and is distributed under the MIT License.

Current version: **1.32.0**

## Features

- Import multiple videos and images at once using the file picker or drag and drop. Imported files are automatically placed one after another on the timeline.
- Delete imported media from the library, with confirmation and automatic removal of timeline clips and detached audio that use that source.
- Choose a canvas preset: `1:1`, `16:9`, `9:16`, `4:3`, or `3:4`, or enter a custom width and height up to 8192 pixels.
- Crop, reposition, and resize videos, images, GIFs, and stickers. Drag media directly in the preview, use four corner handles for proportional resizing, or use the side handles to stretch width and height independently from 1–1000%.
- See a live measurement line and exact X/Y distance from the canvas center in both pixels and percentages while repositioning media.
- Use the preview toolbar to mute monitoring audio, show center guides, hide transform controls, enable a checkerboard background, or zoom the viewer from 50–200% and Fit.
- Use **Fit to canvas** to show the entire image or video, or **Fill canvas** to cover the whole canvas.
- Rename, save, and reopen `.lumacut` project files with timeline content and editor settings restored.
- Detach audio from a video and edit, move, split, trim, or delete it independently.
- Adjust each audio clip from 0–200% volume and apply Fade In and Fade Out with a visible timeline envelope.
- Move clips and drag either edge to change the start point or duration.
- Enable Timeline Snapping to attach clips to edges and prevent overlap, or disable it to overlap clips and drag them through one another.
- Add or remove video, audio, text, sticker, and caption tracks.
- Add, edit, position, split, and delete text using 11 included font choices.
- Apply eight text templates, including Clean, Neon, Cinematic, Pop, Breaking News, and Retro.
- Apply six text effects: None, Outline, Shadow, Glow, Neon, and Background, with controls for color, thickness, letter spacing, and background opacity.
- Use free OpenMoji stickers and animated GIFs. Import local `.gif` files, search and filter assets, then adjust size, rotation, opacity, and display time.
- Create captions manually or import an SRT file.
- Record microphone audio directly onto the timeline.
- Apply six per-clip video effects: Film, Light Leak, Blur, Grain, VHS, and Soft, with adjustable intensity.
- Animate videos, images, text, and stickers with Fade, Zoom, and Slide presets. Position keyframes can move video or images smoothly across the canvas over time, and the Typewriter animation reveals text one character at a time.
- Add Crossfade, Fade Through Black, Slide, and Zoom Blend transitions between adjacent clips.
- Adjust playback speed, volume, opacity, brightness, contrast, and saturation.
- Zoom the timeline by dragging the zoom control, clicking the magnifier buttons, or entering an exact percentage.
- Use the interface in English, Thai, Russian, Chinese, Japanese, Spanish, Hindi, or French.
- Export video using VP9 or VP8, from source resolution up to 4K, at 24–60 fps, to a chosen location with progress percentage and estimated time remaining.

## System Requirements

### Windows

- 64-bit Windows 10 or Windows 11
- 4 GB RAM minimum; 8 GB or more is recommended for high-resolution video
- At least 1 GB of free space for the application, plus additional space for media and exported files

### Linux

- A 64-bit Linux distribution that supports AppImage
- FUSE may be required, depending on the distribution
- 4 GB RAM minimum; 8 GB or more is recommended

LumaCut does not require an account. Editing and project processing take place locally on your computer.

## Download

Open the repository's [Releases page](https://github.com/natblockman/LumaCut/releases), select the latest release, and download the file for your operating system:

- Windows: `LumaCut-Setup-1.32.0.exe`
- Linux: `LumaCut-1.32.0.AppImage`

Installers are not stored in the source tree because of their size. They are published as assets attached to GitHub Releases.

## Install on Windows

1. Download `LumaCut-Setup-1.32.0.exe` from the Releases page.
2. Double-click the downloaded file.
3. If Windows SmartScreen displays a warning, confirm that the file came from this repository, then select **More info** and **Run anyway**.
4. Choose an installation folder.
5. Select **Install** and wait for installation to finish.
6. Open LumaCut from the desktop shortcut or Start menu.

This open-source installer does not currently have a commercial code-signing certificate. Windows may therefore show a SmartScreen warning even when the installer was built directly from this repository's source code.

### Uninstall on Windows

Open **Settings → Apps → Installed apps → LumaCut → Uninstall**, or use the uninstall shortcut in the Start menu.

## Run on Linux

1. Download `LumaCut-1.32.0.AppImage` from the Releases page.
2. Open a terminal in the folder containing the file.
3. Make the file executable:

```bash
chmod +x LumaCut-1.32.0.AppImage
```

4. Start the application:

```bash
./LumaCut-1.32.0.AppImage
```

If the AppImage cannot start because FUSE is unavailable, try running it in temporary extraction mode:

```bash
./LumaCut-1.32.0.AppImage --appimage-extract-and-run
```

## Your First Edit

1. Select **Import media** and choose one or more videos or images. Each file is added as a clip and placed sequentially on the timeline.
2. Select a timeline clip to edit it.
3. Drag the clip to change its time, or drag its left and right edges to trim the beginning and adjust its duration.
4. Place the playhead inside a clip and select the scissors button, or press `Ctrl+B`, to split it.
5. Select a canvas ratio above the preview, or choose **Custom** to enter a width and height.
6. Select a clip and drag a corner handle in the preview for proportional resizing. Drag the middle left/right handles to change only its width, or the middle top/bottom handles to change only its height. While moving media, the preview displays its signed X/Y distance from the canvas center in pixels and percentages. You can also enter Scale, Width, and Height values from 1–1000% under **Video → Crop and resize**.
7. Select **Fit to canvas** to keep the entire source visible, or **Fill canvas** to cover all canvas space.
8. Use the **Snap** magnet button on the timeline to switch behavior. When enabled, clips attach to edges and cannot overlap. When disabled, clips may overlap and pass through one another.
9. Use the left panel to add audio, text, stickers, or captions. Use the trash button on a media card to remove a source from the project.
10. Use the right panel to edit Video, Animation, Transition, and Adjust settings.
11. Select **Export** in the upper-right corner, configure encoding, resolution, frame rate, and save location, then select **Start export**.

## Position Keyframe Animation

1. Select a video or image clip and move the playhead to the animation's starting time.
2. Drag the media to its starting position, such as the left side of the canvas.
3. Open **Animation → Position keyframes** and select **Add keyframe**.
4. Move the playhead later in the clip, then drag the media to its next position, such as the right side. LumaCut creates the next position keyframe automatically.
5. Press Play to preview the smooth movement between keyframes. Diamond markers on the clip show each keyframe and can be selected to jump directly to it.
6. Add more keyframes for a longer motion path, or select **Clear position keyframes** to remove the motion. Position animation is included in exported video and saved project files.

## Export Settings and Progress

1. Choose **VP9** for better quality and compression efficiency, or **VP8** for faster encoding.
2. Choose the source resolution or 480p, 720p, 1080p, 1440p, or 2160p (4K).
3. Choose 24, 25, 30, 50, or 60 fps.
4. Select **Browse** to choose the filename and location using the operating system's save dialog.
5. During encoding, LumaCut displays a progress bar, completion percentage, and estimated time remaining.
6. When export finishes, the application shows the saved file location.

## Rename, Save, and Open Projects

1. Select the project name in the middle of the top bar and enter a new name.
2. Select the disk icon or press `Ctrl+S`, choose a location, and LumaCut will create a `.lumacut` project file.
3. Later saves update the same project file without asking for a new location.
4. Select the folder icon or press `Ctrl+O` to reopen a `.lumacut` file and continue editing.
5. Project files store tracks, clips, timing, trims, effects, text, stickers, captions, audio, and export settings.

Videos, audio files, and GIFs imported from your computer refer to their original file locations. Keep those source files in place. Temporary media created inside LumaCut, such as recorded microphone audio, is embedded in the project file automatically.

## Audio Volume and Fades

1. Select an audio clip on the timeline. This may be imported audio, recorded audio, or audio detached from a video.
2. In the right panel, adjust **Clip volume** from 0–200%. A value of 100% preserves the original volume.
3. Increase **Fade in** to make the audio gradually rise from silence at the beginning.
4. Increase **Fade out** to make the audio gradually fall to silence at the end.
5. The green envelope on the audio clip visualizes the fade shape. Fades are applied in both preview and export.

## Text Templates and Text Effects

1. Open **Text** in the left panel.
2. Select a template to create text with its preset font, color, position, and effect.
3. Select the text clip on the timeline, then edit its content, color, and weight in the **Text** tab on the right.
4. Use the **Style** tab to change the font, size, opacity, position, and display time.
5. Use the **Effects** tab to select None, Outline, Shadow, Glow, Neon, or Background.
6. Adjust effect color, outline color and thickness, letter spacing, or background opacity when available.
7. Text effects appear in both the preview and exported WebM video.

## Video Effects

1. Select a video clip on the timeline.
2. Open **Effects** in the left panel.
3. Select Film, Light Leak, Blur, Grain, VHS, or Soft. Select **None** to remove the effect.
4. Adjust **Effect intensity** from 0–100%.
5. Effects are stored independently for each clip and appear in both preview and exported WebM video.

## GIFs

1. Open **Stickers** in the left panel.
2. Select the **GIF** tab to show animated assets only, or search by name and keyword.
3. Select **Import GIF** and choose a local `.gif` file. It is added to the library and timeline immediately.
4. Alternatively, select an existing GIF in the library to place it on the sticker track at the playhead.
5. Drag the GIF in the preview to reposition it. Use the right panel to adjust its size, rotation, opacity, display time, and animation.
6. GIFs animate in both preview and export.

## Transitions

A transition plays at the beginning of the selected clip:

1. Add at least two video clips and place the end of the first directly against the beginning of the second.
2. Select the second clip on the timeline.
3. Open the **Transition** tab in the right panel.
4. Select Crossfade, Fade Through Black, Slide Left, Slide Up, or Zoom Blend.
5. Adjust **Transition duration**.
6. Play the timeline or move the playhead across the cut to preview the transition.

An active transition displays a diamond at the cut on the timeline. If the clips are separated by a gap, the transition remains inactive until they are adjacent again.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Space` | Play or pause the preview |
| `Ctrl+B` | Split the selected item at the playhead |
| `Ctrl+S` | Save the project |
| `Ctrl+O` | Open a project |
| `Delete` or `Backspace` | Delete the selected item |

## File Formats and Export

- Supported video and audio import formats depend on the codecs available to Electron/Chromium on the operating system.
- Captions can be imported from `.srt` files.
- Video is exported as `.webm` using VP9 or VP8 encoding.
- Export time depends on project duration, output resolution, and computer performance.

## Current Limitations

- Direct MP4 export is not yet available.
- The Windows installer is not signed with a commercial code-signing certificate.
- Large or high-resolution projects may consume substantial RAM.

## Development

Install Git, Node.js 20 or newer, and pnpm, then run:

```bash
git clone https://github.com/natblockman/LumaCut.git
cd LumaCut
pnpm install
pnpm desktop
```

Lint the source and create a production web bundle:

```bash
pnpm lint
pnpm build
```

Build the Linux AppImage:

```bash
pnpm package:linux
```

Build the 64-bit Windows installer:

```bash
pnpm package:windows
```

Generated packages are written to the `release/` folder.

## Project Structure

```text
src/                 React UI and editing system
electron/            Electron main process and preload
public/              Application icons and bundled stickers
build/               Installer icons and build scripts
release/             Locally generated packages (excluded from Git)
```

## Contributing

Issues and pull requests are welcome for bug fixes, codecs and MP4 support, project workflow improvements, Undo/Redo, and other features.

## Credits

Bundled stickers are designed by [OpenMoji](https://openmoji.org/) and distributed under the [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) license.

## License

[MIT](LICENSE) — free to use, modify, and redistribute.
