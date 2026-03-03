import asyncio
import logging
import cv2
import numpy as np
from typing import Dict, Optional, List
from datetime import datetime
import httpx

from face_processor import FaceProcessor
from api_client import CRMClient
from workstation_detector import WorkstationDetector

logger = logging.getLogger(__name__)

class StreamHandler:
    def __init__(
        self,
        go2rtc_url: str,
        face_processor: FaceProcessor,
        crm_client: CRMClient,
        config: dict
    ):
        self.go2rtc_url = go2rtc_url
        self.face_processor = face_processor
        self.crm_client = crm_client
        self.config = config
        
        self.cameras: Dict[str, dict] = {}
        self.known_faces: List[dict] = []
        self.active_streams: Dict[str, asyncio.Task] = {}
        self.last_events: Dict[str, dict] = {}  # Для debounce
        self.workstation_detector = WorkstationDetector()
        
        self.running = False
        self.frame_interval = config.get('recognition', {}).get('frame_interval', 1.0)
        self.poll_interval = config.get('cameras', {}).get('poll_interval', 60)
    
    async def start(self):
        """Запустить обработку"""
        self.running = True
        
        # Загружаем камеры и лица
        await self.reload_cameras()
        await self.reload_faces()
        await self.reload_workstations()
        
        # Запускаем периодическое обновление
        asyncio.create_task(self._poll_cameras())
        asyncio.create_task(self._poll_faces())
        
        logger.info("StreamHandler started")
    
    async def stop(self):
        """Остановить обработку"""
        self.running = False
        
        # Останавливаем все потоки
        for camera_id in list(self.active_streams.keys()):
            await self.stop_camera(camera_id)
        
        logger.info("StreamHandler stopped")
    
    async def reload_cameras(self):
        """Загрузить список камер из CRM"""
        try:
            cameras = await self.crm_client.get_cameras()
            
            self.cameras = {
                cam['id']: cam 
                for cam in cameras 
                if cam.get('isEnabled', True)
            }
            
            logger.info(f"Loaded {len(self.cameras)} cameras")
            
            # Запускаем новые камеры, останавливаем отключённые
            current_ids = set(self.cameras.keys())
            active_ids = set(self.active_streams.keys())
            
            # Запускаем новые
            for cam_id in current_ids - active_ids:
                await self.start_camera(cam_id)
            
            # Останавливаем отключённые
            for cam_id in active_ids - current_ids:
                await self.stop_camera(cam_id)
            
        except Exception as e:
            logger.error(f"Failed to reload cameras: {e}")
    
    async def reload_faces(self):
        """Загрузить известные лица из CRM"""
        try:
            self.known_faces = await self.crm_client.get_faces()
            logger.info(f"Loaded {len(self.known_faces)} known faces")
        except Exception as e:
            logger.error(f"Failed to reload faces: {e}")
    
    async def reload_workstations(self):
        """Загрузить рабочие места из CRM"""
        try:
            workstations = await self.crm_client.get_workstations()
            self.workstation_detector.load_workstations(workstations)
            logger.info(f"Loaded {len(workstations)} workstations")
        except Exception as e:
            logger.error(f"Failed to reload workstations: {e}")
    
    async def start_camera(self, camera_id: str):
        """Запустить обработку камеры"""
        if camera_id in self.active_streams:
            return
        
        camera = self.cameras.get(camera_id)
        if not camera:
            logger.error(f"Camera {camera_id} not found")
            return
        
        task = asyncio.create_task(self._process_camera(camera_id, camera))
        self.active_streams[camera_id] = task
        logger.info(f"Started processing camera {camera_id}")
    
    async def stop_camera(self, camera_id: str):
        """Остановить обработку камеры"""
        if camera_id not in self.active_streams:
            return
        
        task = self.active_streams.pop(camera_id)
        task.cancel()
        
        try:
            await task
        except asyncio.CancelledError:
            pass
        
        logger.info(f"Stopped processing camera {camera_id}")
    
    async def _process_camera(self, camera_id: str, camera: dict):
        """Обработка видеопотока камеры"""
        stream_url = camera.get('streamUrl')
        if not stream_url:
            logger.error(f"No stream URL for camera {camera_id}")
            return
        
        # Формируем URL для go2rtc если нужно
        if not stream_url.startswith('http'):
            stream_url = f"{self.go2rtc_url}/api/stream.mp4?src={camera.get('deviceId', camera_id)}"
        
        logger.info(f"Connecting to stream for {camera_id}: {stream_url}")
        
        cap = None
        reconnect_delay = 5
        
        while self.running and camera_id in self.active_streams:
            try:
                cap = cv2.VideoCapture(stream_url)
                
                if not cap.isOpened():
                    logger.error(f"Failed to open stream for camera {camera_id}")
                    await asyncio.sleep(reconnect_delay)
                    continue
                
                logger.info(f"Connected to camera {camera_id}")
                await self.crm_client.update_camera_status(camera_id, 'online')
                
                while self.running and camera_id in self.active_streams:
                    ret, frame = cap.read()
                    
                    if not ret:
                        logger.warning(f"Lost connection to camera {camera_id}")
                        break
                    
                    # Обрабатываем кадр
                    await self._process_frame(camera_id, frame, camera)
                    
                    # Ждём перед следующим кадром
                    await asyncio.sleep(self.frame_interval)
                
            except Exception as e:
                if not isinstance(e, asyncio.CancelledError):
                    logger.error(f"Error processing camera {camera_id}: {e}")
            
            finally:
                if cap:
                    cap.release()
                await self.crm_client.update_camera_status(camera_id, 'offline')
            
            if self.running and camera_id in self.active_streams:
                logger.info(f"Reconnecting to camera {camera_id} in {reconnect_delay}s...")
                await asyncio.sleep(reconnect_delay)
    
    async def _process_frame(self, camera_id: str, frame: np.ndarray, camera: dict):
        """Обработка одного кадра"""
        try:
            # Детектируем лица
            faces = self.face_processor.detect_faces(frame)
            
            if not faces:
                # Проверяем, был ли кто-то раньше
                await self._handle_no_faces(camera_id)
                return
            
            # Порог уверенности из настроек камеры или общих
            frame_size = (frame.shape[1], frame.shape[0])
            
            for face in faces:
                # Определяем рабочее место
                face_bbox = {
                    'x': face['bbox'][0],
                    'y': face['bbox'][1],
                    'width': face['bbox'][2] - face['bbox'][0],
                    'height': face['bbox'][3] - face['bbox'][1]
                }
                
                workstation = self.workstation_detector.detect_workstation(
                    camera_id,
                    face_bbox,
                    frame_size
                )
                
                workstation_id = workstation['id'] if workstation else None
                
                # Ищем совпадение
                match = self.face_processor.find_best_match(
                    face['embedding'],
                    self.known_faces,
                    threshold
                )
                
                if match:
                    # Проверяем, соответствует ли пользователь рабочему месту
                    if workstation and workstation.get('requiresAssignedUser'):
                        assigned_user = workstation.get('assignedUserId')
                        if assigned_user and assigned_user != match['user_id']:
                            # Не тот пользователь на этом месте!
                            await self._handle_wrong_user(
                                camera_id,
                                workstation_id,
                                match['user_id'],
                                assigned_user
                            )
                            continue

                    await self._handle_recognized_face(
                        camera_id,
                        match['user_id'],
                        match['confidence'],
                        workstation_id,
                        face_bbox
                    )
                else:
                    await self._handle_unknown_face(
                        camera_id,
                        face['embedding'],
                        face['quality'],
                        workstation_id,
                        face_bbox
                    )
        
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
    
    async def _handle_recognized_face(
        self, 
        camera_id: str, 
        user_id: str, 
        confidence: float,
        workstation_id: Optional[str] = None,
        face_position: Optional[dict] = None
    ):
        """Обработка распознанного лица"""
        # Debounce - не отправляем событие чаще чем раз в 30 секунд для одного пользователя на этом месте
        event_key = f"{camera_id}:{user_id}:{workstation_id or 'default'}"
        last_event = self.last_events.get(event_key)
        
        now = datetime.now()
        if last_event and (now - last_event['time']).total_seconds() < 30:
            return
        
        self.last_events[event_key] = {
            'time': now,
            'type': 'recognized'
        }
        
        # Отправляем событие в CRM
        await self.crm_client.send_detection_event(
            camera_id=camera_id,
            event_type='recognized',
            user_id=user_id,
            confidence=confidence,
            workstation_id=workstation_id,
            face_position=face_position
        )
        
        logger.info(f"Recognized user {user_id} on camera {camera_id} at workstation {workstation_id} (confidence: {confidence:.2f})")

    async def _handle_unknown_face(
        self, 
        camera_id: str, 
        embedding: np.ndarray, 
        quality: float,
        workstation_id: Optional[str] = None,
        face_position: Optional[dict] = None
    ):
        """Обработка неизвестного лица"""
        event_key = f"{camera_id}:unknown:{workstation_id or 'default'}"
        last_event = self.last_events.get(event_key)
        
        now = datetime.now()
        if last_event and (now - last_event['time']).total_seconds() < 60:
            return
        
        self.last_events[event_key] = {
            'time': now,
            'type': 'unknown'
        }
        
        await self.crm_client.send_detection_event(
            camera_id=camera_id,
            event_type='unknown',
            confidence=quality,
            face_encoding=embedding.tolist(),
            workstation_id=workstation_id,
            face_position=face_position
        )
        
        logger.info(f"Unknown face detected on camera {camera_id} at workstation {workstation_id}")

    async def _handle_wrong_user(
        self,
        camera_id: str,
        workstation_id: str,
        actual_user_id: str,
        expected_user_id: str
    ):
        """Обработка ситуации, когда не тот сотрудник на рабочем месте"""
        event_key = f"{camera_id}:wrong_user:{workstation_id}"
        last_event = self.last_events.get(event_key)
        
        now = datetime.now()
        if last_event and (now - last_event['time']).total_seconds() < 60:
            return
            
        logger.warning(
            f"Wrong user at workstation {workstation_id}: "
            f"expected {expected_user_id}, got {actual_user_id}"
        )
        
        self.last_events[event_key] = {
            'time': now,
            'type': 'wrong_user'
        }
        
        await self.crm_client.send_detection_event(
            camera_id=camera_id,
            event_type='wrong_user',
            user_id=actual_user_id,
            workstation_id=workstation_id,
            metadata={
                'expected_user_id': expected_user_id
            }
        )
    
    async def _handle_no_faces(self, camera_id: str):
        """Обработка отсутствия лиц в кадре"""
        # Отправляем событие 'lost' если кто-то был и пропал
        for key in list(self.last_events.keys()):
            if key.startswith(f"{camera_id}:") and not key.endswith(":unknown"):
                last_event = self.last_events[key]
                now = datetime.now()
                
                # Если прошло больше 30 секунд с последнего события
                if (now - last_event['time']).total_seconds() > 30 and last_event.get('type') != 'lost':
                    user_id = key.split(':')[1]
                    
                    await self.crm_client.send_detection_event(
                        camera_id=camera_id,
                        event_type='lost',
                        user_id=user_id,
                        confidence=0
                    )
                    
                    self.last_events[key] = {
                        'time': now,
                        'type': 'lost'
                    }
                    
                    logger.info(f"User {user_id} left camera {camera_id}")
    
    async def _poll_cameras(self):
        """Периодическое обновление списка камер"""
        while self.running:
            await asyncio.sleep(self.poll_interval)
            await self.reload_cameras()
    
    async def _poll_faces(self):
        """Периодическое обновление известных лиц"""
        while self.running:
            await asyncio.sleep(self.poll_interval * 2)  # Реже чем камеры
            await self.reload_faces()
