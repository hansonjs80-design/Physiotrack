// 알람, 진동, 시스템 알림 관련 로직 분리
export const playAlarmPattern = async (bedId?: number, treatmentName?: string, isSilent: boolean = false) => {
  // 1. Vibration (Browser API - Android/Desktop)
  // Only play if NOT silent
  if (!isSilent) {
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (isMobile) {
        // Mobile: Strong pattern (Total ~5 seconds)
        // 울림(1s) - 쉼(0.5s) - 울림(1s) - 쉼(0.5s) - 울림(1s) - 쉼(0.5s) - 울림(0.5s)
        navigator.vibrate([1000, 500, 1000, 500, 1000, 500, 500]);
      } else {
        // Desktop: Subtler vibration
        navigator.vibrate([200, 100, 200]);
      }
    }
  }

  // 2. Audio (Web Audio API - "Digital Alarm Style")
  // Only play if NOT silent
  if (!isSilent) {
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
  }

  // 3. System Notification (Native Sound/Vibration - iOS & Android PWA)
  // Always trigger notification for the "Next Step" action, but control vibration/sound via options
  if ('Notification' in window && Notification.permission === 'granted') {
    const bedLabel = bedId === 11 ? '견인치료' : `${bedId}번`;
    const stepLabel = treatmentName ? ` ${treatmentName}` : '';
    
    const title = bedId ? `${bedLabel}${stepLabel} 종료` : 'PhysioTrack 알림 테스트';
    const body = bedId ? '치료 시간이 종료되었습니다. 다음 단계로 진행하세요.' : '네이티브 알림(소리/진동) 테스트입니다.';
    
    const vibratePattern = isSilent ? [] : [1000, 500, 1000, 500, 1000, 500, 500];

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
            vibrate: vibratePattern,
            silent: isSilent, // Supported in some browsers/OS to suppress system sound
            tag: bedId ? `bed-${bedId}` : 'test-alarm',
            renotify: true, 
            requireInteraction: true,
            data: { bedId },
            actions: bedId ? [
              { action: 'next-step', title: '다음 치료 진행' }
            ] : []
          } as any);
          return;
        }
      }
      
      // Fallback
      new Notification(title, {
        body: body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
        silent: isSilent,
        // @ts-ignore
        vibrate: vibratePattern
      });
    } catch (e) {
      console.error("Notification failed", e);
    }
  }
};