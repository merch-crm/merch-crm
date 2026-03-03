import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import yaml
import os

from face_processor import FaceProcessor
from stream_handler import StreamHandler
from api_client import CRMClient

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Загрузка конфигурации
def load_config():
    config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
    try:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
    except FileNotFoundError:
        logger.warning("config.yaml not found, using defaults")
        config = {
            'server': {'host': '0.0.0.0', 'port': 8001},
            'go2rtc': {'url': 'http://localhost:1984'},
            'crm': {'url': 'http://localhost:3000'},
            'recognition': {'frame_interval': 1.0}
        }
    
    # Подстановка переменных окружения
    crm_api_key = os.getenv('PRESENCE_SERVICE_API_KEY', 'presence-secret-key')
    if 'crm' not in config: config['crm'] = {}
    config['crm']['api_key'] = crm_api_key
    
    go2rtc_url = os.getenv('GO2RTC_URL')
    if go2rtc_url:
        if 'go2rtc' not in config: config['go2rtc'] = {}
        config['go2rtc']['url'] = go2rtc_url
    
    crm_url = os.getenv('CRM_URL')
    if crm_url:
        config['crm']['url'] = crm_url
    
    return config

config = load_config()

# Глобальные объекты
face_processor: Optional[FaceProcessor] = None
stream_handler: Optional[StreamHandler] = None
crm_client: Optional[CRMClient] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global face_processor, stream_handler, crm_client
    
    logger.info("Initializing Face Recognition Service...")
    
    # Инициализация компонентов
    face_processor = FaceProcessor(config.get('recognition', {}))
    crm_client = CRMClient(config['crm']['url'], config['crm']['api_key'])
    stream_handler = StreamHandler(
        go2rtc_url=config['go2rtc']['url'],
        face_processor=face_processor,
        crm_client=crm_client,
        config=config
    )
    
    # Запуск обработки потоков
    asyncio.create_task(stream_handler.start())
    
    logger.info("Face Recognition Service started")
    
    yield
    
    # Остановка
    logger.info("Shutting down Face Recognition Service...")
    if stream_handler:
        await stream_handler.stop()

app = FastAPI(
    title="Face Recognition Service",
    description="Сервис распознавания лиц для учёта рабочего времени",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === API Models ===

class HealthResponse(BaseModel):
    status: str
    version: str
    gpu_available: bool
    cameras_active: int

class EncodeResponse(BaseModel):
    success: bool
    encoding: Optional[List[float]] = None
    quality: Optional[float] = None
    error: Optional[str] = None

class DetectionEvent(BaseModel):
    camera_id: str
    user_id: Optional[str] = None
    event_type: str
    confidence: float
    timestamp: str

# === API Endpoints ===

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Проверка состояния сервиса"""
    cameras_active = len(stream_handler.active_streams) if stream_handler else 0
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        gpu_available=face_processor.gpu_available if face_processor else False,
        cameras_active=cameras_active
    )

@app.post("/encode-face", response_model=EncodeResponse)
async def encode_face(file: UploadFile = File(...)):
    """Получить embedding лица из изображения"""
    try:
        contents = await file.read()
        
        result = face_processor.encode_face_from_bytes(contents)
        
        if result is None:
            return EncodeResponse(
                success=False,
                error="No face detected in image"
            )
        
        encoding, quality = result
        
        return EncodeResponse(
            success=True,
            encoding=encoding.tolist(),
            quality=float(quality)
        )
    
    except Exception as e:
        logger.error(f"Error encoding face: {e}")
        return EncodeResponse(
            success=False,
            error=str(e)
        )

@app.post("/encode-face-base64", response_model=EncodeResponse)
async def encode_face_base64(data: dict):
    """Получить embedding лица из base64 изображения"""
    try:
        import base64
        
        image_data = data.get('image', '')
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        result = face_processor.encode_face_from_bytes(image_bytes)
        
        if result is None:
            return EncodeResponse(
                success=False,
                error="No face detected in image"
            )
        
        encoding, quality = result
        
        return EncodeResponse(
            success=True,
            encoding=encoding.tolist(),
            quality=float(quality)
        )
    
    except Exception as e:
        logger.error(f"Error encoding face: {e}")
        return EncodeResponse(
            success=False,
            error=str(e)
        )

@app.get("/cameras")
async def get_cameras():
    """Получить список активных камер"""
    if not stream_handler:
        return {"cameras": []}
    
    return {
        "cameras": [
            {
                "id": cam_id,
                "status": "streaming" if cam_id in stream_handler.active_streams else "stopped"
            }
            for cam_id in stream_handler.cameras
        ]
    }

@app.post("/cameras/{camera_id}/start")
async def start_camera_api(camera_id: str):
    """Запустить обработку камеры"""
    if not stream_handler:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    await stream_handler.start_camera(camera_id)
    return {"status": "started", "camera_id": camera_id}

@app.post("/cameras/{camera_id}/stop")
async def stop_camera_api(camera_id: str):
    """Остановить обработку камеры"""
    if not stream_handler:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    await stream_handler.stop_camera(camera_id)
    return {"status": "stopped", "camera_id": camera_id}

@app.post("/reload-cameras")
async def reload_cameras():
    """Перезагрузить список камер из CRM"""
    if not stream_handler:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    await stream_handler.reload_cameras()
    return {"status": "reloaded", "cameras": len(stream_handler.cameras)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config['server']['host'],
        port=config['server']['port'],
        reload=True
    )
