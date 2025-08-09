#!/usr/bin/env python3
"""
Test script for YOLO Video Stream
Demonstrates different usage patterns and configurations
"""

import time
import cv2
from videostream import YOLOVideoStream

def test_webcam_stream():
    """Test webcam streaming with YOLO detection"""
    print("Testing webcam stream...")
    
    # Initialize stream
    stream = YOLOVideoStream(device='cpu')
    
    try:
        # Start webcam stream
        stream.start_stream('0')  # Use default webcam
        
        # Wait for stream to initialize
        time.sleep(2)
        
        print("Stream started. Press 'q' to quit...")
        
        while True:
            # Get current frame
            frame = stream.get_current_frame()
            if frame is not None:
                # Display frame
                cv2.imshow('Webcam Test', frame)
                
                # Get detection results
                detections = stream.get_detection_results()
                if detections:
                    print(f"Detected: {[d['class_name'] for d in detections]}")
                
                # Check for quit key
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            else:
                print("No frame available")
                time.sleep(0.1)
                
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        stream.stop_stream()
        cv2.destroyAllWindows()

def test_video_file(video_path: str):
    """Test video file processing with YOLO detection"""
    print(f"Testing video file: {video_path}")
    
    # Initialize stream
    stream = YOLOVideoStream(device='cpu')
    
    try:
        # Start video file stream
        stream.start_stream(video_path)
        
        print("Processing video. Press 'q' to quit...")
        
        while True:
            frame = stream.get_current_frame()
            if frame is not None:
                cv2.imshow('Video File Test', frame)
                
                detections = stream.get_detection_results()
                if detections:
                    print(f"Detected: {[d['class_name'] for d in detections]}")
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            else:
                print("Video ended or no frame available")
                break
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        stream.stop_stream()
        cv2.destroyAllWindows()

def test_rtsp_stream(rtsp_url: str):
    """Test RTSP stream with YOLO detection"""
    print(f"Testing RTSP stream: {rtsp_url}")
    
    # Initialize stream
    stream = YOLOVideoStream(device='cpu')
    
    try:
        # Start RTSP stream
        stream.start_stream(rtsp_url)
        
        print("RTSP stream started. Press 'q' to quit...")
        
        while True:
            frame = stream.get_current_frame()
            if frame is not None:
                cv2.imshow('RTSP Test', frame)
                
                detections = stream.get_detection_results()
                if detections:
                    print(f"Detected: {[d['class_name'] for d in detections]}")
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            else:
                print("No frame from RTSP stream")
                time.sleep(0.1)
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        stream.stop_stream()
        cv2.destroyAllWindows()

def test_performance():
    """Test performance with different FPS settings"""
    print("Testing performance with different FPS settings...")
    
    fps_settings = [15, 30, 60]
    
    for fps in fps_settings:
        print(f"\nTesting with {fps} FPS...")
        
        stream = YOLOVideoStream(device='cpu')
        stream.set_fps(fps)
        
        try:
            stream.start_stream('0')
            time.sleep(3)  # Run for 3 seconds
            
            frame_count = 0
            start_time = time.time()
            
            while time.time() - start_time < 3:
                frame = stream.get_current_frame()
                if frame is not None:
                    frame_count += 1
                time.sleep(0.01)
            
            actual_fps = frame_count / 3
            print(f"Target FPS: {fps}, Actual FPS: {actual_fps:.1f}")
            
        except Exception as e:
            print(f"Error at {fps} FPS: {e}")
        finally:
            stream.stop_stream()
        
        time.sleep(1)  # Brief pause between tests

def main():
    """Main test function"""
    print("YOLO Video Stream Test Suite")
    print("=" * 40)
    
    while True:
        print("\nSelect test:")
        print("1. Webcam stream test")
        print("2. Video file test")
        print("3. RTSP stream test")
        print("4. Performance test")
        print("5. Exit")
        
        choice = input("Enter choice (1-5): ").strip()
        
        if choice == '1':
            test_webcam_stream()
        elif choice == '2':
            video_path = input("Enter video file path: ").strip()
            if video_path:
                test_video_file(video_path)
            else:
                print("Invalid path")
        elif choice == '3':
            rtsp_url = input("Enter RTSP URL: ").strip()
            if rtsp_url:
                test_rtsp_stream(rtsp_url)
            else:
                print("Invalid URL")
        elif choice == '4':
            test_performance()
        elif choice == '5':
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
