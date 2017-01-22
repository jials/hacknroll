//int washers_pin_num[4] = {2, 3, 4, 5};
//int washers_pin_val[4] = {-1, -1, -1, -1};
//String washers_pin_str[4] = {"UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"};
//
//int FREE = 0, BUSY = 1;
//int MAX_COUNTER = 3;

int washer_states[4] = {-1, -1, -1, -1};
//int counter = 0;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  randomSeed(analogRead(0));
//  for (int i = 0; i < 4; i++) {
//    pinMode(washers_pin_num[i], INPUT);
//  }
}

void init_washers() {
  for (int i = 0; i < 4; i++) {
    washer_states[i] = random(2);
  }
}

void loop() {
  // write data to serial for now because WiFi shield is not available
  if (Serial.available() > 0) {
    init_washers();
    
    char data[65];
    Serial.readBytes(data, Serial.available());
    
    delay(1000); // so that readline from python is executed first
    
    Serial.print("Location: pgp r4; Washer_states: ");
    for (int i = 0; i < 4; i++) {
      if (i > 0) {
        Serial.print(", ");
      }
      Serial.print(washer_states[i]);
    }
    Serial.print("\n");
    
//    counter++;
//    if (counter % MAX_COUNTER == 0) {
//      init_washers();
//    }
  }
//  for (int i = 0; i < 4; i++) {
//    washers_pin_val[i] = digitalRead(washers_pin_num[i]);
//    if (washers_pin_val[i] == FREE) {
//      washers_pin_str[i] = "FREE";
//    } else if (washers_pin_val[i] == BUSY) {
//      washers_pin_str[i] = "BUSY";
//    }
//  }
//  
//  Serial.print("Location: PGP R4\nWashers_state: [");
//  for (int i = 0; i < 4; i++) {
//    if (i > 0) {
//      Serial.print(",");
//    }
//    Serial.print("\"" + washers_pin_str[i] + "\"");
//  }
//  Serial.print("]\n");
}
