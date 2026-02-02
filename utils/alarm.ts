// 알람, 진동, 시스템 알림 관련 로직 분리
export const playAlarmPattern = async (bedId?: number) => {
  // 1. Vibration (Browser API - Android/Desktop)
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    if (isMobile) {
      // Mobile: Strong pattern
      navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500]);
    } else {
      // Desktop: Subtler vibration
      navigator.vibrate([200, 100, 200]);
    }
  }

  // 2. Audio (Web Audio API - "Digital Alarm Style")
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square'; 
      osc.frequency.setValueAtTime(1050, now); 

      const beepLength = 0.1;
      const gapLength = 0.1;
      const pauseLength = 0.5;
      
      let startTime = now;
      for (let group = 0; group < 3; group++) {
        for (let i = 0; i < 3; i++) {
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.setValueAtTime(0, startTime + beepLength);
          startTime += beepLength + gapLength;
        }
        startTime += pauseLength;
      }

      osc.start(now);
      osc.stop(startTime);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }

  // 3. System Notification (Native Sound/Vibration - iOS & Android PWA)
  if ('Notification' in window && Notification.permission === 'granted') {
    const title = bedId ? `${bedId === 11 ? '견인치료' : bedId + '번 배드'} 치료 종료` : 'PhysioTrack 알림 테스트';
    const body = bedId ? '치료 시간이 종료되었습니다.' : '네이티브 알림(소리/진동) 테스트입니다.';
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
            vibrate: [500, 200, 500],
            tag: 'physio-timer',
            renotify: true,
            requireInteraction: true
          } as any);
          return;
        }
      }
      
      new Notification(title, {
        body: body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png'
      });
    } catch (e) {
      console.error("Notification failed", e);
    }
  }
};