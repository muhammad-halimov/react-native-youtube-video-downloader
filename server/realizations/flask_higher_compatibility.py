from flask import Flask, request, jsonify
import yt_dlp
import os
import re

app = Flask(__name__)


def download_video(url, resolution):
    try:
        height = resolution.replace('p', '')

        # Настройки для принудительного использования H.264 и AAC
        ydl_opts = {
            'format': f'bestvideo[height<={height}]+bestaudio/best[height<={height}]',
            'outtmpl': 'downloads/%(title)s.%(ext)s',
            'merge_output_format': 'mp4',
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }, {
                'key': 'FFmpegMetadata',
            }],
            'postprocessor_args': [
                '-c:v', 'libx264',  # Принудительно используем H.264
                '-c:a', 'aac',      # Принудительно используем AAC
                '-preset', 'medium', # Баланс между скоростью и качеством
                '-crf', '23',       # Качество видео (18-28, меньше = лучше)
                '-movflags', '+faststart',  # Оптимизация для веб-воспроизведения
            ],
        }

        print(f"Requested resolution: {resolution}")
        print(f"Format selector: {ydl_opts['format']}")
        print("Post-processing: Converting to H.264 + AAC")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Показываем что будет скачано
            info = ydl.extract_info(url, download=False)

            # Получаем инфо о форматах которые будут использоваться
            formats = info.get('formats', [])
            print("Video formats available:")
            for f in formats:
                if f.get('height') and f.get('vcodec') != 'none':
                    print(f"  Video ID: {f['format_id']}, Height: {f.get('height')}, Codec: {f.get('vcodec', 'unknown')}")

            print("Audio formats available:")
            for f in formats:
                if f.get('acodec') != 'none' and f.get('vcodec') == 'none':
                    print(f"  Audio ID: {f['format_id']}, Quality: {f.get('abr', 'unknown')}, Codec: {f.get('acodec', 'unknown')}")

            # Скачиваем и конвертируем
            ydl.download([url])
            print("Download completed. Video converted to H.264 + AAC format.")
            return True, None
    except Exception as e:
        return False, str(e)


def download_video_with_quality_check(url, resolution):
    """
    Альтернативный метод с более точным контролем качества
    """
    try:
        height = resolution.replace('p', '')

        # Более точный селектор форматов
        ydl_opts = {
            'format': f'best[height<={height}][ext=mp4]/bestvideo[height<={height}]+bestaudio[ext=m4a]/bestvideo[height<={height}]+bestaudio',
            'outtmpl': 'downloads/%(title)s.%(ext)s',
            'merge_output_format': 'mp4',
            'writesubtitles': False,
            'writeautomaticsub': False,
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
            'postprocessor_args': [
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-preset', 'medium',
                '-crf', '23',
                '-pix_fmt', 'yuv420p',  # Совместимость с большинством устройств
                '-movflags', '+faststart',
                '-avoid_negative_ts', 'make_zero',
            ],
        }

        print(f"Requested resolution: {resolution}")
        print("Using quality-optimized download with H.264 + AAC conversion")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            # Проверяем доступные форматы
            formats = info.get('formats', [])
            suitable_formats = [f for f in formats if f.get('height') and int(f.get('height', 0)) <= int(height)]

            if suitable_formats:
                best_format = max(suitable_formats, key=lambda x: x.get('height', 0))
                print(f"Selected format: {best_format.get('format_id')}, {best_format.get('height')}p")

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

            video_info_ = {
                "title": info.get('title'),
                "author": info.get('uploader'),
                "length": info.get('duration'),
                "views": info.get('view_count'),
                "description": info.get('description'),
                "upload_date": info.get('upload_date'),
                "available_video_qualities": video_qualities,
            }
            return video_info_, None
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
    use_quality_check = data.get('quality_check', False)

    if not url:
        return jsonify({"error": "Missing 'url' parameter in the request body."}), 400

    if not is_valid_youtube_url(url):
        return jsonify({"error": "Invalid YouTube URL."}), 400

    # Создаем папку downloads если не существует
    if not os.path.exists('downloads'):
        os.makedirs('downloads')

    # Выбираем метод загрузки
    if use_quality_check:
        success, error_message = download_video_with_quality_check(url, resolution)
    else:
        success, error_message = download_video(url, resolution)

    if success:
        return jsonify({
            "message": f"Video with resolution {resolution} downloaded successfully.",
            "format": "MP4 (H.264 + AAC)",
            "compatibility": "Universal device compatibility"
        }), 200
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


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "output_format": "MP4 (H.264 + AAC)",
        "compatibility": "Universal"
    }), 200


if __name__ == '__main__':
    app.run(debug=True)
