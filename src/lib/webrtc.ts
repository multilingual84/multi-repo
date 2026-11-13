// Browser-only WebRTC peer-to-peer helpers using Google's free public STUN servers.

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: ICE_SERVERS });
}

/** Create a data channel + offer. The offer SDP must be delivered to the peer by a signaling step. */
export async function createDataChannelOffer(label = "ml-room") {
  const pc = createPeerConnection();
  const channel = pc.createDataChannel(label);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return { pc, channel, offer };
}

export async function acceptOffer(offer: RTCSessionDescriptionInit) {
  const pc = createPeerConnection();
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return { pc, answer };
}
