from fastapi import FastAPI, HTTPException, Form, BackgroundTasks
import os
import asyncio
import signal
import shlex
import re

download_folder = os.path.join(os.path.expanduser("~"), "Downloads")
app = FastAPI()

download_processes = {}
download_status = {}


async def download_video_async(video_url: str, task_id: str):
    """ Асинхронная загрузка видео с отслеживанием прогресса. """
    output_path = os.path.join(download_folder, "%(title)s.%(ext)s")
    cmd = f'yt-dlp -f bestvideo+bestaudio/best -o "{output_path}" --newline "{video_url}"'

    process = await asyncio.create_subprocess_exec(
        *shlex.split(cmd),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    download_processes[task_id] = process
    download_status[task_id] = {"status": "in_progress", "progress": 0.0}

    try:
        while True:
            line = await process.stderr.readline()
            if not line:
                break

            decoded_line = line.decode().strip()
            match = re.search(r"(\d{1,3}\.\d)%", decoded_line)  # Ищем процент

            if match:
                download_status[task_id]["progress"] = float(match.group(1))  # Обновляем %

        stdout, stderr = await process.communicate()

        if process.returncode == 0:
            download_status[task_id]["status"] = "completed"
            download_status[task_id]["progress"] = 100.0  # Прогресс 100%
        else:
            error_message = stderr.decode().strip() or "Неизвестная ошибка"
            download_status[task_id]["status"] = f"failed: {error_message}"

    finally:
        download_processes.pop(task_id, None)


@app.post("/download/")
async def download_video(video_url: str = Form(...), background_tasks: BackgroundTasks = None):
    """ Запускает загрузку видео. """
    if not video_url:
        raise HTTPException(status_code=400, detail="Missing video_url parameter")

    task_id = str(hash(video_url))
    background_tasks.add_task(download_video_async, video_url, task_id)

    return {"message": f"Загрузка началась: {video_url}", "task_id": task_id}


@app.post("/cancel/{task_id}")
async def cancel_download(task_id: str):
    """ Отмена загрузки видео. """
    process = download_processes.get(task_id)

    if process:
        process.send_signal(signal.SIGTERM)
        download_status[task_id]["status"] = "cancelled"
        download_processes.pop(task_id, None)
        return {"message": "Загрузка отменена"}

    raise HTTPException(status_code=404, detail="Нет активных загрузок")


@app.get("/status/{task_id}")
async def get_status(task_id: str):
    """ Получает текущий статус загрузки. """
    status_info = download_status.get(task_id)

    if status_info:
        return {"task_id": task_id, "status": status_info["status"], "progress": status_info["progress"]}

    raise HTTPException(status_code=404, detail="Задача не найдена")