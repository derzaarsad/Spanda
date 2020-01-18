# Spanda App

Go to ~/Android/Sdk/emulator

```bash
sudo ./emulator -avd Nexus_5X_API_28_x86
```

After the emulator is on, go to SpandaApp folder

```bash
tns build android --env.environmentJson="{\"stage\":\"prototype\",\"backendUrl\":\"$(BackendEndpoint)\"}"
```