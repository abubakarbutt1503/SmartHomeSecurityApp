# Components

This directory contains reusable components for the Home Safety App.

## YoloCamera Component

The `YoloCamera` component integrates the YOLOv5 object detection model with the device camera feed for real-time object detection.

### Features

- Real-time object detection using YOLOv5
- Live camera feed with bounding boxes around detected objects
- Support for both single photo detection and continuous detection
- Camera flip functionality
- Status indicators for YOLOv5 server connection

### Usage

```jsx
import YoloCamera from '../components/YoloCamera';

// Basic usage
<YoloCamera />

// With close handler
<YoloCamera onClose={() => setShowCamera(false)} />

// With custom styles
<YoloCamera style={{ borderRadius: 8 }} />
```

### Configuration

The component has a few configurable settings in the file:

- `DETECTION_SERVER_URL`: URL of the YOLOv5 detection server (default: 'http://localhost:5000/detect')
- `DETECTION_INTERVAL`: Milliseconds between detections in continuous mode (default: 1000ms)

### Dependencies

This component requires:

- expo-camera
- expo-file-system

### Server Requirements

The YOLOv5 detection server should be running and accessible at the configured URL. The server should accept POST requests with a JSON body containing a base64-encoded image and respond with detection results in the expected format.

See `app/api/yolo_server.py` for the server implementation. 