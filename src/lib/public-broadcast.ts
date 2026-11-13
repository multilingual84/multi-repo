import { createPeerConnection } from './webrtc';
import { pollPublicBroadcast, signalPublicBroadcast, leavePublicBroadcast, translatePublicBroadcast } from './public-broadcast.functions';
import { applyPreferredSink } from './audio/audio-output';
import { claraSpeak } from './clara-voice';
import { encodeActiveAudio } from './audio/transient-audio';
type Peer={pc:RTCPeerConnection;dc:RTCDataChannel|null;ice:RTCIceCandidateInit[];audio:HTMLAudioElement|null;queue:Promise<void>;timer:ReturnType<typeof setTimeout>|null};
export class PublicAudioBroadcast {
 private peers=new Map<string,Peer>();private closed=false;private after=0;private timer:ReturnType<typeof setTimeout>|null=null;private polling=false;private muted=false;private blocked=false;private ctx:AudioContext|null=null;private frame=0;private recorder:MediaRecorder|null=null;private busy=false;private localLanguage='';
 constructor(private broadcast:string,private auth:{listener?:string;token?:string},private stream:MediaStream|null,private onState:(state:string,count:number)=>void,private onText:(text:string)=>void,private language:string){}
 setLocalLanguage(language:string){this.localLanguage=language;}
 private request(){return {broadcast:this.broadcast,...this.auth};}
 private connected(){return [...this.peers].filter(([,p])=>p.pc.connectionState==='connected').map(([id])=>id);}
 async start(){if(this.closed)return;this.onState('connecting',0);if(this.auth.listener)this.peer(this.auth.listener);else this.capture();await this.poll();}
 private peer(id:string){let peer=this.peers.get(id);if(peer)return peer;
 const pc=createPeerConnection();peer={pc,dc:null,ice:[],audio:null,queue:Promise.resolve(),timer:null};this.peers.set(id,peer);
 if(this.stream)this.stream.getAudioTracks().forEach(t=>pc.addTrack(t,this.stream as MediaStream));
 pc.onicecandidate=e=>{if(e.candidate)void this.send(id,{kind:'ice',candidate:e.candidate.toJSON()}).catch(()=>this.onState('failed',this.connected().length));};
 pc.onconnectionstatechange=()=>{if(this.closed)return;if(pc.connectionState==='failed'||pc.connectionState==='disconnected'){this.onState('failed',this.connected().length);}else this.onState(this.auth.listener?(pc.connectionState==='connected'?'connected':'connecting'):'transmitting',this.connected().length);};
 pc.ontrack=e=>{if(this.closed)return;const audio=new Audio();audio.srcObject=e.streams[0]??new MediaStream([e.track]);audio.muted=this.muted;applyPreferredSink(audio);peer.audio=audio;void audio.play().catch(()=>{this.blocked=true;this.onState('blocked',0);});};
 pc.ondatachannel=e=>this.bind(peer,e.channel);peer.timer=setTimeout(()=>{if(!this.closed&&pc.connectionState!=='connected')this.onState('failed',this.connected().length);},30000);
 return peer;
 }
 private bind(peer:Peer,dc:RTCDataChannel){peer.dc=dc;dc.onmessage=e=>{if(this.closed)return;try{const message=JSON.parse(e.data);if(message.kind==='say'&&typeof message.text==='string'&&message.text.length<=6000){this.onText(message.text);if(!this.muted){if(peer.audio)peer.audio.muted=true;void claraSpeak(message.text,this.language).catch(()=>{this.blocked=true;this.onState('blocked',this.connected().length);}).finally(()=>{if(peer.audio&&!this.closed)peer.audio.muted=this.muted;});}}}catch{/* ignore invalid data */}};}
 private send(target:string,payload:Record<string,unknown>){return signalPublicBroadcast({data:{...this.request(),target,payload}});}
 private async offer(id:string){const p=this.peer(id);this.bind(p,p.pc.createDataChannel('broadcast'));const offer=await p.pc.createOffer();await p.pc.setLocalDescription(offer);if(!this.closed)await this.send(id,{kind:'offer',sdp:offer});}
 private async signal(id:string,payload:Record<string,unknown>){if(this.closed)return;const p=this.peer(id);
 if(payload['kind']==='offer'&&this.auth.listener){await p.pc.setRemoteDescription(payload['sdp'] as RTCSessionDescriptionInit);for(const c of p.ice.splice(0))await p.pc.addIceCandidate(c);const answer=await p.pc.createAnswer();await p.pc.setLocalDescription(answer);await this.send(id,{kind:'answer',sdp:answer});}
 else if(payload['kind']==='answer'&&!this.auth.listener){await p.pc.setRemoteDescription(payload['sdp'] as RTCSessionDescriptionInit);for(const c of p.ice.splice(0))await p.pc.addIceCandidate(c);}
 else if(payload['kind']==='ice'){const c=payload['candidate'] as RTCIceCandidateInit;if(p.pc.remoteDescription)await p.pc.addIceCandidate(c);else if(p.ice.length<100)p.ice.push(c);}
 }
 private async poll(){if(this.closed||this.polling)return;this.polling=true;try{
 const r=await pollPublicBroadcast({data:{...this.request(),after:this.after,...(!this.auth.listener?{connected:this.connected()}:{})}});if(this.closed)return;
 if(!this.auth.listener){const ids=r.listeners.map(l=>l.id);for(const l of r.listeners)this.listenerLanguages.set(l.id,l.language);for(const [id] of this.peers)if(!ids.includes(id))this.closePeer(id);for(const l of r.listeners)if(!this.peers.has(l.id))void this.offer(l.id).catch(()=>this.onState('failed',this.connected().length));this.onState('transmitting',r.count);}else if(this.connected().length)this.onState(this.blocked?'blocked':'connected',r.count);
 for(const s of r.signals){this.after=Math.max(this.after,s.id);const p=this.peer(s.listener_id);p.queue=p.queue.then(()=>this.signal(s.listener_id,s.payload as Record<string,unknown>)).catch(()=>this.onState('failed',this.connected().length));}
 }catch{if(!this.closed){this.stop();this.onState('failed',0);}}finally{this.polling=false;if(!this.closed)this.timer=setTimeout(()=>void this.poll(),2000);}}
 mute(value:boolean){this.muted=value;for(const p of this.peers.values())if(p.audio)p.audio.muted=value;if(value&&typeof speechSynthesis!=='undefined')speechSynthesis.cancel();}
 async resume(){for(const p of this.peers.values())if(p.audio)await p.audio.play();await this.ctx?.resume();this.blocked=false;}
 private capture(){if(!this.stream)return;this.ctx=new AudioContext();const source=this.ctx.createMediaStreamSource(this.stream);const analyser=this.ctx.createAnalyser();analyser.fftSize=1024;source.connect(analyser);const samples=new Float32Array(analyser.fftSize);let speaking=false,last=0,start=0;
 const tick=()=>{if(this.closed)return;analyser.getFloatTimeDomainData(samples);let sum=0;for(const v of samples)sum+=v*v;const now=performance.now();if(Math.sqrt(sum/samples.length)>.025&&!this.busy&&!(typeof speechSynthesis!=='undefined'&&speechSynthesis.speaking)){last=now;if(!speaking){speaking=true;start=now;this.record();}}if(speaking&&(now-last>500||now-start>12000)){speaking=false;if(this.recorder?.state==='recording')this.recorder.stop();}this.frame=requestAnimationFrame(tick);};tick();
 }
 private record(){if(!this.stream||this.busy)return;const mime=['audio/webm;codecs=opus','audio/mp4'].find(x=>MediaRecorder.isTypeSupported(x));const rec=new MediaRecorder(new MediaStream(this.stream.getAudioTracks()),{...(mime?{mimeType:mime}:{}),audioBitsPerSecond:16000});this.recorder=rec;const chunks:Blob[]=[];rec.ondataavailable=e=>{if(!this.closed&&e.data.size)chunks.push(e.data);};rec.onstop=()=>{if(!this.closed&&chunks.length)void this.phrase(new Blob(chunks,{type:rec.mimeType}));chunks.length=0;};rec.start();}
 private async phrase(blob:Blob){if(this.closed||this.busy||(!this.localLanguage&&!this.connected().length))return;this.busy=true;try{const audio=await encodeActiveAudio(blob,()=>!this.closed);if(!audio||this.closed)return;const r=await translatePublicBroadcast({data:{...this.request(),audio,mime:blob.type,localLanguage:this.localLanguage||undefined}});if(this.closed)return;this.onText(r.heard);for(const [id,p] of this.peers){if(p.dc?.readyState!=='open')continue;const language=this.listenerLanguages.get(id)??this.language;const text=r.translations[language];if(text)p.dc.send(JSON.stringify({kind:'say',text}));}const localText=r.translations[this.localLanguage];if(this.localLanguage&&localText)claraSpeak(localText,this.localLanguage);
 }catch{if(!this.closed)this.onState('speechFailed',this.connected().length);}finally{this.busy=false;}}
 private listenerLanguages=new Map<string,string>();
 private closePeer(id:string){const p=this.peers.get(id);if(!p)return;if(p.timer)clearTimeout(p.timer);p.pc.onconnectionstatechange=null;p.pc.onicecandidate=null;p.pc.ontrack=null;p.dc?.close();p.pc.close();if(p.audio){p.audio.pause();p.audio.srcObject=null;}this.peers.delete(id);}
 stop(notify=true){if(this.closed)return;if(notify)void leavePublicBroadcast({data:this.request()}).catch(()=>{});this.closed=true;if(this.timer)clearTimeout(this.timer);cancelAnimationFrame(this.frame);if(this.recorder){this.recorder.onstop=null;this.recorder.ondataavailable=null;if(this.recorder.state==='recording')this.recorder.stop();}void this.ctx?.close();this.stream?.getTracks().forEach(t=>t.stop());for(const [id] of this.peers)this.closePeer(id);if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();}
}
