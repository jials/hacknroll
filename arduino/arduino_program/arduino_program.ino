void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}

void loop() {
  // write data to serial for now because WiFi shield is not available
  Serial.println("Hello, world!");
  delay(3000);
}
