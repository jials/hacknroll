"""
A module to fetch data from arduino through the serial and send it to the API endpoint (since WiFi module is
not available.) Once the WiFi module is available, the arduino will directly send the data to the API endpoint instead

Self-created protocol
---------------------------
Location: PGP R4
Number_of_washers_free: 2
Number_of_washers_occupied: 2
Occupied_washers_estimated_time_left: [12, 1]
Number_of_dryers_occupied: 2
Number_of_dryers_occupied: 2
Occupied_washers_estimated_time_left: [30, 23]



"""
import serial

device_path = '/dev/ttyACM1'
ser = serial.Serial(device_path, 9600)


class Parser(object):
	@staticmethod
	def parse(data):
		"""Return a dict of parsed data. Parsing is done according to the protocol described above"""
		result = {}
		data_array = data.split('\n')
		for datum in data_array:
			key, value = datum.split(': ')
			result[key] = value
		return result

while True:
	raw_data = ser.readline()
	data = raw_data.decode('utf-8')
	parsed_data = Parser.parse(data)
	# TODO: post data to API endpoint instead
	print(str(parsed_data))
