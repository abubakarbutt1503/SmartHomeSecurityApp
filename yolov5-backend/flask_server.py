#!/usr/bin/env python3
"""
Flask server for YOLO video stream
This server provides a web interface for the video stream that can be accessed by the React Native app
"""

from flask import Flask, Response, render_template_string, jsonify
from flask_cors import CORS
from videostream import YOLOVideoStream
import cv2
import threading
import time
import logging
import numpy as np # Added missing import for placeholder image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Global variables
stream = None
stream_thread = None
is_streaming = False

# HTML template for the video stream page
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>YOLO Video Stream</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #000;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            text-align: center;
            color: white;
        }
        .video-container {
            margin: 20px 0;
            border: 2px solid #333;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .controls {
            margin: 20px 0;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        }
        button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background-color: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        .status {
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
            font-weight: bold;
        }
        .status.running {
            background-color: #28a745;
        }
        .status.stopped {
            background-color: #dc3545;
        }
        .info {
            background-color: #17a2b8;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            max-width: 600px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>YOLO Video Stream</h1>
        
        <div class="status" id="status">
            Status: Stopped
        </div>
        
        <div class="controls">
            <button onclick="startStream()" id="startBtn">Start Stream</button>
            <button onclick="stopStream()" id="stopBtn" disabled>Stop Stream</button>
            <button onclick="refreshPage()">Refresh Page</button>
        </div>
        
        <div class="video-container">
            <img id="videoFeed" src="" alt="Video Stream" style="max-width: 100%; height: auto;">
        </div>
        
        <div class="info">
            <h3>Stream Information:</h3>
            <p><strong>Source:</strong> Webcam (0)</p>
            <p><strong>Model:</strong> YOLOv5s</p>
            <p><strong>Detection:</strong> Real-time object detection</p>
            <p><strong>Access URL:</strong> <code>/video_feed</code></p>
        </div>
    </div>

    <script>
        let streamInterval;
        
        function startStream() {
            fetch('/start_stream')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('status').textContent = 'Status: Running';
                        document.getElementById('status').className = 'status running';
                        document.getElementById('startBtn').disabled = true;
                        document.getElementById('stopBtn').disabled = false;
                        
                        // Start updating the video feed
                        document.getElementById('videoFeed').src = '/video_feed?' + new Date().getTime();
                        
                        // Update status every 5 seconds
                        streamInterval = setInterval(updateStatus, 5000);
                    } else {
                        alert('Failed to start stream: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error starting stream');
                });
        }
        
        function stopStream() {
            fetch('/stop_stream')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('status').textContent = 'Status: Stopped';
                        document.getElementById('status').className = 'status stopped';
                        document.getElementById('startBtn').disabled = false;
                        document.getElementById('stopBtn').disabled = true;
                        
                        // Stop updating the video feed
                        document.getElementById('videoFeed').src = '';
                        
                        // Clear interval
                        if (streamInterval) {
                            clearInterval(streamInterval);
                        }
                    } else {
                        alert('Failed to stop stream: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error stopping stream');
                });
        }
        
        function updateStatus() {
            fetch('/status')
                .then(response => response.json())
                .then(data => {
                    if (!data.is_streaming) {
                        // Stream stopped unexpectedly
                        document.getElementById('status').textContent = 'Status: Stopped (Unexpected)';
                        document.getElementById('status').className = 'status stopped';
                        document.getElementById('startBtn').disabled = false;
                        document.getElementById('stopBtn').disabled = true;
                        document.getElementById('videoFeed').src = '';
                        
                        if (streamInterval) {
                            clearInterval(streamInterval);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error updating status:', error);
                });
        }
        
        function refreshPage() {
            location.reload();
        }
        
        // Check initial status
        window.onload = function() {
            fetch('/status')
                .then(response => response.json())
                .then(data => {
                    if (data.is_streaming) {
                        document.getElementById('status').textContent = 'Status: Running';
                        document.getElementById('status').className = 'status running';
                        document.getElementById('startBtn').disabled = true;
                        document.getElementById('stopBtn').disabled = false;
                        document.getElementById('videoFeed').src = '/video_feed?' + new Date().getTime();
                        streamInterval = setInterval(updateStatus, 5000);
                    }
                })
                .catch(error => {
                    console.error('Error checking status:', error);
                });
        };
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Main page with video stream controls"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/video_feed')
def video_feed():
    """Video stream endpoint that returns MJPEG stream"""
    def generate():
        global stream, is_streaming
        
        if not stream or not is_streaming:
            # Return a placeholder image if stream is not running
            placeholder = cv2.imread('placeholder.jpg') if cv2.os.path.exists('placeholder.jpg') else None
            if placeholder is None:
                # Create a simple placeholder
                placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(placeholder, 'Stream Not Running', (50, 240), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            ret, buffer = cv2.imencode('.jpg', placeholder)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            return
        
        while is_streaming:
            try:
                frame = stream.get_current_frame()
                if frame is not None:
                    ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                else:
                    # If no frame available, wait a bit
                    time.sleep(0.1)
            except Exception as e:
                logger.error(f"Error generating video feed: {e}")
                break
        
        # Stream ended
        is_streaming = False
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_stream')
def start_stream():
    """Start the video stream"""
    global stream, stream_thread, is_streaming
    
    try:
        if is_streaming:
            return jsonify({'success': False, 'message': 'Stream already running'})
        
        # Initialize stream
        stream = YOLOVideoStream(model_path='yolov5/yolov5s.pt', device='cpu')
        
        # Start stream in a separate thread
        def run_stream():
            global is_streaming
            try:
                stream.start_stream('0')  # Start with webcam
                is_streaming = True
                logger.info("Stream started successfully")
            except Exception as e:
                logger.error(f"Error starting stream: {e}")
                is_streaming = False
        
        stream_thread = threading.Thread(target=run_stream, daemon=True)
        stream_thread.start()
        
        # Wait a bit for stream to initialize
        time.sleep(2)
        
        if is_streaming:
            return jsonify({'success': True, 'message': 'Stream started successfully'})
        else:
            return jsonify({'success': False, 'message': 'Failed to start stream'})
            
    except Exception as e:
        logger.error(f"Error starting stream: {e}")
        return jsonify({'success': False, 'message': str(e)})

@app.route('/stop_stream')
def stop_stream():
    """Stop the video stream"""
    global stream, is_streaming
    
    try:
        if stream:
            stream.stop_stream()
            is_streaming = False
            logger.info("Stream stopped successfully")
            return jsonify({'success': True, 'message': 'Stream stopped successfully'})
        else:
            return jsonify({'success': False, 'message': 'No stream to stop'})
    except Exception as e:
        logger.error(f"Error stopping stream: {e}")
        return jsonify({'success': False, 'message': str(e)})

@app.route('/status')
def get_status():
    """Get current stream status"""
    global is_streaming
    return jsonify({
        'is_streaming': is_streaming,
        'timestamp': time.time()
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': time.time()})

if __name__ == '__main__':
    logger.info("Starting YOLO Video Stream Flask Server...")
    logger.info("Access the web interface at: http://localhost:5000")
    logger.info("Video stream endpoint: http://localhost:5000/video_feed")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
