const PRIVATE_IPV4 =
  /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|127\.|0\.0\.0\.0)/;

function isPrivate(ip: string): boolean {
  if (PRIVATE_IPV4.test(ip)) return true;
  if (ip.startsWith('fe80:') || ip.startsWith('fd') || ip.startsWith('fc')) return true;
  return false;
}

export async function detectLocalIps(timeoutMs = 2500): Promise<string[]> {
  if (typeof RTCPeerConnection === 'undefined') return [];
  return new Promise((resolve) => {
    const ips = new Set<string>();
    let pc: RTCPeerConnection | null = null;
    try {
      pc = new RTCPeerConnection({ iceServers: [] });
    } catch {
      resolve([]);
      return;
    }

    const finish = () => {
      try {
        pc?.close();
      } catch {
        /* noop */
      }
      resolve([...ips]);
    };

    const timer = setTimeout(finish, timeoutMs);

    pc.createDataChannel('probe');
    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        clearTimeout(timer);
        finish();
        return;
      }
      const candidate = event.candidate.candidate;
      // candidate:foundation 1 udp prio ip port typ host ...
      const parts = candidate.split(' ');
      const ip = parts[4];
      if (ip && isPrivate(ip)) {
        ips.add(ip);
      }
    };

    pc.createOffer()
      .then((offer) => pc?.setLocalDescription(offer))
      .catch(() => {
        clearTimeout(timer);
        finish();
      });
  });
}
