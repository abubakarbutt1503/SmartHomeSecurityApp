from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import base64
import cv2
import numpy as np
import io
import sys
import os
from PIL import Image

# Setup paths
current_dir = os.path.dirname(os.path.abspath(__file__))
yolo_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(current_dir))), 'yolov5')
if yolo_dir not in sys.path:
    sys.path.append(yolo_dir)

# Import YOLOv5 model
try:
    from models.common import DetectMultiBackend
    from utils.general import check_img_size, non_max_suppression, scale_boxes
    from utils.torch_utils import select_device
    print("YOLOv5 imports successful")
except ImportError as e:
    print(f"Error importing YOLOv5 modules: {e}")
    print(f"Current sys.path: {sys.path}")
    print(f"Looking for YOLOv5 at: {yolo_dir}")
    raise

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize YOLOv5 model
try:
    MODEL_PATH = os.path.join(yolo_dir, 'yolov5s.pt')
    DEVICE = select_device('')  # Use CPU if no GPU available
    IMG_SIZE = 640
    
    if not os.path.exists(MODEL_PATH):
        print(f"Model file not found at {MODEL_PATH}")
        available_files = os.listdir(os.path.dirname(MODEL_PATH))
        print(f"Available files in directory: {available_files}")
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

    model = DetectMultiBackend(
        weights=MODEL_PATH,
        device=DEVICE,
        data=os.path.join(yolo_dir, 'data/coco128.yaml'),
        fp16=False
    )
    stride, names, pt = model.stride, model.names, model.pt
    img_size = check_img_size(IMG_SIZE, s=stride)  # Check image size

    print(f"YOLOv5 model loaded from {MODEL_PATH}")
    print(f"Class names: {names}")
except Exception as e:
    print(f"Error initializing YOLOv5 model: {e}")
    model = None
    names = None

@app.route('/detect', methods=['POST'])
def detect():
    if model is None:
        return jsonify({'error': 'Model not initialized'}), 500
        
    try:
        # Check for different request types
        if request.content_type and 'multipart/form-data' in request.content_type:
            print("Handling multipart form data request")
            if 'file' not in request.files:
                return jsonify({'error': 'No file part in the request'}), 400
                
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
                
            # Read image file
            img_bytes = file.read()
            
        elif request.content_type and 'application/json' in request.content_type:
            print("Handling JSON request with base64 image")
            # Get base64 encoded image from request
            content = request.json
            if not content or 'image' not in content:
                return jsonify({'error': 'No image data provided'}), 400

            # Decode base64 image
            try:
                base64_data = content['image']
                # Remove data URL prefix if present
                if ',' in base64_data:
                    base64_data = base64_data.split(',', 1)[1]
                img_bytes = base64.b64decode(base64_data)
            except Exception as e:
                return jsonify({'error': f'Invalid base64 data: {str(e)}'}), 400
        else:
            return jsonify({'error': 'Unsupported content type'}), 400
        
        # Convert to OpenCV format
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': 'Could not decode image'}), 400
            
        # Prepare image for YOLOv5
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (img_size, img_size))
        
        # Convert to PyTorch tensor
        img_tensor = torch.from_numpy(img_resized.transpose(2, 0, 1)).float().div(255.0).unsqueeze(0).to(DEVICE)
        
        # Run inference
        model.warmup(imgsz=(1, 3, img_size, img_size))  # Warmup
        pred = model(img_tensor, augment=False)
        
        # Apply NMS
        # Detect all classes, not just people
        pred = non_max_suppression(pred, 0.25, 0.45)
        
        detections = []
        for i, det in enumerate(pred):
            if len(det):
                # Rescale boxes from img_size to img size
                det[:, :4] = scale_boxes(img_tensor.shape[2:], det[:, :4], img.shape).round()
                
                # Convert detections to JSON format
                for *xyxy, conf, cls in det:
                    # Convert to normalized coordinates (0-1)
                    x1, y1, x2, y2 = (
                        xyxy[0].item() / img.shape[1],
                        xyxy[1].item() / img.shape[0],
                        xyxy[2].item() / img.shape[1],
                        xyxy[3].item() / img.shape[0]
                    )
                    
                    # Calculate width and height (normalized)
                    w = x2 - x1
                    h = y2 - y1
                    
                    class_id = int(cls)
                    class_name = names[class_id]
                    
                    # Format as expected by the YoloCamera component
                    detections.append({
                        'box': [x1, y1, w, h],  # [x, y, width, height] format
                        'class': class_name,
                        'confidence': float(conf)
                    })
        
        return jsonify({
            'success': True,
            'detections': detections
        })
    
    except Exception as e:
        import traceback
        print(f"Error processing request: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/status', methods=['GET'])
def status():
    """Endpoint to check if the server is running and model is loaded"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'device': str(DEVICE),
        'class_names': names if names else []
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 