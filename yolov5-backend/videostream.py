import cv2
import numpy as np
import torch
import time
import threading
from pathlib import Path
import argparse
import logging
from typing import Optional, Tuple, List, Dict, Any
import json
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YOLOVideoStream:
    """
    Real-time video streaming with YOLO object detection
    """
    
    def __init__(self, model_path: str = 'yolov5s.pt', device: str = 'cpu'):
        """
        Initialize YOLO video stream
        
        Args:
            model_path: Path to YOLO model weights
            device: Device to run inference on ('cpu' or 'cuda')
        """
        self.model_path = model_path
        self.device = device
        self.model = None
        self.is_running = False
        self.current_frame = None
        self.detection_results = []
        self.lock = threading.Lock()
        
        # Initialize YOLO model
        self._load_model()
        
        # Stream configuration
        self.fps = 30
        self.frame_width = 640
        self.frame_height = 480
        
    def _load_model(self):
        """Load YOLO model"""
        try:
            # Import YOLO from local yolov5 directory
            import sys
            yolov5_path = Path(__file__).parent / 'yolov5'
            if yolov5_path.exists():
                sys.path.append(str(yolov5_path))
            
            from models.common import DetectMultiBackend
            from utils.general import check_img_size, non_max_suppression
            from utils.plots import Annotator, colors
            from utils.torch_utils import select_device
            
            self.device = select_device(self.device)
            self.model = DetectMultiBackend(self.model_path, device=self.device)
            
            # Set inference size
            self.imgsz = check_img_size((640, 640), s=self.model.stride.max())
            
            logger.info(f"YOLO model loaded successfully on {self.device}")
            
        except ImportError as e:
            logger.error(f"Failed to import YOLO modules: {e}")
            logger.info("Falling back to basic OpenCV DNN")
            self._load_opencv_dnn()
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            self._load_opencv_dnn()
    
    def _load_opencv_dnn(self):
        """Fallback to OpenCV DNN if YOLO import fails"""
        try:
            # Try to load YOLO model using OpenCV DNN
            config_path = Path(__file__).parent / 'yolov5' / 'yolov5s.onnx'
            if not config_path.exists():
                logger.warning("OpenCV DNN fallback not available")
                return
            
            self.model = cv2.dnn.readNetFromONNX(str(config_path))
            if self.device == 'cuda':
                self.model.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
                self.model.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)
            else:
                self.model.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
                self.model.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
                
            logger.info("OpenCV DNN model loaded as fallback")
            
        except Exception as e:
            logger.error(f"Failed to load OpenCV DNN model: {e}")
    
    def start_stream(self, source: str = '0'):
        """
        Start video stream from source
        
        Args:
            source: Video source (0 for webcam, file path, or RTSP URL)
        """
        try:
            # Convert source to int if it's a webcam index
            if source.isdigit():
                source = int(source)
            
            self.cap = cv2.VideoCapture(source)
            if not self.cap.isOpened():
                raise ValueError(f"Failed to open video source: {source}")
            
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.frame_width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.frame_height)
            self.cap.set(cv2.CAP_PROP_FPS, self.fps)
            
            self.is_running = True
            logger.info(f"Video stream started from source: {source}")
            
            # Start processing thread
            self.processing_thread = threading.Thread(target=self._process_stream)
            self.processing_thread.daemon = True
            self.processing_thread.start()
            
        except Exception as e:
            logger.error(f"Failed to start video stream: {e}")
            raise
    
    def _process_stream(self):
        """Main processing loop for video stream"""
        while self.is_running:
            try:
                ret, frame = self.cap.read()
                if not ret:
                    logger.warning("Failed to read frame")
                    time.sleep(0.1)
                    continue
                
                # Process frame with YOLO
                processed_frame, detections = self._detect_objects(frame)
                
                # Update current frame and results
                with self.lock:
                    self.current_frame = processed_frame
                    self.detection_results = detections
                
                # Control FPS
                time.sleep(1.0 / self.fps)
                
            except Exception as e:
                logger.error(f"Error in processing loop: {e}")
                time.sleep(0.1)
    
    def _detect_objects(self, frame: np.ndarray) -> Tuple[np.ndarray, List[Dict]]:
        """
        Detect objects in frame using YOLO
        
        Args:
            frame: Input frame
            
        Returns:
            Tuple of (processed_frame, detection_results)
        """
        try:
            if self.model is None:
                return frame, []
            
            # Preprocess frame
            if hasattr(self.model, 'forward'):  # PyTorch model
                return self._detect_pytorch(frame)
            else:  # OpenCV DNN model
                return self._detect_opencv(frame)
                
        except Exception as e:
            logger.error(f"Object detection failed: {e}")
            return frame, []
    
    def _detect_pytorch(self, frame: np.ndarray) -> Tuple[np.ndarray, List[Dict]]:
        """Detect objects using PyTorch YOLO model"""
        try:
            from utils.general import non_max_suppression
            from utils.plots import Annotator, colors
            
            # Preprocess image
            img = cv2.resize(frame, (640, 640))
            img = img.transpose((2, 0, 1))[::-1]  # HWC to CHW, BGR to RGB
            img = np.ascontiguousarray(img)
            img = torch.from_numpy(img).to(self.device)
            img = img.float()
            img /= 255.0
            if len(img.shape) == 3:
                img = img[None]
            
            # Inference
            pred = self.model(img, augment=False, visualize=False)
            pred = non_max_suppression(pred, 0.25, 0.45, classes=None, agnostic=False, max_det=1000)
            
            # Process detections
            detections = []
            for i, det in enumerate(pred):
                if len(det):
                    # Rescale boxes from img_size to frame size
                    det[:, :4] = self._scale_coords(img.shape[2:], det[:, :4], frame.shape).round()
                    
                    for *xyxy, conf, cls in det:
                        detection = {
                            'bbox': [int(x) for x in xyxy],
                            'confidence': float(conf),
                            'class_id': int(cls),
                            'class_name': self._get_class_name(int(cls))
                        }
                        detections.append(detection)
            
            # Draw detections on frame
            annotated_frame = self._draw_detections(frame, detections)
            
            return annotated_frame, detections
            
        except Exception as e:
            logger.error(f"PyTorch detection failed: {e}")
            return frame, []
    
    def _detect_opencv(self, frame: np.ndarray) -> Tuple[np.ndarray, List[Dict]]:
        """Detect objects using OpenCV DNN model"""
        try:
            # Preprocess image
            blob = cv2.dnn.blobFromImage(frame, 1/255.0, (640, 640), swapRB=True, crop=False)
            self.model.setInput(blob)
            
            # Forward pass
            outputs = self.model.forward()
            
            # Process outputs
            detections = self._process_opencv_outputs(outputs, frame)
            
            # Draw detections
            annotated_frame = self._draw_detections(frame, detections)
            
            return annotated_frame, detections
            
        except Exception as e:
            logger.error(f"OpenCV detection failed: {e}")
            return frame, []
    
    def _process_opencv_outputs(self, outputs, frame):
        """Process OpenCV DNN outputs"""
        detections = []
        height, width = frame.shape[:2]
        
        # COCO class names (basic set)
        class_names = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat']
        
        for detection in outputs[0, 0, :, :]:
            scores = detection[4:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            
            if confidence > 0.5:
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                
                x1 = int(center_x - w/2)
                y1 = int(center_y - h/2)
                x2 = int(center_x + w/2)
                y2 = int(center_y + h/2)
                
                detection_info = {
                    'bbox': [x1, y1, x2, y2],
                    'confidence': float(confidence),
                    'class_id': int(class_id),
                    'class_name': class_names[class_id] if class_id < len(class_names) else f'class_{class_id}'
                }
                detections.append(detection_info)
        
        return detections
    
    def _scale_coords(self, img1_shape, coords, img0_shape, ratio_pad=None):
        """Scale coordinates from img1_shape to img0_shape"""
        if ratio_pad is None:
            gain = min(img1_shape[0] / img0_shape[0], img1_shape[1] / img0_shape[1])
            pad = (img1_shape[1] - img0_shape[1] * gain) / 2, (img1_shape[0] - img0_shape[0] * gain) / 2
        else:
            gain = ratio_pad[0][0]
            pad = ratio_pad[1]
        
        coords[:, [0, 2]] -= pad[0]
        coords[:, [1, 3]] -= pad[1]
        coords[:, :4] /= gain
        self._clip_coords(coords, img0_shape)
        return coords
    
    def _clip_coords(self, boxes, img_shape):
        """Clip bounding boxes to image shape"""
        boxes[:, 0].clamp_(0, img_shape[1])
        boxes[:, 1].clamp_(0, img_shape[0])
        boxes[:, 2].clamp_(0, img_shape[1])
        boxes[:, 3].clamp_(0, img_shape[0])
    
    def _get_class_name(self, class_id: int) -> str:
        """Get class name from class ID"""
        # COCO dataset class names
        class_names = [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
            'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
            'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
            'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
            'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
            'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
            'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
            'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
            'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
            'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
        ]
        
        return class_names[class_id] if 0 <= class_id < len(class_names) else f'class_{class_id}'
    
    def _draw_detections(self, frame: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """Draw detection boxes and labels on frame"""
        annotated_frame = frame.copy()
        
        for detection in detections:
            bbox = detection['bbox']
            confidence = detection['confidence']
            class_name = detection['class_name']
            
            # Draw bounding box
            cv2.rectangle(annotated_frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
            
            # Draw label
            label = f'{class_name}: {confidence:.2f}'
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
            
            # Draw label background
            cv2.rectangle(annotated_frame, 
                         (bbox[0], bbox[1] - label_size[1] - 10),
                         (bbox[0] + label_size[0], bbox[1]),
                         (0, 255, 0), -1)
            
            # Draw label text
            cv2.putText(annotated_frame, label, (bbox[0], bbox[1] - 5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
        
        return annotated_frame
    
    def get_current_frame(self) -> Optional[np.ndarray]:
        """Get current processed frame"""
        with self.lock:
            return self.current_frame.copy() if self.current_frame is not None else None
    
    def get_detection_results(self) -> List[Dict]:
        """Get current detection results"""
        with self.lock:
            return self.detection_results.copy()
    
    def set_fps(self, fps: int):
        """Set target FPS"""
        self.fps = max(1, min(60, fps))
        logger.info(f"FPS set to {self.fps}")
    
    def set_resolution(self, width: int, height: int):
        """Set frame resolution"""
        self.frame_width = width
        self.frame_height = height
        if hasattr(self, 'cap') and self.cap.isOpened():
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        logger.info(f"Resolution set to {width}x{height}")
    
    def stop_stream(self):
        """Stop video stream"""
        self.is_running = False
        if hasattr(self, 'cap') and self.cap.isOpened():
            self.cap.release()
        logger.info("Video stream stopped")
    
    def __del__(self):
        """Cleanup on deletion"""
        self.stop_stream()

def main():
    """Main function for testing video stream"""
    parser = argparse.ArgumentParser(description='YOLO Video Stream')
    parser.add_argument('--source', type=str, default='0', help='Video source (0 for webcam, file path, or RTSP URL)')
    parser.add_argument('--model', type=str, default='yolov5s.pt', help='Path to YOLO model')
    parser.add_argument('--device', type=str, default='cpu', help='Device to run inference on (cpu/cuda)')
    parser.add_argument('--fps', type=int, default=30, help='Target FPS')
    parser.add_argument('--width', type=int, default=640, help='Frame width')
    parser.add_argument('--height', type=int, default=480, help='Frame height')
    
    args = parser.parse_args()
    
    try:
        # Initialize video stream
        stream = YOLOVideoStream(model_path=args.model, device=args.device)
        stream.set_fps(args.fps)
        stream.set_resolution(args.width, args.height)
        
        # Start stream
        stream.start_stream(args.source)
        
        print("Press 'q' to quit, 's' to save frame, 'r' to reset")
        
        while True:
            frame = stream.get_current_frame()
            if frame is not None:
                # Display frame
                cv2.imshow('YOLO Video Stream', frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('s'):
                    # Save current frame
                    timestamp = int(time.time())
                    filename = f'frame_{timestamp}.jpg'
                    cv2.imwrite(filename, frame)
                    print(f"Frame saved as {filename}")
                elif key == ord('r'):
                    # Reset stream
                    stream.stop_stream()
                    stream.start_stream(args.source)
                    print("Stream reset")
                
                # Display detection info
                detections = stream.get_detection_results()
                if detections:
                    print(f"Detected {len(detections)} objects: {[d['class_name'] for d in detections]}")
        
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        logger.error(f"Error in main: {e}")
    finally:
        if 'stream' in locals():
            stream.stop_stream()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
