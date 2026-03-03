import numpy as np
from typing import Optional, List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

class WorkstationDetector:
    """Detection of points/areas within zones and matching faces to workstations"""
    
    def __init__(self):
        self.workstations: Dict[str, List[dict]] = {}  # camera_id -> workstations
    
    def load_workstations(self, workstations: List[dict]):
        """Load workstations and group them by cameras"""
        self.workstations = {}
        
        for ws in workstations:
            camera_id = ws.get('cameraId')
            if not camera_id:
                continue
            
            if camera_id not in self.workstations:
                self.workstations[camera_id] = []
            
            self.workstations[camera_id].append(ws)

    def detect_workstation(
        self,
        camera_id: str,
        face_bbox: dict,  # {x, y, width, height} in pixels
        frame_size: Tuple[int, int]  # (width, height)
    ) -> Optional[dict]:
        """
        Find a workstation for a detected face
        
        Args:
            camera_id: Camera ID
            face_bbox: Face coordinates in pixels
            frame_size: Frame size (width, height)
        
        Returns:
            Workstation info or None
        """
        camera_workstations = self.workstations.get(camera_id, [])
        
        if not camera_workstations:
            return None
        
        # If only one workstation for this camera and no zone is defined, return it
        if len(camera_workstations) == 1:
            ws = camera_workstations[0]
            if not ws.get('zone'):
                return ws
        
        # Normalize bbox (0-1)
        normalized_bbox = {
            'x': face_bbox['x'] / frame_size[0],
            'y': face_bbox['y'] / frame_size[1],
            'width': face_bbox['width'] / frame_size[0],
            'height': face_bbox['height'] / frame_size[1]
        }
        
        best_match = None
        best_overlap = 0.0
        
        for ws in camera_workstations:
            zone = ws.get('zone')
            if not zone:
                continue
            
            is_inside, overlap = self.bbox_in_zone(normalized_bbox, zone)
            
            if is_inside and overlap > best_overlap:
                best_overlap = overlap
                best_match = ws
        
        return best_match

    def bbox_in_zone(
        self,
        bbox: Dict[str, float],  # {x, y, width, height} normalized
        zone: dict,
        threshold: float = 0.5  # Minimum overlap ratio
    ) -> Tuple[bool, float]:
        """
        Check if a bounding box is within a zone
        
        Returns:
            (is_inside, overlap_ratio)
        """
        # Center of bbox
        center = Point(
            x=bbox['x'] + bbox['width'] / 2,
            y=bbox['y'] + bbox['height'] / 2
        )
        
        # Check if center is inside
        center_inside = self.point_in_zone(center, zone)
        
        zone_type = zone.get('type')
        if zone_type == 'rect':
            overlap = self._rect_overlap(bbox, zone)
        elif zone_type == 'polygon':
            overlap = self._polygon_overlap(bbox, zone)
        elif zone_type == 'circle':
            overlap = self._circle_overlap(bbox, zone)
        else:
            overlap = 0.0
        
        return (overlap >= threshold or center_inside, overlap)

    def point_in_zone(self, point: Point, zone: dict) -> bool:
        """Check if a point is inside a zone"""
        zone_type = zone.get('type')
        
        if zone_type == 'rect':
            return (
                zone['x'] <= point.x <= zone['x'] + zone['width'] and
                zone['y'] <= point.y <= zone['y'] + zone['height']
            )
        elif zone_type == 'polygon':
            points = zone.get('points', [])
            if len(points) < 3:
                return False
            
            n = len(points)
            inside = False
            j = n - 1
            for i in range(n):
                pi = points[i]
                pj = points[j]
                if ((pi['y'] > point.y) != (pj['y'] > point.y)) and \
                   (point.x < (pj['x'] - pi['x']) * (point.y - pi['y']) / (pj['y'] - pi['y']) + pi['x']):
                    inside = not inside
                j = i
            return inside
        elif zone_type == 'circle':
            dx = point.x - zone['cx']
            dy = point.y - zone['cy']
            distance = np.sqrt(dx * dx + dy * dy)
            return distance <= zone['radius']
        
        return False

    def _rect_overlap(self, bbox: dict, zone: dict) -> float:
        """Calculate intersection over union (or just intersection over bbox area)"""
        x1 = max(bbox['x'], zone['x'])
        y1 = max(bbox['y'], zone['y'])
        x2 = min(bbox['x'] + bbox['width'], zone['x'] + zone['width'])
        y2 = min(bbox['y'] + bbox['height'], zone['y'] + zone['height'])
        
        if x2 <= x1 or y2 <= y1:
            return 0.0
        
        intersection = (x2 - x1) * (y2 - y1)
        bbox_area = bbox['width'] * bbox['height']
        
        return intersection / bbox_area if bbox_area > 0 else 0.0

    def _polygon_overlap(self, bbox: dict, zone: dict) -> float:
        """Approximate intersection using grid sampling"""
        # Sample 9 points (3x3 grid)
        sample_points = []
        for i in range(3):
            for j in range(3):
                sample_points.append(Point(
                    x=bbox['x'] + bbox['width'] * (i + 0.5) / 3,
                    y=bbox['y'] + bbox['height'] * (j + 0.5) / 3
                ))
        
        inside_count = sum(1 for p in sample_points if self.point_in_zone(p, zone))
        return inside_count / len(sample_points)

    def _circle_overlap(self, bbox: dict, zone: dict) -> float:
        """Approximate intersection using grid sampling"""
        sample_points = []
        for i in range(3):
            for j in range(3):
                sample_points.append(Point(
                    x=bbox['x'] + bbox['width'] * (i + 0.5) / 3,
                    y=bbox['y'] + bbox['height'] * (j + 0.5) / 3
                ))
        
        inside_count = sum(1 for p in sample_points if self.point_in_zone(p, zone))
        return inside_count / len(sample_points)
