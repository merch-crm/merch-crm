import logging
from typing import List, Optional, Any, Dict
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class CRMClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        # Не закрываем сессию между запросами
        self.client = httpx.AsyncClient(
            timeout=10.0,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
        )
    
    async def close(self):
        await self.client.aclose()
    
    async def get_cameras(self) -> List[Dict[str, Any]]:
        """Получить список активных камер"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/presence/cameras/status"
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                return data.get('data', [])
            return []
            
        except Exception as e:
            logger.error(f"Failed to get cameras from CRM: {e}")
            return []
    
    async def get_faces(self) -> List[Dict[str, Any]]:
        """Получить список известных лиц"""
        try:
            # Путь по умолчанию к API лиц (добавлено в actions.ts)
            response = await self.client.get(
                f"{self.base_url}/api/presence/faces"
            )
            
            # Если 404, возможно API еще не реализовано или путь другой
            if response.status_code == 404:
                return []
                
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                faces = data.get('data', [])
                # Преобразуем в нужный формат: список с user_id и encoding
                formatted = []
                for f in faces:
                    if f.get('faceEncoding'):
                        formatted.append({
                            'user_id': f['userId'],
                            'encoding': f['faceEncoding']
                        })
                return formatted
            return []
            
        except Exception as e:
            logger.error(f"Failed to get faces from CRM: {e}")
            return []

    async def get_workstations(self) -> List[Dict[str, Any]]:
        """Получить список рабочих мест"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/presence/workstations"
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                return data.get('data', [])
            return []
            
        except Exception as e:
            logger.error(f"Failed to get workstations from CRM: {e}")
            return []
    
    async def send_detection_event(
        self,
        camera_id: str,
        event_type: str,
        user_id: Optional[str] = None,
        confidence: float = 0,
        face_encoding: Optional[List[float]] = None,
        snapshot_url: Optional[str] = None,
        workstation_id: Optional[str] = None,
        face_position: Optional[dict] = None,
        metadata: Optional[dict] = None
    ):
        """Отправить событие детекции в CRM"""
        try:
            payload = {
                'camera_id': camera_id,
                'event_type': event_type,
                'confidence': confidence,
                'timestamp': datetime.now().isoformat()
            }
            
            if user_id:
                payload['user_id'] = user_id
            
            if face_encoding:
                payload['face_encoding'] = face_encoding
            
            if snapshot_url:
                payload['snapshot_url'] = snapshot_url

            if workstation_id:
                payload['workstation_id'] = workstation_id

            if face_position:
                payload['face_position'] = face_position

            if metadata:
                payload['metadata'] = metadata
            
            response = await self.client.post(
                f"{self.base_url}/api/presence/detect",
                json=payload
            )
            response.raise_for_status()
            
            data = response.json()
            if not data.get('success'):
                logger.warning(f"CRM returned error for detection event: {data.get('error')}")
            
        except Exception as e:
            logger.error(f"Failed to send detection event to CRM: {e}")
    
    async def update_camera_status(
        self,
        camera_id: str,
        status: str,
        error_message: Optional[str] = None
    ):
        """Обновить статус камеры в CRM"""
        try:
            payload = {
                'status': status
            }
            
            if error_message:
                payload['error_message'] = error_message
            
            # Используем общий эндпоинт управления статусом камер
            response = await self.client.patch(
                f"{self.base_url}/api/presence/cameras/{camera_id}/status",
                json=payload
            )
            # Не блокируем если статус не обновился (CRM может быть оффлайн)
            if response.status_code != 404:
                response.raise_for_status()
            
        except Exception as e:
            logger.error(f"Failed to update camera status in CRM: {e}")
