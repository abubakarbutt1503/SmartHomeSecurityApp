# YOLO Video Stream

A real-time video streaming application with YOLO object detection capabilities. This application can process video from webcams, video files, and RTSP streams while performing real-time object detection.

## Features

- **Real-time Object Detection**: Uses YOLOv5 for fast and accurate object detection
- **Multiple Input Sources**: Supports webcam, video files, and RTSP streams
- **Configurable Performance**: Adjustable FPS and resolution settings
- **Fallback Support**: Graceful fallback to OpenCV DNN if PyTorch YOLO is unavailable
- **Thread-safe**: Multi-threaded processing for smooth video streaming
- **Easy Integration**: Simple API for integrating into other applications

## Requirements

- Python 3.7+
- OpenCV 4.5+
- PyTorch 1.7+ (optional, for full YOLO functionality)
- CUDA support (optional, for GPU acceleration)

## Installation

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Download YOLO model** (if not already present):
   ```bash
   # The application will look for yolov5s.pt in the yolov5/ directory
   # You can download it from: https://github.com/ultralytics/yolov5/releases
   ```

## Usage

### Basic Usage

```python
from videostream import YOLOVideoStream

# Initialize stream
stream = YOLOVideoStream(device='cpu')

# Start webcam stream
stream.start_stream('0')

# Get current frame and detections
frame = stream.get_current_frame()
detections = stream.get_detection_results()

# Stop stream
stream.stop_stream()
```

### Command Line Interface

```bash
# Basic webcam stream
python videostream.py

# Custom video source
python videostream.py --source video.mp4

# Custom model and device
python videostream.py --model yolov5m.pt --device cuda

# Custom FPS and resolution
python videostream.py --fps 15 --width 1280 --height 720
```

### Command Line Options

- `--source`: Video source (0 for webcam, file path, or RTSP URL)
- `--model`: Path to YOLO model weights
- `--device`: Device to run inference on (cpu/cuda)
- `--fps`: Target FPS (default: 30)
- `--width`: Frame width (default: 640)
- `--height`: Frame height (default: 480)

### Testing

Run the test suite to verify functionality:

```bash
python test_videostream.py
```

## API Reference

### YOLOVideoStream Class

#### Constructor
```python
YOLOVideoStream(model_path='yolov5s.pt', device='cpu')
```

#### Methods

- `start_stream(source)`: Start video stream from source
- `stop_stream()`: Stop video stream
- `get_current_frame()`: Get current processed frame
- `get_detection_results()`: Get current detection results
- `set_fps(fps)`: Set target FPS
- `set_resolution(width, height)`: Set frame resolution

#### Properties

- `is_running`: Stream status
- `fps`: Current FPS setting
- `frame_width`: Current frame width
- `frame_height`: Current frame height

## Input Sources

### Webcam
```python
stream.start_stream('0')  # Default webcam
stream.start_stream('1')  # Secondary webcam
```

### Video File
```python
stream.start_stream('path/to/video.mp4')
stream.start_stream('path/to/video.avi')
```

### RTSP Stream
```python
stream.start_stream('rtsp://username:password@ip:port/stream')
stream.start_stream('http://ip:port/stream.m3u8')
```

## Performance Tuning

### FPS Control
```python
stream.set_fps(15)   # Lower FPS for better accuracy
stream.set_fps(60)   # Higher FPS for smoother video
```

### Resolution Control
```python
stream.set_resolution(1280, 720)  # HD
stream.set_resolution(1920, 1080) # Full HD
```

### Device Selection
```python
# CPU (slower but more compatible)
stream = YOLOVideoStream(device='cpu')

# GPU (faster but requires CUDA)
stream = YOLOVideoStream(device='cuda')
```

## Integration Examples

### Flask Web Application
```python
from flask import Flask, Response
from videostream import YOLOVideoStream
import cv2

app = Flask(__name__)
stream = YOLOVideoStream()

@app.route('/video_feed')
def video_feed():
    def generate():
        stream.start_stream('0')
        while True:
            frame = stream.get_current_frame()
            if frame is not None:
                ret, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        stream.stop_stream()
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)
```

### Real-time Monitoring
```python
import time
from videostream import YOLOVideoStream

def monitor_detections():
    stream = YOLOVideoStream()
    stream.start_stream('0')
    
    try:
        while True:
            detections = stream.get_detection_results()
            if detections:
                for detection in detections:
                    if detection['class_name'] == 'person':
                        print(f"Person detected with confidence: {detection['confidence']:.2f}")
            
            time.sleep(0.1)  # Check every 100ms
            
    except KeyboardInterrupt:
        print("Monitoring stopped")
    finally:
        stream.stop_stream()

monitor_detections()
```

## Troubleshooting

### Common Issues

1. **Model not found**: Ensure YOLO model file exists in the specified path
2. **CUDA errors**: Check CUDA installation and PyTorch CUDA support
3. **Webcam not accessible**: Verify webcam permissions and device availability
4. **Low FPS**: Reduce resolution or use GPU acceleration

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Performance Monitoring

Monitor actual vs. target FPS:
```python
import time

start_time = time.time()
frame_count = 0

while True:
    frame = stream.get_current_frame()
    if frame is not None:
        frame_count += 1
        
        if frame_count % 100 == 0:
            elapsed = time.time() - start_time
            actual_fps = frame_count / elapsed
            print(f"Actual FPS: {actual_fps:.1f}")
```

## License

This project is part of the HomeSafetyApp and follows the same licensing terms.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review existing issues
3. Create a new issue with detailed information
