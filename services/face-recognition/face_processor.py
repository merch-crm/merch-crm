import logging
import numpy as np
import cv2
from typing import Optional, Tuple, List
import insightface
from insightface.app import FaceAnalysis

logger = logging.getLogger(__name__)

class FaceProcessor:
    def __init__(self, config: dict):
        self.config = config
        self.confidence_threshold = config.get('confidence_threshold', 0.6)
        self.face_size = config.get('face_size', 112)
        self.max_faces = config.get('max_faces', 10)
        
        self.gpu_available = False
        self.app = None
        
        self._initialize_model()
    
    def _initialize_model(self):
        """Инициализация модели InsightFace"""
        try:
            # Пытаемся использовать GPU
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
            
            self.app = FaceAnalysis(
                name='buffalo_l',
                providers=providers
            )
            self.app.prepare(ctx_id=0, det_size=(640, 640))
            
            # Проверяем доступность GPU
            try:
                import onnxruntime as ort
                available_providers = ort.get_available_providers()
                self.gpu_available = 'CUDAExecutionProvider' in available_providers
            except:
                self.gpu_available = False
            
            logger.info(f"InsightFace initialized. GPU: {self.gpu_available}")
            
        except Exception as e:
            logger.error(f"Failed to initialize InsightFace: {e}")
            raise
    
    def encode_face_from_bytes(self, image_bytes: bytes) -> Optional[Tuple[np.ndarray, float]]:
        """Получить embedding лица из байтов изображения"""
        try:
            # Декодируем изображение
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                logger.error("Failed to decode image")
                return None
            
            return self.encode_face(image)
            
        except Exception as e:
            logger.error(f"Error encoding face from bytes: {e}")
            return None
    
    def encode_face(self, image: np.ndarray) -> Optional[Tuple[np.ndarray, float]]:
        """Получить embedding лица из изображения"""
        try:
            # Детектируем лица
            faces = self.app.get(image)
            
            if not faces:
                return None
            
            # Берём самое большое лицо (ближайшее к камере)
            face = max(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]))
            
            # Качество = размер лица относительно изображения
            face_area = (face.bbox[2] - face.bbox[0]) * (face.bbox[3] - face.bbox[1])
            image_area = image.shape[0] * image.shape[1]
            quality = min(face_area / image_area * 10, 1.0)  # Нормализуем до 1.0
            
            return face.embedding, quality
            
        except Exception as e:
            logger.error(f"Error encoding face: {e}")
            return None
    
    def detect_faces(self, image: np.ndarray) -> List[dict]:
        """Детектировать все лица на изображении"""
        try:
            faces = self.app.get(image)
            
            results = []
            for face in faces[:self.max_faces]:
                bbox = face.bbox.astype(int).tolist()
                
                # Качество на основе размера и уверенности детекции
                face_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
                image_area = image.shape[0] * image.shape[1]
                size_quality = min(face_area / image_area * 10, 1.0)
                det_score = float(face.det_score)
                quality = (size_quality + det_score) / 2
                
                results.append({
                    'bbox': bbox,
                    'embedding': face.embedding,
                    'quality': quality,
                    'det_score': det_score
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error detecting faces: {e}")
            return []
    
    def compare_faces(
        self, 
        embedding1: np.ndarray, 
        embedding2: np.ndarray
    ) -> float:
        """Сравнить два embedding'а лиц (косинусное сходство)"""
        try:
            # Нормализация
            norm1 = np.linalg.norm(embedding1)
            norm2 = np.linalg.norm(embedding2)
            if norm1 == 0 or norm2 == 0: return 0.0
            
            e1 = embedding1 / norm1
            e2 = embedding2 / norm2
            
            # Косинусное сходство
            similarity = np.dot(e1, e2)
            
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Error comparing faces: {e}")
            return 0.0
    
    def find_best_match(
        self, 
        embedding: np.ndarray, 
        known_faces: List[dict],
        threshold: Optional[float] = None
    ) -> Optional[dict]:
        """Найти лучшее совпадение среди известных лиц"""
        if threshold is None:
            threshold = self.confidence_threshold
        
        best_match = None
        best_score = threshold
        
        for face_data in known_faces:
            known_embedding = np.array(face_data['encoding'])
            score = self.compare_faces(embedding, known_embedding)
            
            if score > best_score:
                best_score = score
                best_match = {
                    'user_id': face_data['user_id'],
                    'confidence': score
                }
        
        return best_match
