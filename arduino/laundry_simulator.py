import random
import time

from pymata_aio.pymata3 import PyMata3
from pyfirmata import Arduino, util

NUM_WASHERS = 4

MACHINE_TIME_TAKEN = 45  # minutes
MACHINE_STATE = {
	# Uses digital value instead of analog since it's just a simulation
	'AVAILABLE': {'code': 0, 'digital_value': 0},
	'BUSY': {'code': 1, 'digital_value': 1}
}
WASHER_TO_PIN = [2, 3, 4, 5]

rnd = random.Random()

# board = Arduino('/dev/ttyACM1')
board = PyMata3()

board.digital_pin_write(2, 1)
board.digital_pin_write(3, 0)
board.digital_pin_write(4, 1)
board.digital_pin_write(5, 1)

# wait for 3 seconds to see the LED lit
board.sleep(60)

# reset the board and exit
board.shutdown()

class WashersSimulator(object):
	def __init__(self):
		self.init_simulator()

	def init_simulator(self):
		"""Initialize the laundry room's washers state"""
		num_available = rnd.randint(0, NUM_WASHERS/2)
		washers_done_at = [0] * num_available
		now = time.time()
		for _ in range(NUM_WASHERS - num_available):
			time_left = rnd.randint(1, MACHINE_TIME_TAKEN)
			washers_done_at.append(now + (time_left * 60))
		rnd.shuffle(washers_done_at)
		self.washers_done_at = washers_done_at

	def check_if_all_free(self):
		num_done = 0
		for washer_done_at in self.washers_done_at:
			if washer_done_at < time.time():
				num_done += 1
		return num_done == NUM_WASHERS

	def simulator_loop(self):
		while True:
			if self.check_if_all_free():
				# re-init
				self.init_simulator()
			else:
				for i in range(NUM_WASHERS):
					if self.washers_done_at[i] > time.time():
						val = 0
					else:
						val = 1
					pin_num = WASHER_TO_PIN[i]
					board.digital[pin_num].write(val)

washers_simulator = WashersSimulator()
washers_simulator.simulator_loop()
#
# while True:
# 	board.digital[2].write(1)
# 	board.digital[3].write(0)
# 	board.digital[4].write(1)
# 	board.digital[5].write(1)
