int washers_pin_num[4] = {2, 3, 4, 5};
int washers_pin_val[4] = {-1, -1, -1, -1};
String washers_pin_str[4] = {"UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"};

int FREE = 0, BUSY = 1;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  
  for (int i = 0; i < 4; i++) {
    pinMode(washers_pin_num[i], INPUT);
  }
}

void loop() {
  // write data to serial for now because WiFi shield is not available
  for (int i = 0; i < 4; i++) {
    washers_pin_val[i] = digitalRead(washers_pin_num[i]);
    if (washers_pin_val[i] == FREE) {
      washers_pin_str[i] = "FREE";
    } else if (washers_pin_val[i] == BUSY) {
      washers_pin_str[i] = "BUSY";
    }
  }
  
  Serial.print("Location: PGP R4\nWashers_state: [");
  for (int i = 0; i < 4; i++) {
    if (i > 0) {
      Serial.print(",");
    }
    Serial.print("\"" + washers_pin_str[i] + "\"");
  }
  Serial.print("]\n");
}
