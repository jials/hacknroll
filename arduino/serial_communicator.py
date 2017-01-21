import serial

device_path = '/dev/ttyACM0'
ser = serial.Serial(device_path, 9600)

while True:
	print(ser.readline())
