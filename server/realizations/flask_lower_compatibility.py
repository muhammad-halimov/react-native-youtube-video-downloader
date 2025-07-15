from flask import Flask, request, jsonify
import yt_dlp
import os
import re

app = Flask(__name__)

def download_video(url, resolution):
    try:
        height = resolution.replace('p', '')

        # Прямой подход - сразу объединяем видео и аудио
        ydl_opts = {
            'format': f'bestvideo[height<={height}]+bestaudio/best[height<={height}]',
            'outtmpl': 'downloads/%(title)s.%(ext)s',
            'merge_output_format': 'mp4',
        }

        print(f"Requested resolution: {resolution}")
        print(f"Format selector: {ydl_opts['format']}")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Показываем что будет скачано
            info = ydl.extract_info(url, download=False)

            # Получаем инфо о форматах которые будут использоваться
            formats = info.get('formats', [])
            print("Video formats available:")
            for f in formats:
                if f.get('height') and f.get('vcodec') != 'none':
                    print(f"  Video ID: {f['format_id']}, Height: {f.get('height')}")

            print("Audio formats available:")
            for f in formats:
                if f.get('acodec') != 'none' and f.get('vcodec') == 'none':
                    print(f"  Audio ID: {f['format_id']}, Quality: {f.get('abr', 'unknown')}")

            # Скачиваем
            ydl.download([url])
            return True, None
    except Exception as e:
        return False, str(e)

def get_video_info(url):
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            # Получаем доступные качества для видео
            formats = info.get('formats', [])
            video_qualities = list(set([f.get('height') for f in formats if f.get('height') and f.get('vcodec') != 'none']))
            video_qualities.sort(reverse=True)

            # Получаем обложку (thumbnail) - выбираем максимальное разрешение
            thumbnails = info.get('thumbnails', [])
            thumbnail_url = None
            if thumbnails:
                # Фильтруем thumbnails, исключая значки YouTube
                valid_thumbnails = []
                for thumb in thumbnails:
                    thumb_url = thumb.get('url', '')
                    # Исключаем стандартные значки YouTube
                    if not any(x in thumb_url for x in ['default.jpg', 'hqdefault.jpg', 'mqdefault.jpg', 'sddefault.jpg']):
                        valid_thumbnails.append(thumb)

                if valid_thumbnails:
                    # Берем thumbnail с максимальным разрешением
                    max_thumb = max(valid_thumbnails, key=lambda x: (x.get('width', 0) * x.get('height', 0)))
                    thumbnail_url = max_thumb.get('url')
                else:
                    # Если нет высококачественных, берем лучший из доступных
                    max_thumb = max(thumbnails, key=lambda x: (x.get('width', 0) * x.get('height', 0)))
                    thumbnail_url = max_thumb.get('url')

            # Получаем размер файла для каждого качества
            video_sizes = {}
            for quality in video_qualities:
                # Находим лучший формат для данного качества
                best_format = None
                for f in formats:
                    if (f.get('height') == quality and
                            f.get('vcodec') != 'none' and
                            f.get('filesize')):
                        best_format = f
                        break

                if best_format:
                    size_bytes = best_format.get('filesize') or best_format.get('filesize_approx')
                    if size_bytes:
                        # Конвертируем в более читаемый формат
                        if size_bytes < 1024 * 1024:  # < 1MB
                            size_str = f"{size_bytes / 1024:.1f} KB"
                        elif size_bytes < 1024 * 1024 * 1024:  # < 1GB
                            size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
                        else:
                            size_str = f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"

                        video_sizes[f"{quality}p"] = {
                            "bytes": size_bytes,
                            "readable": size_str
                        }

            # Маппинг качеств на понятные названия
            quality_mapping = {
                1080: "fhd",
                720: "hd",
                480: "sd",
                360: "ld",
                240: "sld",
                144: "uld",
            }

            # Фильтруем только нужные качества
            filtered_qualities_sizes = [q for q in video_qualities if q in quality_mapping]

            # Получаем размер файла для каждого качества
            video_sizes = {}
            for quality in filtered_qualities_sizes:
                # Находим лучший формат для данного качества
                best_format = None
                for f in formats:
                    if (f.get('height') == quality and
                            f.get('vcodec') != 'none' and
                            f.get('filesize')):
                        best_format = f
                        break

                if best_format:
                    size_bytes = best_format.get('filesize') or best_format.get('filesize_approx')
                    if size_bytes:
                        # Конвертируем в более читаемый формат
                        if size_bytes < 1024 * 1024:  # < 1MB
                            size_str = f"{size_bytes / 1024:.1f} KB"
                        elif size_bytes < 1024 * 1024 * 1024:  # < 1GB
                            size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
                        else:
                            size_str = f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"

                        quality_name = quality_mapping[quality]
                        video_sizes[quality_name] = {
                            "bytes": size_bytes,
                            "readable": size_str,
                            "height": quality
                        }

            return {
                "title": info.get('title'),
                "author": info.get('uploader'),
                "length": info.get('duration'),
                "views": info.get('view_count'),
                "description": info.get('description'),
                "upload_date": info.get('upload_date'),
                "available_video_qualities": filtered_qualities_sizes,
                "thumbnail": thumbnail_url,
                "video_sizes": video_sizes,
                "video_id": info.get('id'),
            }, None
    except Exception as e:
        return None, str(e)

def is_valid_youtube_url(url):
    patterns = [
        r'^https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[\w-]+',
        r'^https?://(www\.)?youtube\.com/watch\?v=[\w-]+(&\S*)?$',
        r'^https?://(www\.)?youtube\.com/shorts/[\w-]+(&\S*)?$'
    ]
    return any(re.match(pattern, url) for pattern in patterns)

@app.route('/download/<resolution>', methods=['POST'])
def download_by_resolution(resolution):
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({"error": "Missing 'url' parameter in the request body."}), 400

    if not is_valid_youtube_url(url):
        return jsonify({"error": "Invalid YouTube URL."}), 400

    # Создаем папку downloads если не существует
    if not os.path.exists('downloads'):
        os.makedirs('downloads')

    success, error_message = download_video(url, resolution)

    if success:
        return jsonify({"message": f"Video with resolution {resolution} downloaded successfully."}), 200
    else:
        return jsonify({"error": error_message}), 500

@app.route('/video_info', methods=['POST'])
def video_info():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({"error": "Missing 'url' parameter in the request body."}), 400

    if not is_valid_youtube_url(url):
        return jsonify({"error": "Invalid YouTube URL."}), 400

    _video_info, error_message = get_video_info(url)

    if _video_info:
        return jsonify(_video_info), 200
    else:
        return jsonify({"error": error_message}), 500

if __name__ == '__main__':
    app.run(debug=True)