# YOLOv5 Human Detection for Home Safety App

This integration connects YOLOv5 object detection with the Home Safety App's camera system to detect humans in real-time video feeds.

## Features

- Real-time human detection using YOLOv5
- Live camera feed with bounding boxes around detected people
- API server to process images and return detection results
- Seamless integration with the existing camera interface

## Setup Instructions

### 1. Install Dependencies

First, make sure you have installed all the required Python packages:

```bash
# Navigate to the yolov5 directory
cd yolov5

# Install YOLOv5 requirements
pip install -r requirements.txt

# Install additional requirements for the API server
pip install flask
```

### 2. Start the Detection Server

Start the Flask server that will process images and run YOLOv5 detection:

```bash
# Navigate to the app directory
cd HomeSafetyApp/app/api

# Start the server
python yolo_server.py
```

The server will run on port 5000 by default. You should see output indicating that the model has been successfully loaded.

### 3. Update React Native App

Make sure to install the required React Native packages:

```bash
npm install expo-camera
npm install expo-file-system
```

### 4. Launch the App

Start the React Native app normally. The YOLOv5 detection feature can be accessed from any camera feed by tapping on the video placeholder.

## How It Works

1. The React Native app captures images from the device camera
2. Images are sent to the Flask server as base64-encoded data
3. The server processes the images using YOLOv5, detecting only humans (class 0)
4. Detection results (bounding boxes, confidence scores) are returned to the app
5. The app displays the bounding boxes overlaid on the camera feed

## Troubleshooting

- **Server Connection Errors**: Ensure the Flask server is running and the `DETECTION_SERVER_URL` in `YoloCamera.tsx` is set correctly
- **Model Loading Errors**: Verify that the path to the YOLOv5 model is correct in `yolo_server.py`
- **Camera Permission Issues**: The app requires camera permissions which should be granted when prompted

## Configuration

You can adjust the following settings:

- **Detection Frequency**: Modify the interval in `toggleLiveDetection()` in `YoloCamera.tsx` (default: 1000ms)
- **Confidence Threshold**: Change the threshold in `yolo_server.py` (default: 0.25)
- **Detection Classes**: By default, only humans (class 0) are detected; modify the `classes` parameter in `non_max_suppression()` 