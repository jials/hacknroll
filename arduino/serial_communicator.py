"""
A module to fetch data from arduino through the serial and send it to the API endpoint (since WiFi module is
not available.) Once the WiFi module is available, the arduino will directly send the data to the API endpoint instead

Self-created protocol
---------------------------
Location: PGP R4; Washers_state: 0, 1, 0, 0 (where FREE == 0, BUSY == 1)


"""
import serial
import time
import requests

device_path = '/dev/ttyACM0'
ser = serial.Serial(device_path, 9600)


class Parser(object):
	@staticmethod
	def parse(data):
		"""Return a dict of parsed data. Parsing is done according to the protocol described above"""
		result = {}
		data_array = data.strip().split('; ')
		for datum in data_array:
			key, value = datum.split(': ')
			key = key.lower()
			if key == 'washer_states':
				result[key] = [int(x) for x in value.split(', ')]
			else:
				result[key] = value
		return result

while True:
	prev_washer_states, curr_washer_states = [None] * 2
	ser.write(b'b')  # write any 1-letter to ask arduino to send data
	raw_data = ser.readline()
	data = raw_data.decode('utf-8')
	parsed_data = Parser.parse(data)

	curr_washer_states = parsed_data['washer_states']

	if curr_washer_states != prev_washer_states:
		washers_time_started = []
		for i in range(4):
			if prev_washer_states is None or curr_washer_states[i] != prev_washer_states[i]:
				if curr_washer_states[i] == 0:
					washers_time_started.append(0)
				else:
					washers_time_started.append(time.time())
		prev_washer_states = curr_washer_states

	print(str(parsed_data))

	location, sublocation = parsed_data['location'].split(' ')

	data, subdata = {}, {}
	subdata[sublocation] = {
		'washers': washers_time_started,
		'dryers': washers_time_started
	}
	data[location] = subdata

	resp = requests.post('http://localhost:3000/data', data)
	resp.raise_for_status()  # check if request is successful
	time.sleep(10)
