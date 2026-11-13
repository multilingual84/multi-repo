export function phoneMicrophoneId(devices:MediaDeviceInfo[]){return devices.find(d=>d.kind==='audioinput'&&/built.?in|internal|phone microphone/i.test(d.label))?.deviceId??'';}
