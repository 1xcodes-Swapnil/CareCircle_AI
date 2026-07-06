# Demo Event Payloads

Use these templates to structure simulation inputs in your Developer Dashboard or Emulator views.

## 1. Heart Rate Spike Scenario
```json
{
  "scenarioId": "heart-rate-spike",
  "eventName": "Smartwatch BPM Anomaly",
  "payload": {
    "familyMemberId": "eleanor-vance",
    "timestamp": "2026-07-02T07:23:28Z",
    "sensorData": {
      "heartRate": 138,
      "steps": 2500,
      "systolic": 140,
      "diastolic": 90
    },
    "triggerType": "AUTOMATIC_TELEMETRY"
  }
}
```

## 2. Fall Detected Scenario
```json
{
  "scenarioId": "fall-detected",
  "eventName": "Smartwatch Fall Impact",
  "payload": {
    "familyMemberId": "eleanor-vance",
    "timestamp": "2026-07-02T07:23:28Z",
    "sensorData": {
      "gForce": 4.2,
      "posture": "LYING_DOWN",
      "heartRate": 92
    },
    "triggerType": "CRITICAL_SENSORY_TRIGGER"
  }
}
```

## 3. OCR Document Upload Scenario
```json
{
  "scenarioId": "prescription-upload",
  "eventName": "OCR Image Parse",
  "payload": {
    "imageUrl": "https://storage.googleapis.com/carecircle/rx-samples/lisinopril_10mg.png",
    "uploadedBy": "Emma Vance",
    "simulatedOcrText": "Lisinopril 10mg. Take 1 tablet daily in the morning with food. Refills left: 3. Dr. Franklin."
  }
}
```
