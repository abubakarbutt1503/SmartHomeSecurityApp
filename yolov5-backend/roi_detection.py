import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class ROIDetector:
    def __init__(self):
        self.shapes = []
        self.selected_shape = None
        self.drawing = False
        self.start_point = None
        self.current_shape = []
        self.pulse = 0
        self.alert_triggered = False
        
        # Button positions for shape selection
        self.buttons = {
            "rectangle": (10, 10, 110, 40),
            "triangle": (120, 10, 220, 40),
            "polygon": (230, 10, 330, 40),
            "circle": (340, 10, 440, 40),
        }
    
    def generate_polygon_box(self, start, end, sides=6):
        """Generate polygon points"""
        cx = (start[0] + end[0]) / 2
        cy = (start[1] + end[1]) / 2
        rx = abs(end[0] - start[0]) / 2
        ry = abs(end[1] - start[1]) / 2
        return [(int(cx + rx * np.cos(2 * np.pi * i / sides)),
                 int(cy + ry * np.sin(2 * np.pi * i / sides))) for i in range(sides)]
    
    def generate_triangle_box(self, start, end):
        """Generate triangle points"""
        x1, y1 = start
        x2, y2 = end
        return [((x1 + x2) // 2, y1), (x1, y2), (x2, y2)]
    
    def handle_mouse_event(self, event, x, y, flags, param):
        """Handle mouse events for drawing shapes"""
        logger.info(f"ROI mouse event: {event} at ({x}, {y})")
        
        if event == cv2.EVENT_LBUTTONDOWN:
            # Check if clicking on shape buttons
            for shape, (x1, y1, x2, y2) in self.buttons.items():
                if x1 <= x <= x2 and y1 <= y <= y2:
                    self.selected_shape = shape
                    logger.info(f"Selected shape: {shape}")
                    return
            
            # Start drawing if shape is selected
            if self.selected_shape:
                self.drawing = True
                self.start_point = (x, y)
                logger.info(f"Started drawing {self.selected_shape} at ({x}, {y})")
            else:
                logger.info("No shape selected, cannot start drawing")
        
        elif event == cv2.EVENT_MOUSEMOVE and self.drawing:
            end_point = (x, y)
            if self.selected_shape == 'rectangle':
                self.current_shape = [self.start_point, end_point]
            elif self.selected_shape == 'triangle':
                self.current_shape = self.generate_triangle_box(self.start_point, end_point)
            elif self.selected_shape == 'polygon':
                self.current_shape = self.generate_polygon_box(self.start_point, end_point)
            elif self.selected_shape == 'circle':
                radius = int(np.hypot(end_point[0] - self.start_point[0], 
                                    end_point[1] - self.start_point[1]))
                self.current_shape = [self.start_point, radius]
            logger.info(f"Drawing preview: {self.selected_shape} at ({x}, {y})")
        
        elif event == cv2.EVENT_LBUTTONUP and self.drawing:
            self.drawing = False
            if self.current_shape:
                self.shapes.append((self.selected_shape, self.current_shape.copy()))
                logger.info(f"Completed drawing {self.selected_shape}, total shapes: {len(self.shapes)}")
            self.current_shape.clear()

    def handle_web_draw_event(self, event_type: str, x: int, y: int):
        """Handle drawing events from web interface"""
        logger.info(f"Web draw event: {event_type} at ({x}, {y})")
        
        if event_type == 'mousedown':
            # Check if clicking on shape buttons
            for shape, (x1, y1, x2, y2) in self.buttons.items():
                if x1 <= x <= x2 and y1 <= y <= y2:
                    self.selected_shape = shape
                    logger.info(f"Selected shape: {shape}")
                    return
            
            # Start drawing if shape is selected
            if self.selected_shape:
                self.drawing = True
                self.start_point = (x, y)
                logger.info(f"Started drawing {self.selected_shape} at ({x}, {y})")
            else:
                logger.info("No shape selected, cannot start drawing")
        
        elif event_type == 'mousemove' and self.drawing:
            end_point = (x, y)
            if self.selected_shape == 'rectangle':
                self.current_shape = [self.start_point, end_point]
            elif self.selected_shape == 'triangle':
                self.current_shape = self.generate_triangle_box(self.start_point, end_point)
            elif self.selected_shape == 'polygon':
                self.current_shape = self.generate_polygon_box(self.start_point, end_point)
            elif self.selected_shape == 'circle':
                radius = int(np.hypot(end_point[0] - self.start_point[0], 
                                    end_point[1] - self.start_point[1]))
                self.current_shape = [self.start_point, radius]
            logger.info(f"Drawing preview: {self.selected_shape} at ({x}, {y})")
        
        elif event_type == 'mouseup' and self.drawing:
            self.drawing = False
            if self.current_shape:
                self.shapes.append((self.selected_shape, self.current_shape.copy()))
                logger.info(f"Completed drawing {self.selected_shape}, total shapes: {len(self.shapes)}")
            self.current_shape.clear()
    
    def is_point_in_shape(self, point, shape_type, shape_data):
        """Check if a point is inside a shape"""
        try:
            px = int(point[0])
            py = int(point[1])
            point_tuple = (px, py)
            
            if shape_type == 'rectangle':
                (x1, y1), (x2, y2) = shape_data
                return x1 <= px <= x2 and y1 <= py <= y2
            
            elif shape_type in ['triangle', 'polygon']:
                polygon = np.array(shape_data, dtype=np.int32)
                if polygon.ndim == 2 and polygon.shape[0] >= 3:
                    polygon = polygon.reshape((-1, 1, 2))
                    return cv2.pointPolygonTest(polygon, point_tuple, False) >= 0
            
            elif shape_type == 'circle':
                center, radius = shape_data
                return np.linalg.norm(np.array([px, py]) - np.array(center)) <= radius
                
        except Exception as e:
            logger.error(f"Error in shape check: {e}")
        return False
    
    def is_mask_in_shape(self, mask, shape_type, shape_data):
        """Check if a mask intersects with a shape"""
        indices = np.argwhere(mask == 255)
        for y, x in indices:
            if self.is_point_in_shape((x, y), shape_type, shape_data):
                return True
        return False
    
    def detect_humans_in_roi(self, frame: np.ndarray, yolo_results) -> Tuple[np.ndarray, bool, List[Dict]]:
        """
        Detect humans in ROI shapes and return processed frame with alerts
        
        Args:
            frame: Input frame
            yolo_results: YOLO detection results
            
        Returns:
            Tuple of (processed_frame, alert_triggered, detection_results)
        """
        try:
            result_frame = frame.copy()
            self.pulse = (self.pulse + 10) % 255
            self.alert_triggered = False
            detection_results = []
            
            # Process YOLO results for human detection
            if yolo_results and hasattr(yolo_results[0], 'masks') and yolo_results[0].masks is not None:
                for mask in yolo_results[0].masks.data:
                    mask_np = (mask.cpu().numpy() * 255).astype(np.uint8)
                    mask_resized = cv2.resize(mask_np, (frame.shape[1], frame.shape[0]))
                    
                    # Check if human mask intersects with any ROI shape
                    for shape_type, shape_data in self.shapes:
                        if self.is_mask_in_shape(mask_resized, shape_type, shape_data):
                            self.alert_triggered = True
                            detection_results.append({
                                'type': 'human_in_roi',
                                'shape_type': shape_type,
                                'shape_data': shape_data,
                                'confidence': 1.0
                            })
                            break
                    
                    # Draw mask outline
                    contours, _ = cv2.findContours(mask_resized, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    cv2.drawContours(result_frame, contours, -1, (0, 0, 255), 2)
            
            # Draw shape selection buttons
            self.draw_buttons(result_frame)
            
            # Draw existing shapes
            for shape_type, data in self.shapes:
                color = (0, 0, 255 - self.pulse) if self.alert_triggered else (0, 255, 0)
                if shape_type == 'rectangle':
                    cv2.rectangle(result_frame, data[0], data[1], color, 2)
                elif shape_type in ['triangle', 'polygon']:
                    cv2.polylines(result_frame, [np.array(data, dtype=np.int32)], True, color, 2)
                elif shape_type == 'circle':
                    cv2.circle(result_frame, data[0], data[1], color, 2)
            
            # Draw current shape being drawn
            if self.current_shape:
                color = (255, 255, 0)
                if self.selected_shape == 'rectangle':
                    cv2.rectangle(result_frame, self.current_shape[0], self.current_shape[1], color, 1)
                elif self.selected_shape in ['triangle', 'polygon']:
                    cv2.polylines(result_frame, [np.array(self.current_shape, dtype=np.int32)], True, color, 1)
                elif self.selected_shape == 'circle':
                    cv2.circle(result_frame, self.current_shape[0], self.current_shape[1], color, 1)
            
            # Draw alert text if triggered
            if self.alert_triggered:
                cv2.putText(result_frame, "🚨 Person Inside Boundary!", (20, 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 3)
            
            return result_frame, self.alert_triggered, detection_results
            
        except Exception as e:
            logger.error(f"ROI detection failed: {e}")
            return frame, False, []
    
    def draw_buttons(self, frame):
        """Draw shape selection buttons"""
        for label, (x1, y1, x2, y2) in self.buttons.items():
            color = (0, 255, 255) if self.selected_shape == label else (200, 200, 200)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, -1)
            cv2.putText(frame, label.title(), (x1 + 10, y1 + 25),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
    
    def get_shapes(self) -> List[Tuple[str, List]]:
        """Get current shapes"""
        return self.shapes.copy()
    
    def clear_shapes(self):
        """Clear all shapes"""
        self.shapes.clear()
        self.current_shape.clear()
        logger.info("All ROI shapes cleared")
    
    def remove_last_shape(self):
        """Remove the last drawn shape"""
        if self.shapes:
            self.shapes.pop()
            logger.info("Last ROI shape removed")
    
    def set_selected_shape(self, shape_type: str):
        """Set the selected shape type"""
        if shape_type in self.buttons:
            self.selected_shape = shape_type
            logger.info(f"Selected shape type: {shape_type}")
        else:
            logger.warning(f"Invalid shape type: {shape_type}")
    
    def get_status(self) -> Dict:
        """Get current ROI detection status"""
        return {
            'shapes_count': len(self.shapes),
            'selected_shape': self.selected_shape,
            'alert_triggered': self.alert_triggered,
            'shapes': [
                {
                    'type': shape_type,
                    'data': shape_data
                } for shape_type, shape_data in self.shapes
            ]
        }
