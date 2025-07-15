from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
import os
import re

app = FastAPI()


class DownloadRequest(BaseModel):
    url: str
    quality_check: bool = False


class VideoInfoRequest(BaseModel):
    url: str


def download_video(url: str, resolution: str):
    try:
        height = resolution.replace('p', '')
        ydl_opts = {
            'format': f'bestvideo[height<={height}]+bestaudio/best[height<={height}]',
            'outtmpl': 'downloads/%(title)s.%(ext)s',
            'merge_output_format': 'mp4',
            'postprocessors': [
                {'key': 'FFmpegVideoConvertor', 'preferedformat': 'mp4'},
                {'key': 'FFmpegMetadata'},
            ],
            'postprocessor_args': [
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-preset', 'medium',
                '-crf', '23',
                '-movflags', '+faststart',
            ],
        }

        print(f"Requested resolution: {resolution}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            for f in formats:
                if f.get('height') and f.get('vcodec') != 'none':
                    print(f"  Video ID: {f['format_id']}, Height: {f.get('height')}, Codec: {f.get('vcodec', 'unknown')}")
            for f in formats:
                if f.get('acodec') != 'none' and f.get('vcodec') == 'none':
                    print(f"  Audio ID: {f['format_id']}, Quality: {f.get('abr', 'unknown')}, Codec: {f.get('acodec', 'unknown')}")
            ydl.download([url])
            return True, None
    except Exception as e:
        return False, str(e)


def download_video_with_quality_check(url: str, resolution: str):
    try:
        height = resolution.replace('p', '')
        ydl_opts = {
            'format': f'best[height<={height}][ext=mp4]/bestvideo[height<={height}]+bestaudio[ext=m4a]/bestvideo[height<={height}]+bestaudio',
            'outtmpl': 'downloads/%(title)s.%(ext)s',
            'merge_output_format': 'mp4',
            'writesubtitles': False,
            'writeautomaticsub': False,
            'postprocessors': [
                {'key': 'FFmpegVideoConvertor', 'preferedformat': 'mp4'},
            ],
            'postprocessor_args': [
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-preset', 'medium',
                '-crf', '23',
                '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart',
                '-avoid_negative_ts', 'make_zero',
            ],
        }

        print(f"Requested resolution: {resolution}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            suitable_formats = [f for f in formats if f.get('height') and int(f.get('height', 0)) <= int(height)]
            if suitable_formats:
                best_format = max(suitable_formats, key=lambda x: x.get('height', 0))
                print(f"Selected format: {best_format.get('format_id')}, {best_format.get('height')}p")
            ydl.download([url])
            return True, None
    except Exception as e:
        return False, str(e)


def get_video_info(url: str):
    try:
        ydl_opts = {'quiet': True, 'no_warnings': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            video_qualities = list(set([f.get('height') for f in formats if f.get('height') and f.get('vcodec') != 'none']))
            video_qualities.sort(reverse=True)
            return {
                "title": info.get('title'),
                "author": info.get('uploader'),
                "length": info.get('duration'),
                "views": info.get('view_count'),
                "description": info.get('description'),
                "upload_date": info.get('upload_date'),
                "available_video_qualities": video_qualities,
            }, None
    except Exception as e:
        return None, str(e)


def is_valid_youtube_url(url: str):
    patterns = [
        r'^https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[\w-]+',
        r'^https?://(www\.)?youtube\.com/watch\?v=[\w-]+(&\S*)?$',
        r'^https?://(www\.)?youtube\.com/shorts/[\w-]+(&\S*)?$'
    ]
    return any(re.match(pattern, url) for pattern in patterns)


@app.post("/download/{resolution}")
async def download_by_resolution(resolution: str, body: DownloadRequest):
    url = body.url
    use_quality_check = body.quality_check

    if not url:
        raise HTTPException(status_code=400, detail="Missing 'url' parameter in the request body.")
    if not is_valid_youtube_url(url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL.")

    if not os.path.exists('downloads'):
        os.makedirs('downloads')

    success, error_message = (
        download_video_with_quality_check(url, resolution)
        if use_quality_check else download_video(url, resolution)
    )

    if success:
        return {
            "message": f"Video with resolution {resolution} downloaded successfully.",
            "format": "MP4 (H.264 + AAC)",
            "compatibility": "Universal device compatibility"
        }
    else:
        raise HTTPException(status_code=500, detail=error_message)


@app.post("/video_info")
async def video_info(body: VideoInfoRequest):
    url = body.url

    if not url:
        raise HTTPException(status_code=400, detail="Missing 'url' parameter in the request body.")
    if not is_valid_youtube_url(url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL.")

    video_info_, error_message = get_video_info(url)
    if video_info_:
        return video_info_
    else:
        raise HTTPException(status_code=500, detail=error_message)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "output_format": "MP4 (H.264 + AAC)",
        "compatibility": "Universal"
    }
